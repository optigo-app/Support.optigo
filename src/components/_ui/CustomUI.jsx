import React from "react";
import { Box, Typography, Avatar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { tooltipClasses } from "@mui/material/Tooltip";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";

const PremiumTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} arrow />)(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    boxShadow: theme.shadows[4],
    padding: "8px 12px",
    maxWidth: 300, 
    whiteSpace: "pre-wrap",
    lineHeight: 1.4,
    border: `1px solid ${theme.palette.divider}`,
  },
  [`& .MuiTooltip-arrow`]: {
    color: theme.palette.background.paper,
  },
}));

const PremiumStatusTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} arrow placement="top" />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
    borderRadius: "10px",
    padding: "8px 12px",
    border: "1px solid #E2E8F0",
    maxWidth: 340,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#FFFFFF",
    "&::before": {
      border: "1px solid #E2E8F0",
    },
  },
}));

const isCompletedStatus = (statusVal) => {
  if (!statusVal) return false;
  const str = String(statusVal).toLowerCase().trim();
  return (
    str === "completed" ||
    str === "complete" ||
    str === "closed" ||
    str === "solved" ||
    str === "done"
  );
};

const getRowModifiedDate = (row) => {
  return (
    row?.ModifiedDate ||
    row?.modifiedDate ||
    row?.modified_date ||
    row?.ModifiedOn ||
    row?.modifiedOn ||
    row?.UpdatedAt ||
    row?.updatedAt ||
    row?.dateRaw ||
    row?.date
  );
};

const formatModifiedDate = (dateVal) => {
  if (!dateVal) return null;
  const dt = new Date(dateVal);
  if (isNaN(dt.getTime())) return String(dateVal);

  const dateStr = dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = dt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr}, ${timeStr}`;
};

const getRelativeTimeString = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return null;

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
};

const CompletedStatusTooltipContent = ({
  modifiedDate,
  statusLabel = "Completed",
  columnName = "Client Status",
}) => {
  const formatted = formatModifiedDate(modifiedDate);

  return (
    <Box
      sx={{
        py: 0.25,
        px: 0.5,
        display: "flex",
        alignItems: "center",
        gap: 0.6,
        fontFamily: "Inter, Roboto, sans-serif",
      }}
    >
      <Typography
        sx={{
          fontSize: "13px",
          color: "#64748B",
          fontWeight: 500,
          lineHeight: 1.4,
          whiteSpace: "nowrap",
        }}
      >
        Last Updated Date:
      </Typography>
      <Typography
        sx={{
          fontSize: "13px",
          color: "#1E293B",
          fontWeight: 700,
          lineHeight: 1.4,
          whiteSpace: "nowrap",
        }}
      >
        {formatted || (modifiedDate ? String(modifiedDate) : "N/A")}
      </Typography>
    </Box>
  );
};

const getRandomColor = (char) => {
  const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#845EC2", "#FF9671", "#00C9A7", "#F9F871", "#FF70A6"];
  const index = char ? char.toUpperCase().charCodeAt(0) % colors.length : 0;
  return colors[index];
};

const formatDisplayTitle = (rawTitle) => {
  if (!rawTitle) return "";
  const cleaned = String(rawTitle)
    .replace(/undefined/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
};

const AvatarPill = ({ title, key, val }) => {
  const displayTitle = formatDisplayTitle(title);
  const firstChar = displayTitle?.[0] || "";
  const bgColor = getRandomColor(firstChar);

  return (
    <Box
      key={key}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 0.7,
        py: 0.3,
        borderRadius: 50,
        bgcolor: "#f5f5f5",
        minHeight: 24,
        justifyContent: 'center',
        cursor: "grab",
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            type: "RECEIVER",
            value: val,
            client: false
          })
        );
        e.dataTransfer.effectAllowed = "move";
      }}

    >
      {firstChar ? <Avatar
        sx={{
          width: 18,
          height: 18,
          bgcolor: bgColor,
          fontSize: 12,
          mr: 0.5,
        }}
      >
        {firstChar.toUpperCase()}
      </Avatar> : <>
        <Avatar
          sx={{
            width: 8,
            height: 8,
            fontSize: 10,
            mr: 0.5,
            bgcolor: 'transparent',
            color: 'gray'
          }}
        >
          -
        </Avatar>

      </>}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: 12,
          whiteSpace: "nowrap",
        }}
      >
        {displayTitle || "-"}
      </Typography>
    </Box>
  );
};

export {
  AvatarPill,
  PremiumTooltip,
  PremiumStatusTooltip,
  CompletedStatusTooltipContent,
  isCompletedStatus,
  getRowModifiedDate,
  formatModifiedDate,
  getRelativeTimeString,
};


