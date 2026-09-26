'use client';
import React from 'react';
import { Box } from '@mui/material';
import CompactMediaPreview from './CompactMediaPreview';

export default function AttachmentPill({ attachment }) {
  if (!attachment) return null;

  const rawUrl = attachment.imgUrl || attachment.url || '';
  const extractFilename = (url) => {
    if (!url) return `Attachment_${attachment.id || 'file'}.fig`;
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    return last || `Attachment_${attachment.id || 'file'}.fig`;
  };

  const filename = attachment.filename || extractFilename(rawUrl);

  return (
    <Box sx={{ display: 'inline-flex', mt: 0.5 }}>
      <CompactMediaPreview
        attachment={attachment}
        filename={filename}
        imgUrl={rawUrl}
      />
    </Box>
  );
}
