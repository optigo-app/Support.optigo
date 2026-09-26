import React from "react";
import ArchivedCallLogApp from "./ArchivedCallLog";
import MetaWrapper from "../../meta/MetaWrapper";
import { Box } from "@mui/material";

const ArchivedCallLogPage = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <MetaWrapper page="ArchivedCallLog" />
      <ArchivedCallLogApp />
    </Box>
  );
};

export default ArchivedCallLogPage;
