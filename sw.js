// Service worker Warung Mahrev: aplikasi bisa dibuka tanpa internet.
// Ubah VERSI setiap kali Anda mengganti file, supaya cache lama diganti.
const VERSI = "mahrev-v2";
const FILES = ["./", "index.html", "data.js", "app.js", "sync.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Ambil dari cache dulu (cepat & offline), perbarui diam-diam dari jaringan.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => {
      if (r.ok) caches.open(VERSI).then(c => c.put(e.request, r.clone()));
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
