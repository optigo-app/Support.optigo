'use client';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  Chip,
  Skeleton,
  Button,
} from '@mui/material';
import {
  FadersHorizontal,
  PencilSimpleLine,
} from '@phosphor-icons/react';
import { getStatusColor } from '../../libs/data';

const ITEM_HEIGHT = 74; // Precise height per ticket row
const OVERSCAN = 5;     // Extra items above and below viewport

export default function DirectMessagesSidebar({
  threads = [],
  activeThreadId,
  onSelectThread,
  searchQuery = '',
  selectedCompany = 'all',
  onSelectCompany,
  isLoading = false,
}) {
  const sidebarWidth = 320;
  const [filterMode, setFilterMode] = useState('all');
  const scrollContainerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // 1. High-Performance Memoized Filtering over 15,000+ items
  const filteredThreads = useMemo(() => {
    if (!threads || threads.length === 0) return [];
    if (filterMode === 'unread') {
      return threads.filter((t) => t.unread);
    }
    return threads;
  }, [threads, filterMode]);

  // Caller frequency map
  const callerCountMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < threads.length; i++) {
      const t = threads[i];
      const caller = (t.callBy || t.name || '').trim().toLowerCase();
      if (caller) {
        map.set(caller, (map.get(caller) || 0) + 1);
      }
    }
    return map;
  }, [threads]);

  // 2. Measure container height on mount/resize
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateHeight = () => {
      setContainerHeight(el.clientHeight || 600);
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 3. 60 FPS Scroll Listener using requestAnimationFrame
  const onScroll = useCallback((e) => {
    const top = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      setScrollTop(top);
    });
  }, []);

  // 4. Calculate Virtual Slice (Only ~15-20 items attached to DOM!)
  const totalCount = filteredThreads.length;
  const totalHeight = totalCount * ITEM_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    totalCount,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleItems = useMemo(() => {
    return filteredThreads.slice(startIndex, endIndex);
  }, [filteredThreads, startIndex, endIndex]);

  const offsetY = startIndex * ITEM_HEIGHT;

  // 5. Event Delegation for instantaneous row clicks
  const handleListClick = useCallback(
    (e) => {
      const button = e.target.closest('[data-thread-id]');
      if (button && onSelectThread) {
        const id = button.getAttribute('data-thread-id');
        if (id) {
          onSelectThread(id);
        }
      }
    },
    [onSelectThread]
  );

  return (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header: Title + Total Calls Count Badge + Filter + New */}
      <Box
        sx={{
          height: 48,                       
          minHeight: 48,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Box
          onClick={() => onSelectCompany && onSelectCompany('all')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: selectedCompany !== 'all' ? 'pointer' : 'default',
            p: 0.4,
            borderRadius: '6px',
            transition: 'background-color 0.15s ease',
            '&:hover': {
              bgcolor: selectedCompany !== 'all' ? '#F1F5F9' : 'transparent',
            },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              fontSize: '0.98rem',
              color: '#111827',
              letterSpacing: '-0.01em',
            }}
          >
            All Calls
          </Typography>
          <Chip
            label={totalCount > 999 ? `${(totalCount / 1000).toFixed(1)}k` : totalCount}
            size="small"
            sx={{
              height: 20,
              fontSize: 10.5,
              fontWeight: 750,
              bgcolor: '#F1F5F9',
              color: '#475569',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Filter unread">
            <IconButton
              size="small"
              onClick={() => setFilterMode(filterMode === 'all' ? 'unread' : 'all')}
              sx={{ color: filterMode === 'unread' ? '#6900C6' : '#6B7280', p: 0.5, borderRadius: '4px' }}
            >
              <FadersHorizontal size={17} weight={filterMode === 'unread' ? 'bold' : 'regular'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="New message">
            <IconButton
              size="small"
              sx={{
                color: '#374151',
                bgcolor: '#F3F4F6',
                p: 0.5,
                borderRadius: '4px',
                '&:hover': { bgcolor: '#EDE9FE', color: '#6900C6' },
              }}
            >
              <PencilSimpleLine size={16} weight="bold" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Active Company Filter Banner */}
      {selectedCompany !== 'all' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.6,
            bgcolor: '#F5F3FF',
            borderBottom: '1px solid #EDE9FE',
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 650, color: '#6900C6' }}>
            Company: <Box component="span" sx={{ fontWeight: 800 }}>{selectedCompany}</Box>
          </Typography>
          <Chip
            label="Clear"
            size="small"
            onClick={() => onSelectCompany && onSelectCompany('all')}
            sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: '#FFFFFF', color: '#6900C6', cursor: 'pointer' }}
          />
        </Box>
      )}

      {/* High-Performance Virtual Scroll Container (Native 60fps smooth scrolling) */}
      <Box
        ref={scrollContainerRef}
        onScroll={onScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
        }}
      >
        {isLoading ? (
          <List disablePadding>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ListItem key={i} disablePadding sx={{ px: 1.5, py: 1.2, borderBottom: '1px solid #F8FAFC' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, width: '100%' }}>
                  <Skeleton variant="rounded" width={32} height={32} animation="wave" sx={{ borderRadius: '6px', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                      <Skeleton variant="text" width="55%" height={16} animation="wave" />
                      <Skeleton variant="text" width={35} height={12} animation="wave" />
                    </Box>
                    <Skeleton variant="text" width="40%" height={12} animation="wave" sx={{ mb: 0.4 }} />
                    <Skeleton variant="text" width="85%" height={14} animation="wave" />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : totalCount === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#94A3B8' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569', mb: 0.5 }}>
              No calls found
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: '#64748B', mb: 1.5, display: 'block' }}>
              No calls match the active filters.
            </Typography>
            {onSelectCompany && selectedCompany && selectedCompany !== 'all' && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => onSelectCompany('all')}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  borderColor: '#CBD5E1',
                  color: '#6900C6',
                  '&:hover': { borderColor: '#6900C6', bgcolor: '#F3E8FF' },
                }}
              >
                Clear Company Filter
              </Button>
            )}
          </Box>
        ) : (
          <Box
            onClick={handleListClick}
            sx={{
              height: `${totalHeight}px`,
              position: 'relative',
              width: '100%',
            }}
          >
            <Box
              sx={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {visibleItems.map((thread, index) => {
                const actualIndex = startIndex + index;
                const uniqueKey = thread.id ? `${thread.id}-${actualIndex}` : `thread-${actualIndex}`;
                const isActive =
                  thread.id === activeThreadId ||
                  String(thread.sr) === String(activeThreadId) ||
                  `call-${thread.sr}` === activeThreadId;
                const callerKey = (thread.callBy || thread.name || '').trim().toLowerCase();
                const callerTotalCalls = callerCountMap.get(callerKey) || 1;
                const titleText =
                  thread?.rawRecord?.description ||
                  thread?.description ||
                  thread?.lastMessage ||
                  thread?.name ||
                  'No Title';

                return (
                  <Box
                    key={uniqueKey}
                    data-thread-id={thread.id}
                    onClick={() => {
                      if (onSelectThread) {
                        onSelectThread(thread.id);
                      }
                    }}
                    sx={{
                      height: `${ITEM_HEIGHT}px`,
                      p: 1.1,
                      px: 1.2,
                      bgcolor: isActive ? '#EFD7FF' : 'transparent',
                      borderBottom: '1px solid #F1F5F9',
                      borderLeft: isActive ? '3.5px solid #6900C6' : '3.5px solid transparent',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.2,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'background-color 0.15s ease, border-left 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? '#EFD7FF' : '#F8FAFC',
                      },
                    }}
                  >
                    {/* Thread Avatar */}
                    <Box sx={{ position: 'relative', flexShrink: 0, mt: 0.2 }}>
                      <Avatar
                        sx={{
                          width: 35,
                          height: 35,
                          borderRadius: '50px',
                          bgcolor: '#D2C9F8',
                          color: '#6900C6',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {(thread.name || thread.company || 'C').charAt(0).toUpperCase()}
                      </Avatar>

                      {/* Online green indicator */}
                      {thread.online && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -1,
                            right: -1,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#10B981',
                            border: '1.5px solid #FFFFFF',
                          }}
                        />
                      )}

                      {/* Unread indicator dot */}
                      {thread.unread && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            bgcolor: '#6900C6',
                            border: '1.5px solid #FFFFFF',
                            boxShadow: '0 0 5px rgba(105, 0, 198, 0.6)',
                          }}
                        />
                      )}
                    </Box>

                    {/* Thread Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Line 1: Title & Time */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0, maxWidth: 180 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: thread.unread ? 800 : 700,
                              color: '#0F172A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {titleText}
                          </Typography>

                          {callerTotalCalls > 1 && (
                            <Chip
                              label={`${callerTotalCalls}`}
                              size="small"
                              title={`${callerTotalCalls} calls from this person`}
                              sx={{
                                height: 16,
                                fontSize: '0.62rem',
                                fontWeight: 750,
                                bgcolor: '#EDE9FE',
                                color: '#6900C6',
                                px: 0.2,
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.68rem',
                              color: thread.unread ? '#6900C6' : '#94A3B8',
                              fontWeight: thread.unread ? 800 : 500,
                            }}
                          >
                            {thread.timestamp || '00:00'}
                          </Typography>
                          {thread.unread && (
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: '#6900C6',
                                boxShadow: '0 0 0 2px #EDE9FE',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Line 2: Module/Topic & Status Tag */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 11,
                            color: '#475569',
                            fontWeight: 650,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 130,
                          }}
                        >
                          {thread.topicRaisedBy && thread.topicRaisedBy.toLowerCase() !== (thread.company || '').toLowerCase()
                            ? thread.topicRaisedBy
                            : thread.appname || (thread.sr ? `Call #${thread.sr}` : thread.company)}
                        </Typography>

                        {/* Status chip */}
                        {thread.status && (() => {
                          const { color } = getStatusColor(thread.status);
                          const isGreen = color === 'success' || thread.status === 'Solved' || thread.estatus === 'Completed';
                          const isRed = color === 'error' || thread.estatus === 'Running';
                          const isBlue = color === 'info' || color === 'primary';
                          return (
                            <Chip
                              label={thread.status}
                              size="small"
                              sx={{
                                height: 15,
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                px: 0.2,
                                bgcolor: isGreen ? '#DCFCE7' : isRed ? '#FEE2E2' : isBlue ? '#E0F2FE' : '#FEF3C7',
                                color: isGreen ? '#15803D' : isRed ? '#DC2626' : isBlue ? '#0369A1' : '#D97706',
                              }}
                            />
                          );
                        })()}
                      </Box>

                      {/* Line 3: Caller / Company Name */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color: isActive ? '#374151' : '#64748B',
                          lineHeight: 1.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                        }}
                      >
                        {thread.name}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
