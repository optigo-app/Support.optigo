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

        toast.success('Description updated');
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error('Error saving description:', err);
      toast.error('Failed to update description');
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

        toast.success(`Status updated to "${statusLabel}"`);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  // Confirm Transfer handler
  const handleConfirmTransfer = async () => {
    if (!selectedEmp) {
      toast.error('Please select an employee');
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

        toast.success(`Transferred to ${empName}`);
        if (triggerRefresh) triggerRefresh();
        setTransferAnchorEl(null);
      }
    } catch (err) {
      console.error('Error transferring:', err);
      toast.error('Failed to transfer follow-up');
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
      callStreamService.startCall({
        sr: callLogId,
        callerName: callerName || 'Client',
        company: followup.company || callerName,
        phone: followup.phone || '',
        isFollowUp: true,
        followUpId: fuId,
        callStart: new Date().toISOString(),
      });
      toast.success('Follow-Up Call Started');
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
          } catch (_) {}
        }
      }
      if (setActiveFollowUp) {
        setActiveFollowUp(null);
      }
      toast.success('Follow-Up Call Ended');
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Error ending follow-up:', err);
      toast.error('Failed to properly complete follow-up');
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: { xs: '100%', sm: 540, md: 580 },
        width: '100%',
        bgcolor: isCurrentRunning
          ? '#F0FDF4'
          : isForward
          ? '#FAF5FF'
          : '#FFFFFF',
        border: isCurrentRunning
          ? '1.5px solid #10B981'
          : isForward
          ? '1px solid #DDD6FE'
          : '1px solid #E2E8F0',
        borderRadius: '10px',
        p: 1.5,
        boxShadow: isCurrentRunning
          ? '0 3px 12px rgba(16, 185, 129, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.15s ease',
        mt: 0.4,
        mb: 0.4,
      }}
    >
      {/* Top Header Row: Icon + Title + Status Chip (Click to change status) */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 1.2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: isCurrentRunning
                ? '#10B981'
                : isCompleted
                ? isForward
                  ? '#EDE9FE'
                  : '#DCFCE7'
                : '#FEF3C7',
              color: isCurrentRunning
                ? '#FFFFFF'
                : isCompleted
                ? isForward
                  ? '#6900C6'
                  : '#15803D'
                : '#D97706',
              border: `1px solid ${
                isCurrentRunning
                  ? '#059669'
                  : isForward
                  ? '#DDD6FE'
                  : '#BBF7D0'
              }`,
            }}
          >
            {isForward ? (
              <ShareNetwork size={18} weight="bold" />
            ) : (
              <PhoneCall size={18} weight={isCurrentRunning ? 'fill' : 'bold'} />
            )}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            {/* Prominent Follow-Up / Forward Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  letterSpacing: '-0.01em',
                }}
              >
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
                    color: '#94A3B8',
                    p: 0.2,
                    borderRadius: '4px',
                    '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
                  }}
                >
                  <PencilSimpleLine size={13} />
                </Box>
              </Tooltip>
            </Box>

            <Box
              sx={{
                fontSize: '0.75rem',
                color: isCurrentRunning ? '#10B981' : '#64748B',
                fontWeight: 600,
                mt: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                flexWrap: 'wrap',
              }}
            >
              <span>{isForward ? 'Forwarded Call' : 'Follow-Up Call'} {fuId ? `• #${fuId}` : ''}</span>
              {durationStr !== '—' && (
                <>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#CBD5E1' }} />
                  {hasRealStart && hasRealClosed ? (
                    <Tooltip title="Click to edit call duration" arrow>
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
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.35,
                          color: '#0284C7',
                          fontWeight: 700,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
                        <span>{durationStr}</span>
                      </Box>
                    </Tooltip>
                  ) : (
                    <span>{durationStr}</span>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Status Badge (Clickable Popover to switch status) */}
        {isCurrentRunning ? (
          <Chip
            label={isPaused ? 'PAUSED' : 'LIVE'}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 800,
              bgcolor: isPaused ? '#FEF3C7' : '#10B981',
              color: isPaused ? '#B45309' : '#FFFFFF',
              borderRadius: '5px',
            }}
          />
        ) : (
          <Chip
            label={displayStatus}
            size="small"
            onClick={(e) => setStatusAnchorEl(e.currentTarget)}
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 800,
              bgcolor: statusColors.bg,
              color: statusColors.text,
              border: `1px solid ${statusColors.border}`,
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                opacity: 0.85,
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              },
              '& .MuiChip-label': { px: 0.9 },
            }}
          />
        )}
      </Box>

      {/* Structured Details Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.2,
          p: 1.2,
          px: 1.5,
          bgcolor: isForward ? '#FAF5FF' : '#F8FAFC',
          borderRadius: '8px',
          border: `1px solid ${isForward ? '#EDE9FE' : '#F1F5F9'}`,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isForward ? 'Forwarded To' : 'Handled By'}
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 700 }}>
            {fuForwardedEmp || fuReceivedBy || fuCreatedBy || 'Support Team'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Caller
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 700 }}>
            {callerName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Call Window
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 550 }}>
            {startStr !== '—' ? `${startStr} → ${endStr}` : 'Not started'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Duration
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 650 }}>
            {durationStr}
          </Typography>
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
                  fontSize: 11.5,
                  p: 0.8,
                  bgcolor: '#FFFFFF',
                  borderRadius: '6px',
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
                sx={{ fontSize: 10.5, height: 22, px: 0.8, minWidth: 0, textTransform: 'none', color: '#64748B' }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveInlineDescr}
                sx={{
                  fontSize: 10.5,
                  height: 22,
                  px: 1.2,
                  minWidth: 0,
                  textTransform: 'none',
                  bgcolor: '#16A34A',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#15803D' },
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
                px: 1,
                height: 24,
                borderRadius: '5px',
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
                px: 1,
                height: 24,
                borderRadius: '5px',
                '&:hover': { bgcolor: '#BE123C' },
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
                px: 1.2,
                height: 24,
                borderRadius: '5px',
                '&:hover': { bgcolor: '#15803D' },
                '&.Mui-disabled': { bgcolor: '#15803D', color: '#FFFFFF' },
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
                borderColor: '#CBD5E1',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.7rem',
                textTransform: 'none',
                px: 0.9,
                height: 24,
                borderRadius: '5px',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Transfer
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#16A34A' }}>
              <CheckCircle size={13} weight="bold" />
              <Typography sx={{ fontSize: 10, fontWeight: 700 }}>
                Completed • {durationStr !== '—' ? durationStr : '00:00:00'}
              </Typography>
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={(e) => setTransferAnchorEl(e.currentTarget)}
              startIcon={<ShareFat size={11} weight="bold" />}
              sx={{
                color: '#64748B',
                fontWeight: 650,
                fontSize: '0.68rem',
                textTransform: 'none',
                p: 0,
                minWidth: 0,
                '&:hover': { color: '#0F172A', bgcolor: 'transparent' },
              }}
            >
              Transfer
            </Button>
          </Box>
        )}
      </Box>

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
              borderRadius: '10px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#475569', px: 1, py: 0.4, textTransform: 'uppercase' }}>
          Change Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.3 }}>
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
                  borderRadius: '6px',
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
        onClose={() => setTransferAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 1.5,
              width: 260,
              borderRadius: '10px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#0F172A', mb: 1 }}>
          Transfer Follow-Up • #{fuId}
        </Typography>
        <Autocomplete
          options={forwardOption.length > 0 ? forwardOption : EMPLOYEE_LIST}
          getOptionLabel={(opt) => opt.person || opt.EmpName || opt.name || opt.firstname || ''}
          value={selectedEmp}
          onChange={(_, val) => setSelectedEmp(val)}
          renderInput={(params) => <TextField {...params} label="Select Employee" size="small" autoFocus />}
          size="small"
          fullWidth
          sx={{ mb: 1.2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8 }}>
          <Button
            size="small"
            onClick={() => setTransferAnchorEl(null)}
            sx={{ fontSize: 11, color: '#64748B', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={isTransferring || !selectedEmp}
            onClick={handleConfirmTransfer}
            sx={{
              fontSize: 11,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#6900C6',
              '&:hover': { bgcolor: '#53009E' },
            }}
          >
            {isTransferring ? 'Transferring...' : 'Transfer'}
          </Button>
        </Box>
      </Popover>
    </Paper>
  );
}
