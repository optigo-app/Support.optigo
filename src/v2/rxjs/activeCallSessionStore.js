import { BehaviorSubject } from "rxjs";
import { CALL_STORAGE_KEYS, callStorage } from "../utils/callSessionStorage";

/**
 * Single source of truth for the ONE live call, shared by the Call Log page
 * (useCallSession) and the Call Chat page (callStreamService).
 *
 * The same-tab BehaviorSubject keeps the pages in sync across route changes;
 * the localStorage key + "storage" event keep other browser tabs in sync.
 *
 * Session shape (all times in ms):
 *   { sr, followUpId, isFollowUp, startTime, pausedDurationMs, pausedAt, isPaused,
 *     callerName, company, source, updatedAt }
 * `source` is the page that wrote last ("calllog" | "callchat"), so a page can
 * ignore its own writes.
 */
export const ACTIVE_CALL_SESSION_KEY = "active_call_session_v1";
export const MAX_SESSION_AGE_MS = 86400000;

const SYNC_FIELDS = ["sr", "followUpId", "isFollowUp", "startTime", "pausedDurationMs", "pausedAt", "isPaused"];

const normalize = (s) => ({
  sr: s.sr,
  followUpId: s.followUpId ?? null,
  isFollowUp: Boolean(s.isFollowUp),
  startTime: Number(s.startTime),
  pausedDurationMs: Number(s.pausedDurationMs) || 0,
  pausedAt: s.pausedAt ? Number(s.pausedAt) : null,
  isPaused: Boolean(s.isPaused),
});

const isValid = (s) =>
  Boolean(s) &&
  s.sr != null &&
  Number.isFinite(Number(s.startTime)) &&
  Number(s.startTime) > 0 &&
  Date.now() - Number(s.startTime) < MAX_SESSION_AGE_MS;

const readStored = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVE_CALL_SESSION_KEY) || "null");
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const isSameSession = (a, b) => {
  if (!a || !b) return !a && !b;
  const x = normalize(a);
  const y = normalize(b);
  // The Call Log page tracks pause time in whole seconds, so compare at that precision
  // or the two pages would keep re-publishing sub-second rounding differences.
  x.pausedDurationMs = Math.floor(x.pausedDurationMs / 1000);
  y.pausedDurationMs = Math.floor(y.pausedDurationMs / 1000);
  return SYNC_FIELDS.every((field) => String(x[field]) === String(y[field]));
};

export const activeCallSession$ = new BehaviorSubject(readStored());

export const getActiveCallSession = () => activeCallSession$.getValue();

/** Publish (or update) the live call. No-op when nothing sync-relevant changed. */
export const publishActiveCallSession = (session, source) => {
  if (!isValid(session)) return false;
  const current = activeCallSession$.getValue();
  if (isSameSession(current, session)) return false;
  const next = {
    ...(current && String(current.sr) === String(session.sr) ? current : {}),
    ...session,
    ...normalize(session),
    source,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(ACTIVE_CALL_SESSION_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: same-tab subject still syncs the pages */
  }
  activeCallSession$.next(next);
  return true;
};

/**
 * End of the live call. Also drops the Call Log page's own persisted timer keys so
 * a call ended on the other page can never be resurrected as a ghost call on reload.
 */
export const clearActiveCallSession = ({ resetCallLogKeys = true } = {}) => {
  const previous = activeCallSession$.getValue();
  try {
    localStorage.removeItem(ACTIVE_CALL_SESSION_KEY);
  } catch {
    /* ignore */
  }
  if (resetCallLogKeys) {
    callStorage.setMany({
      [CALL_STORAGE_KEYS.RECORDING_TIME]: null,
      // Ending a follow-up leaves its parent call selected, so keep that key.
      ...(previous?.isFollowUp ? {} : { [CALL_STORAGE_KEYS.CURRENT_CALL]: null }),
      [CALL_STORAGE_KEYS.IS_PAUSED]: null,
      [CALL_STORAGE_KEYS.PAUSED_DURATION]: null,
      [CALL_STORAGE_KEYS.PAUSE_START_TIME]: null,
      [CALL_STORAGE_KEYS.CALL_START_TIME]: null,
    });
  }
  if (previous) activeCallSession$.next(null);
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== ACTIVE_CALL_SESSION_KEY) return;
    const next = readStored();
    if (!isSameSession(activeCallSession$.getValue(), next)) activeCallSession$.next(next);
  });
}
