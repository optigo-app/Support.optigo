import React, { useState, useEffect, useMemo } from "react";
import { PremiumTooltip } from "../../_ui/CustomUI";
import { Box, Typography } from "@mui/material";
import DescriptionEditPopover from "./DescriptionEditPopover";
import { useCallLog } from "../../../context/UseCallLog";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";


import { parseFollowUpList, isForwardedCall } from "../../../utils/callLogUtils";

const DescriptionColumn = ({ params }) => {
  const { UpdateCall } = useCallLog();
  const callId = params?.row?.sr;
  const initialDescription = params?.row?.description || params?.value || "";
  const appName = params?.row?.appname || "";

  const [anchorEl, setAnchorEl] = useState(null);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  // Parse follow-up list and extract only those with descriptions
  const followUpDescriptions = useMemo(() => {
    const list = parseFollowUpList(params?.row?.FollowUpList);
    return list.filter((fu) => !!(fu?.Description || fu?.Descr));
  }, [params?.row?.FollowUpList]);

  const isValidDate = (d) =>
    typeof d === "string" && d && !d.startsWith("1900-01-01");

  const handleOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    if (loading) return;
    setAnchorEl(null);
  };

  const handleSave = async (newValue) => {
    setLoading(true);
    const trimmed = newValue?.trim() || "";
    const current = description?.trim() || "";
    if (trimmed === current) {
      setLoading(false);
      setAnchorEl(null);
      return;
    }
    const result = await UpdateCall(callId, { description: trimmed });
    setLoading(false);
    if (result?.success) {
      setDescription(trimmed);
      setAnchorEl(null);
      return {};
    }
    return { error: result?.message || "Failed to update description" };
  };

  const open = Boolean(anchorEl);

  // Raycast/Vercel-style compact tooltip — dark readable text on light bg
  const tooltipContent = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 220, maxWidth: 300 }}>

      {/* Main description */}
      {description ? (
        <Typography sx={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#0f172a",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {description}
        </Typography>
      ) : (
        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>
          No description
        </Typography>
      )}

      {/* App name — vibrant violet */}
      {appName && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#7c3aed", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.7rem", color: "#7c3aed", fontWeight: 600, letterSpacing: 0.2 }}>
            {appName}
          </Typography>
        </Box>
      )}

      {/* Follow-up section */}
      {followUpDescriptions.length > 0 && (
        <>
          {/* Hairline divider */}
          <Box sx={{ height: "1px", bgcolor: "#e2e8f0", my: 1, mx: -1.5 }} />

          {/* Section label — sky blue */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.6 }}>
            <ReplayRoundedIcon sx={{ fontSize: 11, color: "#0284c7" }} />
            <Typography sx={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "#0284c7",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}>
              Follow-up notes · {followUpDescriptions.length}
            </Typography>
          </Box>

          {/* Follow-up & Forwarded items */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
            {followUpDescriptions.map((fu, idx) => {
              const isDone = isValidDate(fu?.CallClosed) || (fu?.CallDuration && fu?.CallDuration !== "00:00:00");
              const isForwarded = isForwardedCall(fu);

              return (
                <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                  {/* Header row: ID · creator/forward · status pill */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap" }}>
                    {/* ID — indigo monospace */}
                    <Typography sx={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      color: isForwarded ? "#7c3aed" : "#4f46e5",
                      fontFamily: "monospace",
                      lineHeight: 1,
                    }}>
                      #{fu.Id}
                    </Typography>
                    {/* Creator / Transfer info */}
                    <Typography sx={{ fontSize: "0.65rem", color: isForwarded ? "#6b21a8" : "#92400e", fontWeight: 600, lineHeight: 1 }}>
                      {fu.CreatedBy || ""}{isForwarded && fu.ForwardedEmp ? ` → ${fu.ForwardedEmp}` : ""}
                    </Typography>
                    {/* Status pill */}
                    <Box sx={{
                      ml: "auto",
                      px: 0.8,
                      py: 0.25,
                      borderRadius: "5px",
                      bgcolor: isDone ? "#dcfce7" : isForwarded ? "#f3e8ff" : "#fff7ed",
                      border: `1px solid ${isDone ? "#86efac" : isForwarded ? "#d8b4fe" : "#fdba74"}`,
                    }}>
                      <Typography sx={{
                        fontSize: "0.58rem",
                        fontWeight: 800,
                        color: isDone ? "#166534" : isForwarded ? "#6b21a8" : "#9a3412",
                        lineHeight: 1,
                        letterSpacing: 0.4,
                      }}>
                        {isDone ? "DONE" : isForwarded ? "FORWARDED" : "PENDING"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Note text — dark slate */}
                  <Typography sx={{
                    fontSize: "0.74rem",
                    color: "#374151",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    pl: 0.2,
                  }}>
                    {fu.Description || fu.Descr}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          height: "100%",
          gap: 0,
        }}
      >
        {/* DESCRIPTION TEXT */}
        <PremiumTooltip title={tooltipContent}>
          <Typography
            color="text.primary"
            variant="subtitle2"
            onClick={handleOpen}
            sx={{
              cursor: "pointer",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              fontWeight: 600,
              fontSize: 14,
              padding: "0px 0",
              borderRadius: 1,
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            {description || "-"}
          </Typography>
        </PremiumTooltip>

        {/* APP NAME */}
        <PremiumTooltip title={tooltipContent}>
          <Typography
            color="text.secondary"
            variant="subtitle2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              fontSize: 13.5,
              fontWeight: 500,
            }}
          >
            {appName}
          </Typography>
        </PremiumTooltip>
      </Box>

      {/* EDIT POPOVER WITH LOADING SUPPORT */}
      <DescriptionEditPopover
        open={open}
        anchorEl={anchorEl}
        initialValue={description}
        label="Description"
        maxLength={500}
        loading={loading}
        onSave={handleSave}
        onClose={handleClose}
      />
    </>
  );
};

export default DescriptionColumn;
