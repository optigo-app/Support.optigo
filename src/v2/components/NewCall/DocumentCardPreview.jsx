'use client';
import React, { useState } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, Dialog, DialogContent, Chip } from '@mui/material';
import {
  FileText,
  ArrowSquareOut,
  MagnifyingGlassPlus,
} from '@phosphor-icons/react';

export default function DocumentCardPreview({ docData, attachment }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const data = docData || attachment;
  if (!data) return null;

  const isImage = data.type === 'image' || Boolean(data.imgUrl);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          maxWidth: 520,
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          mt: 0.8,
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: '#CBD5E1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Top Header Bar: Icon, Title, Subtitle, and Open Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.2,
            px: 1.6,
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                bgcolor: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={18} color="#FFFFFF" weight="bold" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#0F172A', lineHeight: 1.2 }}>
                {data.title || data.filename || 'Document Attachment'}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 11, color: '#64748B' }}>
                {data.subTitle || (isImage ? 'System Attachment • Image' : 'Document')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Expand Preview">
              <IconButton size="small" onClick={() => setPreviewOpen(true)} sx={{ p: 0.4, color: '#64748B' }}>
                <MagnifyingGlassPlus size={16} weight="bold" />
              </IconButton>
            </Tooltip>
            {data.url && (
              <Tooltip title="Open External">
                <IconButton
                  size="small"
                  component="a"
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ p: 0.4, color: '#64748B' }}
                >
                  <ArrowSquareOut size={16} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Attachment Content Body */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize: 11.5,
            color: '#334155',
            lineHeight: 1.5,
          }}
        >
          {data.headerTitle && (
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#0F172A', mb: 0.8 }}>
              {data.headerTitle}
            </Typography>
          )}

          {(data.clientName || data.clientEmail || data.address || data.pan) && (
            <Box sx={{ mb: 1.2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#475569', textDecoration: 'underline', mb: 0.3 }}>
                Client Details:
              </Typography>
              <Box sx={{ pl: 0.5, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                {data.clientName && (
                  <Typography sx={{ fontSize: 11, color: '#334155' }}>
                    <Box component="span" sx={{ color: '#64748B' }}>Name: </Box>
                    {data.clientName}
                  </Typography>
                )}
                {data.clientEmail && (
                  <Typography sx={{ fontSize: 11, color: '#0284C7' }}>
                    <Box component="span" sx={{ color: '#64748B' }}>Email: </Box>
                    {data.clientEmail}
                  </Typography>
                )}
                {data.address && (
                  <Typography sx={{ fontSize: 11, color: '#334155' }}>
                    <Box component="span" sx={{ color: '#64748B' }}>Address: </Box>
                    {data.address}
                  </Typography>
                )}
                {data.pan && (
                  <Typography sx={{ fontSize: 11, color: '#334155' }}>
                    <Box component="span" sx={{ color: '#64748B' }}>PAN: </Box>
                    {data.pan}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {data.note && (
            <Box sx={{ mb: 1, p: 0.8, bgcolor: '#F8FAFC', borderRadius: '4px', border: '1px dashed #CBD5E1' }}>
              <Typography sx={{ fontSize: 10.5, color: '#475569', fontStyle: 'italic' }}>
                {data.note}
              </Typography>
            </Box>
          )}

          {Array.isArray(data.team) && data.team.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#475569', textDecoration: 'underline', mb: 0.3 }}>
                Team Members:
              </Typography>
              <Box sx={{ pl: 0.5, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                {data.team.map((member, idx) => (
                  <Typography key={idx} sx={{ fontSize: 11, color: '#334155' }}>
                    • {member}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {data.text && (
            <Typography sx={{ fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap', mt: 0.5 }}>
              {data.text}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Modal Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 2.5, bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileText size={20} color="#0284C7" weight="bold" />
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                {data.title || data.filename || 'Attachment Preview'}
              </Typography>
            </Box>
            {data.id && (
              <Chip label={`Attachment #${data.id}`} size="small" sx={{ bgcolor: '#EDE9FE', color: '#6900C6', fontWeight: 700 }} />
            )}
          </Box>

          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0F172A', mb: 1 }}>
              Document Content
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {data.text || data.description || 'No additional content provided.'}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
