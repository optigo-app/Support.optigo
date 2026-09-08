import React, { useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { getGreetingMeta } from "./GreetingIcons";

const GreetingButton = ({
  hour = new Date().getHours(),
  greeting,
  fullName = "",
  size = 34,
  showText = true,
  onClick,
}) => {
  const meta = useMemo(() => getGreetingMeta(hour), [hour]);
  const CurrentIcon = meta.Icon;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
        userSelect: "none",
      }}
    >
      <Box
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          borderRadius: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          boxSizing: "border-box",
          cursor: onClick ? "pointer" : "default",
          boxShadow: `none`,
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
          "& svg": {
            width: `${size}px`,
            height: `${size}px`,
            display: "block",
            transition: "all 0.35s ease",
            animation: "greetingPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          },
          "@keyframes greetingPop": {
            "0%": { transform: "scale(0.75) rotate(-10deg)", opacity: 0.6 },
            "50%": { transform: "scale(1.12) rotate(4deg)" },
            "100%": { transform: "scale(1) rotate(0deg)", opacity: 1 },
          },
        }}
      >
        <CurrentIcon size={size} key={meta.period} />
      </Box>

      {/* Greeting + User Name Text */}
      {showText && (
        <Typography
          noWrap
          sx={{
            fontSize: "0.88rem",
            color: "#64748B",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
  }}
        >
          {greeting || meta.greeting},{" "}
          <Box
            component="span"
            sx={{
              fontWeight: 750,
              color: "#0F172A",
              textTransform: "capitalize",
            }}
          >
            {fullName}
          </Box>
        </Typography>
      )}
    </Box>
  );
};

export default GreetingButton;
