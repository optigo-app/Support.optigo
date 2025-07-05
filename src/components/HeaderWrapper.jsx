import React, { useMemo, useState } from "react";
import { Box, Button, AppBar, Toolbar, Typography, Avatar, Chip, Popover, List, ListItem, Divider } from "@mui/material";
import { Call, InsertDriveFile, CallMadeRounded as CallEndTwoTone, PhoneForwarded as PhoneForwardedIcon, CallSplit as CallSplitIcon, Business as BusinessIcon, AccessTime as AccessTimeIcon, LabelImportant as LabelImportantIcon, IntegrationInstructions } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import AllInboxRoundedIcon from "@mui/icons-material/AllInboxRounded";
import { useTheme } from "@mui/system";
import { useAuth } from "../context/UseAuth";
import { useCallLog } from "../context/UseCallLog";
import { appBarHeight } from "../libs/data";
import { useGreeting } from "../hooks/useGreeting";

// Priority color mapping
const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    default:
      return "default";
  }
};

// Greeting generator

// Navigation buttons config
const navButtons = [
  {
    label: "Call log",
    path: "/",
    icon: <Call />,
  },
  {
    label: "Ticket",
    path: "/Ticket",
    icon: <InsertDriveFile />,
  },
  // {
  //   label: "Client Ticket",
  //   path: "/Ticket/Client",
  //   icon: <InsertDriveFile />,
  // },
  {
    label: "Training",
    path: "/Training",
    icon: <CloudSyncRoundedIcon />,
  },
  {
    label: "Delivery",
    path: "/Delivery",
    icon: <AllInboxRoundedIcon />,
  },
];

// Forwarded call list item
const ForwardedCallItem = ({ call, onForwardClick }) => (
  <>
    <ListItem
      alignItems="flex-start"
      sx={{
        flexDirection: "column",
        px: 1,
        py: 1.5,
        "&:hover": {
          bgcolor: "action.hover",
          cursor: "pointer",
          borderRadius: 2,
        },
      }}
      onClick={() => onForwardClick(call)}
    >
      {/* Forwarder Message */}
      <Box display="flex" alignItems="center" gap={1} mb={0.4}>
        <CallSplitIcon fontSize="small" color="primary" />
        <Typography variant="body2" color="primary">
          <strong>{call.receivedBy || "Someone"}</strong> forwarded this call to you
        </Typography>
      </Box>

      {/* Company */}
      <Box display="flex" alignItems="center" gap={1} mb={0.4}>
        <BusinessIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          Company:{" "}
          <strong>
            {call?.company || "Unknown"} | {call?.callBy || "Unknown"}
          </strong>
        </Typography>
      </Box>

      {/* Time & Priority */}
      <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" mt={1}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <AccessTimeIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {call.time || "N/A"}
          </Typography>
        </Box>
        <Chip icon={<LabelImportantIcon fontSize="small" />} label={`Priority: ${call.priority || "Low"}`} size="small" color={getPriorityColor(call.priority)} sx={{ height: 22 }} />
      </Box>
    </ListItem>
    <Divider component="li" />
  </>
);

const HeaderWrapper = ({ children, handleOpen }) => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const { queue, forwardedCalls, setCurrentCall } = useCallLog();
  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);
  const Navigate = useNavigate();
  const { greeting } = useGreeting(user);

  // Derived values
  // const greeting = useMemo(() => getGreeting(), []);
  const username = user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "Guest";
  const isActive = (path) => location.pathname === path;

  // Popover logic
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

  const IsTicket = location.pathname === "/Ticket";

  const allowedPaths = ["/test", "/Training", "/Delivery", "/delivery", 
    "/training", "Training/Client", "/Training/client", "/Training/", "/training/", "Training/Client/",
     "/Training/client/", "/Delivery/", "/delivery/", "/delivery/", "/delivery", "/Delivery", "/Delivery/"];

  if (allowedPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <>
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
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Left section: Avatar + Greeting */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
            <Avatar
              sx={{
                bgcolor: "#2177EA",
                color: "white",
                width: 40,
                height: 40,
                fontWeight: 600,
                fontSize: "1.25rem",
                textTransform: "uppercase",
              }}
            >
              {user?.firstname?.charAt(0) || "G"}
            </Avatar>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.75rem" }}>
                {greeting},
              </Typography>
              <Typography
                variant="h5"
                component="h1"
                fontWeight={600}
                sx={{
                  fontSize: "1.2rem",
                  [theme.breakpoints.down("sm")]: { fontSize: "1.1rem" },
                  textTransform: "capitalize",
                }}
              >
                {username}
              </Typography>
            </Box>
          </Box>

          {/* Right section: Nav links, chips, buttons */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* Call Queue Chip */}
            <Chip
              component={Link}
              to="/?queue=1"
              icon={<CallEndTwoTone color="white" />}
              label={`Call Queue : ${queue?.length || 0}`}
              color={(queue?.length || 0) >= 3 ? "error" : "default"}
              sx={{
                fontWeight: 500,
                borderRadius: 8,
                padding: "0.5rem",
                transition: "all 0.3s ease",
                height: 27,
              }}
            />

            {/* Forwarded Calls Chip with Popover */}
            <Chip
              icon={<PhoneForwardedIcon fontSize="small" />}
              label={`Forwarded Calls: ${forwardedCalls?.length || 0}`}
              color={(forwardedCalls?.length || 0) >= 1 ? "error" : "default"}
              onClick={handlePopoverOpen}
              sx={{
                fontWeight: 500,
                borderRadius: 8,
                padding: "0.5rem",
                transition: "all 0.3s ease",
                height: 27,
              }}
            />

            {/* Navigation Buttons */}
            {navButtons.map((button) => (
              <Button
                key={button.path}
                component={Link}
                to={button.path}
                sx={{
                  color: isActive(button.path) ? theme.palette.primary.main : "black",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: isActive(button.path) ? theme.palette.primary.dark : theme.palette.grey[100],
                    color: isActive(button.path) ? "white" : theme.palette.primary.main,
                  },
                }}
              >
                {button.icon}
                {button.label}
              </Button>
            ))}

            {/* Add Customer Button */}
            {/* <Button onClick={handleOpen}>
              <IntegrationInstructions />
              Add Customer
            </Button> */}
          </Box>
        </Toolbar>

        {/* Popover for Forwarded Calls */}
        <Popover
          id={openPopover ? "notification-popover" : undefined}
          open={openPopover}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            style: {
              marginTop: 10,
              width: 400,
              maxHeight: 400,
              overflowY: "auto",
              borderRadius: 12,
              boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e0e0e0",
            },
          }}
        >
          <Box p={2}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Forwarded Calls
            </Typography>
            <Divider />
            {forwardedCalls.length === 0 ? (
              <Box py={3}>
                <Typography color="text.secondary">No forwarded calls</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {forwardedCalls.map((call, index) => (
                  <ForwardedCallItem onForwardClick={OnForwardClick} key={index} call={call} />
                ))}
              </List>
            )}
          </Box>
        </Popover>
      </AppBar>

      {children}
    </>
  );
};

export default HeaderWrapper;
