import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Divider, Fade, IconButton, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoModeRoundedIcon from "@mui/icons-material/AutoModeRounded";
import useSWVersionChecker from "../hooks/useSWVersionChecker";

const DISMISSED_VERSION_KEY = "app_update_dismissed_version";
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const isVersionSnoozed = (version) => {
	try {
		const savedValue = localStorage.getItem(DISMISSED_VERSION_KEY);
		if (!savedValue) return false;

		let dismissal;
		try {
			dismissal = JSON.parse(savedValue);
		} catch {
			// Older releases stored only the version string and suppressed it forever.
			if (savedValue === version) localStorage.removeItem(DISMISSED_VERSION_KEY);
			return false;
		}

		if (dismissal?.version !== version) return false;
		const dismissedAt = Number(dismissal.dismissedAt);
		return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
	} catch {
		return false;
	}
};

export default function PWAUpdatePrompt() {
	const [availableVersion, setAvailableVersion] = useState("");
	const [open, setOpen] = useState(false);
	const [updating, setUpdating] = useState(false);
	useSWVersionChecker();

	const showUpdate = useCallback((version) => {
		const normalizedVersion = typeof version === "string" ? version : "";
		const currentVersion = window.__APP_VERSION__;
		if (!normalizedVersion || !currentVersion || normalizedVersion === currentVersion) return;
		if (isVersionSnoozed(normalizedVersion)) return;
		setAvailableVersion(normalizedVersion);
		setOpen(true);
	}, []);

	useEffect(() => {
		const handleNewVersion = (event) => showUpdate(event.detail?.version);
		window.addEventListener("NEW_VERSION_AVAILABLE", handleNewVersion);
		return () => window.removeEventListener("NEW_VERSION_AVAILABLE", handleNewVersion);
	}, [showUpdate]);

	const handleClose = () => {
		if (availableVersion) {
			try {
				localStorage.setItem(DISMISSED_VERSION_KEY, JSON.stringify({
					version: availableVersion,
					dismissedAt: Date.now(),
				}));
			} catch {}
		}
		setOpen(false);
	};

	const handleUpdate = async () => {
		if (updating) return;
		setUpdating(true);
		const reloadWithCacheBust = () => {
			const url = new URL(window.location.href);
			url.searchParams.set("_v", String(Date.now()));
			window.location.replace(url.toString());
		};

		try {
			if ("serviceWorker" in navigator) {
			const registration = await navigator.serviceWorker.getRegistration();
			if (registration) {
					registration.update()
						.then(() => registration.waiting?.postMessage({ type: "SKIP_WAITING" }))
						.catch(() => {});
			}
			}
		} catch {
			// Continue with a cache-busted navigation if the worker update fails.
		}
		reloadWithCacheBust();
	};

	if (!open) return null;

	return (
		<Fade in={open}>
			<Box
				component="output"
				aria-live="polite"
				sx={{
					position: "fixed", top: { xs: 12, sm: 20 }, left: "50%", transform: "translateX(-50%)",
					width: "max-content", minWidth: 280, maxWidth: "calc(100vw - 24px)", zIndex: 1500,
					bgcolor: "background.paper", color: "text.primary", borderRadius: 2, overflow: "hidden",
					boxShadow: "0 8px 30px rgba(15, 23, 42, .18), 0 0 0 1px rgba(15, 23, 42, .08)",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.75, py: 1.2 }}>
					<AutoModeRoundedIcon color="success" fontSize="small" />
					<Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
						Update available{availableVersion ? ` — version ${availableVersion}` : ""}
					</Typography>
					<IconButton size="small" aria-label="Dismiss update notification" onClick={handleClose}>
						<CloseRoundedIcon fontSize="small" />
					</IconButton>
				</Box>
				<Divider />
				<Box sx={{ display: "flex", alignItems: { xs: "stretch", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: 1, px: 1.75, py: 1.25, bgcolor: "action.hover" }}>
					<Typography sx={{ flex: 1, fontSize: 13, color: "text.secondary" }}>
						Install the latest improvements and fixes.
					</Typography>
					<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
						<Button size="small" variant="outlined" disabled={updating} onClick={handleClose} sx={{ textTransform: "none" }}>
							Later
						</Button>
						<Button size="small" variant="contained" disabled={updating} onClick={handleUpdate} sx={{ textTransform: "none" }}>
							{updating ? "Updating…" : "Update"}
						</Button>
					</Box>
				</Box>
			</Box>
		</Fade>
	);
}
