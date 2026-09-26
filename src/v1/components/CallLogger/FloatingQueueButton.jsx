import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Badge,
  Paper,
  IconButton,
  Typography,
  Tooltip,
  Fade,
} from "@mui/material";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useCallLog } from "../../context/UseCallLog";
import { CallQueueUI } from "./CallRecorderScreen";

export const COLORS = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E5E7EB",

  textPri: "#111827",
  textSec: "#6B7280",
  textMuted: "#9CA3AF",

  callFg: "#2563EB",
  callBg: "#EFF6FF",
  callBorder: "#BFDBFE",

  tickFg: "#7C3AED",
  tickBg: "#F3E8FF",

  greenFg: "#16A34A",
  greenBg: "#DCFCE7",

  orangeFg: "#EA580C",
  orangeBg: "#FFEDD5",

  redFg: "#DC2626",
  redBg: "#FEE2E2",

  liveGreen: "#22C55E",
};

const FloatingQueueButton = ({ onEditCall }) => {
  const { queue } = useCallLog();
  const pendingCount = queue?.length ?? 0;

  const [isOpen, setIsOpen] = useState(false);

  const posRef = useRef({
    x: window.innerWidth - 72,
    y: Math.floor(window.innerHeight / 2) - 26,
  });

  const [committedPos, setCommittedPos] = useState({ ...posRef.current });

  const fabRef = useRef(null);

  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0 });

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current || !fabRef.current) return;
    didDrag.current = true;

    const x = Math.max(8, Math.min(window.innerWidth - 60, e.clientX - dragOrigin.current.x));
    const y = Math.max(8, Math.min(window.innerHeight - 60, e.clientY - dragOrigin.current.y));

    // ✅ Direct DOM write — zero React involvement, runs at native 60fps
    posRef.current = { x, y };
    fabRef.current.style.left = `${x}px`;
    fabRef.current.style.top = `${y}px`;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);

    setCommittedPos({ ...posRef.current });
  }, [onPointerMove]);

  const onPointerDown = useCallback((e) => {
    isDragging.current = true;
    didDrag.current = false;
    dragOrigin.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    e.preventDefault();
  }, [onPointerMove, onPointerUp]);

  const handleFabClick = () => {
    if (!didDrag.current) {
      setIsOpen((prev) => !prev);
    }
    didDrag.current = false;
  };

  const panelRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !e.target.closest("[data-floating-queue-fab]")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const panelWidth = 350;
  const panelMaxH = 400;
  const panelLeft = Math.max(8, committedPos.x - panelWidth - 12);
  const panelTop = Math.max(8, Math.min(window.innerHeight - panelMaxH - 8, committedPos.y - 100));

  return (
    <>
      <Box
        ref={fabRef}
        data-floating-queue-fab
        onPointerDown={onPointerDown}
        onClick={handleFabClick}
        style={{
          // Use inline `style` (not sx) so direct DOM mutations work correctly
          position: "fixed",
          left: posRef.current.x,
          top: posRef.current.y,
          zIndex: 1500,
          touchAction: "none",
          userSelect: "none",
          cursor: "grab",
          willChange: "left, top", // promote to GPU layer
        }}
      >
        <Badge
          badgeContent={pendingCount}
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.65rem",
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              border: "2px solid #fff",
            },
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: isOpen
                ? "linear-gradient(135deg, #ef4444 0%, #ef4444 100%)"
                : "linear-gradient(135deg, #ef4444 0%, #ef4444 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isOpen
                ? "0 6px 24px rgba(21,101,192,0.55), 0 0 0 3px rgba(25,118,210,0.25)"
                : "0 4px 18px rgba(25,118,210,0.4)",
              color: "#fff",
              transition: "box-shadow 0.2s ease, background 0.2s ease",
              "&:hover": {
                boxShadow: "0 6px 24px rgba(25,118,210,0.55)",
                transform: "scale(1.06)",
                transition: "all 0.15s ease",
              },
            }}
          >
            <PhoneCallbackRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
        </Badge>
      </Box>
      <Fade in={isOpen} timeout={180}>
        <Paper
          ref={panelRef}
          elevation={12}
          sx={{
            position: "fixed",
            left: panelLeft,
            top: panelTop,
            zIndex: 1499,
            width: panelWidth,
            maxHeight: panelMaxH,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.25,
              borderBottom: "1px solid #f1f5f9",
              bgcolor: "#f8fafc",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneCallbackRoundedIcon color="success" sx={{ fontSize: 18 }} />
              <Typography fontWeight={700} fontSize="0.88rem" color="#1e293b">
                Call Queue
              </Typography>
              {pendingCount > 0 && (
                <Box
                  sx={{
                    bgcolor: "#ef4444",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    borderRadius: "100px",
                    px: 0.8,
                    py: 0.1,
                    lineHeight: "18px",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {pendingCount}
                </Box>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{
                color: "#94a3b8",
                "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Queue list */}
          <Box
            sx={{
              overflowY: "auto",
              flex: 1,
              bgcolor: "#F8F9F9",
              // Hide scrollbar
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE & Edge

              "&::-webkit-scrollbar": {
                display: "none", // Chrome, Safari
              },
            }}
          >
            {pendingCount === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 5,
                  gap: 1,
                }}
              >
                <PhoneCallbackRoundedIcon sx={{ fontSize: 36, color: "#cbd5e1" }} />
                <Typography fontSize="0.82rem" color="text.secondary" fontWeight={500}>
                  No calls in queue
                </Typography>
              </Box>
            ) : (
              <CallQueueUI
                onEditCall={(id) => {
                  onEditCall(id);
                }}
              />
            )}
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default FloatingQueueButton;
