/* Lecture en français : interface. La recherche de mots est dans ordbok.js. */
(() => {
  "use strict";

  /* ================================================================ asetukset */

  const PAGE = 30;
  const DAY = 86400;
  const REVIEW_DAYS = [0, 1, 2, 4, 8, 16, 32, 64];

  const ICONS = {
    idag: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
    nyheter: '<rect x="3.5" y="4.5" width="13.5" height="15" rx="2.5"/><path d="M17 8.5h2a1.5 1.5 0 0 1 1.5 1.5v7.5a2 2 0 0 1-2 2H6M7 9h6.5M7 12.5h6.5M7 16h4"/>',
    kultur: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17.5l4.5-4.5 3.5 3.5 3-3 5.5 5.5"/>',
    latt: '<path d="M5 19.2C5 11 10.2 5.3 19.4 4.8c.5 9.3-5.2 14.4-14.4 14.4zM5 19.2l7.8-7.8"/>',
    ord: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    speak: '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11"/>',
    varlden: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.5 2.4 3.8 5.3 3.8 8.6s-1.3 6.2-3.8 8.6c-2.5-2.4-3.8-5.3-3.8-8.6s1.3-6.2 3.8-8.6z"/>',
    bok: '<path d="M12 6.8c-1.9-1.5-4.4-2.2-7.6-2.2v13.2c3.2 0 5.7.7 7.6 2.2 1.9-1.5 4.4-2.2 7.6-2.2V4.6c-3.2 0-5.7.7-7.6 2.2zM12 6.8v13.2"/>',
    film: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M7.5 5.5v13M16.5 5.5v13M3.5 9.5h4M3.5 14.5h4M16.5 9.5h4M16.5 14.5h4"/>',
    check: '<circle cx="12" cy="12" r="8.6"/><path d="M8.2 12.3l2.5 2.5 5.1-5.3"/>',
    checkFull: '<circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none"/><path d="M8.2 12.3l2.5 2.5 5.1-5.3" stroke="#fff"/>',
    open: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10"/>',
    reddit: '<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h7A2.6 2.6 0 0 1 16.2 6.6v4a2.6 2.6 0 0 1-2.6 2.6H9.2L5.6 16v-2.8A2.6 2.6 0 0 1 4 10.6z"/><path d="M18.4 9h.1a2 2 0 0 1 2 2v3.6a2 2 0 0 1-2 2h-.4v2.6l-3-2.6h-2.6a2 2 0 0 1-1.8-1.2"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chev: '<path d="M9.5 5.5l6.5 6.5-6.5 6.5"/>',
    vie: '<path d="M4.5 9.5h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 11h1.2a2.6 2.6 0 0 1 0 5.2h-1.6M8.2 3.5c-.9 1.1.9 2.1 0 3.4M12.2 3.5c-.9 1.1.9 2.1 0 3.4"/>',
    cuisine: '<path d="M7 3.5v7.5a2.5 2.5 0 0 0 5 0V3.5M9.5 3.5v17M16.5 20.5V3.5c-2 0-3.5 2.5-3.5 6v4h3.5"/>',
    voyage: '<path d="M21 15.5l-8.5-4V5a1.5 1.5 0 0 0-3 0v6.5L3 15.5v2l6.5-2v4l-2 1.5v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-4l8.5 2z"/>',
  };
  const CATEGORY = {
    monde: { name: "Monde", icon: "varlden" },
    france: { name: "France", icon: "nyheter" },
    culture: { name: "Culture", icon: "kultur" },
    vie: { name: "Art de vivre", icon: "vie" },
  };
  const isNews = (i) => i.category === "monde" || i.category === "france";
  const has = (i, tag) => (i.tags || []).includes(tag);
  const TABS = [
    { id: "idag", label: "Aujourd'hui", title: "Aujourd'hui", color: "--accent" },
    { id: "nyheter", label: "Actualités", title: "Actualités", color: "--accent", segs: [
      { id: "alla", label: "Tout", test: isNews },
      { id: "monde", label: "Monde", test: (i) => i.category === "monde" },
      { id: "france", label: "France", test: (i) => i.category === "france" },
    ] },
    { id: "kultur", label: "Culture", title: "Culture", color: "--accent", segs: [
      { id: "alla", label: "Tout", test: (i) => i.category === "culture" || has(i, "livre") || has(i, "film") },
      { id: "livre", label: "Livres", test: (i) => has(i, "livre") },
      { id: "film", label: "Cinéma & séries", test: (i) => has(i, "film") },
    ] },
    { id: "vie", label: "Art de vivre", title: "Art de vivre", color: "--accent", segs: [
      { id: "alla", label: "Tout", test: (i) => i.category === "vie" || has(i, "cuisine") || has(i, "voyage") },
      { id: "cuisine", label: "Cuisine", test: (i) => has(i, "cuisine") },
      { id: "voyage", label: "Voyage", test: (i) => has(i, "voyage") },
    ] },
    { id: "ord", label: "Mes mots", title: "Mes mots", color: "--accent" },
  ];
  const LEVEL = { 1: "Facile", 2: "Moyen", 3: "Difficile" };
  const plur = (count, one, many) => `${count} ${count < 2 ? one : many}`;

  /* ================================================================ tallennus */

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* yksityinen selaus tms. */ }
    },
  };

  const state = {
    items: [],
    sources: [],
    reddit: [],
    generatedTs: 0,
    tab: store.get("fr.tab2", "idag"),
    segs: store.get("fr.segs", { nyheter: "alla", kultur: "alla", vie: "alla" }),
    sort: store.get("fr.sort", "new"),
    hideRead: store.get("fr.hideRead", false),
    size: store.get("fr.size", "m"),
    tipSeen: store.get("fr.tipSeen2", false),
    read: new Set(store.get("fr.read", [])),
    hiddenSources: new Set(store.get("fr.hiddenSources", [])),
    words: store.get("fr.ord", []),
    days: store.get("fr.days", []),
    daily: store.get("fr.dagens", null),
    shown: PAGE,
    reader: null,
    returnTo: null,
  };
  if (!TABS.some((t) => t.id === state.tab)) state.tab = "idag";

  const saveRead = () => store.set("fr.read", [...state.read].slice(-4000));
  const saveWords = () => store.set("fr.ord", state.words);

  /* ================================================================ apufunktiot */

  const $ = (id) => document.getElementById(id);
  const el = (tag, props = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v; // vain omia, kiinteitä SVG-merkkijonoja
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const c of children) if (c !== null && c !== undefined && c !== false) node.append(c);
    return node;
  };
  const svg = (name, extra = "") =>
    `<svg ${extra} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  const safeUrl = (u) => (typeof u === "string" && /^https?:\/\//i.test(u) ? u : null);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const now = () => Date.now() / 1000;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  function ago(ts) {
    const diff = ts - now();
    const abs = Math.abs(diff);
    if (abs < 3600) return rtf.format(Math.min(-1, Math.round(diff / 60)), "minute");
    if (abs < DAY) return rtf.format(Math.round(diff / 3600), "hour");
    return rtf.format(Math.round(diff / DAY), "day");
  }
  const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  function dayLabel(ts) {
    const d = new Date(ts * 1000);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const diffDays = Math.round((start - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
    if (diffDays <= 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    return cap(dayFmt.format(d));
  }

  let toastTimer = 0;
  function toast(message) {
    const t = $("toast");
    t.textContent = message;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
  }

  /* ================================================================ sanat tekstissä */

  const WORD = window.ORDBOK_WORD_RE;
  function wordify(text, node) {
    let last = 0;
    for (const m of text.matchAll(WORD)) {
      if (m.index > last) node.append(text.slice(last, m.index));
      node.append(el("span", { class: "w", "data-o": String(m.index), text: m[0] }));
      last = m.index + m[0].length;
    }
    if (last < text.length) node.append(text.slice(last));
    node.dataset.text = "1";
    return node;
  }
  function sentenceAt(text, offset) {
    const re = /[^.!?…]+(?:[.!?…]+|$)/g;
    let m;
    while ((m = re.exec(text))) {
      if (offset >= m.index && offset < m.index + m[0].length) return m[0].trim();
    }
    return text.trim();
  }

  /* ================================================================ ääntäminen */

  // iPhonen oma ranskan puheääni (Web Speech API): ei maksa, toimii ilman verkkoa.
  const canSpeak = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  let frVoice = null;
  function pickVoice() {
    try {
      const voices = window.speechSynthesis.getVoices();
      frVoice = voices.find((v) => /^fr[-_]FR/i.test(v.lang) && v.localService)
        || voices.find((v) => /^fr[-_]FR/i.test(v.lang)) || voices.find((v) => /^fr/i.test(v.lang)) || null;
    } catch { frVoice = null; }
  }
  if (canSpeak) {
    pickVoice();
    try { window.speechSynthesis.addEventListener("voiceschanged", pickVoice); } catch { /* vanha selain */ }
  }
  function speak(text, rate = 0.9) {
    if (!canSpeak || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR";
      if (frVoice) u.voice = frVoice;
      u.rate = rate;
      window.speechSynthesis.speak(u);
    } catch { /* ääni ei käytettävissä */ }
  }
  /** Pyöreä kaiutinnappi. getText palauttaa luettavan tekstin napautushetkellä. */
  function speakButton(getText, label) {
    if (!canSpeak) return null;
    return el("button", { class: "spk", type: "button", "aria-label": label, title: label, html: svg("speak"),
      onclick: (e) => { e.stopPropagation(); speak(getText()); } });
  }

  /* ================================================================ sanakirja ja käännökset */

  let ordbok = null;
  let ordbokPromise = null;
  function loadOrdbok() {
    if (!ordbokPromise) {
      ordbokPromise = fetch("ordbok.json")
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((data) => {
          ordbok = new window.Ordbok(data);
          markSaved(document);
          return ordbok;
        })
        .catch((err) => { console.error(err); ordbokPromise = null; return null; });
    }
    return ordbokPromise;
  }

  let mtData = null;
  let mtPromise = null;
  function loadMt() {
    if (!mtPromise) {
      mtPromise = fetch("oversattning.json")
        .then((r) => (r.ok ? r.json() : { s: {}, w: {} }))
        .catch(() => ({ s: {}, w: {} }))
        .then((d) => (mtData = { s: d.s || {}, w: d.w || {} }));
    }
    return mtPromise;
  }

  const mmCache = new Map();
  async function myMemory(text) {
    const q = text.slice(0, 450);
    if (mmCache.has(q)) return mmCache.get(q);
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=fr|en`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const raw = data && data.responseData && data.responseData.translatedText;
    if (!raw || Number(data.responseStatus) !== 200 || /MYMEMORY WARNING|QUERY LENGTH/i.test(raw)) throw new Error("quota");
    const out = new DOMParser().parseFromString(raw, "text/html").documentElement.textContent.trim();
    mmCache.set(q, out);
    return out;
  }

  /** Palauttaa { text, by } tai heittää virheen. */
  async function translate(text, kind) {
    await loadMt();
    const local = kind === "w" ? mtData.w[text.toLowerCase()] : mtData.s[text];
    if (local) return { text: local, by: "OPUS-MT" };
    return { text: await myMemory(text), by: "MyMemory" };
  }

  /* ================================================================ Mina ord */

  function savedKeys() {
    const keys = new Set();
    for (const w of state.words) {
      keys.add(w.w.toLowerCase());
      if (w.l) keys.add(w.l.toLowerCase());
    }
    return keys;
  }
  function findSaved(word, lemma) {
    const a = word.toLowerCase();
    const b = (lemma || "").toLowerCase();
    return state.words.find((w) => w.w.toLowerCase() === a || (b && (w.l || "").toLowerCase() === b));
  }
  function markSaved(root) {
    const keys = savedKeys();
    for (const span of root.querySelectorAll(".w")) {
      const low = span.textContent.toLowerCase();
      let hit = keys.has(low);
      if (!hit && ordbok && keys.size) {
        const lemma = ordbok.lemmas(low)[0];
        hit = !!lemma && keys.has(lemma.toLowerCase());
      }
      span.classList.toggle("saved", hit);
    }
  }
  function dueWords() {
    const t = now();
    return state.words.filter((w) => (w.due || 0) <= t);
  }

  /* ================================================================ luetut ja putki */

  function setRead(item, value) {
    if (value) state.read.add(item.id);
    else state.read.delete(item.id);
    saveRead();
    if (value) {
      const key = dateKey();
      if (!state.days.includes(key)) {
        state.days = [...state.days, key].slice(-400);
        store.set("fr.days", state.days);
      }
    }
  }
  function streak() {
    const days = new Set(state.days);
    let count = 0;
    const d = new Date();
    if (!days.has(dateKey(d))) d.setDate(d.getDate() - 1);
    while (days.has(dateKey(d))) {
      count += 1;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }

  /* ================================================================ päivän valikoima */

  function visibleItems() {
    return state.items.filter((i) => !state.hiddenSources.has(i.source));
  }
  function pickDaily() {
    const key = dateKey();
    const byId = new Map(state.items.map((i) => [i.id, i]));
    if (state.daily && state.daily.date === key) {
      const kept = state.daily.ids.filter((id) => byId.has(id));
      if (kept.length >= 4) return kept.map((id) => byId.get(id));
    }
    const all = visibleItems();
    const recent = all.filter((i) => i.ts > now() - 1.5 * DAY);
    const pool = (recent.length >= 12 ? recent : all).filter((i) => !state.read.has(i.id));
    const rank = (a, b) => (a.level || 2) - (b.level || 2) || (b.image ? 1 : 0) - (a.image ? 1 : 0) || b.ts - a.ts;
    const picked = [];
    const take = (test, n) => {
      for (const item of pool.filter(test).sort(rank)) {
        if (n <= 0) break;
        if (!picked.includes(item)) { picked.push(item); n -= 1; }
      }
    };
    take((i) => i.category === "monde", 2);
    take((i) => i.category === "france", 1);
    take((i) => has(i, "livre"), 1);
    take((i) => has(i, "film"), 1);
    take((i) => i.category === "vie", 2);
    take((i) => i.category === "culture", 1);
    take(() => true, 8 - picked.length);
    state.daily = { date: key, ids: picked.map((i) => i.id) };
    store.set("fr.dagens", state.daily);
    return picked;
  }

  /* ================================================================ yläosa */

  function currentTab() { return TABS.find((t) => t.id === state.tab); }
  function tabColor(tab) {
    return getComputedStyle(document.documentElement).getPropertyValue(tab.color).trim() || "#4541D6";
  }
  function renderHeader() {
    const tab = currentTab();
    $("today").textContent = cap(dayFmt.format(new Date()));
    const title = state.reader ? (state.reader.item ? tab.title : "Mon texte") : tab.title;
    $("title").textContent = title;
    $("compact").textContent = title;
    document.body.style.setProperty("--tint", tabColor(tab));
    renderStatus();
  }
  function listFor(tab) {
    let list = visibleItems();
    if (tab.segs) {
      const seg = tab.segs.find((s) => s.id === state.segs[tab.id]) || tab.segs[0];
      list = list.filter(seg.test);
    } else if (tab.test) {
      list = list.filter(tab.test);
    }
    return list;
  }
  function renderStatus() {
    const status = $("status");
    status.classList.remove("stale");
    if (state.reader) { status.textContent = "Touchez un mot pour voir ce qu'il veut dire."; return; }
    if (state.tab === "ord") {
      const due = dueWords().length;
      status.textContent = `${plur(state.words.length, "mot enregistré", "mots enregistrés")}. ${due} à réviser.`;
      return;
    }
    if (!state.generatedTs) return;
    const hours = (now() - state.generatedTs) / 3600;
    if (hours > 12) {
      status.classList.add("stale");
      status.textContent = `Dernière mise à jour ${ago(state.generatedTs)}. Vérifiez l'onglet Actions sur GitHub.`;
      return;
    }
    const tab = currentTab();
    const list = state.tab === "idag" ? visibleItems() : listFor(tab);
    const unread = list.filter((i) => !state.read.has(i.id)).length;
    status.textContent = `${unread} non ${unread < 2 ? "lu" : "lus"}. Mis à jour ${ago(state.generatedTs)}.`;
  }

  /* ================================================================ välilehdet */

  function renderTabs() {
    const bar = $("tabbar");
    for (const tab of TABS) {
      const btn = el("button", { class: "tab", type: "button", "data-tab": tab.id, "aria-pressed": "false", html: svg(tab.id) },
        el("span", { text: tab.label }));
      btn.style.setProperty("--c", `var(${tab.color})`);
      btn.addEventListener("click", () => selectTab(tab.id));
      bar.append(btn);
    }
    window.addEventListener("resize", moveLens);
  }
  function moveLens() {
    const active = $("tabbar").querySelector('[aria-pressed="true"]');
    const lens = $("lens");
    if (!active) { lens.style.width = "0"; return; }
    lens.style.width = `${active.offsetWidth}px`;
    lens.style.transform = `translateX(${active.offsetLeft}px)`;
  }
  function markTabs() {
    for (const btn of $("tabbar").querySelectorAll(".tab")) {
      btn.setAttribute("aria-pressed", String((!state.reader || !!state.reader.item) && btn.dataset.tab === state.tab));
    }
    moveLens();
  }
  function selectTab(id) {
    closeWord();
    if (state.reader) {
      if (history.state && history.state.reader) history.replaceState(null, "");
      closeReader(false);
    }
    else if (id === state.tab) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    state.tab = id;
    state.shown = PAGE;
    store.set("fr.tab2", id);
    markTabs();
    renderHeader();
    renderView();
    window.scrollTo({ top: 0 });
  }

  /* ================================================================ kortit */

  function cardNode(item) {
    const source = state.sources.find((s) => s.id === item.source);
    const link = safeUrl(item.link) || "#";
    const card = el("article", { class: `card cat-${item.category}${state.read.has(item.id) ? " read" : ""}`, "data-link": link, "data-src": source ? source.name : "" });

    // Pieni kuva otsikon vieressä: teksti pysyy pääosassa ja ruudulle mahtuu useampi juttu.
    const img = safeUrl(item.image);
    let thumb = null;
    if (img && img.startsWith("https://")) {
      const im = el("img", { src: img, alt: "", loading: "lazy", decoding: "async", referrerpolicy: "no-referrer" });
      thumb = el("div", { class: "thumb", "aria-hidden": "true" }, im);
      im.addEventListener("error", () => thumb.remove());
    }

    const meta = el("div", { class: "meta" }, el("span", { class: "src" }, el("i"), source ? source.name : item.source));
    if (item.level) {
      meta.append(el("span", { class: `lvl l${item.level}`, title: `Niveau : ${LEVEL[item.level]}` },
        el("i"), el("i"), el("i"), el("b", { text: LEVEL[item.level] })));
    }
    meta.append(el("time", { datetime: item.published, text: ago(item.ts) }));

    const lead = el("div", { class: "lead" }, wordify(item.title.normalize("NFC"), el("h2", { lang: "fr" })), thumb);
    const body = el("div", { class: "body" }, meta, lead);
    if (item.summary) body.append(wordify(item.summary.normalize("NFC"), el("p", { class: "sum", lang: "fr" })));

    const chips = el("div", { class: "chips" });
    if (item.genre) chips.append(el("span", { class: "chip genre", text: item.genre }));
    if (has(item, "livre")) chips.append(el("span", { class: "chip bok", html: svg("bok") }, "Livres"));
    if (has(item, "film")) chips.append(el("span", { class: "chip film", html: svg("film") }, "Cinéma & séries"));
    if (has(item, "cuisine")) chips.append(el("span", { class: "chip cuisine", html: svg("cuisine") }, "Cuisine"));
    if (has(item, "voyage")) chips.append(el("span", { class: "chip voyage", html: svg("voyage") }, "Voyage"));
    if (chips.childNodes.length) body.append(chips);

    const markBtn = el("button", { class: "mark", type: "button" });
    const paintMark = () => {
      const read = state.read.has(item.id);
      card.classList.toggle("read", read);
      markBtn.innerHTML = svg(read ? "checkFull" : "check");
      markBtn.append(read ? "Lu" : "Marquer comme lu");
      markBtn.setAttribute("aria-pressed", String(read));
    };
    paintMark();
    markBtn.addEventListener("click", () => {
      setRead(item, !state.read.has(item.id));
      paintMark();
      afterReadChange();
    });
    const open = el("button", { class: "open", type: "button", "aria-label": `Lire l'article : ${item.title}`, html: svg("chev") });
    open.prepend("Lire l'article");
    open.addEventListener("click", () => openArticle(item));
    if (thumb) thumb.addEventListener("click", () => openArticle(item));
    body.append(el("div", { class: "foot" }, markBtn, open));
    card.append(body);
    return card;
  }

  function afterReadChange() {
    renderStatus();
    const daily = document.querySelector(".daily");
    if (daily) daily.replaceWith(dailyPanel(pickDaily()));
  }

  function sortList(list) {
    if (state.sort === "easy") {
      return [...list].sort((a, b) => (a.level || 2) - (b.level || 2) || b.ts - a.ts);
    }
    return list;
  }

  function appendList(view, list, { withDays = true } = {}) {
    const shown = list.filter((i) => !(state.hideRead && state.read.has(i.id)));
    if (!shown.length) {
      const box = el("div", { class: "empty" });
      if (state.hideRead && list.length) {
        box.append(el("div", { text: "Vous avez tout lu ici." }),
          el("button", { type: "button", text: "Afficher les articles lus", onclick: () => setHideRead(false) }));
      } else {
        box.append(el("div", { text: "Rien ici pour le moment. Revenez plus tard." }));
      }
      view.append(box);
      return;
    }
    const sorted = sortList(shown);
    let lastDay = "";
    const frag = document.createDocumentFragment();
    for (const item of sorted.slice(0, state.shown)) {
      if (withDays && state.sort === "new") {
        const label = dayLabel(item.ts);
        if (label !== lastDay) { frag.append(el("h2", { class: "day", text: label })); lastDay = label; }
      }
      frag.append(cardNode(item));
    }
    view.append(frag);
    const left = sorted.length - state.shown;
    if (left > 0) {
      view.append(el("button", { class: "more glass", type: "button", text: `Afficher ${Math.min(PAGE, left)} de plus`,
        onclick: () => { state.shown += PAGE; renderView(true); } }));
    }
  }

  function toolbar(count) {
    const label = state.sort === "easy" ? "Plus faciles d'abord" : "Plus récents d'abord";
    return el("div", { class: "toolbar" },
      el("span", { text: plur(count, "article", "articles") }),
      el("button", { class: "linkbtn", type: "button", text: `Trier : ${label}`, onclick: () => {
        state.sort = state.sort === "easy" ? "new" : "easy";
        store.set("fr.sort", state.sort);
        state.shown = PAGE;
        renderView();
      } }));
  }

  function tipCard() {
    if (state.tipSeen) return null;
    const tip = el("div", { class: "tip glass" },
      el("p", { text: "Touchez un mot pour voir sa traduction en anglais. L'étoile l'enregistre dans Mes mots." }));
    tip.append(el("button", { type: "button", text: "OK", onclick: () => {
      state.tipSeen = true; store.set("fr.tipSeen2", true); tip.remove();
    } }));
    return tip;
  }

  /* ================================================================ näkymät */

  function renderView(keepScroll = false) {
    const view = $("view");
    view.textContent = "";
    if (state.reader) return renderReader(view);
    if (state.tab === "ord") return renderWords(view);
    if (!state.items.length) return;

    const tip = tipCard();
    if (tip) view.append(tip);

    const tab = currentTab();
    if (state.tab === "idag") {
      const daily = pickDaily();
      view.append(dailyPanel(daily));
      for (const item of daily) view.append(cardNode(item));
      view.append(el("h2", { class: "day", text: "Autres articles" }));
      const rest = visibleItems().filter((i) => !daily.includes(i));
      appendList(view, rest);
    } else {
      if (tab.segs) {
        const bar = el("div", { class: "segbar glass", role: "group", "aria-label": "Rubrique" });
        for (const seg of tab.segs) {
          bar.append(el("button", { type: "button", "aria-pressed": String((state.segs[tab.id] || "alla") === seg.id), text: seg.label,
            onclick: () => {
              state.segs[tab.id] = seg.id;
              store.set("fr.segs", state.segs);
              state.shown = PAGE;
              renderView();
              renderStatus();
            } }));
        }
        view.append(bar);
      }
      const list = listFor(tab);
      view.append(toolbar(list.length));
      appendList(view, list);
    }
    markSaved(view);
    if (!keepScroll) closeWord();
  }

  function dailyPanel(daily) {
    const done = daily.filter((i) => state.read.has(i.id)).length;
    const total = Math.max(daily.length, 1);
    const r = 26;
    const c = 2 * Math.PI * r;
    const ring = `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="bg" cx="32" cy="32" r="${r}"/>` +
      `<circle class="fg" cx="32" cy="32" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - done / total)).toFixed(1)}"/>` +
      `<text x="32" y="38" text-anchor="middle">${done}/${daily.length}</text></svg>`;
    const s = streak();
    const text = done >= daily.length && daily.length
      ? "Terminé pour aujourd'hui. Bravo !"
      : `${done} sur ${daily.length} ${done < 2 ? "lu" : "lus"}. Marquez un article comme lu quand vous l'avez fini.`;
    return el("section", { class: "daily glass", "aria-label": "Lecture du jour" },
      el("div", { class: "daily-head", html: ring },
        el("div", {}, el("h2", { text: "Lecture du jour" }), el("p", { text: s ? `${text} ${s} ${s === 1 ? "jour" : "jours"} d'affilée.` : text }))));
  }

  /* ================================================================ Mina ord */

  function renderWords(view) {
    const due = dueWords();
    const head = el("section", { class: "ord-head glass" },
      el("p", { text: state.words.length
        ? "Un mot que vous connaissez revient après des intervalles de plus en plus longs : 1, 2, 4, 8 jours, etc. Un mot oublié revient tout de suite."
        : "Les mots que vous enregistrez apparaissent ici. Touchez un mot dans un article, puis Enregistrer." }));
    const reviewBtn = el("button", { class: "pill primary", type: "button", text: due.length ? `Réviser ${plur(due.length, "mot", "mots")}` : "Rien à réviser", onclick: startReview });
    if (!due.length) reviewBtn.disabled = true;
    head.append(reviewBtn);
    head.append(el("div", { class: "backup" },
      el("button", { class: "pill", type: "button", text: "Sauvegarder", title: "Copier une sauvegarde de Mes mots", onclick: exportWords }),
      el("button", { class: "pill", type: "button", text: "Restaurer", title: "Restaurer une sauvegarde de Mes mots", onclick: importWords })));
    view.append(head);

    if (!state.words.length) return;
    const list = el("div", { class: "card ord-list" });
    for (const w of [...state.words].sort((a, b) => b.t - a.t)) list.append(wordRow(w));
    view.append(list);
  }

  function highlight(sentence, word) {
    const p = el("p", { class: "ctx", lang: "fr" });
    const i = sentence.toLowerCase().indexOf(word.toLowerCase());
    if (i < 0) { p.textContent = sentence; return p; }
    p.append(sentence.slice(0, i), el("b", { text: sentence.slice(i, i + word.length) }), sentence.slice(i + word.length));
    return p;
  }

  function wordRow(w) {
    const dots = el("span", { class: "box-dots", title: "Votre maîtrise du mot" });
    for (let i = 1; i <= 5; i++) dots.append(el("i", { class: (w.box || 0) >= i ? "on" : "" }));
    const row = el("div", { class: "wordrow" },
      el("div", { class: "top" }, el("strong", { lang: "fr", text: w.w }), speakButton(() => w.w, `Écouter « ${w.w} »`),
        el("span", { class: "fi", lang: "en", text: w.fi || "–" }), dots));
    const g = genderOf(w.p);
    const differs = w.l && w.l.toLowerCase() !== w.w.toLowerCase();
    if (differs || g) {
      const line = el("div", { class: "ws-lemma" }, differs ? "forme de base " : "");
      if (g) line.append(el("span", { class: `art g-${g.key}`, text: g.article }), " ");
      line.append(el("b", { lang: "fr", text: w.l || w.w }));
      if (g) line.append(` · ${g.label}`);
      row.append(line);
    }
    if (w.s) row.append(highlight(w.s, w.w));
    const acts = el("div", { class: "acts" },
      el("button", { type: "button", text: "Modifier la traduction", onclick: () => {
        const value = window.prompt(`Traduction de « ${w.w} »`, w.fi || "");
        if (value !== null) { w.fi = value.trim(); saveWords(); renderView(true); }
      } }));
    if (safeUrl(w.u)) acts.append(el("a", { href: w.u, target: "_blank", rel: "noopener", text: "Source" }));
    acts.append(el("button", { class: "del", type: "button", text: "Supprimer", onclick: () => {
      if (!window.confirm(`Supprimer « ${w.w} » de Mes mots ?`)) return;
      state.words = state.words.filter((x) => x !== w);
      saveWords();
      renderView(true);
      renderStatus();
      markSaved(document);
    } }));
    row.append(acts);
    return row;
  }

  async function exportWords() {
    const data = JSON.stringify({ app: "lecture-francais", version: 1, ord: state.words });
    try {
      await navigator.clipboard.writeText(data);
      toast("Sauvegarde copiée dans le presse-papiers");
    } catch {
      window.prompt("Copiez ce texte et gardez-le :", data);
    }
  }
  function importWords() {
    const raw = window.prompt("Collez une sauvegarde :");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const list = Array.isArray(data) ? data : data.ord;
      if (!Array.isArray(list)) throw new Error("format");
      let added = 0;
      for (const w of list) {
        if (!w || typeof w.w !== "string") continue;
        if (findSaved(w.w, w.l)) continue;
        state.words.push({ w: w.w, l: w.l || "", p: w.p || "", fi: w.fi || "", s: w.s || "", u: w.u || "", t: w.t || now(), box: w.box || 0, due: w.due || 0 });
        added += 1;
      }
      saveWords();
      renderView(true);
      renderStatus();
      toast(plur(added, "mot ajouté", "mots ajoutés"));
    } catch {
      toast("Sauvegarde illisible");
    }
  }

  /* ---------- kertaus (Leitner-laatikot) ---------- */

  let queue = [];
  function startReview() {
    queue = dueWords().sort((a, b) => (a.due || 0) - (b.due || 0));
    if (!queue.length) return;
    $("review").classList.add("on");
    document.body.style.overflow = "hidden";
    showCard();
  }
  function endReview() {
    $("review").classList.remove("on");
    document.body.style.overflow = "";
    renderView(true);
    renderStatus();
  }
  function showCard() {
    const box = $("review");
    box.textContent = "";
    const bar = el("div", { class: "overlay-bar" },
      el("button", { class: "pill glass", type: "button", text: "Terminé", onclick: endReview }),
      el("span", { class: "count", text: queue.length ? `encore ${queue.length}` : "" }));
    const inner = el("div", { class: "inner" });
    box.append(bar, inner);
    if (!queue.length) {
      inner.append(el("div", { class: "done-msg" }, el("h2", { text: "Terminé pour aujourd'hui !" }),
        el("p", { text: "Vous avez révisé tous les mots en attente." }),
        el("button", { class: "pill primary", type: "button", text: "Retour", onclick: endReview })));
      return;
    }
    const w = queue[0];
    const answer = el("div", { class: "answer", lang: "en", hidden: "" }, w.fi || "–");
    const btns = el("div", { class: "btns" });
    const reveal = el("button", { class: "pill primary", type: "button", text: "Afficher la traduction", onclick: () => {
      answer.hidden = false;
      btns.textContent = "";
      btns.append(
        el("button", { class: "pill no", type: "button", text: "Je ne savais pas", onclick: () => grade(w, false) }),
        el("button", { class: "pill yes", type: "button", text: "Je savais", onclick: () => grade(w, true) }));
    } });
    btns.append(reveal);
    const card = el("div", { class: "flash glass" }, el("div", { class: "fw-line" }, el("p", { class: "fw", lang: "fr", text: w.w }),
      speakButton(() => w.w, "Écouter le mot")));
    const g = genderOf(w.p);
    if ((w.l && w.l.toLowerCase() !== w.w.toLowerCase()) || g) {
      const line = el("p", { class: "lemma" });
      if (w.l && w.l.toLowerCase() !== w.w.toLowerCase()) line.append("forme de base ");
      if (g) line.append(el("span", { class: `art g-${g.key}`, text: g.article }), " ");
      line.append(w.l || w.w);
      card.append(line);
    }
    if (w.s) card.append(highlight(w.s, w.w));
    card.append(answer, btns);
    inner.append(card);
  }
  function grade(w, ok) {
    queue.shift();
    if (ok) {
      w.box = Math.min((w.box || 0) + 1, REVIEW_DAYS.length - 1);
      w.due = now() + REVIEW_DAYS[w.box] * DAY - 3600;
    } else {
      w.box = 0;
      w.due = now() + 600;
      queue.push(w); // samassa kierroksessa uudelleen
    }
    saveWords();
    showCard();
  }

  /* ================================================================ lukunäkymä */

  // Koko jutun teksti haetaan lukupalvelun kautta vasta, kun avaat jutun. Mitään ei tallenneta julkiselle sivulle.
  const READER = "https://r.jina.ai/";
  const JUNK = /^(publié le|mis à jour|lire aussi|à lire aussi|lire la suite|partager|abonnez-vous|inscrivez-vous|newsletter|crédit photo|photo :|©|vous avez aimé|cet article|ce contenu est bloqué|accepter|en savoir plus|voir aussi|recevez|suivez-nous|par la rédaction|les plus lus|commentaires?)/i;
  const NOISE = "script,style,noscript,template,nav,footer,aside,form,button,select,svg,figure,figcaption,iframe,dialog,video,audio," +
    "[role=navigation],[role=banner],[role=contentinfo],[role=complementary],[role=dialog],[aria-hidden=true],[hidden]";

  function extractArticle(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (/access denied|forbidden|just a moment|attention required/i.test(doc.title)) return null;
    for (const n of doc.querySelectorAll(NOISE)) n.remove();
    for (const n of doc.querySelectorAll("header")) if (!n.closest("article")) n.remove();
    const clean = (n) => (n.textContent || "").replace(/\s+/g, " ").trim();
    const linkChars = (n) => [...n.querySelectorAll("a")].reduce((sum, a) => sum + clean(a).length, 0);

    const blocksOf = (root) => {
      const out = [];
      const seen = new Set();
      let total = 0;
      for (const n of root.querySelectorAll("p, h2, h3, li, blockquote")) {
        const tag = n.tagName;
        if ((tag === "LI" || tag === "BLOCKQUOTE") && n.querySelector("p")) continue;
        const t = clean(n);
        if (!t || seen.has(t) || linkChars(n) / t.length > 0.5) continue;
        seen.add(t);
        if (tag === "H2" || tag === "H3") {
          if (t.length >= 3 && t.length <= 120) out.push(["h", t]);
          continue;
        }
        if (t.length < (tag === "LI" ? 40 : 30) || !t.includes(" ") || !/\p{Ll}/u.test(t) || JUNK.test(t)) continue;
        out.push(["p", t]);
        total += t.length;
        if (total > 15000) break;
      }
      // Väliotsikko jää vain, jos sen jälkeen tulee tekstiä.
      const blocks = out.filter((b, i) => b[0] === "p" || (out[i + 1] && out[i + 1][0] === "p"));
      return { blocks, total };
    };

    const roots = [...doc.querySelectorAll('[itemprop="articleBody"], article, main, [role=main]')];
    if (doc.body) roots.push(doc.body);
    const scored = roots.map((root) => ({ root, ...blocksOf(root) }));
    const max = Math.max(0, ...scored.map((x) => x.total));
    if (max < 200) return null;
    // Tarkin alue, jossa on suurin osa tekstistä (ei koko sivua navigaatioineen).
    const best = scored.find((x) => x.total >= max * 0.6) || scored[scored.length - 1];
    return best.blocks;
  }

  const articleCache = new Map(Object.entries(store.get("fr.art", {})));
  function cacheArticle(id, blocks) {
    articleCache.delete(id);
    articleCache.set(id, { t: now(), b: blocks });
    while (articleCache.size > 40) articleCache.delete(articleCache.keys().next().value);
    store.set("fr.art", Object.fromEntries(articleCache));
  }

  async function fetchArticle(url) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      try {
        const res = await fetch(READER + url, { headers: { "X-Return-Format": "html" }, signal: ctrl.signal });
        if (res.ok) {
          const blocks = extractArticle(await res.text());
          if (blocks) return blocks;
        }
      } catch (err) {
        console.warn(err);
      } finally {
        clearTimeout(timer);
      }
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
    return null;
  }

  function openArticle(item) {
    if (!state.read.has(item.id)) setRead(item, true);
    openReader({ item });
  }
  function openReader(data) {
    if (!state.reader) {
      state.returnTo = { tab: state.tab, y: window.scrollY };
      try { history.pushState({ reader: 1 }, ""); } catch { /* ei historiaa */ }
    }
    state.reader = data;
    closeWord();
    toggleMenu(false);
    markTabs();
    renderHeader();
    renderView();
    window.scrollTo({ top: 0 });
  }
  function closeReader(rerender = true) {
    state.reader = null;
    const back = state.returnTo;
    state.returnTo = null;
    closeWord();
    markTabs();
    if (rerender) {
      renderHeader();
      renderView();
      if (back) window.scrollTo({ top: back.y });
    }
  }
  function leaveReader() {
    if (history.state && history.state.reader) history.back();
    else closeReader();
  }
  window.addEventListener("popstate", () => {
    if (state.reader && !(history.state && history.state.reader)) closeReader();
  });

  function renderReader(view) {
    const r = state.reader;
    const bar = el("div", { class: "toolbar" },
      el("button", { class: "linkbtn", type: "button", text: "‹ Retour", onclick: leaveReader }));
    view.append(bar);
    if (r.item) return renderItemReader(view, bar, r.item);
    bar.append(el("span"));
    if (r.paste) {
      const ta = el("textarea", { lang: "fr", placeholder: "Collez un texte en français ici…", "aria-label": "Texte à lire" });
      const box = el("section", { class: "reader-article paste" },
        el("h2", { text: "Lire mon texte" }),
        el("p", { text: "Copiez un texte depuis un article, un livre ou un e-mail et collez-le ici. Vous pourrez ensuite toucher chaque mot." }),
        ta,
        el("button", { class: "pill primary", type: "button", text: "Lire avec le dictionnaire", onclick: () => {
          const text = ta.value.trim();
          if (!text) { ta.focus(); return; }
          const paras = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);
          state.reader = { p: paras, own: true };
          renderHeader();
          renderView();
        } }));
      view.append(box);
      return;
    }
    const article = el("article", { class: "reader-article" });
    for (const p of r.p || []) article.append(wordify(String(p).normalize("NFC"), el("p", { class: "rp", lang: "fr" })));
    view.append(article);
    markSaved(view);
    loadOrdbok();
  }

  function renderItemReader(view, bar, item) {
    const source = state.sources.find((s) => s.id === item.source);
    const link = safeUrl(item.link) || "";
    const host = hostOf(link);
    if (link) bar.append(el("a", { class: "linkbtn", href: link, target: "_blank", rel: "noopener", text: "Original ↗" }));

    const article = el("article", { class: `reader-article cat-${item.category}`, "data-link": link, "data-src": source ? source.name : host });
    const meta = el("div", { class: "meta" }, el("span", { class: "src" }, el("i"), source ? source.name : host));
    if (item.level) meta.append(el("span", { class: `lvl l${item.level}` }, el("i"), el("i"), el("i"), el("b", { text: LEVEL[item.level] })));
    meta.append(el("time", { datetime: item.published, text: ago(item.ts) }));
    article.append(meta, wordify(item.title.normalize("NFC"), el("h1", { lang: "fr" })));
    const img = safeUrl(item.image);
    if (img && img.startsWith("https://")) {
      const im = el("img", { class: "rimg", src: img, alt: "", decoding: "async", referrerpolicy: "no-referrer" });
      im.addEventListener("error", () => im.remove());
      article.append(im);
    }
    const body = el("div", { class: "rbody" });
    article.append(body);
    if (link) article.append(el("a", { class: "src-link", href: link, target: "_blank", rel: "noopener", text: `Lire l'original sur ${host} ↗` }));
    view.append(article);

    const showBlocks = (blocks) => {
      if (activeWord && body.contains(activeWord)) closeWord();
      body.textContent = "";
      for (const [type, text] of blocks) {
        body.append(wordify(text.normalize("NFC"), type === "h" ? el("h2", { class: "rh", lang: "fr" }) : el("p", { class: "rp", lang: "fr" })));
      }
      markSaved(body);
    };
    loadOrdbok();
    const cached = articleCache.get(item.id);
    if (cached) { showBlocks(cached.b); return; }

    if (item.summary) body.append(wordify(item.summary.normalize("NFC"), el("p", { class: "rp lead", lang: "fr" })));
    const status = el("p", { class: "rstatus" }, el("span", { class: "spin", "aria-hidden": "true" }), "Chargement de l'article complet…");
    body.append(status);
    markSaved(body);
    if (!link) { status.remove(); return; }
    fetchArticle(link).then((blocks) => {
      if (!state.reader || state.reader.item !== item) return;
      if (blocks) {
        cacheArticle(item.id, blocks);
        showBlocks(blocks);
        return;
      }
      status.textContent = "";
      status.classList.add("fail");
      status.append(`Impossible de charger l'article complet pour le moment. Lisez le résumé ici avec le dictionnaire, ou l'article complet sur ${host}.`);
      body.append(el("a", { class: "pill primary", href: link, target: "_blank", rel: "noopener", text: `Ouvrir l'article sur ${host}` }));
    });
  }
  function hostOf(u) {
    try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; }
  }

  /* ================================================================ sanakupla */

  const sheet = $("wordSheet");
  let activeWord = null;
  let anchor = null;
  let side = "below";
  let openToken = 0;
  sheet.addEventListener("click", (e) => e.stopPropagation());

  function placeSheet(first = false) {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const w = sheet.offsetWidth;
    const h = sheet.offsetHeight;
    const topLimit = 72;
    const bottomLimit = window.innerHeight - 96;
    if (first) {
      const need = Math.max(h, 240);
      side = r.bottom + 10 + need <= bottomLimit || r.top - 10 - need < topLimit ? "below" : "above";
    }
    const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, vw - w - 12));
    let top = side === "below" ? r.bottom + 10 : r.top - 10 - h;
    // Lukunäkymässä (oma vieritys) sivua ei voi vierittää: pidetään kupla kokonaan ruudulla.
    if (document.querySelector(".overlay.on")) {
      top = h <= bottomLimit - topLimit ? Math.min(Math.max(top, topLimit), bottomLimit - h) : topLimit;
    }
    sheet.style.left = `${Math.round(left + window.scrollX)}px`;
    sheet.style.top = `${Math.round(top + window.scrollY)}px`;
    sheet.style.transformOrigin = `${Math.round(r.left + r.width / 2 - left)}px ${side === "below" ? "0" : "100%"}`;
    const regionTop = Math.min(r.top, top);
    const regionBottom = Math.max(r.bottom, top + h);
    let delta = 0;
    if (regionBottom > bottomLimit) delta = regionBottom - bottomLimit + 8;
    if (regionTop - delta < topLimit) delta = regionTop - topLimit - 8;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: reduceMotion ? "auto" : "smooth" });
  }
  window.addEventListener("resize", () => placeSheet());

  function closeWord() {
    if (activeWord) activeWord.classList.remove("on");
    for (const sp of document.querySelectorAll(".w.phr")) sp.classList.remove("phr");
    activeWord = null;
    anchor = null;
    sheet.classList.remove("on");
    sheet.setAttribute("aria-hidden", "true");
  }

  /* ---------- suku ja taivutus ---------- */

  /** "nom f." -> { key: "f", article: "une", label: "nom féminin" } */
  function genderOf(pos) {
    if (!pos || !pos.startsWith("nom") || pos.startsWith("nom propre")) return null;
    if (pos.includes("m./f.")) return { key: "mf", article: "un, une", label: "nom masculin ou féminin" };
    if (pos.includes("f.")) return { key: "f", article: "une", label: "nom féminin" };
    if (pos.includes("m.")) return { key: "m", article: "un", label: "nom masculin" };
    return null;
  }

  const TENSES = [
    ["ipre", "présent"], ["ppas", "participe passé"], ["iimp", "imparfait"], ["ifut", "futur"],
    ["cond", "conditionnel"], ["spre", "subjonctif"], ["impe", "impératif"], ["ppre", "participe présent"],
    ["ipsi", "passé simple"], ["simp", "subjonctif imparfait"],
  ];
  const PERSONS = { "1sg": "je", "2sg": "tu", "3sg": "il, elle, on", "1pl": "nous", "2pl": "vous", "3pl": "ils, elles" };
  const LITERARY_TENSES = new Set(["ipsi", "simp"]); // ei mainita "aussi"-listassa
  const AGREE = (tags) => {
    const fem = tags.includes("fem"), pl = tags.includes("pl");
    return fem && pl ? "féminin pluriel" : fem ? "féminin" : pl ? "pluriel" : "";
  };

  /** Dicollecten tagit luettavaksi: ["ipre spre 1sg 3sg", "impe 2sg"] -> "présent · je, il, elle, on (aussi subjonctif, impératif)" */
  function describeForm(groups, isVerb) {
    if (!groups || !groups.length) return "";
    const parsed = groups.map((g) => g.split(" "));
    if (!isVerb) return AGREE(parsed[0]);
    const tensesOf = (tags) => TENSES.filter(([k]) => tags.includes(k));
    const first = parsed[0];
    const [main] = tensesOf(first);
    if (!main) return "";
    let text = main[1];
    if (main[0] === "ppas") {
      const agree = AGREE(first);
      if (agree) text += ` · ${agree}`;
    } else {
      const persons = Object.keys(PERSONS).filter((p) => first.includes(p)).map((p) => PERSONS[p]);
      if (persons.length) text += ` · ${persons.join(" / ")}`;
    }
    const others = [];
    for (const tags of parsed) {
      for (const [k, label] of tensesOf(tags)) {
        if (k !== main[0] && !LITERARY_TENSES.has(k) && !others.includes(label)) others.push(label);
      }
    }
    if (others.length) text += ` (aussi ${others.slice(0, 2).join(", ")})`;
    return text;
  }

  function freqBadge(word, lemma) {
    if (!ordbok) return null;
    const z = Math.max(ordbok.zipf(word) || 0, lemma ? ordbok.zipf(lemma) || 0 : 0);
    if (!z) return el("span", { class: "ws-freq rare", text: "mot rare" });
    if (z >= 4.5) return el("span", { class: "ws-freq common", text: "mot courant" });
    if (z >= 3.2) return el("span", { class: "ws-freq mid", text: "assez courant" });
    return el("span", { class: "ws-freq rare", text: "mot rare" });
  }

  /** Suomennoksen sanavartalo vertailua varten: "olla (jollakin)" -> ["olla"], "-ssa" ohitetaan. */
  const EN_STOP = new Set("with from that this which into onto something someone somebody used being have been about upon their them other more most some very when what where thing things also such than then make made over under".split(" "));
  const enNorm = (w) => w.replace(/is(e|es|ed|ing|ation|ations)$/, "iz$1").replace(/our$/, "or");
  function fiStems(fi) {
    const out = [];
    for (const phrase of fi) {
      for (const part of phrase.replace(/\([^)]*\)/g, " ").toLowerCase().split(/[\s,]+/)) {
        const w = enNorm(part.replace(/[^\p{L}]/gu, ""));
        if (w.length >= 4 && !EN_STOP.has(w)) out.push(w.slice(0, Math.max(4, Math.ceil(w.length * 0.75))));
      }
    }
    return out;
  }
  /** Minkä merkityksen käännös löytyy virkkeen käännöksestä? -1 jos ei minkään. */
  function senseInTranslation(senses, translation) {
    if (!translation || senses.length < 2) return -1;
    const words = translation.toLowerCase().split(/[^\p{L}-]+/u).filter(Boolean).map(enNorm);
    for (let i = 0; i < senses.length; i++) {
      if (fiStems(senses[i][0]).some((stem) => words.some((w) => w.startsWith(stem)))) return i;
    }
    return -1;
  }
  function sensesList(senses, hit = -1) {
    const order = senses.map((s, i) => i);
    if (hit > 0) order.splice(order.indexOf(hit), 1) && order.unshift(hit);
    const ol = el("ol", { class: `ws-senses${senses.length === 1 ? " single" : ""}` });
    for (const i of order) {
      const [fi, def] = senses[i];
      const li = el("li", { lang: "en", class: i === hit ? "ctx-hit" : null }, fi.join(", "));
      if (i === hit) li.append(el("span", { class: "ctx-tag", lang: "fr", text: "dans cette phrase" }));
      if (def) li.append(el("small", { lang: "fr", text: def }));
      ol.append(li);
    }
    return ol;
  }
  function phraseBox(found) {
    const box = el("div", { class: "ws-phrase" });
    for (const ph of found) {
      box.append(el("div", { class: "ph-head" }, el("span", { class: "ph-label", text: "Expression" }), el("b", { lang: "fr", text: ph.show }),
        speakButton(() => ph.show, "Écouter l'expression")));
      const ul = el("ul");
      for (const [fi, note] of ph.s.slice(0, 3)) {
        const li = el("li", { lang: "en", text: fi.join(", ") });
        if (note) li.append(el("small", { lang: "fr", text: note }));
        ul.append(li);
      }
      box.append(ul);
    }
    return box;
  }
  function markPhrase(spans, from, to) {
    for (const sp of document.querySelectorAll(".w.phr")) sp.classList.remove("phr");
    for (let k = from; k <= to; k++) if (spans[k]) spans[k].classList.add("phr");
  }

  async function openWord(word, ctx, isPhrase = false) {
    const token = ++openToken;
    sheet.textContent = "";
    const close = el("button", { class: "x", type: "button", "aria-label": "Fermer", onclick: closeWord,
      html: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg>' });
    const lemmaLine = el("div", { class: "ws-lemma" });
    const gramLine = el("div", { class: "ws-gram", hidden: "" });
    // Heittomerkkiin päättyvä sana luetaan yhdessä seuraavan kanssa (l' + homme -> l'homme).
    const spoken = () => {
      const next = ctx.words && ctx.index >= 0 ? ctx.words[ctx.index + 1] : "";
      return /['’]$/.test(word) && next ? word + next : word;
    };
    const wordLine = el("div", { class: "ws-wordline" }, el("div", { class: "ws-word", lang: "fr", text: word }),
      isPhrase ? null : speakButton(spoken, "Écouter le mot"));
    sheet.append(el("div", { class: "ws-head" }, el("div", {}, wordLine, lemmaLine, gramLine), close));
    const content = el("div");
    const mt = el("div", { class: "ws-mt", hidden: "" });
    const actions = el("div", { class: "ws-actions" });
    sheet.append(content, mt, actions);

    const showMt = async (text, kind) => {
      mt.hidden = false;
      mt.textContent = "";
      if (kind === "s" && text !== word) mt.append(el("p", { class: "sv", lang: "fr", text }));
      const fi = el("p", { class: "fi", lang: "en", text: "Traduction…" });
      const by = el("small", { text: "Traduction automatique" });
      mt.append(fi, by);
      placeSheet();
      try {
        const res = await translate(text, kind);
        if (token !== openToken) return null;
        fi.textContent = res.text;
        by.textContent = `Traduction automatique (${res.by})`;
        placeSheet();
        return res.text;
      } catch {
        fi.textContent = "Traduction indisponible pour le moment. Essayez Google.";
        placeSheet();
        return null;
      }
    };

    // Tallennus Mina ordiin
    let lemma = "";
    let posForSave = "";
    let fiForSave = "";
    const star = el("button", { class: "pill star", type: "button" });
    const paintStar = () => {
      const saved = findSaved(word, lemma);
      star.classList.toggle("on", !!saved);
      star.innerHTML = svg("ord", saved ? 'fill="currentColor"' : "");
      star.append(saved ? "Enregistré" : "Enregistrer");
    };
    star.addEventListener("click", () => {
      const saved = findSaved(word, lemma);
      if (saved) {
        state.words = state.words.filter((w) => w !== saved);
        toast("Retiré de Mes mots");
      } else {
        state.words.push({ w: word, l: lemma, p: posForSave, fi: fiForSave, s: ctx.sentence || "", u: ctx.link || "", t: now(), box: 0, due: 0 });
        toast("Enregistré dans Mes mots");
      }
      saveWords();
      paintStar();
      markSaved(document);
      if (state.tab === "ord" && !state.reader) renderView(true);
      renderStatus();
    });

    if (!isPhrase) actions.append(star);
    let refreshSenses = null;
    if (ctx.sentence && !isPhrase) {
      const btn = el("button", { class: "pill primary", type: "button", text: "Traduire la phrase" });
      btn.addEventListener("click", async () => {
        btn.hidden = true;
        const text = await showMt(ctx.sentence, "s");
        if (text && refreshSenses) refreshSenses(text);
      });
      actions.append(btn);
    }
    if (ctx.sentence && !isPhrase && canSpeak) {
      actions.append(el("button", { class: "pill quiet", type: "button", html: svg("speak"),
        onclick: () => speak(ctx.sentence, 0.85) }, "Écouter la phrase"));
    }
    actions.append(el("a", { class: "pill quiet", target: "_blank", rel: "noopener", text: "Google",
      href: `https://translate.google.com/?sl=fr&tl=en&op=translate&text=${encodeURIComponent(isPhrase ? word : (ctx.sentence || word))}` }));

    placeSheet(true);
    sheet.classList.add("on");
    sheet.setAttribute("aria-hidden", "false");

    if (isPhrase) {
      lemmaLine.textContent = "Texte sélectionné";
      showMt(word, "s");
      return;
    }

    paintStar();
    const own = findSaved(word, "");
    if (own && own.fi) content.append(el("div", { class: "ws-own", lang: "en" }, own.fi, el("small", { text: "Votre traduction dans Mes mots" })));
    const loading = el("p", { class: "ws-lemma", text: "Recherche…" });
    content.append(loading);
    placeSheet();
    const dict = await loadOrdbok();
    if (token !== openToken) return;
    loading.remove();
    if (!dict) {
      lemmaLine.textContent = "impossible de charger le dictionnaire";
      fiForSave = (await showMt(word, "w")) || "";
      paintStar();
      return;
    }
    let phraseSave = "";
    if (ctx.words && ctx.index >= 0) {
      const found = dict.phrasesAt(ctx.words, ctx.index);
      if (found.length) {
        content.append(phraseBox(found));
        markPhrase(ctx.spans, found[0].from, found[0].to);
        const ph = found[0];
        if (ph.s[0]) phraseSave = `${ph.s[0][0].slice(0, 2).join(", ")} (${ph.show})`;
      }
    }
    await loadMt();
    if (token !== openToken) return;
    const sentenceFi = (ctx.sentence && (mtData.s[ctx.sentence] || mmCache.get(ctx.sentence.slice(0, 450)))) || "";
    const hit = dict.lookup(word);
    if (hit && hit.type === "word") {
      const [first, second] = hit.entries;
      lemma = first.l;
      posForSave = first.p || "";
      const isVerb = (first.p || "").startsWith("verbe");
      const tags = dict.grammar(word, first.l);
      let g = genderOf(first.p);
      let isBase = first.l.toLowerCase() === word.toLowerCase();
      let shown = first.l;
      let gram = describeForm(tags, isVerb);
      // Feminiininen muoto, jonka perusmuoto on maskuliini (autrice -> auteur): näytetään sana itse feminiininä.
      const fem = !isVerb && tags.some((t) => t.split(" ").includes("fem"));
      if (g && g.key === "m" && fem) {
        g = { key: "f", article: "une", label: "nom féminin" };
        gram = `féminin de ${first.l}` + (tags.some((t) => t.split(" ").includes("pl")) ? " · pluriel" : "");
        shown = word;
        isBase = true;
        posForSave = "nom f.";
      }
      if (g && g.key === "f") gram = gram.replace(/^féminin(?! de) ?/, "");  // une émission: "pluriel" riittää
      if (!isBase) lemmaLine.append("forme de base ");
      if (g) lemmaLine.append(el("span", { class: `art g-${g.key}`, text: g.article }), " ");
      if (!isBase || g) lemmaLine.append(el("b", { lang: "fr", text: shown }));
      const posText = g ? g.label : first.p;
      if (posText) lemmaLine.append(isBase && !g ? posText : ` · ${posText}`);
      if (gram) { gramLine.textContent = gram; gramLine.hidden = false; }
      const badge = freqBadge(word, first.l);
      if (badge) lemmaLine.append(" ", badge);
      const senses = first.s.slice(0, 4);
      const pickSave = (i) => {
        const sense = senses[i >= 0 ? i : 0];
        fiForSave = phraseSave || (sense ? sense[0].slice(0, 3).join(", ") : "");
      };
      const hitNow = senseInTranslation(senses, sentenceFi);
      let list = sensesList(senses, hitNow);
      content.append(list);
      refreshSenses = (fiText) => {
        const i = senseInTranslation(senses, fiText);
        const fresh = sensesList(senses, i);
        list.replaceWith(fresh);
        list = fresh;
        pickSave(i);
        placeSheet();
      };
      pickSave(hitNow);
      if (second) {
        content.append(el("p", { class: "ws-also" }, "Peut aussi être ", el("b", { lang: "fr", text: second.l }),
          `: ${second.s.slice(0, 2).map((s) => s[0].join(", ")).join("; ")}`));
      }
    } else if (hit && hit.type === "compound") {
      lemmaLine.append("mot composé");
      const badge = freqBadge(word, "");
      if (badge) lemmaLine.append(" ", badge);
      const dl = el("dl", { class: "ws-parts" });
      for (const part of hit.parts) {
        dl.append(el("div", {}, el("dt", { lang: "fr", text: part.l }),
          el("dd", { lang: "en", text: part.s.slice(0, 2).map((x) => x[0].slice(0, 3).join(", ")).join("; ") })));
      }
      content.append(dl);
      fiForSave = hit.parts.map((p) => (p.s[0] ? p.s[0][0][0] : "")).join(" + ");
      // Konekäännös antaa koko sanalle luontevamman suomennoksen.
      await loadMt();
      if (token !== openToken) return;
      const whole = mtData.w[word.toLowerCase()];
      if (whole) {
        content.append(el("div", { class: "ws-own", lang: "en" }, whole, el("small", { text: "Mot entier, traduction automatique (OPUS-MT)" })));
        fiForSave = whole;
      }
    } else {
      lemmaLine.textContent = "absent du dictionnaire";
      fiForSave = (await showMt(word, "w")) || "";
    }
    paintStar();
    placeSheet();
  }

  document.addEventListener("click", (e) => {
    const w = e.target.closest && e.target.closest(".w");
    if (w) {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim().includes(" ")) return;
      if (activeWord) activeWord.classList.remove("on");
      activeWord = w;
      anchor = w;
      w.classList.add("on");
      const container = w.closest("[data-text]");
      const holder = w.closest("[data-link]");
      const spans = container ? [...container.querySelectorAll(".w")] : [w];
      const ctx = {
        sentence: container ? sentenceAt(container.textContent, Number(w.dataset.o)) : "",
        link: holder ? holder.dataset.link : "",
        spans,
        words: spans.map((x) => x.textContent.toLowerCase().replace(/’/g, "'")),
        index: spans.indexOf(w),
      };
      openWord(w.textContent, ctx);
      return;
    }
    if (sheet.classList.contains("on") && !sheet.contains(e.target)) closeWord();
  });

  // Usean sanan maalaus (pitkä painallus) kääntää koko valinnan.
  let selTimer = 0;
  document.addEventListener("selectionchange", () => {
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().replace(/\s+/g, " ").trim();
      const node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
      if (!node || !node.closest("[data-text]") || !text.includes(" ") || text.length > 400) return;
      if (activeWord) activeWord.classList.remove("on");
      activeWord = null;
      anchor = sel.getRangeAt(0).cloneRange();
      openWord(text, {}, true);
    }, 450);
  });

  /* ================================================================ valikko */

  const menu = $("menu");
  function toggleMenu(open) {
    const on = open ?? !menu.classList.contains("on");
    menu.classList.toggle("on", on);
    menu.setAttribute("aria-hidden", String(!on));
    $("menuBtn").setAttribute("aria-expanded", String(on));
    if (on) closeWord();
  }
  $("menuBtn").addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(); });
  document.addEventListener("pointerdown", (e) => {
    if (menu.classList.contains("on") && !menu.contains(e.target) && !$("menuBtn").contains(e.target)) toggleMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeWord(); toggleMenu(false); }
  });

  function setHideRead(value) {
    state.hideRead = value;
    $("hideRead").checked = value;
    store.set("fr.hideRead", value);
    state.shown = PAGE;
    renderView();
  }
  $("hideRead").addEventListener("change", (e) => setHideRead(e.target.checked));

  function setSize(size) {
    state.size = size;
    store.set("fr.size", size);
    document.documentElement.dataset.size = size;
    for (const b of $("sizes").querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.size === size));
  }
  $("sizes").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) setSize(b.dataset.size);
  });

  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const t = store.get("fr.theme", "auto");
    const dark = t === "dark" || (t === "auto" && darkQuery.matches);
    const root = document.documentElement;
    root.dataset.theme = t;
    root.dataset.scheme = dark ? "dark" : "light";
    for (const b of $("themes").querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.theme === t));
    $("themeColor").setAttribute("content", getComputedStyle(root).getPropertyValue("--wall").trim());
    renderHeader();
  }
  $("themes").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    store.set("fr.theme", b.dataset.theme);
    applyTheme();
  });
  if (darkQuery.addEventListener) darkQuery.addEventListener("change", applyTheme);

  $("pasteBtn").addEventListener("click", () => { toggleMenu(false); openReader({ paste: true }); });
  function renderSources() {
    const list = $("srcList");
    list.textContent = "";
    for (const s of state.sources) {
      const site = safeUrl(s.site);
      const name = site ? el("a", { href: site, target: "_blank", rel: "noopener", text: s.name }) : s.name;
      const sw = el("input", { class: "switch", type: "checkbox", role: "switch", "aria-label": `Afficher ${s.name}` });
      sw.checked = !state.hiddenSources.has(s.id);
      sw.addEventListener("change", () => {
        if (sw.checked) state.hiddenSources.delete(s.id);
        else state.hiddenSources.add(s.id);
        store.set("fr.hiddenSources", [...state.hiddenSources]);
        state.daily = null;
        renderView();
        renderStatus();
      });
      list.append(el("div", { class: `row srcrow cat-${s.category}` },
        el("span", { class: "src" }, el("i"), name),
        el("span", { class: `st${s.ok ? "" : " bad"}`, text: s.ok ? plur(s.count, "article", "articles") : "ne fonctionne pas" }),
        sw));
    }
    const ok = state.sources.filter((s) => s.ok).length;
    $("srcHead").textContent = `Sources : ${ok} sur ${state.sources.length} fonctionnent`;

    const reddit = $("redditList");
    reddit.textContent = "";
    $("redditGroup").hidden = !state.reddit.length;
    for (const r of state.reddit) {
      const a = el("a", { class: "rlink", href: r.url, target: "_blank", rel: "noopener" },
        el("span", { class: "ic", html: svg("reddit") }),
        el("div", {}, el("strong", { text: r.name }), r.about ? el("span", { text: r.about }) : null));
      reddit.append(a);
    }
  }

  /* ================================================================ pikkuotsikko */

  new IntersectionObserver(([entry]) => {
    $("compact").classList.toggle("on", !entry.isIntersecting);
  }, { rootMargin: "-60px 0px 0px 0px" }).observe($("title"));

  /* ================================================================ käynnistys */

  async function load() {
    setSize(state.size);
    $("hideRead").checked = state.hideRead;
    renderTabs();
    markTabs();
    applyTheme();
    try {
      const res = await fetch("feed.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.items = Array.isArray(data.items) ? data.items : [];
      state.sources = Array.isArray(data.sources) ? data.sources : [];
      state.reddit = Array.isArray(data.reddit) ? data.reddit.filter((r) => safeUrl(r.url)) : [];
      state.generatedTs = Date.parse(data.generated) / 1000 || now();
      renderHeader();
      renderView();
      renderSources();
    } catch (err) {
      console.error(err);
      if (!state.reader) {
        const status = $("status");
        status.classList.add("stale");
        status.textContent = "Impossible de charger le fil. Vérifiez la connexion, ou lancez le workflow « Mettre à jour le fil » dans l'onglet Actions sur GitHub.";
        if (state.tab === "ord") renderView();
      }
    }
    requestAnimationFrame(moveLens);
    setTimeout(() => { loadOrdbok(); loadMt(); }, 1200);
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }
  load();
})();
