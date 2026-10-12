'use client';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Chip, Collapse, Skeleton, Button, Fade } from '@mui/material';
import SimpleBar from './SimpleBar';
import { CaretDown, ArrowDown } from '@phosphor-icons/react';
import MessageItem from './MessageItem';

// Silky smooth scroll animation using requestAnimationFrame and easeInOutCubic
function smoothScrollTo(element, target, duration = 400) {
  if (!element) return () => { };
  const start = element.scrollTop;
  const distance = target - start;
  if (Math.abs(distance) < 2) {
    element.scrollTop = target;
    return () => { };
  }

  const startTime = performance.now();

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  let animationFrameId;

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    element.scrollTop = Math.round(start + distance * ease);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      element.scrollTop = target;
    }
  };

  animationFrameId = requestAnimationFrame(step);
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}

export default function MessageList({ messages = [], isLoading = false }) {
  const simpleBarRef = useRef(null);
  const scrollAnimCancelRef = useRef(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
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
      setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
    };

    const handleUserInterrupt = () => {
      if (scrollAnimCancelRef.current) {
        scrollAnimCancelRef.current();
        scrollAnimCancelRef.current = null;
      }
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    scrollEl.addEventListener('wheel', handleUserInterrupt, { passive: true });
    scrollEl.addEventListener('touchmove', handleUserInterrupt, { passive: true });

    // Trigger initial check
    handleScroll();

    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
      scrollEl.removeEventListener('wheel', handleUserInterrupt);
      scrollEl.removeEventListener('touchmove', handleUserInterrupt);
      if (scrollAnimCancelRef.current) {
        scrollAnimCancelRef.current();
      }
    };
  }, [messages]);

  // Auto-scroll to bottom when messages update or finish loading
  const prevMsgLengthRef = useRef(messages.length);
  useEffect(() => {
    if (isLoading) return;
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;

    const isNewMsg = messages.length > prevMsgLengthRef.current;
    prevMsgLengthRef.current = messages.length;

    let timer;
    if (isNewMsg) {
      // Allow DOM to layout the newly mounted message, then smoothly glide into view
      timer = setTimeout(() => {
        if (!scrollEl) return;
        if (scrollAnimCancelRef.current) {
          scrollAnimCancelRef.current();
        }
        const target = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
        scrollAnimCancelRef.current = smoothScrollTo(scrollEl, target, 380);
      }, 50);
    } else {
      // Thread switch or initial fetch: instant position
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (scrollAnimCancelRef.current) {
        scrollAnimCancelRef.current();
      }
    };
  }, [messages, isLoading]);

  const scrollToBottom = useCallback(() => {
    const scrollEl = simpleBarRef.current?.getScrollElement();
    if (!scrollEl) return;

    if (scrollAnimCancelRef.current) {
      scrollAnimCancelRef.current();
    }

    const target = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
    const distance = Math.abs(target - scrollEl.scrollTop);
    // Smooth adaptive duration: snaps gracefully between 340ms and 550ms
    const duration = Math.min(550, Math.max(340, distance * 0.28));

    scrollAnimCancelRef.current = smoothScrollTo(scrollEl, target, duration);
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
      {/* Centered Bottom Floating "Latest Chat" Toolbar Pill Button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          pointerEvents: showScrollBottom ? 'auto' : 'none',
        }}
      >
        <Fade in={showScrollBottom} unmountOnExit>
          <Button
            disableElevation
            disableRipple
            onClick={scrollToBottom}
            startIcon={<ArrowDown size={14} weight="bold" color="#6900C6" />}
            sx={{
              px: 2,
              height: 34,
              borderRadius: '999px',
              bgcolor: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '-0.01em',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.1), 0 2px 6px -1px rgba(15, 23, 42, 0.06)',
              whiteSpace: 'nowrap',
              gap: 0.5,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#FFFFFF',
                color: '#6900C6',
                borderColor: '#CBD5E1',
                boxShadow: '0 8px 22px -3px rgba(15, 23, 42, 0.15), 0 3px 8px -1px rgba(15, 23, 42, 0.08)',
                transform: 'translateY(-2px)',
                '& .MuiButton-startIcon': {
                  transform: 'translateY(1px)',
                },
              },
              '&:active': {
                bgcolor: '#F8FAFC',
                transform: 'translateY(0) scale(0.98)',
                boxShadow: '0 2px 6px -1px rgba(15, 23, 42, 0.1)',
              },
              '& .MuiButton-startIcon': {
                mr: 0.4,
                transition: 'transform 0.18s ease',
              },
            }}
          >
            Latest Chat
          </Button>
        </Fade>
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
