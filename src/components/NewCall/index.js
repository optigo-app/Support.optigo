import React from "react";
import ChatWorkspace from "./ChatWorkspace";
import { Box } from "@mui/material";

const NewCallDashboard = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing:'border-box'
      }}
    >
      <ChatWorkspace />
    </Box>
  );
};

export default NewCallDashboard;
