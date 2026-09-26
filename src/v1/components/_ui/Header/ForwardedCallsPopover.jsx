import React from "react";
import {
  Box,
  Typography,
  Chip,
  Popover,
  List,
  ListItem,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  PhoneForwarded,
  Building2,
  Clock,
  ArrowRight,
  Inbox,
  User,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { getPriorityColor } from "../../../libs/data";

/**
 * Apple HIG-inspired Forwarded Calls Popover.
 * Provides clarity, deference, and depth with an elegant transfer trail
 * ("Who forwarded → To whom"), clean typography, and tactile interaction.
 */
const ForwardedCallsPopover = ({
  openPopover,
  anchorEl,
  handlePopoverClose,
  forwardedCalls = [],
  OnForwardClick,
}) => {
  const count = forwardedCalls?.length || 0;

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
          mt: 1.2,
          width: 390,
          maxHeight: 520,
          overflowY: "auto",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(24px)",
          boxShadow:
            "0 20px 48px -8px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          // Smooth iOS scrollbar
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            borderRadius: 4,
          },
        },
      }}
    >
      {/* ── Apple HIG Header ── */}
      <Box
        sx={{
          p: 1.75,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #F1F5F9",
          backgroundColor: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              backgroundColor: count > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(105, 0, 198, 0.08)",
              color: count > 0 ? "#DC2626" : "#6900C6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: count > 0 ? "0 2px 8px rgba(239, 68, 68, 0.15)" : "none",
            }}
          >
            <PhoneForwarded size={17} strokeWidth={2.4} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.92rem",
                color: "#0F172A",
                letterSpacing: "-0.015em",
                lineHeight: 1.2,
              }}
            >
              Forwarded Calls
            </Typography>
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "#64748B",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {count > 0 ? `${count} awaiting your response` : "All caught up"}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={count}
          size="small"
          sx={{
            height: 22,
            minWidth: 26,
            fontSize: "0.74rem",
            fontWeight: 800,
            borderRadius: "999px",
            backgroundColor: count > 0 ? "#DC2626" : "#E2E8F0",
            color: count > 0 ? "#FFFFFF" : "#64748B",
            letterSpacing: "-0.01em",
          }}
        />
      </Box>

      {/* ── Popover Content ── */}
      {count === 0 ? (
        <Box
          sx={{
            py: 6,
            px: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 1.2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 0.5,
            }}
          >
            <Inbox size={26} strokeWidth={1.75} />
          </Box>
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#1E293B",
              letterSpacing: "-0.01em",
            }}
          >
            No Forwarded Calls
          </Typography>
          <Typography
            sx={{
              fontSize: "0.78rem",
              color: "#64748B",
              maxWidth: 240,
              lineHeight: 1.4,
            }}
          >
            Calls assigned or forwarded to you by teammates will appear here in real time.
          </Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ p: 1.2, display: "flex", flexDirection: "column", gap: 1 }}>
          {forwardedCalls.map((call, index) => (
            <ForwardedCallCard
              key={call?.sr ? `${call.sr}-${call.followUpId || index}` : index}
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

/**
 * Clean Apple HIG Inset Call Card with explicit "Forwarded By → Assigned To" trail.
 */
const ForwardedCallCard = ({ call, onForwardClick }) => {
  const { color } = getPriorityColor(call?.priority);

  // Priority color token mapping (Apple HIG semantic system)
  const priorityStyles = {
    error: { bg: "#FEF2F2", color: "#DC2626", border: "#FCA5A5" },
    warning: { bg: "#FFFBEB", color: "#D97706", border: "#FCD34D" },
    default: { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0" },
  };
  const pri = priorityStyles[color] || priorityStyles.default;

  // Who forwarded the call vs who received it
  const senderName =
    call.receivedBy ||
    call.forwardedBy ||
    call.CreatedBy ||
    "Team Member";
  const recipientName =
    call.forwardedTo ||
    call.AssignedEmpName ||
    "You";

  const isSelf = senderName.trim().toLowerCase() === recipientName.trim().toLowerCase();

  return (
    <ListItem
      disableGutters
      onClick={() => onForwardClick && onForwardClick(call)}
      sx={{
        flexDirection: "column",
        p: 1.4,
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        cursor: "pointer",
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          backgroundColor: "#F8FAFC",
          borderColor: "#CBD5E1",
          transform: "translateY(-1px)",
          boxShadow: "0 6px 18px -3px rgba(0, 0, 0, 0.07)",
          "& .action-arrow": {
            transform: "translateX(2px)",
            color: "#1D4ED8",
          },
        },
      }}
    >
      {/* ── Top Row: Transfer Flow Route (Who forwarded to whom) ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mb: 0.8,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.7,
            px: 0.9,
            py: 0.35,
            borderRadius: "7px",
            backgroundColor: "#F1F5F9",
            maxWidth: "75%",
          }}
        >
          {/* Sender Avatar */}
          <Avatar
            sx={{
              width: 17,
              height: 17,
              fontSize: "0.62rem",
              fontWeight: 750,
              backgroundColor: "#6366F1",
              color: "#FFFFFF",
            }}
          >
            {senderName.charAt(0).toUpperCase() || "T"}
          </Avatar>

          <Typography
            noWrap
            sx={{
              fontSize: "0.72rem",
              fontWeight: 650,
              color: "#334155",
              maxWidth: 90,
            }}
            title={senderName}
          >
            {senderName}
          </Typography>

          {!isSelf && (
            <>
              <ArrowRight size={11} color="#94A3B8" strokeWidth={2.4} />
              <Typography
                noWrap
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#2563EB",
                  maxWidth: 90,
                }}
                title={recipientName}
              >
                {recipientName}
              </Typography>
            </>
          )}

          {call.DeptName && (
            <Chip
              label={call.DeptName}
              size="small"
              sx={{
                height: 15,
                fontSize: "0.6rem",
                fontWeight: 700,
                backgroundColor: "rgba(99, 102, 241, 0.12)",
                color: "#4F46E5",
                borderRadius: "4px",
                px: 0.3,
              }}
            />
          )}
        </Box>

        {/* Priority Badge */}
        <Chip
          label={call.priority || "Normal"}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.65rem",
            fontWeight: 750,
            backgroundColor: pri.bg,
            color: pri.color,
            border: `1px solid ${pri.border}`,
            borderRadius: "5px",
          }}
        />
      </Box>

      {/* ── Caller & Company ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          width: "100%",
          mb: 0.5,
        }}
      >
        <Building2 size={14} color="#64748B" strokeWidth={2.2} />
        <Typography
          noWrap
          sx={{
            fontSize: "0.85rem",
            fontWeight: 750,
            color: "#0F172A",
            letterSpacing: "-0.01em",
            flex: 1,
          }}
        >
          {call?.company || "Unknown Company"}
          {call?.callBy && (
            <Typography
              component="span"
              sx={{
                fontWeight: 500,
                color: "#64748B",
                fontSize: "0.8rem",
              }}
            >
              {" "}
              • {call.callBy}
            </Typography>
          )}
        </Typography>

        {call?.appname && (
          <Chip
            label={call.appname}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.64rem",
              fontWeight: 650,
              backgroundColor: "#EEF2FF",
              color: "#4338CA",
              borderRadius: "5px",
            }}
          />
        )}
      </Box>

      {/* ── Call Description Bubble (Apple Style Inset Note) ── */}
      {(call?.description || call?.lastMessage) && (
        <Box
          sx={{
            width: "100%",
            p: "6px 9px",
            mb: 0.8,
            borderRadius: "7px",
            backgroundColor: "#F8FAFC",
            borderLeft: "2.5px solid #3B82F6",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#334155",
              lineHeight: 1.35,
              fontWeight: 500,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {call?.description || call?.lastMessage}
          </Typography>
        </Box>
      )}

      {/* ── Footer: Time Stamp & Open Action ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          pt: 0.3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Clock size={12} color="#94A3B8" strokeWidth={2} />
          <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>
            {call.time || "Recent"}
          </Typography>
          {call?.isForwardedFollowUp && (
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: "#6366F1",
                fontWeight: 700,
                ml: 0.5,
              }}
            >
              • Follow-up
            </Typography>
          )}
        </Box>

        <Box
          className="action-arrow"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.35,
            color: "#2563EB",
            fontWeight: 750,
            fontSize: "0.73rem",
            transition: "all 0.15s ease",
          }}
        >
          Open Call
          <ArrowRight size={13} strokeWidth={2.4} />
        </Box>
      </Box>
    </ListItem>
  );
};