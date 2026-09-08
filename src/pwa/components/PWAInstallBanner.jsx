import React from "react";
import { Box, Typography, Button, IconButton, Slide, Paper } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import optigoLogoSvg from "../../assets/logos/Black_Optigo_R_Logo.svg";
import { usePWA } from "../hooks/usePWA";

export default function PWAInstallBanner() {
  const { showInstallBanner, isInstalled, promptInstall, dismissBanner, openInstallDialog } = usePWA();

  if (!showInstallBanner || isInstalled) return null;

  return (
    <Slide direction="up" in={showInstallBanner} mountOnEnter unmountOnExit>
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
          zIndex: 9999,
          maxWidth: 410,
          width: "calc(100% - 32px)",
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          bgcolor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(25px) saturate(180%)",
          boxShadow: "0 20px 48px -12px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          p: 2,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.6,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
              flexShrink: 0,
            }}
          >
            <img
              src={optigoLogoSvg}
              alt="Optigo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, pr: 0.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#1D1D1F",
                lineHeight: 1.25,
                fontSize: "0.9rem",
                letterSpacing: "-0.01em",
              }}
            >
              Install Optigo Central
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#86868B",
                display: "block",
                mt: 0.25,
                lineHeight: 1.35,
                fontSize: "0.76rem",
              }}
            >
              Standalone desktop window, fast caching, and real-time alert notifications.
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                onClick={promptInstall}
                startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: "#0071E3",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 650,
                  fontSize: "0.8rem",
                  borderRadius: "10px",
                  px: 1.6,
                  py: 0.5,
                  minHeight: 34,
                  boxShadow: "0 2px 8px rgba(0, 113, 227, 0.35)",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#0077ED",
                    boxShadow: "0 4px 14px rgba(0, 113, 227, 0.45)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                Install Now
              </Button>

              <Button
                variant="text"
                size="small"
                onClick={openInstallDialog}
                startIcon={<DevicesRoundedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  color: "#515154",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  borderRadius: "10px",
                  minHeight: 34,
                  px: 1.2,
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    color: "#1D1D1F",
                  },
                }}
              >
                Options
              </Button>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={dismissBanner}
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              bgcolor: "rgba(0, 0, 0, 0.04)",
              color: "#86868B",
              transition: "all 0.15s ease",
              "&:hover": {
                color: "#1D1D1F",
                bgcolor: "rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
}
