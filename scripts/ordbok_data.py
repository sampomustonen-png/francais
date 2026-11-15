"""Kokoaa selaimen sanakirjatiedoston (ordbok.json) kansion data/ tiedostoista.

data/corrections.json sisältää omat korjaukset. Muoto:
    {
      "ord":    {"plat": {"p": "nom m.", "s": [[["dish"], "un plat du jour"]], "ersätt": true}},
      "former": {"est": "être|est", "l'": "le|la"}
    }
"ord": omat merkitykset lisätään ensimmäisiksi; jos "ersätt" on true, sanakirjan merkitykset jätetään pois.
"former": taivutusmuoto -> perusmuodot, joita käytetään ensisijaisesti.
"""
from __future__ import annotations

import gzip
import json
import re
from pathlib import Path

FREQ_LIMIT = 50000  # selaimeen riittää näin monen yleisimmän sanan yleisyys


def load(data_dir: Path) -> dict:
    with gzip.open(data_dir / "fr-en.json.gz", "rt", encoding="utf-8") as fh:
        entries: dict = json.load(fh)

    # Perussanasto (vocabulaire.txt): käsin tarkistetut merkitykset yleisimmille sanoille.
    # Pelkkä "nom" saa suvun sanakirjasta (nom m. / nom f.), joten sukua ei tarvitse kirjoittaa käsin.
    for word, entry in load_grundord(data_dir / "vocabulaire.txt").items():
        base_pos = entries.get(word, {}).get("p", "")
        if entry["p"] == "nom" and base_pos.startswith("nom "):
            entry["p"] = base_pos
        entries[word] = entry

    prefer: dict[str, str] = {}
    own_path = data_dir / "corrections.json"
    if own_path.exists():
        own = json.loads(own_path.read_text(encoding="utf-8"))
        for word, fix in own.get("ord", {}).items():
            if not isinstance(fix, dict):
                continue
            senses = [[list(s[0]), s[1] if len(s) > 1 else ""] for s in fix.get("s", []) if s and s[0]]
            base = entries.get(word, {"p": "", "s": []})
            kept = [] if fix.get("ersätt") else [s for s in base["s"] if s[0] not in [x[0] for x in senses]]
            entries[word] = {"p": fix.get("p", base.get("p", "")), "s": (senses + kept)[:4]}
        prefer = {form.lower(): lemmas for form, lemmas in own.get("former", {}).items()}

    forms: dict[str, str] = {}
    with gzip.open(data_dir / "fr-formes.tsv.gz", "rt", encoding="utf-8") as fh:
        for line in fh:
            form, _, lemmas = line.rstrip("\n").partition("\t")
            forms[form] = lemmas

    # Kielioppitieto: muoto -> "perusmuoto=tagit|…" (aikamuoto, persoona, suku, luku Dicollectesta)
    grammar: dict[str, str] = {}
    gram_path = data_dir / "fr-grammaire.tsv.gz"
    if gram_path.exists():
        with gzip.open(gram_path, "rt", encoding="utf-8") as fh:
            for line in fh:
                form, _, info = line.rstrip("\n").partition("\t")
                grammar[form] = info

    freq: dict[str, int] = {}
    with gzip.open(data_dir / "fr-frequence.tsv.gz", "rt", encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if i >= FREQ_LIMIT:
                break
            word, _, z = line.rstrip("\n").partition("\t")
            freq[word] = int(z)

    # Kielioppitieto vain yleisille muodoille, ettei selaimen tiedosto kasva turhaan.
    grammar = {k: v for k, v in grammar.items() if k in freq}

    u = phrases(entries, data_dir / "expressions.txt")
    # Monisanaiset hakusanat näytetään ilmauksina; sanahaku ei tarvitse niitä.
    entries = {k: v for k, v in entries.items() if " " not in k}
    return {"d": entries, "f": forms, "p": prefer, "z": freq, "u": u, "t": grammar}


# Sanakirjan monisanaisista hakusanoista otetaan mukaan vain ne, joissa on jokin näistä sanoista
# (partikkeliverbit ja vakiintuneet ilmaukset, ei esim. lintulajeja).
FUNCTION_WORDS = {
    "à", "de", "d'", "en", "y", "se", "s'", "pour", "par", "sur", "sous", "dans", "avec", "sans", "que", "qu'",
    "ne", "n'", "pas", "plus", "au", "aux", "du", "des", "la", "le", "les", "l'", "un", "une", "comme", "tout",
}
# Pelkistä pikkusanoista koostuvat "ilmaukset" (à la, d'un) jätetään pois.
STOP = FUNCTION_WORDS | {"il", "elle", "on", "ils", "je", "tu", "nous", "vous", "ce", "c'", "ça", "qui", "et", "ou",
                         "j'", "m'", "t'", "me", "te", "lui", "leur", "son", "sa", "ses", "est", "a", "être", "avoir"}
# Sanakirjan ilmauksia, jotka osuvat useammin väärään kohtaan kuin oikeaan (rien de plus agréable ≠ moreover).
DROP_PHRASES = {"de plus", "de moins", "à la", "en tout", "de tout", "pour tout", "tout le", "de la", "par le"}
ELISION = re.compile(r"\b(jusqu|lorsqu|puisqu|quoiqu|presqu|qu|[cdjlmnst])['’](?=\w)", re.I)


def split_elisions(text: str) -> str:
    """d'abord -> d' abord, il s'agit de -> il s' agit de (sama jako kuin selaimessa)."""
    text = text.replace("’", "'")
    if re.fullmatch(r"(aujourd'hui|quelqu'une?s?)", text.lower()):
        return text
    return ELISION.sub(lambda m: m.group(1) + "' ", text).replace("  ", " ")


def phrases(entries: dict, path: Path) -> list:
    found: dict[str, list] = {}
    for key, e in entries.items():
        toks = split_elisions(key).split(" ")
        if (2 <= len(toks) <= 5 and key == key.lower() and not key.endswith((".", "!", "?")) and key not in DROP_PHRASES
                and any(t in FUNCTION_WORDS for t in toks) and not all(t in STOP for t in toks) and e.get("s")):
            found[key] = e["s"][:2]
    for key, senses in load_lines(path, with_pos=False).items():
        found[key.lower()] = senses
    out = []
    for key, senses in found.items():
        text = split_elisions(key.lower())
        toks = ["se" if t in ("s'", "se") and i == 0 else t for i, t in enumerate(text.split(" "))]
        text = " ".join(toks)
        first = entries.get(toks[1] if toks[0] == "se" and len(toks) > 1 else toks[0], {})
        # Näyttömuoto säilyttää heittomerkin (s'attendre à), hakumuoto on normalisoitu (se attendre à).
        show = key.replace("’", "'")
        item = [text, senses, 1 if "verb" in first.get("p", "") else 0]
        if show != text:
            item.append(show)
        out.append(item)
    return out


def load_grundord(path: Path) -> dict:
    return {w: {"p": pos, "s": s} for w, (pos, s) in load_lines(path, with_pos=True).items()}


def load_lines(path: Path, with_pos: bool) -> dict:
    """Lukee rivit muotoa  sana|sanaluokka|käännös, käännös = esimerkki; seuraava merkitys
    (tai ilman sanaluokkaa: ilmaus|merkitykset)."""
    out: dict = {}
    if not path.exists():
        return out
    want = 3 if with_pos else 2
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) != want or not parts[0]:
            raise ValueError(f"{path.name} rivi {n}: väärä muoto ({want} osaa |-merkeillä erotettuna)")
        senses = []
        for chunk in parts[-1].split(";"):
            fi, _, note = chunk.partition(" = ")
            words = [w.strip() for w in fi.split(",") if w.strip()]
            if words:
                senses.append([words, note.strip()])
        if not senses:
            raise ValueError(f"{path.name} rivi {n}: ei suomennoksia")
        out[parts[0]] = (parts[1], senses[:4]) if with_pos else senses[:4]
    return out


def zipf_table(data_dir: Path) -> dict[str, float]:
    table: dict[str, float] = {}
    with gzip.open(data_dir / "fr-frequence.tsv.gz", "rt", encoding="utf-8") as fh:
        for line in fh:
            word, _, z = line.rstrip("\n").partition("\t")
            table[word] = int(z) / 10
    return table
