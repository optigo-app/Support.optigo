import { useEffect, useRef } from "react";
import { getAppBasePath } from "../../utils/AppBasePath";

const CHECK_INTERVAL = 120000;

const isNewerVersion = (candidate, current) => {
	const parseVersion = (version) => {
		if (typeof version !== "string") return null;
		const match = version.trim().match(/^v?(\d+(?:\.\d+)*)$/i);
		return match ? match[1].split(".").map(Number) : null;
	};

	const candidateParts = parseVersion(candidate);
	const currentParts = parseVersion(current);
	if (!candidateParts || !currentParts) return false;

	const partCount = Math.max(candidateParts.length, currentParts.length);
	for (let index = 0; index < partCount; index += 1) {
		const candidatePart = candidateParts[index] || 0;
		const currentPart = currentParts[index] || 0;
		if (candidatePart !== currentPart) return candidatePart > currentPart;
	}
	return false;
};

export default function useSWVersionChecker() {
	const checking = useRef(false);

	useEffect(() => {
		let disposed = false;
		const checkVersion = async () => {
			if (checking.current || document.visibilityState === "hidden") return;
			checking.current = true;
			try {
				const basePath = getAppBasePath();
				const response = await fetch(`${basePath}/version.json?_=${Date.now()}`, {
					cache: "no-store",
					headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
				});
				if (!response.ok) return;
				const data = await response.json();
				const latestVersion = typeof data?.version === "string" ? data.version : "";
				const currentVersion = window.__APP_VERSION__;
				if (!disposed && isNewerVersion(latestVersion, currentVersion)) {
					window.dispatchEvent(new CustomEvent("NEW_VERSION_AVAILABLE", {
						detail: { version: latestVersion, buildTime: data.buildTime },
					}));
					if ("serviceWorker" in navigator) {
						navigator.serviceWorker.getRegistration()
							.then((registration) => registration?.update())
							.catch(() => {});
					}
				}
			} catch {
				// Keep the app usable when the version endpoint is temporarily unavailable.
			} finally {
				checking.current = false;
			}
		};

		const checkWhenVisible = () => {
			if (document.visibilityState === "visible") checkVersion();
		};
		checkVersion();
		const intervalId = window.setInterval(checkVersion, CHECK_INTERVAL);
		document.addEventListener("visibilitychange", checkWhenVisible);
		window.addEventListener("focus", checkVersion);
		return () => {
			disposed = true;
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", checkWhenVisible);
			window.removeEventListener("focus", checkVersion);
		};
	}, []);
}
