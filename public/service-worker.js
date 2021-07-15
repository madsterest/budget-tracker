const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch((err) => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  event.respondWith(
    //Going to check the caches our service worker has created. If the request matches what is saved in our cache, it will use that. If not, it will do a fetch request with the request
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
