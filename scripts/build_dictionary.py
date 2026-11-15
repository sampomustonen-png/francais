"""Rakentaa ranska–englanti-sanakirjan kansioon data/.

Lähteet (ladataan kerran, eivät ole repossa):
  * wiktionary-fr-en.tsv  Englanninkielisen Wikisanakirjan ranskan sanat (Vuizur/Wiktionary-Dictionaries, CC BY-SA)
  * lexique-dicollecte-fr-v6.4.1.txt  Grammalecten taivutusmuotolista (MPL 2.0): perusmuoto, sanaluokka, suku, yleisyys
  * wordfreq (pip): sanojen yleisyys

Käyttö:
  python scripts/build_dictionary.py wiktionary-fr-en.tsv lexique-dicollecte-fr-v6.4.1.txt data

Tulos:
  data/fr-en.json.gz      perusmuoto -> {"p": sanaluokka, "s": [[[englanniksi], "huomautus"], ...]}
  data/fr-formes.tsv.gz   taivutusmuoto <TAB> perusmuoto|perusmuoto  (todennäköisin ensin)
  data/fr-grammaire.tsv.gz taivutusmuoto <TAB> perusmuoto=tagit|perusmuoto=tagit  (aikamuoto, persoona, suku, luku)
  data/fr-frequence.tsv.gz sana <TAB> zipf*10
"""
from __future__ import annotations

import math

import collections
import gzip
import html
import json
import re
import sys
from pathlib import Path

from wordfreq import top_n_list, zipf_frequency

POS_LABEL = {
    "noun": "nom", "verb": "verbe", "adj": "adj.", "adv": "adv.", "prep": "prép.", "conj": "conj.",
    "pron": "pron.", "article": "art.", "det": "dét.", "intj": "interj.", "num": "num.",
    "phrase": "locution", "prep_phrase": "loc. prép.", "name": "nom propre", "abbrev": "abrév.",
    "particle": "particule", "contraction": "contraction", "proverb": "proverbe",
}
# Wikisanakirjan sanaluokka -> Dicollecten karkea luokka (yleisyyden mukaan järjestämistä varten)
COARSE = {
    "noun": "nom", "verb": "v", "adj": "adj", "adv": "adv", "name": "npr",
    "prep": "mg", "conj": "mg", "pron": "mg", "article": "mg", "det": "mg", "intj": "mg", "num": "mg",
    "particle": "mg", "contraction": "mg", "prep_phrase": "mg", "phrase": "loc", "proverb": "loc",
}
POS_RANK = {"mg": 0, "adv": 1, "v": 2, "adj": 3, "nom": 4, "loc": 5, "npr": 6}
SKIP_POS = {"character", "symbol", "punct", "suffix", "prefix", "infix", "postp", "proverb"}
FORM_OF = re.compile(
    r"\b(plural|singular|feminine|masculine|participle|inflection|conjugation|spelling|indicative|subjunctive|"
    r"imperative|apocopic|elided|contraction|alternative|obsolete|eye dialect|misspelling|nonstandard) "
    r"(form )?of\b",
    re.I,
)
LOW_PRIORITY = re.compile(
    r"\b(obsolete|archaic|dated|rare|historical|Louisiana|Quebec|Belgium|Switzerland|Canada|Africa|heraldry|"
    r"nautical|botany|zoology|chemistry|mathematics|anatomy|biology|medicine|physics|geometry|computing|"
    r"military slang|Internet slang|text messaging|vulgar|derogatory|offensive|euphemistic|Verlan|"
    r"regional|dialectal|Provence|Lyon|Normandy|Brittany|Old French)\b",
    re.I,
)
JUNK_SENSE = re.compile(
    r"^(Used other than figuratively|Only used in|Used in the phrase|See also|general senses?|"
    r"[a-z ]*senses?$|.*\bi\.e\. \d)", re.I)
MAX_SENSES = 4
MIN_ZIPF = 1.9          # harvinaisempia sanoja ei oteta mukaan (koko pysyy pienenä)
FREQ_LIMIT = 80000


def clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def split_sense(raw: str) -> tuple[str, str, bool]:
    """'(transitive, informal) to take [+ à]' -> ('to take', 'transitive, informal', low_priority)"""
    text = clean(raw)
    quals = []
    while True:
        m = re.match(r"^\(([^()]{1,70})\)\s*(.*)$", text)
        if not m:
            break
        quals.append(m.group(1))
        text = m.group(2)
    text = re.sub(r"\s*\[[^\]]*\]", "", text).strip()          # [+ à (object)] -> pois
    text = re.sub(r"\s*\((?:see|used|also|usually|often|chiefly)\b[^)]*\)", "", text, flags=re.I)
    text = re.sub(r"\s*\((?:all|most|various|several) (?:meanings|senses)\)", "", text, flags=re.I)
    text = text.rstrip(" .;:")
    if len(text) > 80:
        cut = text[:80]
        for sep in ("; ", ", ", " "):
            i = cut.rfind(sep)
            if i > 30:
                cut = cut[:i]
                break
        text = cut.rstrip(" ,;:") + "…"
    qual = ", ".join(quals)
    low = bool(LOW_PRIORITY.search(qual)) or bool(LOW_PRIORITY.search(text))
    if len(qual) > 40:
        qual = qual[:40].rsplit(",", 1)[0]
    return text, qual, low


