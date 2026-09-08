import * as React from "react";
import {
  List,
  ListItemButton,
  Box,
  Tooltip,
  Typography,
  Divider,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import AllInboxRoundedIcon from "@mui/icons-material/AllInboxRounded";
import TollRoundedIcon from "@mui/icons-material/TollRounded";
import Call from "@mui/icons-material/Call";
import InsertDriveFile from "@mui/icons-material/InsertDriveFile";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { useCallLog } from "../../../context/UseCallLog";
import { removeSkeyCookie } from "../../../utils/AuthUtils";
import { isArchiveDomain } from "../../../utils/AppBasePath";
import ForwardedCallsPopover from "../Header/ForwardedCallsPopover";
import { mainSidebarCollapsed$, useSubject } from "../../../rxjs/layoutStore";

const SIDEBAR_OPEN = 240;
const SIDEBAR_CLOSED = 64;
const EASE = "0.35s cubic-bezier(0.4,0,0.2,1)";

const ALL_NAV_BUTTONS = [
  { label: "Call log", path: "/", icon: <Call fontSize="small" /> },
  // { label: "New Call", path: "/newCall", icon: <Call fontSize="small" /> },
  {
    label: "Archive Calllog",
    path: "/Archive",
    icon: <ArchiveRoundedIcon fontSize="small" />,
  },
  {
    label: "Ticket",
    path: "/Ticket",
    icon: <InsertDriveFile fontSize="small" />,
  },
  {
    label: "Training",
    path: "/Training",
    icon: <CloudSyncRoundedIcon fontSize="small" />,
  },
  {
    label: "Order Request",
    path: "/OrderRequest",
    icon: <TollRoundedIcon fontSize="small" />,
  },
  {
    label: "Orders",
    path: "/Orders",
    icon: <AllInboxRoundedIcon fontSize="small" />,
  },
];

const NAV_BUTTONS = ALL_NAV_BUTTONS.filter((btn) => {
  if (btn.path === "/Archive" || btn.path === "/archive") {
    return isArchiveDomain();
  }
  return true;
});

function IconSlot({ children, badge, collapsed }) {
  return (
    <Box
      sx={{
        width: 40,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {children}
      {collapsed && badge > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: -15,
            right: -8,
            width: 23,
            height: 23,
            bgcolor: "#fff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #6363636e",
          }}
        >
          <Typography
            sx={{ color: "#000", fontSize: 12, fontWeight: 700, lineHeight: 1 }}
          >
            {badge > 99 ? "99+" : badge}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function FadeLabel({ collapsed, children }) {
  return (
    <Box
      component="span"
      sx={{
        whiteSpace: "nowrap",
        display: "inline-block",
        lineHeight: 1,
        ml: 1.5,
        fontSize: 14,
        opacity: collapsed ? 0 : 1,
        maxWidth: collapsed ? 0 : 200,
        transform: collapsed ? "translateX(-6px)" : "translateX(0)",
        transition: `opacity ${EASE}, max-width ${EASE}, transform ${EASE}, margin ${EASE}`,
        pointerEvents: collapsed ? "none" : "auto",
        ...(collapsed && { ml: 0 }),
      }}
    >
      {children}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ModernMenu() {
  const collapsed = useSubject(mainSidebarCollapsed$);
  const [fwdAnchorEl, setFwdAnchorEl] = React.useState(null); // forwarded calls popover
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const { forwardedCalls, setCurrentCall } = useCallLog();
  const Navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

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
    KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("app_active_skey");
    sessionStorage.clear();
    removeSkeyCookie();
    window.location.href = "/login";
  };

  const handleFwdClose = () => setFwdAnchorEl(null);
  const onForwardClick = (call) => {
    setCurrentCall(call);
    handleFwdClose();
    Navigate("/?queue=1");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: collapsed ? SIDEBAR_CLOSED : SIDEBAR_OPEN,
        height: "100vh",
        transition: `width ${EASE}`,
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        boxSizing: "border-box",
        borderRadius: "0px",
        boxShadow: "none",
        border: "none",
        outline: "none",
      }}
      data-tour="navbar"
    >
      {/* Inner wrapper fills sidebar width */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* ── Header: Avatar (= toggle) + name/greeting ─────────────────────── */}
        <Box
          sx={{
            px: 1,
            pt: 1,
          }}
        ></Box>
        <List component="nav" disablePadding sx={{ flex: 1 }}>
          {NAV_BUTTONS.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname
                    .toLowerCase()
                    .startsWith(item.path.toLowerCase());

            return (
              <Tooltip
                key={item.path}
                title={collapsed ? item.label : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    px: 1,
                    py: 0,
                    mx: 0.5,
                    borderRadius: 1,
                    justifyContent: "flex-start",
                    minWidth: 0,
                    ...(isActive && {
                      background:
                        "linear-gradient(135deg, #b2069b 0%, #3909c2 100%)",
                      color: "#fff",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #c207ab 0%, #4510d6 100%)",
                      },
                      "& .MuiListItemIcon-root": { color: "#fff" },
                      "&.Mui-selected": {
                        background:
                          "linear-gradient(135deg, #b2069b 0%, #3909c2 100%)",
                      },
                      "&.Mui-selected:hover": {
                        background:
                          "linear-gradient(135deg, #c207ab 0%, #4510d6 100%)",
                      },
                    }),
                  }}
                >
                  <IconSlot>{item.icon}</IconSlot>
                  <FadeLabel collapsed={collapsed}>{item.label}</FadeLabel>
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
        <Divider />
        <Box
          sx={{ py: 0.75, display: "flex", flexDirection: "column", gap: 0.25 }}
        >
          <Tooltip title={collapsed ? "Logout" : ""} placement="right" arrow>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 0,
                justifyContent: "flex-start",
                minWidth: 0,
                color: "text.secondary",
                "&:hover": { color: "error.main" },
              }}
            >
              <IconSlot>
                <LogoutRoundedIcon fontSize="small" />
              </IconSlot>
              <FadeLabel collapsed={collapsed}>Logout</FadeLabel>
            </ListItemButton>
          </Tooltip>
        </Box>
        <ForwardedCallsPopover
          openPopover={Boolean(fwdAnchorEl)}
          anchorEl={fwdAnchorEl}
          handlePopoverClose={handleFwdClose}
          forwardedCalls={forwardedCalls}
          OnForwardClick={onForwardClick}
        />
        <Dialog
          open={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
          aria-labelledby="logout-dialog-title"
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
            id="logout-dialog-title"
            sx={{ fontWeight: 700, fontSize: "16px", p: 1 }}
          >
            Confirm Logout
          </DialogTitle>
          <DialogContent sx={{ p: 1, pb: 2 }}>
            <DialogContentText sx={{ color: "#555", fontSize: "14px" }}>
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
      </Box>
    </Paper>
  );
}
