import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { registerServiceWorker, applyServiceWorkerUpdate } from "../services/swRegistration";
import { PWA_CONFIG } from "../config/pwaConfig";

const PWAContext = createContext(null);

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Check if app is running in standalone PWA mode
  const checkIsStandalone = useCallback(() => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://")
    );
  }, []);

  // Check if install banner was recently dismissed
  const isBannerDismissed = useCallback(() => {
    try {
      const dismissedTime = localStorage.getItem(PWA_CONFIG.dismissedInstallKey);
      if (!dismissedTime) return false;
      const daysSinceDismissed = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60 * 24);
      return daysSinceDismissed < PWA_CONFIG.dismissCooldownDays;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const standalone = checkIsStandalone();
    setIsInstalled(standalone);

    // 1. Listen for beforeinstallprompt (Chrome / Android / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      if (!standalone && !isBannerDismissed()) {
        // Show install banner smoothly after a short delay
        setTimeout(() => setShowInstallBanner(true), 2500);
      }
    };

    // 2. Listen for appinstalled
    const handleAppInstalled = () => {
      console.log("🎉 PWA installed successfully!");
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setIsInstallDialogOpen(false);
    };

    // 3. Online / Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Register Service Worker with update detection
    registerServiceWorker({
      onReady: (reg) => setSwRegistration(reg),
      onUpdate: (reg) => {
        setSwRegistration(reg);
        setUpdateAvailable(true);
      },
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkIsStandalone, isBannerDismissed]);

  // Trigger browser's native install prompt or open detailed install guide modal
  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to PWA install: ${outcome}`);
      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setIsInstallDialogOpen(false);
    } else {
      // Fallback for iOS or desktop where beforeinstallprompt isn't available
      setIsInstallDialogOpen(true);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem(PWA_CONFIG.dismissedInstallKey, String(Date.now()));
    } catch {}
  };

  const applyUpdate = () => {
    if (swRegistration) {
      applyServiceWorkerUpdate(swRegistration);
    } else {
      window.location.reload();
    }
  };

  const openInstallDialog = () => setIsInstallDialogOpen(true);
  const closeInstallDialog = () => setIsInstallDialogOpen(false);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOffline,
        updateAvailable,
        showInstallBanner,
        isInstallDialogOpen,
        promptInstall,
        dismissBanner,
        applyUpdate,
        openInstallDialog,
        closeInstallDialog,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWAContext must be used within a PWAProvider");
  }
  return context;
};
