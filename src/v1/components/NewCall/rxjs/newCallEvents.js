import { BehaviorSubject } from 'rxjs';
import { useSyncExternalStore } from 'react';

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

export const openDurationModal = (call) => {
  durationModal$.next({ open: true, call });
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
