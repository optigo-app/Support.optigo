'use client';
import React, { useState } from 'react';
import {
  Box,
  Tooltip,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Skeleton,
} from '@mui/material';
import SimpleBar from './SimpleBar';
import {
  SquaresFour,
  SidebarSimple,
  Buildings,
} from '@phosphor-icons/react';

export default function CompanyAvatarRail({
  companies = [],
  selectedCompany = 'all',
  onSelectCompany,
  totalCallsCount = 0,
  isLoading = false,
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' (expanded) | 'circle' (compact)

  const isListMode = viewMode === 'list';

  return (
    <Box
      sx={{
        width: isListMode ? 190 : 58,
        minWidth: isListMode ? 190 : 58,
        maxWidth: isListMode ? 190 : 58,
        bgcolor: '#F8FAFC',
        borderRight: '1px solid #E5E7EB',
        borderTopLeftRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        height: '100%',
        transition: 'width 0.2s ease, min-width 0.2s ease',
      }}
    >
      {/* Exact 48px Header aligned with Voice Calls and ChatHeader */}
      <Box
        sx={{
          height: 48,
          minHeight: 48,
          maxHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isListMode ? 'space-between' : 'center',
          px: isListMode ? 1.5 : 0.8,
          borderBottom: '1px solid #F1F5F9',
          bgcolor: '#FFFFFF',
        }}
      >
        {isListMode ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Buildings size={16} weight="bold" color="#6900C6" />
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                Companies
              </Typography>
            </Box>
            {/* <Tooltip title="Collapse Companies">
              <IconButton
                size="small"
                onClick={() => setViewMode('circle')}
                sx={{ p: 0.4, color: '#64748B', '&:hover': { bgcolor: '#F1F5F9', color: '#6900C6' } }}
              >
                <SidebarSimple size={16} weight="bold" />
              </IconButton>
            </Tooltip> */}
          </>
        ) : (
          <Tooltip title="Expand Companies">
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#64748B',
                '&:hover': { bgcolor: '#EDE9FE', color: '#6900C6', borderColor: '#C4B5FD' },
              }}
            >
              <SidebarSimple size={16} weight="bold" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, width: '100%', overflow: 'hidden', 
// p: isListMode ? 1 : 0.6

       }}>
        <SimpleBar style={{ height: '100%', maxHeight: '100%' }}>
          {isLoading ? (
            isListMode ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="circular" width={22} height={22} animation="wave" />
                    <Skeleton variant="rounded" width={90} height={16} animation="wave" sx={{ borderRadius: '4px' }} />
                    <Skeleton variant="rounded" width={24} height={16} animation="wave" sx={{ borderRadius: '10px', ml: 'auto' }} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2, py: 1 }}>
                <Skeleton variant="circular" width={36} height={36} animation="wave" />
                <Box sx={{ width: 24, height: '1px', bgcolor: '#E2E8F0', my: 0.3 }} />
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} variant="circular" width={36} height={36} animation="wave" />
                ))}
              </Box>
            )
          ) : isListMode ? (
            /* ============================================================== */
            /* 1. EXPANDED LIST VIEW (Full Company Names & Counts)            */
            /* ============================================================== */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              {/* All Companies item */}
              {(() => {
                const isAllSelected = !selectedCompany || selectedCompany === 'all' || (Array.isArray(selectedCompany) && selectedCompany.length === 0);
                return (
                  <Box
                    onClick={() => onSelectCompany('all')}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1,
                      py: 0.8,
                      bgcolor: isAllSelected ? '#EDE9FE' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderRadius:"0px",
                      '&:hover': { bgcolor: isAllSelected ? '#EDE9FE' : '#F1F5F9' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <SquaresFour size={16} weight="bold" color={isAllSelected ? '#6900C6' : '#64748B'} />
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: isAllSelected ? 800 : 600,
                          color: isAllSelected ? '#6900C6' : '#1E293B',
                        }}
                      >
                        All Calls
                      </Typography>
                    </Box>
                    <Chip
                      label={totalCallsCount > 999 ? `${(totalCallsCount / 1000).toFixed(1)}k` : totalCallsCount}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 750,
                        bgcolor: isAllSelected ? '#6900C6' : '#E2E8F0',
                        color: isAllSelected ? '#FFFFFF' : '#475569',
                      }}
                    />
                  </Box>
                );
              })()}

              {/* Company rows */}
              {companies?.map((comp) => {
                const norm = (s) => (s ? String(s).toLowerCase().replace(/[\s\-_]/g, '') : '');
                const compNorm = norm(comp.name);
                const isSelected = Array.isArray(selectedCompany)
                  ? selectedCompany.some((c) => norm(c) === compNorm || (comp.projectId && String(comp.projectId) === String(c)))
                  : ((typeof selectedCompany === 'string' || typeof selectedCompany === 'number') &&
                     (norm(selectedCompany) === compNorm || (comp.projectId && String(comp.projectId) === String(selectedCompany))));

                return (
                  <Box
                    key={comp.id}
                    onClick={() => onSelectCompany(comp.projectId || comp.name)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1,
                      py: 0.7,
                           borderRadius:"0px",
                      bgcolor: isSelected ? '#EDE9FE' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: isSelected ? '#EDE9FE' : '#F1F5F9' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                      <Avatar
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: 10,
                          fontWeight: 800,
                          bgcolor: comp.avatarColor || '#6900C6',
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}
                      >
                        {comp.initial}
                      </Avatar>
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#6900C6' : '#334155',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 100,
                        }}
                      >
                        {comp.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={comp.count}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 9.5,
                        fontWeight: 750,
                        bgcolor: isSelected ? '#DDD6FE' : '#F1F5F9',
                        color: isSelected ? '#6900C6' : '#64748B',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            /* ============================================================== */
            /* 2. COMPACT CIRCLE AVATARS VIEW                                 */
            /* ============================================================== */
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 }}>
              {/* All Companies Icon Button */}
              <Tooltip title="All Companies & Direct Messages" placement="right" arrow>
                <Box
                  onClick={() => onSelectCompany('all')}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: selectedCompany === 'all' ? '#6900C6' : '#F1F5F9',
                    color: selectedCompany === 'all' ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: selectedCompany === 'all' ? '0 0 0 2px #DDD6FE' : 'none',
                    '&:hover': {
                      bgcolor: selectedCompany === 'all' ? '#5300A0' : '#E2E8F0',
                    },
                  }}
                >
                  <SquaresFour size={18} weight={selectedCompany === 'all' ? 'fill' : 'bold'} />
                </Box>
              </Tooltip>

              <Box sx={{ width: 24, height: '1px', bgcolor: '#E2E8F0', my: 0.3 }} />

              {/* Company Circle Avatars */}
              {companies.map((comp) => {
                const norm = (s) => (s ? String(s).toLowerCase().replace(/[\s\-_]/g, '') : '');
                const compNorm = norm(comp.name);
                const isSelected = Array.isArray(selectedCompany)
                  ? selectedCompany.some((c) => norm(c) === compNorm || (comp.projectId && String(comp.projectId) === String(c)))
                  : ((typeof selectedCompany === 'string' || typeof selectedCompany === 'number') &&
                     (norm(selectedCompany) === compNorm || (comp.projectId && String(comp.projectId) === String(selectedCompany))));

                return (
                  <Tooltip
                    key={comp.id}
                    title={
                      <Box sx={{ p: 0.2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{comp.name}</Typography>
                        <Typography sx={{ fontSize: 10.5, color: '#CBD5E1' }}>{comp.count} calls recorded</Typography>
                      </Box>
                    }
                    placement="right"
                    arrow
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        onClick={() => onSelectCompany(comp.projectId || comp.name)}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: comp.avatarColor || '#6900C6',
                          color: '#FFFFFF',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: isSelected
                            ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${comp.avatarColor || '#6900C6'}`
                            : '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'all 0.15s ease',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 0 0 2px #FFFFFF, 0 0 0 3px ${comp.avatarColor || '#6900C6'}`,
                          },
                        }}
                      >
                        {comp.initial}
                      </Avatar>

                      {/* Call count badge */}
                      {comp.count > 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            bgcolor: '#1E293B',
                            color: '#FFFFFF',
                            fontSize: 8.5,
                            fontWeight: 800,
                            borderRadius: '10px',
                            px: 0.4,
                            py: 0.05,
                            border: '1.5px solid #F8FAFC',
                            lineHeight: 1,
                          }}
                        >
                          {comp.count}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </SimpleBar>
      </Box>
    </Box>
  );
}
