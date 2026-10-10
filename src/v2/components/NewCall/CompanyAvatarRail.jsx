'use client';
import React, { useState, useMemo } from 'react';
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
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';

export default function CompanyAvatarRail({
  open = true,
  onClose,
  onOpen,
  isCallsOpen = true,
  onOpenCalls,
  companies = [],
  selectedCompany = 'all',
  onSelectCompany,
  onClearAll,
  totalCallsCount = 0,
  isLoading = false,
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' (expanded) | 'circle' (compact)

  const isListMode = viewMode === 'list';
  const targetWidth = isListMode ? 190 : 72;

  const sortedCompanies = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];
    return companies;
  }, [companies]);

  return (
    <Box
      sx={{
        width: open ? targetWidth : 0,
        minWidth: open ? targetWidth : 0,
        maxWidth: open ? targetWidth : 0,
        bgcolor: '#FFFFFF',
        borderRight: open ? '1px solid #E5E7EB' : 'none',
        borderTopLeftRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        height: '100%',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: targetWidth,
          minWidth: targetWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                {onOpenCalls && !isCallsOpen && (
                  <Tooltip title="Show Calls List">
                    <IconButton
                      size="small"
                      onClick={onOpenCalls}
                      sx={{ p: 0.4, color: '#6900C6', bgcolor: '#EDE9FE', borderRadius: '4px', '&:hover': { bgcolor: '#DDD6FE' } }}
                    >
                      <CaretRight size={15} weight="bold" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Compact Icon Rail">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('circle')}
                    sx={{ p: 0.4, color: '#64748B', '&:hover': { bgcolor: '#F1F5F9', color: '#6900C6' } }}
                  >
                    <SquaresFour size={15} weight="bold" />
                  </IconButton>
                </Tooltip>
                {onClose && (
                  <Tooltip title="Collapse Companies">
                    <IconButton
                      size="small"
                      onClick={onClose}
                      sx={{ p: 0.4, color: '#64748B', '&:hover': { bgcolor: '#F1F5F9', color: '#6900C6' } }}
                    >
                      <CaretLeft size={15} weight="bold" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
              <Tooltip title="Expand Companies">
                <IconButton
                  size="small"
                  onClick={() => setViewMode('list')}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    color: '#64748B',
                    '&:hover': { bgcolor: '#EDE9FE', color: '#6900C6', borderColor: '#C4B5FD' },
                  }}
                >
                  <SidebarSimple size={15} weight="bold" />
                </IconButton>
              </Tooltip>
              {onClose && (
                <Tooltip title="Collapse Companies">
                  <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                      width: 20,
                      height: 28,
                      p: 0,
                      color: '#94A3B8',
                      '&:hover': { color: '#6900C6' },
                    }}
                  >
                    <CaretLeft size={13} weight="bold" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {/* Main Content Area */}
        <Box sx={{
          flex: 1, width: '100%', overflow: 'hidden',
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mt: 1 }}>
                {/* All Companies item */}
                {(() => {
                  const isAllSelected = !selectedCompany || selectedCompany === 'all' || (Array.isArray(selectedCompany) && selectedCompany.length === 0);
                  return (
                    <Box
                      onClick={() => {
                        onSelectCompany('all');
                        if (onClearAll) onClearAll();
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.2,
                        py: 0.7,
                        mx: 0.8,
                        bgcolor: isAllSelected ? '#F1F5F9' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        borderRadius: "8px",
                        '&:hover': { bgcolor: isAllSelected ? '#E2E8F0' : '#F1F5F9' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <SquaresFour size={16} weight="bold" color={isAllSelected ? '#0F172A' : '#64748B'} />
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: isAllSelected ? 700 : 600,
                            color: isAllSelected ? '#0F172A' : '#334155',
                          }}
                        >
                          All Company
                        </Typography>
                      </Box>
                      <Chip
                        label={totalCallsCount > 999 ? `${(totalCallsCount / 1000).toFixed(1)}k` : totalCallsCount}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 750,
                          bgcolor: isAllSelected ? '#0F172A' : '#F1F5F9',
                          color: isAllSelected ? '#FFFFFF' : '#64748B',
                        }}
                      />
                    </Box>
                  );
                })()}

                {/* Company rows */}
                {sortedCompanies?.map((comp) => {
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
                        px: 1.2,
                        py: 0.5,
                        mx: 0.8,
                        borderRadius: "8px",
                        bgcolor: isSelected ? '#F1F5F9' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        '&:hover': { bgcolor: isSelected ? '#E2E8F0' : '#F1F5F9' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                        <Avatar
                          sx={{
                            width: 22,
                            height: 22,
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: comp.avatarColor || '#0F172A',
                            color: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        >
                          {comp.initial}
                        </Avatar>
                        <Typography
                          sx={{
                            fontSize: 11.5,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#0F172A' : '#334155',
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
                          bgcolor: isSelected ? '#E2E8F0' : '#F1F5F9',
                          color: isSelected ? '#0F172A' : '#64748B',
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: '100%', px: 0.5 }}>
                {/* All Companies Icon Button */}
                <Tooltip title="All Companies & Direct Messages" placement="right" arrow>
                  <Box
                    onClick={() => onSelectCompany('all')}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                      mt: 0.5,
                      px: 1,
                      py: 0.8,
                      mx: 0.5,
                      borderRadius: '8px',
                      bgcolor: selectedCompany === 'all' ? '#F1F5F9' : 'transparent',
                      transition: 'all 0.12s ease',
                      '&:hover': {
                        bgcolor: selectedCompany === 'all' ? '#E2E8F0' : '#F1F5F9',
                      },
                      width: '100%'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: selectedCompany === 'all' ? '#0F172A' : '#64748B',
                      }}
                    >
                      <SquaresFour size={24} weight={selectedCompany === 'all' ? 'fill' : 'regular'} />
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: selectedCompany === 'all' ? 700 : 500, color: '#0F172A' }}>
                      All
                    </Typography>
                  </Box>
                </Tooltip>
                {/* Company Circle Avatars */}
                {sortedCompanies.map((comp) => {
                  const norm = (s) => (s ? String(s).toLowerCase().replace(/[\s\-_]/g, '') : '');
                  const compNorm = norm(comp.name);
                  const isSelected = Array.isArray(selectedCompany)
                    ? selectedCompany.some((c) => norm(c) === compNorm || (comp.projectId && String(comp.projectId) === String(c)))
                    : ((typeof selectedCompany === 'string' || typeof selectedCompany === 'number') &&
                      (norm(selectedCompany) === compNorm || (comp.projectId && String(comp.projectId) === String(selectedCompany))));

                  const shortName = comp.name.length > 7 ? comp.name.slice(0, 6) + '...' : comp.name;

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
                      <Box
                        onClick={() => onSelectCompany(comp.projectId || comp.name)}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                          cursor: 'pointer',
                          position: 'relative',
                          px: 1,
                          py: 0.8,
                          mx: 0.5,
                          borderRadius: '8px',
                          bgcolor: isSelected ? '#F1F5F9' : 'transparent',
                          transition: 'all 0.12s ease',
                          '&:hover': {
                            bgcolor: isSelected ? '#E2E8F0' : '#F1F5F9',
                          },
                          width: '100%'
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '8px',
                            bgcolor: comp.avatarColor || '#0F172A',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 800,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          {comp.initial}
                        </Avatar>

                        <Typography sx={{ fontSize: 11, fontWeight: isSelected ? 700 : 500, color: '#0F172A', mt: 0.2 }}>
                          {shortName}
                        </Typography>

                        {/* Call count badge */}
                        {comp.count > 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              bgcolor: '#DC2626',
                              color: '#fff',
                              fontSize: 9,
                              fontWeight: 800,
                              height: 16,
                              minWidth: 16,
                              px: 0.5,
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 0 0 2px #FFFFFF',
                              zIndex: 2,
                            }}
                          >
                            {comp.count > 99 ? '99+' : comp.count}
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
    </Box>
  );
}
