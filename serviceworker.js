var CACHE_NAME = 'toka-20200904';
var urlsToCache = [
    '/MCAddonSetupManager/',
    '/MCAddonSetupManager/index.html',
    '/MCAddonSetupManager/css/style.css',
    '/MCAddonSetupManager/css/phone.css',
    '/MCAddonSetupManager/css/color.css',
    '/MCAddonSetupManager/css/prism.css',
    '/MCAddonSetupManager/img/chevron-up.svg',
    '/MCAddonSetupManager/img/close.svg',
    '/MCAddonSetupManager/img/error.svg',
    '/MCAddonSetupManager/img/github.svg',
    '/MCAddonSetupManager/img/help.svg',
    '/MCAddonSetupManager/img/homepage.svg',
    '/MCAddonSetupManager/img/icon.webp',
    '/MCAddonSetupManager/img/icon_256.png',
    '/MCAddonSetupManager/img/icon_512.png',
    '/MCAddonSetupManager/img/icon_2000.png',
    '/MCAddonSetupManager/img/icon_apple-touch-icon.png',
    '/MCAddonSetupManager/img/import.svg',
    '/MCAddonSetupManager/img/more.svg',
    "/MCAddonSetupManager/img/share.svg",
    "/MCAddonSetupManager/img/subpacks.svg",
    '/MCAddonSetupManager/img/twitter.svg',
    '/MCAddonSetupManager/img/warning.svg',
    '/MCAddonSetupManager/js/main.js',
    '/MCAddonSetupManager/json/webapp.webmanifest',
    '/MCAddonSetupManager/lib/prism.js',
    '/MCAddonSetupManager/lib/jquery-3.5.1.min.js'
];
var oldCacheKeys = [
  'toka-20200831',
  'pwa-caches'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async function(cache) {
            skipWaiting();
            cache.addAll(urlsToCache);
        })
    );
});
// アクティブ時
self.addEventListener("activate", function (event) {
    event.waitUntil(
      (function () {
        caches.keys().then(function (oldCacheKeys) {
          oldCacheKeys
            .filter(function (key) {
              return key !== CACHE_NAME;
            })
            .map(function (key) {
              return caches.delete(key);
            });
        });
        clients.claim();
      })()
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) return response;
            var fetchRequest = event.request.clone();
            return fetch(fetchRequest).then(function (response) {
            if (!response || response.status !== 200 || response.type !== "basic") {
                return response;
            }
            var responseToCache = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, responseToCache);
            });
            return response;
            });
        })
    );
  });