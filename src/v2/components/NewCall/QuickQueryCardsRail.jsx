'use client';
import React, { useMemo } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, Button } from '@mui/material';
import { X, Handshake } from '@phosphor-icons/react';
import { useCallLog } from '../../context/UseCallLog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/mousewheel';
import 'swiper/css/keyboard';

dayjs.extend(relativeTime);

// Helper to calculate exact wait time metrics & colors (Green <=10m, Orange <=20m, Red >20m)
function getWaitMetrics(dateStr, timeStr) {
  if (!dateStr) {
    return { shortBadge: '1m', timeAgo: 'recently', color: '#16A34A', bg: '#DCFCE7' };
  }
  try {
    let callDateTime = dayjs(dateStr);
    if (timeStr && typeof timeStr === 'string' && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      callDateTime = callDateTime.hour(parseInt(parts[0], 10)).minute(parseInt(parts[1], 10));
    }
    const now = dayjs();
    const diffMins = Math.max(0, now.diff(callDateTime, 'minute'));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffMins / 1440);

    let shortBadge = '1m';
    if (diffDays > 0) shortBadge = `${diffDays}d`;
    else if (diffHours > 0) shortBadge = `${diffHours}h`;
    else if (diffMins > 0) shortBadge = `${diffMins}m`;
    else shortBadge = 'now';

    const timeAgo = callDateTime.fromNow();

    let color = '#DC2626';
    let bg = '#FEE2E2';
    if (diffMins <= 10) {
      color = '#16A34A';
      bg = '#DCFCE7';
    } else if (diffMins <= 20) {
      color = '#EA580C';
      bg = '#FFEDD5';
    }

    return { shortBadge, timeAgo, color, bg };
  } catch (_) {
    return { shortBadge: '1m', timeAgo: 'recently', color: '#DC2626', bg: '#FEE2E2' };
  }
}

