import { BehaviorSubject } from 'rxjs';
import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { getActiveCallSession } from '../../../rxjs/activeCallSessionStore';

/**
 * RxJS Event Bus & Global State for NewCall Workspace
 */

// 1. Modal Trigger Subjects
export const addCallModal$ = new BehaviorSubject({ open: false, defaultCompany: '' });
export const addFollowUpModal$ = new BehaviorSubject({ open: false, call: null });
export const editCallModal$ = new BehaviorSubject({ open: false, call: null });
let editCallModalSession = 0;
export const forwardCallModal$ = new BehaviorSubject({ open: false, call: null });
export const durationModal$ = new BehaviorSubject({ open: false, call: null });
export const ratingModal$ = new BehaviorSubject({ open: false, call: null });
export const rightInspectorOpen$ = new BehaviorSubject(false);

// 2. VoIP Audio / Live Call Subject
export const voipCall$ = new BehaviorSubject(null); // { callId, sr, callerName, company, seconds, isMuted, isSpeaker, isPaused }

// 3. Actions
export const openAddCallModal = (defaultCompany = '') => {
  addCallModal$.next({ open: true, defaultCompany });
};

export const closeAddCallModal = () => {
  addCallModal$.next({ open: false, defaultCompany: '' });
};

export const openAddFollowUpModal = (call) => {
  addFollowUpModal$.next({ open: true, call });
};

export const closeAddFollowUpModal = () => {
  addFollowUpModal$.next({ open: false, call: null });
};

export const openEditCallModal = (call) => {
  // Give each opening its own identity so edits can initialize once, even when
  // the live call record changes while the drawer remains open.
  editCallModalSession += 1;
  editCallModal$.next({ open: true, call, sessionId: editCallModalSession });
};

export const closeEditCallModal = () => {
  editCallModal$.next({ open: false, call: null, sessionId: editCallModalSession });
};

export const openForwardCallModal = (call) => {
  forwardCallModal$.next({ open: true, call });
};

export const closeForwardCallModal = () => {
  forwardCallModal$.next({ open: false, call: null });
};

const hasRealDate = (d) => Boolean(d) && !String(d).startsWith('1900-01-01');

/**
 * A call is live while it has started but not ended, or it is the call in the shared live session.
 * Its duration is still counting, so it must not be edited yet.
 */
export const isLiveCall = (call) => {
  if (!call) return false;
  const raw = call.rawRecord || call;
  if (hasRealDate(raw.callClosed || raw.CallClosed)) return false;
  const session = getActiveCallSession();
  const isSessionCall =
    Boolean(session) &&
    !session.isFollowUp &&
    String(session.sr) === String(raw.sr ?? raw.id ?? raw.CallLogid);
  return hasRealDate(raw.callStart || raw.CallStart) || isSessionCall;
};

export const LIVE_CALL_EDIT_MESSAGE = 'This call is still running. End the call before editing its duration.';

export const openDurationModal = (call) => {
  if (isLiveCall(call)) {
    toast.info(LIVE_CALL_EDIT_MESSAGE);
    return false;
  }
  durationModal$.next({ open: true, call });
  return true;
};

export const closeDurationModal = () => {
  durationModal$.next({ open: false, call: null });
};

export const openRatingModal = (call) => {
  ratingModal$.next({ open: true, call });
};

export const closeRatingModal = () => {
  ratingModal$.next({ open: false, call: null });
};

export const toggleRightInspector = (forceState = null) => {
  rightInspectorOpen$.next(
    forceState !== null ? forceState : !rightInspectorOpen$.value
  );
};

// 4. Custom React Hook to subscribe to any RxJS Subject with React 18
export function useNewCallSubject(subject$) {
  return useSyncExternalStore(
    (callback) => {
      const subscription = subject$.subscribe(callback);
      return () => subscription.unsubscribe();
    },
    () => subject$.getValue()
  );
}
