import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Icons
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useAuth } from "../../context/UseAuth";
import { removeSkeyCookie } from "../../utils/AuthUtils";
import { getAppBasePath } from "../../utils/AppBasePath";
import { clearCallSessionState } from "../../utils/callLogUtils";
import ProfileTab from "./tabs/ProfileTab";
import NotificationsTab from "./tabs/NotificationsTab";
import AccountsTab from "./tabs/AccountsTab";
import SupportTab from "./tabs/SupportTab";
import { PWAQuickInstallBtn } from "../../pwa";

export default function AccountCenter() {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [resetSessionOpen, setResetSessionOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials =
    [user?.firstname?.[0], user?.lastname?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const fullName =
    user?.fullName ||
    `${user?.firstname || ""} ${user?.lastname || ""}`.trim() ||
    "User";

  const confirmLogout = () => {
    const KEYS = [
      "call_recording_time",
      "current_call_data",
      "call_is_paused",
      "call_paused_duration",
      "call_pause_start_time",
      "call_sliders_state",
      "concurrent_call_data",
      "call_start_timestamp",
    ];
    for (const key of KEYS) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem("app_active_skey");
    sessionStorage.clear();
    removeSkeyCookie();
    window.location.href = `${getAppBasePath()}/login`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#F5F7FB",
        width: "100%",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: 900,
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 1.75, md: 2.5 },
        }}
      >
        <Box
          sx={{
            mb: 2,
            px: { xs: 1.75, md: 2 },
            py: { xs: 1.5, md: 1.75 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: "20px",
            color: "#172033",
            bgcolor: "#FFFFFF",
            border: "1px solid #E7EAF0",
            boxShadow: "0 2px 8px rgba(16, 24, 40, 0.03)",
          }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              fontSize: 17,
              fontWeight: 800,
              bgcolor: "#F1EDFF",
              color: "#5B35C9",
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: { xs: 18, md: 21 }, lineHeight: 1.25, fontWeight: 750 }}>
              Welcome, {fullName}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "#788398", mt: 0.4 }}>
              Manage your profile, notifications, and saved workspaces.
            </Typography>
          </Box>
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.6, px: 1.25, py: 0.7, borderRadius: "999px", bgcolor: "#ECFDF3", color: "#15803D", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 15 }} />
            Signed in
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <ProfileTab />
          <Box sx={{ mb: 2.5 }}>
            <PWAQuickInstallBtn variant="card" />
          </Box>
          <NotificationsTab />
          <AccountsTab />
          <SupportTab />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 0.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {/* Call session reset section */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
              Call Session & Troubleshooting
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Reset stuck call timers or overlays without signing out.
            </Typography>

            <Paper
              onClick={() => setResetSessionOpen(true)}
              sx={{
                borderRadius: "16px",
                border: "1px solid #FED7AA",
                bgcolor: "#FFFAF4",
                px: { xs: 2, md: 2.5 },
                py: 2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "#FFF3E5", borderColor: "#FB923C", boxShadow: "0 6px 18px rgba(234, 88, 12, 0.08)" },
              }}
              elevation={0}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: "12px", bgcolor: "#FFEDD5", display: "grid", placeItems: "center", color: "#EA580C", flexShrink: 0 }}>
                  <RestartAltRoundedIcon sx={{ fontSize: 21 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    Clear active call & timer session
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Keeps your login active
                  </Typography>
                </Box>
              </Box>
              <Button variant="outlined" color="warning" size="small" sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 700, px: 1.75, flexShrink: 0 }}>
                Reset
              </Button>
            </Paper>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
              Sign out
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              End your account session on this browser.
            </Typography>
            <Paper
              onClick={() => setLogoutOpen(true)}
              sx={{
                borderRadius: "16px",
                border: "1px solid #E6E9EF",
                px: { xs: 2, md: 2.5 },
                py: 2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "#FFF7F7", borderColor: "#FDA4AF", "& .logout-label": { color: "#BE123C" } },
              }}
              elevation={0}
            >
              <LogoutRoundedIcon sx={{ color: "error.main", fontSize: 21 }} />
              <Typography variant="body2" fontWeight={600} color="text.primary" className="logout-label">
                Logout from this device
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Reset Call Session Confirmation Dialog */}
      <Dialog
        open={resetSessionOpen}
        onClose={() => setResetSessionOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <RestartAltRoundedIcon sx={{ color: "#ED6C02" }} />
          Reset Call Session & Timers?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.875rem" }}>
            This action will clear all stuck call timers, paused call states, and active call overlays, restoring normal functionality to the <strong>+ ADD</strong> call button.
            <br /><br />
            <strong>Note:</strong> Your login credentials and active company account session will remain untouched.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setResetSessionOpen(false)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={clearCallSessionState}
            variant="contained"
            color="warning"
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 2.5 }}
          >
            Reset Session Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will be signed out of this session. Any unsaved work may be
            lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setLogoutOpen(false)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
