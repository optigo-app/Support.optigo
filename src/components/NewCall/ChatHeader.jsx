'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Skeleton,
  Rating,
  Button,
} from '@mui/material';
import {
  CaretDown,
  SidebarSimple,
  Star,
  Lightning,
  ShareNetwork,
  PencilSimple,
  Buildings,
  PhoneCall,
  ArrowsClockwise,
  Handshake,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { callStreamService } from '../../services/callStreamService';
import {
  openAddFollowUpModal,
  openEditCallModal,
  openForwardCallModal,
  openDurationModal,
} from './rxjs/newCallEvents';

import { useAuth } from '../../context/UseAuth';
import { useCallLog } from '../../context/UseCallLog';
import { getStatusColor, getPriorityColor } from '../../libs/data';
import CallLogApi from '../../apis/CallLogApiController';

function getChipStyleFromColor(colorName) {
  switch (colorName) {
    case 'success':
      return { dotColor: '#16A34A', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };
    case 'warning':
      return { dotColor: '#D97706', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
    case 'error':
      return { dotColor: '#DC2626', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
    case 'info':
    case 'primary':
      return { dotColor: '#0284C7', bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' };
    case 'secondary':
      return { dotColor: '#6900C6', bg: '#FAF5FF', color: '#6900C6', border: '#DDD6FE' };
    case 'default':
    default:
      return { dotColor: '#64748B', bg: '#F8FAFC', color: '#475569', border: '#CBD5E1' };
  }
}

function getStatusStyle(statusName) {
  if (!statusName) return getChipStyleFromColor('default');
  const { color } = getStatusColor(statusName);
  return getChipStyleFromColor(color);
}

function getPriorityStyle(priorityName) {
  if (!priorityName) return getChipStyleFromColor('default');
  const { color } = getPriorityColor(priorityName);
  return getChipStyleFromColor(color);
}

const EXTERNAL_STATUS_FALLBACK = [
  { label: 'Completed', value: 1 },
  { label: 'Running', value: 2 },
  { label: 'Ticket generated', value: 3 },
  { label: 'Forwarded', value: 4 },
  { label: 'Pending', value: 5 },
];

const INTERNAL_STATUS_FALLBACK = [
  { label: 'Solved', value: 1 },
  { label: 'Pending', value: 2 },
  { label: 'In Progress', value: 3 },
  { label: 'Conversation Pending', value: 4 },
  { label: 'Closed', value: 5 },
];

export default function ChatHeader({
  activeThread,
  selectedCompany = 'all',
  viewMode = 'timeline',
  onToggleViewMode,
  onOpenCallModal,
  isLoading = false,
  isInspectorOpen = false,
  onToggleInspector,
}) {
  const { user } = useAuth();
  const {
    STATUS_LIST = [],
    ESTATUS_LIST = [],
    PRIORITY_LIST = [],
    INTERNAL_STATUS_LIST,
    INTERNAL_ESTATUS_LIST,
    UpdateStatusAndPriority,
    addFeedback,
    startFollowUpCall,
    setActiveFollowUp,
    AcceptQueueCall,
    triggerRefresh,
  } = useCallLog();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [extStatusAnchor, setExtStatusAnchor] = useState(null);
  const [intStatusAnchor, setIntStatusAnchor] = useState(null);
  const [priorityAnchor, setPriorityAnchor] = useState(null);
  const [ratingAnchor, setRatingAnchor] = useState(null);
  const [startCallAnchor, setStartCallAnchor] = useState(null);
  const [isAcceptingHeader, setIsAcceptingHeader] = useState(false);

  const handleAcceptHeaderCall = async () => {
    if (!activeThread?.sr) return;
    setIsAcceptingHeader(true);
    try {
      let result;
      if (AcceptQueueCall) {
        result = await AcceptQueueCall(activeThread.sr);
      } else {
        result = await CallLogApi.AcceptCall({ callLogId: activeThread.sr, createdBy: user?.id });
      }

      if (result && result.success === false) {
        toast.error(result.error?.message || 'Failed to accept call');
        return;
      }

      const userName = user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.name || 'Support Executive';

      callStreamService.patchPrimaryCall(activeThread.sr, {
        receivedBy: userName,
        AssignedEmpName: userName,
      });

      toast.success(`Call #${activeThread.sr} accepted and assigned to you!`);
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Error accepting call:', err);
      toast.error('Failed to accept call');
    } finally {
      setIsAcceptingHeader(false);
    }
  };

  const raw = React.useMemo(() => activeThread?.rawRecord || {}, [activeThread?.rawRecord]);
  const followUpsList = React.useMemo(() => {
    const fuList = raw.FollowUpList || activeThread?.FollowUpList;
    if (!fuList) return [];
    if (Array.isArray(fuList)) return fuList;
    if (typeof fuList === 'string') {
      try {
        const parsed = JSON.parse(fuList);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }
    return [];
  }, [raw.FollowUpList, activeThread?.FollowUpList]);

  const isValidDateString = (d) => d && typeof d === 'string' && !d.startsWith('1900-01-01');

  const isPrimaryPending = !isValidDateString(raw.callClosed || activeThread?.callClosed) &&
    (!raw.CallDuration || raw.CallDuration === '00:00:00' || raw.CallDuration === '0');

  const pendingFollowUps = React.useMemo(() => {
    return followUpsList.filter((fu) => {
      const isClosed = isValidDateString(fu.CallClosed);
      const hasDuration = fu.CallDuration && fu.CallDuration !== '00:00:00' && fu.CallDuration !== '0';
      return !isClosed && !hasDuration;
    });
  }, [followUpsList]);

  const totalPendingCallsCount = (isPrimaryPending ? 1 : 0) + pendingFollowUps.length;
  // External Status maps to estatus / Estatus (e.g. Completed, Running, Ticket generated)
  const currentExtStatus = activeThread?.estatus || raw.Estatus || 'Completed';
  // Internal Status maps to status / Status (e.g. Solved, Pending, In Progress)
  const currentIntStatus = activeThread?.status || raw.status || 'Solved';
  const currentPriority = activeThread?.priority || raw.priority || 'Normal';
  const currentRating = raw.rating || activeThread?.rating || 0;
  const isForwarded = raw.CallType === 'Forwarded' || Boolean(raw.ForwardedEmp);

  // Dynamic master-based color configs matching CallLog datagrid
  const extConfig = getStatusStyle(currentExtStatus);
  const intConfig = getStatusStyle(currentIntStatus);
  const priConfig = getPriorityStyle(currentPriority);

  const handleUpdateExtStatus = async (opt) => {
    setExtStatusAnchor(null);
    if (!activeThread?.sr && !activeThread?.id) return;
    const statusVal = opt.value || opt.id || opt.label;
    const statusLabel = opt.label || opt.Name || opt.name || opt;

    callStreamService.updateCallStatus(activeThread.id, {
      estatus: statusLabel,
      estatusId: statusVal,
    });

    if (UpdateStatusAndPriority && activeThread.sr) {
      try {
        const res = await UpdateStatusAndPriority(
          activeThread.sr,
          { statusId: statusVal, createdBy: user?.id },
          INTERNAL_ESTATUS_LIST
        );
        if (res && !res.success) {
          const errorMsg =
            res?.msg?.stat_msg ||
            'You do not have permission to change the External Status.';
          toast.error(errorMsg);
          return;
        }
        callStreamService.updateCallStatus(activeThread.id, {
          estatus: statusLabel,
          estatusId: statusVal,
        });
        toast.success('The External status is updated.');
      } catch (e) {
        toast.error(e?.message || 'Failed to update external status');
      }
    } else {
      callStreamService.updateCallStatus(activeThread.id, {
        estatus: statusLabel,
        estatusId: statusVal,
      });
      toast.success('The External status is updated.');
    }
  };

  const handleUpdateIntStatus = async (opt) => {
    setIntStatusAnchor(null);
    if (!activeThread?.sr && !activeThread?.id) return;
    const statusVal = opt.value || opt.id || opt.label;
    const statusLabel = opt.label || opt.Name || opt.name || opt;

    callStreamService.updateCallStatus(activeThread.id, {
      status: statusLabel,
      statusId: statusVal,
    });

    if (UpdateStatusAndPriority && activeThread.sr) {
      try {
        const res = await UpdateStatusAndPriority(
          activeThread.sr,
          { statusId: statusVal, createdBy: user?.id },
          INTERNAL_STATUS_LIST
        );
        if (res && !res.success) {
          const errorMsg =
            res?.msg?.stat_msg ||
            'You do not have permission to change the Internal Status.';
          toast.error(errorMsg);
          return;
        }
        callStreamService.updateCallStatus(activeThread.id, {
          status: statusLabel,
          statusId: statusVal,
        });
        toast.success('The Internal status is updated.');
      } catch (e) {
        toast.error(e?.message || 'Failed to update internal status');
      }
    } else {
      callStreamService.updateCallStatus(activeThread.id, {
        status: statusLabel,
        statusId: statusVal,
      });
      toast.success('The Internal status is updated.');
    }
  };

  const handleUpdatePriority = async (opt) => {
    setPriorityAnchor(null);
    if (!activeThread?.sr && !activeThread?.id) return;
    const priorityVal = opt.value || opt.id || opt.label;
    const priorityLabel = opt.label || opt.Name || opt.name || opt;

    if (UpdateStatusAndPriority && activeThread.sr) {
      try {
        const res = await UpdateStatusAndPriority(
          activeThread.sr,
          { priorityId: priorityVal, createdBy: user?.id },
          INTERNAL_ESTATUS_LIST
        );
        if (res && !res.success) {
          const errorMsg =
            res?.msg?.stat_msg ||
            'You do not have permission to change the Priority.';
          toast.error(errorMsg);
          return;
        }
        callStreamService.updateCallStatus(activeThread.id, {
          priority: priorityLabel,
          priorityId: priorityVal,
        });
        toast.success('The Priority is updated.');
      } catch (e) {
        toast.error(e?.message || 'Failed to update priority');
      }
    } else {
      callStreamService.updateCallStatus(activeThread.id, {
        priority: priorityLabel,
        priorityId: priorityVal,
      });
      toast.success('The Priority is updated.');
    }
  };

  const handleUpdateRating = async (newRating) => {
    setRatingAnchor(null);
    if (!activeThread?.sr && !activeThread?.id) return;

    callStreamService.updateCallStatus(activeThread.id, { rating: newRating });

    if (addFeedback && activeThread.sr) {
      try {
        await addFeedback({
          callLogId: activeThread.sr,
          feedback: `Customer Rating: ${newRating} Stars`,
          ratingByCustomer: newRating,
        });
        toast.success(`Rating updated to ${newRating} Stars`);
      } catch (e) {
        toast.error('Failed to save rating');
      }
    } else {
      toast.success(`Rating updated to ${newRating} Stars`);
    }
  };

  const companyTitle = selectedCompany !== 'all' ? selectedCompany : (activeThread?.company || 'Company');

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Top Header Row */}
      <Box
        sx={{
          height: 48,
          minHeight: 48,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        {/* Left: Contact Info Dropdown */}
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rounded" width={26} height={26} animation="wave" sx={{ borderRadius: '6px' }} />
            <Skeleton variant="text" width={130} height={22} animation="wave" />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                cursor: 'pointer',
                p: 0.4,
                px: 0.6,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#F8FAFC' },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={activeThread?.avatar}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '6px',
                    bgcolor: '#EDE9FE',
                    color: '#6900C6',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {activeThread?.name?.charAt(0) || 'A'}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#10B981',
                    border: '1.5px solid #FFFFFF',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 150,
                  }}
                >
                  {activeThread?.name || 'Voice Call'}
                </Typography>
                <CaretDown size={11} weight="bold" color="#64748B" />
              </Box>
            </Box>

            {/* View Mode Toggle: Timeline vs Single Ticket */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#F1F5F9',
                p: 0.3,
                borderRadius: '6px',
                gap: 0.3,
              }}
            >
              <Tooltip title={`View continuous conversation timeline for ${companyTitle}`}>
                <Box
                  onClick={() => onToggleViewMode && onToggleViewMode('timeline')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.3,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: viewMode === 'timeline' ? 800 : 600,
                    bgcolor: viewMode === 'timeline' ? '#FFFFFF' : 'transparent',
                    color: viewMode === 'timeline' ? '#6900C6' : '#64748B',
                    boxShadow: viewMode === 'timeline' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Buildings size={13} weight="bold" />
                  <span>Timeline</span>
                </Box>
              </Tooltip>

              <Tooltip title="View this single call ticket exclusively">
                <Box
                  onClick={() => onToggleViewMode && onToggleViewMode('single')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.3,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: viewMode === 'single' ? 800 : 600,
                    bgcolor: viewMode === 'single' ? '#FFFFFF' : 'transparent',
                    color: viewMode === 'single' ? '#0284C7' : '#64748B',
                    boxShadow: viewMode === 'single' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <PhoneCall size={13} weight="bold" />
                  <span>Single Call</span>
                </Box>
              </Tooltip>
            </Box>

            {/* Sleek Slack-Style Status Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 0.5 }}>
              {/* External Status Pill */}
              <Tooltip title="Click to change External Status">
                <Box
                  onClick={(e) => setExtStatusAnchor(e.currentTarget)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    px: 1,
                    py: 0.3,
                    borderRadius: '16px',
                    bgcolor: extConfig.bg,
                    border: `1px solid ${extConfig.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { opacity: 0.85, transform: 'translateY(-0.5px)' },
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: extConfig.dotColor }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 750, color: extConfig.color }}>
                    {currentExtStatus}
                  </Typography>
                  <CaretDown size={9} weight="bold" color={extConfig.color} />
                </Box>
              </Tooltip>

              {/* Internal Status Pill */}
              <Tooltip title="Click to change Internal Workflow Status">
                <Box
                  onClick={(e) => setIntStatusAnchor(e.currentTarget)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    px: 1,
                    py: 0.3,
                    borderRadius: '16px',
                    bgcolor: intConfig.bg,
                    border: `1px solid ${intConfig.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { opacity: 0.85, transform: 'translateY(-0.5px)' },
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: intConfig.dotColor }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 750, color: intConfig.color }}>
                    {currentIntStatus}
                  </Typography>
                  <CaretDown size={9} weight="bold" color={intConfig.color} />
                </Box>
              </Tooltip>

              {/* Rating Pill */}
              {/* <Tooltip title={currentRating > 0 ? `Rated ${currentRating} Stars (Click to edit)` : 'Rate this call'}>
                <Box
                  onClick={(e) => setRatingAnchor(e.currentTarget)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 0.9,
                    py: 0.3,
                    borderRadius: '16px',
                    bgcolor: currentRating > 0 ? '#FFFBEB' : '#F8FAFC',
                    border: currentRating > 0 ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: '#FEF3C7' },
                  }}
                >
                  <Star size={12} weight="fill" color={currentRating > 0 ? '#D97706' : '#94A3B8'} />
                  <Typography sx={{ fontSize: 11, fontWeight: 750, color: currentRating > 0 ? '#92400E' : '#64748B' }}>
                    {currentRating > 0 ? `${currentRating}.0` : 'Rate'}
                  </Typography>
                </Box>
              </Tooltip> */}

              {/* Priority Pill */}
              <Tooltip title="Click to change Priority">
                <Box
                  onClick={(e) => setPriorityAnchor(e.currentTarget)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 0.9,
                    py: 0.3,
                    borderRadius: '16px',
                    bgcolor: priConfig.bg,
                    border: `1px solid ${priConfig.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { opacity: 0.85, transform: 'translateY(-0.5px)' },
                  }}
                >
                  <Lightning size={12} weight="fill" color={priConfig.dotColor} />
                  <Typography sx={{ fontSize: 11, fontWeight: 750, color: priConfig.color }}>
                    {currentPriority}
                  </Typography>
                  <CaretDown size={9} weight="bold" color={priConfig.color} />
                </Box>
              </Tooltip>

              {/* Customer Rating Chip & Menu Trigger */}
              {/* <Tooltip title="Customer Rating (Click to update)" arrow>
                <Box
                  onClick={(e) => setRatingAnchor(e.currentTarget)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: '12px',
                    bgcolor: currentRating > 0 ? '#FEF3C7' : '#F8FAFC',
                    border: `1px solid ${currentRating > 0 ? '#FDE68A' : '#E2E8F0'}`,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: '#FDF0CD',
                      borderColor: '#FCD34D',
                    },
                  }}
                >
                  <Star size={12} weight={currentRating > 0 ? 'fill' : 'regular'} color={currentRating > 0 ? '#D97706' : '#94A3B8'} />
                  <Typography sx={{ fontSize: 11, fontWeight: 750, color: currentRating > 0 ? '#92400E' : '#64748B' }}>
                    {currentRating > 0 ? `${currentRating} ★` : 'Rating'}
                  </Typography>
                  <CaretDown size={9} weight="bold" color={currentRating > 0 ? '#92400E' : '#64748B'} />
                </Box>
              </Tooltip> */}

              {/* Escalation / Forwarded Indicator */}
              {isForwarded && (
                <Chip
                  icon={<ShareNetwork size={11} weight="bold" color="#6900C6" />}
                  label="Forwarded"
                  size="small"
                  sx={{
                    height: 20,
                    bgcolor: '#FAF5FF',
                    color: '#6900C6',
                    border: '1px solid #DDD6FE',
                    fontWeight: 750,
                    fontSize: 9.5,
                  }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: 210, mt: 0.5 },
          }}
        >
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              if (onToggleInspector) onToggleInspector(true);
            }}
            sx={{ fontSize: 13, fontWeight: 600 }}
          >
            View full details & attachments
          </MenuItem>
          {Boolean(
            (raw.callStart || raw.CallStart || activeThread?.callStart) &&
            (raw.callStart || raw.CallStart || activeThread?.callStart) !== '1900-01-01T00:00:00' &&
            (raw.callClosed || raw.CallClosed || activeThread?.callClosed) &&
            (raw.callClosed || raw.CallClosed || activeThread?.callClosed) !== '1900-01-01T00:00:00'
          ) && (
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                if (activeThread) openDurationModal(activeThread?.rawRecord || activeThread);
              }}
              sx={{ fontSize: 13, fontWeight: 600, color: '#0284C7' }}
            >
              Edit Call Duration & Timing
            </MenuItem>
          )}
          <MenuItem onClick={() => setProfileAnchor(null)} sx={{ fontSize: 13, fontWeight: 550 }}>
            Copy call info & ticket ID
          </MenuItem>
        </Menu>

        {/* External Status Update Menu (master-based: ESTATUS_LIST) */}
        <Menu
          anchorEl={extStatusAnchor}
          open={Boolean(extStatusAnchor)}
          onClose={() => setExtStatusAnchor(null)}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 190, p: 0.5 },
          }}
        >
          <Typography sx={{ px: 1.5, py: 0.6, fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
            Update External Status
          </Typography>
          {(ESTATUS_LIST.length > 0 ? ESTATUS_LIST : EXTERNAL_STATUS_FALLBACK).map((opt) => {
            const label = opt.label || opt.Name || opt.name || opt;
            const isSelected = String(currentExtStatus).toLowerCase() === String(label).toLowerCase();
            const itemStyle = getStatusStyle(label);
            return (
              <MenuItem
                key={opt.value || opt.id || label}
                onClick={() => handleUpdateExtStatus(opt)}
                sx={{
                  fontSize: 12.5,
                  fontWeight: isSelected ? 800 : 550,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderRadius: '6px',
                  my: 0.2,
                  bgcolor: isSelected ? '#F1F5F9' : 'transparent',
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: itemStyle.dotColor }} />
                {label}
              </MenuItem>
            );
          })}
        </Menu>

        {/* Internal Status Update Menu (master-based: STATUS_LIST) */}
        <Menu
          anchorEl={intStatusAnchor}
          open={Boolean(intStatusAnchor)}
          onClose={() => setIntStatusAnchor(null)}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 190, p: 0.5 },
          }}
        >
          <Typography sx={{ px: 1.5, py: 0.6, fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
            Update Internal Status
          </Typography>
          {(STATUS_LIST.length > 0 ? STATUS_LIST : INTERNAL_STATUS_FALLBACK).map((opt) => {
            const label = opt.label || opt.Name || opt.name || opt;
            const isSelected = String(currentIntStatus).toLowerCase() === String(label).toLowerCase();
            const itemStyle = getStatusStyle(label);
            return (
              <MenuItem
                key={opt.value || opt.id || label}
                onClick={() => handleUpdateIntStatus(opt)}
                sx={{
                  fontSize: 12.5,
                  fontWeight: isSelected ? 800 : 550,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderRadius: '6px',
                  my: 0.2,
                  bgcolor: isSelected ? '#F1F5F9' : 'transparent',
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: itemStyle.dotColor }} />
                {label}
              </MenuItem>
            );
          })}
        </Menu>

        {/* Priority Update Menu (master-based: PRIORITY_LIST) */}
        <Menu
          anchorEl={priorityAnchor}
          open={Boolean(priorityAnchor)}
          onClose={() => setPriorityAnchor(null)}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, p: 0.5 },
          }}
        >
          <Typography sx={{ px: 1.5, py: 0.6, fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
            Update Priority
          </Typography>
          {(PRIORITY_LIST.length > 0 ? PRIORITY_LIST : [
            { value: 1, label: 'High' },
            { value: 2, label: 'Medium' },
            { value: 3, label: 'Normal' },
            { value: 4, label: 'Low' },
          ]).map((opt) => {
            const label = opt.label || opt.PriorityName || opt.Name || opt;
            const isSelected = String(currentPriority).toLowerCase() === String(label).toLowerCase();
            const itemStyle = getPriorityStyle(label);
            return (
              <MenuItem
                key={opt.value || opt.PriorityID || label}
                onClick={() => handleUpdatePriority(opt)}
                sx={{
                  fontSize: 12.5,
                  fontWeight: isSelected ? 800 : 550,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderRadius: '6px',
                  my: 0.2,
                  bgcolor: isSelected ? '#F1F5F9' : 'transparent',
                }}
              >
                <Lightning size={14} weight="fill" color={itemStyle.dotColor} />
                {label}
              </MenuItem>
            );
          })}
        </Menu>

        {/* Rating Menu */}
        {/* <Menu
          anchorEl={ratingAnchor}
          open={Boolean(ratingAnchor)}
          onClose={() => setRatingAnchor(null)}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, p: 1.5, textAlign: 'center' },
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#0F172A', mb: 1 }}>
            Rate Call Resolution
          </Typography>
          <Rating
            value={currentRating}
            onChange={(_, newValue) => handleUpdateRating(newValue)}
            size="medium"
          />
        </Menu> */}

        {/* Right Header Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {/* Follow-Up Action Button */}
          {activeThread && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => openAddFollowUpModal(activeThread)}
              startIcon={<ArrowsClockwise size={14} weight="bold" />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.76rem',
                textTransform: 'none',
                px: 1.2,
                height: 32,
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#94A3B8',
                },
              }}
            >
              Follow-Up
            </Button>
          )}

          {/* Forward Call Button */}
          {activeThread && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => openForwardCallModal(activeThread)}
              startIcon={<ShareNetwork size={14} weight="bold" />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.76rem',
                textTransform: 'none',
                px: 1.2,
                height: 32,
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#94A3B8',
                },
              }}
            >
              Forward
            </Button>
          )}

          {/* Edit Call Button */}
          {activeThread && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => openEditCallModal(activeThread)}
              startIcon={<PencilSimple size={14} weight="bold" />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.76rem',
                textTransform: 'none',
                px: 1.2,
                height: 32,
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#94A3B8',
                },
              }}
            >
              Edit
            </Button>
          )}

          {/* Prominent Voice Call Button */}
          {(() => {
            const isUnassigned = !activeThread?.receivedBy || activeThread?.receivedBy === 'Support Desk' || !activeThread?.receivedBy?.trim();
            const hasMultipleOptions = pendingFollowUps.length > 0;
            return (
              <Button
                variant="contained"
                size="small"
                disabled={isAcceptingHeader}
                onClick={(e) => {
                  if (isUnassigned) {
                    handleAcceptHeaderCall();
                  } else if (hasMultipleOptions) {
                    setStartCallAnchor(e.currentTarget);
                  } else if (isPrimaryPending) {
                    if (onOpenCallModal) onOpenCallModal();
                  } else {
                    openAddFollowUpModal(activeThread);
                  }
                }}
                startIcon={isUnassigned ? <Handshake size={15} weight="bold" /> : <PhoneCall size={15} weight="fill" />}
                endIcon={!isUnassigned && hasMultipleOptions ? <CaretDown size={12} weight="bold" /> : undefined}
                sx={{
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  px: 1.5,
                  height: 32,
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: '#15803D',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.45)',
                  },
                }}
              >
                {isAcceptingHeader ? 'Accepting...' : isUnassigned ? 'Accept Call' : 'Start Call'}
              </Button>
            );
          })()}

          {/* Smart Start Call Options Menu (Pending Calls Only) */}
          <Menu
            anchorEl={startCallAnchor}
            open={Boolean(startCallAnchor)}
            onClose={() => setStartCallAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                minWidth: 260,
                p: 0.8,
              },
            }}
          >
            <Typography
              sx={{
                px: 1.5,
                py: 0.8,
                fontSize: 11,
                fontWeight: 800,
                color: '#94A3B8',
                textTransform: 'uppercase',
              }}
            >
              Pending Calls to Start
            </Typography>

            {/* Primary Voice Call Option (Only if primary call is pending) */}
            {isPrimaryPending && (
              <MenuItem
                onClick={() => {
                  setStartCallAnchor(null);
                  if (onOpenCallModal) onOpenCallModal();
                }}
                sx={{ borderRadius: '6px', py: 1, display: 'flex', gap: 1.2 }}
              >
                <Box
                  sx={{
                    p: 0.6,
                    borderRadius: '6px',
                    bgcolor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                  }}
                >
                  <PhoneCall size={16} weight="bold" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                      {!activeThread?.receivedBy || activeThread?.receivedBy === 'Support Desk'
                        ? `Accept & Start Call #${activeThread?.sr}`
                        : `Primary Call #${activeThread?.sr}`}
                    </Typography>
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 9.5,
                        fontWeight: 700,
                        bgcolor: '#FEF3C7',
                        color: '#D97706',
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                    {activeThread?.callBy || 'Client'}
                  </Typography>
                </Box>
              </MenuItem>
            )}

            {/* Pending Follow-Up & Forwarded Calls */}
            {pendingFollowUps.map((fu, idx) => {
              const isForward = Boolean(
                fu.ForwardedEmp ||
                String(fu.InternalStatus).toLowerCase() === 'forwarded' ||
                fu.InternalStatusId === 5
              );

              return (
                <MenuItem
                  key={fu.Id || idx}
                  onClick={async () => {
                    setStartCallAnchor(null);
                    try {
                      if (startFollowUpCall && fu.Id && activeThread?.sr) {
                        const res = await startFollowUpCall(fu.Id, activeThread.sr);
                        if (res && !res.success) {
                          const errMsg =
                            res.error?.message ||
                            res.msg?.stat_msg ||
                            'Failed to start follow-up call';
                          toast.error(errMsg);
                          return;
                        }
                      }
                      if (setActiveFollowUp && activeThread?.sr) {
                        setActiveFollowUp({ followUpCallId: fu.Id, callLogId: activeThread.sr });
                      }
                      callStreamService.startCall(activeThread, {
                        followUpId: fu.Id,
                        isFollowUp: true,
                        isForwarded: isForward,
                        title: isForward
                          ? `Forwarded Call #${fu.Id}`
                          : `Follow-Up #${fu.Id}`,
                      });
                      toast.success(
                        `Started ${isForward ? 'Forwarded' : 'Follow-Up'} Call #${fu.Id}`
                      );
                    } catch (err) {
                      console.error('Error starting follow-up:', err);
                      toast.error(err?.message || 'Failed to start follow-up');
                    }
                  }}
                  sx={{ borderRadius: '6px', py: 1, display: 'flex', gap: 1.2, my: 0.3 }}
                >
                  <Box
                    sx={{
                      p: 0.6,
                      borderRadius: '6px',
                      bgcolor: isForward ? '#EDE9FE' : '#EEF2FF',
                      color: isForward ? '#6900C6' : '#4F46E5',
                      display: 'flex',
                    }}
                  >
                    {isForward ? (
                      <ShareNetwork size={16} weight="bold" />
                    ) : (
                      <ArrowsClockwise size={16} weight="bold" />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}
                      >
                        {isForward ? 'Forwarded Call' : 'Follow-Up Call'} #{fu.Id || idx + 1}
                      </Typography>
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 9.5,
                          fontWeight: 700,
                          bgcolor: '#FEF3C7',
                          color: '#D97706',
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                      {isForward
                        ? `To ${fu.ForwardedEmp || 'Team'}`
                        : `By ${fu.CreatedBy || fu.ReceivedBy || 'Support'}`}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}

            {/* When no pending calls exist */}
            {totalPendingCallsCount === 0 && (
              <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                  No pending calls to start
                </Typography>
              </Box>
            )}

            <Box sx={{ my: 0.5, borderTop: '1px solid #F1F5F9' }} />

            {/* + Add New Follow-Up Call Option */}
            <MenuItem
              onClick={() => {
                setStartCallAnchor(null);
                openAddFollowUpModal(activeThread);
              }}
              sx={{
                borderRadius: '6px',
                py: 0.8,
                color: '#6900C6',
                fontWeight: 700,
                fontSize: 12,
                display: 'flex',
                gap: 1,
              }}
            >
              <ArrowsClockwise size={14} weight="bold" />
              + Create New Follow-Up Call
            </MenuItem>
          </Menu>

          {/* Right Inspector Toggle Button */}
          <Tooltip title={isInspectorOpen ? 'Hide Details Panel' : 'Show Details & Files Panel'}>
            <IconButton
              size="small"
              onClick={() => onToggleInspector && onToggleInspector(!isInspectorOpen)}
              sx={{
                width: 32,
                height: 32,
                color: isInspectorOpen ? '#6900C6' : '#64748B',
                bgcolor: isInspectorOpen ? '#EDE9FE' : 'transparent',
                '&:hover': { bgcolor: isInspectorOpen ? '#DDD6FE' : '#F1F5F9', color: '#6900C6' },
              }}
            >
              <SidebarSimple size={18} weight={isInspectorOpen ? 'bold' : 'regular'} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
