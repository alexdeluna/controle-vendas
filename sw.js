// ======================================
// SERVICE WORKER
// CONTROLE DE VENDAS EVENTO
// ======================================

const CACHE_NAME = "evento-v1";

const ARQUIVOS_CACHE = [

    "./",
    "./index.html",
    "./visual.css",
    "./app.js",
    "./auth.js",
    "./excel.js",
    "./firebase-config.js",
    "./manifest.json"

];

// ======================================
// INSTALL
// ======================================

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then((cache) => {

                return cache.addAll(
                    ARQUIVOS_CACHE
                );

            })

        );

        self.skipWaiting();

    }
);

// ======================================
// ACTIVATE
// ======================================

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            caches.keys()
            .then((keys) => {

                return Promise.all(

                    keys.map((key) => {

                        if (
                            key !== CACHE_NAME
                        ) {

                            return caches.delete(
                                key
                            );

                        }

                    })

                );

            })

        );

        self.clients.claim();

    }
);

// ======================================
// FETCH
// ======================================

self.addEventListener(
    "fetch",
    (event) => {

        if (
            event.request.method !== "GET"
        ) {
            return;
        }

        event.respondWith(

            caches.match(
                event.request
            )
            .then((response) => {

                if (response) {
                    return response;
                }

                return fetch(
                    event.request
                )
                .then((networkResponse) => {

                    return networkResponse;

                });

            })

        );

    }
);

// ======================================
// MENSAGEM
// ======================================

self.addEventListener(
    "message",
    (event) => {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);