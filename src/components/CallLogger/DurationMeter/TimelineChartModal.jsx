import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  Dialog,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import {
  format,
  parseISO,
  eachDayOfInterval,
  isSameDay,
  subMonths,
  addMonths,
  isValid,
  startOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Virtuoso } from "react-virtuoso";

// --- HELPERS ---
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
  return `${h > 0 ? h + "h " : ""}${m > 0 || h > 0 ? m + "m " : ""}${s}s`.trim();
};

const CallItem = ({ item, isLast }) => {
  const isFollowUp = item._type === "followup";
  const isForwarded = item._type === "forwarded";
  const isMain = !isFollowUp && !isForwarded;

  const parentCall = item._parent || item;
  const fu = item._followUp;

  const title = isMain
    ? item.client || item.company || "Direct Interaction"
    : isForwarded
    ? `Forwarded Call #${fu?.Id || ''}`
    : `Follow-Up Call #${fu?.Id || ''}`;

  const creator = isMain
    ? item.receivedBy || "Direct Line"
    : fu?.CreatedBy || parentCall.receivedBy || "Unknown";

  const forwardedTo = isForwarded
    ? fu?.ForwardedEmp || fu?.AssignedEmpName || fu?.EmpName
    : null;

  const durationStr = isMain
    ? item.CallDuration
    : fu?.CallDuration;

  const description = isMain
    ? item.description || item.title
    : fu?.Description || fu?.Descr || fu?.Reason;

    
  const callDateStr = isMain
    ? item.date
    : fu?.CallStart || parentCall.date;

  const themeColor = isForwarded ? "#8b5cf6" : isFollowUp ? "#f97316" : "#3b82f6";
  const themeBgLight = isForwarded ? "#f3e8ff" : isFollowUp ? "#fff7ed" : "#eff6ff";
  const themeBorder = isForwarded ? "#e9d5ff" : isFollowUp ? "#ffedd5" : "#dbeafe";
  const themeText = isForwarded ? "#6b21a8" : isFollowUp ? "#c2410c" : "#1d4ed8";

  return (
    <Box sx={{ position: "relative", pl: 4, pb: 2.5 }}>
      {!isLast && (
        <Box sx={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, bgcolor: "#e2e8f0" }} />
      )}
      {/* Node Indicator */}
      <Box
        sx={{
          position: "absolute",
          left: 5,
          top: 10,
          width: 14,
          height: 14,
          borderRadius: "50%",
          bgcolor: themeColor,
          border: "3px solid #fff",
          zIndex: 1,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      />

      <Box
        sx={{
          bgcolor: "#fff",
          p: 2.2,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
            borderColor: themeBorder,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 900, color: "#0f172a", fontSize: "0.88rem", mb: 0.4 }}>
              {title}
            </Typography>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
              <Chip
                label={isForwarded ? "FORWARDED" : isFollowUp ? "FOLLOW-UP" : (item.CallType || "MAIN CALL")}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.62rem",
                  fontWeight: 950,
                  bgcolor: themeColor,
                  color: "#fff",
                  borderRadius: 1.2,
                  boxShadow: `0 2px 6px ${themeColor}40`,
                }}
              />
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.75rem" }}>
                By: <span style={{ color: "#0f172a", fontWeight: 800 }}>{creator}</span>
                {forwardedTo && (
                  <span> → <span style={{ color: "#6b21a8", fontWeight: 800, backgroundColor: "#f3e8ff", padding: "1px 6px", borderRadius: "4px" }}>{forwardedTo}</span></span>
                )}
              </Typography>
            </Stack>
          </Box>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 950,
              color: themeText,
              bgcolor: themeBgLight,
              px: 1,
              py: 0.4,
              borderRadius: 1.5,
              border: `1px solid ${themeBorder}`,
              fontSize: "0.72rem",
            }}
          >
            {formatDuration(parseDurationString(durationStr))}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1.4, borderColor: "#f1f5f9" }} />

        {isForwarded && fu?.Reason && (
          <Box sx={{ mb: 1.2, p: 1.2, bgcolor: "#f3e8ff50", borderRadius: 2, border: "1px solid #e9d5ff" }}>
            <Typography variant="caption" sx={{ color: "#8b5cf6", fontWeight: 950, textTransform: "uppercase", fontSize: "0.6rem", letterSpacing: 0.8, display: "block" }}>
              FORWARD REASON
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "#6b21a8", fontWeight: 800, mt: 0.2 }}>
              {fu.Reason}
            </Typography>
          </Box>
        )}

        {description && (
          <Box sx={{ p: description ? 1 : 0, bgcolor: "#f8fafc", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 900, textTransform: "uppercase", fontSize: "0.6rem", letterSpacing: 0.8, display: "block" }}>
              {isMain ? "DESCRIPTION / TITLE" : "NOTES"}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.76rem", color: "#475569", fontWeight: 600, mt: 0.2, lineHeight: 1.45 }}>
              {description}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 1.8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800, fontSize: "0.72rem" }}>
            {isValid(new Date(callDateStr)) ? format(new Date(callDateStr), "MMM dd, yyyy • HH:mm") : "-"}
          </Typography>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: item.Status === "Completed" || fu?.CallClosed ? "#10b981" : "#f59e0b",
                boxShadow: item.Status === "Completed" || fu?.CallClosed ? "0 0 8px #10b981" : "0 0 8px #f59e0b",
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 950, color: "#475569", textTransform: "uppercase", fontSize: "0.62rem" }}>
              {item.Status || (fu?.CallClosed ? "Closed" : "Pending")}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

