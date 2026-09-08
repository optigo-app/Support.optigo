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
import { getStatusColor } from '../../libs/data';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';
import CallLogApi from '../../apis/CallLogApiController';
import { openDurationModal } from './rxjs/newCallEvents';

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
        toast.error(result.error?.message || 'Failed to accept call');
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

      toast.success(`Call #${record.sr} accepted and assigned to you!`);
      if (callLogCtx?.triggerRefresh) callLogCtx.triggerRefresh();
    } catch (err) {
      console.error('Error accepting call:', err);
      toast.error('Failed to accept call');
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

  const isSolved =
    (record.status || '').toLowerCase() === 'solved' ||
    (record.Estatus || '').toLowerCase() === 'completed';
  const isRunning =
    isLivePrimary || (record.Estatus || '').toLowerCase() === 'running';

  const extStatus = isLivePrimary
    ? 'In Progress'
    : record.status || (isSolved ? 'Solved' : 'Pending');
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
  const callerText = record.callerName || record.callBy || record.company || 'Client Caller';
  const rawReceived = (localReceivedBy || record.receivedBy || record.AssignedEmpName || (record.agentName !== 'Support Desk' ? record.agentName : '') || '').trim();
  const isUnassigned = !rawReceived || rawReceived.toLowerCase() === 'support desk' || rawReceived.toLowerCase() === 'unassigned';
  const agentText = isUnassigned ? 'Unassigned' : rawReceived;

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 390,
        width: '100%',
        bgcolor: isRunning ? '#FEF2F2' : '#F0FDF4',
        border: isRunning
          ? '1.5px solid #EF4444'
          : '1px solid #BBF7D0',
        borderRadius: '12px',
        p: 1.1,
        boxShadow: isRunning
          ? '0 3px 12px rgba(239, 68, 68, 0.12)'
          : '0 1px 2px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.15s ease',
        mt: 0.3,
        mb: 0.3,
      }}
    >
      {/* Top Header Row: Icon + Title + Status Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
          {/* Circular Voice Call Icon */}
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: isRunning ? '#EF4444' : '#DCFCE7',
              color: isRunning ? '#FFFFFF' : '#15803D',
            }}
          >
            {isRunning ? (
              <PhoneCall size={15} weight="fill" />
            ) : (
              <PhoneIncoming size={15} weight="bold" />
            )}
          </Box>

          {/* Call Label & Inline Duration */}
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
              Primary Voice Call {record.sr ? `• #${record.sr}` : ''}
            </Typography>
            <Box
              sx={{
                fontSize: 10.5,
                color: isRunning ? '#EF4444' : '#64748B',
                fontWeight: 550,
                mt: 0.1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
              }}
            >
              {isRunning ? (
                <>
                  <FiberManualRecordRoundedIcon sx={{ fontSize: 9, color: '#EF4444' }} />
                  <span>Live Voice Call</span>
                </>
              ) : hasRealStart && hasRealClosed ? (
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
                      gap: 0.4,
                      borderRadius: '4px',
                      px: 0.5,
                      py: 0.15,
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
                    <span>Voice Call • {durationStr !== '—' ? durationStr : 'Edit Duration'}</span>
                    <PencilSimple size={10} weight="bold" />
                  </Box>
                </Tooltip>
              ) : (
                <span>Voice Call • {durationStr !== '—' ? durationStr : 'Pending'}</span>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Status Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, color: '#D97706', fontSize: 10, fontWeight: 700 }}>
              <Star size={10.5} weight="fill" />
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
                  height: 19,
                  fontSize: 9,
                  fontWeight: 700,
                  bgcolor: chipStyle.bg,
                  color: chipStyle.text,
                }}
              />
            );
          })()}
        </Box>
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
        {/* Start / End / Duration Inline */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
          <Typography sx={{ fontSize: 10.5, color: '#64748B', fontWeight: 500 }}>
            {startStr !== '—' ? `${startStr} → ${endStr}` : 'Not recorded'}
          </Typography>
          {durationStr !== '—' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, fontWeight: 700, color: '#0F172A', fontSize: 10.5 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 12.5, color: '#64748B' }} />
              <span>{durationStr}</span>
            </Box>
          )}
        </Box>

        {/* Caller & Handler */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>
            Caller: <Box component="span" sx={{ fontWeight: 650, color: '#334155' }}>{callerText}</Box>
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>
            Received:{' '}
            {isUnassigned ? (
              <Box
                component="span"
                sx={{
                  fontWeight: 750,
                  color: '#D97706',
                  bgcolor: '#FEF3C7',
                  px: 0.6,
                  py: 0.15,
                  borderRadius: '4px',
                  fontSize: 9.5,
                  border: '1px solid #FDE68A',
                }}
              >
                Unassigned
              </Box>
            ) : (
              <Box component="span" sx={{ fontWeight: 650, color: '#334155' }}>
                {agentText}
              </Box>
            )}
          </Typography>
        </Box>

        {/* Forwarded employee notice if applicable */}
        {isForwarded && record.ForwardedEmp && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6900C6', pt: 0.1 }}>
            <ShareNetwork size={11} weight="bold" />
            <Typography sx={{ fontSize: 10, fontWeight: 650 }}>
              Forwarded to {record.ForwardedEmp}
            </Typography>
          </Box>
        )}

        {/* Description Preview (if present) */}
        {descriptionText ? (
          <Box
            sx={{
              mt: 0.2,
              p: 0.6,
              px: 0.8,
              bgcolor: 'rgba(255, 255, 255, 0.75)',
              borderRadius: '5px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.5,
            }}
          >
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 13, color: '#64748B', mt: 0.2, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, color: '#1E293B', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
              {descriptionText}
            </Typography>
          </Box>
        ) : null}

        {/* Call Badges & Tags Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', pt: 0.3 }}>
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
                height: 17,
                fontSize: 8.5,
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
                borderRadius: '3px',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}

          {/* Call Type */}
          {(record.CallType || record.callType) && (
            <Chip
              label={record.CallType || record.callType}
              size="small"
              sx={{
                height: 17,
                fontSize: 8.5,
                fontWeight: 750,
                bgcolor: '#F3E8FF',
                color: '#6900C6',
                borderRadius: '3px',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}

          {/* Priority */}
          {record.priority && record.priority !== 'Normal' && (
            <Chip
              label={record.priority}
              size="small"
              sx={{
                height: 17,
                fontSize: 8.5,
                fontWeight: 750,
                bgcolor: record.priority === 'High' ? '#FEE2E2' : '#FEF3C7',
                color: record.priority === 'High' ? '#DC2626' : '#D97706',
                borderRadius: '3px',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}

          {/* Ticket Badge */}
          {Boolean(
            (record.ticket && String(record.ticket).trim() !== '' && String(record.ticket).trim() !== 'Upgrade to Ticket') ||
            (record.Ticket_CreatedDate && String(record.Ticket_CreatedDate).trim() !== '') ||
            record.Ticket_Id ||
            record.ticketId
          ) && (
            <Chip
              label={record.ticket && record.ticket !== 'In Ticket' && record.ticket !== 'Upgrade to Ticket' ? `Ticket #${record.ticket}` : 'In Ticket'}
              size="small"
              sx={{
                height: 17,
                fontSize: 8.5,
                fontWeight: 800,
                bgcolor: '#E0F2FE',
                color: '#0284C7',
                borderRadius: '3px',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}

          {/* iTask Badge */}
          {Boolean((record.TaskId && Number(record.TaskId) > 0) || (record.taskId && Number(record.taskId) > 0)) && (
            <Chip
              label={Number(record.TaskId || record.taskId) > 0 ? `iTask #${record.TaskId || record.taskId}` : 'In iTask'}
              size="small"
              sx={{
                height: 17,
                fontSize: 8.5,
                fontWeight: 800,
                bgcolor: '#DCFCE7',
                color: '#15803D',
                borderRadius: '3px',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}
        </Box>

        {/* Unassigned / Queue Call: Accept Call Action Row */}
        {isUnassigned && (
          <Box
            sx={{
              mt: 0.8,
              pt: 0.8,
              borderTop: '1px dashed #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: 10.5, color: '#92400E', fontWeight: 700 }}>
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
                fontSize: 11,
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
        )}
      </Box>
    </Paper>
  );
}
