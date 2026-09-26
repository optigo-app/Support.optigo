import React from "react";
import { Box, Typography, Chip, Tooltip } from "@mui/material";
import versionData from "../../AccountCenter/tabs/version.json";

export default function VersionBadge({ collapsed = false, sx = {} }) {
  const currentVer = versionData?.version || "v2";

  const content = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        px: collapsed ? 0.75 : 1.25,
        py: 0.6,
        mx: collapsed ? 0.5 : 1,
        my: 0.5,
        borderRadius: "8px",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.04)",
        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: "#3b82f6", // Vibrant cyan/blue dot for V2
          boxShadow: "0 0 6px #3b82f6",
          flexShrink: 0,
          mr: collapsed ? 0 : 1,
        }}
      />
      {!collapsed && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: "11px",
            color: "text.secondary",
            letterSpacing: "0.4px",
            textTransform: "uppercase",
            mr: "auto",
          }}
        >
          Version
        </Typography>
      )}
      {!collapsed && (
        <Chip
          label={currentVer}
          size="small"
          sx={{
            height: 18,
            fontSize: "10px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #c207ab 0%, #4510d6 100%)",
            color: "#fff",
            borderRadius: "9px",
            px: 0.25,
          }}
        />
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={`App Version: ${currentVer}`} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }

  return content;
}
