const VERSION = 1;

const STATIC_ASSETS = [
  '/',
  '/css/master.css',
  '/js/app.js',
  '/imgs/pwa.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(

    caches.open(`static-${VERSION}`)
      .then(cache => {
        cache.addAll(STATIC_ASSETS)
      })
      .then(_ => {
        return self.skipWaiting()
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('fetch', event => {
  const includes = Array.prototype.includes.bind(event.request.url);
  if (includes('localhost:8080') && !includes('partial') && !includes('.')) {
    return event.respondWith(caches.match(new Request('http://localhost:8080')));
  }

  const cacheResponse = caches.match(event.request);
  const networkResponse = fetch(event.request);
  const copiedResponse = networkResponse.then(response => response.clone());

  const returnPromise = Promise.race([cacheResponse, networkResponse])
      .then(response => response || networkResponse)
      .catch(response => cacheResponse)
      .then(response => response || new Response(null, {status: 404}));

  event.respondWith(returnPromise);

  event.waitUntil(
  caches.open(`static-${VERSION}`)
    .then(cache => {
      copiedResponse.then(response => {
        cache.put(event.request, response);
      });
    })
  );
});
