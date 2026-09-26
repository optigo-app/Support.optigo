// NavigationMenu.jsx
// CHANGED: 2026-04-14
// OLD: framer-motion layoutId spring pill — caused visible lag on every nav click
//      because framer had to dome-measure across un/mount cycles per route change.
// NEW: Pill stays always-mounted; position driven by a CSS left/width transition
//      that is hardware-accelerated (transform). Active state is set optimistically
//      on click via useNavStore so the highlight jumps instantly without waiting
//      for the route to settle.
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button, Box, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useNavStore } from "./useNavStore";

import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import AllInboxRoundedIcon from "@mui/icons-material/AllInboxRounded";
import TollRoundedIcon from "@mui/icons-material/TollRounded";
import Call from "@mui/icons-material/Call";
import InsertDriveFile from "@mui/icons-material/InsertDriveFile";

// ⚠️ Paths MUST match Entry.js route definitions exactly (case-sensitive)
const NAV_BUTTONS = [
  { label: "Call log", path: "/", icon: <Call fontSize="small" /> },
  { label: "Ticket", path: "/Ticket", icon: <InsertDriveFile fontSize="small" /> },
  { label: "Training", path: "/Training", icon: <CloudSyncRoundedIcon fontSize="small" /> },
  { label: "Orders", path: "/Orders", icon: <AllInboxRoundedIcon fontSize="small" /> },
  { label: "Order Request", path: "/orderRequest", icon: <TollRoundedIcon fontSize="small" /> },
];

const NavigationMenu = () => {
  const theme = useTheme();
  const location = useLocation();

  // useNavStore: optimistic active path — updates INSTANTLY on click
  const { activePath, setActivePath } = useNavStore();

  // On route changes from back/forward, sync the store
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname, setActivePath]);

  // Refs for each button so we can measure pill position
  const btnRefs = useRef([]);
  const containerRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const updatePill = useCallback(() => {
    const activeIndex = NAV_BUTTONS.findIndex((b) => b.path === activePath);
    const btn = btnRefs.current[activeIndex];
    const container = containerRef.current;
    if (!btn || !container) return;

    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
      opacity: 1,
    });
  }, [activePath]);

  // Recalculate on activePath change and after first paint
  useEffect(() => {
    // rAF so we wait for layout to settle
    const raf = requestAnimationFrame(updatePill);
    return () => cancelAnimationFrame(raf);
  }, [updatePill]);

  return (
    <Box
      ref={containerRef}
      sx={{ display: "flex", gap: 1, position: "relative", alignItems: "center" }}
    >
      {/* The pill: always mounted, moves via CSS transition — zero layout thrash */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: pillStyle.left,
          width: pillStyle.width,
          opacity: pillStyle.opacity,
          bgcolor: theme.palette.primary.dark,
          borderRadius: "24px",
          zIndex: 0,
          pointerEvents: "none",
          transition: "left 180ms cubic-bezier(0.4,0,0.2,1), width 180ms cubic-bezier(0.4,0,0.2,1), opacity 120ms ease",
          willChange: "left, width",
        }}
      />

      {NAV_BUTTONS.map((button, index) => {
        const active = activePath === button.path;

        return (
          <Button
            key={button.path}
            ref={(el) => (btnRefs.current[index] = el)}
            component={Link}
            to={button.path}
            onClick={() => setActivePath(button.path)} // INSTANT highlight
            sx={{
              position: "relative",
              zIndex: 1,
              color: active ? "white" : "text.primary",
              fontWeight: active ? 600 : 500,
              px: 2,
              borderRadius: "24px",
              gap: 0.75,
              minWidth: 0,
              transition: "color 150ms ease",
              "&:hover": {
                bgcolor: "transparent",
                color: active ? "white" : theme.palette.primary.main,
              },
            }}
          >
            {button.icon}
            {button.label}
          </Button>
        );
      })}
    </Box>
  );
};

export default NavigationMenu;
