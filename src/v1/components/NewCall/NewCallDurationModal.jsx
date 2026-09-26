'use client';
import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Button,
  Typography,
  alpha,
  Grid,
  IconButton,
  CircularProgress,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/CloseRounded";
import { useCallLog } from "../../context/UseCallLog";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "sonner";
import {
  durationModal$,
  closeDurationModal,
  useNewCallSubject,
} from "./rxjs/newCallEvents";
import { callStreamService } from "./services/callStreamService";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

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

export default function NewCallDurationModal() {
  const modalState = useNewCallSubject(durationModal$);
  const { EditCallDuration, triggerRefresh } = useCallLog();

  const [callStart, setCallStart] = useState(null);
  const [callEnd, setCallEnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [durationInput, setDurationInput] = useState("");
  const [manualEdit, setManualEdit] = useState(false);

  const targetCall = modalState.call;

  useEffect(() => {
    if (modalState.open && targetCall) {
      const raw = targetCall.rawRecord || targetCall;
      const startStr = raw.callStart || raw.CallStart;
      const endStr = raw.callClosed || raw.CallClosed;

      const start = startStr && startStr !== "1900-01-01T00:00:00" ? dayjs(startStr) : null;
      const end = endStr && endStr !== "1900-01-01T00:00:00" ? dayjs(endStr) : null;

      setCallStart(start);
      setCallEnd(end);
      setManualEdit(false);

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
      } else {
        setDurationInput("");
      }
    } else {
      setManualEdit(false);
      setLoading(false);
    }
  }, [modalState.open, targetCall]);

  const handleClose = () => {
    closeDurationModal();
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

  const handleSave = async () => {
    try {
      if (!callStart || !callEnd || !callStart.isValid() || !callEnd.isValid()) {
        toast.error("Please enter valid start and end dates");
        return;
      }

      const diffSeconds = callEnd.diff(callStart, "second");
      if (diffSeconds <= 0) {
        toast.error("End time must be after start time");
        return;
      }

      const callId = targetCall?.sr || targetCall?.id || targetCall?.CallLogid;
      if (!callId) {
        toast.error("No call ID found to update");
        return;
      }

      const dur = dayjs.duration(diffSeconds, "seconds");
      const formatted = {
        callStart: callStart.format("YYYY-MM-DD HH:mm:ss"),
        callEnd: callEnd.format("YYYY-MM-DD HH:mm:ss"),
        duration: `${dur.hours().toString().padStart(2, "0")}:${dur.minutes().toString().padStart(2, "0")}:${dur.seconds().toString().padStart(2, "0")}`,
      };

      setLoading(true);
      const data = await EditCallDuration(callId, formatted.callStart, formatted.callEnd);

      if (data?.stat === 1 && data?.stat_code === 1000) {
        callStreamService.patchPrimaryCall(callId, {
          callStart: formatted.callStart,
          callClosed: formatted.callEnd,
          CallDuration: formatted.duration,
        });
        toast.success("Call duration updated successfully");
        if (triggerRefresh) triggerRefresh();
        handleClose();
      } else {
        toast.error(data?.message || "Failed to update call duration");
      }
    } catch (error) {
      console.error("Error updating call duration:", error);
      toast.error("Error updating call duration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={modalState.open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          width: 470,
          maxWidth: "95vw",
          border: `1px solid ${alpha("#e2e8f0", 0.8)}`,
          overflow: "visible",
          m: 1,
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
            <Grid item xs={12} display="flex" alignItems="center" justifyContent="flex-end">
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
    </Dialog>
  );
}
