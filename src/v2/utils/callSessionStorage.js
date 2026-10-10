/**
 * Safe localStorage helper for the call session (call_* keys).
 *
 * - Every read/write is wrapped in try/catch, so a corrupted or unavailable
 *   localStorage value can never crash the CallLogger page.
 * - Corrupted JSON values are removed and the fallback is returned.
 */

export const CALL_STORAGE_KEYS = {
  RECORDING_TIME: "call_recording_time",
  CURRENT_CALL: "current_call_data",
  IS_PAUSED: "call_is_paused",
  PAUSED_DURATION: "call_paused_duration",
  PAUSE_START_TIME: "call_pause_start_time",
  SLIDERS_STATE: "call_sliders_state",
  CONCURRENT_CALL: "concurrent_call_data",
  CALL_START_TIME: "call_start_timestamp",
};

const getRaw = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[callStorage] read failed: ${key}`, err);
    return null;
  }
};

const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[callStorage] remove failed: ${key}`, err);
  }
};

const set = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else if (typeof value === "object") {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value.toString());
    }
  } catch (err) {
    console.warn(`[callStorage] write failed: ${key}`, err);
  }
};

const getInt = (key, fallback = null) => {
  const raw = getRaw(key);
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
};

const getFloat = (key, fallback = 0) => {
  const raw = getRaw(key);
  if (!raw) return fallback;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
};

const getJSON = (key, fallback = null) => {
  const raw = getRaw(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[callStorage] corrupted JSON removed: ${key}`, err);
    remove(key);
    return fallback;
  }
};

/** Batch update. `null` values remove the key. */
const setMany = (updates) => {
  Object.entries(updates).forEach(([key, value]) => set(key, value));
};

export const callStorage = {
  getRaw,
  getInt,
  getFloat,
  getJSON,
  set,
  setMany,
  remove,
};
