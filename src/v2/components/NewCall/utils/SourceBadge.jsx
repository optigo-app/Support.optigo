import React from 'react';
import { Box } from '@mui/material';
import { Desktop, DeviceMobile, Headset } from '@phosphor-icons/react';
import { getCallSourceDisplay } from './callSource';

export default function SourceBadge({ source, sx = {}, iconSize = 10, labelSize = '0.55rem', variant = 'default' }) {
  if (!source) return null;
  const sourceInfo = getCallSourceDisplay({ topicRaisedBy: source });
  const sourceLower = sourceInfo.type;

  let label = "Csystem";
  let backgroundColor = "#DBEAFE";
  let color = "#1D4ED8";
  let icon = <Desktop weight="fill" size={iconSize} />;

  if (sourceLower === "optigo") {
    label = "OptigoCarely";
    backgroundColor = "#D1FAE5";
    color = "#065F46";
    icon = <DeviceMobile weight="fill" size={iconSize} />;
  } else if (sourceLower === "helpdesk") {
    label = "help.optigoapps.com";
    backgroundColor = "#FEF3C7";
    color = "#92400E";
    icon = <Headset weight="fill" size={iconSize} />;
  } else if (sourceLower === 'custom') {
    label = sourceInfo.label;
  }

  if (variant === 'pill') {
    return (
      <Box
        title={`Source: ${label}`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.6,
          bgcolor: '#E5E7EB', // Gray pill
          color: '#374151',
          p: 0.4,
          pr: 1.2,
          borderRadius: '999px',
          fontSize: labelSize,
          fontWeight: 700,
          flexShrink: 0,
          ...sx
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
          borderRadius: '999px',
          p: 0.4,
          color: '#111827',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {icon}
        </Box>
        {label}
      </Box>
    );
  }

  return (
    <Box
      title={`Source: ${label}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: backgroundColor,
        color: color,
        px: 0.8,
        py: 0.2,
        borderRadius: '6px',
        fontSize: labelSize,
        fontWeight: 750,
        flexShrink: 0,
        ...sx
      }}
    >
      {icon}
      {label}
    </Box>
  );
}
