import React from "react";
import { Box, Typography, Button, Snackbar, Paper } from "@mui/material";
import SystemUpdateAltRoundedIcon from "@mui/icons-material/SystemUpdateAltRounded";
import { usePWA } from "../hooks/usePWA";

export default function PWAUpdatePrompt() {
  const { updateAvailable, applyUpdate } = usePWA();

  if (!updateAvailable) return null;

  return (
    <Snackbar
      open={updateAvailable}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ bottom: { xs: 20, sm: 30 }, zIndex: 10000 }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: "rgba(29, 29, 31, 0.94)",
          backdropFilter: "blur(25px) saturate(180%)",
          color: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 1.2,
          px: 2.2,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: "rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SystemUpdateAltRoundedIcon sx={{ fontSize: 18, color: "#0071E3" }} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 650, fontSize: "0.86rem", color: "#FFFFFF", lineHeight: 1.25 }}>
            New version available
          </Typography>
          <Typography sx={{ fontSize: "0.74rem", color: "#A1A1A6", mt: 0.2 }}>
            Update to apply the latest improvements & fixes.
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={applyUpdate}
          variant="contained"
          sx={{
            bgcolor: "#0071E3",
            color: "#FFFFFF",
            textTransform: "none",
            fontWeight: 650,
            fontSize: "0.8rem",
            borderRadius: "9px",
            px: 1.8,
            py: 0.5,
            boxShadow: "0 2px 8px rgba(0, 113, 227, 0.4)",
            "&:hover": {
              bgcolor: "#0077ED",
            },
          }}
        >
          Update Now
        </Button>
      </Paper>
    </Snackbar>
  );
}
