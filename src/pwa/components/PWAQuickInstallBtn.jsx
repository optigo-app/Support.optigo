import React from "react";
import { Button, Tooltip, Chip, Box, Typography, Paper } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import optigoLogoSvg from "../../assets/logos/Black_Optigo_R_Logo.svg";
import { usePWA } from "../hooks/usePWA";

/**
 * PWA Quick Install Button / Status component (Apple HIG styled)
 * @param {Object} props
 * @param {'button'|'chip'|'card'} props.variant
 */
export default function PWAQuickInstallBtn({ variant = "button", sx = {} }) {
  const { isInstalled, isInstallable, promptInstall, openInstallDialog } = usePWA();

  const handleAction = () => {
    if (isInstallable) {
      promptInstall();
    } else {
      openInstallDialog();
    }
  };

  if (variant === "chip") {
    if (isInstalled) {
      return (
        <Chip
          icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important", color: "#34C759 !important" }} />}
          label="App Installed"
          size="small"
          sx={{
            bgcolor: "rgba(52, 199, 89, 0.1)",
            color: "#28A745",
            fontWeight: 650,
            fontSize: "0.74rem",
            height: 24,
            borderRadius: "12px",
            border: "1px solid rgba(52, 199, 89, 0.2)",
            ...sx,
          }}
        />
      );
    }

    return (
      <Tooltip title="Install Optigo Central as a native app">
        <Chip
          icon={<DownloadRoundedIcon sx={{ fontSize: "14px !important", color: "#0071E3 !important" }} />}
          label="Install App"
          size="small"
          clickable
          onClick={handleAction}
          sx={{
            bgcolor: "rgba(0, 113, 227, 0.08)",
            color: "#0071E3",
            fontWeight: 650,
            fontSize: "0.74rem",
            height: 24,
            borderRadius: "12px",
            border: "1px solid rgba(0, 113, 227, 0.2)",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "rgba(0, 113, 227, 0.16)",
            },
            ...sx,
          }}
        />
      </Tooltip>
    );
  }

  if (variant === "card") {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: isInstalled ? "rgba(52, 199, 89, 0.25)" : "rgba(0, 0, 0, 0.08)",
          bgcolor: isInstalled ? "rgba(52, 199, 89, 0.03)" : "rgba(245, 245, 247, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
          ...sx,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: "#000000",
              color: "#FFFFFF",
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
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#1D1D1F", fontSize: "0.88rem" }}>
              {isInstalled ? "Optigo App Active" : "Optigo Desktop & Mobile App"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#86868B", fontSize: "0.76rem" }}>
              {isInstalled
                ? "Running in standalone desktop mode with offline caching & background sync"
                : "Install as a native application for instant launch, standalone window & alerts"}
            </Typography>
          </Box>
        </Box>

        {isInstalled ? (
          <Chip
            icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important", color: "#34C759 !important" }} />}
            label="Installed"
            size="small"
            sx={{
              bgcolor: "rgba(52, 199, 89, 0.12)",
              color: "#28A745",
              fontWeight: 700,
              fontSize: "0.76rem",
              borderRadius: "10px",
            }}
          />
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={handleAction}
            startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: "#0071E3",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 650,
              fontSize: "0.8rem",
              borderRadius: "10px",
              px: 2,
              py: 0.6,
              boxShadow: "0 2px 8px rgba(0, 113, 227, 0.35)",
              "&:hover": { bgcolor: "#0077ED" },
            }}
          >
            Install App
          </Button>
        )}
      </Paper>
    );
  }

  // Default button variant
  if (isInstalled) return null;

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handleAction}
      startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
      sx={{
        textTransform: "none",
        fontWeight: 650,
        fontSize: "0.8rem",
        borderRadius: "10px",
        bgcolor: "#0071E3",
        color: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(0, 113, 227, 0.3)",
        "&:hover": {
          bgcolor: "#0077ED",
        },
        ...sx,
      }}
    >
      Install App
    </Button>
  );
}
