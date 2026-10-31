import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getRouteIconConfig } from "../config/routeIcons";
import { updateFavicon, updateThemeColor } from "../services/iconSynchronizer";

/**
 * Custom hook to dynamically synchronize App Icons, Favicons, and PWA Manifests
 * across all routes (Call Log/All, New Call, Archive, Ticket, Orders, Training).
 *
 * Keeps the application cleanly decoupled: mounting this hook or its companion
 * <AppIconSynchronizer /> automatically handles DOM updates without polluting page components.
 *
 * @returns {Object} Current active icon and manifest metadata
 */
export function useDynamicAppIcon() {
	const location = useLocation();

	// Resolve config based on current path
	const config = useMemo(() => {
		return getRouteIconConfig(location.pathname);
	}, [location.pathname]);

	useEffect(() => {
		// 1. Synchronize browser tab favicon (32x32) & apple-touch-icon (64x64/192x192)
		updateFavicon(config.favicon32, config.favicon64);

		// Keep the install manifest static (public/manifest.json). Route-specific
		// Blob manifests are short-lived and browsers may read them after revocation.
		// 2. Synchronize Theme Color
		updateThemeColor(config.themeColor);
	}, [config]);

	return {
		currentIcon: config.bundledIcon,
		currentPublicIcon: config.publicIcon192,
		currentFavicon: config.favicon32,
		currentTitle: config.name,
		currentShortName: config.shortName,
		currentDescription: config.description,
		currentThemeColor: config.themeColor,
		routeKey: config.key,
		manifestUrl: typeof document !== "undefined"
			? document.querySelector("link[rel='manifest']")?.href || null
			: null,
		config,
	};
}

export default useDynamicAppIcon;
