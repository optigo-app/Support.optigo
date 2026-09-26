import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  Divider,
  Chip,
  Fade,
} from "@mui/material";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import TimerIcon from "@mui/icons-material/Timer";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Virtuoso } from "react-virtuoso";
import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CallDetailModal from "./CallDetailModal";
import TimelineChartModal from "./TimelineChartModal";
import CalendarMiniMapModal from "./CallGroupModal";
import { isAnalysis$, toggleAnalysis, useSubject } from "../../../rxjs/layoutStore";
import { HeaderHeight } from "../../_ui/HeaderWrapper";

// --- 1. HELPERS ---

const parseDurationString = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  if (parts.length !== 3) return 0;
  return +parts[0] * 3600 + +parts[1] * 60 + +parts[2];
};

const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const hDisplay = h > 0 ? `${h}h ` : "";
  const mDisplay = m > 0 || h > 0 ? `${m}m ` : "";
  const sDisplay = `${s < 10 && (h > 0 || m > 0) ? "0" : ""}${s}s`;
  return (hDisplay + mDisplay + sDisplay).trim();
};

const TooltipContent = ({
  user,
  count,
  duration,
  followUpCount = 0,
  followUpSeconds = 0,
  forwardedCount = 0,
  forwardedSeconds = 0,
}) => {
  const mainCalls = Math.max(0, count - (followUpCount + forwardedCount));
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.2)", pb: 0.5, mb: 0.5 }}>
        {user}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: "#ccc" }}>
          Main Calls: <span style={{ color: "#fff" }}>{mainCalls}</span>
        </Typography>
        {followUpCount > 0 && (
          <Typography variant="caption" sx={{ color: "#ccc" }}>
            Follow-ups: <span style={{ color: "#ffb74d" }}>+{followUpCount}</span> ({formatDuration(followUpSeconds)})
          </Typography>
        )}
        {forwardedCount > 0 && (
          <Typography variant="caption" sx={{ color: "#ccc" }}>
            Forwarded: <span style={{ color: "#ce93d8" }}>+{forwardedCount}</span> ({formatDuration(forwardedSeconds)})
          </Typography>
        )}
        <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />
        <Typography variant="caption" sx={{ color: "#ccc", fontWeight: "bold" }}>
          Total Calls: <span style={{ color: "#fff" }}>{count}</span>
        </Typography>
        <Typography variant="caption" sx={{ color: "#ccc", fontWeight: "bold" }}>
          Total Duration: <span style={{ color: "#81c784" }}>{formatDuration(duration)}</span>
        </Typography>
      </Box>
    </Box>
  );
};

