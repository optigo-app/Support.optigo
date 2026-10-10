'use client';
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CompactMediaPreview from './CompactMediaPreview';
import DocumentPreviewer from '../../services/DocumentPreviewer';

export default function AttachmentPill({ attachment }) {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState('');
  const [lightboxName, setLightboxName] = useState('');

  if (!attachment) return null;

  const rawUrl = attachment.imgUrl || attachment.url || '';
  const extractFilename = (url) => {
    if (!url) return `Attachment_${attachment.id || 'file'}.fig`;
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    return last || `Attachment_${attachment.id || 'file'}.fig`;
  };

  const urls = rawUrl.split(',').map(u => u.trim()).filter(Boolean);

  const isImage = (u) => Boolean(
    u.match(/\.(png|jpg|jpeg|gif|webp)$/i) ||
    u.includes('image') ||
    u.includes('unsplash')
  );

  const images = urls.filter(isImage);
  const nonImages = urls.filter(u => !isImage(u));

  const handleOpenPreview = (url, name) => {
    setLightboxUrl(url);
    setLightboxName(name);
    setOpenLightbox(true);
  };

  const renderGridImages = () => {
    if (images.length === 0) return null;

    const isSingle = images.length === 1;
    const isDouble = images.length === 2;
    const isTriple = images.length === 3;

    // WhatsApp style layouts
    const getGridTemplate = () => {
      if (isSingle) return { cols: '1fr', rows: 'auto' };
      if (isDouble) return { cols: '1fr 1fr', rows: '140px' };
      if (isTriple) return { cols: '1fr 1fr', rows: '140px 140px' };
      return { cols: '1fr 1fr', rows: '120px 120px' }; // 4 or more
    };

    const { cols, rows } = getGridTemplate();

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: cols,
          gridTemplateRows: rows,
          gap: '5px',
          borderRadius: '20px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: isSingle ? 240 : 280,
          mt: 0.5,
          border: '1px solid rgba(0,0,0,0.06)',
          bgcolor: '#f0f0f0'
        }}
      >
        {images.slice(0, 4).map((url, idx) => {
          const isLastVisible = idx === 3 && images.length > 4;
          const extraCount = images.length - 4;

          return (
            <Box
              key={idx}
              onClick={() => handleOpenPreview(url, extractFilename(url))}
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                // For 3 images, make the first one span across both columns on top
                gridColumn: (isTriple && idx === 0) ? 'span 2' : 'auto',
                '&:hover': {
                  opacity: 0.95
                }
              }}
            >
              <Box
                component="img"
                src={url}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {isLastVisible && (
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(2px)'
                }}>
                  <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600 }}>
                    +{extraCount}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
      {renderGridImages()}
      {nonImages.map((url, idx) => (
        <CompactMediaPreview
          key={`doc-${idx}`}
          attachment={attachment}
          filename={extractFilename(url)}
          imgUrl={url}
        />
      ))}

      {openLightbox && (
        <DocumentPreviewer
          files={images.map(url => ({ url, name: extractFilename(url) }))}
          currentIndex={images.indexOf(lightboxUrl) !== -1 ? images.indexOf(lightboxUrl) : 0}
          isOpen={openLightbox}
          onClose={() => setOpenLightbox(false)}
        />
      )}
    </Box>
  );
}