def parse_wiktionary(path: Path):
    entries: dict[str, list] = {}
    inflections: dict[str, set] = collections.defaultdict(set)
    for line in path.read_text(encoding="utf-8").splitlines():
        head, _, body = line.partition("\t")
        forms = [f.strip() for f in head.split("|") if f.strip()]
        if not forms or not body:
            continue
        lemma = forms[0]
        if not re.search(r"[^\W\d_]", lemma):
            continue
        for f in forms[1:]:
            if " of " in f or f.count(" ") > 1 or not re.fullmatch(r"[^\W\d_]+(?:['’ -][^\W\d_]+)*", f):
                continue
            inflections[f.lower()].add(lemma)
        blocks = []
        for pos, inner in re.findall(r"<i>([^<]+)</i><br><ol>(.*?)</ol>(?=<br><i>|$)", body):
            if pos in SKIP_POS:
                continue
            senses = []
            for li in re.findall(r"<li>(.*?)</li>", inner):
                text, qual, low = split_sense(li)
                if not text or FORM_OF.search(text) or len(text) < 2 or JUNK_SENSE.search(text):
                    continue
                if any(text == t for t, _, _ in senses):
                    continue
                senses.append((text, qual, low))
            if senses:
                blocks.append((pos, senses))
        if blocks:
            entries.setdefault(lemma, []).extend(blocks)
    return entries, inflections


# Dicollecten tagit, jotka kerrotaan käyttäjälle (aikamuoto, persoona, suku, luku).
VERB_TAGS = {"ppre", "ppas", "ipre", "iimp", "ipsi", "ifut", "cond", "spre", "simp", "impe",
             "1sg", "2sg", "3sg", "1pl", "2pl", "3pl", "mas", "fem", "sg", "pl"}
NOUN_TAGS = {"mas", "fem", "pl"}
LITERARY = {"ipsi", "simp"}  # passé simple ja imperfektin konjunktiivi: harvinaisia uutisteksteissä


class Analysis:
    __slots__ = ("lemma", "tags", "occ", "old", "pid")

    def __init__(self, lemma, tags, occ, old, pid):
        self.lemma, self.tags, self.occ, self.old, self.pid = lemma, tags, occ, old, pid


def parse_dicollecte(path: Path):
    """Palauttaa: muoto -> analyysit, perusmuoto -> sanaluokkien yleisyys, perusmuoto -> suvut,
    yksikkömuoto -> suvut, paradigma-id -> feminiinin yksikkö."""
    analyses: dict[str, list] = collections.defaultdict(list)
    pos_freq: dict[str, collections.Counter] = collections.defaultdict(collections.Counter)
    gender: dict[str, set] = collections.defaultdict(set)
    form_gender: dict[str, set] = collections.defaultdict(set)
    fem_sg: dict[str, str] = {}
    lemma_total: collections.Counter = collections.Counter()
    seen_pairs: set = set()
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("#") or not line.strip():
                continue
            p = line.rstrip("\n").split("\t")
            if p[0] == "id" or len(p) < 16:
                continue
            pid, form, lemma, tags = p[0], p[2], p[3], p[4].split()
            try:
                freq = int(p[15])
            except ValueError:
                freq = 0
            first = tags[0] if tags else ""
            coarse = "v" if first.startswith("v") else ("mg" if first == "mg" else first)
            kinds = {coarse} | ({"adj"} if "adj" in tags else set()) | ({"nom"} if "nom" in tags else set())
            for kind in kinds:
                pos_freq[lemma][kind] += freq
            if coarse == "nom":
                for g in ("mas", "fem", "epi"):
                    if g in tags:
                        gender[lemma].add(g)
                        if "sg" in tags or "inv" in tags:
                            form_gender[form.lower()].add(g)
                if "fem" in tags and ("sg" in tags or "inv" in tags):
                    fem_sg[pid] = form
            if freq > 0:
                analyses[form.lower()].append(Analysis(lemma, tags, freq, "vx" in p[7].split(), pid))
                if (form, lemma) not in seen_pairs:
                    seen_pairs.add((form, lemma))
                    lemma_total[lemma] += freq
    return analyses, pos_freq, gender, form_gender, fem_sg, lemma_total


