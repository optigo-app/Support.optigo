import React from "react";
import {
  Box,
  Typography,
  Chip,
  Popover,
  List,
  ListItem,
} from "@mui/material";
import {
  PhoneForwarded,
  Building,
  Clock,
  ArrowRight,
  Inbox,
  UserCheck,
} from "lucide-react";
import { getPriorityColor } from "../../../libs/data";

const ForwardedCallsPopover = ({
  openPopover,
  anchorEl,
  handlePopoverClose,
  forwardedCalls = [],
  OnForwardClick,
}) => {
  return (
    <Popover
      id={openPopover ? "forwarded-calls-popover" : undefined}
      open={openPopover}
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          mt: 1,
          width: 360,
          maxHeight: 440,
          overflowY: "auto",
          borderRadius: "12px",
          boxShadow: "0px 12px 36px rgba(0, 0, 0, 0.16), 0px 0px 0px 1px rgba(0,0,0,0.06)",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        },
      }}
    >
      {/* Popover Header */}
      <Box
        sx={{
          p: 1.6,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #F1F5F9",
          bgcolor: "#F8FAFC",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              p: 0.6,
              borderRadius: "6px",
              bgcolor: forwardedCalls.length > 0 ? "#FEE2E2" : "#EDE9FE",
              color: forwardedCalls.length > 0 ? "#DC2626" : "#6900C6",
              display: "flex",
            }}
          >
            <PhoneForwarded size={16} strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontWeight: 750, fontSize: "0.92rem", color: "#0F172A" }}>
            Forwarded Calls
          </Typography>
        </Box>
        <Chip
          label={forwardedCalls.length}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.72rem",
            fontWeight: 800,
            bgcolor: forwardedCalls.length > 0 ? "#DC2626" : "#E2E8F0",
            color: forwardedCalls.length > 0 ? "#FFFFFF" : "#475569",
          }}
        />
      </Box>

      {/* Popover Body */}
      {forwardedCalls.length === 0 ? (
        <Box
          sx={{
            py: 4,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              p: 1.2,
              borderRadius: "50%",
              bgcolor: "#F1F5F9",
              color: "#94A3B8",
              display: "flex",
            }}
          >
            <Inbox size={28} strokeWidth={1.5} />
          </Box>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 650, color: "#334155" }}>
            No Forwarded Calls
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", maxWidth: 220 }}>
            Calls forwarded to you by team members will appear here.
          </Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ p: 0.8 }}>
          {forwardedCalls.map((call, index) => (
            <ForwardedCallItem
              key={call?.sr || call?.id || index}
              call={call}
              onForwardClick={OnForwardClick}
            />
          ))}
        </List>
      )}
    </Popover>
  );
};

export default ForwardedCallsPopover;

const ForwardedCallItem = ({ call, onForwardClick }) => {
  const { color } = getPriorityColor(call?.priority);
  const priBg = color === "error" ? "#FEE2E2" : color === "warning" ? "#FEF3C7" : "#F1F5F9";
  const priColor = color === "error" ? "#DC2626" : color === "warning" ? "#D97706" : "#475569";

  return (
    <ListItem
      alignItems="flex-start"
      onClick={() => onForwardClick && onForwardClick(call)}
      sx={{
        flexDirection: "column",
        p: 1.2,
        mb: 0.6,
        borderRadius: "8px",
        border: "1px solid #F1F5F9",
        bgcolor: "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": {
          bgcolor: "#F8FAFC",
          borderColor: "#CBD5E1",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      {/* Top row: Forwarder + Priority */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <UserCheck size={14} color="#6900C6" strokeWidth={2.5} />
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#6900C6" }}>
            {call.receivedBy || call.forwardedBy || "Team Member"}
          </Typography>
        </Box>
        <Chip
          label={call.priority || "Normal"}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.65rem",
            fontWeight: 750,
            bgcolor: priBg,
            color: priColor,
          }}
        />
      </Box>

      {/* Main Info: Company & Caller */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3, width: "100%" }}>
        <Building size={13} color="#64748B" />
        <Typography
          noWrap
          sx={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#0F172A",
            flex: 1,
          }}
        >
          {call?.company || "Unknown Company"}
          {call?.callBy ? ` • ${call.callBy}` : ""}
        </Typography>
      </Box>

      {/* Description if present */}
      {(call?.description || call?.lastMessage) && (
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#475569",
            lineHeight: 1.3,
            mb: 0.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {call?.description || call?.lastMessage}
        </Typography>
      )}

      {/* Bottom Footer: Time + Take Action */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pt: 0.4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Clock size={12} color="#94A3B8" />
          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 500 }}>
            {call.time || "Recent"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, color: "#2563EB" }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 750 }}>
            Open Call
          </Typography>
          <ArrowRight size={12} strokeWidth={2.5} />
        </Box>
      </Box>
    </ListItem>
  );
};