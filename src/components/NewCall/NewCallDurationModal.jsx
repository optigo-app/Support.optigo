'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { X, Clock, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCallLog } from '../../context/UseCallLog';
import {
  durationModal$,
  closeDurationModal,
  useNewCallSubject,
} from './rxjs/newCallEvents';
import { callStreamService } from './services/callStreamService';

dayjs.extend(duration);
dayjs.extend(relativeTime);

// Helper function to parse user natural language duration strings (e.g. 5s, 10m, 1h 20m)
const parseNaturalDuration = (text) => {
  if (!text || typeof text !== 'string') return dayjs.duration(0);
  const input = text.toLowerCase().trim();
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const hMatch = input.match(/(\d+)\s*(h|hr|hour|hours)/);
  if (hMatch) hours = parseInt(hMatch[1], 10);

  const mMatch = input.match(/(\d+)\s*(m|min|minute|minutes)/);
  if (mMatch) minutes = parseInt(mMatch[1], 10);

  const sMatch = input.match(/(\d+)\s*(s|sec|second|seconds)/);
  if (sMatch) seconds = parseInt(sMatch[1], 10);

  const compactMatch = input.match(/^(\d+)(h)?(\d+)?(m)?(\d+)?(s)?$/);
  if (!hMatch && !mMatch && !sMatch && compactMatch) {
    if (compactMatch[2]) hours = parseInt(compactMatch[1], 10);
    if (compactMatch[4]) minutes = parseInt(compactMatch[3] || 0, 10);
    if (compactMatch[6]) seconds = parseInt(compactMatch[5] || 0, 10);
    if (!compactMatch[2] && !compactMatch[4] && !compactMatch[6]) {
      minutes = parseInt(compactMatch[1], 10);
    }
  }

  seconds += minutes * 60 + hours * 3600;
  return dayjs.duration(seconds, 'seconds');
};

