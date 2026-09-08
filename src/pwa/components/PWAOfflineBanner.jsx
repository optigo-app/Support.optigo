import React from "react";
import { Typography, Slide, Paper } from "@mui/material";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import { usePWA } from "../hooks/usePWA";

export default function PWAOfflineBanner() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <Slide direction="down" in={isOffline} mountOnEnter unmountOnExit>
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          top: 14,
          left: "50%",
          transform: "translateX(-50%) !important",
          zIndex: 10001,
          borderRadius: "20px",
          bgcolor: "rgba(255, 59, 48, 0.94)",
          backdropFilter: "blur(20px)",
          color: "#FFFFFF",
          px: 2.2,
          py: 0.7,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          boxShadow: "0 10px 30px rgba(255, 59, 48, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        }}
      >
        <WifiOffRoundedIcon sx={{ fontSize: 17 }} />
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 650, letterSpacing: "-0.01em" }}>
          You're offline. App is running with cached data.
        </Typography>
      </Paper>
    </Slide>
  );
}
