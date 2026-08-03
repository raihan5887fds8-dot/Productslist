const CACHE_NAME = "product-list-cache-v1";
const CORE_ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// ইনস্টলের সময় মূল ফাইলগুলো ক্যাশে রাখা হয়
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// পুরনো ক্যাশ পরিষ্কার করা হয়
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// নেটওয়ার্ক আগে চেষ্টা করা হয় (Firebase রিয়েল-টাইম ডাটার জন্য),
// নেটওয়ার্ক না পাওয়া গেলে ক্যাশ থেকে অ্যাপের খোলস (shell) দেখানো হয়
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // শুধু নিজের অ্যাপের ফাইলগুলো ক্যাশে রাখা, বাইরের API কল নয়
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, copy);
          }
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
