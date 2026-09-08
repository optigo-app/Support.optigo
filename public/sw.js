self.addEventListener('install', (event) => {
  console.log("Service Worker Installed");
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log("Service Worker Activated");
  // Claim clients immediately
  event.waitUntil(clients.claim());
});

let messagePort = null;

self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  if (event.data === 'START_TIMER') {
    // Store the port for continued use
    if (event.ports && event.ports[0]) {
      messagePort = event.ports[0];

      // Start sending messages every 3 seconds
      setInterval(() => {
        console.log('SW sending CHECK_COOKIE message');
        if (messagePort) {
          messagePort.postMessage('CHECK_COOKIE');
        }
      }, 8000);
    } else {
      console.error('No MessageChannel port provided');
    }
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
