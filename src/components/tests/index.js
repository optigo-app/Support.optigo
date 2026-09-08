

import {
  Box,
  Typography,
  InputBase,
  IconButton,
  Avatar,
  Badge,
  Divider,
  Paper,
  Stack,
} from '@mui/material';

// MUI Icons (Rounded Variants)
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import PushPinOutlinedRoundedIcon from '@mui/icons-material/PushPinRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AssignmentOutlinedRoundedIcon from '@mui/icons-material/AssignmentRounded';
import LayersOutlinedRoundedIcon from '@mui/icons-material/LayersRounded';
import SettingsOutlinedRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';

// ==========================================
// 1. TOP HEADER (Workspace / Mob Design Courses)
// ==========================================
export const MobDesignHeader = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        px: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height:'100%',
        boxShadow:'none',
      }}
    >
      {/* Left Section */}
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {/* Brand Icon */}
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            bgcolor: '#FF5722',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <ElectricBoltRoundedIcon sx={{ fontSize: 18 }} />
        </Box>

        <Typography sx={{ color: '#D1D5DB', fontSize: '18px', fontWeight: 300 }}>
          /
        </Typography>

        {/* Workspace Dropdown */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            cursor: 'pointer',
            py: 0.5,
            px: 1,
            borderRadius: '8px',
            '&:hover': { bgcolor: '#F9FAFB' },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              bgcolor: '#111827',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            •••
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
            Mob Design Courses
          </Typography>
          <UnfoldMoreRoundedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
        </Stack>

        {/* Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#F3F4F6',
            borderRadius: '8px',
            px: 1.5,
            py: 0.5,
            width: 260,
            ml: 1,
          }}
        >
          <SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18, mr: 1 }} />
          <InputBase
            placeholder="Search Mob Design Courses"
            sx={{
              fontSize: '0.815rem',
              color: '#1F2937',
              width: '100%',
              '& input::placeholder': { color: '#9CA3AF', opacity: 1 },
            }}
          />
        </Box>
      </Stack>

      {/* Right Section */}
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <IconButton size="small" sx={{ color: '#4B5563' }}>
          <Badge
            badgeContent={5}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#EF4444',
                color: '#fff',
                fontSize: '10px',
                height: 16,
                minWidth: 16,
              },
            }}
          >
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </Badge>
        </IconButton>

        <IconButton size="small" sx={{ color: '#4B5563' }}>
          <PushPinOutlinedRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton size="small" sx={{ color: '#4B5563' }}>
          <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Balance Badge */}
        <Box
          sx={{
            bgcolor: '#F3F4F6',
            color: '#1F2937',
            px: 1.25,
            py: 0.5,
            borderRadius: '16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          $2.11
        </Box>

        {/* User Profile Avatar with dropdown arrow */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }}>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: '#374151',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            AS
          </Avatar>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
        </Stack>
      </Stack>
    </Paper>
  );
};


// ==========================================
// 3. BOTTOM HEADER (Intuit QuickBooks)
// ==========================================
export const QuickBooksHeader = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        bgcolor: '#ffffff',
        px: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '0 0 12px 12px',
        height:'100%'
      }}
    >
      {/* Left Logo + Company */}
      <Stack direction="row" alignItems="center" spacing={2.5}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ cursor: 'pointer' }}>
          {/* Green QB circle */}
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: '#2CA01C',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px',
              lineHeight: 1,
            }}
          >
            qb
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              sx={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#393A3D',
                letterSpacing: '0.6px',
                lineHeight: 1,
              }}
            >
              INTUIT
            </Typography>
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#393A3D',
                lineHeight: 1.1,
                letterSpacing: '-0.2px',
              }}
            >
              quickbooks
            </Typography>
          </Box>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ height: 22, my: 'auto', bgcolor: '#E5E7EB' }} />

        <Typography sx={{ fontSize: '0.925rem', fontWeight: 700, color: '#393A3D' }}>
          AS Mobbin
        </Typography>
      </Stack>

      {/* Center Global Search (Pill shaped) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#ffffff',
          border: '1px solid #CBD5E1',
          borderRadius: '50px',
          px: 2,
          py: 0.7,
          width: 500,
          transition: 'all 0.2s',
          '&:hover, &:focus-within': {
            borderColor: '#2CA01C',
            boxShadow: '0 0 0 1px #2CA01C',
          },
        }}
      >
        <SearchRoundedIcon sx={{ color: '#475569', fontSize: 18, mr: 1.25 }} />
        <InputBase
          placeholder="Navigate or search for transactions, contacts, reports, and more"
          sx={{
            fontSize: '0.815rem',
            color: '#334155',
            width: '100%',
            '& input::placeholder': { color: '#64748B', opacity: 1 },
          }}
        />
      </Box>

      {/* Right Icons + Avatar */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" sx={{ color: '#475569' }}>
          <AssignmentOutlinedRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton size="small" sx={{ color: '#475569' }}>
          <LayersOutlinedRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton size="small" sx={{ color: '#475569' }}>
          <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton size="small" sx={{ color: '#475569' }}>
          <SettingsOutlinedRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton size="small" sx={{ color: '#475569' }}>
          <HelpOutlineRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Intuit Blue Avatar */}
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: '#0077C5',
            fontSize: '0.8rem',
            fontWeight: 700,
            ml: 0.5,
            cursor: 'pointer',
          }}
        >
          A
        </Avatar>
      </Stack>
    </Paper>
  );
};

