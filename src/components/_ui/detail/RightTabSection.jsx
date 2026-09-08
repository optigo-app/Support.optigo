import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  CardContent,
  Divider,
  Tooltip,
} from "@mui/material";
import { RightPanel } from "./CadJobDetailPanelstyles";

const stringToColor = (string) => {
  if (!string) return "#3b82f6";
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Helper to get initials from name
const getInitials = (name) => {
  if (!name) return "";
  const cleanName = name.replace(/\s+/g, " ").trim();
  const parts = cleanName.split(" ");
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase();
};

const ProcessStageSection = ({
  stageName = "",
  stageNumber = "",
  designersList = [],
  fallbackDesignerName = "",
}) => {
  if (!stageNumber || stageNumber === "-") return null;

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.75,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#4b5563" }}>
          {stageName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            px: 1,
            py: 0.25,
            bgcolor: "#f3f4f6",
            color: "#374151",
            borderRadius: 1,
          }}
        >
          {stageNumber}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pl: 0.5 }}>
        {designersList.length > 0 ? (
          designersList.map((designer, idx) => (
            <Tooltip
              key={designer.id || idx}
              title={`${designer.name} (${designer.Designation || "Designer"})`}
              arrow
            >
              <Chip
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: stringToColor(designer.name),
                      color: "white !important",
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(designer.name)}
                  </Avatar>
                }
                label={designer.name}
                variant="outlined"
                sx={{
                  borderColor: "#e5e7eb",
                  bgcolor: "#f9fafb",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#374151",
                  "& .MuiChip-avatar": {
                    width: 20,
                    height: 20,
                  },
                }}
              />
            </Tooltip>
          ))
        ) : fallbackDesignerName ? (
          <Tooltip title={`${fallbackDesignerName} (Assigned Designer)`} arrow>
            <Chip
              avatar={
                <Avatar
                  sx={{
                    bgcolor: stringToColor(fallbackDesignerName),
                    color: "white !important",
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  {getInitials(fallbackDesignerName)}
                </Avatar>
              }
              label={fallbackDesignerName}
              variant="outlined"
              sx={{
                borderColor: "#e5e7eb",
                bgcolor: "#f9fafb",
                fontSize: "11px",
                fontWeight: 500,
                color: "#374151",
                "& .MuiChip-avatar": {
                  width: 20,
                  height: 20,
                },
              }}
            />
          </Tooltip>
        ) : (
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", fontStyle: "italic", pl: 0.5 }}
          >
            No designer assigned
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const RightTabSection = ({
  conceptNo = "",
  sketchNo = "",
  designIdeaNo = "",
  designers = [],
  conceptDesigners = [],
  sketchDesigners = [],
  designDesigners = [],
  cadDesigners = [],
  cadData = {},
}) => {
  // Safe extraction of properties from cadData
  const title =
    cadData?.title ||
    cadData?.Productname ||
    (conceptNo ? `Concept ${conceptNo}` : "CAD Job Detail");
  const status = cadData?.status || cadData?.approval_status || "Pending";
  const category = cadData?.category || "-";
  const subcategory = cadData?.subcategory || "-";
  const jobNo = cadData?.job_no || cadData?.JobNo || "-";
  const assignToCad = cadData?.moveTo || cadData?.AssignToCad || "CAD";
  const uploadedBy =
    cadData?.imageupload || cadData?.CustomerName || cadData?.customer || "-";
  const requestedDesign = cadData?.req_design || "-";
  const designIdea = cadData?.design_idea || "-";
  const actualCompDate =
    cadData?.actual_comp_date || cadData?.cadcompdate || "-";
  const lastUpdated =
    cadData?.last_updated || cadData?.entrydate || cadData?.Entrydate || "-";

  // Standard status styling helper
  const getStatusColor = (val) => {
    const s = String(val).toUpperCase();
    if (s.includes("ACCEPT") || s.includes("APPROV"))
      return { bg: "#e8f5e9", text: "#2e7d32" };
    if (s.includes("REJECT")) return { bg: "#ffebee", text: "#c62828" };
    if (s.includes("HOLD")) return { bg: "#fff3e0", text: "#ef6c00" };
    return { bg: "#eff6ff", text: "#1d4ed8" };
  };

  const statusStyle = getStatusColor(status);

  const formatDateString = (dtStr) => {
    if (!dtStr || dtStr === "-") return "-";
    try {
      const dt = new Date(dtStr);
      if (isNaN(dt.getTime())) return dtStr;
      return dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dtStr;
    }
  };

  const designerName = cadData?.DesignerName || cadData?.designer || "";

  // Normalize stage numbers, treating "-" as empty
  const conceptNoVal = (
    conceptNo ||
    cadData?.Concept_no ||
    cadData?.conceptno ||
    ""
  )
    .replace(/-+$/, "")
    .trim();
  const sketchNoVal = (sketchNo || cadData?.sketch_no || "")
    .replace(/-+$/, "")
    .trim();
  const designIdeaVal = (
    designIdeaNo ||
    cadData?.design_idea ||
    cadData?.DesignIdeaNo ||
    ""
  )
    .replace(/-+$/, "")
    .trim();
  const jobNoVal = (jobNo || cadData?.job_no || cadData?.JobNo || "")
    .replace(/-+$/, "")
    .trim();

  const cadDesignersToUse = cadDesigners || [];

  // Collect all unique active designers across the active stages
  const allDesigners = [];
  if (conceptNoVal) allDesigners.push(...conceptDesigners);
  if (sketchNoVal) allDesigners.push(...sketchDesigners);
  if (designIdeaVal) allDesigners.push(...designDesigners);
  if (jobNoVal) allDesigners.push(...cadDesignersToUse);

  const uniqueDesigners = [];
  const seenIdsOrNames = new Set();
  allDesigners.forEach((d) => {
    if (!d || !d.name) return;
    const key = d.id || d.name;
    if (key && !seenIdsOrNames.has(key)) {
      seenIdsOrNames.add(key);
      uniqueDesigners.push(d);
    }
  });

  // Fallback to designerName if uniqueDesigners is empty
  if (uniqueDesigners.length === 0 && designerName) {
    uniqueDesigners.push({
      id: "assigned",
      name: designerName,
      Designation: "Assigned Designer",
    });
  }

  return (
    <RightPanel
      sx={{
        paddingRight: 1,
      }}
    >
      <CardContent
        sx={{
          padding: "14px",
          backgroundColor: "#bdbdbd17",
          height: "100%",
          width: "100%",
          borderRadius: 4,
          boxShadow: " rgba(0, 0, 0, 0.1) 0px 4px 12px",
        }}
      >
        {/* Title */}
        <Typography
          variant="body1"
          sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.4, color: "#111827" }}
        >
          {title}
        </Typography>

        {/* Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
          <Chip
            label={status}
            size="small"
            sx={{
              bgcolor: statusStyle.bg,
              color: statusStyle.text,
              fontSize: "11px",
              fontWeight: 700,
              height: "22px",
              borderRadius: "11px",
            }}
          />
          {category && category !== "-" && (
            <Chip
              label={category}
              size="small"
              sx={{
                bgcolor: "#e0f2fe",
                color: "#0369a1",
                fontSize: "11px",
                fontWeight: 600,
                height: "22px",
                borderRadius: "11px",
              }}
            />
          )}
          {subcategory && subcategory !== "-" && (
            <Chip
              label={subcategory}
              size="small"
              sx={{
                bgcolor: "#faf5ff",
                color: "#7e22ce",
                fontSize: "11px",
                fontWeight: 600,
                height: "22px",
                borderRadius: "11px",
              }}
            />
          )}
        </Box>

        {/* Job Details */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "#374151", mb: 1 }}
        >
          Job Reference
        </Typography>
        <Box
          sx={{ mb: 2.5, display: "flex", flexDirection: "column", gap: 0.75 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Job No:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {jobNo}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Concept No:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {conceptNo || "-"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Sketch No:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {sketchNo || "-"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Assigned To:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {assignToCad}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Uploaded By:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {uploadedBy}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#f3f4f6" }} />

        {/* Design Specs */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "#374151", mb: 1 }}
        >
          Specifications & Dates
        </Typography>
        <Box
          sx={{ mb: 2.5, display: "flex", flexDirection: "column", gap: 0.75 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Requested Design:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {requestedDesign}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Design Idea:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {designIdea}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Actual Completion:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {formatDateString(actualCompDate)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Last Updated:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {formatDateString(lastUpdated)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#f3f4f6" }} />

        {/* Process Designers */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "#374151", mb: 1.5 }}
        >
          Process Designers
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ProcessStageSection
            stageName="Concept Stage"
            stageNumber={conceptNoVal}
            designersList={conceptDesigners}
          />
          <ProcessStageSection
            stageName="Sketch Stage"
            stageNumber={sketchNoVal}
            designersList={sketchDesigners}
          />
          <ProcessStageSection
            stageName="Design Stage"
            stageNumber={designIdeaVal}
            designersList={designDesigners}
          />
          <ProcessStageSection
            stageName="CAD Stage"
            stageNumber={jobNoVal}
            designersList={cadDesignersToUse}
            fallbackDesignerName={designerName}
          />
        </Box>

        {/* Avatar stack at bottom */}
        {uniqueDesigners.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 3, pl: 0.5 }}>
            {uniqueDesigners.map((designer, idx) => (
              <Tooltip
                key={designer.id || idx}
                title={`${designer.name} (${designer.Designation || "Designer"})`}
                arrow
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    mr: idx < uniqueDesigners.length - 1 ? -1 : 0,
                    border: "2px solid white",
                    zIndex: uniqueDesigners.length - idx,
                    bgcolor: stringToColor(designer.name),
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 700,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {getInitials(designer.name)}
                </Avatar>
              </Tooltip>
            ))}
            <Typography
              variant="caption"
              sx={{ ml: 1.5, color: "#6b7280", fontWeight: 500 }}
            >
              {uniqueDesigners.length} designer
              {uniqueDesigners.length > 1 ? "s" : ""} active
            </Typography>
          </Box>
        )}
      </CardContent>
    </RightPanel>
  );
};

export default RightTabSection;
