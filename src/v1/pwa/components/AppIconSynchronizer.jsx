import { useDynamicAppIcon } from "../hooks/useDynamicAppIcon";

/**
 * Headless AppIconSynchronizer component.
 * Mount inside BrowserRouter to automatically maintain dynamic favicons,
 * touch icons, and route-specific PWA manifests as users navigate.
 */
export default function AppIconSynchronizer() {
	useDynamicAppIcon();
	return null;
}
