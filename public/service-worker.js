const CACHE_NAME = "waxtaan-cache-v2";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  // ❌ NE PAS CACHER SOCKET.IO NI API TEMPS RÉEL
  if (
    event.request.url.includes("/socket.io") ||
    event.request.url.includes("ws")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
