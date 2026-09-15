const CACHE_NAME = 'talent2task-offline-v4';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/sql-wasm.js',
  '/sql-wasm.wasm',
  '/offline.html'
];

// Offline fallback tile for OpenStreetMap (256x256 SVG radar grid)
const OFFLINE_TILE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#f8fafc" />
  <path d="M 0 0 L 256 0 L 256 256 L 0 256 Z" fill="none" stroke="#e2e8f0" stroke-width="1"/>
  <circle cx="128" cy="128" r="64" fill="none" stroke="#e0f2fe" stroke-width="1.5" stroke-dasharray="4,4"/>
  <circle cx="128" cy="128" r="110" fill="none" stroke="#e0f2fe" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="128" y1="0" x2="128" y2="256" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="0" y1="128" x2="256" y2="128" stroke="#f1f5f9" stroke-width="1"/>
  <text x="128" y="132" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle" font-weight="700" letter-spacing="1">OFFLINE RADAR</text>
</svg>
`.trim();

// Helper to safely cache a response
function safeCachePut(cache, request, response) {
  try {
    const url = new URL(request.url);
    if (!url.protocol.startsWith('http')) return;
    if (response && response.status === 200 && response.type !== 'opaque') {
      cache.put(request, response.clone()).catch(() => {});
    }
  } catch {}
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Precache Core App Shell
      await cache.addAll(APP_SHELL).catch((err) => {
        console.warn('App shell partial precache notice:', err);
      });

      // 2. Automatically discover and precache hashed assets from index.html
      try {
        const indexRes = await fetch('/index.html');
        if (indexRes.ok) {
          const html = await indexRes.text();
          const assetMatches = html.match(/(src|href)="(\/assets\/[^"]+)"/g);
          if (assetMatches) {
            const assetUrls = assetMatches.map(m => m.split('"')[1]);
            await Promise.all(assetUrls.map(u => cache.add(u).catch(() => {})));
          }
        }
      } catch (err) {
        console.warn('Dynamic asset discovery notice:', err);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Only delete older talent2task caches, preserve third-party (transformers-cache, onnx)
          if (key.startsWith('talent2task-') && key !== CACHE_NAME) {
            return caches.delete(key).catch(() => {});
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Ignore non-http schemes (chrome-extension, blob, etc.)
  if (!url.protocol.startsWith('http')) return;

  // 1. OpenStreetMap Tile Requests -> SVG Radar Fallback
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, event.request, response));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response(OFFLINE_TILE_SVG, {
            headers: { 'Content-Type': 'image/svg+xml' }
          });
        })
    );
    return;
  }

  // 2. Fonts & External CDNs -> Cache first with network fallback
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, event.request, response));
            }
            return response;
          })
          .catch(() => new Response('', { status: 200 }));
      })
    );
    return;
  }

  // 3. Static Assets, Scripts, Styles, Images, WASM (Stale-While-Revalidate)
  const isStaticAsset = (
    url.pathname.endsWith('.wasm') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.mjs') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.includes('/assets/') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.includes('/@fs/')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((fresh) => {
            if (fresh && fresh.ok) {
              caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, event.request, fresh));
            }
            return fresh;
          })
          .catch(() => null);

        if (cached) {
          // Return cached immediately, revalidate in background
          fetchPromise.catch(() => {});
          return cached;
        }

        // Not in cache, wait for network
        return fetchPromise.then((fresh) => {
          if (fresh) return fresh;
          // Return an empty JS/CSS or 404 rather than HTML to prevent syntax errors
          const isScript = url.pathname.endsWith('.js') || url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts');
          if (isScript) {
            return new Response('/* Offline asset not cached */', {
              headers: { 'Content-Type': 'application/javascript' }
            });
          }
          return new Response('Offline asset unavailable', { status: 404 });
        });
      })
    );
    return;
  }

  // 4. HTML Page Navigation (CRITICAL: Only for mode === 'navigate')
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, event.request, response));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const appFallback = (await caches.match('/index.html')) || (await caches.match('/'));
          if (appFallback) return appFallback;
          const offlineFallback = await caches.match('/offline.html');
          return offlineFallback || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // 5. Default fallback for other requests (Network with cache fallback)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => safeCachePut(cache, event.request, response));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return new Response('', { status: 404 });
      })
  );
});
