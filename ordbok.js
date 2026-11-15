/* Dictionnaire français–anglais. Fonctionne dans le navigateur (window.Ordbok) et dans Node (tests).
 *
 * Données (ordbok.json), construites par GitHub Actions à partir de data/ :
 *   d: forme de base -> { p: catégorie, s: [[[traductions], "remarque"], ...] }
 *   f: forme fléchie -> "base|base"
 *   p: corrections : forme fléchie -> bases à privilégier
 *   z: mot -> fréquence (zipf * 10)
 *   u: expressions [texte, sens, commence par un verbe 0/1, forme affichée]
 *   t: forme fléchie -> "base=étiquettes|base=étiquettes" (temps, personne, genre, nombre)
 */
(function (root) {
  "use strict";

  // Les élisions (l', d', qu', jusqu'…) deviennent des mots à part : l'homme -> l' + homme.
  const WORD_RE = /aujourd['’]hui|quelqu['’]une?s?|prud['’]hom\p{L}*|presqu['’]île\p{L}*|\p{L}{1,7}['’](?=\p{L})|\p{L}+(?:-\p{L}+)*/giu;

  // « se » dans une expression vaut aussi pour ces pronoms.
  const REFLEXIVE = new Set(["se", "s'", "me", "m'", "te", "t'", "nous", "vous"]);
  // Petits mots qui peuvent s'intercaler dans une expression (il s'est rendu compte, a eu lieu).
  const GAP = new Set([
    "ne", "n'", "pas", "plus", "jamais", "rien", "y", "en", "bien", "déjà", "toujours", "aussi", "vraiment",
    "également", "encore", "souvent", "beaucoup", "me", "m'", "te", "t'", "se", "s'", "nous", "vous", "lui",
    "leur", "le", "la", "les", "l'", "est", "sont", "a", "ont", "avait", "avaient", "était", "étaient", "sera",
    "seront", "serait", "ai", "as", "avons", "avez", "suis", "es", "sommes", "êtes", "été", "eu", "il", "elle",
    "on", "ils", "elles", "je", "tu", "notamment", "désormais", "enfin", "donc",
  ]);
  const ANY = "…";

  const norm = (w) => w.toLowerCase().replace(/’/g, "'");

  class Ordbok {
    constructor(data) {
      this.d = data.d || {};
      this.f = data.f || {};
      this.p = data.p || {};
      this.z = data.z || {};
      this.t = data.t || {};
      this.lower = new Map();
      for (const key of Object.keys(this.d)) {
        const low = norm(key);
        if (!this.lower.has(low) || key === low) this.lower.set(low, key);
      }
      this.phrases = [];
      this.byToken = new Map();
      for (const [text, s, verb, show] of data.u || []) {
        const toks = text.split(" ");
        if (toks.filter((t) => t !== ANY).length < 2) continue;
        const phrase = { text, toks, s, verb: !!verb, show: show || text };
        this.phrases.push(phrase);
        for (const t of new Set(toks)) {
          if (t === ANY) continue;
          if (!this.byToken.has(t)) this.byToken.set(t, []);
          this.byToken.get(t).push(phrase);
        }
      }
    }

    entry(key) {
      const e = this.d[key];
      return { l: key, p: e.p || "", s: e.s || [] };
    }

    zipf(word) {
      const z = this.z[norm(word)];
      return typeof z === "number" ? z / 10 : null;
    }

    /** Formes de base possibles d'un mot. */
    lemmas(word, guess = true) {
      const w = norm(word);
      const found = [];
      const add = (l) => {
        const key = this.d[l] ? l : this.lower.get(norm(l));
        if (key && !found.includes(key)) found.push(key);
      };
      const preferred = this.p[w];
      if (preferred) {
        preferred.split("|").forEach(add);
        if (found.length) return found;
      }
      // f donne les bases dans l'ordre de probabilité (vit -> vivre|voir). Si le mot n'y figure pas
      // lui-même, c'est qu'il est rare dans ce sens (vit, nom vieilli).
      if (this.f[w]) {
        this.f[w].split("|").forEach(add);
        if (!found.length) add(w);
      } else add(w);
      if (found.length || !guess) return found;
      // Pluriels absents de la liste : maisons -> maison, chevaux -> cheval
      if (/[sx]$/.test(w) && w.length > 3) {
        add(w.slice(0, -1));
        if (w.endsWith("aux")) add(w.slice(0, -3) + "al");
      }
      return found;
    }

    /** Ce mot fait-il partie de l'expression (forme de base comprise) ? */
    tokenMatches(word, tok) {
      if (word === tok) return true;
      if (tok === "se") return REFLEXIVE.has(word);
      return this.lemmas(word, false).some((l) => norm(l) === tok);
    }

    /** Expressions auxquelles appartient le mot n° i. words : mots de la phrase en minuscules. */
    phrasesAt(words, i) {
      const word = words[i];
      if (!word) return [];
      const cands = new Set();
      for (const key of [word, ...this.lemmas(word, false).map(norm)]) {
        for (const p of this.byToken.get(key) || []) cands.add(p);
      }
      if (REFLEXIVE.has(word)) for (const p of this.byToken.get("se") || []) cands.add(p);
      const out = [];
      for (const p of cands) {
        const span = p.toks.length + 6;
        for (let start = Math.max(0, i - span); start <= i; start++) {
          const hit = this.align(p, words, start, 0, []);
          if (hit && hit.includes(i)) {
            out.push({ text: p.text, show: p.show, s: p.s, from: hit[0], to: hit[hit.length - 1], words: hit });
            break;
          }
        }
      }
      out.sort((a, b) => b.words.length - a.words.length || a.from - b.from);
      return out.filter((x, k) => !out.slice(0, k).some((y) => x.words.every((n) => y.words.includes(n)))).slice(0, 2);
    }

    /** Aligne l'expression p sur les mots à partir de la position j. Renvoie les indices couverts. */
    align(p, words, j, k, covered) {
      if (k === p.toks.length) return covered;
      const tok = p.toks[k];
      if (tok === ANY) {
        for (let skip = 1; skip <= 3; skip++) {
          const hit = this.align(p, words, j + skip, k + 1, covered);
          if (hit) return hit;
        }
        return null;
      }
      // Petits mots intercalés : après le premier mot d'une expression verbale, ou entre se et le verbe.
      const maxGap = k > 0 && (p.verb || p.toks[0] === "se") ? 2 : 0;
      for (let gap = 0; gap <= maxGap; gap++) {
        const at = j + gap;
        if (gap > 0 && !GAP.has(words[at - 1] || "")) break;
        if (words[at] !== undefined && this.tokenMatches(words[at], tok)) {
          const hit = this.align(p, words, at + 1, k + 1, [...covered, at]);
          if (hit) return hit;
        }
        if (k === 0) break;
      }
      return null;
    }

    /**
     * Cherche un mot. Renvoie
     *   { type: "word", entries: [...] }
     *   null si rien n'est trouvé
     */
    /** Étiquettes grammaticales de la forme pour cette base : ["ipre 3sg", "spre 3sg"] ou []. */
    grammar(word, lemma) {
      const info = this.t[norm(word)];
      if (!info) return [];
      for (const part of info.split("|")) {
        const [base, tags] = part.split("=");
        if (base === lemma) return tags ? tags.split(",") : [];
      }
      return [];
    }

    lookup(word) {
      const w = norm(word);
      const keys = this.lemmas(w);
      if (keys.length) return { type: "word", entries: keys.slice(0, 2).map((k) => this.entry(k)) };
      if (w.includes("-")) {
        // dit-il -> dit, peut-être est dans le dictionnaire ; sinon la première ou la dernière partie
        const parts = w.split("-").filter((x) => x && x !== "t");
        for (const part of [parts[0], parts[parts.length - 1]]) {
          const hit = part && this.lemmas(part);
          if (hit && hit.length) return { type: "word", entries: hit.slice(0, 2).map((k) => this.entry(k)) };
        }
      }
      return null;
    }
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { Ordbok, WORD_RE };
  else {
    root.Ordbok = Ordbok;
    root.ORDBOK_WORD_RE = WORD_RE;
  }
})(typeof self !== "undefined" ? self : this);
