'use client';
import React, { useState, useEffect } from 'react';
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

  // 2. Call Handlers
  const handleStart = async (e) => {
    e?.stopPropagation();
    if (!fuId || !callLogId) {
      toast.error('Missing follow-up or primary call reference');
      return;
    }
    try {
      if (startFollowUpCall) {
        const res = await startFollowUpCall(fuId, callLogId);
        if (res && !res.success) {
          const errMsg =
            res.error?.message ||
            res.msg?.stat_msg ||
            'Failed to start follow-up call';
          toast.error(errMsg);
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
      toast.error(err?.message || 'Failed to start follow-up');
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
        maxWidth: 390,
        width: '100%',
        bgcolor: isCurrentRunning
          ? '#F0FDF4'
          : isForward
          ? '#FAF5FF'
          : '#F8FAFC',
        border: isCurrentRunning
          ? '1.5px solid #10B981'
          : isForward
          ? '1px solid #E9D5FF'
          : '1px solid #E2E8F0',
        borderRadius: '12px',
        p: 1.1,
        boxShadow: isCurrentRunning
          ? '0 3px 12px rgba(16, 185, 129, 0.12)'
          : '0 1px 2px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.15s ease',
        mt: 0.3,
        mb: 0.3,
      }}
    >
      {/* Top Header Row: Icon + Title + Status Chip (Click to change status) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
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
            }}
          >
            {isForward ? (
              <ShareNetwork size={15} weight="bold" />
            ) : (
              <PhoneCall size={15} weight={isCurrentRunning ? 'fill' : 'bold'} />
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 750,
                color: '#0F172A',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {isForward ? 'Forwarded Call' : 'Follow-Up Call'} {fuId ? `• #${fuId}` : ''}
            </Typography>
            <Box
              sx={{
                fontSize: 10.5,
                color: isCurrentRunning ? '#10B981' : '#64748B',
                fontWeight: 550,
                mt: 0.1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
              }}
            >
              {isCurrentRunning ? (
                isPaused ? (
                  <>
                    <PauseRoundedIcon sx={{ fontSize: 11, color: '#D97706' }} />
                    <span style={{ color: '#D97706' }}>Paused</span>
                  </>
                ) : (
                  <>
                    <FiberManualRecordRoundedIcon sx={{ fontSize: 9, color: '#10B981' }} />
                    <span>Live Voice Call</span>
                  </>
                )
              ) : isCompleted ? (
                <span>Voice Call • {durationStr !== '—' ? durationStr : 'Completed'}</span>
              ) : fuCreatedDate && isValidDate(fuCreatedDate) ? (
                <span>Added {formatCallDateTime(fuCreatedDate)}</span>
              ) : (
                <span>Pending</span>
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
              height: 20,
              fontSize: 9.5,
              fontWeight: 800,
              bgcolor: isPaused ? '#FEF3C7' : '#10B981',
              color: isPaused ? '#B45309' : '#FFFFFF',
            }}
          />
        ) : (
          <Chip
            label={displayStatus}
            size="small"
            onClick={(e) => setStatusAnchorEl(e.currentTarget)}
            sx={{
              height: 20,
              fontSize: 9.5,
              fontWeight: 750,
              bgcolor: statusColors.bg,
              color: statusColors.text,
              border: `1px solid ${statusColors.border}`,
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

      {/* Compact Telemetry Row */}
      <Box
        sx={{
          mt: 0.8,
          pt: 0.7,
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.35,
        }}
      >
        {/* Start / End / Duration Inline Summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
          <Typography sx={{ fontSize: 10.5, color: '#64748B', fontWeight: 500 }}>
            {startStr !== '—' ? `${startStr} → ${endStr}` : 'Not started'}
          </Typography>
          {durationStr !== '—' && (
            hasRealStart && hasRealClosed ? (
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.35,
                    fontWeight: 700,
                    color: '#0F172A',
                    fontSize: 10.5,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    px: 0.5,
                    py: 0.1,
                    bgcolor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: '#E0F2FE',
                      borderColor: '#BAE6FD',
                      color: '#0284C7',
                    },
                  }}
                >
                  <AccessTimeRoundedIcon sx={{ fontSize: 12.5, color: '#64748B' }} />
                  <span>{durationStr}</span>
                </Box>
              </Tooltip>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, fontWeight: 700, color: '#0F172A', fontSize: 10.5 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 12.5, color: '#64748B' }} />
                <span>{durationStr}</span>
              </Box>
            )
          )}
        </Box>

        {/* Handler */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>
            {isForward ? 'Forwarded to:' : 'Handled by:'}
          </Typography>
          <Typography sx={{ fontSize: 10.5, fontWeight: 650, color: '#334155' }}>
            {fuForwardedEmp || fuReceivedBy || fuCreatedBy || 'Support Team'}
          </Typography>
        </Box>

        {/* Description: Double-Click Inline Editable */}
        {isEditingDescr ? (
          <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
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
        ) : (
          <Box
            onDoubleClick={() => {
              setInlineDescr(fuDescr);
              setIsEditingDescr(true);
            }}
            sx={{
              mt: 0.3,
              p: 0.6,
              px: 0.8,
              bgcolor: 'rgba(255, 255, 255, 0.75)',
              borderRadius: '5px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 0.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#FFFFFF',
                borderColor: '#CBD5E1',
                '& .edit-icon': { opacity: 1 },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, flex: 1 }}>
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 13, color: '#64748B', mt: 0.2, flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: 11,
                  color: fuDescr ? '#1E293B' : '#94A3B8',
                  fontWeight: fuDescr ? 500 : 400,
                  fontStyle: fuDescr ? 'normal' : 'italic',
                  whiteSpace: 'pre-wrap',
                  flex: 1,
                }}
              >
                {fuDescr || 'Add description (double-click)...'}
              </Typography>
            </Box>
            <PencilSimpleLine size={12} className="edit-icon" style={{ opacity: 0.35, flexShrink: 0, marginTop: 2 }} />
          </Box>
        )}
      </Box>

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
              }}
            >
              Start Call
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
