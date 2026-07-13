/* CliniCals service worker — caches the app shell and static asset bundles
   (which include the clinical pathway engines and reference data) so core
   clinical content remains accessible when the app is offline. */
const CACHE = 'clinicals-core-v1';
const CORE = ['/', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept cross-origin or API/auth traffic
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api')) return;
  // Never intercept dev-server module requests (Vite preview sandbox)
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/@') || url.pathname.startsWith('/node_modules/')) return;

  // App navigation: network first, fall back to the cached shell when offline
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Static assets (JS bundles with clinical engines/pathways, CSS, fonts, images):
  // stale-while-revalidate — instant from cache, refreshed in the background.
  if (url.pathname.startsWith('/assets/') || /\.(js|css|woff2?|ttf|png|jpe?g|svg|webp|ico|json)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
