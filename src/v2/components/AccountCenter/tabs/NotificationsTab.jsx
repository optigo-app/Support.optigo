import React, { useState, useEffect } from "react";
import { Box, Typography, Divider, Chip, Alert, Button } from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import { useNotificationManager } from "../../../context/NotificationManager";
import withNotification from "../../../hoc/withNotification";

const PillToggle = ({ checked, disabled, onChange }) => {
  const handleClick = () => {
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 24,
        borderRadius: 12,
        px: 1.5,
        py: 0.5,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.15s ease",
        opacity: disabled ? 0.8 : 1,
        bgcolor: checked ? "#e8f0fe" : "#f1f3f4",
        color: checked ? "#1a73e8" : "#5f6368",
        border: "1px solid",
        borderColor: checked ? "#d2e3fc" : "#dadce0",
        "&:hover": {
          bgcolor: checked ? "#d2e3fc" : "#e8eaed",
          borderColor: checked ? "#1a73e8" : "#9e9e9e",
        },
      }}
    >
      {checked ? (
        <CheckRoundedIcon sx={{ fontSize: 13, strokeWidth: 2 }} />
      ) : (
        <RemoveRoundedIcon sx={{ fontSize: 13, strokeWidth: 2 }} />
      )}
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, fontSize: 11, lineHeight: 1 }}
      >
        {checked ? "On" : "Off"}
      </Typography>
    </Box>
  );
};

const PrefRow = ({ icon, label, description, prefKey, prefs, onToggle }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      py: 1.8,
      px: 3,
      transition: "background-color 0.2s",
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={500} color="text.primary">
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary" display="block">
            {description}
          </Typography>
        )}
      </Box>
    </Box>
    <PillToggle
      checked={!!prefs?.[prefKey]}
      onChange={(val) => onToggle(prefKey, val)}
    />
  </Box>
);

