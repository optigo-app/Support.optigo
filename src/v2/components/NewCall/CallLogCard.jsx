'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Button, Tooltip } from '@mui/material';
import {
  PhoneCall,
  PhoneIncoming,
  Star,
  ShareNetwork,
  Handshake,
  PencilSimple,
} from '@phosphor-icons/react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { toast } from 'sonner';
import { callStreamService } from '../../services/callStreamService';
import { isValidDate, formatCallDateTime } from './utils/dateUtils';
import { hasRealTicket, getResolvedTicketId } from './utils/ticketStatusUtils';
import { getStatusColor } from '../../libs/data';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';
import CallLogApi from '../../apis/CallLogApiController';
import { openDurationModal } from './rxjs/newCallEvents';
import { renderFormattedMessage } from './MessageItem';

function getChipColor(statusName) {
  const { color } = getStatusColor(statusName);
  switch (color) {
    case 'success':
      return { bg: '#DCFCE7', text: '#15803D' };
    case 'error':
      return { bg: '#FEE2E2', text: '#DC2626' };
    case 'info':
    case 'primary':
      return { bg: '#E0F2FE', text: '#0369A1' };
    case 'secondary':
      return { bg: '#FAF5FF', text: '#6900C6' };
    case 'warning':
    default:
      return { bg: '#FEF3C7', text: '#B45309' };
  }
}

