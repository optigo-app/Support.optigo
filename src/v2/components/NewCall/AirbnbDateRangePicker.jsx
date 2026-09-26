'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Popover,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
  addDays,
  subDays,
} from 'date-fns';
import {
  CaretLeft,
  CaretRight,
  CaretDown,
  CalendarBlank,
} from '@phosphor-icons/react';

export const formatLocalDateToYYYYMMDD = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * Airbnb-Inspired Dual-Month Date Range Picker Popover
 */
export default function AirbnbDateRangePicker({
  startDate = null,
  endDate = null,
  onChange,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());
  const [rangeStart, setRangeStart] = useState(startDate);
  const [rangeEnd, setRangeEnd] = useState(endDate);
  const [hoverDate, setHoverDate] = useState(null);

  // Synchronize internal state whenever parent props update
  useEffect(() => {
    setRangeStart(startDate);
    if (startDate) {
      setCurrentMonth(startDate);
    }
    setRangeEnd(endDate);
  }, [startDate, endDate]);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setHoverDate(null);
  };

  // Month navigation
  const nextMonthDate = useMemo(() => addMonths(currentMonth, 1), [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  // Quick preset handlers
  const handlePreset = (preset) => {
    const today = new Date();
    let start = today;
    let end = today;

    if (preset === 'today') {
      start = today;
      end = today;
    } else if (preset === 'yesterday') {
      start = subDays(today, 1);
      end = subDays(today, 1);
    } else if (preset === 'last7') {
      start = subDays(today, 6);
      end = today;
    } else if (preset === 'last30') {
      start = subDays(today, 29);
      end = today;
    } else if (preset === 'thisMonth') {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else if (preset === 'lastMonth') {
      const lm = subMonths(today, 1);
      start = startOfMonth(lm);
      end = endOfMonth(lm);
    } else if (preset === 'allTime') {
      setRangeStart(null);
      setRangeEnd(null);
      if (onChange) onChange({ start: null, end: null });
      handleClose();
      return;
    }

    setRangeStart(start);
    setRangeEnd(end);
    setCurrentMonth(start);
    if (onChange) onChange({ start, end });
  };

  // Date selection logic
  const handleDayClick = (day) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
    } else if (rangeStart && !rangeEnd) {
      if (isBefore(day, rangeStart)) {
        setRangeStart(day);
      } else {
        setRangeEnd(day);
        if (onChange) onChange({ start: rangeStart, end: day });
      }
    }
  };

  const handleApply = () => {
    if (rangeStart) {
      const finalEnd = rangeEnd || rangeStart;
      if (onChange) onChange({ start: rangeStart, end: finalEnd });
    }
    handleClose();
  };

  const handleClear = () => {
    setRangeStart(null);
    setRangeEnd(null);
    if (onChange) onChange({ start: null, end: null });
    handleClose();
  };

  // Steppers on the main bar
  const handleStepRange = (direction, e) => {
    e.stopPropagation();
    if (!rangeStart || !rangeEnd) return;
    const daysDiff = Math.max(1, Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)));
    if (direction === 'prev') {
      const newStart = subDays(rangeStart, daysDiff);
      const newEnd = subDays(rangeEnd, daysDiff);
      setRangeStart(newStart);
      setRangeEnd(newEnd);
      setCurrentMonth(newStart);
      if (onChange) onChange({ start: newStart, end: newEnd });
    } else {
      const newStart = addDays(rangeStart, daysDiff);
      const newEnd = addDays(rangeEnd, daysDiff);
      setRangeStart(newStart);
      setRangeEnd(newEnd);
      setCurrentMonth(newStart);
      if (onChange) onChange({ start: newStart, end: newEnd });
    }
  };

  // Render a calendar month grid
  const renderMonthGrid = (monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return (
      <Box sx={{ width: 270 }}>
        {/* Month Title */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 13.5,
            color: '#0F172A',
            textAlign: 'center',
            mb: 1.5,
          }}
        >
          {format(monthDate, 'MMMM yyyy')}
        </Typography>

        {/* Days of Week Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            mb: 0.8,
          }}
        >
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <Typography
              key={d}
              sx={{
                fontSize: 11,
                fontWeight: 650,
                color: '#94A3B8',
                py: 0.2,
              }}
            >
              {d}
            </Typography>
          ))}
        </Box>

        {/* Days Matrix */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            rowGap: 0.3,
          }}
        >
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthDate);
            const isStart = rangeStart && isSameDay(day, rangeStart);
            const isEnd = rangeEnd && isSameDay(day, rangeEnd);

            // Range calculation including hover
            const effectiveEnd = rangeEnd || hoverDate;
            const inRange =
              rangeStart &&
              effectiveEnd &&
              isAfter(effectiveEnd, rangeStart) &&
              isWithinInterval(day, { start: rangeStart, end: effectiveEnd });

            return (
              <Box
                key={day.toISOString()}
                onMouseEnter={() => {
                  if (rangeStart && !rangeEnd) setHoverDate(day);
                }}
                onClick={() => isCurrentMonth && handleDayClick(day)}
                sx={{
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: isCurrentMonth ? 'pointer' : 'default',
                  opacity: isCurrentMonth ? 1 : 0.25,

                  // Airbnb-Style continuous strip background for range
                  ...(inRange &&
                    !isStart &&
                    !isEnd && {
                      bgcolor: '#F1F5F9',
                    }),
                  ...(isStart &&
                    rangeEnd &&
                    !isSameDay(rangeStart, rangeEnd) && {
                      borderTopLeftRadius: '50%',
                      borderBottomLeftRadius: '50%',
                      background: 'linear-gradient(to right, transparent 50%, #F1F5F9 50%)',
                    }),
                  ...(isEnd &&
                    rangeStart &&
                    !isSameDay(rangeStart, rangeEnd) && {
                      borderTopRightRadius: '50%',
                      borderBottomRightRadius: '50%',
                      background: 'linear-gradient(to left, transparent 50%, #F1F5F9 50%)',
                    }),
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: isStart || isEnd ? 750 : 500,
                    color: isStart || isEnd ? '#FFFFFF' : '#1E293B',
                    bgcolor: isStart || isEnd ? '#1E293B' : 'transparent',
                    transition: 'all 0.15s ease',
                    zIndex: 2,
                    '&:hover': {
                      bgcolor: isStart || isEnd ? '#0F172A' : '#E2E8F0',
                    },
                  }}
                >
                  {format(day, 'd')}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const displayText = useMemo(() => {
    if (rangeStart && rangeEnd) {
      return `${format(rangeStart, 'MMM d, yyyy')} → ${format(rangeEnd, 'MMM d, yyyy')}`;
    }
    if (rangeStart) {
      return `${format(rangeStart, 'MMM d, yyyy')} → Select end date`;
    }
    return 'Select Date Range';
  }, [rangeStart, rangeEnd]);

  return (
    <>
      {/* Outer Airbnb Range Trigger Pill */}
      <Paper
        elevation={0}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid #CBD5E1',
          borderRadius: '5px',
          bgcolor: '#FFFFFF',
          height: 32,
          p: '2px',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: '#CBD5E1',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => handleStepRange('prev', e)}
          sx={{
            p: 0.5,
            color: '#64748B',
            borderRadius: '4px',
            '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
          }}
        >
          <CaretLeft size={13} weight="bold" />
        </IconButton>

        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            px: 1,
            cursor: 'pointer',
            height: '100%',
          }}
        >
          <CalendarBlank size={15} color="#4F46E5" weight="bold" />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: '#0F172A',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {displayText}
          </Typography>
          <CaretDown size={12} color="#64748B" weight="bold" />
        </Box>

        <IconButton
          size="small"
          onClick={(e) => handleStepRange('next', e)}
          sx={{
            p: 0.5,
            color: '#64748B',
            borderRadius: '4px',
            '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
          }}
        >
          <CaretRight size={13} weight="bold" />
        </IconButton>
      </Paper>

      {/* Airbnb Dual-Month Floating Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            p: 0,
            borderRadius: '12px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {/* Quick Presets Sidebar */}
          <Box
            sx={{
              width: 140,
              p: 1.5,
              borderRight: '1px solid #F1F5F9',
              bgcolor: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.4,
            }}
          >
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#94A3B8',
                mb: 0.6,
                px: 1,
              }}
            >
              Presets
            </Typography>
            {[
              { id: 'allTime', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 days' },
              { id: 'last30', label: 'Last 30 days' },
              { id: 'thisMonth', label: 'This month' },
              { id: 'lastMonth', label: 'Last month' },
            ].map((preset) => (
              <Box
                key={preset.id}
                onClick={() => handlePreset(preset.id)}
                sx={{
                  px: 1,
                  py: 0.6,
                  borderRadius: '6px',
                  fontSize: 11.5,
                  fontWeight: 550,
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  '&:hover': {
                    bgcolor: '#EEF2FF',
                    color: '#4F46E5',
                  },
                }}
              >
                {preset.label}
              </Box>
            ))}
          </Box>

          {/* Dual Calendar Grid Area */}
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
            {/* Top Month Controls */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <IconButton
                size="small"
                onClick={handlePrevMonth}
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  p: 0.6,
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              >
                <CaretLeft size={14} weight="bold" color="#334155" />
              </IconButton>

              <Typography sx={{ fontSize: 12, fontWeight: 650, color: '#64748B' }}>
                Select check-in & check-out dates
              </Typography>

              <IconButton
                size="small"
                onClick={handleNextMonth}
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  p: 0.6,
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              >
                <CaretRight size={14} weight="bold" color="#334155" />
              </IconButton>
            </Box>

            {/* Side-by-side Dual Months */}
            <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
              {renderMonthGrid(currentMonth)}
              {renderMonthGrid(nextMonthDate)}
            </Stack>

            {/* Bottom Actions Footer */}
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button
                size="small"
                onClick={handleClear}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#64748B',
                  p: 0,
                  '&:hover': { color: '#0F172A', bgcolor: 'transparent' },
                }}
              >
                Clear dates
              </Button>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  onClick={handleClose}
                  sx={{
                    textTransform: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#475569',
                    borderRadius: '6px',
                    px: 1.5,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleApply}
                  sx={{
                    textTransform: 'none',
                    fontSize: 12,
                    fontWeight: 650,
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    px: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#0F172A', boxShadow: 'none' },
                  }}
                >
                  Apply Range
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
