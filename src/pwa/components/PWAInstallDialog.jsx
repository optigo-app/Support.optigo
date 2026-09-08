import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Divider,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import AndroidRoundedIcon from "@mui/icons-material/AndroidRounded";
import OfflineBoltRoundedIcon from "@mui/icons-material/OfflineBoltRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import optigoLogoSvg from "../../assets/logos/Black_Optigo_R_Logo.svg";
import { usePWA } from "../hooks/usePWA";

const BENEFITS = [
  {
    icon: <DesktopWindowsRoundedIcon sx={{ fontSize: 19, color: "#0071E3" }} />,
    iconBg: "rgba(0, 113, 227, 0.08)",
    title: "Standalone Window",
    desc: "Runs in its own clean window without browser URL bars or tabs",
  },
  {
    icon: <NotificationsActiveRoundedIcon sx={{ fontSize: 19, color: "#34C759" }} />,
    iconBg: "rgba(52, 199, 89, 0.08)",
    title: "Instant Push Alerts",
    desc: "Real-time call assignments & ticket updates on desktop & mobile",
  },
  {
    icon: <OfflineBoltRoundedIcon sx={{ fontSize: 19, color: "#FF9500" }} />,
    iconBg: "rgba(255, 149, 0, 0.08)",
    title: "Fast Caching",
    desc: "Blazing fast UI loads with background resource caching",
  },
  {
    icon: <SpeedRoundedIcon sx={{ fontSize: 19, color: "#5856D6" }} />,
    iconBg: "rgba(88, 86, 214, 0.08)",
    title: "1-Click Launch",
    desc: "Open directly from your taskbar, dock, or home screen",
  },
];

export default function PWAInstallDialog() {
  const { isInstallDialogOpen, closeInstallDialog, promptInstall, isInstallable } = usePWA();
  const [activeTab, setActiveTab] = useState(0); // 0: Chrome/Desktop, 1: iOS, 2: Android

  return (
    <Dialog
      open={isInstallDialogOpen}
      onClose={closeInstallDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: { xs: 1.5, sm: 2.5 },
          bgcolor: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 28px 64px -12px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 0,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              bgcolor: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.8,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1D1D1F",
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Install Optigo Central App
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#86868B", fontSize: "0.8rem", mt: 0.2, display: "block" }}
            >
              Progressive Web App for Desktop, iOS & Android
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={closeInstallDialog}
          size="small"
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "rgba(0, 0, 0, 0.05)",
            color: "#86868B",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.1)",
              color: "#1D1D1F",
            },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, pt: 0.5 }}>
        {/* Apple HIG Inset Grouped Benefits Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.25,
            mb: 2.5,
          }}
        >
          {BENEFITS.map((item, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: "14px",
                bgcolor: "rgba(245, 245, 247, 0.8)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(240, 240, 243, 0.95)",
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  bgcolor: item.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 650,
                    fontSize: "0.84rem",
                    color: "#1D1D1F",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.25,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#86868B",
                    fontSize: "0.74rem",
                    lineHeight: 1.35,
                    display: "block",
                    mt: 0.3,
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.06)", mb: 2 }} />

        {/* Apple HIG Segmented Control */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{
            minHeight: 36,
            bgcolor: "rgba(118, 118, 128, 0.12)",
            borderRadius: "10px",
            p: "3px",
            mb: 2,
            "& .MuiTab-root": {
              minHeight: 30,
              fontSize: "0.78rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              py: 0.4,
              color: "#86868B",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              "&.Mui-selected": {
                color: "#1D1D1F",
                bgcolor: "#FFFFFF",
                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.12), 0 3px 1px rgba(0, 0, 0, 0.04)",
              },
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab
            icon={<DesktopWindowsRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Chrome / Edge"
          />
          <Tab
            icon={<PhoneIphoneRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="iOS Safari"
          />
          <Tab
            icon={<AndroidRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Android"
          />
        </Tabs>

        {/* Tab 0: Chrome / Edge Desktop */}
        {activeTab === 0 && (
          <Box sx={{ py: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ color: "#424245", mb: 1.5, fontSize: "0.84rem", lineHeight: 1.5 }}
            >
              Click the <strong>Install Application</strong> button below, or click the install icon (
              <DownloadRoundedIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.2, color: "#0071E3" }} />
              ) in your browser’s address bar.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={promptInstall}
              startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "#0071E3",
                color: "#FFFFFF",
                fontWeight: 650,
                fontSize: "0.88rem",
                py: 1.1,
                minHeight: 44,
                borderRadius: "12px",
                textTransform: "none",
                letterSpacing: "-0.01em",
                boxShadow: "0 4px 14px rgba(0, 113, 227, 0.35)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#0077ED",
                  boxShadow: "0 6px 20px rgba(0, 113, 227, 0.45)",
                },
                "&:active": {
                  transform: "scale(0.99)",
                },
              }}
            >
              Install Application
            </Button>
          </Box>
        )}

        {/* Tab 1: iOS Safari */}
        {activeTab === 1 && (
          <Box sx={{ py: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ color: "#1D1D1F", mb: 1, fontSize: "0.85rem", fontWeight: 600 }}
            >
              How to install on iOS (iPhone / iPad):
            </Typography>
            <Box
              component="ol"
              sx={{
                pl: 2.5,
                m: 0,
                fontSize: "0.82rem",
                color: "#424245",
                lineHeight: 1.8,
              }}
            >
              <li>
                Open <strong>Safari</strong> on your iPhone or iPad.
              </li>
              <li>
                Tap the <strong>Share</strong> button (
                <IosShareRoundedIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.3, color: "#0071E3" }} />
                ) in the bottom toolbar.
              </li>
              <li>
                Scroll down and tap <strong>Add to Home Screen</strong> (
                <AddBoxRoundedIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.3, color: "#1D1D1F" }} />
                ).
              </li>
              <li>Tap <strong>Add</strong> in the top-right corner.</li>
            </Box>
          </Box>
        )}

        {/* Tab 2: Android Chrome */}
        {activeTab === 2 && (
          <Box sx={{ py: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ color: "#1D1D1F", mb: 1, fontSize: "0.85rem", fontWeight: 600 }}
            >
              How to install on Android:
            </Typography>
            <Box
              component="ol"
              sx={{
                pl: 2.5,
                m: 0,
                fontSize: "0.82rem",
                color: "#424245",
                lineHeight: 1.8,
              }}
            >
              <li>
                Tap the <strong>Three Dots menu (⋮)</strong> in Chrome.
              </li>
              <li>
                Select <strong>Install App</strong> or <strong>Add to Home screen</strong>.
              </li>
              <li>Confirm to add the Optigo Central icon to your home screen.</li>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 0, pt: 2 }}>
        <Button
          onClick={closeInstallDialog}
          sx={{
            color: "#86868B",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.82rem",
            borderRadius: "10px",
            px: 2,
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.05)",
              color: "#1D1D1F",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