function NotificationsTab({ showNotification = () => {} }) {
  const { notifPrefs, updatePref, requestPermission } = useNotificationManager();

  const [permissionState, setPermissionState] = useState(() =>
    "Notification" in window ? Notification.permission : "unsupported"
  );

  // Sync real-time browser permission status without overriding manual user preference
  useEffect(() => {
    const syncPermission = () => {
      if ("Notification" in window) {
        setPermissionState(Notification.permission);
        if (Notification.permission === "denied" && notifPrefs?.browserEnabled) {
          updatePref("browserEnabled", false);
        }
      }
    };

    syncPermission();
    window.addEventListener("focus", syncPermission);
    return () => window.removeEventListener("focus", syncPermission);
  }, [notifPrefs?.browserEnabled, updatePref]);

  const handleBrowserToggle = async (key, value) => {
    if (!("Notification" in window)) {
      showNotification("Browser notifications are not supported by this browser.", "warning");
      return;
    }

    const currentPerm = Notification.permission;

    if (value) {
      // User is trying to turn ON browser notifications
      if (currentPerm === "granted") {
        updatePref("browserEnabled", true);
        showNotification("Browser notifications enabled successfully!", "success");
      } else {
        const status = await requestPermission();
        const updatedPerm = "Notification" in window ? Notification.permission : status;
        setPermissionState(updatedPerm);

        if (status === "granted" || updatedPerm === "granted") {
          updatePref("browserEnabled", true);
          showNotification("Browser notifications allowed & enabled successfully!", "success");
        } else if (status === "denied" || updatedPerm === "denied") {
          updatePref("browserEnabled", false);
          showNotification(
            "Notifications are blocked in browser settings. Please click the lock icon next to your URL bar to allow notifications.",
            "warning"
          );
        } else {
          showNotification("Notification permission request was dismissed.", "info");
        }
      }
    } else {
      // User is turning OFF browser notifications
      updatePref("browserEnabled", false);
      showNotification("Browser notifications turned OFF.", "info");
    }
  };

  const handleEnableClick = async () => {
    if (!("Notification" in window)) {
      showNotification("Browser notifications are not supported.", "warning");
      return;
    }
    const status = await requestPermission();
    const currentPerm = Notification.permission;
    setPermissionState(currentPerm);

    if (status === "granted" || currentPerm === "granted") {
      showNotification("Browser notifications allowed & enabled!", "success");
    } else if (status === "denied" || currentPerm === "denied") {
      showNotification(
        "Notifications are blocked in browser settings. Please click the lock icon next to your URL bar to allow notifications.",
        "warning"
      );
    }
  };

  const isBrowserActive = notifPrefs?.browserEnabled && permissionState === "granted";

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
        Notifications
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Configure how and when you receive desktop and sound alerts
      </Typography>

      {/* Box 1: Browser & In-App Main Notification Switchers */}
      <Box
        sx={{
          borderRadius: 6,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
          mb: 2,
        }}
      >
        {/* Row 1: Browser Notifications */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.8,
            px: 3,
            transition: "background-color 0.2s",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                color: isBrowserActive ? "#1a73e8" : "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isBrowserActive ? (
                <NotificationsActiveRoundedIcon fontSize="small" />
              ) : (
                <NotificationsOffRoundedIcon fontSize="small" />
              )}
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  Browser Notifications
                </Typography>
                {permissionState === "denied" && (
                  <Chip
                    label="Blocked by Browser"
                    size="small"
                    color="error"
                    sx={{ fontSize: 9, height: 16, fontWeight: 700 }}
                  />
                )}
                {permissionState === "granted" && isBrowserActive && (
                  <Chip
                    label="Active"
                    size="small"
                    color="success"
                    sx={{ fontSize: 9, height: 16, fontWeight: 700 }}
                  />
                )}
                {permissionState === "granted" && !isBrowserActive && (
                  <Chip
                    label="Muted in App"
                    size="small"
                    sx={{ fontSize: 9, height: 16, fontWeight: 700, bgcolor: "#F1F5F9", color: "#64748B" }}
                  />
                )}
                {permissionState === "default" && (
                  <Chip
                    label="Permission Required"
                    size="small"
                    color="warning"
                    sx={{ fontSize: 9, height: 16, fontWeight: 700 }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {isBrowserActive
                  ? "Receiving desktop push alerts for support events"
                  : "Desktop push alerts are paused"}
              </Typography>
            </Box>
          </Box>
          <PillToggle
            checked={isBrowserActive}
            disabled={permissionState === "denied"}
            onChange={(val) => handleBrowserToggle("browserEnabled", val)}
          />
        </Box>

        {permissionState === "granted" && !isBrowserActive && (
          <Box sx={{ px: 3, pb: 1.5 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: 11, display: "block" }}>
              💡 <strong>Note:</strong> Alerts are muted in the app. Web browsers do not allow websites to toggle Chrome site settings programmatically. To also revoke permission at the browser level, click the site settings icon next to your URL bar.
            </Typography>
          </Box>
        )}

        {permissionState === "denied" && (
          <Box sx={{ px: 3, pb: 1.8 }}>
            <Alert severity="warning" sx={{ borderRadius: 2, py: 0.5, fontSize: 11 }}>
              Notifications are blocked by your browser settings. Please click the lock/settings icon next to your URL bar to allow notifications.
            </Alert>
          </Box>
        )}

        {permissionState === "default" && (
          <Box sx={{ px: 3, pb: 1.8 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleEnableClick}
              startIcon={<NotificationsActiveRoundedIcon />}
              sx={{ textTransform: "none", borderRadius: 2, py: 0.3, fontSize: 11, fontWeight: 600 }}
            >
              Request Browser Notification Permission
            </Button>
          </Box>
        )}

        <Divider sx={{ borderColor: "divider" }} />

        {/* Row 2: In-App Notifications */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.8,
            px: 3,
            transition: "background-color 0.2s",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                color: notifPrefs?.inAppEnabled ? "#1a73e8" : "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ForumRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500} color="text.primary">
                In-App Toast Alerts
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Receive pop-up message banners inside the dashboard
              </Typography>
            </Box>
          </Box>
          <PillToggle
            checked={!!notifPrefs?.inAppEnabled}
            onChange={(val) => {
              updatePref("inAppEnabled", val);
              showNotification(`In-app toast alerts turned ${val ? "ON" : "OFF"}.`, "info");
            }}
          />
        </Box>
      </Box>

      {/* Box 2: Per-Event Preferences Switches */}
      <Box
        sx={{
          borderRadius: 6,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <PrefRow
          icon={<VolumeUpRoundedIcon fontSize="small" />}
          label="In-app Sound Alert"
          description="Play a sound when notifications arrive"
          prefKey="soundEnabled"
          prefs={notifPrefs}
          onToggle={(k, v) => {
            updatePref(k, v);
            showNotification(`Sound alerts turned ${v ? "ON" : "OFF"}.`, "info");
          }}
        />
        <Divider sx={{ borderColor: "divider" }} />
        <PrefRow
          icon={<CallRoundedIcon fontSize="small" />}
          label="New Call Assigned"
          description="Alert when a telephone call is assigned to you"
          prefKey="onNewCall"
          prefs={notifPrefs}
          onToggle={(k, v) => {
            updatePref(k, v);
            showNotification(`New call assigned alerts turned ${v ? "ON" : "OFF"}.`, "info");
          }}
        />
        <Divider sx={{ borderColor: "divider" }} />
        <PrefRow
          icon={<ConfirmationNumberRoundedIcon fontSize="small" />}
          label="Ticket Created"
          description="Alert when a new support ticket is created"
          prefKey="onTicketCreate"
          prefs={notifPrefs}
          onToggle={(k, v) => {
            updatePref(k, v);
            showNotification(`Ticket creation alerts turned ${v ? "ON" : "OFF"}.`, "info");
          }}
        />
        <Divider sx={{ borderColor: "divider" }} />
        <PrefRow
          icon={<UpdateRoundedIcon fontSize="small" />}
          label="Ticket Status Updated"
          description="Alert when your tickets change state"
          prefKey="onTicketUpdate"
          prefs={notifPrefs}
          onToggle={(k, v) => {
            updatePref(k, v);
            showNotification(`Ticket update alerts turned ${v ? "ON" : "OFF"}.`, "info");
          }}
        />
        <Divider sx={{ borderColor: "divider" }} />
        <PrefRow
          icon={<ChatBubbleRoundedIcon fontSize="small" />}
          label="New Ticket Comment"
          description="Alert when someone replies to a ticket"
          prefKey="onComment"
          prefs={notifPrefs}
          onToggle={(k, v) => {
            updatePref(k, v);
            showNotification(`Ticket comment alerts turned ${v ? "ON" : "OFF"}.`, "info");
          }}
        />
      </Box>
    </Box>
  );
}

export default withNotification(NotificationsTab);

