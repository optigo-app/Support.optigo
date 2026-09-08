'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Microphone,
  MicrophoneSlash,
  UserPlus,
  DotsSixVertical,
  Pause,
  Play,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { callStreamService } from '../../services/callStreamService';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';

export default function FloatingCallWidget() {
  const { user } = useAuth();
  const {
    endFollowUpCall,
    pauseFollowUpCall,
    resumeFollowUpCall,
    setActiveFollowUp,
    endCall,
    PauseCall,
    ResumeCall,
    triggerRefresh,
  } = useCallLog();

  const [activeCall, setActiveCall] = useState(null);
  const [durationStr, setDurationStr] = useState('00:00:00');

  // Dragging Position States
  const [position, setPosition] = useState({ x: 0, y: 75 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Set initial position top-right on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 360, y: 75 });
    }
  }, []);

  // 1. Subscribe to RxJS activeCall$ stream
  useEffect(() => {
    const sub = callStreamService.activeCall$.subscribe((call) => {
      setActiveCall(call);
    });
    return () => sub.unsubscribe();
  }, []);

  // 2. High-precision Timer ticker for active call duration
  useEffect(() => {
    let interval = null;
    if (activeCall) {
      const updateTimer = () => {
        if (activeCall.isPaused) {
          const secs = Number(activeCall.durationSeconds) || 0;
          setDurationStr(callStreamService.formatDuration(secs));
          return;
        }

        const startMs = Number(activeCall.startTime) || Date.now();
        const pausedMs = Number(activeCall.pausedDurationMs) || 0;
        const now = Date.now();
        const elapsedSecs = Math.max(0, Math.floor((now - startMs - pausedMs) / 1000));

        callStreamService.updateActiveCall({ durationSeconds: elapsedSecs });
        setDurationStr(callStreamService.formatDuration(elapsedSecs));
      };

      // Run immediately on mount / restore
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    activeCall?.startTime,
    activeCall?.isPaused,
    activeCall?.pausedDurationMs,
    activeCall?.durationSeconds,
  ]);

  // 3. Global Mouse Dragging Event Listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = Math.max(
        10,
        Math.min(window.innerWidth - 340, e.clientX - dragOffsetRef.current.x)
      );
      const newY = Math.max(
        10,
        Math.min(window.innerHeight - 200, e.clientY - dragOffsetRef.current.y)
      );
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!activeCall) return null;

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleTogglePause = async () => {
    if (!activeCall) return;
    const newPaused = !activeCall.isPaused;
    const now = Date.now();

    if (newPaused) {
      callStreamService.updateActiveCall({
        isPaused: true,
        pausedAt: now,
      });
      if (activeCall.isFollowUp && activeCall.followUpId && pauseFollowUpCall) {
        await pauseFollowUpCall(activeCall.followUpId, activeCall.sr);
      } else if (activeCall.sr && PauseCall) {
        await PauseCall(activeCall.sr);
      }
      toast.info('Call Timer Paused');
    } else {
      const pauseDuration = activeCall.pausedAt ? now - activeCall.pausedAt : 0;
      const totalPausedMs = (activeCall.pausedDurationMs || 0) + pauseDuration;
      callStreamService.updateActiveCall({
        isPaused: false,
        pausedAt: null,
        pausedDurationMs: totalPausedMs,
      });
      if (activeCall.isFollowUp && activeCall.followUpId && resumeFollowUpCall) {
        await resumeFollowUpCall(activeCall.followUpId, activeCall.sr);
      } else if (activeCall.sr && ResumeCall) {
        await ResumeCall(activeCall.sr);
      }
      toast.info('Call Timer Resumed');
    }
  };

  const handleToggleMute = () => {
    const newMuted = !activeCall.isMuted;
    callStreamService.updateActiveCall({ isMuted: newMuted });
    toast.info(newMuted ? 'Microphone Muted' : 'Microphone Unmuted');
  };

  const handleAddParticipant = () => {
    toast.info('Add Participant', {
      description: 'Opening team call invite panel...',
    });
  };

  const handleEndCall = async () => {
    const formattedDuration = durationStr;
    const nowISO = new Date().toISOString();
    const endingCall = activeCall;

    // 1. Optimistic Stream update for instant UI feedback
    if (endingCall?.isFollowUp && endingCall.followUpId && endingCall.sr) {
      callStreamService.patchFollowUpCall(endingCall.sr, endingCall.followUpId, {
        CallClosed: nowISO,
        CallDuration: formattedDuration,
        InternalStatus: 'Completed',
        InternalStatusId: 2,
      });
    } else if (endingCall?.sr) {
      callStreamService.patchPrimaryCall(endingCall.sr, {
        callClosed: nowISO,
        CallDuration: formattedDuration,
        Estatus: 'Completed',
      });
    }

    // 2. Terminate active timer session
    callStreamService.endCall();

    // 3. Persist call termination to server (DO NOT call editFollowUpCall to prevent overwriting description)
    try {
      if (endingCall?.isFollowUp && endingCall.followUpId) {
        if (endFollowUpCall) {
          const res = await endFollowUpCall(endingCall.followUpId, endingCall.sr);
          const updatedFollowUps = res?.data?.rd1?.[0]?.FollowUpList;
          if (updatedFollowUps) {
            let list = [];
            try {
              list =
                typeof updatedFollowUps === 'string'
                  ? JSON.parse(updatedFollowUps)
                  : updatedFollowUps;
            } catch (_) {
              list = [];
            }
            const match = list.find(
              (item) => String(item.Id ?? item.id) === String(endingCall.followUpId)
            );
            if (match) {
              callStreamService.patchFollowUpCall(endingCall.sr, endingCall.followUpId, match);
            }
          }
        }
        if (setActiveFollowUp) {
          setActiveFollowUp(null);
        }
      } else if (endingCall?.sr && endCall) {
        await endCall(endingCall.sr);
      }
    } catch (err) {
      console.error('Error ending call:', err);
    }

    if (triggerRefresh) triggerRefresh();

    toast.success('Call Ended', {
      description: `Call with ${endingCall?.callerName || 'Client'} ended. Duration: ${formattedDuration}`,
    });
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        width: 320,
        borderRadius: '18px',
        bgcolor: '#0D1914', // Exact Image 11 Dark Emerald/Slate Card Surface
        color: '#FFFFFF',
        p: 2,
        boxShadow: isDragging
          ? '0 24px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.25)'
          : '0 16px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        animation: 'cardPop 0.25s ease-out',
        '@keyframes cardPop': {
          from: { transform: 'scale(0.9) translateY(-10px)', opacity: 0 },
          to: { transform: 'scale(1) translateY(0)', opacity: 1 },
        },
      }}
    >
      {/* Card Top Bar: Inbound/Follow-up Logo Badge + Timer + Drag Grip */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {/* Multi-color App Logo Dot */}
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '4px',
              background: activeCall.isFollowUp
                ? 'linear-gradient(135deg, #A855F7 0%, #6900C6 100%)'
                : 'linear-gradient(135deg, #3B82F6 0%, #10B981 50%, #F59E0B 100%)',
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 650, color: 'rgba(255, 255, 255, 0.8)' }}>
            {activeCall.callTitle || (activeCall.isFollowUp ? 'Follow-Up Call' : 'Inbound Call')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeCall.isPaused && (
            <Chip
              label="PAUSED"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: '#FEF3C7',
                color: '#D97706',
              }}
            />
          )}

          <Typography
            sx={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: activeCall.isPaused ? '#FBBF24' : 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'monospace',
            }}
          >
            {durationStr}
          </Typography>

          <Tooltip title="Click & Drag Anywhere">
            <Box sx={{ cursor: 'grab', display: 'flex', opacity: 0.6, '&:hover': { opacity: 1 } }}>
              <DotsSixVertical size={16} color="#FFFFFF" weight="bold" />
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Participants Row (Exact Image 11 Design) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, px: 0.5 }}>
        {/* You (Support Agent) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
            sx={{ width: 26, height: 26, borderRadius: '50%' }}
          />
          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>
            {user?.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : 'Support Agent'}
          </Typography>
          <Chip
            label="You"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '4px',
            }}
          />
        </Box>

        {/* Inbound Caller Contact */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: activeCall.isFollowUp ? '#6900C6' : '#10B981',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 800,
            }}
          >
            {(activeCall.callerName || 'C').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontSize: '0.86rem', fontWeight: 750, color: '#FFFFFF' }}>
              {activeCall.callerName || 'Client Contact'}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
            {activeCall.company || ''}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons Footer Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Wide Red End Button */}
        <Button
          variant="contained"
          onClick={handleEndCall}
          sx={{
            flex: 1,
            bgcolor: '#E11D48',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.82rem',
            textTransform: 'none',
            height: 38,
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.4)',
            '&:hover': {
              bgcolor: '#BE123C',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.6)',
            },
          }}
        >
          End Call
        </Button>

        {/* Pause / Resume Button */}
        <Tooltip title={activeCall.isPaused ? 'Resume Timer' : 'Pause Timer'}>
          <IconButton
            size="small"
            onClick={handleTogglePause}
            sx={{
              width: 38,
              height: 38,
              bgcolor: activeCall.isPaused ? '#F59E0B' : 'rgba(255, 255, 255, 0.14)',
              color: '#FFFFFF',
              borderRadius: '50%',
              '&:hover': {
                bgcolor: activeCall.isPaused ? '#D97706' : 'rgba(255, 255, 255, 0.24)',
              },
            }}
          >
            {activeCall.isPaused ? <Play size={18} weight="fill" /> : <Pause size={18} weight="fill" />}
          </IconButton>
        </Tooltip>

        {/* Microphone Mute Toggle */}
        <Tooltip title={activeCall.isMuted ? 'Unmute' : 'Mute'}>
          <IconButton
            size="small"
            onClick={handleToggleMute}
            sx={{
              width: 38,
              height: 38,
              bgcolor: activeCall.isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.14)',
              color: '#FFFFFF',
              borderRadius: '50%',
              '&:hover': { bgcolor: activeCall.isMuted ? '#DC2626' : 'rgba(255, 255, 255, 0.24)' },
            }}
          >
            {activeCall.isMuted ? <MicrophoneSlash size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
          </IconButton>
        </Tooltip>

        {/* Add Participant Button */}
        <Tooltip title="Add Participant">
          <IconButton
            size="small"
            onClick={handleAddParticipant}
            sx={{
              width: 38,
              height: 38,
              bgcolor: 'rgba(255, 255, 255, 0.14)',
              color: '#FFFFFF',
              borderRadius: '50%',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.24)' },
            }}
          >
            <UserPlus size={18} weight="bold" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
