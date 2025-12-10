const CACHE_NAME = 'amelie-rpg-v3';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon/icon.png',
    './fonts/gamefont.css',
    './js/libs/pixi.js',
    './js/libs/pixi-tilemap.js',
    './js/libs/pixi-picture.js',
    './js/libs/fpsmeter.js',
    './js/libs/lz-string.js',
    './js/libs/iphone-inline-video.browser.js',
    './js/rpg_core.js',
    './js/rpg_managers.js',
    './js/rpg_objects.js',
    './js/rpg_scenes.js',
    './js/rpg_sprites.js',
    './js/rpg_windows.js',
    './js/plugins.js',
    './js/main.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    function (response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                // Dynamically cache other assets (images, audio)
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
