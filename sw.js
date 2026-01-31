const CACHE_NAME = "ds-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./icon.png",
  "./database.json"
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
  const url = new URL(event.request.url);

  // chrome-extension:// 같은 지원되지 않는 스킴은 캐시하지 않음
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          // http/https 요청만 캐시에 저장
          if (event.request.url.startsWith("http")) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});