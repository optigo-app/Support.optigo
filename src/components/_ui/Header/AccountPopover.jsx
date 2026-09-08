import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Popover,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";
import Switch from "@mui/material/Switch";
import { useAuth } from "../../../context/UseAuth";
import { useNotificationManager } from "../../../context/NotificationManager";
import { removeSkeyCookie } from "../../../utils/AuthUtils";

const getInitials = (firstname = "", lastname = "") =>
  `${firstname?.[0] || ""}${lastname?.[0] || ""}`.toUpperCase() || "U";

const getAvatarBg = (str = "") => {
  const palettes = [
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
    "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
    "linear-gradient(135deg, #D97706 0%, #DC2626 100%)",
    "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
  ];
  let hash = 0;
  for (const ch of str) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
};

const AccountPopover = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const { user, savedAccounts = [], switchAccount } = useAuth();
  const { notifPrefs, updatePref, requestPermission } = useNotificationManager();

  const isNotificationsOn = Boolean(notifPrefs?.browserEnabled || notifPrefs?.inAppEnabled);

  const handleToggleNotifications = async (e) => {
    e?.stopPropagation();
    const nextVal = !isNotificationsOn;

    if (nextVal) {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          updatePref("browserEnabled", true);
          updatePref("inAppEnabled", true);
        } else if (Notification.permission === "default") {
          const status = await requestPermission();
          if (status === "granted") {
            updatePref("browserEnabled", true);
          }
          updatePref("inAppEnabled", true);
        } else {
          // Denied in browser - enable in-app toast alerts
          updatePref("inAppEnabled", true);
          updatePref("browserEnabled", false);
        }
      } else {
        updatePref("inAppEnabled", true);
      }
    } else {
      updatePref("browserEnabled", false);
      updatePref("inAppEnabled", false);
    }
  };

  const activeEmail = user?.userid || user?.email || "";
  const activeCompany = user?.companycode || user?.customercode || user?.companyname || user?.firmname || "";
  const activeFullName =
    user?.fullName ||
    `${user?.firstname || ""} ${user?.lastname || ""}`.trim() ||
    "User";
  const activeInitials = getInitials(user?.firstname, user?.lastname);
  const activeDesignation = user?.designation || user?.role || "Support Specialist";

  const isCurrent = (acc) =>
    acc.email?.toLowerCase() === activeEmail?.toLowerCase() &&
    (acc.companyCode?.toLowerCase() === activeCompany?.toLowerCase() ||
      acc.customercode?.toLowerCase() === activeCompany?.toLowerCase());

  const otherAccounts = savedAccounts
    .filter((acc) => !isCurrent(acc))
    .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

  const handleNavigateAccountCenter = () => {
    onClose();
    navigate("/account");
  };

  const handleAddAccount = () => {
    onClose();
    window.open("/login?addAccount=1", "_blank");
  };

  const handleSwitch = (skey) => {
    if (!skey) return;
    onClose();
    switchAccount(skey);
  };

  const handleLogout = () => {
    onClose();
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
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          mt: 1.2,
          width: 324,
          borderRadius: "14px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow:
            "0 20px 48px -6px rgba(0, 0, 0, 0.16), 0 1px 3px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          bgcolor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(24px)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        },
      }}
    >
      {/* ── Active Account Workspace Card ── */}
      <Box sx={{ p: 1.75, bgcolor: "rgba(248, 250, 252, 0.8)", borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: getAvatarBg(activeCompany || activeFullName),
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 700,
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
              }}
            >
              {activeInitials}
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#10B981",
                border: "2px solid #FFFFFF",
              }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontWeight: 650,
                fontSize: "0.9rem",
                color: "#0F172A",
                lineHeight: 1.25,
                textTransform: "capitalize",
                letterSpacing: "-0.01em",
              }}
            >
              {activeFullName}
            </Typography>

            <Typography
              noWrap
              sx={{
                fontSize: "0.75rem",
                color: "#64748B",
                mt: 0.2,
                lineHeight: 1.2,
              }}
            >
              {activeDesignation}
            </Typography>

            {activeCompany && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <BusinessRoundedIcon sx={{ fontSize: 13, color: "#4F46E5" }} />
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#4338CA",
                    bgcolor: "rgba(238, 242, 255, 0.9)",
                    px: 0.6,
                    py: 0.1,
                    borderRadius: "4px",
                    letterSpacing: "0.01em",
                  }}
                >
                  {activeCompany}
                </Typography>
              </Box>
            )}
          </Box>

          <CheckRoundedIcon sx={{ fontSize: 18, color: "#10B981", flexShrink: 0 }} />
        </Box>
      </Box>

      {/* ── Switch Accounts Section ── */}
      {otherAccounts.length > 0 && (
        <Box sx={{ py: 0.75 }}>
          <Box sx={{ px: 2, py: 0.5 }}>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Switch Account
            </Typography>
          </Box>

          <List disablePadding sx={{ maxHeight: 160, overflowY: "auto", px: 0.75 }}>
            {otherAccounts.map((acc, i) => {
              const name =
                `${acc.firstname || ""} ${acc.lastname || ""}`.trim() ||
                acc.email;
              const initials = getInitials(acc.firstname, acc.lastname);
              const company = acc.companyCode || acc.customercode || "";

              return (
                <ListItemButton
                  key={acc.skey || `${acc.email}-${company}-${i}`}
                  onClick={() => handleSwitch(acc.skey)}
                  sx={{
                    px: 1.25,
                    py: 0.75,
                    borderRadius: "8px",
                    gap: 1.25,
                    transition: "all 0.15s ease",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      background: getAvatarBg(company || name),
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      borderRadius: "7px",
                      color: "#FFFFFF",
                    }}
                  >
                    {initials}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: "#1E293B",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {name}
                        </Typography>
                        {company && (
                          <Typography
                            noWrap
                            sx={{
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              color: "#64748B",
                              bgcolor: "rgba(0, 0, 0, 0.04)",
                              px: 0.5,
                              py: 0.1,
                              borderRadius: "3px",
                            }}
                          >
                            {company}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        noWrap
                        sx={{ fontSize: "0.72rem", color: "#94A3B8" }}
                      >
                        {acc.email}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
          <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.06)", my: 0.5 }} />
        </Box>
      )}

      {/* ── Quick Notification Control ── */}
      <Box sx={{ px: 1, py: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.25,
            py: 0.75,
            borderRadius: "8px",
            bgcolor: isNotificationsOn ? "rgba(79, 70, 229, 0.05)" : "rgba(241, 245, 249, 0.7)",
            border: "1px solid",
            borderColor: isNotificationsOn ? "rgba(79, 70, 229, 0.15)" : "rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: isNotificationsOn ? "rgba(79, 70, 229, 0.12)" : "rgba(148, 163, 184, 0.15)",
                color: isNotificationsOn ? "#4F46E5" : "#64748B",
                transition: "all 0.2s ease",
              }}
            >
              {isNotificationsOn ? (
                <NotificationsActiveRoundedIcon sx={{ fontSize: 16 }} />
              ) : (
                <NotificationsOffRoundedIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E293B", lineHeight: 1.2 }}>
                Notifications
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: isNotificationsOn ? "#4F46E5" : "#64748B" }}>
                {isNotificationsOn ? "Alerts enabled" : "Muted"}
              </Typography>
            </Box>
          </Box>

          <Switch
            size="small"
            checked={isNotificationsOn}
            onChange={handleToggleNotifications}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#4F46E5",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#4F46E5",
              },
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.06)", my: 0.25 }} />

      {/* ── Action Options ── */}
      <Box sx={{ p: 0.75 }}>
        <ListItemButton
          onClick={handleAddAccount}
          sx={{
            py: 0.75,
            px: 1.25,
            borderRadius: "8px",
            gap: 1.25,
            transition: "all 0.15s ease",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 17, color: "#64748B" }} />
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, color: "#334155" }}>
            Add another account
          </Typography>
        </ListItemButton>

        <ListItemButton
          onClick={handleNavigateAccountCenter}
          sx={{
            py: 0.75,
            px: 1.25,
            borderRadius: "8px",
            gap: 1.25,
            transition: "all 0.15s ease",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          <SettingsRoundedIcon sx={{ fontSize: 17, color: "#64748B" }} />
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, color: "#334155" }}>
            Account settings
          </Typography>
        </ListItemButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.06)" }} />

      {/* ── Sign Out ── */}
      <Box sx={{ p: 0.75 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 0.7,
            px: 1.25,
            borderRadius: "8px",
            gap: 1.25,
            transition: "all 0.15s ease",
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)", color: "#DC2626" },
          }}
        >
          <LogoutRoundedIcon sx={{ fontSize: 17, color: "#EF4444" }} />
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#EF4444" }}>
            Sign out
          </Typography>
        </ListItemButton>
      </Box>
    </Popover>
  );
};

export default React.memo(AccountPopover);
