import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Typography, Popover, alpha, Grid, IconButton, CircularProgress, TextField, Chip } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/CloseRounded";
import { useCallLog } from "../../context/UseCallLog";
import { PhoneCall } from "lucide-react";
import { PremiumTooltip } from "../_ui/CustomUI";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import RunningStatusDots from "../_ui/RunningCall";
import { isForwardedCall, parseFollowUpList } from "../../utils/callLogUtils";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

export const TimeConverter = (date) => {
  try {
    if (!date) return "—";
    const d = dayjs(date);
    if (!d.isValid()) return "Invalid date";
    return d.format("D MMM, YYYY, h:mm A");
  } catch {
    return "—";
  }
};

export const TimeAgo = (date) => {
  try {
    if (!date) return "—";
    const d = dayjs(date);
    if (!d.isValid()) return "Invalid date";
    return d.fromNow();
  } catch {
    return "—";
  }
};

export const HumanDuration = (start, end) => {
  if (!start || !end) return "—";

  const s = dayjs(start);
  const e = dayjs(end);
  if (!s.isValid() || !e.isValid()) return "Invalid duration";

  const diff = dayjs.duration(e.diff(s));
  const days = diff.days();
  const hours = diff.hours();
  const minutes = diff.minutes();
  const seconds = diff.seconds();

  let formatted = [];
  if (days) formatted.push(`${days}d`);
  if (hours) formatted.push(`${hours}h`);
  if (minutes) formatted.push(`${minutes}m`);
  if (!days && !hours && seconds) formatted.push(`${seconds}s`);

  return formatted.join(" ") || "0s";
};

const parseDurationHHMMSS = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  if (parts.length === 3) {
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
  }
  return 0;
};

const formatSecondsToHHMMSS = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const parseDuration = (text) => {
  if (!text || typeof text !== "string") return dayjs.duration(0);
  const input = text.toLowerCase().trim();
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const hMatch = input.match(/(\d+)\s*(h|hr|hour|hours)/);
  if (hMatch) hours = parseInt(hMatch[1], 10);

  const mMatch = input.match(/(\d+)\s*(m|min|minute|minutes)/);
  if (mMatch) minutes = parseInt(mMatch[1], 10);

  const sMatch = input.match(/(\d+)\s*(s|sec|second|seconds)/);
  if (sMatch) seconds = parseInt(sMatch[1], 10);

  const compactMatch = input.match(/^(\d+)(h)?(\d+)?(m)?(\d+)?(s)?$/);
  if (!hMatch && !mMatch && !sMatch && compactMatch) {
    if (compactMatch[2]) hours = parseInt(compactMatch[1], 10);
    if (compactMatch[4]) minutes = parseInt(compactMatch[3] || 0, 10);
    if (compactMatch[6]) seconds = parseInt(compactMatch[5] || 0, 10);
    if (!compactMatch[2] && !compactMatch[4] && !compactMatch[6]) {
      minutes = parseInt(compactMatch[1], 10);
    }
  }

  seconds += minutes * 60 + hours * 3600;
  return dayjs.duration(seconds, "seconds");
};

const DurationInput = ({ onChange, value }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    try {
      const dur = parseDuration(value);
      if (dur.asMilliseconds() === 0 && value.trim() !== "" && value.trim() !== "0") {
        setError("Invalid duration format");
        onChange(null);
      } else {
        setError("");
        onChange(dur);
      }
    } catch {
      setError("Invalid format");
      onChange(null);
    }
  };

  return (
    <TextField
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          bgcolor: "#f8fafc",
          fontSize: "0.875rem",
          fontWeight: 500,
          border: `1.5px solid ${alpha("#e2e8f0", 0.8)}`,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: "#ffffff",
            borderColor: alpha("#6366f1", 0.4),
          },
          "&.Mui-focused": {
            bgcolor: "#ffffff",
            borderColor: "#6366f1",
            boxShadow: `0 0 0 3px ${alpha("#6366f1", 0.1)}`,
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
      }}
      size="small"
      value={inputValue}
      onChange={handleChange}
      placeholder="e.g. 1h 20m, 45m, 30s"
      error={!!error}
      helperText={error || "Type duration to auto-calculate end time"}
    />
  );
};

