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
  Buildings,
  CaretLeft,
  CaretRight,
  SidebarSimple,
  Headset,
  DeviceMobile,
  Desktop,
} from '@phosphor-icons/react';
import { getStatusColor } from '../../libs/data';
import SourceBadge from './utils/SourceBadge';

const neoColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Mint
  '#FFE66D', // Yellow
  '#A06CD5', // Purple
  '#FF9F1C', // Orange
  '#2EC4B6', // Teal
  '#FF90E8', // Light Pink
  '#90A8ED', // Periwinkle
];

const getNeoColor = (str) => {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return neoColors[hash % neoColors.length];
};

const ITEM_HEIGHT = 84; // Precise height per ticket row
const OVERSCAN = 5;     // Extra items above and below viewport

export default function DirectMessagesSidebar({
  open = true,
  onClose,
  onOpen,
  isCompaniesOpen = true,
  onOpenCompanies,
  threads = [],
  activeThreadId,
  onSelectThread,
  searchQuery = '',
  selectedCompany = 'all',
  onSelectCompany,
  isLoading = false,
}) {
  const sidebarWidth = 390;
  const [filterMode, setFilterMode] = useState('all');
  const scrollContainerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // 1. High-Performance Memoized Filtering over 15,000+ items
  const filteredThreads = useMemo(() => {
    if (!threads || threads.length === 0) return [];

    let result = threads;
    if (filterMode === 'unread') {
      result = result.filter((t) => t.unread);
    }

    // Sort by recent messages (WhatsApp style shuffle to top)
    result = [...result].sort((a, b) => {
      const getThreadTime = (t) => {
        if (!t) return 0;
        let maxTime = 0;

        const parseDT = (dateStr, timeStr) => {
          let d = String(dateStr || '').trim();
          let tm = String(timeStr || '').trim();
          if (!d && !tm) return 0;

          // If timeStr is actually a full ISO string (which happens for comments)
          if (tm.includes('T') && tm.length > 10) {
            const dt = new Date(tm);
            if (!isNaN(dt.getTime())) return dt.getTime();
          }

          let year = 1970;
          let month = 0;
          let day = 1;

          if (d) {
            const parts = d.split(/[-/]/);
            if (parts.length === 3) {
              if (parts[0].length === 4) { // YYYY-MM-DD
                year = parseInt(parts[0], 10);
                month = parseInt(parts[1], 10) - 1;
                day = parseInt(parts[2], 10);
              } else { // DD-MM-YYYY
                year = parseInt(parts[2], 10);
                month = parseInt(parts[1], 10) - 1;
                day = parseInt(parts[0], 10);
              }
            } else {
              const fallback = new Date(d);
              if (!isNaN(fallback.getTime())) {
                year = fallback.getFullYear();
                month = fallback.getMonth();
                day = fallback.getDate();
              }
            }
          }

          let hours = 0;
          let minutes = 0;

          if (tm) {
            const timeMatch = tm.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/);
            if (timeMatch) {
              hours = parseInt(timeMatch[1], 10);
              minutes = parseInt(timeMatch[2], 10);
              const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
            }
          }

          const dt = new Date(year, month, day, hours, minutes, 0, 0);
          return isNaN(dt.getTime()) ? 0 : dt.getTime();
        };

        // 1. Base call time
        maxTime = Math.max(maxTime, parseDT(t.date || t.rawRecord?.date || t.rawRecord?.callStart, t.timestamp || t.rawRecord?.time));

        // 2. Comments time (new messages)
        if (t.comments && Array.isArray(t.comments)) {
          t.comments.forEach(c => {
            let cTime = 0;
            if (c.CreatedDate || c.createdDate) {
              cTime = new Date(c.CreatedDate || c.createdDate).getTime();
            }
            if (!cTime || isNaN(cTime)) {
              cTime = parseDT(c.date || c.created_at || c.createdAt, c.time || c.timestamp);
            }
            if (cTime && !isNaN(cTime) && cTime > maxTime) {
              maxTime = cTime;
            }
          });
        }

        return maxTime || parseInt(t.sr || String(t.id).replace(/\D/g, '') || 0, 10);
      };

      return getThreadTime(b) - getThreadTime(a);
    });

    return result;
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

  // 6. Auto-scroll virtualized container to active thread
  useEffect(() => {
    if (!activeThreadId || filteredThreads.length === 0 || !scrollContainerRef.current) return;
    const targetIndex = filteredThreads.findIndex(
      (t) =>
        t.id === activeThreadId ||
        String(t.sr) === String(activeThreadId) ||
        `call-${t.sr}` === String(activeThreadId)
    );
    if (targetIndex >= 0) {
      const targetScrollTop = targetIndex * ITEM_HEIGHT;
      const currentScrollTop = scrollContainerRef.current.scrollTop;
      const containerH = scrollContainerRef.current.clientHeight || 600;

      // Only scroll if out of current visible bounds
      if (
        targetScrollTop < currentScrollTop ||
        targetScrollTop > currentScrollTop + containerH - ITEM_HEIGHT
      ) {
        const newTop = Math.max(0, targetScrollTop - Math.floor(containerH / 3));
        scrollContainerRef.current.scrollTo({
          top: newTop,
          behavior: 'smooth',
        });
        setScrollTop(newTop);
      }
    }
  }, [activeThreadId, filteredThreads]);

  return (
    <Box
      sx={{
        width: open ? sidebarWidth : 0,
        minWidth: open ? sidebarWidth : 0,
        maxWidth: open ? sidebarWidth : 0,
        bgcolor: '#FFFFFF',
        borderRight: open ? '1px solid #E5E7EB' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header: Title + Total Calls Count Badge + Filter + New */}
        <Box
          sx={{
            height: 48,
            minHeight: 48,
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            {/* If Companies sidebar is collapsed, offer button to reopen it */}
            {onOpenCompanies && !isCompaniesOpen && (
              <Tooltip title="Show Companies Sidebar">
                <IconButton
                  size="small"
                  onClick={onOpenCompanies}
                  sx={{
                    p: 0.5,
                    color: '#6900C6',
                    bgcolor: '#EDE9FE',
                    borderRadius: '6px',
                    '&:hover': { bgcolor: '#DDD6FE' },
                  }}
                >
                  <Buildings size={15} weight="bold" />
                </IconButton>
              </Tooltip>
            )}

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
          </Box>

          {/* Right Header Action: Collapse button */}
          {onClose && (
            <Tooltip title="Collapse Calls Sidebar">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  p: 0.5,
                  color: '#64748B',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#F1F5F9', color: '#6900C6' },
                }}
              >
                <CaretLeft size={16} weight="bold" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

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
            mt: 0.5
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
            <Box sx={{ p: 2, textAlign: 'center', color: '#94A3B8' }}>
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
                  const titleText = thread?.description || thread?.rawRecord?.description || 'No Title';
                  const lastMessageText = thread?.lastMessage || thread?.description || thread?.rawRecord?.description || 'No recent messages';

                  const avatarText = (thread.name || thread.company || 'C').charAt(0).toUpperCase();
                  const avatarColor = getNeoColor(thread.name || thread.company || 'Unknown');

                  const outlineColor = '#0F172A';
                  const shadowColor = '#0F172A';
                  const shadowOffset = thread.unread ? '-3px 3px' : '-2.5px 2.5px';

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
                        height: `${ITEM_HEIGHT - 6}px`,
                        mb: '4px',
                        mx: 0.5,
                        p: 1.2,
                        px: 1.5,
                        borderRadius: '12px',
                        bgcolor: isActive ? '#F1F5F9' : thread.unread ? '#F8FAFC' : 'transparent',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.2,
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: isActive ? '#E2E8F0' : '#F1F5F9',
                        },
                      }}
                    >
                      {/* Neobrutalist Avatar */}
                      <Box sx={{ position: 'relative', flexShrink: 0, mt: 0.2 }}>
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            bgcolor: avatarColor,
                            color: '#0F172A',
                            fontSize: 17,
                            fontWeight: 900,
                            border: `1.5px solid ${outlineColor}`,
                            boxShadow: `${shadowOffset} 0px ${shadowColor}`,
                            transition: 'all 0.2s ease',
                            transform: 'rotate(0deg)',
                            '&:hover': {
                              transform: 'scale(1.05) rotate(-5deg)',
                            }
                          }}
                        >
                          {avatarText}
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
                      </Box>

                      {/* Thread Content */}
                      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {/* Line 1: Header (Title + Time) */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.1, gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontSize: '0.86rem',
                              fontWeight: thread.unread ? 800 : 700,
                              color: '#0F172A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                            }}
                          >
                            {titleText}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.68rem',
                              color: thread.unread ? '#0F172A' : '#64748B',
                              fontWeight: thread.unread ? 800 : 500,
                              flexShrink: 0,
                            }}
                          >
                            {thread.timestamp || '00:00'}
                          </Typography>
                        </Box>

                        {/* Line 2: Company / Caller Name & Source Indicator */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: 11,
                              color: '#475569',
                              fontWeight: 650,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flexShrink: 1,
                            }}
                          >
                            {thread.name || thread.company || 'Unknown'}
                          </Typography>

                          {(() => {
                            const sourceVal = thread.topicRaisedBy || thread.rawRecord?.topicRaisedBy || "";
                            if (!sourceVal) return null;
                            return (
                              <SourceBadge
                                source={sourceVal}
                                iconSize={10}
                                labelSize="0.55rem"
                              />
                            );
                          })()}
                        </Box>

                        {/* Line 3: Latest Comment & Unread/Status Chip */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: 11,
                              color: thread.unread ? '#111827' : (isActive ? '#374151' : '#64748B'),
                              fontWeight: thread.unread ? 700 : 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                              mr: 1,
                            }}
                          >
                            {lastMessageText}
                          </Typography>

                          {/* Unread / New Message Chip */}
                          {thread.unread ? (
                            <Box
                              sx={{
                                height: 18,
                                px: 0.8,
                                borderRadius: '9px',
                                bgcolor: '#34c33b',
                                color: '#FFFFFF',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 1px 2px rgba(52, 195, 59, 0.3)'
                              }}
                            >
                              New
                            </Box>
                          ) : (
                            /* Status Chip if no new message */
                            thread.status && (() => {
                              const { color } = getStatusColor(thread.status);
                              const isGreen = color === 'success' || thread.status === 'Solved' || thread.estatus === 'Completed';
                              const isRed = color === 'error' || thread.estatus === 'Running';
                              const isBlue = color === 'info' || color === 'primary';
                              const dotColor = isGreen ? '#10B981' : isRed ? '#EF4444' : isBlue ? '#3B82F6' : '#F59E0B';

                              return (
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.6,
                                    height: 18,
                                    px: 0.8,
                                    borderRadius: '9px',
                                    fontSize: '0.62rem',
                                    fontWeight: 650,
                                    bgcolor: '#FFFFFF',
                                    color: '#0F172A',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.06)',
                                    border: '1px solid #E2E8F0',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dotColor }} />
                                  {thread.status}
                                </Box>
                              );
                            })()
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
