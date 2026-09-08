'use client';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Chip, Collapse, Skeleton, IconButton, Tooltip } from '@mui/material';
import SimpleBar from './SimpleBar';
import { CaretDown, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import MessageItem from './MessageItem';

export default function MessageList({ messages = [], isLoading = false }) {
  const simpleBarRef = useRef(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const toggleGroup = (dateGroup) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [dateGroup]: !prev[dateGroup],
    }));
  };

  // Attach scroll listener to SimpleBar scroll element
  useEffect(() => {
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      setShowScrollTop(scrollTop > 150);
      setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger initial check
    handleScroll();

    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [messages]);

  // Auto-scroll to bottom when messages update or finish loading
  const prevMsgLengthRef = useRef(messages.length);
  useEffect(() => {
    if (isLoading) return;
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;

    const isNewMsg = messages.length > prevMsgLengthRef.current;
    prevMsgLengthRef.current = messages.length;

    const performScroll = () => {
      if (!scrollEl) return;
      scrollEl.scrollTo({
        top: scrollEl.scrollHeight,
        behavior: isNewMsg ? 'smooth' : 'auto',
      });
    };

    const rAF = requestAnimationFrame(performScroll);
    const timer = setTimeout(performScroll, 80);

    return () => {
      cancelAnimationFrame(rAF);
      clearTimeout(timer);
    };
  }, [messages, isLoading]);

  const scrollToTop = useCallback(() => {
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (scrollEl) {
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (scrollEl) {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  // Group messages by dateGroup preserving chronological sorted order
  const groupedMessages = useMemo(() => {
    const groups = {};
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const group = msg.dateGroup || 'Today';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(msg);
    }
    return groups;
  }, [messages]);

  return (
    <Box sx={{ flex: 1, height: '100%', overflow: 'hidden', bgcolor: '#FFFFFF', position: 'relative' }}>
      {/* Centered Bottom Floating Glassmorphism Icon Buttons (Before Input Container) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          pointerEvents: 'none',
        }}
      >
        {showScrollTop && (
          <Tooltip title="Jump to Top" arrow placement="top">
            <IconButton
              size="small"
              onClick={scrollToTop}
              sx={{
                pointerEvents: 'auto',
                width: 36,
                height: 36,
                bgcolor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                color: '#6900C6',
                boxShadow: '0 8px 24px -4px rgba(105, 0, 198, 0.18), 0 2px 6px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#F3E8FF',
                  borderColor: '#C4B5FD',
                  color: '#6900C6',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px -4px rgba(105, 0, 198, 0.28), 0 4px 10px rgba(0, 0, 0, 0.08)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(0.95)',
                },
              }}
            >
              <ArrowUp size={16} weight="bold" />
            </IconButton>
          </Tooltip>
        )}

        {showScrollBottom && (
          <Tooltip title="Jump to Latest" arrow placement="top">
            <IconButton
              size="small"
              onClick={scrollToBottom}
              sx={{
                pointerEvents: 'auto',
                width: 36,
                height: 36,
                bgcolor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                color: '#0284C7',
                boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.18), 0 2px 6px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#E0F2FE',
                  borderColor: '#BAE6FD',
                  color: '#0284C7',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px -4px rgba(2, 132, 199, 0.28), 0 4px 10px rgba(0, 0, 0, 0.08)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(0.95)',
                },
              }}
            >
              <ArrowDown size={16} weight="bold" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Main Conversation Stream Scroll Container */}
      <SimpleBar ref={simpleBarRef} style={{ height: '100%', maxHeight: '100%' }}>
        {isLoading ? (
          <Box sx={{ py: 2.5, px: 3, display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', boxSizing: 'border-box' }}>
            {/* Date divider skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <Skeleton variant="rounded" width={160} height={24} animation="wave" sx={{ borderRadius: '12px' }} />
            </Box>

            {/* Left-side caller item skeleton */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
              <Skeleton variant="circular" width={34} height={34} animation="wave" sx={{ flexShrink: 0 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, maxWidth: { xs: '100%', md: 620 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant="text" width={120} height={18} animation="wave" />
                  <Skeleton variant="text" width={60} height={14} animation="wave" />
                </Box>

                {/* Call Log Card Skeleton */}
                <Box
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    p: 2,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    width: '100%',
                  }}
                >
                  {/* Card Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="circular" width={22} height={22} animation="wave" />
                      <Skeleton variant="text" width={180} height={20} animation="wave" />
                    </Box>
                    <Skeleton variant="rounded" width={65} height={22} animation="wave" sx={{ borderRadius: '12px' }} />
                  </Box>

                  {/* Caller & Receiver Grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, p: 1.2, bgcolor: '#F8FAFC', borderRadius: '6px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="circular" width={28} height={28} animation="wave" />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="40%" height={12} animation="wave" />
                        <Skeleton variant="text" width="70%" height={16} animation="wave" />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="circular" width={28} height={28} animation="wave" />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="40%" height={12} animation="wave" />
                        <Skeleton variant="text" width="70%" height={16} animation="wave" />
                      </Box>
                    </Box>
                  </Box>

                  {/* Requirement Box */}
                  <Box sx={{ p: 1.2, bgcolor: '#F1F5F9', borderRadius: '6px' }}>
                    <Skeleton variant="text" width="30%" height={12} animation="wave" />
                    <Skeleton variant="text" width="90%" height={18} animation="wave" />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(groupedMessages).map(([dateGroup, msgs]) => {
              const isCollapsed = Boolean(collapsedGroups[dateGroup]);

              return (
                <Box key={dateGroup} sx={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Date Separator Pill (Clickable & Collapsible) */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      my: 2,
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: 24,
                        right: 24,
                        height: '1px',
                        bgcolor: '#E5E7EB',
                        zIndex: 1,
                      },
                    }}
                  >
                    <Chip
                      onClick={() => toggleGroup(dateGroup)}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <span>{dateGroup}</span>
                          {isCollapsed && (
                            <Box component="span" sx={{ fontSize: 10, color: '#6900C6', fontWeight: 600 }}>
                              ({msgs.length} hidden)
                            </Box>
                          )}
                          <CaretDown
                            size={11}
                            weight="bold"
                            color="#64748B"
                            style={{
                              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </Box>
                      }
                      size="small"
                      sx={{
                        position: 'relative',
                        zIndex: 2,
                        bgcolor: isCollapsed ? '#F5F3FF' : '#FFFFFF',
                        border: isCollapsed ? '1px solid #DDD6FE' : '1px solid #E5E7EB',
                        color: isCollapsed ? '#6900C6' : '#334155',
                        fontWeight: 700,
                        fontSize: 11,
                        height: 24,
                        px: 0.8,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: '#F3E8FF',
                          borderColor: '#C4B5FD',
                        },
                      }}
                    />
                  </Box>

                  {/* Collapsible Messages inside this date group */}
                  <Collapse in={!isCollapsed} timeout={250} unmountOnExit={false}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {msgs.map((msg) => (
                        <MessageItem key={msg.id} message={msg} />
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}
      </SimpleBar>
    </Box>
  );
}
