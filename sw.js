const CACHE = 'jbp-health-v1';
const ASSETS = [
  './',
  './index.html',
  './providers.json',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE && caches.delete(k))))
  );
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if (ASSETS.some(a => url.pathname.endsWith(a.replace('./','/')))){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
    return;
  }
  // Network-first for everything else, fallback to cache if available
  e.respondWith(
    fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
