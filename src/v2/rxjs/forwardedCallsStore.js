import { BehaviorSubject, combineLatest } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";
import { useSyncExternalStore } from "react";
import { parseFollowUpList, isForwardedCall } from "../utils/callLogUtils.js";

// 1. BehaviorSubjects for reactive data sources
export const rawCalls$ = new BehaviorSubject([]);
export const currentUser$ = new BehaviorSubject(null);

/**
 * Calculates forwarded calls using the user's exact matching logic,
 * made reactive with RxJS.
 */
export const computeForwardedCalls = (calls = [], user = null) => {
  if (!Array.isArray(calls) || calls.length === 0) return [];

  const normalize = (str) =>
    (str || "").replace(/\s+/g, " ").trim().toLowerCase();

  const userFullName =
    user?.fullName ||
    (user?.firstname || user?.lastname
      ? `${user?.firstname || ""} ${user?.lastname || ""}`.trim()
      : "") ||
    user?.name ||
    user?.userName ||
    "";
  const fullName = normalize(userFullName);
  const designation = normalize(user?.designation);

  if (!fullName) return [];

  const isNotClosed = (item) => {
    if (!item) return false;
    const closed = item?.callClosed || item?.CallClosed;
    if (!closed || String(closed).trim() === "" || String(closed).startsWith("1900-01-01")) {
      return true;
    }
    return false;
  };

  const collected = [];

  for (const val of calls) {
    if (!val) continue;

    // --- Main Call ---
    const assignedName = normalize(val?.AssignedEmpName);
    const deptName = normalize(val?.DeptName);

    const isAssignedToCurrentUser =
      assignedName === fullName &&
      (deptName === designation || !designation || !deptName);

    const isForwarded =
      !!assignedName &&
      (!!deptName ||
        (val?.receivedBy && normalize(val.receivedBy) !== assignedName) ||
        isAssignedToCurrentUser);

    if (isForwarded && isAssignedToCurrentUser && isNotClosed(val)) {
      collected.push({
        ...val,
        sr: val.sr,
        id: `main-${val.sr}`,
        receivedBy: val.receivedBy || "Team Member",
        forwardedBy: val.receivedBy || "Team Member",
        forwardedTo: val.AssignedEmpName || "You",
        AssignedEmpName: val.AssignedEmpName,
        DeptName: val.DeptName || "",
        company: val.company || "Unknown Company",
        callBy: val.callBy || "Client",
        time: val.time || "Recent",
        date: val.date || val.callStart,
        description: val.description || "Forwarded call",
        priority: val.priority || "Normal",
      });
    }

    // --- Nested FollowUpList Sub-Calls ---
    const followUps = parseFollowUpList(val.FollowUpList);
    if (Array.isArray(followUps) && followUps.length > 0) {
      for (const fu of followUps) {
        if (!fu) continue;

        const fuAssigned = normalize(fu.ForwardedEmp || fu.AssignedEmpName);
        const fuDept = normalize(fu.DeptName || deptName);
        const isFuForwarded = isForwardedCall(fu) || !!fuAssigned;

        const isFuAssignedToCurrentUser =
          fuAssigned === fullName &&
          (fuDept === designation || !designation || !fuDept);

        if (isFuForwarded && isFuAssignedToCurrentUser && isNotClosed(fu)) {
          collected.push({
            ...val,
            sr: val.sr,
            id: fu.Id || fu.id || `sub-${val.sr}`,
            followUpId: fu.Id || fu.id,
            receivedBy: fu.CreatedBy || val.receivedBy || "Team Member",
            forwardedBy: fu.CreatedBy || val.receivedBy || "Team Member",
            forwardedTo: fu.ForwardedEmp || fu.AssignedEmpName || val.AssignedEmpName || "You",
            AssignedEmpName: fu.ForwardedEmp || fu.AssignedEmpName || val.AssignedEmpName,
            DeptName: fu.DeptName || val.DeptName || "",
            company: val.company || "Unknown Company",
            callBy: val.callBy || "Client",
            time: fu.CallStart
              ? fu.CallStart.split("T")[1]?.slice(0, 5) || fu.CallStart
              : val.time || "Recent",
            date: fu.CallStart || val.date,
            description: fu.Description || fu.Descr || val.description || "Forwarded call",
            priority: fu.priority || val.priority || "Normal",
            isForwardedFollowUp: true,
            followUpData: fu,
          });
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set();
  const unique = [];
  for (const item of collected) {
    const key = `${item.sr}-${item.followUpId || "main"}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique.sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
};

// 2. BehaviorSubject holding current forwarded calls stream
export const forwardedCalls$ = new BehaviorSubject([]);

// Combine rawCalls$ and currentUser$ to reactively compute forwardedCalls$
combineLatest([rawCalls$, currentUser$])
  .pipe(
    map(([calls, user]) => computeForwardedCalls(calls, user)),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  )
  .subscribe((result) => {
    forwardedCalls$.next(result);
  });

// 3. Helper actions to update stream inputs
export const updateRawCalls = (calls) => {
  rawCalls$.next(calls || []);
};

export const updateCurrentUser = (user) => {
  currentUser$.next(user || null);
};

// 4. Custom React Hook to consume forwarded calls via RxJS
export function useForwardedCalls() {
  return useSyncExternalStore(
    (callback) => {
      const subscription = forwardedCalls$.subscribe(callback);
      return () => subscription.unsubscribe();
    },
    () => forwardedCalls$.getValue()
  );
}
