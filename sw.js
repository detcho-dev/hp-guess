// اسم الكاش - غيّر الرقم ده كل ما تعمل تحديث كبير عشان الكاش القديم يتمسح
const CACHE_NAME = "bakasa-v1";

// الملفات الأساسية اللي لازم تتخزن أول مرة
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  // ضيف هنا أي ملفات أساسية تانية
];

// ================== التثبيت ==================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] تخزين ملفات التطبيق الأساسية");
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting(); // فعّل الـ SW الجديد فوراً
});

// ================== التنشيط ==================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] مسح كاش قديم:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ================== اعتراض الطلبات ==================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // نتعامل بس مع طلبات GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1️⃣ لو الطلب لصورة → Cache First (الكاش الأول)
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached; // موجود في الكاش → رجّعه فوراً
        }
        // مش موجود → هاته من الشبكة وخزنه
        return fetch(request)
          .then((response) => {
            // نتأكد إن الرد سليم قبل التخزين
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // لو فشل التحميل (أوفلاين) → نرجع صورة افتراضية أو حاجة
            console.warn("[SW] فشل تحميل صورة:", request.url);
            // ممكن ترجع صورة placeholder هنا لو حابب
            // return caches.match('./images/placeholder.png');
          });
      })
    );
    return;
  }

  // 2️⃣ للملفات التانية (HTML, CSS, JS) → Cache First مع تحديث في الخلفية
  // أو ممكن تستخدم Network First لو عايز التحديثات تظهر بسرعة
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cached); // لو فشل، ارجع للكاش

      // لو موجود في الكاش، رجّعه فوراً وحدّث في الخلفية
      return cached || fetchPromise;
    })
  );
});
