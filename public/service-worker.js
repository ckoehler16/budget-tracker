const APP_PREFIX = 'BudgetTracker';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/js/index.js',
    '/css/style.css',
    '/js/idb.js',
    '/manifest.json',
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png"
];

// respond with cached resources
self.addEventListener('fetch', function (event) {
    console.log('fetch request : ' + event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + request.url);
                return request;
            }
            else {
                console.log('file is not cached, fetching : ' + event.request.url);
                return fetch(event.request)
            }
        })
    );
})

// cache resources
self.addEventListener('install', function (event) {
    console.log('installing service worker');
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('install cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
})

// activate service worker and delete old caches
self.addEventListener('activate', function (event) {
    console.log('activating service worker');
    event.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});