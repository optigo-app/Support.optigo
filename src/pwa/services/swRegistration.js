import { PWA_CONFIG } from "../config/pwaConfig";

/**
 * Enhanced Service Worker Registration with lifecycle & update handlers
 */
export function registerServiceWorker(callbacks = {}) {
  const { onReady, onUpdate, onOffline, onError } = callbacks;

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("ℹ️ Service Worker is not supported in this browser.");
    return;
  }

  // Register on window load
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(PWA_CONFIG.swPath)
      .then((registration) => {
        console.log("✅ PWA ServiceWorker registered with scope:", registration.scope);

        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log("🔄 New PWA update available!");
                if (onUpdate) onUpdate(registration);
              } else {
                // Content cached for offline use
                console.log("⚡ PWA content cached for offline use.");
                if (onOffline) onOffline();
              }
            }
          };
        };

        if (onReady) onReady(registration);
      })
      .catch((error) => {
        console.error("❌ PWA ServiceWorker registration failed:", error);
        if (onError) onError(error);
      });

    // Handle controller change (e.g. after skipWaiting)
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        console.log("🔄 ServiceWorker controller changed, reloading...");
        window.location.reload();
      }
    });
  });
}

/**
 * Trigger immediate activation of waiting Service Worker
 */
export function applyServiceWorkerUpdate(registration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

/**
 * Unregister all service workers (utility for cleanup)
 */
export function unregisterServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
