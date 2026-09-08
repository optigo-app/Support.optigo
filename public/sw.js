const CACHE_NAME = "optigo-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/optigo_logo.png",
  "/Black_Optigo_R_Logo.png",
  "/2.ico",
];

self.addEventListener("install", (event) => {
  console.log("⚡ PWA Service Worker Installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Pre-caching static assets failed (non-blocking):", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🚀 PWA Service Worker Activated");
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

let messagePort = null;

self.addEventListener("message", (event) => {
  console.log("Service worker received message:", event.data);

  if (event.data?.type === "SKIP_WAITING" || event.data === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data === "START_TIMER") {
    if (event.ports && event.ports[0]) {
      messagePort = event.ports[0];
      setInterval(() => {
        if (messagePort) {
          messagePort.postMessage("CHECK_COOKIE");
        }
      }, 8000);
    }
  }
});

// Stale-while-revalidate fetch strategy for static assets, network-first for APIs/dynamic
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and WebSocket/API requests
  if (request.method !== "GET" || url.pathname.startsWith("/api") || url.pathname.startsWith("/socket.io")) {
    return;
  }

  // Static assets (images, fonts, scripts, styles)
  const isStatic =
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff2|woff|ttf)$/) ||
    url.pathname === "/" ||
    url.pathname === "/index.html";

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});


// --- PUSH NOTIFICATION SETUP ---
self.addEventListener("push", (event) => {
  console.log("📩 Push received:", event.data?.text());

  const data = event.data ? JSON.parse(event.data.text()) : {};
  const title = data.title || "New Notification";
  const options = {
    body: data.body || "You have a new update!",
    icon: "https://cdn.pixabay.com/photo/2025/08/10/13/50/wolf-9766240_640.jpg",     
    badge: "https://cdn.pixabay.com/photo/2025/09/09/18/12/moon-9824889_640.png",     
    data,                       
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   const payload = event.notification.data || {};
//   const type = payload?.type || "";
//   const group = payload?.group || "";

//   event.waitUntil(
//     (async () => {
//       const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
//       const channel = new BroadcastChannel("notification_channel");

//       // Check for existing /ticket tab
//       let ticketTab = allClients.find(client => new URL(client.url).pathname === "/ticket");

//       if (group === "TICKET" || type.startsWith("TICKET")) {
//         if (ticketTab) {
//           ticketTab.focus();
//           channel.postMessage({ type: "NOTIFICATION_CLICK", payload });
//           channel.close();
//           return;
//         }

//         // Open new /ticket tab
//         const newTab = await clients.openWindow("/ticket");

//         // Give the page time to register BroadcastChannel before sending payload
//         await new Promise(res => setTimeout(res, 500));
//         channel.postMessage({ type: "NOTIFICATION_CLICK", payload });
//         channel.close();
//         return;
//       }

//       // Fallback for other notifications
//       channel.postMessage({ type: "NOTIFICATION_CLICK", payload });
//       channel.close();
//       if (payload?.url) {
//         await clients.openWindow(payload.url);
//       }
//     })()
//   );
// });



// self.addEventListener("notificationclick", async (event) => {
//   event.notification.close();

//   const payload = event.notification.data || {};
//   const type = payload?.type || "";
//   const group = payload?.group || "";
//   console.log("🚀 ~ type:", type)
//   console.log("🚀 ~ group:", group)

//   const channel = new BroadcastChannel("notification_channel");

//   if (type.startsWith("TICKET") || group === "TICKET") {
//     const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
//     let ticketTab = null;

//     for (const client of allClients) {
//       const url = new URL(client.url);

//       if (url.pathname === "/ticket") {
//         ticketTab = client;
//         client.focus();
//         channel.postMessage({
//           type: "NOTIFICATION_CLICK",
//           payload,
//         });
//         channel.close();
//         return;
//       }
//     }

//     ticketTab = await clients.openWindow("/ticket");
//     setTimeout(() => {
//       channel.postMessage({
//         type: "NOTIFICATION_CLICK",
//         payload,
//       });
//       channel.close();
//     }, 1000);

//     return;
//   }

//   channel.postMessage({
//     type: "NOTIFICATION_CLICK",
//     payload,
//   });
//   channel.close();
//   if (payload?.url) {
//     event.waitUntil(clients.openWindow(payload.url));
//   }
// });


self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const payload = event.notification.data || {};
  const type = payload?.type || "";
  const group = payload?.group || "";

  const channel = new BroadcastChannel("notification_channel");

  // Always just broadcast payload and event type/group
  channel.postMessage({
    type: "NOTIFICATION_CLICK",
    payload,   // whole payload (ticket/call data)
    group,     // TICKET / CALL / OTHER
  });

  channel.close();
});
