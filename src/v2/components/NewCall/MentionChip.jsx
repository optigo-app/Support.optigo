'use client';
import React from 'react';
import { Box, Avatar, Tooltip, Typography } from '@mui/material';

export default function MentionChip({ name, employee = null, isOutgoing = false }) {
  const cleanName = String(name || '').replace(/^@/, '').trim();
  const displayName = employee?.user || employee?.EmployeeName || employee?.name || cleanName;
  const initial = displayName.charAt(0).toUpperCase() || 'U';
  const designation = employee?.designation || employee?.role || (employee ? 'Team Member' : '');
  const empId = employee?.userid ?? employee?.EmployeeId;

  const tooltipTitle = (
    <Box sx={{ p: 0.5, minWidth: 140 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
        {displayName}
      </Typography>
      {designation && (
        <Typography sx={{ fontSize: '0.7rem', color: '#E2E8F0', mt: 0.2 }}>
          {designation}
        </Typography>
      )}
      {empId && (
        <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', mt: 0.3 }}>
          ID: {empId}
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: isOutgoing ? 'rgba(255, 255, 255, 0.22)' : '#F3E8FF',
          color: isOutgoing ? '#FFFFFF' : '#6900C6',
          border: isOutgoing
            ? '1px solid rgba(255, 255, 255, 0.45)'
            : '1px solid #DDD6FE',
          borderRadius: '12px',
          px: 0.8,
          py: 0.1,
          mx: 0.25,
          my: 0.1,
          verticalAlign: 'baseline',
          fontSize: '0.8rem',
          fontWeight: 750,
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: isOutgoing ? 'rgba(255, 255, 255, 0.35)' : '#EDE9FE',
            borderColor: isOutgoing ? '#FFFFFF' : '#C4B5FD',
            transform: 'translateY(-0.5px)',
            boxShadow: isOutgoing
              ? '0 2px 6px rgba(0, 0, 0, 0.2)'
              : '0 2px 6px rgba(105, 0, 198, 0.15)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 15,
            height: 15,
            fontSize: 8.5,
            fontWeight: 800,
            bgcolor: isOutgoing ? '#FFFFFF' : '#6900C6',
            color: isOutgoing ? '#6900C6' : '#FFFFFF',
          }}
        >
          {initial}
        </Avatar>
        @{cleanName}
      </Box>
    </Tooltip>
  );
}
