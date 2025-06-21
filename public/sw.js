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

