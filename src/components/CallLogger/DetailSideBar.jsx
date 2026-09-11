import React, { useEffect, useState } from "react";
import { Drawer, Box, Typography, IconButton, Chip } from "@mui/material";
import {
  X,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock8,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import { ThemeProvider } from "@mui/material/styles";
import { SideBarTheme } from "../../libs/DateTheme";
import {
  SegmentedTabs,
  SegmentedTab,
  PrimaryActionButton,
} from "../_ui/detail/CadJobDetailPanelstyles";
import CallLogDetailView from "./CallDetails";
import PostDetailTab from "./PostDetailTab";
import CompactMediaPreview from "../NewCall/CompactMediaPreview";

export default function CallLogDetailsSidebar({
  open,
  onClose,
  callLogData,
  onEditToggle,
}) {
  const defaultCallLogData = callLogData;
  const [activeTab, setActiveTab] = useState(0);
  const [currentCallId, setCurrentCallId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (callLogData) {
      if (callLogData.sr !== currentCallId) {
        setActiveTab(callLogData.isAnalysis ? 1 : 0);
        setCurrentCallId(callLogData.sr);
      }
    } else {
      setCurrentCallId(null);
    }
  }, [callLogData, currentCallId]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 650,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          pt: 3,
          pb: 2,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "1.125rem",
          }}
        >
          Call Detail
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#64748b",
              border: "none",
              ml: 1,
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Hero Section (Date, Time, Actions) */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Calendar Icon Box */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              overflow: "hidden",
              minWidth: 54,
            }}
          >
            <Box
              sx={{
                bgcolor: "#f1f5f9",
                width: "100%",
                textAlign: "center",
                py: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              {defaultCallLogData?.date &&
              !isNaN(new Date(defaultCallLogData.date))
                ? new Date(defaultCallLogData.date).toLocaleDateString(
                    "en-US",
                    { month: "short" },
                  )
                : "MON"}
            </Box>
            <Box
              sx={{
                py: 0.5,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {defaultCallLogData?.date &&
              !isNaN(new Date(defaultCallLogData.date))
                ? new Date(defaultCallLogData.date).getDate()
                : "17"}
            </Box>
          </Box>
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
            >
              <Typography
                sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}
              >
                {defaultCallLogData?.time || "11:00 AM - 12:00 AM"}
              </Typography>
              <Chip
                label={defaultCallLogData?.status || "-"}
                size="small"
                sx={{
                  bgcolor: "#ede9fe",
                  color: "#6d28d9",
                  fontWeight: 600,
                  borderRadius: 1,
                  height: 24,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "#64748b",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <span style={{ color: "#94a3b8" }}>ID:</span> #
                {defaultCallLogData?.sr || "7781"}
              </Typography>
              <Typography sx={{ color: "#cbd5e1" }}>|</Typography>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Globe size={14} /> GMT+5:30
              </Typography>
              <Typography sx={{ color: "#cbd5e1" }}>|</Typography>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Clock8 size={14} />{" "}
                {defaultCallLogData?.CallDuration || "1 hour"}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <PrimaryActionButton
            onClick={onEditToggle}
            size="small"
            sx={{
              bgcolor: "#f8fafc",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              boxShadow: "none",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            Edit Details
          </PrimaryActionButton>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ px: 3, mb: 1, width: "100%" }}>
        <SegmentedTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="call log tabs"
          variant="fullWidth"
          sx={{ display: "flex", width: "100%" }}
        >
          <SegmentedTab label="Detail Information" />
          <SegmentedTab label="Post-Call Review" />
          <SegmentedTab label="Comments" />
          <SegmentedTab label="Timeline" />
        </SegmentedTabs>
      </Box>

      {/* Attachments Strip — shown when call has file attachments */}
      {(() => {
        const rawPaths =
          defaultCallLogData?.filePath ||
          defaultCallLogData?.imgUrl ||
          defaultCallLogData?.FilePath ||
          defaultCallLogData?.ImgUrl ||
          '';
        const urls = rawPaths
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);
        if (urls.length === 0) return null;
        return (
          <Box
            sx={{
              px: 3,
              pb: 1.5,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <Paperclip size={14} color="#64748b" />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                Attachments ({urls.length})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {urls.map((url, idx) => {
                const parts = url.split('/');
                const fname = parts[parts.length - 1] || `file-${idx + 1}`;
                return (
                  <CompactMediaPreview
                    key={idx}
                    imgUrl={url}
                    filename={fname}
                  />
                );
              })}
            </Box>
          </Box>
        );
      })()}

      {/* Content Section */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
        {activeTab === 0 && (
          <CallLogDetailView toggle={onEditToggle} data={defaultCallLogData} />
        )}
        {activeTab === 1 && <PostDetailTab data={defaultCallLogData} />}
        {activeTab === 2 && (
          <CallLogDetailView
            toggle={onEditToggle}
            data={defaultCallLogData}
            forceTab={0}
          />
        )}
        {activeTab === 3 && (
          <CallLogDetailView
            toggle={onEditToggle}
            data={defaultCallLogData}
            forceTab={1}
          />
        )}
      </Box>
    </Drawer>
  );
}
