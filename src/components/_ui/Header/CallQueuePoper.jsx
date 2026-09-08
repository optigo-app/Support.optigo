import React from "react";
import { Chip } from "@mui/material";
import { Link } from "react-router-dom";
import { CallEndTwoTone } from "@mui/icons-material";

const CallQueuePoper = ({ queueCount }) => {
  return (
    <Chip
      component={Link}
      to="/?queue=1"
      icon={<CallEndTwoTone sx={{ color: "white" }} />}
      label={`Call Queue: ${queueCount}`}
      color={queueCount > 0 ? "error" : "success"}
      sx={{
        fontWeight: 500,
        borderRadius: 8,
        padding: "0.5rem",
        height: 27,
        cursor: "pointer",
        position: "relative",
        overflow: "visible",

        // 🔥 Pulse only when queue >= 3
        ...(queueCount >= 3 && {
          animation: "pulsePop 1.2s ease-in-out infinite",
          boxShadow: "0 0 0 rgba(255, 0, 0, 0.0)",
        }),

        "@keyframes pulsePop": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0px 0px 0px rgba(255,0,0,0)",
          },
          "50%": {
            transform: "scale(1.1)",
            boxShadow: "0px 0px 10px rgba(255,0,0,0.5)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0px 0px 0px rgba(255,0,0,0)",
          },
        },
      }}
    />
  );
};

export default CallQueuePoper;
