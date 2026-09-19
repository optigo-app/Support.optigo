/**
 * Dynamic App Icon, Favicon & PWA Manifest Synchronizer Service
 * Handles memory-safe DOM updates for tab favicons, touch icons, and webmanifest
 */

let activeManifestBlobUrl = null;

/**
 * Update the document favicon and apple-touch-icon in <head>
 * @param {string} faviconUrl - URL or path to 32x32 / 64x64 icon
 * @param {string} touchIconUrl - High-DPI icon for iOS / Safari
 */
export function updateFavicon(faviconUrl, touchIconUrl) {
	if (typeof document === "undefined" || !faviconUrl) return;

	try {
		// 1. Standard / Shortcut icon
		let iconLink = document.querySelector("link[rel~='icon']");
		if (!iconLink) {
			iconLink = document.createElement("link");
			iconLink.rel = "icon";
			document.head.appendChild(iconLink);
		}
		iconLink.type = faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png";
		iconLink.href = faviconUrl;

		// 2. Apple touch icon
		const touchSrc = touchIconUrl || faviconUrl;
		let appleLink = document.querySelector("link[rel='apple-touch-icon']");
		if (!appleLink) {
			appleLink = document.createElement("link");
			appleLink.rel = "apple-touch-icon";
			document.head.appendChild(appleLink);
		}
		appleLink.href = touchSrc;
	} catch (err) {
		console.warn("[IconSync] Failed to update favicon:", err);
	}
}

/**
 * Update meta theme-color in <head>
 * @param {string} color
 */
export function updateThemeColor(color) {
	if (typeof document === "undefined" || !color) return;
	try {
		let metaTheme = document.querySelector("meta[name='theme-color']");
		if (!metaTheme) {
			metaTheme = document.createElement("meta");
			metaTheme.name = "theme-color";
			document.head.appendChild(metaTheme);
		}
		metaTheme.content = color;
	} catch (err) {
		console.warn("[IconSync] Failed to update theme color:", err);
	}
}

/**
 * Dynamically generate a Web App Manifest Blob and update <link rel="manifest">
 * This ensures that when the user triggers "Install PWA", the browser's install dialog
 * captures the active route's name, short name, start URL, and route-specific icon!
 *
 * @param {Object} routeConfig
 * @returns {string|null} The generated manifest Blob URL
 */
export function updateDynamicManifest(routeConfig) {
	if (typeof window === "undefined" || typeof document === "undefined" || !routeConfig) {
		return null;
	}

	try {
		// Clean up previously created Blob URL to avoid memory leakage
		if (activeManifestBlobUrl) {
			URL.revokeObjectURL(activeManifestBlobUrl);
			activeManifestBlobUrl = null;
		}

		const origin = window.location.origin;
		const icon192 = `${origin}${routeConfig.publicIcon192}`;
		const icon512 = `${origin}${routeConfig.publicIcon512}`;
		const startUrl = routeConfig.startUrl || window.location.pathname || "/";

		const dynamicManifest = {
			short_name: routeConfig.shortName || "Optigo",
			name: routeConfig.name || "Optigo Central System",
			description: routeConfig.description || "Enterprise operations, call logging, ticket management, and real-time business intelligence.",
			start_url: startUrl,
			scope: "/",
			display: "standalone",
			background_color: "#FFFFFF",
			theme_color: routeConfig.themeColor || "#000000",
			orientation: "any",
			categories: ["business", "productivity", "utilities"],
			icons: [
				{
					src: icon512,
					type: "image/png",
					sizes: "512x512",
					purpose: "any maskable",
				},
				{
					src: icon192,
					type: "image/png",
					sizes: "192x192",
					purpose: "any maskable",
				},
				{
					src: `${origin}${routeConfig.favicon64}`,
					type: "image/png",
					sizes: "64x64",
					purpose: "any",
				},
			],
			shortcuts: [
				{
					name: "Ticket Management",
					short_name: "Tickets",
					description: "View and manage support tickets",
					url: "/Ticket",
					icons: [{ src: `${origin}/appicons/ticket-192.png`, sizes: "192x192" }],
				},
				{
					name: "Call Logger",
					short_name: "Calls",
					description: "Manage active call logs",
					url: "/callLog",
					icons: [{ src: `${origin}/appicons/call-192.png`, sizes: "192x192" }],
				},
				{
					name: "Delivery & Training",
					short_name: "Orders",
					description: "View delivery orders",
					url: "/Orders",
					icons: [{ src: `${origin}/appicons/order-192.png`, sizes: "192x192" }],
				},
			],
		};

		const manifestBlob = new Blob([JSON.stringify(dynamicManifest, null, 2)], {
			type: "application/manifest+json",
		});
		activeManifestBlobUrl = URL.createObjectURL(manifestBlob);

		let manifestLink = document.querySelector("link[rel='manifest']");
		if (!manifestLink) {
			manifestLink = document.createElement("link");
			manifestLink.rel = "manifest";
			document.head.appendChild(manifestLink);
		}
		manifestLink.setAttribute("href", activeManifestBlobUrl);

		return activeManifestBlobUrl;
	} catch (err) {
		console.warn("[IconSync] Failed to update dynamic manifest:", err);
		return null;
	}
}
