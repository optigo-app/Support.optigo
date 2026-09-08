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
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

// Context + Sections
import { useAuth } from "../../context/UseAuth";
import { removeSkeyCookie } from "../../utils/AuthUtils";
import { clearCallSessionState } from "../../utils/callLogUtils";
import ProfileTab from "./tabs/ProfileTab";
import NotificationsTab from "./tabs/NotificationsTab";
import AccountsTab from "./tabs/AccountsTab";
import SupportTab from "./tabs/SupportTab";

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
    window.location.href = "/login";
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#ffffff",
        width: "100%",
        overflowY: "auto",
      }}
    >
      {/* --- MAIN BODY --- */}
      <Box
        sx={{
          flexGrow: 1,
          px: { xs: 3, md: 5 },
          py: 5,
        }}
      >
        <Box sx={{ maxWidth: 680, mx: "auto" }}>
          {/* Welcome Header */}
          <Box
            sx={{ mb: 4.5, display: "flex", alignItems: "center", gap: 2.5 }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                fontSize: 20,
                fontWeight: 800,
                background: "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)",
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                fontWeight={600}
                color="text.primary"
                gutterBottom
              >
                Welcome, {fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your credentials, notifications, saved workspaces, and
                get support help.
              </Typography>
            </Box>
          </Box>

          {/* Compact Sections Stack */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* 1. Profile section */}
            <ProfileTab />

            {/* 2. Notifications section */}
            <NotificationsTab />

            {/* 3. Saved accounts section */}
            <AccountsTab />

            {/* 4. Support section */}
            <SupportTab />

            {/* 5. Call Session Reset Section */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mt: 3, mb: 0.5 }}
            >
              Call Session & Troubleshooting
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Reset stuck call timers, paused calls, or hung active call overlays without logging out
            </Typography>

            <Paper
              onClick={() => setResetSessionOpen(true)}
              sx={{
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "warning.light",
                bgcolor: "rgba(255, 152, 0, 0.04)",
                px: 3,
                py: 2.2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 152, 0, 0.1)",
                  borderColor: "warning.main",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.12)",
                },
              }}
              elevation={0}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    bgcolor: "rgba(255, 152, 0, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ED6C02",
                  }}
                >
                  <RestartAltRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="text.primary"
                  >
                    Clear Active Call & Timer Session
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Un-freezes stuck '+ ADD' call button and clears hung timers (Keeps login active)
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                color="warning"
                size="small"
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  px: 2,
                }}
              >
                Reset Session
              </Button>
            </Paper>

            {/* 6. Sign Out section */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mt: 3, mb: 0.5 }}
            >
              Sign Out
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Logout of your account session on this browser
            </Typography>

            <Paper
              onClick={() => setLogoutOpen(true)}
              sx={{
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                px: 3,
                py: 2.2,
                mb: 6,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": {
                  bgcolor: "error.light",
                  borderColor: "error.main",
                  "& .logout-label": { color: "error.dark" },
                },
              }}
              elevation={0}
            >
              <LogoutRoundedIcon sx={{ color: "error.main", fontSize: 22 }} />
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.primary"
                className="logout-label"
              >
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
