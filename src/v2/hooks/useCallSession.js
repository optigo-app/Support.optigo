import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import {
  recordingTime$,
  setRecordingTimeValue,
} from "../rxjs/callTimerStore";
import {
  CALL_STORAGE_KEYS as STORAGE_KEYS,
  callStorage,
} from "../utils/callSessionStorage";

/**
 * useCallSession
 * ---------------------------------------------------------------------------
 * Owns the full lifecycle of an active call session:
 *   timer, pause / resume, start / end, localStorage persistence and
 *   restore-after-refresh.
 *
 * Logic is moved as-is from CallLogger.jsx. Key robustness rules:
 *   1. All refs are initialised SYNCHRONOUSLY from storage on first render,
 *      so save-effects can never run before restore (the "resume" bug class).
 *   2. Timer math is timestamp-based and reads REFS only (no stale closures).
 *   3. The ticking value lives in recordingTime$ (RxJS) — the parent only
 *      re-renders when the timer flips between 0 and > 0.
 */
export function useCallSession({
  CurrentCall,
  setCurrentCall,
  endCall,
  PauseCall,
  ResumeCall,
  activeFollowUp,
  setActiveFollowUp,
  pauseFollowUpCall,
  resumeFollowUpCall,
  endFollowUpCall,
  sliders,
  showNotification,
}) {
  // ---------------------------------------------------------------------------
  // 1. STATE + REFS (restored synchronously from storage — explicit restore order)
  // ---------------------------------------------------------------------------

  // ⚡ PERF: Live timer value lives in recordingTime$ (RxJS) + a ref.
  const recordingTimeRef = useRef(recordingTime$.getValue());
  const [isTimerActive, setIsTimerActive] = useState(
    () => recordingTimeRef.current > 0,
  );
  const setRecordingTime = useCallback((value) => {
    recordingTimeRef.current = value;
    setRecordingTimeValue(value);
    setIsTimerActive(value > 0); // React bails out when unchanged
  }, []);
  // NOTE: Not live — only use for `> 0` checks. Live value: recordingTime$.
  const recordingTime = isTimerActive ? recordingTimeRef.current || 1 : 0;

  const timerRef = useRef(null);

  const [isPaused, setIsPaused] = useState(() =>
    Boolean(callStorage.getJSON(STORAGE_KEYS.IS_PAUSED, false)),
  );
  const [pausedDuration, setPausedDuration] = useState(() =>
    callStorage.getFloat(STORAGE_KEYS.PAUSED_DURATION, 0),
  );

  // ✅ MIRROR REFS: always current; used inside the timer interval.
  const isPausedRef = useRef(isPaused);
  const pausedDurationRef = useRef(pausedDuration);
  // ✅ RESTORE ORDER FIX: initialised synchronously (was restored in a mount
  // effect that ran AFTER the save-effect had already wiped the key).
  const pauseStartTimeRef = useRef(
    callStorage.getInt(STORAGE_KEYS.PAUSE_START_TIME, null),
  );
  const callStartTimeRef = useRef(
    callStorage.getInt(STORAGE_KEYS.CALL_START_TIME, null),
  );

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    pausedDurationRef.current = pausedDuration;
  }, [pausedDuration]);

  // Mirror isPaused in a state flag for synchronous isRunning status updates
  const [isTimerRunningState, setIsTimerRunningState] = useState(() => {
    const isPausedSaved = Boolean(
      callStorage.getJSON(STORAGE_KEYS.IS_PAUSED, false),
    );
    const startTimeSaved = callStorage.getInt(
      STORAGE_KEYS.CALL_START_TIME,
      null,
    );
    const savedCall = callStorage.getJSON(STORAGE_KEYS.CURRENT_CALL, null);
    return Boolean(
      (savedCall?.sr || CurrentCall?.sr) && !isPausedSaved && startTimeSaved,
    );
  });

  // Stable reference for the concurrent call state to prevent flickering
  const concurrentCallRef = useRef(null);
  const [conCurrentCall, setConCurrentCall] = useState(() => {
    const parsedCall = callStorage.getJSON(STORAGE_KEYS.CONCURRENT_CALL, null);
    if (parsedCall) concurrentCallRef.current = parsedCall;
    return parsedCall;
  });

  // ---------------------------------------------------------------------------
  // 2. TIMER CORE
  // ---------------------------------------------------------------------------

  // Timestamp-based elapsed time, reads ONLY refs → never stale.
  const calculateElapsedTime = useCallback(() => {
    const startTime = callStartTimeRef.current;
    if (!startTime) return 0;

    const now = Date.now();
    const totalElapsed = Math.floor((now - startTime) / 1000);

    let totalPausedTime = pausedDurationRef.current;
    if (isPausedRef.current && pauseStartTimeRef.current) {
      totalPausedTime += Math.floor((now - pauseStartTimeRef.current) / 1000);
    }

    return Math.max(0, totalElapsed - totalPausedTime);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current && callStartTimeRef.current) {
        setRecordingTime(calculateElapsedTime());
      }
    }, 1000);
  }, [calculateElapsedTime, setRecordingTime, stopTimer]);

  // Recalculate when the tab becomes visible / focused (timers are throttled
  // in background tabs; timestamps keep it accurate).
  useEffect(() => {
    const recalculate = () => {
      if (callStartTimeRef.current && !isPausedRef.current) {
        setRecordingTime(calculateElapsedTime());
      }
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) recalculate();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", recalculate);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", recalculate);
    };
  }, [calculateElapsedTime, setRecordingTime]);

  // ---------------------------------------------------------------------------
  // 3. PERSISTENCE
  // ---------------------------------------------------------------------------

  const updateLocalStorage = useCallback((updates) => {
    callStorage.setMany(updates);
  }, []);

  // NOTE: RECORDING_TIME is NOT written every tick (perf). It is recalculated
  // from CALL_START_TIME on reload; pause / beforeunload persist it explicitly.

  useEffect(() => {
    if (CurrentCall) {
      callStorage.set(STORAGE_KEYS.CURRENT_CALL, CurrentCall);
    }
  }, [CurrentCall]);

  useEffect(() => {
    callStorage.set(STORAGE_KEYS.IS_PAUSED, JSON.stringify(isPaused));
  }, [isPaused]);

  useEffect(() => {
    callStorage.set(STORAGE_KEYS.PAUSED_DURATION, pausedDuration.toString());
  }, [pausedDuration]);

  useEffect(() => {
    if (typeof pauseStartTimeRef.current === "number") {
      callStorage.set(
        STORAGE_KEYS.PAUSE_START_TIME,
        pauseStartTimeRef.current.toString(),
      );
    } else if (!isPaused) {
      // Only remove when NOT paused (never wipe a valid paused session).
      callStorage.remove(STORAGE_KEYS.PAUSE_START_TIME);
    }
  }, [isPaused]);

  // Debounced write of the concurrent call
  const debouncedSetConCurrentCall = useMemo(
    () =>
      debounce((call) => {
        if (call) {
          callStorage.set(STORAGE_KEYS.CONCURRENT_CALL, call);
          concurrentCallRef.current = call;
        } else {
          callStorage.remove(STORAGE_KEYS.CONCURRENT_CALL);
          concurrentCallRef.current = null;
        }
      }, 100),
    [],
  );

  useEffect(() => {
    debouncedSetConCurrentCall(conCurrentCall);
  }, [conCurrentCall, debouncedSetConCurrentCall]);

  // ---------------------------------------------------------------------------
  // 4. RESTORE SESSION (runs once) — refs are already restored synchronously,
  //    this only restores CurrentCall and clears stuck (>24h) sessions.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const parsedCall = callStorage.getJSON(STORAGE_KEYS.CURRENT_CALL, null);
    if (!parsedCall || CurrentCall) return;

    const startTime = callStartTimeRef.current || 0;
    if (startTime && Date.now() - startTime > 86400000) {
      console.warn("Cleared stuck call session (>24h old)");
      callStartTimeRef.current = null;
      pauseStartTimeRef.current = null;
      isPausedRef.current = false;
      pausedDurationRef.current = 0;
      callStorage.setMany({
        [STORAGE_KEYS.CURRENT_CALL]: null,
        [STORAGE_KEYS.CALL_START_TIME]: null,
        [STORAGE_KEYS.IS_PAUSED]: null,
        [STORAGE_KEYS.PAUSED_DURATION]: null,
        [STORAGE_KEYS.PAUSE_START_TIME]: null,
        [STORAGE_KEYS.RECORDING_TIME]: null,
      });
      return;
    }

    setCurrentCall(parsedCall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally once on mount

  // Start / stop / freeze the timer when the call or pause state changes.
  useEffect(() => {
    if (CurrentCall?.sr && !isPaused && callStartTimeRef.current) {
      setRecordingTime(calculateElapsedTime());
      if (!timerRef.current) startTimer();
      setIsTimerRunningState(true);
    }

    if (isPaused && CurrentCall?.sr && callStartTimeRef.current) {
      stopTimer();
      setRecordingTime(calculateElapsedTime());
      setIsTimerRunningState(false);
    }

    if (!CurrentCall?.sr) {
      stopTimer();
      setIsTimerRunningState(false);
    }
  }, [
    CurrentCall?.sr,
    isPaused,
    calculateElapsedTime,
    setRecordingTime,
    startTimer,
    stopTimer,
  ]);

  // ---------------------------------------------------------------------------
  // 5. ACTIONS
  // ---------------------------------------------------------------------------

  const handlePauseRecording = useCallback(async () => {
    if (isPausedRef.current || !CurrentCall?.sr) return; // Prevent double-pause

    stopTimer();
    setIsTimerRunningState(false); // ⚡ sync flag immediately

    const currentTime = calculateElapsedTime();
    const pauseStartTime = Date.now();

    isPausedRef.current = true;
    pauseStartTimeRef.current = pauseStartTime;

    setIsPaused(true);
    setRecordingTime(currentTime);

    updateLocalStorage({
      [STORAGE_KEYS.IS_PAUSED]: true,
      [STORAGE_KEYS.RECORDING_TIME]: currentTime.toString(),
      [STORAGE_KEYS.PAUSE_START_TIME]: pauseStartTime.toString(),
    });

    try {
      if (activeFollowUp) {
        await pauseFollowUpCall(
          activeFollowUp.followUpCallId,
          activeFollowUp.callLogId,
        );
      } else {
        await PauseCall(CurrentCall.sr);
      }
    } catch (err) {
      console.error("Failed to pause call:", err);
      showNotification("Failed to pause call", "error");
    }
  }, [
    CurrentCall?.sr,
    PauseCall,
    calculateElapsedTime,
    showNotification,
    updateLocalStorage,
    activeFollowUp,
    pauseFollowUpCall,
    setRecordingTime,
    stopTimer,
  ]);

  const handleResumeRecording = useCallback(async () => {
    if (!isPausedRef.current || !CurrentCall?.sr) return;

    const pauseEndTime = Date.now();
    let newPausedDuration;
    if (pauseStartTimeRef.current) {
      const pauseDuration = Math.floor(
        (pauseEndTime - pauseStartTimeRef.current) / 1000,
      );
      newPausedDuration = pausedDurationRef.current + pauseDuration;
    } else if (callStartTimeRef.current) {
      // FALLBACK: pause timestamp lost — continue from the frozen display time.
      const totalElapsed = Math.floor(
        (pauseEndTime - callStartTimeRef.current) / 1000,
      );
      newPausedDuration = Math.max(
        0,
        totalElapsed - (recordingTimeRef.current || 0),
      );
    } else {
      return;
    }

    pauseStartTimeRef.current = null;
    isPausedRef.current = false;
    pausedDurationRef.current = newPausedDuration;

    setIsPaused(false);
    setPausedDuration(newPausedDuration);

    // ⚡ Push correct elapsed time BEFORE the first interval tick (no 1s gap)
    setRecordingTime(calculateElapsedTime());
    setIsTimerRunningState(true); // ⚡ sync flag immediately

    updateLocalStorage({
      [STORAGE_KEYS.IS_PAUSED]: false,
      [STORAGE_KEYS.PAUSED_DURATION]: newPausedDuration.toString(),
      [STORAGE_KEYS.PAUSE_START_TIME]: null,
    });

    startTimer();

    try {
      if (activeFollowUp) {
        await resumeFollowUpCall(
          activeFollowUp.followUpCallId,
          activeFollowUp.callLogId,
        );
      } else {
        await ResumeCall(CurrentCall.sr);
      }
    } catch (err) {
      console.error("Failed to resume call:", err);
      showNotification("Failed to resume call", "error");
    }
  }, [
    CurrentCall?.sr,
    ResumeCall,
    startTimer,
    calculateElapsedTime,
    setRecordingTime,
    showNotification,
    updateLocalStorage,
    activeFollowUp,
    resumeFollowUpCall,
  ]);

  const handleStartRecording = useCallback(() => {
    setRecordingTime(0);
    setIsPaused(false);
    setPausedDuration(0);

    const startTimestamp = Date.now();
    callStartTimeRef.current = startTimestamp;
    pauseStartTimeRef.current = null;
    isPausedRef.current = false;
    pausedDurationRef.current = 0;

    updateLocalStorage({
      [STORAGE_KEYS.CALL_START_TIME]: startTimestamp.toString(),
      [STORAGE_KEYS.PAUSED_DURATION]: "0",
      [STORAGE_KEYS.PAUSE_START_TIME]: null,
    });

    startTimer();
    setIsTimerRunningState(true); // ⚡ sync flag immediately (don't wait for first tick)
  }, [startTimer, updateLocalStorage, setRecordingTime]);

  const handleEndCall = useCallback(async (options = {}) => {
    const currentCallSr = CurrentCall?.sr;
    const duration = pausedDurationRef.current;
    const isEndingFollowUp = !!activeFollowUp;

    if (!options?.skipApi) {
      if (isEndingFollowUp) {
        try {
          const result = await endFollowUpCall(
            activeFollowUp.followUpCallId,
            activeFollowUp.callLogId,
          );
          if (result && !result.success) {
            showNotification(
              result.error?.message ||
                "Failed to end follow-up call properly — ended locally",
              "warning",
            );
            // ⚠️ DO NOT return — fall through so the user is never locked
          } else {
            showNotification("Follow-up call ended", "success");
          }
        } catch (error) {
          console.error("End follow-up call API failed", error);
          showNotification(
            "Server error — call ended locally. Please verify on server.",
            "warning",
          );
        }
      } else if (currentCallSr) {
        try {
          await endCall(currentCallSr, duration);
        } catch (error) {
          console.error("End call API failed (UI cleared safely)", error);
          showNotification("Failed to end call properly", "error");
        }
      }
    }

    stopTimer();
    setIsTimerRunningState(false); // ⚡ sync flag immediately

    callStartTimeRef.current = null;
    pauseStartTimeRef.current = null;
    isPausedRef.current = false;
    pausedDurationRef.current = 0;

    setRecordingTime(0);
    setIsPaused(false);
    setPausedDuration(0);

    if (isEndingFollowUp) {
      updateLocalStorage({
        [STORAGE_KEYS.RECORDING_TIME]: null,
        [STORAGE_KEYS.IS_PAUSED]: null,
        [STORAGE_KEYS.PAUSED_DURATION]: null,
        [STORAGE_KEYS.PAUSE_START_TIME]: null,
        [STORAGE_KEYS.CALL_START_TIME]: null,
      });
      setActiveFollowUp(null);
    } else {
      concurrentCallRef.current = null;
      setCurrentCall(null);
      setConCurrentCall(null);

      updateLocalStorage({
        [STORAGE_KEYS.RECORDING_TIME]: null,
        [STORAGE_KEYS.CURRENT_CALL]: null,
        [STORAGE_KEYS.IS_PAUSED]: null,
        [STORAGE_KEYS.PAUSED_DURATION]: null,
        [STORAGE_KEYS.PAUSE_START_TIME]: null,
        [STORAGE_KEYS.CALL_START_TIME]: null,
        [STORAGE_KEYS.CONCURRENT_CALL]: null,
      });
    }
  }, [
    CurrentCall?.sr,
    endCall,
    setCurrentCall,
    updateLocalStorage,
    showNotification,
    activeFollowUp,
    setActiveFollowUp,
    endFollowUpCall,
    setRecordingTime,
    stopTimer,
  ]);

  // ---------------------------------------------------------------------------
  // 6. CLEANUP + UNLOAD SAFETY
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Flush (not cancel) so the latest concurrent call is never lost
      debouncedSetConCurrentCall.flush();
    };
  }, [debouncedSetConCurrentCall]);

  // Save all timing data before the page unloads (reads refs → never stale).
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!CurrentCall?.sr) return;
      callStorage.setMany({
        [STORAGE_KEYS.RECORDING_TIME]: calculateElapsedTime().toString(),
        [STORAGE_KEYS.CURRENT_CALL]: CurrentCall,
        [STORAGE_KEYS.IS_PAUSED]: JSON.stringify(isPausedRef.current),
        [STORAGE_KEYS.PAUSED_DURATION]: pausedDurationRef.current.toString(),
        [STORAGE_KEYS.SLIDERS_STATE]: sliders,
      });
      if (typeof pauseStartTimeRef.current === "number") {
        callStorage.set(
          STORAGE_KEYS.PAUSE_START_TIME,
          pauseStartTimeRef.current.toString(),
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [CurrentCall, sliders, calculateElapsedTime]);

  // ---------------------------------------------------------------------------
  // 7. DERIVED STATUS (stable object for memoized children)
  // ---------------------------------------------------------------------------
  const callStatusValue = useMemo(
    () => ({
      currentCallId: CurrentCall?.sr,
      duration: isTimerActive ? recordingTimeRef.current || 1 : 0,
      isRunning: isTimerRunningState,
      actualElapsedTime: CurrentCall?.sr ? calculateElapsedTime() : 0,
    }),
    [CurrentCall?.sr, isTimerActive, isTimerRunningState, calculateElapsedTime],
  );

  return {
    // values
    recordingTime,
    recordingTimeRef,
    isPaused,
    callStatusValue,
    conCurrentCall,
    concurrentCallRef,
    // refs needed by layout handlers
    timerRef,
    callStartTimeRef,
    // setters / actions
    setConCurrentCall,
    stopTimer,
    calculateElapsedTime,
    handlePauseRecording,
    handleResumeRecording,
    handleStartRecording,
    handleEndCall,
  };
}