const TimelineChartModal = ({ open, onClose, data = [], title = "User Analytics" }) => {
  const [scrollEl, setScrollEl] = useState(null);
  const containerRef = useRef(null);
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Expand all call entries including nested follow-up and forwarded calls
  const expandedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const list = [];
    data.forEach((row) => {
      list.push({ ...row, _type: "main" });

      if (row.FollowUpList) {
        try {
          const followUps = JSON.parse(row.FollowUpList);
          if (Array.isArray(followUps)) {
            followUps.forEach((fu) => {
              const isForwarded = fu && (
                fu.IsForwardFollowup === 1 ||
                fu.IsForwardFollowup === "1" ||
                fu.IsForwardFollowup === true ||
                (fu.ForwardedEmpId && Number(fu.ForwardedEmpId) > 0) ||
                (fu.ForwardedEmp && String(fu.ForwardedEmp).trim() !== "")
              );
              const fuDate = fu.CallStart || fu.CreatedDate || row.date;
              list.push({
                ...row,
                _type: isForwarded ? "forwarded" : "followup",
                _followUp: fu,
                _parent: row,
                date: fuDate,
              });
            });
          }
        } catch (e) {}
      }
    });
    return list;
  }, [data]);

  // Overall counts for category tabs
  const categoryCounts = useMemo(() => {
    let main = 0;
    let followup = 0;
    let forwarded = 0;
    expandedData.forEach((item) => {
      if (item._type === "main") main++;
      else if (item._type === "followup") followup++;
      else if (item._type === "forwarded") forwarded++;
    });
    return { all: expandedData.length, main, followup, forwarded };
  }, [expandedData]);

  const aggregatedData = useMemo(() => {
    const end = endOfMonth(baseDate);
    const start = subMonths(startOfMonth(baseDate), 3);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dayItems = expandedData.filter((item) => {
        if (!item.date) return false;
        const itemDate = startOfDay(parseISO(item.date));
        if (!isValid(itemDate) || !isSameDay(itemDate, day)) return false;

        if (categoryFilter === "main") return item._type === "main";
        if (categoryFilter === "followup") return item._type === "followup";
        if (categoryFilter === "forwarded") return item._type === "forwarded";
        return true;
      });

      const mainCount = dayItems.filter((i) => i._type === "main").length;
      const followUpCount = dayItems.filter((i) => i._type === "followup").length;
      const forwardedCount = dayItems.filter((i) => i._type === "forwarded").length;

      const totalSecs = dayItems.reduce((acc, item) => {
        const dur = item._type === "main" ? item.CallDuration : item._followUp?.CallDuration;
        return acc + parseDurationString(dur);
      }, 0);

      return {
        date: day,
        count: dayItems.length,
        mainCount,
        followUpCount,
        forwardedCount,
        totalSecs,
        items: dayItems,
      };
    });
  }, [expandedData, baseDate, categoryFilter]);

  const maxValue = useMemo(() => Math.max(...aggregatedData.map((d) => d.count), 1), [aggregatedData]);

  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    return aggregatedData.find((d) => isSameDay(d.date, selectedDay));
  }, [selectedDay, aggregatedData]);

  // --- PERFECT & ROBUST WHEEL SCROLL ---
  useEffect(() => {
    const el = scrollEl;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const speed = e.deltaMode === 1 ? 34 : 1.6;
        el.scrollLeft += e.deltaY * speed;
      } else if (Math.abs(e.deltaX) > 0) {
        el.scrollLeft += e.deltaX * 1.6;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    let timer;
    if (open) {
      timer = setTimeout(() => {
        if (el) el.scrollLeft = el.scrollWidth;
      }, 100);
    }

    return () => {
      el.removeEventListener("wheel", onWheel);
      if (timer) clearTimeout(timer);
    };
  }, [scrollEl, open, baseDate]);

  const BAR_WIDTH = 34;
  const MODAL_HEIGHT = 700;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          bgcolor: "#fff",
          backgroundImage: "none",
          overflow: "hidden",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.28)",
          maxWidth: selectedDay ? 1320 : 940,
          height: MODAL_HEIGHT,
          transition: "max-width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)",
          mx: "auto",
        },
      }}
    >
      <Box ref={containerRef} sx={{ display: "flex", height: "100%", position: "relative" }}>
        {/* MAIN PANEL */}
        <Box sx={{ flex: 1, minWidth: 800, display: "flex", flexDirection: "column", borderRight: selectedDay ? "2px solid #f1f5f9" : "none", transition: "all 0.3s ease" }}>
          {/* HEADER */}
          <Box sx={{ p: 3.5, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.6, borderRadius: 3.5, background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", border: "1px solid #BFDBFE" }}>
                <PhoneCallbackRoundedIcon sx={{ color: "#2563EB", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 950, color: "#94a3b8", letterSpacing: 2, lineHeight: 1, fontSize: "0.68rem" }}>
                  TIMELINE ANALYTICS ENGINE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.75rem", mt: 0.2 }}>
                  {categoryCounts.all} <Typography component="span" variant="body1" sx={{ color: "#64748b", fontWeight: 800 }}>Total Activity Logs</Typography>
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="large" sx={{ borderRadius: 3, border: "2px solid #f1f5f9", p: 1, "&:hover": { bgcolor: "#f8fafc" } }}>
              <CloseIcon sx={{ fontSize: 22, color: "#64748b" }} />
            </IconButton>
          </Box>

          {/* CATEGORY FILTER TABS */}
          <Box sx={{ px: 3.5, pt: 1, pb: 1, display: "flex", gap: 1 }}>
            <Chip
              label={`All (${categoryCounts.all})`}
              onClick={() => setCategoryFilter("all")}
              sx={{
                fontWeight: 900,
                fontSize: "0.75rem",
                height: 30,
                bgcolor: categoryFilter === "all" ? "#0f172a" : "#f1f5f9",
                color: categoryFilter === "all" ? "#fff" : "#475569",
                boxShadow: categoryFilter === "all" ? "0 4px 12px rgba(15, 23, 42, 0.2)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                ":hover": { bgcolor: categoryFilter === "all" ? "#1e293b" : "#e2e8f0" },
              }}
            />
            <Chip
              label={`Main Calls (${categoryCounts.main})`}
              onClick={() => setCategoryFilter("main")}
              sx={{
                fontWeight: 900,
                fontSize: "0.75rem",
                height: 30,
                bgcolor: categoryFilter === "main" ? "#2563eb" : "#eff6ff",
                color: categoryFilter === "main" ? "#fff" : "#1d4ed8",
                border: "1px solid #bfdbfe",
                boxShadow: categoryFilter === "main" ? "0 4px 12px rgba(37, 99, 235, 0.25)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                ":hover": { bgcolor: categoryFilter === "main" ? "#1d4ed8" : "#dbeafe" },
              }}
            />
            <Chip
              label={`Follow-Ups (${categoryCounts.followup})`}
              onClick={() => setCategoryFilter("followup")}
              sx={{
                fontWeight: 900,
                fontSize: "0.75rem",
                height: 30,
                bgcolor: categoryFilter === "followup" ? "#ea580c" : "#fff7ed",
                color: categoryFilter === "followup" ? "#fff" : "#c2410c",
                border: "1px solid #fed7aa",
                boxShadow: categoryFilter === "followup" ? "0 4px 12px rgba(234, 88, 12, 0.25)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                ":hover": { bgcolor: categoryFilter === "followup" ? "#c2410c" : "#ffedd5" },
              }}
            />
            <Chip
              label={`Forwarded (${categoryCounts.forwarded})`}
              onClick={() => setCategoryFilter("forwarded")}
              sx={{
                fontWeight: 900,
                fontSize: "0.75rem",
                height: 30,
                bgcolor: categoryFilter === "forwarded" ? "#7c3aed" : "#f3e8ff",
                color: categoryFilter === "forwarded" ? "#fff" : "#6b21a8",
                border: "1px solid #ddd6fe",
                boxShadow: categoryFilter === "forwarded" ? "0 4px 12px rgba(124, 58, 237, 0.25)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                ":hover": { bgcolor: categoryFilter === "forwarded" ? "#6d28d9" : "#e9d5ff" },
              }}
            />
          </Box>

          {/* DASHBOARD NAV */}
          <Box sx={{ px: 3.5, mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                onClick={() => {
                  setBaseDate((prev) => subMonths(prev, 1));
                  setSelectedDay(null);
                }}
                size="small"
                sx={{ border: "1.5px solid #e2e8f0", p: 0.8, borderRadius: 2.5, "&:hover": { borderColor: "#3b82f6", bgcolor: "#eff6ff" } }}
              >
                <ArrowBackIosNewRoundedIcon sx={{ fontSize: 13, color: "#334155" }} />
              </IconButton>
              <Box sx={{ px: 2.5, py: 0.8, bgcolor: "#f8fafc", borderRadius: 3, border: "1.5px solid #e2e8f0" }}>
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 950, color: "#0f172a" }}>
                  {format(baseDate, "MMMM yyyy")}
                </Typography>
              </Box>
              <IconButton
                onClick={() => {
                  setBaseDate((prev) => addMonths(prev, 1));
                  setSelectedDay(null);
                }}
                size="small"
                sx={{ border: "1.5px solid #e2e8f0", p: 0.8, borderRadius: 2.5, "&:hover": { borderColor: "#3b82f6", bgcolor: "#eff6ff" } }}
              >
                <ArrowForwardIosRoundedIcon sx={{ fontSize: 13, color: "#334155" }} />
              </IconButton>
            </Stack>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 900, fontSize: "0.72rem", letterSpacing: 0.5 }}>
              RANGE: {format(aggregatedData[0].date, "MMM yyyy")} – {format(aggregatedData[aggregatedData.length - 1].date, "MMM yyyy")}
            </Typography>
          </Box>

          {/* CHART ENGINE AREA */}
          <Box
            ref={setScrollEl}
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              width: "100%",
              overflowX: "auto",
              px: 3,
              pb: 3.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {aggregatedData.map((dayData, index) => {
              const barHeight = (dayData.count / maxValue) * 310;
              const isSelected = selectedDay && isSameDay(dayData.date, selectedDay);
              const isFirst = format(dayData.date, "d") === "1";

              // Premium Gradient Bar Backgrounds
              let barGradient = "linear-gradient(180deg, #10B981 0%, #059669 100%)";
              if (isSelected) {
                barGradient = "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)";
              } else if (categoryFilter === "forwarded") {
                barGradient = "linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%)";
              } else if (categoryFilter === "followup") {
                barGradient = "linear-gradient(180deg, #F97316 0%, #EA580C 100%)";
              } else if (categoryFilter === "main") {
                barGradient = "linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)";
              } else if (dayData.count === 0) {
                barGradient = "#f1f5f9";
              }

              const tooltipTitle = (
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, display: "block", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.2)", pb: 0.5, mb: 0.5 }}>
                    {format(dayData.date, "EEEE, MMM dd, yyyy")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#93c5fd", display: "block", fontWeight: 700 }}>
                    Main Calls: <span style={{ color: "#fff" }}>{dayData.mainCount}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#fdba74", display: "block", fontWeight: 700 }}>
                    Follow-Ups: <span style={{ color: "#fff" }}>{dayData.followUpCount}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#c084fc", display: "block", fontWeight: 700 }}>
                    Forwarded: <span style={{ color: "#fff" }}>{dayData.forwardedCount}</span>
                  </Typography>
                  <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.2)" }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: "#81c784" }}>
                    Total: {dayData.count} calls ({formatDuration(dayData.totalSecs)})
                  </Typography>
                </Box>
              );

              return (
                <Box
                  key={index}
                  onClick={() => setSelectedDay(dayData.date)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    width: BAR_WIDTH,
                    flexShrink: 0,
                    height: "100%",
                    px: "1.5px",
                    cursor: "pointer",
                  }}
                >
                  <Tooltip title={tooltipTitle} arrow placement="top">
                    <Box
                      sx={{
                        width: "100%",
                        height: `${Math.max(barHeight, 6)}px`,
                        background: barGradient,
                        borderRadius: dayData.count > 0 ? "6px 6px 0 0" : "2px",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        zIndex: isSelected ? 2 : 1,
                        boxShadow: isSelected ? "0 8px 20px rgba(15, 23, 42, 0.45)" : dayData.count > 0 ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        "&:hover": {
                          transform: "scaleY(1.05)",
                          transformOrigin: "bottom",
                          filter: "brightness(1.15)",
                        },
                      }}
                    />
                  </Tooltip>

                  <Box sx={{ height: 52, mt: 1.5, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isSelected ? "#0f172a" : "#94a3b8",
                        fontWeight: isSelected ? 950 : 800,
                        fontSize: "0.82rem",
                      }}
                    >
                      {format(dayData.date, "d")}
                    </Typography>

                    {isFirst && (
                      <Box
                        sx={{
                          mt: 0.3,
                          px: 0.8,
                          py: 0.2,
                          borderRadius: "6px",
                          bgcolor: "#0f172a",
                          color: "#fff",
                          fontSize: "0.6rem",
                          fontWeight: 950,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {format(dayData.date, "MMM")}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* INTEGRATED SIDEBAR SECTION */}
        {selectedDayData && (
          <Box sx={{ width: 480, bgcolor: "#fff", display: "flex", flexDirection: "column", borderLeft: "2px solid #f1f5f9", transition: "all 0.4s ease" }}>
            <Box sx={{ p: 3, borderBottom: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f8fafc" }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 950, color: "#1e293b", textTransform: "uppercase", letterSpacing: 1.5, fontSize: "0.72rem" }}>
                  Selected Day Timeline ({categoryFilter.toUpperCase()})
                </Typography>
                <Typography variant="body2" sx={{ color: "#2563eb", fontWeight: 950, mt: 0.3, fontSize: "0.98rem" }}>
                  {format(selectedDayData.date, "EEEE, MMMM dd, yyyy")}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedDay(null)} sx={{ border: "1.5px solid #e2e8f0", p: 0.8, borderRadius: 2 }}>
                <CloseIcon sx={{ fontSize: 18, color: "#64748b" }} />
              </IconButton>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                p: 2.5,
                bgcolor: "#fafcfe",
                "& .react-virtuoso-list": {
                  pr: 0.5,
                },
              }}
            >
              {selectedDayData.items.length > 0 ? (
                <Virtuoso
                  data={selectedDayData.items}
                  itemContent={(index, item) => (
                    <CallItem
                      key={index}
                      item={item}
                      isLast={index === selectedDayData.items.length - 1}
                    />
                  )}
                  style={{ height: "510px" }}
                />
              ) : (
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 950, color: "#94a3b8", letterSpacing: 2 }}>
                    NO CALLS FOUND FOR THIS CATEGORY
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 2.5, bgcolor: "#fff", borderTop: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 950, color: "#64748b", fontSize: "0.78rem" }}>
                {selectedDayData.count} LOGS ({formatDuration(selectedDayData.totalSecs)})
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 950, color: "#2563eb", cursor: "pointer", "&:hover": { textDecoration: "underline" }, textTransform: "uppercase", letterSpacing: 1 }}
                onClick={() => setSelectedDay(null)}
              >
                Close Sidebar
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default TimelineChartModal;