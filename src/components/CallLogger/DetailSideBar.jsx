import React, { useEffect, useState } from "react";
import { Drawer, Box, Typography, Divider, IconButton, Tabs, Tab } from "@mui/material";
import { X, ReceiptText } from "lucide-react";
import { ThemeProvider } from "@mui/material/styles";
import { SideBarTheme } from "../../libs/DateTheme";
import CallAnalyticsDashboard from "./CallAnalytics";
import CallLogDetailView from "./CallDetails";
import PostDetailTab from "./PostDetailTab";

export default function CallLogDetailsSidebar({ open, onClose, callLogData, onEditToggle }) {
  const defaultCallLogData = callLogData;
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    setActiveTab(callLogData && callLogData?.isAnalysis ? 1 : 0);
  }, [callLogData]);

  return (
    <ThemeProvider theme={SideBarTheme}>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 480,
            p: 2,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            <ReceiptText /> Call Log / {defaultCallLogData && defaultCallLogData?.company}
          </Typography>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </Box>

        <Divider sx={{ mt: 1 }} />

        {/* Tabs Section */}
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="call log tabs" sx={{ mb: 2 }} variant="fullWidth">
          <Tab label="Call Details" />
          <Tab label="Post-Call Review" />
        </Tabs>

        {/* Content Section */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
          {activeTab === 0 && <CallLogDetailView toggle={onEditToggle} data={defaultCallLogData} />}
          {activeTab === 1 && <PostDetailTab data={defaultCallLogData} />}
          {/* <CallAnalyticsDashboard data={defaultCallLogData} /> */}
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}
