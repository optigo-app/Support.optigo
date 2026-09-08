import { usePWAContext } from "../context/PWAContext";

/**
 * Hook to access PWA state and actions
 * @returns {{
 *   isInstallable: boolean,
 *   isInstalled: boolean,
 *   isOffline: boolean,
 *   updateAvailable: boolean,
 *   showInstallBanner: boolean,
 *   isInstallDialogOpen: boolean,
 *   promptInstall: () => Promise<void>,
 *   dismissBanner: () => void,
 *   applyUpdate: () => void,
 *   openInstallDialog: () => void,
 *   closeInstallDialog: () => void,
 * }}
 */
export function usePWA() {
  return usePWAContext();
}