const CallDurationPopover = ({ value, onEditCall }) => {
  const { EditCallDuration } = useCallLog();
  const [anchorEl, setAnchorEl] = useState(null);
  const [callStart, setCallStart] = useState(null);
  const [callEnd, setCallEnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const open = Boolean(anchorEl);
  const [durationInput, setDurationInput] = useState("");
  const [manualEdit, setManualEdit] = useState(false);

  useEffect(() => {
    const start = value?.row?.callStart ? dayjs(value.row.callStart, "YYYY-MM-DD HH:mm:ss") : null;
    const end = value?.row?.callClosed ? dayjs(value.row.callClosed, "YYYY-MM-DD HH:mm:ss") : null;

    setCallStart(start);
    setCallEnd(end);

    // Set initial duration input
    if (start && end && start.isValid() && end.isValid()) {
      const diff = end.diff(start, "second");
      const dur = dayjs.duration(diff, "seconds");
      const h = dur.hours();
      const m = dur.minutes();
      const s = dur.seconds();

      let formatted = [];
      if (h > 0) formatted.push(`${h}h`);
      if (m > 0) formatted.push(`${m}m`);
      if (s > 0 && h === 0) formatted.push(`${s}s`);

      setDurationInput(formatted.join(" ") || "0s");
    }
  }, [value?.row?.callStart, value?.row?.callClosed]);

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(buttonRef.current);
    setManualEdit(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setLoading(false);
    setManualEdit(false);
  };

  // Handle duration input change - auto calculate end time
  const handleDurationChange = (duration) => {
    if (duration && callStart && callStart.isValid()) {
      const newEndTime = callStart.add(duration.asSeconds(), "seconds");
      setCallEnd(newEndTime);
      setManualEdit(false);
    }
  };

  // Handle manual start time change
  const handleStartTimeChange = (newValue) => {
    setCallStart(newValue);

    // If duration input exists, recalculate end time
    if (durationInput && newValue && newValue.isValid()) {
      const dur = parseDuration(durationInput);
      if (dur.asMilliseconds() > 0) {
        const newEndTime = newValue.add(dur.asSeconds(), "seconds");
        setCallEnd(newEndTime);
        setManualEdit(false);
      }
    } else if (manualEdit && callEnd) {
      // Keep existing end time if manually edited
      setCallEnd(callEnd);
    }
  };

  // Handle manual end time change
  const handleEndTimeChange = (newValue) => {
    setCallEnd(newValue);
    setManualEdit(true);

    // Update duration input based on new end time
    if (callStart && newValue && callStart.isValid() && newValue.isValid()) {
      const diff = newValue.diff(callStart, "second");
      if (diff > 0) {
        const dur = dayjs.duration(diff, "seconds");
        const h = dur.hours();
        const m = dur.minutes();
        const s = dur.seconds();

        let formatted = [];
        if (h > 0) formatted.push(`${h}h`);
        if (m > 0) formatted.push(`${m}m`);
        if (s > 0 && h === 0) formatted.push(`${s}s`);

        setDurationInput(formatted.join(" ") || "0s");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!callStart || !callEnd || !callStart.isValid() || !callEnd.isValid()) {
        console.error("Invalid start or end time");
        return;
      }

      const diffSeconds = callEnd.diff(callStart, "second");

      if (diffSeconds <= 0) {
        console.error("End time must be after start time");
        return;
      }

      const dur = dayjs.duration(diffSeconds, "seconds");
      const formatted = {
        callStart: callStart.format("YYYY-MM-DD HH:mm:ss"),
        callEnd: callEnd.format("YYYY-MM-DD HH:mm:ss"),
        duration: `${dur.hours().toString().padStart(2, "0")}:${dur.minutes().toString().padStart(2, "0")}:${dur.seconds().toString().padStart(2, "0")}`,
      };

      setLoading(true);
      const data = await EditCallDuration(value?.id, formatted.callStart, formatted.callEnd);

      if (data?.stat === 1 && data?.stat_code === 1000) {
        console.log("✅ Call duration updated successfully:", data);
        handleClose();
      } else {
        console.error("Failed to update call duration:", data);
      }
    } catch (error) {
      console.error("Error updating call duration:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!callStart || !callEnd || !callStart.isValid() || !callEnd.isValid()) {
      return "0 sec";
    }

    const diffSeconds = callEnd.diff(callStart, "second");
    if (diffSeconds <= 0) return "0 sec";

    const dur = dayjs.duration(diffSeconds, "seconds");
    const h = dur.hours();
    const m = dur.minutes();
    const s = dur.seconds();

    if (h > 0 && m > 0 && s > 0) return `${h} hr ${m} min ${s} sec`;
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr`;
    if (m > 0 && s > 0) return `${m} min ${s} sec`;
    if (m > 0) return `${m} min`;
    return `${s} sec`;
  };

  const onEditCallHandler = (e) => {
    e.stopPropagation();
    onEditCall(value?.row?.id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {value?.row?.callStart ? (
          <Grid container spacing={0.5} justifyContent="center" alignItems="center" sx={{ textAlign: "center", width: "100%" }}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  flexWrap: "nowrap",
                }}
              >
                <PremiumTooltip
                  title={(() => {
                    const mainDuration = value?.value || "00:00:00";
                    const followUps = parseFollowUpList(value?.row?.FollowUpList);

                    const mainSec = parseDurationHHMMSS(mainDuration);
                    let totalSeconds = mainSec;

                    const completedCalls = followUps.filter((fu) => {
                      const fuDur = fu.CallDuration || "00:00:00";
                      return fuDur !== "00:00:00";
                    });

                    const completedFollowUps = completedCalls.filter((fu) => !isForwardedCall(fu));
                    const completedForwarded = completedCalls.filter((fu) => isForwardedCall(fu));

                    completedCalls.forEach((fu) => {
                      totalSeconds += parseDurationHHMMSS(fu.CallDuration);
                    });

                    const hasSubCalls = completedCalls.length > 0;

                    return (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 220 }}>
                        {/* Main Call Info */}
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4 }}>
                          <Box component="span" sx={{ fontWeight: 500, color: "#64748b" }}>Call Start: </Box>
                          <Box component="span" sx={{ fontWeight: 700 }}>{TimeConverter(value?.row?.callStart) || "—"}</Box>
                        </Typography>

                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4 }}>
                          <Box component="span" sx={{ fontWeight: 500, color: "#64748b" }}>Call End: </Box>
                          <Box component="span" sx={{ fontWeight: 700 }}>{TimeConverter(value?.row?.callClosed) || "—"}</Box>
                        </Typography>

                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4 }}>
                          <Box component="span" sx={{ fontWeight: 500, color: "#64748b" }}>Call Duration: </Box>
                          <Box component="span" sx={{ fontWeight: 700 }}>{mainDuration || "—"}</Box>
                        </Typography>

                        {/* Standard Follow-up Breakdown */}
                        {completedFollowUps.length > 0 && (
                          <Box sx={{ borderTop: "1px solid #e2e8f0", mt: 0.75, pt: 0.75 }}>
                            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#e65100", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                              ↻ Follow-ups ({completedFollowUps.length})
                            </Typography>
                            {completedFollowUps.map((fu, idx) => (
                              <Box key={fu.Id || idx} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.15 }}>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 500, color: "#475569" }}>
                                  #{fu.Id || idx + 1} {fu.CreatedBy ? `· ${fu.CreatedBy}` : ""}
                                </Typography>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f172a" }}>
                                  {fu.CallDuration}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* Forwarded Call Breakdown */}
                        {completedForwarded.length > 0 && (
                          <Box sx={{ borderTop: "1px solid #e2e8f0", mt: 0.75, pt: 0.75 }}>
                            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                              ↗ Forwarded ({completedForwarded.length})
                            </Typography>
                            {completedForwarded.map((fu, idx) => (
                              <Box key={fu.Id || idx} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.15 }}>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 500, color: "#475569" }}>
                                  #{fu.Id || idx + 1} {fu.CreatedBy ? `· ${fu.CreatedBy}` : ""}{fu.ForwardedEmp ? ` → ${fu.ForwardedEmp}` : ""}
                                </Typography>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f172a" }}>
                                  {fu.CallDuration}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* Total */}
                        {hasSubCalls && (
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 0.5, pt: 0.5, borderTop: "1px solid #e2e8f0" }}>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#16a34a" }}>Total Duration:</Typography>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#16a34a" }}>{formatSecondsToHHMMSS(totalSeconds)}</Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "#334155",
                      letterSpacing: "-0.01em",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {TimeAgo(value?.row?.callStart)}
                  </Typography>
                </PremiumTooltip>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                ref={buttonRef}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  justifyContent:'space-between'
                }}
                onClick={handleClick}
              >
                {(() => {
                  const followUps = parseFollowUpList(value?.row?.FollowUpList);
                  let followUpCount = 0;
                  let forwardedCount = 0;
                  let totalSeconds = parseDurationHHMMSS(value?.value || "00:00:00");

                  followUps.forEach((fu) => {
                    const fuDur = fu.CallDuration || "00:00:00";
                    if (fuDur !== "00:00:00") {
                      if (isForwardedCall(fu)) {
                        forwardedCount++;
                      } else {
                        followUpCount++;
                      }
                      totalSeconds += parseDurationHHMMSS(fuDur);
                    }
                  });

                  const totalSubCalls = followUpCount + forwardedCount;
                  const parts = [];
                  if (followUpCount > 0) parts.push(`${followUpCount} Follow-up${followUpCount > 1 ? "s" : ""}`);
                  if (forwardedCount > 0) parts.push(`${forwardedCount} Forwarded`);
                  const tooltipLabel = totalSubCalls > 0
                    ? `Total: ${formatSecondsToHHMMSS(totalSeconds)} (Main + ${parts.join(" + ")})`
                    : `Call Duration: ${value?.value}`;

                  return (
                    <PremiumTooltip title={tooltipLabel}>
                      <Typography
                        sx={{
                          fontSize: "0.74rem",
                          fontWeight: 600,
                          color: totalSubCalls > 0 ? "#16a34a" : "#1e293b",
                          letterSpacing: "-0.01em",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.3,
                        }}
                      >
                        {totalSubCalls > 0
                          ? formatSecondsToHHMMSS(totalSeconds)
                          : HumanDuration(value?.row?.callStart, value?.row?.callClosed)
                        }
                        {totalSubCalls > 0 && (
                          <Box component="span" sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#e65100", ml: 0.3 }}>
                            +{totalSubCalls}
                          </Box>
                        )}
                      </Typography>
                    </PremiumTooltip>
                  );
                })()}
                                   {!value?.row?.callClosed ? <RunningStatusDots /> : null}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <IconButton
            onClick={(e) => {
              onEditCallHandler(e);
            }}
            color="success"
          >
            <PhoneCall />
          </IconButton>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: "#ffffff",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(20px)",
            width: 470,
            border: `1px solid ${alpha("#e2e8f0", 0.8)}`,
            overflow: "visible",
          },
        }}
        sx={{
          "& .MuiPopover-paper": {
            mt: 1,
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ px: 2, pt: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "1.125rem",
                letterSpacing: "-0.025em",
              }}
            >
              Edit Call Duration
            </Typography>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: "0.875rem",
                    }}
                  >
                    Start Time
                  </Typography>
                  <DateTimePicker
                    value={callStart}
                    onChange={handleStartTimeChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        placeholder: "Select start time",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        border: `1.5px solid ${alpha("#e2e8f0", 0.8)}`,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: "#ffffff",
                          borderColor: alpha("#6366f1", 0.4),
                        },
                        "&.Mui-focused": {
                          bgcolor: "#ffffff",
                          borderColor: "#6366f1",
                          boxShadow: `0 0 0 3px ${alpha("#6366f1", 0.1)}`,
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: "0.875rem",
                    }}
                  >
                    End Time {manualEdit && <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>(Manual)</span>}
                  </Typography>
                  <DateTimePicker
                    value={callEnd}
                    onChange={handleEndTimeChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        placeholder: "Auto-calculated or select manually",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: manualEdit ? "#fef3c7" : "#f8fafc",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        border: `1.5px solid ${alpha(manualEdit ? "#fbbf24" : "#e2e8f0", 0.8)}`,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: "#ffffff",
                          borderColor: alpha("#6366f1", 0.4),
                        },
                        "&.Mui-focused": {
                          bgcolor: "#ffffff",
                          borderColor: "#6366f1",
                          boxShadow: `0 0 0 3px ${alpha("#6366f1", 0.1)}`,
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: "0.875rem",
                    }}
                  >
                    Duration
                  </Typography>
                  <DurationInput
                    onChange={handleDurationChange}
                    value={durationInput}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Box
                  sx={{
                    py: 1,
                    px: 2,
                    borderRadius: 3,
                    bgcolor: alpha("#f1f5f9", 0.7),
                    border: `1px solid ${alpha("#e2e8f0", 0.6)}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        fontSize: "0.84rem",
                        fontWeight: 500,
                      }}
                    >
                      Total Duration
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: "#6366f1",
                        fontSize: "0.95rem",
                      }}
                    >
                      {calculateDuration()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={12} display="flex" alignItems="center" justifyContent={"flex-end"}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading || !callStart || !callEnd || callEnd.diff(callStart, "second") <= 0}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    bgcolor: "#6366f1",
                    color: "#ffffff",
                    px: 3,
                    "&:hover": {
                      bgcolor: "#4f46e5",
                    },
                    "&:disabled": {
                      bgcolor: "#e2e8f0",
                      color: "#94a3b8",
                    },
                    boxShadow: "none",
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={20}
                      sx={{
                        color: "#fff",
                      }}
                    />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </Popover>
    </Box>
  );
};

