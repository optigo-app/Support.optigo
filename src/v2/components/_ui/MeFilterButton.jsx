import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import getPillButtonStyle from "./pillButtonStyle";

const MeFilterButton = ({ active = false, onToggle, standalone = false }) => (
  <Tooltip title={active ? "Show all records" : "Show my records"} placement="top" arrow>
    <IconButton
      aria-label={active ? "Show all records" : "Show my records"}
      aria-pressed={active}
      onClick={onToggle}
      size="small"
      disableRipple
      sx={{
        ...getPillButtonStyle(active),
        ...(standalone
          ? {
              width: 38,
              height: 38,
              borderRadius: "10px",
              border: "1px solid #E7DCEB",
              backgroundColor: active ? "#FFFFFF" : "#F7F0FA",
              boxShadow: active ? "0 2px 7px rgba(139, 7, 167, 0.18)" : "none",
              "&:hover": {
                backgroundColor: active ? "#FFFFFF" : "#EFE7F2",
              },
            }
          : {}),
        color: active ? "#8B07A7" : "#6E5678",
      }}
    >
      <PersonRoundedIcon sx={{ fontSize: 20 }} />
    </IconButton>
  </Tooltip>
);

export default React.memo(MeFilterButton);