export default function QuickQueryCardsRail({
  activeThreadId,
  onSelectThread,
  onAcceptCall,
  onClose,
}) {
  const { queue = [] } = useCallLog();

  // Normalize queue items for the compact rail
  const queueCards = useMemo(() => {
    if (!Array.isArray(queue) || queue.length === 0) return [];

    return queue.map((item, idx) => {
      const sr = item.sr || item.id || idx;
      const company = item.company || item.CompanyName || 'Company';
      const appName = item.appname || item.DeptName || company;
      const caller = item.callBy || item.CustomerName || item.name || '';
      const topic = item.description || item.Descr || item.topic || `${company} • Support Enquiry`;
      const dateStr = item.date || item.callStart || '';
      const timeStr = item.time || '';

      const { shortBadge, timeAgo, color, bg } = getWaitMetrics(dateStr, timeStr);

      return {
        id: `queue-${sr}`,
        sr,
        badge: shortBadge,
        color,
        bg,
        company,
        appName,
        caller,
        fullTopic: topic,
        topicSnippet: topic.length > 30 ? `${topic.substring(0, 28)}...` : topic,
        timeAgo,
        rawCall: item,
      };
    });
  }, [queue]);

  if (!queueCards || queueCards.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#FFF7ED',
        borderBottom: '1px solid #FED7AA',
        px: 1.2,
        py: 0.6,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
        zIndex: 5,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Horizontal Swiper Carousel with Autoplay */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Swiper
          spaceBetween={10}
          slidesPerView="auto"
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={700}
          loop={queueCards.length > 4}
          grabCursor={true}
          keyboard={{ enabled: true }}
          mousewheel={{ forceToAxis: true }}
          modules={[Autoplay, Keyboard, Mousewheel]}
          style={{ width: '100%', minWidth: 0, padding: '2px 0' }}
        >
          {queueCards.map((card) => {
            const isSelected =
              activeThreadId === `call-${card.sr}` ||
              activeThreadId === card.id ||
              activeThreadId === String(card.sr);

            return (
              <SwiperSlide key={card.id} style={{ width: 'auto' }}>
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{card.company}</Typography>
                      {card.caller && <Typography sx={{ fontSize: 11 }}>Caller: {card.caller}</Typography>}
                      <Typography sx={{ fontSize: 11 }}>App: {card.appName}</Typography>
                      <Typography sx={{ fontSize: 11, mt: 0.5, color: '#E2E8F0' }}>{card.fullTopic}</Typography>
                      <Typography sx={{ fontSize: 10, mt: 0.5, color: '#CBD5E1' }}>Waited: {card.timeAgo}</Typography>
                    </Box>
                  }
                  arrow
                  placement="bottom"
                >
                  <Box
                    onClick={() => onSelectThread && onSelectThread(`call-${card.sr}`, card.rawCall)}
                    sx={{
                      width: 275,
                      height: 54,
                      bgcolor: isSelected ? '#FEF2F2' : '#FFFFFF',
                      border: isSelected ? '1.5px solid #EF4444' : '1px solid #FECACA',
                      borderRadius: '7px',
                      px: 1,
                      py: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease-in-out',
                      userSelect: 'none',
                      flexShrink: 0,
                      '&:hover': {
                        borderColor: '#F87171',
                        bgcolor: '#FEF2F2',
                        boxShadow: '0 2px 6px rgba(220,38,38,0.12)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {/* Elapsed Wait Time Square Badge */}
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: card.color,
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 850,
                        fontSize: '0.78rem',
                        flexShrink: 0,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                      }}
                    >
                      {card.badge}
                    </Box>

                    {/* Content Details */}
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.1 }}>
                      {/* Row 1: Company / Caller + App Chip */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 750,
                            fontSize: '0.78rem',
                            color: '#0F172A',
                            lineHeight: 1.2,
                            maxWidth: 125,
                          }}
                        >
                          {card.company}
                        </Typography>
                        <Chip
                          label={card.appName}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.62rem',
                            fontWeight: 750,
                            bgcolor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            borderRadius: '4px',
                            px: 0.2,
                            maxWidth: 75,
                            '& .MuiChip-label': { px: 0.4, overflow: 'hidden', textOverflow: 'ellipsis' },
                          }}
                        />
                      </Box>

                      {/* Row 2: Topic Snippet */}
                      <Typography
                        noWrap
                        sx={{
                          color: '#475569',
                          fontSize: '0.68rem',
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                      >
                        {card.caller ? `${card.caller} • ` : ''}{card.topicSnippet}
                      </Typography>

                      {/* Row 3: Time Ago in Dynamic Wait Color */}
                      <Typography
                        sx={{
                          color: card.color,
                          fontSize: '0.66rem',
                          fontWeight: 750,
                          lineHeight: 1.1,
                        }}
                      >
                        {card.timeAgo}
                      </Typography>
                    </Box>

                    {/* Direct Accept Action Button */}
                    <Tooltip title="Accept this call from queue" arrow>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAcceptCall) onAcceptCall(card.sr);
                        }}
                        sx={{
                          minWidth: 28,
                          width: 28,
                          height: 28,
                          p: 0,
                          borderRadius: '6px',
                          bgcolor: '#16A34A',
                          color: '#FFFFFF',
                          boxShadow: 'none',
                          flexShrink: 0,
                          '&:hover': {
                            bgcolor: '#15803D',
                            boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
                          },
                        }}
                      >
                        <Handshake size={15} weight="bold" />
                      </Button>
                    </Tooltip>
                  </Box>
                </Tooltip>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>

      {/* Right Close Button */}
      {onClose && (
        <Tooltip title="Hide Call Queue" arrow>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#9A3412',
              p: 0.5,
              borderRadius: '4px',
              flexShrink: 0,
              '&:hover': { bgcolor: '#FED7AA' },
            }}
          >
            <X size={16} weight="bold" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
