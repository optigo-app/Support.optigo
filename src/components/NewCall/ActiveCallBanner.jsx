'use client';
import React from 'react';
import { Box, Typography, Button, IconButton, Chip, Avatar,Tooltip } from '@mui/material';
import {
  PhoneCall,
  PhoneDisconnect,
  Microphone,
  MicrophoneSlash,
  SpeakerHigh,
  SpeakerLow,
  Record,
} from '@phosphor-icons/react';

export default function ActiveCallBanner({
  callerName = 'Client Contact',
  companyName = 'Optigo Client',
  durationStr = '00:00:00',
  isMuted = false,
  onToggleMute,
  isSpeaker = true,
  onToggleSpeaker,
  onEndCall,
}) {
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        px: 2.5,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1E293B',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
        zIndex: 10,
        animation: 'slideDown 0.2s ease-out',
        '@keyframes slideDown': {
          from: { transform: 'translateY(-100%)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      }}
    >
      {/* Left: Caller Info & Live Status Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#16A34A',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.85rem',
            }}
          >
            {callerName.charAt(0).toUpperCase()}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#22C55E',
              border: '2px solid #0F172A',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
                '70%': { boxShadow: '0 0 0 6px rgba(34, 197, 94, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
              },
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.9rem' }}>
              {callerName}
            </Typography>
            <Chip
              label={companyName}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.66rem',
                fontWeight: 750,
                bgcolor: '#1E293B',
                color: '#38BDF8',
                border: '1px solid #334155',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
            <Record size={12} color="#EF4444" weight="fill" />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem', fontWeight: 600 }}>
              Live VoIP Call • HD Audio
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Center: Live Call Duration Ticker */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<PhoneCall size={14} color="#22C55E" weight="fill" />}
          label={durationStr}
          sx={{
            height: 32,
            px: 1,
            bgcolor: '#1E293B',
            color: '#22C55E',
            fontWeight: 800,
            fontSize: '0.88rem',
            fontFamily: 'monospace',
            border: '1px solid #334155',
            '& .MuiChip-icon': { color: '#22C55E' },
          }}
        />
      </Box>

      {/* Right: Call Actions (Mute, Speaker, End Call) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}>
          <IconButton
            size="small"
            onClick={onToggleMute}
            sx={{
              bgcolor: isMuted ? '#EF4444' : '#1E293B',
              color: '#FFFFFF',
              width: 34,
              height: 34,
              borderRadius: '8px',
              border: '1px solid #334155',
              '&:hover': { bgcolor: isMuted ? '#DC2626' : '#334155' },
            }}
          >
            {isMuted ? <MicrophoneSlash size={17} weight="bold" /> : <Microphone size={17} weight="bold" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={isSpeaker ? 'Speaker On' : 'Speaker Off'}>
          <IconButton
            size="small"
            onClick={onToggleSpeaker}
            sx={{
              bgcolor: '#1E293B',
              color: isSpeaker ? '#38BDF8' : '#94A3B8',
              width: 34,
              height: 34,
              borderRadius: '8px',
              border: '1px solid #334155',
              '&:hover': { bgcolor: '#334155' },
            }}
          >
            {isSpeaker ? <SpeakerHigh size={17} weight="bold" /> : <SpeakerLow size={17} weight="bold" />}
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          onClick={onEndCall}
          startIcon={<PhoneDisconnect size={16} weight="bold" />}
          sx={{
            bgcolor: '#DC2626',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.8rem',
            textTransform: 'none',
            px: 2,
            height: 34,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
            '&:hover': {
              bgcolor: '#B91C1C',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.6)',
            },
          }}
        >
          End Call
        </Button>
      </Box>
    </Box>
  );
}