export default CallDurationPopover;

//  <Box
//               sx={{
//                 display: "flex",
//                 gap: 0.5,
//                 flexWrap: "nowrap",
//               }}
//             >
//               <PremiumTooltip title={`Call Start: ${TimeConverter(value?.row?.callStart)}`}>
//                 {/* <Typography
//                   sx={{
//                     fontSize: "0.78rem",
//                     fontWeight: 500,
//                     color: "#334155",
//                     letterSpacing: "-0.01em",
//                   }}
//                 >
//                   {TimeConverter(value?.row?.callStart)}
//                 </Typography> */}
//               </PremiumTooltip>
//               {/* <Typography
//                 sx={{
//                   fontSize: "0.78rem",
//                   fontWeight: 500,
//                   color: "#64748b",
//                   letterSpacing: "-0.01em",
//                 }}
//               >
//                 —
//               </Typography> */}
//               <PremiumTooltip title={`Call End: ${TimeConverter(value?.row?.callClosed)}`}>
//                 <Typography
//                   sx={{
//                     fontSize: "0.78rem",
//                     fontWeight: 500,
//                     color: "#334155",
//                     letterSpacing: "-0.01em",
//                   }}
//                 >
//                   {/* {TimeConverter(value?.row?.callClosed)} */}
//                       {TimeAgo(value?.row?.callStart)}

//                 </Typography>
//               </PremiumTooltip>
//             </Box>