export default function CallLogCard({ record = {} }) {
  console.log(record, "record")
  const [activeCall, setActiveCall] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [localReceivedBy, setLocalReceivedBy] = useState(null);
  const callLogCtx = useCallLog();
  const { user } = useAuth();

  useEffect(() => {
    const sub = callStreamService.activeCall$.subscribe(setActiveCall);
    return () => sub.unsubscribe();
  }, []);

  const handleAcceptCall = async (e) => {
    e?.stopPropagation();
    if (!record?.sr) return;
    setIsAccepting(true);
    try {
      let result;
      if (callLogCtx?.AcceptQueueCall) {
        result = await callLogCtx.AcceptQueueCall(record.sr);
      } else {
        result = await CallLogApi.AcceptCall({ callLogId: record.sr, createdBy: user?.id });
      }

      if (result && result.success === false) {
        // toast.error(result.error?.message || 'Failed to accept call');
        return;
      }

      const userName = user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.name || 'Support Executive';

      setLocalReceivedBy(userName);

      callStreamService.patchPrimaryCall(record.sr, {
        receivedBy: userName,
        AssignedEmpName: userName,
      });

      // toast.success(`Call #${record.sr} accepted and assigned to you!`);
      if (callLogCtx?.triggerRefresh) callLogCtx.triggerRefresh();
    } catch (err) {
      console.error('Error accepting call:', err);
      // toast.error('Failed to accept call');
    } finally {
      setIsAccepting(false);
    }
  };

  if (!record) return null;

  const isLivePrimary = Boolean(
    activeCall &&
    !activeCall.isFollowUp &&
    String(activeCall.sr) === String(record.sr)
  );

  const hasTicket = hasRealTicket(record);
  const resolvedTicketId = getResolvedTicketId(record);

  const isSolved =
    (record.status || '').toLowerCase() === 'solved' ||
    (record.Estatus || '').toLowerCase() === 'completed';
  const isRunning =
    isLivePrimary || (record.Estatus || '').toLowerCase() === 'running';

  let rawExtStatus = isLivePrimary
    ? 'In Progress'
    : record.status || (isSolved ? 'Solved' : 'Pending');

  if (!hasTicket && String(rawExtStatus).trim().toLowerCase() === 'ticket generated') {
    rawExtStatus = isSolved ? 'Solved' : 'Pending';
  }

  const extStatus = rawExtStatus;
  const rating = record.rating || 0;
  const isForwarded = record.CallType === 'Forwarded' || Boolean(record.ForwardedEmp);

  // Timing resolution
  const startRaw = record.callStart || record.CallStart || '';
  const closedRaw = record.callClosed || record.CallClosed || '';
  const durationRaw = record.CallDuration || record.callDuration || record.duration || '';

  const hasRealStart = isValidDate(startRaw);
  const hasRealClosed = isValidDate(closedRaw);
  const hasRealDuration = Boolean(durationRaw && durationRaw !== '00:00:00');

  const startStr = hasRealStart ? formatCallDateTime(startRaw) : '—';
  const endStr = hasRealClosed
    ? formatCallDateTime(closedRaw)
    : isLivePrimary
      ? 'In Progress'
      : '—';
  const durationStr = hasRealDuration
    ? durationRaw
    : isLivePrimary
      ? 'Running...'
      : '—';

  const descriptionText = (record.description || record.Description || '').trim();
  const callerText = record.callerName || record.callBy;
  const rawReceived = (localReceivedBy || record.receivedBy || record.AssignedEmpName || '').trim();
  const isUnassigned = !rawReceived || rawReceived.toLowerCase() === 'support desk' || rawReceived.toLowerCase() === 'unassigned';
  const agentText = isUnassigned ? 'Unassigned' : rawReceived;


  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: { xs: '100%', sm: 540, md: 580 },
        width: '100%',
        bgcolor: isRunning ? '#FEF2F2' : '#FFFFFF',
        border: isRunning ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
        borderRadius: '10px',
        p: 1.5,
        boxShadow: isRunning ? '0 3px 12px rgba(239, 68, 68, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.15s ease',
        mt: 0.4,
        mb: 0.4,
      }}
    >
      {/* Top Header Row: Icon + Title + Status Badge */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 1.2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, minWidth: 0, flex: 1 }}>
          {/* Circular Voice Call Icon */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: isRunning ? '#EF4444' : '#DCFCE7',
              color: isRunning ? '#FFFFFF' : '#15803D',
              border: `1px solid ${isRunning ? '#DC2626' : '#BBF7D0'}`,
            }}
          >
            {isRunning ? (
              <PhoneCall size={18} weight="fill" />
            ) : (
              <PhoneIncoming size={18} weight="bold" />
            )}
          </Box>

          {/* Primary Call Title & Subtitle */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
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
              {descriptionText || 'No Description'}
            </Typography>

            <Box
              sx={{
                fontSize: '0.75rem',
                color: isRunning ? '#EF4444' : '#64748B',
                fontWeight: 600,
                mt: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                flexWrap: 'wrap',
              }}
            >
              <Tooltip title="Click to edit call duration" arrow>
                <Box
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDurationModal(record);
                  }}
                  sx={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.35,
                    color: isRunning ? '#EF4444' : '#0284C7',
                    fontWeight: 700,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
                  <span>{durationStr !== '—' ? durationStr : '00:00:00'}</span>
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Right Status Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
          {rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, color: '#D97706', fontSize: 11, fontWeight: 700 }}>
              <Star size={12} weight="fill" />
              <span>{rating}</span>
            </Box>
          )}
          {(() => {
            const chipStyle = getChipColor(extStatus);
            return (
              <Chip
                label={extStatus}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  bgcolor: chipStyle.bg,
                  color: chipStyle.text,
                  borderRadius: '5px',
                  border: `1px solid ${chipStyle.text}20`,
                }}
              />
            );
          })()}
        </Box>
      </Box>

      {/* Structured Details Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.2,
          p: 1.2,
          px: 1.5,
          bgcolor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #F1F5F9',
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Caller
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 700 }}>
            {callerText}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Received By
          </Typography>
          {isUnassigned ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#D97706', fontWeight: 700 }}>
                Unassigned
              </Typography>
              {/* <Button
                size="small"
                variant="contained"
                disabled={isAccepting}
                onClick={handleAcceptCall}
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  px: 1,
                  py: 0,
                  textTransform: 'none',
                  borderRadius: '4px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#15803D' },
                }}
              >
                {isAccepting ? 'Assigning...' : 'Accept Call'}
              </Button> */}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 700 }}>
              {agentText}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Call Window
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 550 }}>
            {startStr !== '—' ? `${startStr} → ${endStr}` : 'Not recorded'}
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

      {/* Forwarded employee notice if applicable */}
      {isForwarded && record.ForwardedEmp && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#6900C6', mb: 0.8, px: 0.5 }}>
          <ShareNetwork size={13} weight="bold" />
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 650 }}>
            Forwarded to {record.ForwardedEmp}
          </Typography>
        </Box>
      )}

      {/* Call Badges & Tags Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', pt: 0.2 }}>
        {/* Source Badge */}
        {record.topicRaisedBy && (
          <Chip
            label={
              record.topicRaisedBy.toLowerCase() === 'optigocarely'
                ? 'OptigoCarely'
                : record.topicRaisedBy.toLowerCase() === 'helpdesk'
                  ? 'help.optigoapps.com'
                  : record.topicRaisedBy
            }
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 750,
              bgcolor:
                record.topicRaisedBy.toLowerCase() === 'optigocarely'
                  ? '#DCFCE7'
                  : record.topicRaisedBy.toLowerCase() === 'helpdesk'
                    ? '#FEF3C7'
                    : '#DBEAFE',
              color:
                record.topicRaisedBy.toLowerCase() === 'optigocarely'
                  ? '#15803D'
                  : record.topicRaisedBy.toLowerCase() === 'helpdesk'
                    ? '#92400E'
                    : '#1D4ED8',
              borderRadius: '4px',
              '& .MuiChip-label': { px: 0.7 },
            }}
          />
        )}

        {/* Call Type */}
        {(record.CallType || record.callType) && (
          <Chip
            label={record.CallType || record.callType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 750,
              bgcolor: '#F3E8FF',
              color: '#6900C6',
              borderRadius: '4px',
              '& .MuiChip-label': { px: 0.7 },
            }}
          />
        )}

        {/* Priority */}
        {record.priority && record.priority !== 'Normal' && (
          <Chip
            label={record.priority}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 750,
              bgcolor: record.priority === 'High' ? '#FEE2E2' : '#FEF3C7',
              color: record.priority === 'High' ? '#DC2626' : '#D97706',
              borderRadius: '4px',
              '& .MuiChip-label': { px: 0.7 },
            }}
          />
        )}

        {/* Ticket Badge */}
        {hasTicket && (
          <Chip
            label={resolvedTicketId ? `Ticket #${resolvedTicketId}` : 'In Ticket'}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 750,
              bgcolor: '#E0F2FE',
              color: '#0284C7',
              borderRadius: '4px',
              '& .MuiChip-label': { px: 0.7 },
            }}
          />
        )}

        {/* iTask Badge */}
        {Boolean((record.TaskId && Number(record.TaskId) > 0) || (record.taskId && Number(record.taskId) > 0)) && (
          <Chip
            label={Number(record.TaskId || record.taskId) > 0 ? `iTask #${record.TaskId || record.taskId}` : 'In iTask'}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 750,
              bgcolor: '#DCFCE7',
              color: '#15803D',
              borderRadius: '4px',
              '& .MuiChip-label': { px: 0.7 },
            }}
          />
        )}
      </Box>

      {/* Unassigned / Queue Call: Accept Call Action Row */}
      {/* {isUnassigned && (
        <Box
          sx={{
            mt: 1,
            pt: 0.8,
            borderTop: '1px dashed #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: '0.74rem', color: '#92400E', fontWeight: 700 }}>
            Queue Callback Request
          </Typography>
          <Button
            variant="contained"
            size="small"
            disabled={isAccepting}
            onClick={handleAcceptCall}
            startIcon={<Handshake size={14} weight="bold" />}
            sx={{
              bgcolor: '#16A34A',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 750,
              textTransform: 'none',
              height: 26,
              px: 1.4,
              borderRadius: '6px',
              boxShadow: '0 2px 5px rgba(22, 163, 74, 0.3)',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: '#15803D',
                boxShadow: '0 3px 8px rgba(22, 163, 74, 0.45)',
              },
            }}
          >
            {isAccepting ? 'Accepting...' : 'Accept Call'}
          </Button>
        </Box>
      )} */}
    </Paper>
  );
}