export default function NewCallDurationModal() {
  const modalState = useNewCallSubject(durationModal$);
  const { EditCallDuration, triggerRefresh } = useCallLog();

  const [callStart, setCallStart] = useState(null);
  const [callEnd, setCallEnd] = useState(null);
  const [durationInput, setDurationInput] = useState('');
  const [durationError, setDurationError] = useState('');
  const [loading, setLoading] = useState(false);

  const targetCall = modalState.call;

  useEffect(() => {
    if (modalState.open && targetCall) {
      const raw = targetCall.rawRecord || targetCall;
      const startStr = raw.callStart || raw.CallStart;
      const endStr = raw.callClosed || raw.CallClosed;

      const start = startStr && startStr !== '1900-01-01T00:00:00' ? dayjs(startStr) : dayjs();
      const end = endStr && endStr !== '1900-01-01T00:00:00' ? dayjs(endStr) : dayjs(start).add(5, 'minute');

      setCallStart(start.isValid() ? start : dayjs());
      setCallEnd(end.isValid() ? end : dayjs().add(5, 'minute'));

      if (start.isValid() && end.isValid()) {
        const diff = end.diff(start, 'second');
        if (diff > 0) {
          const dur = dayjs.duration(diff, 'seconds');
          const h = dur.hours();
          const m = dur.minutes();
          const s = dur.seconds();

          let formatted = [];
          if (h > 0) formatted.push(`${h}h`);
          if (m > 0) formatted.push(`${m}m`);
          if (s > 0 && h === 0) formatted.push(`${s}s`);
          setDurationInput(formatted.join(' ') || '0s');
        } else {
          setDurationInput('5m');
        }
      }
      setDurationError('');
      setLoading(false);
    }
  }, [modalState.open, targetCall]);

  // Handle duration input change - auto calculate end time
  const handleDurationInputChange = (e) => {
    const val = e.target.value;
    setDurationInput(val);

    try {
      const dur = parseNaturalDuration(val);
      if (dur.asMilliseconds() === 0 && val.trim() !== '' && val.trim() !== '0') {
        setDurationError('Invalid duration format');
      } else {
        setDurationError('');
        if (callStart && callStart.isValid()) {
          const newEndTime = callStart.add(dur.asSeconds(), 'seconds');
          setCallEnd(newEndTime);
        }
      }
    } catch {
      setDurationError('Invalid format');
    }
  };

  // Handle manual start time change
  const handleStartTimeChange = (newValue) => {
    setCallStart(newValue);

    if (durationInput && newValue && newValue.isValid()) {
      const dur = parseNaturalDuration(durationInput);
      if (dur.asMilliseconds() > 0) {
        const newEndTime = newValue.add(dur.asSeconds(), 'seconds');
        setCallEnd(newEndTime);
      }
    }
  };

  // Handle manual end time change
  const handleEndTimeChange = (newValue) => {
    setCallEnd(newValue);

    if (callStart && newValue && callStart.isValid() && newValue.isValid()) {
      const diff = newValue.diff(callStart, 'second');
      if (diff > 0) {
        const dur = dayjs.duration(diff, 'seconds');
        const h = dur.hours();
        const m = dur.minutes();
        const s = dur.seconds();

        let formatted = [];
        if (h > 0) formatted.push(`${h}h`);
        if (m > 0) formatted.push(`${m}m`);
        if (s > 0 && h === 0) formatted.push(`${s}s`);

        setDurationInput(formatted.join(' ') || '0s');
        setDurationError('');
      }
    }
  };

  // Calculated human readable duration summary
  const totalDurationDisplay = useMemo(() => {
    if (!callStart || !callEnd || !callStart.isValid() || !callEnd.isValid()) {
      return '0 sec';
    }
    const diffSeconds = callEnd.diff(callStart, 'second');
    if (diffSeconds <= 0) return '0 sec';

    const dur = dayjs.duration(diffSeconds, 'seconds');
    const h = dur.hours();
    const m = dur.minutes();
    const s = dur.seconds();

    if (h > 0 && m > 0 && s > 0) return `${h} hr ${m} min ${s} sec`;
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr`;
    if (m > 0 && s > 0) return `${m} min ${s} sec`;
    if (m > 0) return `${m} min`;
    return `${s} sec`;
  }, [callStart, callEnd]);

  const handleSave = async () => {
    if (!callStart || !callEnd || !callStart.isValid() || !callEnd.isValid()) {
      toast.error('Please enter valid start and end dates');
      return;
    }

    const diffSeconds = callEnd.diff(callStart, 'second');
    if (diffSeconds <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    const callId = targetCall?.sr || targetCall?.id || targetCall?.CallLogid;
    if (!callId) {
      toast.error('No call ID found to update');
      return;
    }

    const dur = dayjs.duration(diffSeconds, 'seconds');
    const formattedDuration = `${dur.hours().toString().padStart(2, '0')}:${dur.minutes().toString().padStart(2, '0')}:${dur.seconds().toString().padStart(2, '0')}`;
    const startFormatted = callStart.format('YYYY-MM-DD HH:mm:ss');
    const endFormatted = callEnd.format('YYYY-MM-DD HH:mm:ss');

    setLoading(true);
    try {
      const data = await EditCallDuration(callId, startFormatted, endFormatted);

      if (data?.stat === 1 && data?.stat_code === 1000) {
        // Synchronize local call stream
        callStreamService.patchPrimaryCall(callId, {
          callStart: startFormatted,
          callClosed: endFormatted,
          CallDuration: formattedDuration,
        });

        toast.success('Call duration updated successfully');
        if (triggerRefresh) triggerRefresh();
        closeDurationModal();
      } else {
        toast.error(data?.message || 'Failed to update call duration');
      }
    } catch (err) {
      console.error('Error updating call duration:', err);
      toast.error('Server error updating call duration');
    } finally {
      setLoading(false);
    }
  };

  const callSerial = targetCall?.sr || targetCall?.id || '';

  return (
    <Dialog
      open={modalState.open}
      onClose={closeDurationModal}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          p: 0,
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.8,
            borderBottom: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={20} color="#0284C7" weight="bold" />
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
              Edit Call Duration
            </Typography>
            {callSerial && (
              <Chip
                label={`#${callSerial}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 11,
                  fontWeight: 750,
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                }}
              />
            )}
          </Box>
          <IconButton size="small" onClick={closeDurationModal} sx={{ color: '#64748B' }}>
            <X size={18} weight="bold" />
          </IconButton>
        </Box>

        {/* Content */}
        <DialogContent sx={{ p: 2.5, bgcolor: '#FFFFFF' }}>
          <Grid container spacing={2}>
            {/* Start Time Picker */}
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#334155', mb: 0.6 }}>
                Start Time
              </Typography>
              <DateTimePicker
                value={callStart}
                onChange={handleStartTimeChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        fontSize: 12,
                        borderRadius: '8px',
                      },
                    },
                  },
                }}
              />
            </Grid>

            {/* End Time Picker */}
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#334155', mb: 0.6 }}>
                End Time
              </Typography>
              <DateTimePicker
                value={callEnd}
                onChange={handleEndTimeChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        fontSize: 12,
                        borderRadius: '8px',
                      },
                    },
                  },
                }}
              />
            </Grid>

            {/* Duration text input with auto-calculator */}
            <Grid item xs={12}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#334155', mb: 0.6 }}>
                Duration
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={durationInput}
                onChange={handleDurationInputChange}
                placeholder="e.g. 5s, 10m, 1h 20m, 45m"
                error={Boolean(durationError)}
                helperText={durationError || 'Type duration to auto-calculate end time'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: 11,
                    fontWeight: 500,
                    color: durationError ? '#DC2626' : '#64748B',
                    mt: 0.4,
                  },
                }}
              />
            </Grid>

            {/* Total Duration Live Preview Box */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#475569' }}>
                  Total Duration
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0284C7' }}>
                  {totalDurationDisplay}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || Boolean(durationError)}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Check size={16} weight="bold" />}
              sx={{
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
                borderRadius: '8px',
                px: 2.5,
                py: 0.9,
                fontSize: 12.5,
                fontWeight: 750,
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </DialogContent>
      </LocalizationProvider>
    </Dialog>
  );
}
