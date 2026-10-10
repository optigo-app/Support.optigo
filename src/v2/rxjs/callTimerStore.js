import { BehaviorSubject } from "rxjs";

/**
 * Live call timer (seconds).
 * Ticks every second during an active call. Only components that DISPLAY
 * the time should subscribe (via useSubject) so the whole CallLogger page
 * doesn't re-render every second.
 */
const RECORDING_TIME_KEY = "call_recording_time";

const getInitialTime = () => {
  try {
    const saved = localStorage.getItem(RECORDING_TIME_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

export const recordingTime$ = new BehaviorSubject(getInitialTime());

export const setRecordingTimeValue = (value) => {
  if (recordingTime$.getValue() !== value) recordingTime$.next(value);
};
