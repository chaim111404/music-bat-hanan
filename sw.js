const V = 'strata-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/audio/')) {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(url.pathname); if (hit) return hit;
      const res = await fetch(req); if (res.ok && res.status === 200) c.put(url.pathname, res.clone()); return res;
    }));
    return;
  }
  if (url.origin.includes('fonts.g')) {
    e.respondWith(caches.open(V).then(async c => { const hit = await c.match(req); const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; }));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { if (r.ok) caches.open(V).then(c => c.put(req, r.clone())); return r; }).catch(() => caches.match(req).then(h => h || caches.match('/index.html'))));
  }
});
