var CACHE_NAME = 'pwa-caches';
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
    '/MCAddonSetupManager/img/twitter.svg',
    '/MCAddonSetupManager/img/warning.svg',
    '/MCAddonSetupManager/js/main.js',
    '/MCAddonSetupManager/json/webapp.webmanifest',
    '/MCAddonSetupManager/lib/prism.js',
    '/MCAddonSetupManager/lib/jquery-3.5.1.min.js'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
    event.waitUntil(self.skipWaiting());
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});