const CACHE_NAME = "ctc-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./icon.png"
];

// 설치 단계: 캐시 저장
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("캐시 저장 완료");
      return cache.addAll(urlsToCache);
    })
  );
});

// 활성화 단계: 오래된 캐시 정리
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log("오래된 캐시 삭제:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// 요청 가로채기: 캐시 우선 + 네트워크 응답 캐싱
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});