const CallDurationList = ({ data = [], dateRange, RecordMode }) => {
  const isAnalysis = useSubject(isAnalysis$);
  const ToggleAnalysis = React.useCallback(() => {
    toggleAnalysis();
  }, []);

  const [viewMode, setViewMode] = useState("receiver");
  const [droppedFilter, setDroppedFilter] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data))
      return {
        list: [],
        totalDuration: 0,
        totalCalls: 0,
        totalFollowUpDuration: 0,
        totalFollowUpCalls: 0,
        totalForwardedDuration: 0,
        totalForwardedCalls: 0,
      };

    const { startDate, endDate } = dateRange || {};
    const start = startDate ? startOfDay(new Date(startDate)) : null;
    const end = endDate ? endOfDay(new Date(endDate)) : null;

    const groupMap = new Map();
    let grandTotalSeconds = 0;
    let grandTotalCalls = 0;
    let grandTotalFollowUpSeconds = 0;
    let grandTotalFollowUpCalls = 0;
    let grandTotalForwardedSeconds = 0;
    let grandTotalForwardedCalls = 0;

    data.forEach((row) => {
      if (!row.date) return;
      const rowDateObj = parseISO(row.date);
      if (!isValid(rowDateObj)) return;
      if (start && end) {
        if (!isWithinInterval(rowDateObj, { start, end })) return;
      }
      const receiverName = row.receivedBy?.trim() ? row.receivedBy.trim() : "Unknown";
      const clientName = row.client?.trim() || row.company?.trim() || row.callBy?.trim() || "Unknown Client";
      const callType = row.CallType?.trim() || "Unknown";

      if (droppedFilter) {
        if (droppedFilter.type === "RECEIVER" && receiverName !== droppedFilter.value) return;
        if (droppedFilter.type === "CLIENT" && clientName !== droppedFilter.value) return;
        if (droppedFilter.type === "CALLTYPE" && callType !== droppedFilter.value) return;
      }

      // --- Follow Up Mode: expand standard follow-up calls ---
      if (viewMode === "followup") {
        if (!row.FollowUpList) return;
        let followUps = [];
        try {
          followUps = JSON.parse(row.FollowUpList);
        } catch (e) {
          return;
        }
        if (!Array.isArray(followUps) || followUps.length === 0) return;
        followUps.forEach((fu) => {
          const isForwarded = fu && (
            fu.IsForwardFollowup === 1 ||
            fu.IsForwardFollowup === "1" ||
            fu.IsForwardFollowup === true ||
            (fu.ForwardedEmpId && Number(fu.ForwardedEmpId) > 0) ||
            (fu.ForwardedEmp && String(fu.ForwardedEmp).trim() !== "")
          );
          if (isForwarded) return; // Standard follow-ups only
          const fuName = fu.CreatedBy?.trim() || fu.ReceivedBy?.trim() || receiverName;
          const fuSeconds = parseDurationString(fu.CallDuration);
          grandTotalSeconds += fuSeconds;
          grandTotalCalls += 1;
          grandTotalFollowUpSeconds += fuSeconds;
          grandTotalFollowUpCalls += 1;
          if (!groupMap.has(fuName)) {
            groupMap.set(fuName, {
              name: fuName,
              totalSeconds: 0,
              count: 0,
              followUpSeconds: 0,
              followUpCount: 0,
              forwardedSeconds: 0,
              forwardedCount: 0,
              calls: [],
            });
          }
          const fuEntry = groupMap.get(fuName);
          fuEntry.totalSeconds += fuSeconds;
          fuEntry.count += 1;
          fuEntry.followUpSeconds += fuSeconds;
          fuEntry.followUpCount += 1;
          fuEntry.calls.push({ ...row, _followUp: fu });
        });
        return;
      }

      // --- Forwarded Call Mode: expand forwarded calls ---
      if (viewMode === "forwarded") {
        if (!row.FollowUpList) return;
        let followUps = [];
        try {
          followUps = JSON.parse(row.FollowUpList);
        } catch (e) {
          return;
        }
        if (!Array.isArray(followUps) || followUps.length === 0) return;
        followUps.forEach((fu) => {
          const isForwarded = fu && (
            fu.IsForwardFollowup === 1 ||
            fu.IsForwardFollowup === "1" ||
            fu.IsForwardFollowup === true ||
            (fu.ForwardedEmpId && Number(fu.ForwardedEmpId) > 0) ||
            (fu.ForwardedEmp && String(fu.ForwardedEmp).trim() !== "")
          );
          if (!isForwarded) return; // Forwarded calls only
          const fName =
            fu.ForwardedEmp?.trim() ||
            fu.AssignedEmpName?.trim() ||
            fu.EmpName?.trim() ||
            fu.CreatedBy?.trim() ||
            receiverName;
          const fuSeconds = parseDurationString(fu.CallDuration);
          grandTotalSeconds += fuSeconds;
          grandTotalCalls += 1;
          grandTotalForwardedSeconds += fuSeconds;
          grandTotalForwardedCalls += 1;
          if (!groupMap.has(fName)) {
            groupMap.set(fName, {
              name: fName,
              totalSeconds: 0,
              count: 0,
              followUpSeconds: 0,
              followUpCount: 0,
              forwardedSeconds: 0,
              forwardedCount: 0,
              calls: [],
            });
          }
          const fuEntry = groupMap.get(fName);
          fuEntry.totalSeconds += fuSeconds;
          fuEntry.count += 1;
          fuEntry.forwardedSeconds += fuSeconds;
          fuEntry.forwardedCount += 1;
          fuEntry.calls.push({ ...row, _followUp: fu, _isForwarded: true });
        });
        return;
      }

      const entityName = viewMode === "receiver" ? receiverName : viewMode === "client" ? clientName : callType;

      let seconds = parseDurationString(row.CallDuration);
      let callCount = 1;
      let followUpSeconds = 0;
      let followUpCount = 0;
      let forwardedSeconds = 0;
      let forwardedCount = 0;

      try {
        if (row.FollowUpList) {
          const followUps = JSON.parse(row.FollowUpList);
          if (Array.isArray(followUps)) {
            followUps.forEach((fu) => {
              const fuDur = fu.CallDuration || "00:00:00";
              if (fuDur !== "00:00:00") {
                const fuSec = parseDurationString(fuDur);
                seconds += fuSec;
                callCount += 1;
                const isForwarded = fu && (
                  fu.IsForwardFollowup === 1 ||
                  fu.IsForwardFollowup === "1" ||
                  fu.IsForwardFollowup === true ||
                  (fu.ForwardedEmpId && Number(fu.ForwardedEmpId) > 0) ||
                  (fu.ForwardedEmp && String(fu.ForwardedEmp).trim() !== "")
                );
                if (isForwarded) {
                  forwardedSeconds += fuSec;
                  forwardedCount += 1;
                } else {
                  followUpSeconds += fuSec;
                  followUpCount += 1;
                }
              }
            });
          }
        }
      } catch (e) {}

      grandTotalSeconds += seconds;
      grandTotalCalls += callCount;
      grandTotalFollowUpSeconds += followUpSeconds;
      grandTotalFollowUpCalls += followUpCount;
      grandTotalForwardedSeconds += forwardedSeconds;
      grandTotalForwardedCalls += forwardedCount;

      if (!groupMap.has(entityName)) {
        groupMap.set(entityName, {
          name: entityName,
          totalSeconds: 0,
          count: 0,
          followUpSeconds: 0,
          followUpCount: 0,
          forwardedSeconds: 0,
          forwardedCount: 0,
          calls: [],
        });
      }
      const entry = groupMap.get(entityName);
      entry.totalSeconds += seconds;
      entry.count += callCount;
      entry.followUpSeconds += followUpSeconds;
      entry.followUpCount += followUpCount;
      entry.forwardedSeconds += forwardedSeconds;
      entry.forwardedCount += forwardedCount;
      entry.calls.push(row);
    });

    const list = Array.from(groupMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);
    return {
      list,
      totalDuration: grandTotalSeconds,
      totalCalls: grandTotalCalls,
      totalFollowUpDuration: grandTotalFollowUpSeconds,
      totalFollowUpCalls: grandTotalFollowUpCalls,
      totalForwardedDuration: grandTotalForwardedSeconds,
      totalForwardedCalls: grandTotalForwardedCalls,
    };
  }, [data, dateRange, viewMode, droppedFilter]);

  const maxDuration = processedData.list.length > 0 ? processedData.list[0].totalSeconds : 0;

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);

      if (payload.value) {
        setDroppedFilter({
          type: payload.type,
          value: payload.value,
        });
      }

      if (payload.type === "CLIENT") setViewMode("client");
      if (payload.type === "RECEIVER") setViewMode("receiver");
      if (payload.type === "CALLTYPE") setViewMode("calltype");
    } catch (err) {
      console.error("Invalid drag payload", err);
    }
  };

  const clearFilter = () => {
    setDroppedFilter(null);
  };

  const Row = ({ context, index }) => {
    const item = context.items[index];
    const percentage = context.maxDuration > 0 ? (item.totalSeconds / context.maxDuration) * 100 : 0;

    return (
      <Box sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1.5, pr: 1 }}>
        <Typography
          variant="body2"
          sx={{
            width: "120px",
            fontWeight: "500",
            color: "#333",
            flexShrink: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mr: 1,
            fontSize: "0.8rem",
          }}
          title={item.name}
        >
          {item.name}
        </Typography>

        <Tooltip
          title={
            <TooltipContent
              user={item.name}
              count={item.count}
              duration={item.totalSeconds}
              followUpCount={item.followUpCount}
              followUpSeconds={item.followUpSeconds}
              forwardedCount={item.forwardedCount}
              forwardedSeconds={item.forwardedSeconds}
            />
          }
          arrow
          placement="top"
          componentsProps={{
            tooltip: { sx: { bgcolor: "#333", color: "#fff", borderRadius: "4px" } },
            arrow: { sx: { color: "#333" } },
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              height: "24px",
              bgcolor: "#f5f5f5",
              borderRadius: 25,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setModalOpen(true);
              setSelectedItem(context.items[index]);
            }}
          >
            <Box
              sx={{
                width: `${percentage}%`,
                height: "100%",
                bgcolor:
                  viewMode === "client"
                    ? "#4fc3f7"
                    : viewMode === "receiver"
                    ? "#81c784"
                    : viewMode === "followup"
                    ? "#1A73E8"
                    : viewMode === "forwarded"
                    ? "#8B5CF6"
                    : "#ff9800",
                borderRadius: 25,
                transition: "width 0.5s ease-in-out",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                top: "50%",
                right: "8px",
                transform: "translateY(-50%)",
                fontWeight: "600",
                color: "#444",
                zIndex: 1,
                fontSize: "0.7rem",
              }}
            >
              {formatDuration(item.totalSeconds)}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    );
  };

    const CalHeight = 138 + HeaderHeight ;
  

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: `calc(100vh - ${CalHeight}px)`,
          width: "100%",
          p: isAnalysis ? 2 : 0,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
          flex: isAnalysis ? 0.26 : 0,
          opacity: isAnalysis ? 1 : 0,
          minHeight: 290,
          borderColor: isDraggingOver
            ? "#1976d2"
            : droppedFilter
            ? droppedFilter.type === "CLIENT"
              ? "#4fc3f7"
              : droppedFilter.type === "RECEIVER"
              ? "#81c784"
              : "#ff9800"
            : "#e0e0e0",
          borderStyle: isDraggingOver ? "dashed" : "solid",
          transition: "all 0.2s ease-in-out",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={() => setTimelineModalOpen(true)}>
              <EqualizerIcon sx={{ color: "#555" }} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#222" }}>
              Analytics
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" variant="standard">
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                disableUnderline
                disabled={!!droppedFilter}
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#1976d2",
                  "& .MuiSelect-select": { py: 0.5, pr: 3 },
                  "&.Mui-disabled": { color: "#999" },
                }}
              >
                <MenuItem value="receiver">By User</MenuItem>
                <MenuItem value="client">By Client</MenuItem>
                <MenuItem value="calltype">By Call Type</MenuItem>
                <MenuItem value="followup">By Follow Up</MenuItem>
                <MenuItem value="forwarded">By Forwarded Call</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small" onClick={ToggleAnalysis}>
              <ArrowForwardIosRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* FILTER INDICATOR */}
        <Fade in={!!droppedFilter} unmountOnExit>
          <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Chip
              icon={<FilterAltIcon style={{ fontSize: 16 }} />}
              label={`Filtered: ${droppedFilter?.value}`}
              onDelete={clearFilter}
              color={droppedFilter?.type === "CLIENT" ? "info" : droppedFilter?.type === "RECEIVER" ? "success" : "warning"}
              size="small"
              sx={{ fontWeight: 600, maxWidth: "90%" }}
            />
          </Box>
        </Fade>

        {/* TOTAL SUMMARY */}
        <Box
          sx={{
            bgcolor: "#f8f9fa",
            p: 2,
            borderRadius: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: droppedFilter
              ? `1px solid ${droppedFilter.type === "CLIENT" ? "#b3e5fc" : droppedFilter.type === "RECEIVER" ? "#c8e6c9" : "#ffe0b2"}`
              : "none",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TimerIcon fontSize="inherit" /> {droppedFilter ? "FILTERED DURATION" : "TOTAL DURATION"}
            </Typography>
            <Typography variant="h5" fontWeight="800" color="#333">
              {formatDuration(processedData.totalDuration)}
            </Typography>
            {(processedData.totalFollowUpDuration > 0 || processedData.totalForwardedDuration > 0) && (
              <Box sx={{ mt: 0.3 }}>
                {processedData.totalFollowUpDuration > 0 && (
                  <Typography variant="caption" sx={{ color: "#E65100", display: "block", fontSize: "0.68rem", fontWeight: 600 }}>
                    (Incl. {formatDuration(processedData.totalFollowUpDuration)} follow-ups)
                  </Typography>
                )}
                {processedData.totalForwardedDuration > 0 && (
                  <Typography variant="caption" sx={{ color: "#6B21A8", display: "block", fontSize: "0.68rem", fontWeight: 600 }}>
                    (Incl. {formatDuration(processedData.totalForwardedDuration)} forwarded)
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1.5 }} />
          <Box sx={{ minWidth: 80 }}>
            <Typography variant="caption" color="text.secondary">
              TOTAL CALLS
            </Typography>
            <Typography variant="h6" fontWeight="600" color="#555">
              {processedData.totalCalls}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, mt: 0.2 }}>
              {processedData.totalFollowUpCalls > 0 && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    bgcolor: "#FFF3E0",
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 0.5,
                    border: "1px solid #FFB74D",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#E65100", fontWeight: 800, fontSize: "0.65rem" }}>
                    +{processedData.totalFollowUpCalls} follow-ups
                  </Typography>
                </Box>
              )}
              {processedData.totalForwardedCalls > 0 && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    bgcolor: "#F3E8FF",
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 0.5,
                    border: "1px solid #E9D5FF",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#6B21A8", fontWeight: 800, fontSize: "0.65rem" }}>
                    +{processedData.totalForwardedCalls} forwarded
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* LIST AREA */}
        <Box sx={{ flexGrow: 1, height: "100%" }}>
          {processedData.list.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.6 }}>
              <PhoneInTalkIcon sx={{ fontSize: 40, mb: 1, color: "#ddd" }} />
              <Typography variant="body2" color="text.secondary">
                No data found for this filter
              </Typography>
            </Box>
          ) : (
            <Virtuoso
              data={processedData.list}
              context={{ items: processedData.list, maxDuration }}
              itemContent={(index, _, context) => <Row index={index} context={context} />}
              style={{ height: "100%", width: "100%" }}
            />
          )}
        </Box>
      </Paper>
      <CallDetailModal
        open={modalOpen}
        calls={selectedItem?.calls || []}
        title={selectedItem?.name || ''}
        onClose={() => setModalOpen(false)}
      />
      <TimelineChartModal
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        data={data}
      />
      {/* <CalendarMiniMapModal
       data={data}
      
   open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
      /> */}
    </>
  );

};

export default CallDurationList;
