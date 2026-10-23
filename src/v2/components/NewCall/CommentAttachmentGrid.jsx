'use client';
import React, { useEffect, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ArrowCounterClockwise, Eye, FileText, X } from '@phosphor-icons/react';
import DocumentPreviewer from '../../services/DocumentPreviewer';

const getExtension = (name = '') => {
  const cleanName = String(name).split(/[?#]/, 1)[0];
  const filename = cleanName.split(/[\\/]/).pop() || '';
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex > 0 && dotIndex < filename.length - 1
    ? filename.slice(dotIndex + 1).toUpperCase()
    : 'FILE';
};

function AttachmentCard({ attachment, onRemove, onRestore, onPreview }) {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    if (!attachment.file || typeof URL === 'undefined' || !URL.createObjectURL) {
      setObjectUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(attachment.file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment.file]);

  const src = attachment.url || objectUrl;
  const isImage = Boolean(
    attachment.file?.type?.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|bmp|avif|heic|heif)(?:[?#]|$)/i.test(attachment.name)
  );
  const extension = getExtension(attachment.name);
  const removed = Boolean(attachment.removed);

  return (
    <Box
      sx={{
        overflow: 'hidden',
        minWidth: 0,
        border: '1px solid',
        borderColor: removed ? '#FECACA' : '#E2E8F0',
        borderRadius: '12px',
        bgcolor: removed ? '#FFF7F7' : '#FFFFFF',
        opacity: removed ? 0.72 : 1,
        transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
        '&:hover': { borderColor: removed ? '#FCA5A5' : '#C4B5FD', boxShadow: '0 4px 14px rgba(15,23,42,0.08)', transform: 'translateY(-1px)' },
      }}
    >
      <Box
        role="button"
        tabIndex={src ? 0 : -1}
        onClick={() => src && !removed && onPreview(attachment, src)}
        onKeyDown={(event) => {
          if (src && !removed && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onPreview(attachment, src);
          }
        }}
        sx={{
          position: 'relative',
          aspectRatio: '4 / 3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: src && !removed ? 'pointer' : 'default',
          bgcolor: isImage ? '#F1F5F9' : '#F8FAFC',
        }}
      >
        {isImage && src ? (
          <Box component="img" src={src} alt={attachment.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
            <FileText size={28} weight="duotone" />
            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>{extension}</Typography>
          </Box>
        )}
        {removed && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.68)' }}>
            <Typography sx={{ px: 1, py: 0.4, borderRadius: 5, bgcolor: '#FEE2E2', color: '#B91C1C', fontSize: 10, fontWeight: 700 }}>
              Marked for removal
            </Typography>
          </Box>
        )}
        <Tooltip title={removed ? 'Restore attachment' : 'Remove attachment'}>
          <IconButton
            size="small"
            aria-label={removed ? `Restore ${attachment.name}` : `Remove ${attachment.name}`}
            onClick={(event) => {
              event.stopPropagation();
              removed ? onRestore(attachment) : onRemove(attachment);
            }}
            sx={{ position: 'absolute', top: 6, right: 6, width: 27, height: 27, bgcolor: '#FFFFFF', color: removed ? '#047857' : '#B91C1C', boxShadow: '0 1px 5px rgba(15,23,42,0.18)', '&:hover': { bgcolor: '#FFFFFF' } }}
          >
            {removed ? <ArrowCounterClockwise size={15} /> : <X size={15} weight="bold" />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ px: 1, py: 0.8, display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography title={attachment.name} noWrap sx={{ fontSize: 11, fontWeight: 650, color: '#334155' }}>
            {attachment.name}
          </Typography>
          <Typography sx={{ fontSize: 9.5, color: attachment.isNew ? '#6D28D9' : '#94A3B8' }}>
            {attachment.isNew ? 'New file' : 'Attached'}
          </Typography>
        </Box>
        <Tooltip title="Preview attachment">
          <span>
            <IconButton size="small" disabled={!src || removed} aria-label={`Preview ${attachment.name}`} onClick={() => onPreview(attachment, src)} sx={{ width: 25, height: 25, color: '#64748B' }}>
              <Eye size={14} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function CommentAttachmentGrid({ attachments = [], onRemove, onRestore }) {
  const [preview, setPreview] = useState(null);

  if (!attachments.length) return null;

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(138px, 1fr))', gap: 1, width: '100%' }}>
        {attachments.map((attachment) => (
          <AttachmentCard
            key={attachment.key}
            attachment={attachment}
            onRemove={onRemove}
            onRestore={onRestore}
            onPreview={(attachment, url) => setPreview({ ...attachment, url })}
          />
        ))}
      </Box>
      {preview && (
        <DocumentPreviewer
          files={[{ name: preview.name, url: preview.url }]}
          currentIndex={0}
          isOpen
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
