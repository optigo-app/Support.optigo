'use client';
import React, { useState } from 'react';
import { Box, Typography, Tooltip, Dialog, DialogContent, IconButton } from '@mui/material';
import { DownloadSimple, X, Play, MagnifyingGlassPlus, FileText } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function CompactMediaPreview({ attachment, filename, imgUrl }) {
  const [openLightbox, setOpenLightbox] = useState(false);

  const rawName = filename || attachment?.filename || attachment?.imgUrl || 'Attachment.fig';
  const initialMediaUrl = imgUrl || attachment?.imgUrl || attachment?.url || '';
  const fallbackUrl = '';
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl || fallbackUrl);

  // File extension detector
  const getExt = (name) => {
    if (!name) return 'FIG';
    const match = String(name).match(/\.([a-z0-9]+)$/i);
    if (match && match[1]) {
      const ext = match[1].toUpperCase();
      if (ext === 'JPEG' || ext === 'JPG') return 'JPG';
      return ext.length <= 4 ? ext : 'FIG';
    }
    return 'FIG';
  };

  const extText = getExt(rawName);

  const isImage = Boolean(
    initialMediaUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i) ||
    initialMediaUrl.includes('image') ||
    initialMediaUrl.includes('unsplash') ||
    initialMediaUrl.includes('blob:') ||
    ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(extText)
  );

  const isVideo = Boolean(
    initialMediaUrl.match(/\.(mp4|mov|webm)$/i) ||
    ['MP4', 'MOV', 'WEBM'].includes(extText)
  );

  const handleDownload = (e) => {
    e.stopPropagation();
    if (initialMediaUrl) {
      window.open(initialMediaUrl, '_blank');
      toast.success(`Opening ${rawName}`);
    } else {
      toast.info(`No URL available for ${rawName}`);
    }
  };

  // Gradient helper for files
  const getGradient = (ext) => {
    switch (ext) {
      case 'PDF':
        return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
      case 'DOCX':
      case 'DOC':
        return 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
      case 'ZIP':
      case 'RAR':
        return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      case 'MP4':
      case 'MOV':
        return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
      case 'FIG':
      default:
        return 'linear-gradient(135deg, #FFA07A 0%, #EC4899 50%, #E11D48 100%)'; // Image 14 Pink/Coral
    }
  };

  // 1. IMAGE PREVIEW (Compact Image Thumbnail Card)
  if (isImage) {
    return (
      <>
        <Tooltip title={`View Image • ${rawName}`} placement="top">
          <Box
            onClick={() => setOpenLightbox(true)}
            sx={{
              position: 'relative',
              width: 150,
              height: 90,
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              cursor: 'pointer',
              my: 0.8,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                borderColor: '#CBD5E1',
                '& .overlay': { opacity: 1 },
              },
            }}
          >
            <Box
              component="img"
              src={mediaUrl}
              onError={() => setMediaUrl(fallbackUrl)}
              alt={rawName}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Hover Glass Action Overlay */}
            <Box
              className="overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                opacity: 0,
                transition: 'opacity 0.18s ease',
              }}
            >
              <IconButton size="small" sx={{ color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.2)' }}>
                <MagnifyingGlassPlus size={16} weight="bold" />
              </IconButton>
              <IconButton size="small" onClick={handleDownload} sx={{ color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.2)' }}>
                <DownloadSimple size={16} weight="bold" />
              </IconButton>
            </Box>
          </Box>
        </Tooltip>

        {/* Lightbox Dialog */}
        <Dialog open={openLightbox} onClose={() => setOpenLightbox(false)} maxWidth="md">
          <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{rawName}</Typography>
            <IconButton size="small" onClick={() => setOpenLightbox(false)} sx={{ color: '#FFFFFF' }}><X size={16} /></IconButton>
          </Box>
          <DialogContent sx={{ p: 2, bgcolor: '#020617', textAlign: 'center' }}>
            <Box component="img" src={mediaUrl} alt={rawName} sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 2. VIDEO PREVIEW (Compact Video Card with Play Button)
  if (isVideo) {
    return (
      <Tooltip title={`Play Video • ${rawName}`} placement="top">
        <Box
          onClick={() => toast.info('Playing Video', { description: `Streaming ${rawName}...` })}
          sx={{
            position: 'relative',
            width: 150,
            height: 90,
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            cursor: 'pointer',
            my: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            },
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              bgcolor: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Play size={16} weight="fill" style={{ marginLeft: 2 }} />
          </Box>

          <Typography
            sx={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            MP4 • 01:24
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  // 3. FILE / DOCUMENT / FIGMA STACKED COMPACT PREVIEW (Exact Image 14 Mini Version)
  return (
    <>
      <Tooltip title={`Download & Preview ${rawName}`} placement="top">
        <Box
          onClick={() => setOpenLightbox(true)}
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            my: 0.8,
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': {
              '& .back-card': { transform: 'rotate(-10deg) translateX(-6px)' },
              '& .front-card': { transform: 'rotate(1deg) translateY(-2px)', boxShadow: '0 10px 22px rgba(225, 29, 72, 0.35)' },
              '& .download-btn': { transform: 'scale(1.15)', bgcolor: '#FFFFFF' },
            },
          }}
        >
          {/* Mini 3D Stacked Container */}
          <Box
            sx={{
              position: 'relative',
              width: 68,
              height: 82,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5,
            }}
          >
            {/* Back Card */}
            <Box
              className="back-card"
              sx={{
                position: 'absolute',
                width: 52,
                height: 66,
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                transform: 'rotate(-6deg) translateX(-4px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.2s ease',
              }}
            />

            {/* Front Card */}
            <Box
              className="front-card"
              sx={{
                position: 'relative',
                width: 55,
                height: 70,
                borderRadius: '9px',
                background: getGradient(extText),
                boxShadow: '0 8px 18px rgba(225, 29, 72, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
              }}
            >
              {/* Folded Dog-Ear Corner */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 13,
                  height: 13,
                  bgcolor: 'rgba(255, 255, 255, 0.45)',
                  borderRadius: '0 0 0 4px',
                }}
              />

              {/* Extension Badge */}
              <Typography
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0.03em',
                  textShadow: '0 1px 4px rgba(0,0,0,0.25)',
                }}
              >
                {extText}
              </Typography>
            </Box>

            {/* Circular Download Action Button */}
            <Box
              className="download-btn"
              onClick={handleDownload}
              sx={{
                position: 'absolute',
                bottom: 2,
                left: 2,
                zIndex: 5,
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                transition: 'all 0.18s ease',
              }}
            >
              <DownloadSimple size={12} weight="bold" />
            </Box>
          </Box>

          {/* Compact Filename Subtitle */}
          <Typography
            noWrap
            sx={{
              fontSize: '0.72rem',
              fontWeight: 650,
              color: '#475569',
              maxWidth: 130,
            }}
          >
            {rawName}
          </Typography>
        </Box>
      </Tooltip>

      {/* File Specification Lightbox Modal */}
      <Dialog open={openLightbox} onClose={() => setOpenLightbox(false)} maxWidth="xs">
        <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={18} color="#38BDF8" weight="bold" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{rawName}</Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpenLightbox(false)} sx={{ color: '#FFFFFF' }}><X size={16} /></IconButton>
        </Box>
        <DialogContent sx={{ p: 2.5, bgcolor: '#FFFFFF' }}>
          <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, mb: 1 }}>
            File Details:
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
            Format: {extText} Document
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
            Size: 1.4 MB • Attachment #58
          </Typography>
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{ bgcolor: '#2563EB', color: '#FFFFFF', width: '100%', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, py: 0.8 }}
          >
            Download File
          </IconButton>
        </DialogContent>
      </Dialog>
    </>
  );
}
