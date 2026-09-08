import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Popover,
} from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CallIcon from "@mui/icons-material/Call";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ForwardToInboxRoundedIcon from "@mui/icons-material/ForwardToInboxRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { PremiumTooltip } from "../_ui/CustomUI";
import { useCallLog } from "../../context/UseCallLog";
import { useSubject, followUpMode$, toggleFollowUpMode } from "../../rxjs/layoutStore";
import { followUpEdit$ } from "../../rxjs/tableUiStore";
import { separateFollowUpsAndForwarded } from "../../utils/callLogUtils";
import { HeaderHeight } from "../_ui/HeaderWrapper";

const stringToColor = (string) => {
  if (!string) return "#1A73E8";
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const FollowUpEditPopover = ({
  STATUS_LIST,
  forwardOption,
  filterForwardOptions,
  editFollowUpCall,
  showNotification,
  CurrentCall,
}) => {
  const editState = useSubject(followUpEdit$);
  const { open, type, fu, anchorEl } = editState;

  // Local form states
  const [descr, setDescr] = useState("");
  const [status, setStatus] = useState(null);
  const [forward, setForward] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sync inputs when popover opens/changes
  useEffect(() => {
    if (open && fu) {
      if (type === "description") {
        setDescr(fu.Description || fu.Descr || fu.description || "");
      } else if (type === "status") {
        const currentStatusId = fu.InternalStatusId || fu.StatusId;
        const currentStatus =
          STATUS_LIST?.find(
            (s) => String(s.value) === String(currentStatusId),
          ) || null;
        setStatus(currentStatus);
      } else if (type === "forward") {
        const currentEmpId = fu.EmpId;
        const currentEmp =
          forwardOption?.find(
            (f) => String(f.id?.split(",")?.[1]) === String(currentEmpId),
          ) || null;
        setForward(currentEmp);
      }
    } else {
      setDescr("");
      setStatus(null);
      setForward(null);
      setSaving(false);
    }
  }, [open, type, fu, STATUS_LIST, forwardOption]);

  const handleClose = () => {
    if (saving) return;
    followUpEdit$.next({ open: false, type: null, fu: null, anchorEl: null });
  };

  const handleSave = async () => {
    if (!fu || !CurrentCall?.sr) return;
    setSaving(true);
    try {
      let existingEmpId = fu.EmpId;
      if (!existingEmpId && fu.ForwardedEmp) {
        const found = forwardOption?.find(
          (f) =>
            f.person === fu.ForwardedEmp || f.person === fu.AssignedEmpName,
        );
        if (found) {
          existingEmpId = found.id?.split(",")?.[1];
        }
      }
      const existingStatusId = fu.InternalStatusId || fu.StatusId || 0;
      const existingDescr = fu.Description || fu.Descr || "";

      const payload = {
        callLogId: CurrentCall.sr,
        followUpCallId: fu.Id,
        empId: existingEmpId,
        statusId: existingStatusId,
        descr: existingDescr,
      };

      if (type === "description") {
        payload.descr = descr;
      } else if (type === "status") {
        if (!status) {
          showNotification?.("Please select a status", "warning");
          setSaving(false);
          return;
        }
        payload.statusId = status.value;
      } else if (type === "forward") {
        if (!forward) {
          showNotification?.("Please select an employee", "warning");
          setSaving(false);
          return;
        }
        const empId = forward.id?.split(",")?.[1];
        if (empId) {
          payload.empId = parseInt(empId, 10);
        }
      }

      const result = await editFollowUpCall(payload);
      if (result?.success) {
        showNotification?.("Follow-up updated successfully", "success");
        handleClose();
      } else {
        showNotification?.(
          result?.error?.message || "Failed to update",
          "error",
        );
      }
    } catch (err) {
      console.error("Error saving follow-up edit:", err);
      showNotification?.("Error saving changes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover
      open={open && anchorEl !== null}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            width: 320,
            borderRadius: 3,
            boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
            border: "1px solid #E0E0E0",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>
          {type === "description" && `Edit Description — #${fu?.Id}`}
          {type === "status" && `Change Status — #${fu?.Id}`}
          {type === "forward" && `Forward / Transfer — #${fu?.Id}`}
        </Typography>

        {type === "description" && (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            placeholder="Description"
            value={descr}
            onChange={(e) => setDescr(e.target.value)}
            variant="outlined"
            size="small"
          />
        )}

        {type === "status" && (
          <Autocomplete
            fullWidth
            options={STATUS_LIST || []}
            getOptionLabel={(option) => option?.label || ""}
            value={status}
            onChange={(_, val) => setStatus(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Internal Status"
                size="small"
                autoFocus
              />
            )}
            size="small"
          />
        )}

        {type === "forward" && (
          <Autocomplete
            fullWidth
            options={forwardOption || []}
            getOptionLabel={(option) => option?.person || ""}
            groupBy={(option) => option?.designation || "Other"}
            value={forward}
            onChange={(_, val) => setForward(val)}
            filterOptions={filterForwardOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Forward To (Employee)"
                size="small"
                autoFocus
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option?.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: 11,
                      bgcolor: stringToColor(option?.person),
                    }}
                  >
                    {option?.person?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {option?.person}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "#80868B" }}>
                      {option?.designation}
                    </Typography>
                  </Box>
                </Box>
              </li>
            )}
            size="small"
          />
        )}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 0.5 }}
        >
          <Button
            onClick={handleClose}
            size="small"
            sx={{ textTransform: "none", color: "#5F6368" }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="small"
            disabled={saving}
            sx={{
              textTransform: "none",
              bgcolor: "#1A73E8",
              ":hover": { bgcolor: "#1557B0" },
              borderRadius: 1.5,
              px: 2,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

const FollowUpPanel = ({
  CurrentCall,
  activeFollowUp,
  setActiveFollowUp,
  onAddFollowUp,
  onStartFollowUp,
  isPaused,
  recordingTime,
  RecordMode,
  showNotification,
}) => {
  const isOpen = useSubject(followUpMode$);
  const onClose = useCallback(() => {
    toggleFollowUpMode(false);
  }, []);

  const { STATUS_LIST, forwardOption, editFollowUpCall } = useCallLog();

  // === MENU STATE ===
  const [menuAnchor, setMenuAnchor] = useState(null); // { anchorEl, fu }

  // === ADD FOLLOW-UP WITH MANDATORY DESCRIPTION ===
  const [addFuDialog, setAddFuDialog] = useState(false);
  const [addFuDescr, setAddFuDescr] = useState("");
  const [addFuDescrError, setAddFuDescrError] = useState(false);
  const [addFuSaving, setAddFuSaving] = useState(false);

  const handleOpenAddDialog = () => {
    setAddFuDescr("");
    setAddFuDescrError(false);
    setAddFuDialog(true);
  };

  const handleConfirmAddFollowUp = async () => {
    if (!addFuDescr.trim()) {
      setAddFuDescrError(true);
      return;
    }
    setAddFuSaving(true);
    try {
      const result = await onAddFollowUp(addFuDescr.trim());
      setAddFuDialog(false);
      setAddFuDescr("");
      setAddFuDescrError(false);
    } catch (e) {
      console.error("Error adding follow-up:", e);
    } finally {
      setAddFuSaving(false);
    }
  };

  const { followUpList, standardFollowUps, forwardedFollowUps } = useMemo(() => {
    return separateFollowUpsAndForwarded(CurrentCall?.FollowUpList);
  }, [CurrentCall?.FollowUpList]);

  // View mode tab state: "split" (50/50 split), "followup" (standard only), "forwarded" (forwarded only)
  const [viewTab, setViewTab] = useState("split");

  const isCallClosed = !!CurrentCall?.callClosed;
  const isTimerRunning = recordingTime > 0;
  const isCallActive = isTimerRunning;

  // Auto-select first incomplete follow-up when panel opens
  useEffect(() => {
    if (isOpen && followUpList.length > 0 && !activeFollowUp) {
      const firstIncomplete = followUpList.find(
        (fu) =>
          !fu.CallClosed &&
          (!fu.CallDuration || fu.CallDuration === "00:00:00") &&
          !fu.CallStart,
      );
      if (firstIncomplete) {
        setActiveFollowUp({
          followUpCallId: firstIncomplete.Id,
          callLogId: CurrentCall?.sr,
        });
      }
    }
  }, [isOpen, followUpList.length]);

  const handleSelectFollowUp = (fu) => {
    if (isTimerRunning) return;
    const isValidDate = (d) =>
      d && typeof d === "string" && !d.startsWith("1900-01-01");
    const isCompleted =
      isValidDate(fu.CallClosed) ||
      (fu.CallDuration && fu.CallDuration !== "00:00:00") ||
      isValidDate(fu.CallStart);
    if (isCompleted) return;

    if (activeFollowUp?.followUpCallId === fu.Id) {
      setActiveFollowUp(null);
    } else {
      setActiveFollowUp({
        followUpCallId: fu.Id,
        callLogId: CurrentCall.sr,
      });
    }
  };

  const handleStartFromList = (e, fu) => {
    e.stopPropagation();
    if (isTimerRunning) return;
    const isValidDate = (d) =>
      d && typeof d === "string" && !d.startsWith("1900-01-01");
    const isCompleted =
      isValidDate(fu.CallClosed) ||
      (fu.CallDuration && fu.CallDuration !== "00:00:00") ||
      isValidDate(fu.CallStart);
    if (isCompleted) return;

    setActiveFollowUp({
      followUpCallId: fu.Id,
      callLogId: CurrentCall?.sr,
    });

    onStartFollowUp(fu.Id, CurrentCall?.sr);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // === MENU HANDLERS ===
  const handleOpenMenu = useCallback((e, fu) => {
    e.stopPropagation();
    setMenuAnchor({
      anchorEl: e.currentTarget,
      fu,
    });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleMenuAction = useCallback(
    (type) => {
      const fu = menuAnchor?.fu;
      if (!fu) return;

      followUpEdit$.next({
        open: true,
        type,
        fu,
        anchorEl: menuAnchor.anchorEl,
      });

      handleCloseMenu();
    },
    [menuAnchor, handleCloseMenu],
  );

  // Filter forward options with input
  const filterForwardOptions = (options, { inputValue }) => {
    const input = inputValue?.toLowerCase() || "";
    return options.filter(
      (opt) =>
        opt.person?.toLowerCase().includes(input) ||
        opt.designation?.toLowerCase().includes(input),
    );
  };

  // Render individual follow-up item card with full differentiation
  const renderFollowUpCard = (fu) => {
    const isActive = activeFollowUp?.followUpCallId === fu.Id;
    const isRunningThis = isActive && isTimerRunning;

    const isValidDate = (d) =>
      d && typeof d === "string" && !d.startsWith("1900-01-01");

    const isCompleted =
      isValidDate(fu.CallClosed) ||
      (fu.CallDuration && fu.CallDuration !== "00:00:00") ||
      (isValidDate(fu.CallStart) && !isRunningThis);
    const isSelectable = !isCompleted && !isTimerRunning;

    const creatorName = fu.CreatedBy || "Unknown";
    const initial = creatorName.charAt(0).toUpperCase();
    const isForwarded = fu.IsForwardFollowup === 1;

    const callStartStr = isValidDate(fu?.CallStart)
      ? new Date(fu?.CallStart).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "-";
    const callEndStr = isValidDate(fu?.CallClosed)
      ? new Date(fu?.CallClosed).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "-";
    const durationStr = fu?.CallDuration || "00:00:00";

    return (
      <PremiumTooltip
        key={fu.Id}
        title={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4 }}>
              <Box component="span" sx={{ fontWeight: 500 }}>Call Start:</Box>{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "gray.500" }}>{callStartStr || "—"}</Box>
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4 }}>
              <Box component="span" sx={{ fontWeight: 500 }}>Call End:</Box>{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "gray.500" }}>{callEndStr || "—"}</Box>
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4 }}>
              <Box component="span" sx={{ fontWeight: 500 }}>Call Duration:</Box>{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "gray.500" }}>{durationStr || "—"}</Box>
            </Typography>
            {(fu.Description || fu.Descr) && (
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4, mt: 0.5 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>Description:</Box>{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "gray.500", whiteSpace: "pre-wrap" }}>
                  {fu.Description || fu.Descr}
                </Box>
              </Typography>
            )}
            {isForwarded && fu.Reason && (
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4, mt: 0.25 }}>
                <Box component="span" sx={{ fontWeight: 500 }}>Reason:</Box>{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "gray.500" }}>{fu.Reason}</Box>
              </Typography>
            )}
          </Box>
        }
        placement="left"
        arrow
      >
        <Box
          onClick={() => handleSelectFollowUp(fu)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            px: 1.2,
            py: 1,
            mx: 0.5,
            mb: 0.6,
            borderRadius: 1.5,
            cursor: isSelectable ? "pointer" : "default",
            borderLeft: isForwarded
              ? "4px solid #8b5cf6"
              : isActive
              ? "4px solid #1A73E8"
              : "4px solid transparent",
            borderTop: "1px solid",
            borderRight: "1px solid",
            borderBottom: "1px solid",
            borderColor: isRunningThis
              ? "#1A73E8"
              : isForwarded
              ? "rgba(139, 92, 246, 0.25)"
              : isActive
              ? "#1A73E8"
              : "#E2E8F0",
            bgcolor: isRunningThis
              ? "#E8F0FE"
              : isForwarded
              ? isActive
                ? "rgba(139, 92, 246, 0.14)"
                : "rgba(139, 92, 246, 0.04)"
              : isActive
              ? "#F0F6FF"
              : "#FFFFFF",
            transition: "all 0.15s ease",
            "&:hover": isSelectable
              ? {
                  bgcolor: isForwarded
                    ? "rgba(139, 92, 246, 0.08)"
                    : "#F8FAFC",
                  borderColor: isForwarded ? "#8b5cf6" : "#CBD5E1",
                }
              : {},
          }}
        >
          {/* Avatar with Status Badge */}
          <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                isRunningThis ? (
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: 14,
                      color: isPaused ? "#F9AB00" : "#1A73E8",
                      bgcolor: "white",
                      borderRadius: "50%",
                      animation: !isPaused ? "pulse 1.5s infinite" : "none",
                      "@keyframes pulse": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.3 },
                        "100%": { opacity: 1 },
                      },
                    }}
                  />
                ) : isCompleted ? (
                  <CheckCircleRoundedIcon
                    sx={{
                      fontSize: 16,
                      color: "#34A853",
                      bgcolor: "white",
                      borderRadius: "50%",
                    }}
                  />
                ) : isActive ? (
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: 14,
                      color: "#1A73E8",
                      bgcolor: "white",
                      borderRadius: "50%",
                    }}
                  />
                ) : null
              }
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: stringToColor(creatorName),
                  fontSize: 15,
                  opacity: isCompleted ? 0.8 : 1,
                }}
              >
                {initial}
              </Avatar>
            </Badge>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* First line: Creator -> Forwarded */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                flexWrap: "wrap",
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 600,
                  color: isCompleted ? "#5F6368" : "#1E293B",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {creatorName}
              </Typography>

              {(fu.ForwardedEmp ||
                fu.EmpId ||
                fu.AssignedEmpName ||
                fu.EmpName) &&
                (() => {
                  const fName =
                    fu.ForwardedEmp ||
                    fu.AssignedEmpName ||
                    fu.EmpName ||
                    forwardOption?.find(
                      (f) => f.id?.split(",")[1] === fu.EmpId,
                    )?.person ||
                    "Forwarded";
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                      <ArrowForwardIosRoundedIcon
                        sx={{ fontSize: 9, color: "#94A3B8" }}
                      />
                      <Tooltip
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 22,
                                height: 22,
                                fontSize: 10,
                                bgcolor: stringToColor(fName),
                              }}
                            >
                              {fName?.charAt(0)?.toUpperCase() || "?"}
                            </Avatar>
                            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                              {fName}
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="right"
                      >
                        <Chip
                          size="small"
                          avatar={
                            <Avatar sx={{ bgcolor: stringToColor(fName) }}>
                              {fName?.charAt(0)?.toUpperCase() || "?"}
                            </Avatar>
                          }
                          label={fName}
                          color={isForwarded ? "secondary" : "default"}
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: "9px",
                            fontWeight: 600,
                            maxWidth: 120,
                            "& .MuiChip-avatar": {
                              width: 12,
                              height: 12,
                              fontSize: "7px !important",
                            },
                          }}
                        />
                      </Tooltip>
                    </Box>
                  );
                })()}
            </Box>

            {/* Second line: Follow up time + Status + Reason */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                mt: 0.2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                {isForwarded ? (
                  <ForwardToInboxRoundedIcon sx={{ fontSize: 13, color: "#8b5cf6" }} />
                ) : (
                  <CallMadeRoundedIcon
                    sx={{
                      fontSize: 13,
                      color: isCompleted ? "#94A3B8" : "#1A73E8",
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#64748B",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  #{fu.Id} •{" "}
                  {isValidDate(fu.CallStart)
                    ? formatDate(fu.CallStart)
                    : "Pending"}
                </Typography>
              </Box>

              {(fu.InternalStatusId ||
                fu.InternalStatus ||
                fu.StatusId ||
                fu.StatusName) && (
                <Chip
                  size="small"
                  label={
                    fu.InternalStatus ||
                    fu.StatusName ||
                    STATUS_LIST?.find(
                      (s) => s.value === (fu.InternalStatusId || fu.StatusId),
                    )?.label ||
                    "Status Updated"
                  }
                  color="primary"
                  variant="outlined"
                  sx={{
                    height: 16,
                    fontSize: "8.5px",
                    fontWeight: 600,
                    maxWidth: 95,
                  }}
                />
              )}

              {isForwarded && fu.Reason && (
                <Chip
                  size="small"
                  label={fu.Reason}
                  sx={{
                    height: 16,
                    fontSize: "8.5px",
                    fontWeight: 600,
                    maxWidth: 110,
                    bgcolor: "#f3e8ff",
                    color: "#6b21a8",
                    border: "1px solid #e9d5ff",
                  }}
                />
              )}
            </Box>

            {/* Third line: Description */}
            {(fu.Description || fu.Descr) && (
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: "#64748B",
                  mt: 0.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontStyle: "italic",
                  maxWidth: "100%",
                }}
              >
                {fu.Description || fu.Descr}
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              flexShrink: 0,
            }}
          >
            {!isCompleted && !isTimerRunning && (
              <Tooltip title="Start this follow-up" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => handleStartFromList(e, fu)}
                  sx={{
                    width: 28,
                    height: 28,
                    color: "#1A73E8",
                    ":hover": { bgcolor: "#E8F0FE" },
                  }}
                >
                  <CallIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Follow-up options" arrow>
              <IconButton
                size="small"
                onClick={(e) => handleOpenMenu(e, fu)}
                sx={{
                  width: 28,
                  height: 28,
                  color: "#64748B",
                  ":hover": { bgcolor: "#F1F5F9" },
                }}
              >
                <MoreVertIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </PremiumTooltip>
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
          p: isOpen ? 1.5 : 0,
          borderRadius: 2,
          border: "1px solid #E0E0E0",
          overflow: "hidden",
          flex: isOpen ? 0.26 : 0,
          opacity: isOpen ? 1 : 0,
          minHeight: isOpen ? 290 : 0,
          transition: "all 0.2s ease-in-out",
        }}
      >
        {/* PANEL HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
            px: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <ReplayRoundedIcon sx={{ color: "#1A73E8", fontSize: 20 }} />
            <Typography
              sx={{ fontWeight: 700, color: "#202124", fontSize: 14 }}
            >
              Follow-Ups
            </Typography>
            {followUpList.length > 0 && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#5F6368",
                  fontWeight: 600,
                  bgcolor: "#F1F3F4",
                  px: 0.8,
                  py: 0.1,
                  borderRadius: 1,
                }}
              >
                {followUpList.length}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            {isCallClosed && !isTimerRunning && (
              <Tooltip title="Add Follow-Up Call">
                <IconButton
                  size="small"
                  onClick={handleOpenAddDialog}
                  sx={{
                    bgcolor: "#1A73E8",
                    color: "white",
                    width: 26,
                    height: 26,
                    ":hover": { bgcolor: "#1557B0" },
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              size="small"
              onClick={onClose}
              disabled={isCallActive}
              sx={{
                opacity: isCallActive ? 0.3 : 1,
                cursor: isCallActive ? "not-allowed" : "pointer",
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>

        {/* VIEW FILTER TABS */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            mb: 1,
            p: 0.4,
            bgcolor: "#F1F5F9",
            borderRadius: 1.5,
          }}
        >
          <Button
            size="small"
            onClick={() => setViewTab("split")}
            sx={{
              flex: 1,
              py: 0.3,
              minWidth: 0,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1,
              bgcolor: viewTab === "split" ? "white" : "transparent",
              color: viewTab === "split" ? "#1E293B" : "#64748B",
              boxShadow: viewTab === "split" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              ":hover": { bgcolor: viewTab === "split" ? "white" : "rgba(255,255,255,0.5)" },
            }}
          >
            Split (All)
          </Button>
          <Button
            size="small"
            onClick={() => setViewTab("followup")}
            sx={{
              flex: 1,
              py: 0.3,
              minWidth: 0,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1,
              bgcolor: viewTab === "followup" ? "white" : "transparent",
              color: viewTab === "followup" ? "#1A73E8" : "#64748B",
              boxShadow: viewTab === "followup" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              ":hover": { bgcolor: viewTab === "followup" ? "white" : "rgba(255,255,255,0.5)" },
            }}
          >
            Follow-Up ({standardFollowUps.length})
          </Button>
          <Button
            size="small"
            onClick={() => setViewTab("forwarded")}
            sx={{
              flex: 1,
              py: 0.3,
              minWidth: 0,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 1,
              bgcolor: viewTab === "forwarded" ? "white" : "transparent",
              color: viewTab === "forwarded" ? "#8B5CF6" : "#64748B",
              boxShadow: viewTab === "forwarded" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              ":hover": { bgcolor: viewTab === "forwarded" ? "white" : "rgba(255,255,255,0.5)" },
            }}
          >
            Forwarded ({forwardedFollowUps.length})
          </Button>
        </Box>

        {/* TWO SPLIT PORTIONS CONTAINER */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            gap: 1,
          }}
        >
          {/* PORTION 1: STANDARD FOLLOW-UPS */}
          {(viewTab === "split" || viewTab === "followup") && (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: 1.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FAFBFD",
                overflow: "hidden",
              }}
            >
              {/* Section Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.2,
                  py: 0.6,
                  bgcolor: "#EFF6FF",
                  borderBottom: "1px solid #DBEAFE",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <CallMadeRoundedIcon sx={{ color: "#1A73E8", fontSize: 15 }} />
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#1E3A8A",
                      letterSpacing: 0.2,
                    }}
                  >
                    Follow-Up Calls
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={standardFollowUps.length}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: "#DBEAFE",
                    color: "#1E40AF",
                  }}
                />
              </Box>

              {/* Section Scroll List */}
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 0.5 }}>
                {standardFollowUps.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      py: 2,
                      opacity: 0.6,
                    }}
                  >
                    <ReplayRoundedIcon sx={{ fontSize: 24, mb: 0.5, color: "#94A3B8" }} />
                    <Typography sx={{ fontSize: 11.5, color: "#64748B", fontWeight: 500 }}>
                      No standard follow-up calls
                    </Typography>
                  </Box>
                ) : (
                  standardFollowUps.map((fu) => renderFollowUpCard(fu))
                )}
              </Box>
            </Box>
          )}

          {/* PORTION 2: FORWARDED CALLS */}
          {(viewTab === "split" || viewTab === "forwarded") && (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: 1.5,
                border: "1px solid #E9D5FF",
                overflow: "hidden",
              }}
            >
              {/* Section Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.2,
                  py: 0.6,
                  borderBottom: "1px solid #E9D5FF",
                bgcolor: "#FAF5FF",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 ,
                 }}>
                  <ForwardToInboxRoundedIcon sx={{ color: "#8B5CF6", fontSize: 15 }} />
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#581C87",
                      letterSpacing: 0.2,
                    }}
                  >
                    Forwarded Calls
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={forwardedFollowUps.length}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: "#DDD6FE",
                    color: "#6B21A8",
                  }}
                />
              </Box>

              {/* Section Scroll List */}
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 0.5 }}>
                {forwardedFollowUps.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      py: 2,
                      opacity: 0.6,
                    }}
                  >
                    <ForwardToInboxRoundedIcon sx={{ fontSize: 24, mb: 0.5, color: "#C084FC" }} />
                    <Typography sx={{ fontSize: 11.5, color: "#7E22CE", fontWeight: 500 }}>
                      No forwarded calls
                    </Typography>
                  </Box>
                ) : (
                  forwardedFollowUps.map((fu) => renderFollowUpCard(fu))
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* === FOLLOW-UP ACTIONS MENU === */}
      <Menu
        open={menuAnchor !== null}
        onClose={handleCloseMenu}
        anchorEl={menuAnchor?.anchorEl}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              minWidth: 200,
              borderRadius: 2,
              "& .MuiMenuItem-root": {
                fontSize: 13,
                py: 1,
                px: 2,
              },
            },
          },
        }}
      >
        <MenuItem
          disabled
          sx={{ opacity: "1 !important", py: "4px !important" }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: "#80868B",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Follow-Up #{menuAnchor?.fu?.Id}
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleMenuAction("description")}>
          <ListItemIcon>
            <EditRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText>Edit Description</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction("status")}>
          <ListItemIcon>
            <AssignmentIndRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText>Change Status</ListItemText>
        </MenuItem>
        {menuAnchor?.fu?.IsForwardFollowup !== 1 && (
          <MenuItem onClick={() => handleMenuAction("forward")}>
            <ListItemIcon>
              <ForwardToInboxRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText>Forward / Transfer</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* === ADD FOLLOW-UP DESCRIPTION DIALOG === */}
      <Dialog
        open={addFuDialog}
        onClose={() => !addFuSaving && setAddFuDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontSize: 15,
            fontWeight: 700,
            pb: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ReplayRoundedIcon sx={{ color: "#1A73E8", fontSize: 20 }} />
          Add Follow-Up Call
        </DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <Typography sx={{ fontSize: 13, color: "#5F6368", mb: 1.5 }}>
            Please describe the purpose of this follow-up call. This field is{" "}
            <strong>required</strong>.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="Follow-Up Description *"
            placeholder="e.g. Client requested callback to discuss billing issue…"
            value={addFuDescr}
            onChange={(e) => {
              setAddFuDescr(e.target.value);
              if (e.target.value.trim()) setAddFuDescrError(false);
            }}
            error={addFuDescrError}
            helperText={
              addFuDescrError
                ? "Description is required before adding a follow-up"
                : ""
            }
            variant="outlined"
            size="small"
            sx={{ mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setAddFuDialog(false)}
            disabled={addFuSaving}
            size="small"
            sx={{ textTransform: "none", color: "#5F6368" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAddFollowUp}
            variant="contained"
            size="small"
            disabled={addFuSaving}
            sx={{
              textTransform: "none",
              bgcolor: "#1A73E8",
              ":hover": { bgcolor: "#1557B0" },
              borderRadius: 2,
              px: 3,
            }}
          >
            {addFuSaving ? "Adding…" : "Add Follow-Up"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === EDIT POPOVER === */}
      <FollowUpEditPopover
        STATUS_LIST={STATUS_LIST}
        forwardOption={forwardOption}
        filterForwardOptions={filterForwardOptions}
        editFollowUpCall={editFollowUpCall}
        showNotification={showNotification}
        CurrentCall={CurrentCall}
      />
    </>
  );
};

export default FollowUpPanel;
