import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

/**
 * Checks if a date string is valid and not a 1900/0000 SQL placeholder.
 */
export const isValidDate = (d) => {
  if (!d || typeof d !== 'string') return false;
  const trimmed = d.trim();
  if (
    !trimmed ||
    trimmed === '-' ||
    trimmed.startsWith('1900') ||
    trimmed.startsWith('0000')
  ) {
    return false;
  }
  const clean = trimmed.replace(/Z$/i, '').replace(' ', 'T');
  const dj = dayjs(clean);
  if (!dj.isValid()) return false;
  const yr = dj.year();
  return yr > 1901 && yr < 3000;
};

/**
 * Generates local ISO timestamp string (YYYY-MM-DDTHH:mm:ss.sss) WITHOUT trailing 'Z'.
 * Ensures local Indian time (IST) is preserved without UTC offset conversion.
 */
export const getLocalISOString = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  const padMs = (n) => String(n).padStart(3, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${padMs(date.getMilliseconds())}`;
};

/**
 * Strips trailing 'Z' and normalizes date string to local ISO format.
 */
export const normalizeDateString = (d) => {
  if (!d) return '';
  return String(d).replace(/Z$/i, '').replace(' ', 'T');
};

/**
 * Formats full date-time matching standard Call Logger views: "Sep 1, 2026, 11:20 AM"
 * Strips trailing 'Z' so it is treated as local time (IST).
 */
export const formatCallDateTime = (d) => {
  if (!isValidDate(d)) return '—';
  const clean = typeof d === 'string' ? d.replace(/Z$/i, '').replace(' ', 'T') : d;
  return dayjs(clean).format('MMM D, YYYY, h:mm A');
};

/**
 * Formats time strictly to 12-hour AM/PM: "11:20 AM"
 * Strips trailing 'Z' so it is treated as local time (IST), matching database on refresh.
 */
export const formatFriendlyTime = (rawTime, fallbackDateStr) => {
  const timeVal = rawTime || fallbackDateStr;
  if (!timeVal) return '12:00 PM';

  if (typeof timeVal === 'string') {
    const trimmed = timeVal.trim();

    // 1. Time only string e.g. "15:45", "9:30", "15:45:00", "10:30 AM"
    if (/^\d{1,2}:\d{2}(:\d{2})?(\s*[AaPp][Mm])?$/.test(trimmed)) {
      if (/[AaPp][Mm]/i.test(trimmed)) return trimmed;
      const [hStr, mStr] = trimmed.split(':');
      const h = parseInt(hStr, 10);
      if (!isNaN(h)) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${mStr.slice(0, 2)} ${ampm}`;
      }
    }

    // 2. Full datetime or ISO string with or without 'Z': "2026-10-03T10:38:58.573Z", "2026-10-03 10:38:58"
    // Strip trailing 'Z' so it is treated as local time (IST), matching database on refresh.
    const cleanDateStr = trimmed.replace(/Z$/i, '').replace(' ', 'T');
    const d = new Date(cleanDateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  }

  const d = new Date(timeVal);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  return '12:00 PM';
};

export const formatTimeOnly = formatFriendlyTime;

/**
 * Formats date header group: "Tuesday, September 1"
 */
export const formatDateGroup = (d) => {
  if (!isValidDate(d)) return 'Recent';
  const clean = typeof d === 'string' ? d.replace(/Z$/i, '').replace(' ', 'T') : d;
  return dayjs(clean).format('dddd, MMMM D');
};

/**
 * Returns epoch timestamp in milliseconds for chronological sorting.
 */
export const getEpochMs = (d, fallbackMs = 0) => {
  if (!isValidDate(d)) return fallbackMs;
  const clean = typeof d === 'string' ? d.replace(/Z$/i, '').replace(' ', 'T') : d;
  return dayjs(clean).valueOf();
};

export { dayjs };
