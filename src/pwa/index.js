/**
 * PWA Module Exports
 */
export { PWAProvider, usePWAContext } from "./context/PWAContext";
export { usePWA } from "./hooks/usePWA";
export { useDynamicAppIcon } from "./hooks/useDynamicAppIcon";
export { registerServiceWorker, applyServiceWorkerUpdate, unregisterServiceWorker } from "./services/swRegistration";
export { updateFavicon, updateDynamicManifest, updateThemeColor } from "./services/iconSynchronizer";
export { PWA_CONFIG } from "./config/pwaConfig";
export { ROUTE_ICON_CONFIG, getRouteIconConfig } from "./config/routeIcons";

// Components
export { default as PWAInstallBanner } from "./components/PWAInstallBanner";
export { default as PWAInstallDialog } from "./components/PWAInstallDialog";
export { default as PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
export { default as PWAOfflineBanner } from "./components/PWAOfflineBanner";
export { default as PWAQuickInstallBtn } from "./components/PWAQuickInstallBtn";
export { default as AppIconSynchronizer } from "./components/AppIconSynchronizer";
