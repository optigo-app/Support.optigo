'use client';
import React, { useState } from 'react';
import { Box, Typography, Tooltip, Dialog, DialogContent, IconButton } from '@mui/material';
import { DownloadSimple, X, FileText } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function StackedFileCardPreview({ attachment, filename, imgUrl, fileType }) {
  const [openPreview, setOpenPreview] = useState(false);

  const rawName = filename || attachment?.filename || attachment?.imgUrl || 'File.fig';

  // Extract file extension (e.g. FIG, PDF, PNG, MP4, DOCX, ZIP)
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

  // Gradient themes matching Image 14
  const getGradient = (ext) => {
    switch (ext) {
      case 'PDF':
        return 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)';
      case 'PNG':
      case 'JPG':
      case 'GIF':
      case 'WEBP':
        return 'linear-gradient(135deg, #38BDF8 0%, #0284C7 50%, #0369A1 100%)';
      case 'MP4':
      case 'MOV':
        return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)';
      case 'DOCX':
      case 'DOC':
        return 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
      case 'ZIP':
      case 'RAR':
        return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      case 'FIG':
      default:
        return 'linear-gradient(135deg, #FFA07A 0%, #EC4899 50%, #E11D48 100%)'; // Exact Image 14 Pink/Coral Gradient
    }
  };

  const extensionGradient = getGradient(extText);
  const mediaUrl = imgUrl || attachment?.imgUrl || attachment?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

  const handleDownload = (e) => {
    e.stopPropagation();
    toast.success(`Downloading ${rawName}`, {
      description: 'Saved to downloads folder...',
    });
  };

  return (
    <>
      <Tooltip title={`Preview & Download ${rawName}`} placement="top">
        <Box
          onClick={() => setOpenPreview(true)}
          sx={{
            position: 'relative',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 125,
            height: 145,
            cursor: 'pointer',
            my: 1,
            mx: 0.5,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            userSelect: 'none',
            '&:hover': {
              transform: 'translateY(-6px) scale(1.04)',
              '& .back-card': { transform: 'rotate(-12deg) translateX(-10px) translateY(-3px)' },
              '& .front-card': { transform: 'rotate(2deg)', boxShadow: '0 16px 32px rgba(225, 29, 72, 0.4)' },
              '& .download-btn': { transform: 'scale(1.18)', bgcolor: '#FFFFFF', boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)' },
            },
          }}
        >
          {/* 1. Back Tilted Gradient Card (Exact Image 11/14 Blue-Purple Card) */}
          <Box
            className="back-card"
            sx={{
              position: 'absolute',
              width: 92,
              height: 115,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
              transform: 'rotate(-7deg) translateX(-6px) translateY(2px)',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.25s ease',
            }}
          />

          {/* 2. Front Main Gradient Card with Folded Dog-Ear Corner */}
          <Box
            className="front-card"
            sx={{
              position: 'relative',
              width: 96,
              height: 120,
              borderRadius: '16px',
              background: extensionGradient,
              boxShadow: '0 12px 28px rgba(225, 29, 72, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              overflow: 'hidden',
            }}
          >
            {/* Sparkle Glow & Particle Texture */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                pointerEvents: 'none',
              }}
            />

            {/* Folded Dog-Ear Corner */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 20,
                height: 20,
                bgcolor: 'rgba(255, 255, 255, 0.45)',
                borderRadius: '0 0 0 6px',
                boxShadow: '-2px 2px 4px rgba(0,0,0,0.12)',
              }}
            />

            {/* Extension Bold Text Badge (FIG, PDF, PNG) */}
            <Typography
              sx={{
                fontSize: '1.45rem',
                fontWeight: 950,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                textShadow: '0 2px 10px rgba(0,0,0,0.25)',
                zIndex: 2,
              }}
            >
              {extText}
            </Typography>
          </Box>

          {/* 3. Floating Circular Download Button Overlapping Bottom-Left Corner */}
          <Box
            className="download-btn"
            onClick={handleDownload}
            sx={{
              position: 'absolute',
              bottom: 4,
              left: 4,
              zIndex: 5,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              transition: 'all 0.2s ease',
            }}
          >
            <DownloadSimple size={16} weight="bold" />
          </Box>
        </Box>
      </Tooltip>

      {/* Preview Dialog Lightbox Modal */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={20} color="#38BDF8" weight="bold" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              {rawName}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpenPreview(false)} sx={{ color: '#94A3B8' }}>
            <X size={18} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, textAlign: 'center', bgcolor: '#020617' }}>
          <Box
            component="img"
            src={mediaUrl}
            alt={rawName}
            sx={{
              maxWidth: '100%',
              maxHeight: '65vh',
              borderRadius: '12px',
              objectFit: 'contain',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
