import { useMemo, useState } from "react";
import { getAppBasePath } from "../../utils/AppBasePath";
import { Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/system";
import { useAuth } from "../../context/UseAuth";
import { useCallLog } from "../../context/UseCallLog";
import { useGreeting } from "../../hooks/useGreeting";
import { removeSkeyCookie } from "../../utils/AuthUtils";
import ModernMenu from "./Sidebar/index";
import NewHeader from "./Sidebar/NewHeader";

export const HeaderHeight = 45;
export const MainLayoutheight = `calc(100vh - ${HeaderHeight}px)`;

const HeaderWrapper = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const { user, UserRights } = useAuth();
  const { queue, forwardedCalls, setCurrentCall } = useCallLog();
  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);
  const Navigate = useNavigate();
  const { greeting } = useGreeting(user);

  const username = useMemo(() => {
    return user?.firstname && user?.lastname
      ? `${user.firstname} ${user.lastname}`
      : "Guest";
  }, [user]);
  const queueCount = useMemo(() => queue?.length || 0, [queue]);
  const forwardedLength = useMemo(
    () => forwardedCalls?.length || 0,
    [forwardedCalls],
  );
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const OnForwardClick = (call) => {
    setCurrentCall(call);
    handlePopoverClose();
    Navigate("/?queue=1");
  };

  const handleLogout = () => {
    // Clear all call-logger localStorage state so users are never stuck after re-login.
    // This covers: active call, timer, pause state, sliders, concurrent call, recording time.
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

  const IsTicket = location.pathname.toLowerCase() === "/ticket";

  const allowedPaths = ["/test"];

  const isLoginPage =
    location.pathname.toLowerCase().replace(/\/$/, "") === "/login";

  const isSingleTicketPage =
    location.pathname.toLowerCase().startsWith("/ticket/");

  if (isLoginPage || isSingleTicketPage) {
    return children;
  }

  if (allowedPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <>
      {/* New layout: sidebar left, page content right */}
      <Box
        sx={{
          width: "100%",
          height: HeaderHeight,
        }}
      >
        <NewHeader />
        {/* <MobDesignHeader/> */}
      </Box>
      <Box
        sx={{
          display: "flex",
          height: MainLayoutheight,
          overflow: "hidden",
          bgcolor: "transparent",
        }}
      >
        {/* ModernMenu is self-contained — imports its own context/hooks */}
        <ModernMenu />

        {/* Content panel takes remaining width and scrolls independently */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            minWidth: 0,
            border: "1px solid",
            borderColor: "divider",
            borderTopLeftRadius: "5px",
            bgcolor: "transparent",
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default HeaderWrapper;

{
  /*
      ── OLD AppBar (commented out 2026-04-15 — replaced by left sidebar ModernMenu) ──
      <AppBar
        position="static"
        sx={{
          bgcolor: "white",
          color: "black",
          borderRadius: 0,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          height: appBarHeight,
          borderBottom: IsTicket && `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <GreetingBar user={user} greeting={greeting} username={username} />
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <CallQueuePoper queueCount={queueCount} />
            <Chip
              icon={<PhoneForwardedIcon fontSize="small" />}
              label={`Forwarded Calls: ${forwardedLength || 0}`}
              color={(forwardedLength || 0) >= 1 ? "error" : "default"}
              onClick={handlePopoverOpen}
              sx={{ fontWeight: 500, borderRadius: 8, padding: "0.5rem", transition: "all 0.3s ease", height: 27 }}
            />
            <NavigationMenu />
            <LogoutButton handleLogout={handleLogout} />
          </Box>
        </Toolbar>
        <ForwardedCallsPopover openPopover={openPopover} anchorEl={anchorEl} handlePopoverClose={handlePopoverClose} forwardedCalls={forwardedCalls} OnForwardClick={OnForwardClick} />
      </AppBar>
      ── END OLD AppBar ──
      */
}