// ==========================================
// PREVIEW CONTAINER
// ==========================================
export default function AppHeadersPreview() {
  return (
    <Box
      sx={{
        bgcolor: '#1E1E1E',
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <MobDesignHeader />
      <QuickBooksHeader />
    </Box>
  );
}


// import React, { useMemo, useState } from "react";
// import {
//   Box,
//   Avatar,
//   Typography,
//   IconButton,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Button,
//   Popover,
//   Divider,
//   Chip,
//   Stack,
//   InputBase,
//   Paper,
//   Badge,
// } from "@mui/material";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   PhoneForwarded,
//   PhoneCall,
//   LogOut,
//   PanelRightOpen,
//   PanelLeft,
// } from "lucide-react";
// import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
// import { useAuth } from "../../../context/UseAuth";
// import { useCallLog } from "../../../context/UseCallLog";
// import { useGreeting } from "../../../hooks/useGreeting";
// import { removeSkeyCookie } from "../../../utils/AuthUtils";
// import ForwardedCallsPopover from "../Header/ForwardedCallsPopover";
// import GreetingButton from "../Header/GreetingButton";
// import {
//   mainSidebarCollapsed$,
//   toggleMainSidebar,
//   useSubject,
// } from "../../../rxjs/layoutStore";
// import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
// import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
// import { getAppBasePath } from "../../../utils/AppBasePath";
// import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
// import PushPinOutlinedRoundedIcon from "@mui/icons-material/PushPinRounded";
// import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
// import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

// const NewHeader = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { queue, forwardedCalls, setCurrentCall } = useCallLog();
//   const { greeting, period, hour, location } = useGreeting(user);
//   const collapsed = useSubject(mainSidebarCollapsed$);

//   const [fwdAnchorEl, setFwdAnchorEl] = useState(null);
//   const [profileAnchorEl, setProfileAnchorEl] = useState(null);
//   const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

//   const fullName = useMemo(() => {
//     if (user?.fullName) return user.fullName;
//     const name = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
//     return name || user?.firstname || "Support Specialist";
//   }, [user]);

//   const initials = useMemo(() => {
//     const f = user?.firstname?.[0] || "";
//     const l = user?.lastname?.[0] || "";
//     return (f + l).toUpperCase() || "U";
//   }, [user]);

//   const customerCode = useMemo(() => user?.customercode || "", [user]);
//   const designation = useMemo(() => user?.designation || "", [user]);
//   const role = useMemo(() => user?.role || "", [user]);
//   const userId = useMemo(() => user?.id || "", [user]);
//   const firmName = useMemo(() => user?.firmname || "", [user]);

//   const queueCount = useMemo(() => queue?.length || 0, [queue]);
//   const forwardedLength = useMemo(
//     () => forwardedCalls?.length || 0,
//     [forwardedCalls],
//   );

//   const handleFwdOpen = (event) => {
//     setFwdAnchorEl(event.currentTarget);
//   };

//   const handleFwdClose = () => {
//     setFwdAnchorEl(null);
//   };

//   const handleProfileOpen = (event) => {
//     setProfileAnchorEl(event.currentTarget);
//   };

//   const handleProfileClose = () => {
//     setProfileAnchorEl(null);
//   };

//   const handleForwardClick = (call) => {
//     setCurrentCall(call);
//     handleFwdClose();
//     navigate("/?queue=1");
//   };

//   const handleLogoutClick = () => {
//     handleProfileClose();
//     setLogoutDialogOpen(true);
//   };

//   const confirmLogout = () => {
//     const CALL_STORAGE_KEYS = [
//       "call_recording_time",
//       "current_call_data",
//       "call_is_paused",
//       "call_paused_duration",
//       "call_pause_start_time",
//       "call_sliders_state",
//       "concurrent_call_data",
//       "call_start_timestamp",
//     ];
//     CALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
//     localStorage.removeItem("app_active_skey");
//     sessionStorage.clear();
//     removeSkeyCookie();
//     window.location.href = `${getAppBasePath()}/login`;
//   };

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         width: "100%",
//         height: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         px: 1.5,
//         userSelect: "none",
//         boxSizing: "border-box",
//         borderRadius: "0px",
//         boxShadow: "none",
//         border: "none",
//         outline: "none",
//       }}
//     >
//       <Stack direction="row" alignItems="center" spacing={1.5}>
//         <Tooltip
//           title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//           arrow
//         >
//           <IconButton
//             size="small"
//             onClick={() => toggleMainSidebar()}
//             sx={{
//               borderRadius: "50px",
//               bgcolor: "#F9FAFB",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#475569",
//               cursor: "pointer",
//               transition: "all 0.15s ease",
//               "&:hover": {
//                 bgcolor: "#F1F5F9",
//                 color: "#0F172A",
//                 borderColor: "#CBD5E1",
//               },
//             }}
//           >
//             {collapsed ? <PanelRightOpen /> : <PanelLeft />}
//           </IconButton>
//         </Tooltip>

//         <Typography
//           sx={{ color: "#D1D5DB", fontSize: "18px", fontWeight: 300 }}
//         >
//           /
//         </Typography>
//         {/* <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             minWidth: 0,
//             ml: 0.5,
//           }}
//         >
//           <GreetingButton
//             hour={hour}
//             period={period}
//             greeting={greeting}
//             fullName={fullName}
//             location={location}
//             size={30}
//           />
//         </Box> */}

//         {/* Workspace Dropdown */}
//         <Stack
//           direction="row"
//           alignItems="center"
//           spacing={1}
//           sx={{
//             cursor: "pointer",
//             py: 0.2,
//             px: 0.3,
//             borderRadius: "18px",
//             border: "1px solid #CBD5E1" ,
//             "&:hover": { bgcolor: "#F9FAFB"}
//           }}
//         >
//           {/* <Box
//             sx={{
//               width: 24,
//               height: 24,
//               borderRadius: "50px",
//               bgcolor: "#111827",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#fff",
//               fontSize: "10px",
//               fontWeight: 700,
//               letterSpacing: "1px",
//             }}
//           >
//             •••
//           </Box>
//           <Typography
//             sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}
//           >
//             Mob Design Courses
//           </Typography> */}
//           <GreetingButton
//             hour={hour}
//             period={period}
//             greeting={greeting}
//             fullName={fullName}
//             location={location}
//             size={30}
//           />
//           <UnfoldMoreRoundedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
//         </Stack>
//       </Stack>

//       {/* ── Center: Search Input ── */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           bgcolor: "#F3F4F6",
//           borderRadius: "8px",
//           px: 1.5,
//           py: 0.4,
//           width: { xs: 200, sm: 260, md: 320 },
//           maxWidth: "100%",
//           transition: "all 0.2s ease",
//           border: "1px solid transparent",
//           "&:focus-within": {
//             bgcolor: "#FFFFFF",
//             borderColor: "#CBD5E1",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//           },
//         }}
//       >
//         <SearchRoundedIcon sx={{ color: "#9CA3AF", fontSize: 18, mr: 1 }} />
//         <InputBase
//           placeholder="Search Mob Design Courses"
//           sx={{
//             fontSize: "0.815rem",
//             color: "#1F2937",
//             width: "100%",
//             "& input::placeholder": { color: "#9CA3AF", opacity: 1 },
//           }}
//         />
//       </Box>

//       {/* ── Right: Modern Action Chips + Interactive Avatar ── */}
//       <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//         {/* Call Queue Chip */}
//         {/* <Tooltip title="View Call Queue" arrow>
//           <Box
//             component={Link}
//             to="/?queue=1"
//             sx={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "6px",
//               height: "28px",
//               px: "10px",
//               borderRadius: "7px",
//               bgcolor: queueCount > 0 ? "#FEE2E2" : "#F8FAFC",
//               color: queueCount > 0 ? "#DC2626" : "#334155",
//               border: `1px solid ${queueCount > 0 ? "#FCA5A5" : "#E2E8F0"}`,
//               textDecoration: "none",
//               cursor: "pointer",
//               transition: "all 0.15s ease",
//               "&:hover": {
//                 bgcolor: queueCount > 0 ? "#FECACA" : "#F1F5F9",
//                 borderColor: queueCount > 0 ? "#F87171" : "#CBD5E1",
//               },
//               ...(queueCount >= 3 && {
//                 animation: "pulseQueue 1.2s ease-in-out infinite",
//                 "@keyframes pulseQueue": {
//                   "0%, 100%": { transform: "scale(1)" },
//                   "50%": { transform: "scale(1.03)" },
//                 },
//               }),
//             }}
//           >
//             <PhoneCall
//               size={13}
//               strokeWidth={2.2}
//               color={queueCount > 0 ? "#DC2626" : "#64748B"}
//             />
//             <Typography
//               sx={{
//                 fontSize: "12px",
//                 fontWeight: 650,
//                 color: "inherit",
//                 lineHeight: 1,
//                 whiteSpace: "nowrap",
//               }}
//             >
//               Call Queue
//             </Typography>
//           </Box>
//         </Tooltip> */}

//         {/* Call Queue Dropdown / Button */}
//         <Badge
//           badgeContent={queueCount}
//           sx={{
//             "& .MuiBadge-badge": {
//               color: queueCount > 0 ? "#FFFFFF" : "#475569",
//               bgcolor: queueCount > 0 ? "#DC2626" : "#E2E8F0",
//               fontSize: "10px",
//               height: 16,
//               minWidth: 16,
//               mt: 0.3,
//               mr: 1,
//             },
//           }}
//         >
//           <Stack
//             direction="row"
//             alignItems="center"
//             spacing={1}
//             component={Link}
//             to="/?queue=1"
//             sx={{
//               cursor: "pointer",
//               px: 0.75,
//               py: 0.4,
//               borderRadius: "3px",
//               border: "1px solid #CBD5E1",
//               bgcolor: "#F9FAFB",
//               transition: "all 0.15s ease",
//               "&:hover": {
//                 bgcolor: "#F1F5F9",
//                 borderColor: "#94A3B8",
//               },
//               textDecoration: "none",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               <CallIcon width="22px" height="22px" />
//             </Box>
//             <Typography
//               sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}
//             >
//               Call Queue
//             </Typography>
//             <UnfoldMoreRoundedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
//           </Stack>
//         </Badge>

//         {/* Forwarded Calls Chip */}
//         {/* <Tooltip title="Forwarded Calls" arrow>
//           <Box
//             onClick={handleFwdOpen}
//             sx={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "6px",
//               height: "28px",
//               px: "10px",
//               borderRadius: "7px",
//               bgcolor: forwardedLength >= 1 ? "#FEE2E2" : "#F8FAFC",
//               color: forwardedLength >= 1 ? "#DC2626" : "#334155",
//               border: `1px solid ${forwardedLength >= 1 ? "#FCA5A5" : "#E2E8F0"}`,
//               cursor: "pointer",
//               transition: "all 0.15s ease",
//               "&:hover": {
//                 bgcolor: forwardedLength >= 1 ? "#FECACA" : "#F1F5F9",
//                 borderColor: forwardedLength >= 1 ? "#F87171" : "#CBD5E1",
//               },
//             }}
//           >
//             <PhoneForwarded
//               size={13}
//               strokeWidth={2.2}
//               color={forwardedLength >= 1 ? "#DC2626" : "#64748B"}
//             />
//             <Typography
//               sx={{
//                 fontSize: "12px",
//                 fontWeight: 650,
//                 color: "inherit",
//                 lineHeight: 1,
//                 whiteSpace: "nowrap",
//               }}
//             >
//               Forwarded
//             </Typography>
//             <Typography
//               component="span"
//               sx={{
//                 fontSize: "11px",
//                 fontWeight: 800,
//                 color: forwardedLength >= 1 ? "#FFFFFF" : "#475569",
//                 bgcolor: forwardedLength >= 1 ? "#DC2626" : "#E2E8F0",
//                 px: "6px",
//                 py: "1px",
//                 borderRadius: "4px",
//                 lineHeight: 1.2,
//               }}
//             >
//               {forwardedLength}
//             </Typography>
//           </Box>
//         </Tooltip> */}
//         <Stack direction="row" alignItems="center" spacing={1.5}>
//           <Tooltip title="Forwarded Calls" arrow>
//             <IconButton
//               size="medium"
//               sx={{ color: "#4B5563",
//                  bgcolor: "#F9FAFB",
//                }}
//               onClick={handleFwdOpen}
//             >
//               <Badge
//                 badgeContent={forwardedLength}
//                 sx={{
//                   "& .MuiBadge-badge": {
//                     color: forwardedLength >= 1 ? "#FFFFFF" : "#475569",
//                     bgcolor: forwardedLength >= 1 ? "#DC2626" : "#E2E8F0",
//                     fontSize: "10px",
//                     height: 16,
//                     minWidth: 16,
//                   },
//                 }}
//               >
//                 <PhoneForwarded
//                   size={20}
//                   strokeWidth={2.2}
//                   color={forwardedLength >= 1 ? "#DC2626" : "#64748B"}
//                 />
//               </Badge>
//             </IconButton>
//           </Tooltip>

//            <IconButton
//               size="medium"
//               sx={{ color: "#4B5563",
//                  bgcolor: "#F9FAFB",
//                }}
//             >
//             <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
//           </IconButton>

//           {/* Balance Badge */}
//           {/* <Box
//             sx={{
//               bgcolor: "#F3F4F6",
//               color: "#1F2937",
//               px: 1.25,
//               py: 0.5,
//               borderRadius: "16px",
//               fontSize: "0.8125rem",
//               fontWeight: 600,
//             }}
//           >
//             $2.11
//           </Box> */}

//           {/* User Profile Avatar with dropdown arrow */}
//           <Stack
//             direction="row"
//             alignItems="center"
//             spacing={0.5}
//             sx={{ cursor: "pointer" }}
//             onClick={handleProfileOpen}
//           >
//             <Avatar
//               sx={{
//                 width: 30,
//                 height: 30,
//                 bgcolor: "#374151",
//                 fontSize: "0.75rem",
//                 fontWeight: 600,
//               }}
//             >
//               {initials}
//               <Box
//                 sx={{
//                   position: "absolute",
//                   bottom: 1,
//                   right: 1,
//                   width: 8,
//                   height: 8,
//                   borderRadius: "50%",
//                   bgcolor: "#10B981",
//                   border: "1.5px solid #FFFFFF",
//                 }}
//               />
//             </Avatar>
//             <KeyboardArrowDownRoundedIcon
//               sx={{ fontSize: 16, color: "#6B7280" }}
//             />
//           </Stack>
//         </Stack>
//       </Box>

//       {/* ── Forwarded Calls Popover ── */}
//       <ForwardedCallsPopover
//         openPopover={Boolean(fwdAnchorEl)}
//         anchorEl={fwdAnchorEl}
//         handlePopoverClose={handleFwdClose}
//         forwardedCalls={forwardedCalls}
//         OnForwardClick={handleForwardClick}
//       />

//       {/* ── User Profile & Account Popover (Real Data) ── */}
//       <Popover
//         open={Boolean(profileAnchorEl)}
//         anchorEl={profileAnchorEl}
//         onClose={handleProfileClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         transformOrigin={{ vertical: "top", horizontal: "right" }}
//         PaperProps={{
//           sx: {
//             mt: 1,
//             width: 290,
//             borderRadius: "14px",
//             boxShadow:
//               "0px 16px 40px rgba(0, 0, 0, 0.14), 0px 0px 0px 1px rgba(0,0,0,0.06)",
//             border: "1px solid #E2E8F0",
//             overflow: "hidden",
//             bgcolor: "#FFFFFF",
//           },
//         }}
//       >
//         {/* User Card Header */}
//         <Box
//           sx={{ p: 2, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//             <Box sx={{ position: "relative" }}>
//               <Avatar
//                 sx={{
//                   width: 44,
//                   height: 44,
//                   borderRadius: "10px",
//                   border: "1.5px solid #CBD5E1",
//                   bgcolor: "#6900C6",
//                   color: "#FFFFFF",
//                   fontSize: 16,
//                   fontWeight: 800,
//                 }}
//               >
//                 {initials}
//               </Avatar>
//               <Box
//                 sx={{
//                   position: "absolute",
//                   bottom: -2,
//                   right: -2,
//                   width: 10,
//                   height: 10,
//                   borderRadius: "50%",
//                   bgcolor: "#10B981",
//                   border: "2px solid #FFFFFF",
//                 }}
//               />
//             </Box>
//             <Box sx={{ minWidth: 0, flex: 1 }}>
//               <Typography
//                 variant="subtitle2"
//                 noWrap
//                 sx={{
//                   fontWeight: 800,
//                   color: "#0F172A",
//                   fontSize: "0.92rem",
//                   textTransform: "capitalize",
//                   letterSpacing: "-0.01em",
//                 }}
//               >
//                 {fullName}
//               </Typography>
//               {customerCode && (
//                 <Typography
//                   variant="caption"
//                   noWrap
//                   sx={{
//                     color: "#64748B",
//                     display: "block",
//                     fontSize: "0.75rem",
//                     fontWeight: 500,
//                   }}
//                 >
//                   @{customerCode}
//                 </Typography>
//               )}
//             </Box>
//           </Box>

//           {/* Badges: Designation, Role, Customer Code */}
//           <Box sx={{ display: "flex", gap: 0.6, mt: 1.3, flexWrap: "wrap" }}>
//             {designation && (
//               <Chip
//                 label={designation}
//                 size="small"
//                 sx={{
//                   height: 22,
//                   fontSize: "0.7rem",
//                   fontWeight: 700,
//                   bgcolor: "#EFF6FF",
//                   color: "#2563EB",
//                   border: "1px solid #BFDBFE",
//                   borderRadius: "5px",
//                 }}
//               />
//             )}
//             {role && role.toLowerCase() !== designation.toLowerCase() && (
//               <Chip
//                 label={role}
//                 size="small"
//                 sx={{
//                   height: 22,
//                   fontSize: "0.7rem",
//                   fontWeight: 700,
//                   bgcolor: "#F5F3FF",
//                   color: "#6900C6",
//                   border: "1px solid #DDD6FE",
//                   borderRadius: "5px",
//                   textTransform: "capitalize",
//                 }}
//               />
//             )}
//             {userId && (
//               <Chip
//                 label={`ID #${userId}`}
//                 size="small"
//                 sx={{
//                   height: 22,
//                   fontSize: "0.7rem",
//                   fontWeight: 700,
//                   bgcolor: "#F1F5F9",
//                   color: "#475569",
//                   border: "1px solid #E2E8F0",
//                   borderRadius: "5px",
//                 }}
//               />
//             )}
//           </Box>
//         </Box>

//         {/* Real User Profile Details */}
//         <Box
//           sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               px: 0.5,
//             }}
//           >
//             <Typography
//               sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
//             >
//               Customer Code
//             </Typography>
//             <Typography
//               sx={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 700 }}
//             >
//               {customerCode || "N/A"}
//             </Typography>
//           </Box>

//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               px: 0.5,
//             }}
//           >
//             <Typography
//               sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
//             >
//               Designation
//             </Typography>
//             <Typography
//               sx={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 700 }}
//             >
//               {designation || "N/A"}
//             </Typography>
//           </Box>

//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               px: 0.5,
//             }}
//           >
//             <Typography
//               sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
//             >
//               Role
//             </Typography>
//             <Typography
//               sx={{
//                 fontSize: "0.78rem",
//                 color: "#0F172A",
//                 fontWeight: 700,
//                 textTransform: "capitalize",
//               }}
//             >
//               {role || "N/A"}
//             </Typography>
//           </Box>

//           {firmName && (
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 px: 0.5,
//               }}
//             >
//               <Typography
//                 sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}
//               >
//                 Firm Name
//               </Typography>
//               <Typography
//                 sx={{ fontSize: "0.78rem", color: "#0F172A", fontWeight: 700 }}
//               >
//                 {firmName}
//               </Typography>
//             </Box>
//           )}
//         </Box>

//         <Divider sx={{ borderBottom: "1px solid #F1F5F9" }} />

//         {/* Sign Out Action */}
//         <Box sx={{ p: 1 }}>
//           <Box
//             onClick={handleLogoutClick}
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1.2,
//               px: 1.2,
//               py: 0.8,
//               borderRadius: "7px",
//               cursor: "pointer",
//               color: "#DC2626",
//               transition: "all 0.15s ease",
//               "&:hover": { bgcolor: "#FEF2F2" },
//             }}
//           >
//             <LogOut size={15} strokeWidth={2.5} />
//             <Typography
//               variant="body2"
//               sx={{ fontSize: "0.82rem", fontWeight: 700 }}
//             >
//               Sign Out
//             </Typography>
//           </Box>
//         </Box>
//       </Popover>

//       {/* ── Logout Confirmation Dialog ── */}
//       <Dialog
//         open={logoutDialogOpen}
//         onClose={() => setLogoutDialogOpen(false)}
//         aria-labelledby="header-logout-dialog-title"
//         PaperProps={{
//           sx: {
//             width: "100%",
//             maxWidth: 320,
//             borderRadius: "12px",
//             p: 1.5,
//           },
//         }}
//       >
//         <DialogTitle
//           id="header-logout-dialog-title"
//           sx={{ fontWeight: 700, fontSize: "16px", p: 1 }}
//         >
//           Confirm Logout
//         </DialogTitle>
//         <DialogContent sx={{ p: 1, pb: 2 }}>
//           <DialogContentText sx={{ color: "#52525b", fontSize: "14px" }}>
//             Are you sure you want to log out?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions sx={{ p: 1, gap: 1 }}>
//           <Button
//             onClick={() => setLogoutDialogOpen(false)}
//             color="inherit"
//             size="small"
//             sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={confirmLogout}
//             variant="contained"
//             color="error"
//             size="small"
//             autoFocus
//             sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}
//           >
//             Log Out
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Paper>
//   );
// };

// export default NewHeader;

// const CallIcon = ({
//   width = "22px",
//   height = "22px",
//   strokeWidth = 1.4,
//   ...props
// }) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={width}
//       height={height}
//       viewBox="0 0 24 24"
//       style={{ display: "block" }}
//       {...props}
//     >
//       <path d="M0 0h24v24H0z" fill="none" />
//       <g
//         fill="none"
//         stroke="red"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={strokeWidth}
//       >
//         <path
//           strokeDasharray="62"
//           d="M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z"
//         >
//           <animate
//             fill="freeze"
//             attributeName="stroke-dashoffset"
//             dur="0.36s"
//             values="62;0"
//           />
//           <animateTransform
//             attributeName="transform"
//             dur="1.62s"
//             keyTimes="0;0.035;0.07;0.105;0.14;0.175;0.21;0.245;0.28;1"
//             repeatCount="indefinite"
//             type="rotate"
//             values="0 12 12;15 12 12;0 12 12;-12 12 12;0 12 12;12 12 12;0 12 12;-15 12 12;0 12 12;0 12 12"
//           />
//         </path>
//         <path
//           strokeDasharray="6"
//           strokeDashoffset="6"
//           d="M15.76 8.28c-0.5 -0.51 -1.1 -0.93 -1.76 -1.24M15.76 8.28c0.49 0.49 0.9 1.08 1.2 1.72"
//         >
//           <animate
//             attributeName="stroke-dashoffset"
//             begin="0.42s"
//             dur="1.62s"
//             keyTimes="0;0.15;0.3;1"
//             repeatCount="indefinite"
//             values="6;0;6;6"
//           />
//         </path>
//         <path
//           strokeDasharray="8"
//           strokeDashoffset="8"
//           d="M18.67 5.35c-1 -1 -2.26 -1.73 -3.67 -2.1M18.67 5.35c0.99 1 1.72 2.25 2.08 3.65"
//         >
//           <animate
//             attributeName="stroke-dashoffset"
//             begin="0.6s"
//             dur="1.62s"
//             keyTimes="0;0.15;0.3;1"
//             repeatCount="indefinite"
//             values="8;0;8;8"
//           />
//         </path>
//       </g>
//     </svg>
//   );
// };
