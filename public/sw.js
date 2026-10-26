// Offline support (S25, reference 25-offline): pages you opened recently still work without a connection.
// Assets: cache first. Pages and data: network first, then the saved copy, then the offline screen.
const VERSION = "da-v1";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const OFFLINE = "/offline";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll([OFFLINE, "/"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/api/v1/corrections") || url.pathname.startsWith("/api/v1/events")) return;

  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(STATIC).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  const isPage = req.mode === "navigate";
  const isData = url.pathname.endsWith(".data") || url.pathname.startsWith("/data/") || url.pathname.startsWith("/api/v1/");
  if (!isPage && !isData) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) caches.open(PAGES).then((c) => c.put(req, res.clone()));
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: isData }).then((hit) => hit || (isPage ? caches.match(OFFLINE) : Response.error()))),
  );
});
