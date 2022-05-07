const CACHE_VERSION = "20220507";
const CACHE_NAME = `${registration.scope}!${CACHE_VERSION}`;
var urlsToCache = [
  "/MCAddonSetupManager/",
  "/MCAddonSetupManager/index.html",
  "/MCAddonSetupManager/css/color.min.css",
  "/MCAddonSetupManager/css/phone.min.css",
  "/MCAddonSetupManager/css/prism.min.css",
  "/MCAddonSetupManager/css/mc_format.min.css",
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
  "/MCAddonSetupManager/lib/jquery-3.6.0.min.js",
  "/MCAddonSetupManager/lib/prism.js",
  "/MCAddonSetupManager/lib/mc_format.min.js",
];

// インストール処理
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 指定されたファイルをキャッシュに追加する
      return cache.addAll(urlsToCache);
    })
  );
});

// アクティブ時
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => {
          // このスコープに所属していて且つCACHE_NAMEではないキャッシュを探す
          return cacheName.startsWith(`${registration.scope}!`) && cacheName !== CACHE_NAME;
        });
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheName) => {
            // いらないキャッシュを削除する
            return caches.delete(cacheName);
          })
        );
      })
  );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュ内に該当レスポンスがあれば、それを返す
      if (response) {
        return response;
      }

      // 重要：リクエストを clone する。リクエストは Stream なので
      // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
      // 必要なので、リクエストは clone しないといけない
      let fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((requestResponse) => {
        if (
          !requestResponse ||
          requestResponse.status !== 200 ||
          requestResponse.type !== "basic"
        ) {
          // キャッシュする必要のないタイプのレスポンスならそのまま返す
        } else {
          // 重要：レスポンスを clone する。レスポンスは Stream で
          // ブラウザ用とキャッシュ用の2回必要。なので clone して
          // 2つの Stream があるようにする
          let responseToCache = requestResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return requestResponse;
      });
    })
  );
});
