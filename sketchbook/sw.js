// Offline support: app files are cached on first visit; the page itself is refreshed from the network when online.
const CACHE = "sketchbook-v9";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const put = res => { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, { cache: "no-cache" }).then(put).catch(() => caches.match(req).then(r => r || caches.match("./"))));
    return;
  }
  // everything else (fonts, icons): cache first, fill the cache as we go
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(put)));
});
