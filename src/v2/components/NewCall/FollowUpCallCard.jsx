'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Autocomplete,
  Popover,
  Tooltip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  PhoneCall,
  ShareFat,
  Play,
  Pause,
  Stop,
  CheckCircle,
  PencilSimpleLine,
  Check,
  ShareNetwork,
  ArrowRight,
  MagnifyingGlass,
  CaretRight,
} from '@phosphor-icons/react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import { toast } from 'sonner';
import { useCallLog } from '../../context/UseCallLog';
import { callStreamService } from '../../services/callStreamService';
import { isValidDate, formatCallDateTime } from './utils/dateUtils';
import { getStatusColor } from '../../libs/data';
import { openDurationModal } from './rxjs/newCallEvents';

import { useAuth } from '../../context/UseAuth';

const getStatusChipColors = (statusText = '') => {
  const { color } = getStatusColor(statusText);
  switch (color) {
    case 'success':
      return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
    case 'error':
      return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
    case 'info':
    case 'primary':
      return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
    case 'secondary':
      return { bg: '#EDE9FE', text: '#6900C6', border: '#DDD6FE' };
    case 'warning':
      return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
    case 'default':
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  }
};

export default function FollowUpCallCard({ followup = {}, callerName = 'Client' }) {
  const { user } = useAuth();
  const {
    startFollowUpCall,
    pauseFollowUpCall,
    resumeFollowUpCall,
    endFollowUpCall,
    editFollowUpCall,
    setActiveFollowUp,
    triggerRefresh,
    STATUS_LIST = [],
    INTERNAL_STATUS_LIST = [],
    forwardOption = [],
    EMPLOYEE_LIST = [],
  } = useCallLog();

  const [activeCall, setActiveCall] = useState(null);
  const [localEndData, setLocalEndData] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const startErrorTimerRef = useRef(null);

  // Popover state for 1-click status change
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);

  // Popover state for transfer
  const [transferAnchorEl, setTransferAnchorEl] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline editing state for description
  const [isEditingDescr, setIsEditingDescr] = useState(false);
  const [inlineDescr, setInlineDescr] = useState('');

  // Subscribe to live active call stream
  useEffect(() => {
    const sub = callStreamService.activeCall$.subscribe(setActiveCall);
    return () => sub.unsubscribe();
  }, []);

  const fuId = followup.Id ?? followup.id ?? followup.followUpCallId ?? '';
  const callLogId = followup.callLogId ?? followup.sr ?? '';

  const fuStart =
    followup.CallStart ||
    followup.callStart ||
    '';

  const fuCreatedDate =
    followup.CreatedDate ||
    followup.createdDate ||
    followup.EntryDate ||
    followup.entryDate ||
    followup.StartDate ||
    followup.startDate ||
    '';

  const fuClosed =
    followup.CallClosed ||
    followup.callClosed ||
    followup.EndDate ||
    followup.endDate ||
    followup.ClosedDate ||
    followup.closedDate ||
    localEndData?.closed ||
    '';

  const fuDuration =
    (followup.CallDuration && followup.CallDuration !== '00:00:00'
      ? followup.CallDuration
      : followup.callDuration && followup.callDuration !== '00:00:00'
        ? followup.callDuration
        : followup.duration && followup.duration !== '00:00:00'
          ? followup.duration
          : localEndData?.duration) || '00:00:00';

  const fuDescr = (
    followup.Description ||
    followup.description ||
    followup.Descr ||
    followup.descr ||
    followup.Remarks ||
    followup.remarks ||
    followup.Reason ||
    followup.reason ||
    ''
  ).trim();

  const fuCreatedBy =
    followup.CreatedBy || followup.createdBy || followup.agentName || '';
  const fuReceivedBy = followup.ReceivedBy || followup.receivedBy || '';
  const fuForwardedEmp = followup.ForwardedEmp || followup.forwardedEmp || '';
  const fuInternalStatus =
    followup.InternalStatus ||
    followup.internalStatus ||
    followup.StatusName ||
    followup.statusName ||
    followup.Estatus ||
    followup.status ||
    (localEndData ? 'Completed' : '');

  const isForward =
    followup.isForwarded ||
    Boolean(fuForwardedEmp) ||
    String(fuInternalStatus).toLowerCase() === 'forwarded' ||
    followup.InternalStatusId === 5 ||
    followup.internalStatusId === 5;

  const isCurrentRunning = Boolean(
    activeCall &&
    activeCall.isFollowUp &&
    fuId &&
    String(activeCall.followUpId) === String(fuId)
  );

  const isPaused = isCurrentRunning && activeCall?.isPaused;

  const hasRealStart = isValidDate(fuStart);
  const hasRealClosed = isValidDate(fuClosed);
  const hasRealDuration = Boolean(fuDuration && fuDuration !== '00:00:00');

  const isCompleted =
    hasRealClosed ||
    hasRealDuration ||
    Boolean(localEndData) ||
    String(fuInternalStatus).toLowerCase().includes('complete') ||
    String(fuInternalStatus).toLowerCase().includes('solved');

  const isPending = !isCompleted && !isCurrentRunning;

  // Formatted date strings
  const startStr = hasRealStart ? formatCallDateTime(fuStart) : '—';
  const endStr = hasRealClosed
    ? formatCallDateTime(fuClosed)
    : isCurrentRunning
      ? 'In Progress'
      : '—';
  const durationStr = hasRealDuration
    ? fuDuration
    : isCurrentRunning
      ? 'Recording...'
      : '—';

  // Determine display status label and chip styling
  const displayStatus =
    fuInternalStatus ||
    (isCompleted ? 'Completed' : isCurrentRunning ? 'LIVE' : 'Pending');
  const statusColors = getStatusChipColors(displayStatus);

  // Sync inline description with props when not editing
  useEffect(() => {
    if (!isEditingDescr) {
      setInlineDescr(fuDescr);
    }
  }, [fuDescr, isEditingDescr]);

  // Save inline description handler
  const handleSaveInlineDescr = async () => {
    const trimmed = inlineDescr.trim();
    if (trimmed === fuDescr) {
      setIsEditingDescr(false);
      return;
    }
    try {
      if (editFollowUpCall && fuId && callLogId) {
        await editFollowUpCall({
          callLogId,
          followUpCallId: fuId,
          descr: trimmed,
          statusId: followup.InternalStatusId || followup.StatusId,
          empId: followup.EmpId,
        });

        callStreamService.patchFollowUpCall(callLogId, fuId, {
          Description: trimmed,
          Descr: trimmed,
        });

        // toast.success('Description updated');
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error('Error saving description:', err);
      // toast.error('Failed to update description');
    } finally {
      setIsEditingDescr(false);
    }
  };

  // 1-Click Status Change handler
  const handleSelectStatus = async (statusOption) => {
    const statusId = Number(statusOption.value ?? statusOption.id);
    const statusLabel = statusOption.label || statusOption.name || 'Updated';
    setStatusAnchorEl(null);

    try {
      if (editFollowUpCall && fuId && callLogId) {
        await editFollowUpCall({
          callLogId,
          followUpCallId: fuId,
          statusId,
          descr: fuDescr,
          empId: followup.EmpId,
        });

        callStreamService.patchFollowUpCall(callLogId, fuId, {
          InternalStatusId: statusId,
          InternalStatus: statusLabel,
        });

        // toast.success(`Status updated to "${statusLabel}"`);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      // toast.error('Failed to update status');
    }
  };

  // Confirm Transfer handler
  const handleConfirmTransfer = async () => {
    if (!selectedEmp) {
      // toast.error('Please select an employee');
      return;
    }
    const empId = Number(
      selectedEmp.id?.split?.(',')?.[1] || selectedEmp.EmpId || selectedEmp.id
    );
    const empName =
      selectedEmp.person || selectedEmp.EmpName || selectedEmp.name || '';

    setIsTransferring(true);
    try {
      if (editFollowUpCall && fuId && callLogId) {
        await editFollowUpCall({
          callLogId,
          followUpCallId: fuId,
          empId,
          statusId: followup.InternalStatusId || followup.StatusId,
          descr: fuDescr,
        });

        callStreamService.patchFollowUpCall(callLogId, fuId, {
          ForwardedEmp: empName,
          AssignedEmpName: empName,
          EmpId: empId,
        });

        // toast.success(`Transferred to ${empName}`);
        if (triggerRefresh) triggerRefresh();
        setTransferAnchorEl(null);
      }
    } catch (err) {
      console.error('Error transferring:', err);
      // toast.error('Failed to transfer follow-up');
    } finally {
      setIsTransferring(false);
    }
  };

  // Auto-clear inline start error after 5 seconds
  const setStartErrorWithAutoClear = (msg) => {
    setStartError(msg);
    if (startErrorTimerRef.current) clearTimeout(startErrorTimerRef.current);
    startErrorTimerRef.current = setTimeout(() => setStartError(null), 5000);
  };

  // 2. Call Handlers
  const handleStart = async (e) => {
    e?.stopPropagation();
    if (!fuId || !callLogId) {
      setStartErrorWithAutoClear('Missing follow-up or call reference.');
      return;
    }
    setIsStarting(true);
    setStartError(null);
    try {
      if (startFollowUpCall) {
        const res = await startFollowUpCall(fuId, callLogId);
        if (res && !res.success) {
          const errMsg =
            res.error?.message ||
            res.msg?.stat_msg ||
            'Failed to start this call.';
          setStartErrorWithAutoClear(errMsg);
          return;
        }
      }
      if (setActiveFollowUp) {
        setActiveFollowUp({ followUpCallId: fuId, callLogId });
      }
      callStreamService.startCall(
        { sr: callLogId, company: followup.company || callerName },
        {
          callerName: callerName || 'Client',
          isFollowUp: true,
          followUpId: fuId,
          title: `Follow-Up Call #${fuId}`
        }
      );
      // toast.success('Follow-Up Call Started');
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Error starting follow-up:', err);
      setStartErrorWithAutoClear(err?.message || 'Failed to start follow-up.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleTogglePause = async (e) => {
    e?.stopPropagation();
    try {
      if (isPaused) {
        if (resumeFollowUpCall) await resumeFollowUpCall(fuId, callLogId);
        callStreamService.resumeCall();
      } else {
        if (pauseFollowUpCall) await pauseFollowUpCall(fuId, callLogId);
        callStreamService.pauseCall();
      }
    } catch (err) {
      console.error('Error toggling pause:', err);
    }
  };

  const handleEnd = async (e) => {
    e?.stopPropagation();
    try {
      const nowStr = new Date().toISOString();
      const durStr = activeCall?.duration || fuDuration || '00:00:00';
      setLocalEndData({ closed: nowStr, duration: durStr });

      if (endFollowUpCall) {
        await endFollowUpCall(fuId, callLogId);
      }
      callStreamService.endCall();

      if (fuId && callLogId) {
        callStreamService.patchFollowUpCall(callLogId, fuId, {
          CallClosed: nowStr,
          CallDuration: durStr,
          InternalStatus: 'Completed',
          InternalStatusId: 2,
        });

        if (editFollowUpCall) {
          try {
            await editFollowUpCall({
              callLogId,
              followUpCallId: fuId,
              descr: fuDescr,
              statusId: 2,
            });
          } catch (_) { }
        }
      }
      if (setActiveFollowUp) {
        setActiveFollowUp(null);
      }
      // toast.success('Follow-Up Call Ended');
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Error ending follow-up:', err);
      // toast.error('Failed to properly complete follow-up');
    }
  };

  const iconBgColor = isCurrentRunning ? '#10B981' : isCompleted ? (isForward ? '#EDE9FE' : '#34D399') : '#FCD34D';
  const iconTextColor = isCurrentRunning ? '#FFFFFF' : isCompleted ? (isForward ? '#6900C6' : '#065F46') : '#92400E';
  const formattedStart = hasRealStart ? formatCallDateTime(fuStart) : null;
  const formattedEnd = hasRealClosed ? formatCallDateTime(fuClosed) : (isCurrentRunning ? 'In Progress' : 'Unfinished');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 'fit-content', mt: 0.4, mb: 0.4 }}>
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          bgcolor: isCurrentRunning ? '#F0FDF4' : isForward ? '#FAF5FF' : '#EAEBEE',
          borderRadius: '20px',
          borderLeft: `3px solid ${iconBgColor}`,
          borderBottom: `3px solid ${iconBgColor}`,
          borderBottomLeftRadius: '4px',
          p: 1,
          pr: 1.5,
          gap: 0.8,
          width: 'fit-content',
          minWidth: { xs: '100%', sm: 380, md: 400 },
          maxWidth: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, width: '100%' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: iconBgColor,
              color: iconTextColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            {isForward ? (
              <ShareNetwork size={22} weight="bold" />
            ) : (
              <PhoneCall size={22} weight={isCurrentRunning ? 'fill' : 'bold'} />
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#111827', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {fuDescr || (isForward ? `Forwarded Call #${fuId}` : `Follow-Up Call #${fuId}`)}
                </Typography>
                <Tooltip title="Edit remarks / description">
                  <Box
                    component="span"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInlineDescr(fuDescr);
                      setIsEditingDescr(true);
                    }}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: '#9CA3AF',
                      p: 0.2,
                      borderRadius: '4px',
                      '&:hover': { color: '#4B5563', bgcolor: '#E5E7EB' },
                    }}
                  >
                    <PencilSimpleLine size={14} />
                  </Box>
                </Tooltip>
              </Box>

              {isCurrentRunning ? (
                <Box sx={{ display: 'flex', alignItems: 'center', height: 22, px: 1.2, bgcolor: isPaused ? '#FEF3C7' : '#D1FAE5', color: isPaused ? '#B45309' : '#065F46', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
                  {isPaused ? 'PAUSED' : 'LIVE'}
                </Box>
              ) : (
                <Box
                  onClick={(e) => setStatusAnchorEl(e.currentTarget)}
                  sx={{
                    display: 'flex', alignItems: 'center', height: 22, px: 1.2,
                    bgcolor: statusColors.bg, color: statusColors.text, borderRadius: '999px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    '&:hover': { opacity: 0.85 }
                  }}
                >
                  {displayStatus}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Info Pills Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.6, pl: '54px', mt: 0.2 }}>
          {/* Duration Pill */}
          {hasRealStart && hasRealClosed && durationStr !== '—' ? (
            <Tooltip title="Edit Call Duration" arrow>
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  openDurationModal({
                    sr: callLogId,
                    id: callLogId,
                    CallLogid: callLogId,
                    callStart: fuStart,
                    callClosed: fuClosed,
                    CallDuration: fuDuration,
                  });
                }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.4, height: 22, px: 1.2,
                  bgcolor: '#F3F4F6', color: '#4B5563', borderRadius: '999px', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: '1px solid transparent',
                  '&:hover': { bgcolor: '#E5E7EB', border: '1px solid #D1D5DB' }
                }}
              >
                <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                {durationStr}
              </Box>
            </Tooltip>
          ) : durationStr !== '—' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, height: 22, px: 1.2, bgcolor: '#F3F4F6', color: '#4B5563', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
              {durationStr}
            </Box>
          ) : null}

          {/* Caller -> Agent flow */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 22, px: 1, bgcolor: '#FFFFFF', color: '#4B5563', borderRadius: '999px', fontSize: 11, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              {callerName.split(' ')[0] || 'Caller'}
            </Box>
            <ArrowRight size={10} color="#9CA3AF" weight="bold" />
            <Box sx={{ display: 'flex', alignItems: 'center', height: 22, px: 1, bgcolor: '#FFFFFF', color: '#111827', borderRadius: '999px', fontSize: 11, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              {(fuForwardedEmp || fuReceivedBy || fuCreatedBy || 'Team').split(' ')[0]}
            </Box>
          </Box>
        </Box>

        {/* Description / Remarks: Inline Editor when active */}
        {isEditingDescr && (
          <Box sx={{ mb: 1, mt: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <TextField
                size="small"
                multiline
                autoFocus
                minRows={1}
                rows={3}
                maxRows={4}
                value={inlineDescr}
                onChange={(e) => setInlineDescr(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveInlineDescr();
                  } else if (e.key === 'Escape') {
                    setIsEditingDescr(false);
                    setInlineDescr(fuDescr);
                  }
                }}
                placeholder="Enter remarks (press Enter to save)..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: 12,
                    p: 0.8,
                    bgcolor: '#FFFFFF',
                    borderRadius: '2px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#6900C6', borderWidth: '1px' },
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                  },
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.6 }}>
                <Typography sx={{ fontSize: 9.5, color: '#94A3B8', mr: 'auto' }}>
                  Press <b>Enter ↵</b> to save, <b>Esc</b> to cancel
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setIsEditingDescr(false);
                    setInlineDescr(fuDescr);
                  }}
                  sx={{
                    fontSize: 10.5,
                    height: 24,
                    px: 1.2,
                    minWidth: 0,
                    textTransform: 'none',
                    color: '#64748B',
                    fontWeight: 650,
                    borderRadius: '999px',
                    '&:hover': { bgcolor: '#F1F5F9' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSaveInlineDescr}
                  sx={{
                    fontSize: 10.5,
                    height: 24,
                    px: 1.6,
                    minWidth: 0,
                    textTransform: 'none',
                    bgcolor: '#16A34A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: '999px',
                    boxShadow: '0 2px 6px rgba(22,163,74,0.25)',
                    '&:hover': { bgcolor: '#15803D', boxShadow: '0 4px 8px rgba(22,163,74,0.35)' },
                  }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Inline Start Error Banner */}
        <Collapse in={Boolean(startError)} unmountOnExit>
          <Box
            sx={{
              mt: 0.8,
              px: 1,
              py: 0.7,
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.6,
            }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 900,
                flexShrink: 0,
                mt: 0.15,
              }}
            >
              !
            </Box>
            <Typography sx={{ fontSize: 11, color: '#B91C1C', fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
              {startError}
            </Typography>
            <Box
              onClick={() => setStartError(null)}
              sx={{
                fontSize: 12,
                color: '#B91C1C',
                cursor: 'pointer',
                opacity: 0.6,
                lineHeight: 1,
                px: 0.3,
                '&:hover': { opacity: 1 },
              }}
            >
              ✕
            </Box>
          </Box>
        </Collapse>

        {/* Compact Action Buttons Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            mt: 0.8,
            pt: 0.6,
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          {isCurrentRunning ? (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={handleTogglePause}
                startIcon={isPaused ? <Play size={11} weight="fill" /> : <Pause size={11} weight="fill" />}
                sx={{
                  borderColor: isPaused ? '#10B981' : '#F59E0B',
                  color: isPaused ? '#10B981' : '#D97706',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  px: 1.2,
                  height: 24,
                  borderRadius: '999px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': {
                    bgcolor: isPaused ? '#ECFDF5' : '#FFFBEB',
                    borderColor: isPaused ? '#059669' : '#D97706',
                  },
                }}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleEnd}
                startIcon={<Stop size={11} weight="fill" />}
                sx={{
                  bgcolor: '#E11D48',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  px: 1.2,
                  height: 24,
                  borderRadius: '999px',
                  boxShadow: '0 2px 6px rgba(225,29,72,0.25)',
                  '&:hover': { bgcolor: '#BE123C', boxShadow: '0 4px 8px rgba(225,29,72,0.35)' },
                }}
              >
                End Call
              </Button>
            </>
          ) : isPending ? (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={handleStart}
                startIcon={<Play size={11} weight="fill" />}
                sx={{
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  px: 1.5,
                  height: 24,
                  borderRadius: '999px',
                  boxShadow: '0 2px 6px rgba(22,163,74,0.25)',
                  '&:hover': { bgcolor: '#15803D', boxShadow: '0 4px 8px rgba(22,163,74,0.35)' },
                  '&.Mui-disabled': { bgcolor: '#15803D', color: '#FFFFFF', opacity: 0.7 },
                }}
              >
                {isStarting ? 'Starting...' : 'Start Call'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => setTransferAnchorEl(e.currentTarget)}
                startIcon={<ShareFat size={11} weight="bold" />}
                sx={{
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  px: 1.2,
                  height: 24,
                  borderRadius: '999px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1', color: '#1E293B' },
                }}
              >
                Transfer
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, bgcolor: '#DCFCE7', color: '#15803D', px: 1, py: 0.4, borderRadius: '999px' }}>
                <CheckCircle size={13} weight="fill" />
                <Typography sx={{ fontSize: 10.5, fontWeight: 800 }}>
                  Completed • {durationStr !== '—' ? durationStr : '00:00:00'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => setTransferAnchorEl(e.currentTarget)}
                startIcon={<ShareFat size={11} weight="bold" />}
                sx={{
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  textTransform: 'none',
                  px: 1.2,
                  height: 24,
                  borderRadius: '999px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1', color: '#1E293B' },
                }}
              >
                Transfer
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Outside Timer Chips */}
      {hasRealStart && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
          <Box sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontSize: 11, px: 1.2, py: 0.3, borderRadius: '24px', fontWeight: 700 }}>
            {formattedStart}
          </Box>
          {formattedEnd && (
            <>
              <ArrowRight size={12} color="#9CA3AF" weight="bold" />
              <Box sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontSize: 11, px: 1.2, py: 0.3, borderRadius: '24px', fontWeight: 700 }}>
                {formattedEnd}
              </Box>
            </>
          )}
        </Box>
      )}


      {/* 1-Click Status Popover */}
      <Popover
        open={Boolean(statusAnchorEl)}
        anchorEl={statusAnchorEl}
        onClose={() => setStatusAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 1,
              width: 220,
              borderRadius: '16px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#475569', px: 1, py: 0.4, textTransform: 'uppercase' }}>
          Change Status
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          mt: 0.3,
          maxHeight: '300px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#aaa',
          },
        }}>
          {(STATUS_LIST.length > 0 ? STATUS_LIST : INTERNAL_STATUS_LIST).map((s) => {
            const sId = s.value ?? s.id;
            const sLabel = s.label || s.name;
            const isSelected = String(sId) === String(followup.InternalStatusId || followup.StatusId);
            return (
              <Box
                key={sId}
                onClick={() => handleSelectStatus(s)}
                sx={{
                  px: 1.1,
                  py: 0.5,
                  borderRadius: '15px',
                  fontSize: 11.5,
                  fontWeight: isSelected ? 750 : 500,
                  color: isSelected ? '#6900C6' : '#1E293B',
                  bgcolor: isSelected ? '#FAF5FF' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.12s ease',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                <span>{sLabel}</span>
                {isSelected && <Check size={12} weight="bold" color="#6900C6" />}
              </Box>
            );
          })}
        </Box>
      </Popover>

      {/* Lightweight Transfer Popover */}
      <Popover
        open={Boolean(transferAnchorEl)}
        anchorEl={transferAnchorEl}
        onClose={() => { setTransferAnchorEl(null); setSearchQuery(''); setSelectedEmp(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              width: 260,
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: 'none',
              overflow: 'visible',
              bgcolor: '#FFFFFF',
              mt: 1,
            },
          },
        }}
      >
        <Box sx={{ p: 1.2, pb: 3, display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
          {/* Search Input Pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#F3F4F6',
              borderRadius: '999px',
              px: 1.5,
              py: 0.6,
              gap: 0.8,
            }}
          >
            <MagnifyingGlass size={14} color="#9CA3AF" weight="bold" />
            <Box
              component="input"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                border: 'none',
                bgcolor: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: 12,
                color: '#1F2937',
                '&::placeholder': { color: '#9CA3AF' },
              }}
            />
          </Box>

          {/* List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, maxHeight: 180, overflowY: 'auto', pr: 0.5 }}>
            {(forwardOption.length > 0 ? forwardOption : EMPLOYEE_LIST)
              .filter((emp) => {
                const name = (emp.person || emp.EmpName || emp.name || emp.firstname || '').trim();
                if (!name) return false;

                if (!user?.id) return true;
                const empId = emp?.userid || emp?.userId || emp?.EmpId || (String(emp?.id || '').includes(',') ? emp.id.split(',')[1] : emp?.id);
                if (String(empId) === String(user.id)) return false;

                if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

                return true;
              })
              .map((emp) => {
                const empId = emp?.userid || emp?.userId || emp?.EmpId || (String(emp?.id || '').includes(',') ? emp.id.split(',')[1] : emp?.id);
                const isSelected = selectedEmp && (selectedEmp?.userid || selectedEmp?.userId || selectedEmp?.EmpId || (String(selectedEmp?.id || '').includes(',') ? selectedEmp.id.split(',')[1] : selectedEmp?.id)) === empId;
                const name = (emp?.person || emp?.EmpName || emp?.name || emp?.firstname || '')?.trim();

                return (
                  <Box
                    key={empId}
                    onClick={() => setSelectedEmp(emp)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      px: 1,
                      py: 0.8,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#F3F4F6' : 'transparent',
                      '&:hover': { bgcolor: '#F9FAFB' },
                      transition: 'background-color 0.15s ease',
                      minWidth: 0,
                    }}
                  >
                    {/* Circle */}
                    <Box sx={{ flexShrink: 0, width: 16, height: 16, borderRadius: '50%', ...(isSelected ? { bgcolor: '#6900C6', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '1.5px solid #E5E7EB' }) }}>
                      {isSelected && <Check size={10} weight="bold" color="#FFFFFF" />}
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#111827' : '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {name}
                    </Typography>
                  </Box>
                );
              })}
          </Box>

          {/* Submit Button overlapping bottom */}
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: -18, left: 0, right: 0 }}>
            <Box
              onClick={() => {
                if (!selectedEmp || isTransferring) return;
                handleConfirmTransfer();
              }}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: selectedEmp ? '#6900C6' : '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: selectedEmp && !isTransferring ? 'pointer' : 'not-allowed',
                boxShadow: selectedEmp ? '0 4px 12px rgba(105,0,198,0.3)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: selectedEmp ? '#53009E' : '#E5E7EB',
                  transform: selectedEmp ? 'scale(1.05)' : 'none',
                },
              }}
            >
              {isTransferring ? (
                <CircularProgress size={14} sx={{ color: '#FFFFFF' }} />
              ) : (
                <CaretRight size={16} weight="bold" color="#FFFFFF" />
              )}
            </Box>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
