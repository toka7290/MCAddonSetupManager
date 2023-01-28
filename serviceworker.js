const CACHE_VERSION = "20230128";
const CACHE_NAME = `${registration.scope}!${CACHE_VERSION}`;
var urlsToCache = [
  `${registration.scope}`,
  `${registration.scope}index.html`,
  `${registration.scope}css/color.min.css`,
  `${registration.scope}css/phone.min.css`,
  `${registration.scope}css/prism.min.css`,
  `${registration.scope}css/mc_format.min.css`,
  `${registration.scope}css/style.min.css`,
  `${registration.scope}img/close.svg`,
  `${registration.scope}img/error.svg`,
  `${registration.scope}img/github.svg`,
  `${registration.scope}img/help.svg`,
  `${registration.scope}img/homepage.svg`,
  `${registration.scope}img/icon.svg`,
  `${registration.scope}img/icon.webp`,
  `${registration.scope}img/icon_256.png`,
  `${registration.scope}img/icon_512.png`,
  `${registration.scope}img/icon_2000.png`,
  `${registration.scope}img/icon_apple-touch-icon.png`,
  `${registration.scope}img/import.svg`,
  `${registration.scope}img/maskable_icon.png`,
  `${registration.scope}img/more.svg`,
  `${registration.scope}img/share.svg`,
  `${registration.scope}img/subpacks.svg`,
  `${registration.scope}img/twitter.svg`,
  `${registration.scope}img/warning.svg`,
  `${registration.scope}js/main.min.js`,
  `${registration.scope}json/webapp.webmanifest`,
  `${registration.scope}lib/jquery-3.6.0.min.js`,
  `${registration.scope}lib/prism.js`,
  `${registration.scope}lib/mc_format.min.js`,
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
  // httpプロトコルを使用していない場合は、リクエストをスキップする。
  if (!(evt.request.url.indexOf("http") === 0)) return;

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
