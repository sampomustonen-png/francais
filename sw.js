/* Offline-tila. GitHub Actions korvaa __BUILD__-merkinnän ajon numerolla,
   jolloin jokainen julkaisu saa oman välimuistinsa. Nimissä on fr-etuliite, koska
   ruotsin sovellus on samassa osoitteessa (sampomustonen-png.github.io) ja
   välimuistit ovat yhteisiä: kumpikin sovellus siivoaa vain omansa. */
const VERSION = "__BUILD__";
const SHELL = `fr-shell-${VERSION}`;
const DATA = "fr-data-v1";

const SHELL_FILES = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "ordbok.js",
  "manifest.webmanifest",
  "assets/apple-touch-icon.png",
  "assets/icon-192.png",
];
// Nämä muuttuvat joka ajossa: ensin verkosta, ilman verkkoa viimeisin tallennettu.
const DATA_FILES = ["feed.json", "ordbok.json", "oversattning.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("fr-shell-") && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(DATA);
  try {
    const fresh = await fetch(request, { cache: "no-cache" });
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL);
  const cached = await cache.match(request, { ignoreSearch: true });
  const update = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  if (cached) return cached;
  const fresh = await update;
  if (fresh) return fresh;
  if (request.mode === "navigate") {
    const index = await cache.match("index.html");
    if (index) return index;
  }
  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // kuvat ja käännöspalvelu suoraan verkosta
  const name = url.pathname.split("/").pop();
  if (DATA_FILES.includes(name)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
