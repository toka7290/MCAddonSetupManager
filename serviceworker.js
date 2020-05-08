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
    '/MCAddonSetupManager/img/icon.png',
    '/MCAddonSetupManager/img/import.svg',
    '/MCAddonSetupManager/img/more.svg',
    '/MCAddonSetupManager/img/twitter.svg',
    '/MCAddonSetupManager/img/warning.svg',
    '/MCAddonSetupManager/js/editor_manifest.js',
    '/MCAddonSetupManager/js/ui.js',
    '/MCAddonSetupManager/json/webapp.webmanifest',
    '/MCAddonSetupManager/lib/prism.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js'
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

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  showInstallPromotion();
});