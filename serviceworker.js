var CACHE_NAME = "toka-20210130";
var urlsToCache = [
  "/MCAddonSetupManager/",
  "/MCAddonSetupManager/index.html",
  "/MCAddonSetupManager/css/color.min.css",
  "/MCAddonSetupManager/css/phone.min.css",
  "/MCAddonSetupManager/css/prism.min.css",
  "/MCAddonSetupManager/css/style.min.css",
  "/MCAddonSetupManager/img/close.svg",
  "/MCAddonSetupManager/img/error.svg",
  "/MCAddonSetupManager/img/github.svg",
  "/MCAddonSetupManager/img/help.svg",
  "/MCAddonSetupManager/img/homepage.svg",
  "/MCAddonSetupManager/img/icon.svg",
  "/MCAddonSetupManager/img/icon.webp",
  "/MCAddonSetupManager/img/icon_256.png",
  "/MCAddonSetupManager/img/icon_512.png",
  "/MCAddonSetupManager/img/icon_2000.png",
  "/MCAddonSetupManager/img/icon_apple-touch-icon.png",
  "/MCAddonSetupManager/img/import.svg",
  "/MCAddonSetupManager/img/more.svg",
  "/MCAddonSetupManager/img/share.svg",
  "/MCAddonSetupManager/img/subpacks.svg",
  "/MCAddonSetupManager/img/twitter.svg",
  "/MCAddonSetupManager/img/warning.svg",
  "/MCAddonSetupManager/js/main.min.js",
  "/MCAddonSetupManager/json/webapp.webmanifest",
  "/MCAddonSetupManager/lib/jquery-3.5.1.min.js",
  "/MCAddonSetupManager/lib/minecraft_text.min.js",
  "/MCAddonSetupManager/lib/prism.js",
  "/MCAddonSetupManager/lib/minecraft_text.min.js.map",
];
var oldCacheKeys = [
  "toka-20210105",
  "toka-20201119",
  "toka-20200904",
  "toka-20200831",
  "pwa-caches",
];

// インストール処理
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});
// アクティブ時
self.addEventListener("activate", function (event) {
  event.waitUntil(
    (function () {
      caches.keys().then(function (oldCaches) {
        oldCaches
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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((responseCache) => {
            if (event.request.method != "POST")
              cache.put(event.request, responseCache.clone());
            return responseCache;
          })
        );
      });
    })
  );
});
