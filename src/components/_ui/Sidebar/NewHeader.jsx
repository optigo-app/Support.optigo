import { useMemo, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Popover,
  Divider,
  Chip,
  Stack,
  InputBase,
  Paper,
  Badge,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  PhoneForwarded,
  LogOut,
  PanelRightOpen,
  PanelLeft,
} from "lucide-react";
import { useAuth } from "../../../context/UseAuth";
import { useCallLog } from "../../../context/UseCallLog";
import { useGreeting } from "../../../hooks/useGreeting";
import { removeSkeyCookie } from "../../../utils/AuthUtils";
import ForwardedCallsPopover from "../Header/ForwardedCallsPopover";
import GreetingButton from "../Header/GreetingButton";
import GlobalSearchBar from "../Header/GlobalSearchBar";
import AccountPopover from "../Header/AccountPopover";
import {
  mainSidebarCollapsed$,
  toggleMainSidebar,
  useSubject,
} from "../../../rxjs/layoutStore";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import { getAppBasePath } from "../../../utils/AppBasePath";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

const NewHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { queue, forwardedCalls, setCurrentCall } = useCallLog();
  const { greeting, period, hour, location } = useGreeting(user);
  const collapsed = useSubject(mainSidebarCollapsed$);

  const [fwdAnchorEl, setFwdAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const fullName = useMemo(() => {
    if (user?.fullName) return user.fullName;
    const name = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
    return name || user?.firstname || "Support Specialist";
  }, [user]);

  const initials = useMemo(() => {
    const f = user?.firstname?.[0] || "";
    const l = user?.lastname?.[0] || "";
    return (f + l).toUpperCase() || "U";
  }, [user]);

  const customerCode = useMemo(() => user?.customercode || "", [user]);
  const designation = useMemo(() => user?.designation || "", [user]);
  const role = useMemo(() => user?.role || "", [user]);
  const userId = useMemo(() => user?.id || "", [user]);
  const firmName = useMemo(() => user?.firmname || "", [user]);

  const queueCount = useMemo(() => queue?.length || 0, [queue]);
  const forwardedLength = useMemo(
    () => forwardedCalls?.length || 0,
    [forwardedCalls],
  );

  const handleFwdOpen = (event) => {
    setFwdAnchorEl(event.currentTarget);
  };

  const handleFwdClose = () => {
    setFwdAnchorEl(null);
  };

  const handleProfileOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleForwardClick = (call) => {
    setCurrentCall(call);
    handleFwdClose();
    navigate("/?queue=1");
  };

  const handleLogoutClick = () => {
    handleProfileClose();
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    const CALL_STORAGE_KEYS = [
      "call_recording_time",
      "current_call_data",
      "call_is_paused",
      "call_paused_duration",
      "call_pause_start_time",
      "call_sliders_state",
      "concurrent_call_data",
      "call_start_timestamp",
    ];
    CALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("app_active_skey");
    sessionStorage.clear();
    removeSkeyCookie();
    window.location.href = `${getAppBasePath()}/login`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1.5,
        userSelect: "none",
        boxSizing: "border-box",
        borderRadius: "0px",
        boxShadow: "none",
        border: "none",
        outline: "none",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Tooltip
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          arrow
        >
          <IconButton
            size="small"
            onClick={() => toggleMainSidebar()}
            sx={{
              borderRadius: "50px",
              bgcolor: "#F9FAFB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "#F1F5F9",
                color: "#0F172A",
                borderColor: "#CBD5E1",
              },
            }}
          >
            {collapsed ? <PanelRightOpen /> : <PanelLeft />}
          </IconButton>
        </Tooltip>

        <Typography
          sx={{ color: "#D1D5DB", fontSize: "18px", fontWeight: 300 }}
        >
          /
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          onClick={(e) => setAccountAnchorEl(e.currentTarget)}
          sx={{
            cursor: "pointer",
            py: 0.35,
            px: 0.85,
            borderRadius: "20px",
            border: "1px solid",
            borderColor: Boolean(accountAnchorEl) ? "#94A3B8" : "#E2E8F0",
            bgcolor: Boolean(accountAnchorEl) ? "#F1F5F9" : "#FAFAFA",
            transition: "all 0.15s ease",
            userSelect: "none",
            "&:hover": {
              bgcolor: "#F1F5F9",
              borderColor: "#CBD5E1",
            },
          }}
        >
          <GreetingButton
            hour={hour}
            period={period}
            greeting={greeting}
            fullName={fullName}
            location={location}
            size={28}
          />
          <UnfoldMoreRoundedIcon
            sx={{
              fontSize: 15,
              color: Boolean(accountAnchorEl) ? "#0F172A" : "#94A3B8",
              transition: "all 0.2s ease",
            }}
          />
        </Stack>
      </Stack>

      {/* ── Center: Global Search Bar with @Prefix & Tab Completion ── */}
      <GlobalSearchBar />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Badge
          badgeContent={queueCount}
          sx={{
            "& .MuiBadge-badge": {
              color: queueCount > 0 ? "#FFFFFF" : "#475569",
              bgcolor: queueCount > 0 ? "#DC2626" : "#E2E8F0",
              fontSize: "10px",
              height: 16,
              minWidth: 16,
              mt: 0.3,
              mr: 1,
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            component={Link}
            to="/?queue=1"
            sx={{
              cursor: "pointer",
              px: 0.75,
              py: 0.4,
              borderRadius: "3px",
              border: "1px solid #CBD5E1",
              bgcolor: "#F9FAFB",
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "#F1F5F9",
                borderColor: "#94A3B8",
              },
              textDecoration: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CallIcon width="22px" height="22px" />
            </Box>
            <Typography
              sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}
            >
              Call Queue
            </Typography>
            <UnfoldMoreRoundedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
          </Stack>
        </Badge>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Tooltip title="Forwarded Calls" arrow>
            <IconButton
              size="medium"
              sx={{ color: "#4B5563", bgcolor: "#F9FAFB" }}
              onClick={handleFwdOpen}
            >
              <Badge
                badgeContent={forwardedLength}
                sx={{
                  "& .MuiBadge-badge": {
                    color: forwardedLength >= 1 ? "#FFFFFF" : "#475569",
                    bgcolor: forwardedLength >= 1 ? "#DC2626" : "#E2E8F0",
                    fontSize: "10px",
                    height: 16,
                    minWidth: 16,
                  },
                }}
              >
                <PhoneForwarded
                  size={20}
                  strokeWidth={2.2}
                  color={forwardedLength >= 1 ? "#DC2626" : "#64748B"}
                />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton
            size="medium"
            sx={{ color: "#4B5563", bgcolor: "#F9FAFB" }}
          >
            <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ cursor: "pointer" }}
            onClick={handleProfileOpen}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: "#374151",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {initials}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#10B981",
                  border: "1.5px solid #FFFFFF",
                }}
              />
            </Avatar>
            <KeyboardArrowDownRoundedIcon
              sx={{ fontSize: 16, color: "#6B7280" }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* ── Forwarded Calls Popover ── */}
      <ForwardedCallsPopover
        openPopover={Boolean(fwdAnchorEl)}
        anchorEl={fwdAnchorEl}
        handlePopoverClose={handleFwdClose}
        forwardedCalls={forwardedCalls}
        OnForwardClick={handleForwardClick}
      />

      {/* ── Workspace / Account Switcher Popover ── */}
      <AccountPopover
        anchorEl={accountAnchorEl}
        open={Boolean(accountAnchorEl)}
        onClose={() => setAccountAnchorEl(null)}
      />

      {/* ── User Profile & Account Popover (Real Data) ── */}
      <Popover
        open={Boolean(profileAnchorEl)}
        anchorEl={profileAnchorEl}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 290,
            borderRadius: "14px",
            boxShadow:
              "0px 16px 40px rgba(0, 0, 0, 0.14), 0px 0px 0px 1px rgba(0,0,0,0.06)",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          },
        }}
      >
        {/* User Card Header */}
        <Box
          sx={{ p: 2, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  border: "1.5px solid #CBD5E1",
                  bgcolor: "#6900C6",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                {initials}
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
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 800,
                  color: "#0F172A",
                  fontSize: "0.92rem",
                  textTransform: "capitalize",
                  letterSpacing: "-0.01em",
                }}
              >
                {fullName}
              </Typography>
              {customerCode && (
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    color: "#64748B",
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  @{customerCode}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Badges: Designation, Role, Customer Code */}
          <Box sx={{ display: "flex", gap: 0.6, mt: 1.3, flexWrap: "wrap" }}>
            {designation && (
              <Chip
                label={designation}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                  border: "1px solid #BFDBFE",
                  borderRadius: "5px",
                }}
              />
            )}
            {role && role.toLowerCase() !== designation.toLowerCase() && (
              <Chip
                label={role}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: "#F5F3FF",
                  color: "#6900C6",
                  border: "1px solid #DDD6FE",
                  borderRadius: "5px",
                  textTransform: "capitalize",
                }}
              />
            )}
            {userId && (
              <Chip
                label={`ID #${userId}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: "#F1F5F9",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  borderRadius: "5px",
                }}
              />
            )}
          </Box>
        </Box>

        {/* Real User Profile Details */}
        <Box
          sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 0.5,
            }}
          >
            <Typography
              sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
            >
              Customer Code
            </Typography>
            <Typography
              sx={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 700 }}
            >
              {customerCode || "N/A"}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 0.5,
            }}
          >
            <Typography
              sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
            >
              Designation
            </Typography>
            <Typography
              sx={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 700 }}
            >
              {designation || "N/A"}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 0.5,
            }}
          >
            <Typography
              sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
            >
              Role
            </Typography>
            <Typography
              sx={{
                fontSize: "0.78rem",
                color: "#0F172A",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {role || "N/A"}
            </Typography>
          </Box>

          {firmName && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 0.5,
              }}
            >
              <Typography
                sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
              >
                Firm Name
              </Typography>
              <Typography
                sx={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 700 }}
              >
                {firmName}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderBottom: "1px solid #F1F5F9" }} />

        {/* Sign Out Action */}
        <Box sx={{ p: 1 }}>
          <Box
            onClick={handleLogoutClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              px: 1.2,
              py: 0.8,
              borderRadius: "7px",
              cursor: "pointer",
              color: "#DC2626",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#FEF2F2" },
            }}
          >
            <LogOut size={15} strokeWidth={2.5} />
            <Typography
              variant="body2"
              sx={{ fontSize: "0.82rem", fontWeight: 700 }}
            >
              Sign Out
            </Typography>
          </Box>
        </Box>
      </Popover>

      {/* ── Logout Confirmation Dialog ── */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="header-logout-dialog-title"
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 320,
            borderRadius: "12px",
            p: 1.5,
          },
        }}
      >
        <DialogTitle
          id="header-logout-dialog-title"
          sx={{ fontWeight: 700, fontSize: "16px", p: 1 }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ p: 1, pb: 2 }}>
          <DialogContentText sx={{ color: "#52525b", fontSize: "14px" }}>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 1, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            color="inherit"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            color="error"
            size="small"
            autoFocus
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}
          >
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NewHeader;

const CallIcon = ({
  width = "22px",
  height = "22px",
  strokeWidth = 1.4,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      style={{ display: "block" }}
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <g
        fill="none"
        stroke="red"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path
          strokeDasharray="62"
          d="M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.36s"
            values="62;0"
          />
          <animateTransform
            attributeName="transform"
            dur="1.62s"
            keyTimes="0;0.035;0.07;0.105;0.14;0.175;0.21;0.245;0.28;1"
            repeatCount="indefinite"
            type="rotate"
            values="0 12 12;15 12 12;0 12 12;-12 12 12;0 12 12;12 12 12;0 12 12;-15 12 12;0 12 12;0 12 12"
          />
        </path>
        <path
          strokeDasharray="6"
          strokeDashoffset="6"
          d="M15.76 8.28c-0.5 -0.51 -1.1 -0.93 -1.76 -1.24M15.76 8.28c0.49 0.49 0.9 1.08 1.2 1.72"
        >
          <animate
            attributeName="stroke-dashoffset"
            begin="0.42s"
            dur="1.62s"
            keyTimes="0;0.15;0.3;1"
            repeatCount="indefinite"
            values="6;0;6;6"
          />
        </path>
        <path
          strokeDasharray="8"
          strokeDashoffset="8"
          d="M18.67 5.35c-1 -1 -2.26 -1.73 -3.67 -2.1M18.67 5.35c0.99 1 1.72 2.25 2.08 3.65"
        >
          <animate
            attributeName="stroke-dashoffset"
            begin="0.6s"
            dur="1.62s"
            keyTimes="0;0.15;0.3;1"
            repeatCount="indefinite"
            values="8;0;8;8"
          />
        </path>
      </g>
    </svg>
  );
};
