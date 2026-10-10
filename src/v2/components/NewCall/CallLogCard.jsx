'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Button, Tooltip, Avatar } from '@mui/material';
import {
  PhoneCall,
  PhoneIncoming,
  Star,
  ArrowRight,
} from '@phosphor-icons/react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { callStreamService } from '../../services/callStreamService';
import { isValidDate, formatCallDateTime } from './utils/dateUtils';
import { hasRealTicket, getResolvedTicketId } from './utils/ticketStatusUtils';
import { getStatusColor } from '../../libs/data';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';
import CallLogApi from '../../apis/CallLogApiController';
import { openDurationModal } from './rxjs/newCallEvents';
import SourceBadge from './utils/SourceBadge';

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
  const hasRealDuration = Boolean(durationRaw && durationRaw !== '00:00:00' && durationRaw !== '00:00');

  const formattedStart = hasRealStart ? formatCallDateTime(startRaw) : null;
  const formattedEnd = hasRealClosed ? formatCallDateTime(closedRaw) : (isLivePrimary ? 'In Progress' : 'Unfinished');

  const durationStr = hasRealDuration
    ? durationRaw
    : isLivePrimary
      ? 'Running...'
      : '00:00';

  const descriptionText = (record.description || record.Description || '').trim();
  const callerText = record.callerName || record.callBy;
  const rawReceived = (localReceivedBy || record.receivedBy || record.AssignedEmpName || '').trim();
  const isUnassigned = !rawReceived || rawReceived.toLowerCase() === 'support desk' || rawReceived.toLowerCase() === 'unassigned';
  const agentText = isUnassigned ? 'Unassigned' : rawReceived;


  const statusLower = String(extStatus).toLowerCase();
  const isMissed = statusLower.includes('missed') || statusLower.includes('fail') || statusLower.includes('abandon');
  const isRunningStatus = isRunning || statusLower.includes('progress') || statusLower.includes('live') || statusLower.includes('running');
  const topicRaised = record.topicRaisedBy || 'help.optigoapps.com';
  let iconBg = '#9CA3AF'; // Default gray
  let iconColor = '#FFFFFF';
  let IconComp = PhoneIncoming;

  if (isRunningStatus) {
    iconBg = '#34D399'; // Vibrant green
    IconComp = PhoneCall;
  } else if (isMissed) {
    iconBg = '#EF4444'; // Red
  } else if (statusLower.includes('solved') || statusLower.includes('complet')) {
    iconBg = '#3B82F6'; // Blue
  }

  const chipStyle = getChipColor(extStatus);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 'fit-content' }}>
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          bgcolor: '#EAEBEE', // Instagram light gray chat bubble
          borderRadius: '20px',
          borderLeft: `3px solid ${iconBg}`,
          borderBottom: `3px solid ${iconBg}`,
          borderBottomLeftRadius: '4px',
          p: 1,
          pr: 1.5,
          gap: 0.8,
          width: 'fit-content',
          minWidth: { xs: '100%', sm: 380, md: 400 },
          maxWidth: '100%',
          mt: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, width: '100%' }}>
          {/* Status Icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <IconComp size={22} weight="fill" />
          </Box>

          {/* Compact Info Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#111827', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {callerText}
                </Typography>
                {rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, color: '#D97706', fontSize: 12, fontWeight: 700 }}>
                    <Star size={12} weight="fill" />
                    <span>{rating}</span>
                  </Box>
                )}
              </Box>
              <SourceBadge source={record.topicRaisedBy || 'helpdesk'} variant="pill" iconSize={12} labelSize="0.65rem" sx={{ bgcolor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }} />
            </Box>

          </Box>
        </Box>

        {/* Info Pills Row (Very small below) */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.6, pl: '54px', mt: 0.2 }}>

          {/* Ext Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', height: 22, px: 1.2, bgcolor: chipStyle.bg, color: chipStyle.text, borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
            {extStatus}
          </Box>

          {/* Int Status */}
          {(record.internalStatus || record.InternalStatus || record.InternalStatusId > 0) && (
            <Box sx={{ display: 'flex', alignItems: 'center', height: 22, px: 1.2, bgcolor: '#D1D5DB', color: '#374151', borderRadius: '999px', fontSize: 11, fontWeight: 700 }}>
              {record.internalStatus || record.InternalStatus || 'Internal'}
            </Box>
          )}

          {/* Duration (Click to open edit modal) */}
          {durationStr !== '—' && (
            <Tooltip title="Edit Call Duration" arrow>
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  openDurationModal(record);
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
          )}

          {/* Caller -> Agent flow */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 22, px: 1, bgcolor: '#FFFFFF', color: '#4B5563', borderRadius: '999px', fontSize: 11, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              {callerText.split(' ')[0]}
            </Box>
            <ArrowRight size={10} color="#9CA3AF" weight="bold" />
            <Box sx={{ display: 'flex', alignItems: 'center', height: 22, px: 1, bgcolor: '#FFFFFF', color: '#111827', borderRadius: '999px', fontSize: 11, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              {agentText.split(' ')[0]}
            </Box>
          </Box>
        </Box>
      </Box>
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
    </Box>
  );
}