def gender_label(genders: set) -> str:
    if "epi" in genders or {"mas", "fem"} <= genders:
        return "nom m./f."
    if "mas" in genders:
        return "nom m."
    if "fem" in genders:
        return "nom f."
    return "nom"


def build(wikt_path: Path, lex_path: Path, out_dir: Path) -> None:
    raw, wikt_infl = parse_wiktionary(wikt_path)
    lex_forms, pos_freq, gender, form_gender, fem_sg, lemma_total = parse_dicollecte(lex_path)
    print(f"Wikisanakirja: {len(raw)} hakusanaa; Dicollecte: {len(lex_forms)} taivutusmuotoa", file=sys.stderr)

    def zipf(word: str) -> float:
        return zipf_frequency(word, "fr")

    entries: dict[str, dict] = {}
    for lemma, blocks in raw.items():
        z = zipf(lemma.lower())
        is_name = all(pos == "name" for pos, _ in blocks)
        if z < MIN_ZIPF or (is_name and z < 3.3):
            continue
        freq = pos_freq.get(lemma, collections.Counter())
        # Dicollecte antaa samannäköisille sanoille usein saman yleisyyden; silloin ratkaisee sanaluokkien järjestys.
        def weight(pos: str) -> float:
            coarse = COARSE.get(pos, "?")
            # Adjektiivien substantiivikäyttö (le grand, un jeune) näkyy Dicollectessa liian yleisenä.
            return freq.get(coarse, 0) * (3 if coarse == "adj" else 1)
        order = sorted(range(len(blocks)), key=lambda i: (
            -weight(blocks[i][0]), POS_RANK.get(COARSE.get(blocks[i][0], "?"), 9), i))
        blocks = [blocks[i] for i in order]
        primary = blocks[0][0]
        chosen: list[list] = []
        main = [s for s in blocks[0][1] if not s[2]] + [s for s in blocks[0][1] if s[2]]
        take_main = MAX_SENSES - min(1, len(blocks) - 1)
        for text, qual, _ in main[:take_main]:
            chosen.append([[text], qual])
        for pos, senses in blocks[1:]:
            if len(chosen) >= MAX_SENSES:
                break
            best = sorted(senses, key=lambda s: s[2])[0]
            if best[2]:
                continue  # vanhentunut tai alueellinen toinen sanaluokka jätetään pois
            label = POS_LABEL.get(pos, pos)
            note = f"{label}" + (f", {best[1]}" if best[1] else "")
            chosen.append([[best[0]], note])
        # Suku katsotaan ensin itse sanan yksikkömuodosta: Dicollecte merkitsee esim. retraite-sanan
        # retrait-sanan feminiiniksi, jolloin perusmuodon suku olisi väärin.
        genders = form_gender.get(lemma.lower()) or gender.get(lemma, set())
        label = gender_label(genders) if primary == "noun" else POS_LABEL.get(primary, primary)
        entries[lemma] = {"p": label, "s": chosen[:MAX_SENSES]}

    keys_lower = {}
    for k in entries:
        keys_lower.setdefault(k.lower(), k)

    def key_of(word: str):
        if word in entries:
            return word
        return keys_lower.get(word.lower())

    def score(form: str, a: Analysis, lemma_key: str, function_word: bool) -> float:
        """Kuinka todennäköisesti muoto tarkoittaa tätä perusmuotoa. Dicollecten yleisyydet ovat epätasaisia
        (samannäköiset muodot saavat usein saman luvun), joten mukana on myös perusmuodon yleisyys."""
        # Koko perusmuodon käyttö kaikissa muodoissaan: Dicollecte antaa samannäköisen muodon koko määrän
        # usein substantiiville (laisse 12,7 milj.) ja verbille vain murto-osan (laisser 1,5 milj.).
        sc = 0.5 * math.log10(lemma_total.get(a.lemma, a.occ) + 1) + 0.6 * zipf(lemma_key.lower())
        if lemma_key.lower() != form and function_word:
            sc -= 2.0  # mais = 'mutta', ei mai-sanan monikko
        if lemma_key.isupper() and len(lemma_key) > 1 and not form.isupper():
            sc -= 3.0  # ce ≠ CE
        elif lemma_key[:1].isupper() and not form[:1].isupper():
            sc -= 2.0  # sens ≠ Sens (kaupunki)
        is_verb = bool(a.tags) and a.tags[0].startswith("v")
        if is_verb:
            tenses = {t for t in a.tags if t in VERB_TAGS and not t[0].isdigit() and t not in ("mas", "fem", "sg", "pl")}
            if tenses and tenses <= LITERARY:
                sc -= 1.0
            if tenses == {"ppre"}:
                sc -= 1.0
            persons = {t for t in a.tags if t[:1].isdigit()}
            if persons and persons <= {"2sg"}:
                sc -= 1.0  # tu portes on harvinaisempi kuin les portes
            if "ppas" in tenses:
                # Partisiipit ovat useimmiten verbejä (ont été arrêtés), mutta feminiinin monikko harvoin (les parties).
                sc += -0.3 if ("fem" in a.tags and "pl" in a.tags) else 0.3
            else:
                sc += 0.1
        if a.old:
            sc -= 1.5
        if lemma_key.lower() == form:
            sc += 0.2
        return sc

    def describe(form: str, a: Analysis, lemma_key: str) -> str:
        if not a.tags:
            return ""
        if a.tags[0].startswith("v"):
            tags = [t for t in a.tags[1:] if t in VERB_TAGS]
            if "ppas" not in tags:
                tags = [t for t in tags if t not in ("mas", "fem", "sg", "pl")]
            return " ".join(tags)
        if lemma_key.lower() == form:
            return ""
        return " ".join(t for t in a.tags if t in NOUN_TAGS and not (t == "mas" and "fem" not in a.tags))

    forms_out: dict[str, str] = {}
    grammar_out: dict[str, str] = {}
    for form, items in lex_forms.items():
        if zipf(form) < 1.8 or sum(a.occ for a in items) < 500:
            continue
        best: dict[str, float] = {}
        desc: dict[str, list] = collections.defaultdict(list)
        function_word = any(a.lemma.lower() == form and a.tags[:1] == ["mg"] for a in items)
        for a in items:
            candidates = [(a.lemma, 0.0)]
            # Feminiininen substantiivi, jolla on oma hakusanansa (retraite, romancière): käytä sitä.
            # Jos sana on myös adjektiivi (blanche, capitale), adjektiivi pysyy ensimmäisenä.
            if "nom" in a.tags and "fem" in a.tags and a.pid in fem_sg:
                own = key_of(fem_sg[a.pid])
                if own and own != a.lemma and entries[own]["p"].startswith("nom"):
                    candidates = [(a.lemma, 0.0), (own, -0.5)] if "adj" in a.tags else [(own, 0.0)]
            for lemma, bonus in candidates:
                lemma_key = key_of(lemma)
                if not lemma_key:
                    continue
                sc = score(form, a, lemma_key, function_word) + bonus
                if sc > best.get(lemma_key, -99):
                    best[lemma_key] = sc
                d = describe(form, a, lemma_key)
                if d and d not in desc[lemma_key]:
                    desc[lemma_key].append(d)
        if not best:
            continue
        ranked = sorted(best, key=lambda k: -best[k])
        top = best[ranked[0]]
        ranked = [k for k in ranked if best[k] >= top - 2.5][:3]
        if ranked != [form] and ranked != [key_of(form)]:
            forms_out[form] = "|".join(ranked)
        gram = [f"{k}={','.join(desc[k][:3])}" for k in ranked if desc.get(k)]
        if gram:
            grammar_out[form] = "|".join(gram)
    # Wikisanakirjan taivutusmuodot vain niille sanoille, joita Dicollectessa ei ole.
    for form, lemmas in wikt_infl.items():
        if form in forms_out or form in lex_forms:
            continue
        names = [l for l in lemmas if l in entries]
        if names and zipf(form) >= 1.5:
            forms_out[form] = "|".join(sorted(names)[:2])

    out_dir.mkdir(parents=True, exist_ok=True)
    with gzip.open(out_dir / "fr-en.json.gz", "wt", encoding="utf-8") as fh:
        json.dump(entries, fh, ensure_ascii=False, separators=(",", ":"))
    with gzip.open(out_dir / "fr-formes.tsv.gz", "wt", encoding="utf-8") as fh:
        for form in sorted(forms_out):
            fh.write(f"{form}\t{forms_out[form]}\n")
    with gzip.open(out_dir / "fr-grammaire.tsv.gz", "wt", encoding="utf-8") as fh:
        for form in sorted(grammar_out):
            fh.write(f"{form}\t{grammar_out[form]}\n")
    with gzip.open(out_dir / "fr-frequence.tsv.gz", "wt", encoding="utf-8") as fh:
        for word in top_n_list("fr", FREQ_LIMIT):
            z = zipf(word)
            if z < 1.8:
                break
            fh.write(f"{word}\t{round(z * 10)}\n")
    print(f"Valmis: {len(entries)} hakusanaa, {len(forms_out)} taivutusmuotoa, {len(grammar_out)} kielioppitietoa.", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    build(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
