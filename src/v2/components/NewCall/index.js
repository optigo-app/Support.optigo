import React from "react";
import ChatWorkspace from "./ChatWorkspace";
import { Box } from "@mui/material";
import CreateServiceDialog from "../_ui/test/dia";

const NewCallDashboard = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: 'border-box'
      }}
    >
      <ChatWorkspace />
      {/* <CreateServiceDialog /> */}
    </Box>
  );
};

export default NewCallDashboard;
