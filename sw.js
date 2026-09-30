// Mise en cache pour un fonctionnement hors connexion
const CACHE = 'droite-espace-v2';
const FILES = ['./', 'index.html', 'theorie.html', 'drones.html', 'rayon.html', 'three.min.js', 'OrbitControls.js', 'RoomEnvironment.js', 'manifest.webmanifest', 'icone.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // polices Google : on sert le cache et on met à jour en arrière-plan
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')){
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => { const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; })));
    return;
  }
  // fichiers du site : réseau d'abord (pour recevoir les mises à jour), cache si hors connexion
  if (url.origin === location.origin){
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req, {ignoreSearch:true})));
  }
});
