import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

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
  const dj = dayjs(trimmed);
  if (!dj.isValid()) return false;
  const yr = dj.year();
  return yr > 1901 && yr < 3000;
};

/**
 * Formats full date-time matching standard Call Logger views: "Sep 1, 2026, 11:20 AM"
 */
export const formatCallDateTime = (d) => {
  if (!isValidDate(d)) return '—';
  return dayjs(d).format('MMM D, YYYY, h:mm A');
};

/**
 * Formats time strictly to 12-hour AM/PM: "11:20 AM"
 */
export const formatTimeOnly = (rawTime, fallbackDateStr) => {
  if (rawTime && typeof rawTime === 'string') {
    const trimmed = rawTime.trim();
    if (trimmed.includes(':')) {
      const parsed = dayjs(trimmed, [
        'HH:mm:ss',
        'HH:mm',
        'h:mm A',
        'hh:mm A',
        'YYYY-MM-DD HH:mm:ss',
      ]);
      if (parsed.isValid()) {
        return parsed.format('h:mm A');
      }
    }
  }
  if (fallbackDateStr && isValidDate(fallbackDateStr)) {
    return dayjs(fallbackDateStr).format('h:mm A');
  }
  return '12:00 PM';
};

/**
 * Formats date header group: "Tuesday, September 1"
 */
export const formatDateGroup = (d) => {
  if (!isValidDate(d)) return 'Recent';
  return dayjs(d).format('dddd, MMMM D');
};

/**
 * Returns epoch timestamp in milliseconds for chronological sorting.
 */
export const getEpochMs = (d, fallbackMs = 0) => {
  if (!isValidDate(d)) return fallbackMs;
  return dayjs(d).valueOf();
};

export { dayjs };
