import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Normalizes a raw call record from live API into a clean thread item.
 */
export function normalizeCallRecord(rec, idx = 0) {
  if (!rec) return null;

  // Parse follow-up list if stringified
  let parsedFollowUps = [];
  if (rec.FollowUpList) {
    if (typeof rec.FollowUpList === 'string') {
      try {
        parsedFollowUps = JSON.parse(rec.FollowUpList);
      } catch (_) {
        parsedFollowUps = [];
      }
    } else if (Array.isArray(rec.FollowUpList)) {
      parsedFollowUps = rec.FollowUpList;
    }
  }

  // Parse comments if stringified
  let parsedComments = [];
  if (rec.comment) {
    if (typeof rec.comment === 'string') {
      try {
        parsedComments = JSON.parse(rec.comment);
      } catch (_) {
        parsedComments = [];
      }
    } else if (Array.isArray(rec.comment)) {
      parsedComments = rec.comment;
    }
  }

  const sr = rec.sr || rec.id || idx;
  const company = (rec.company || 'Unknown Company').trim();
  const callBy = (rec.callBy || 'Client Caller').trim();
  const receivedBy = (rec.receivedBy || rec.AssignedEmpName || 'Support Desk').trim();
  const projectId = rec.ProjectID || rec.projectID || rec.projectId || rec.CompanyID || rec.project_id || '';

  return {
    id: `call-${sr}`,
    sr,
    name: callBy || company,
    company,
    projectId,
    callBy,
    receivedBy,
    AssignedEmpName: rec.AssignedEmpName || '',
    lastMessage:
      rec.description ||
      (rec.Estatus ? `Call Status: ${rec.Estatus}` : 'Voice support call logged'),
    timestamp: rec.time || '',
    date: rec.date || rec.callStart || '',
    status: rec.status || 'Solved',
    estatus: rec.Estatus || rec.estatus || 'Completed',
    statusId: rec.StatusID || rec.statusId || '',
    estatusId: rec.EStatusId || rec.estatusId || '',
    priority: rec.priority || rec.PriorityId || 'Normal',
    priorityId: rec.PriorityId || '',
    rating: Number(rec.rating) || 0,
    duration: rec.CallDuration || '',
    callStart: rec.callStart,
    callClosed: rec.callClosed,
    DeptName: rec.DeptName || '',
    appname: rec.appname || '',
    topicRaisedBy: rec.topicRaisedBy || '',
    unread: false,
    followUps: parsedFollowUps,
    comments: parsedComments,
    rawRecord: {
      ...rec,
      sr,
      company,
      projectId,
      callBy,
      receivedBy,
      followUps: parsedFollowUps,
      comments: parsedComments,
    },
  };
}

/**
 * High-Performance RxJS Reactive Call Stream Service
 */
class CallStreamService {
  constructor() {
    this.threads$ = new BehaviorSubject([]);
    this.companies$ = new BehaviorSubject([]);
    this.activeThreadId$ = new BehaviorSubject(null);
    this.selectedCompany$ = new BehaviorSubject('all');
    this.searchQuery$ = new BehaviorSubject('');
    this.viewMode$ = new BehaviorSubject('team'); // 'normal' (user view) | 'team' | 'followUp-Pending' | 'followUp-Completed'
    this.statusFilter$ = new BehaviorSubject('all');
    this.dateRange$ = new BehaviorSubject(null); // { start, end }
    this.currentUser$ = new BehaviorSubject(null);
    this.isLoading$ = new BehaviorSubject(true);
    this.customMessages$ = new BehaviorSubject({});
    this.unreadThreadIds = new Set();
    let savedCall = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('newcall_active_voip_session');
        if (raw) {
          savedCall = JSON.parse(raw);
        }
      } catch (_) {}
    }
    this.activeCall$ = new BehaviorSubject(savedCall);

    // Debounced search observable (120ms)
    this.debouncedSearch$ = this.searchQuery$.pipe(
      debounceTime(120),
      distinctUntilChanged()
    );

    // Derived: Instant Filtered Threads Stream over 15,000+ items
    this.filteredThreads$ = combineLatest([
      this.threads$,
      this.selectedCompany$,
      this.debouncedSearch$,
      this.viewMode$,
      this.dateRange$,
      this.currentUser$,
    ]).pipe(
      map(([threads, selectedCompany, searchQuery, viewMode, dateRange, currentUser]) => {
        if (!threads || threads.length === 0) return [];

        const norm = (s) => (s ? String(s).toLowerCase().replace(/[\s\-_]/g, '') : '');
        const query = searchQuery ? searchQuery.trim().toLowerCase() : '';

        // selectedCompany = left-rail company avatar click (local client-side filter only)
        const compFilter = selectedCompany && selectedCompany !== 'all'
            ? (Array.isArray(selectedCompany) ? selectedCompany : [selectedCompany])
                .map((c) => norm(c))
                .filter(Boolean)
            : null;

        const isValidDateString = (d) =>
          d && typeof d === 'string' && !d.startsWith('1900-01-01');

        const loggedUser = currentUser?.firstname
          ? `${currentUser.firstname} ${currentUser.lastname || ''}`.trim().toLowerCase()
          : (currentUser?.name || '').toLowerCase();
        const loggedUserId = String(currentUser?.id || '').toLowerCase();

        const startDateMs =
          dateRange?.start && !isNaN(new Date(dateRange.start).getTime())
            ? new Date(dateRange.start).setHours(0, 0, 0, 0)
            : null;
        const endDateMs =
          dateRange?.end && !isNaN(new Date(dateRange.end).getTime())
            ? new Date(dateRange.end).setHours(23, 59, 59, 999)
            : null;

        const filtered = [];
        for (let i = 0; i < threads.length; i++) {
          const t = threads[i];
          const raw = t.rawRecord || {};

          // 1. View Mode Filtering — LOCAL CLIENT SIDE (exact old CallLog memoizedFilteredCalls behavior)
          if (viewMode === 'normal' && (loggedUser || loggedUserId)) {
            const recBy = (t.receivedBy || raw.receivedBy || '').toLowerCase();
            const assBy = (t.AssignedEmpName || raw.AssignedEmpName || '').toLowerCase();
            const createdBy = String(raw.CreatedBy || raw.createdBy || '').toLowerCase();
            const rawEmpId = String(raw.EmpId || raw.empId || '').toLowerCase();

            const isMyCall =
              (loggedUser && (recBy === loggedUser || assBy === loggedUser || recBy.includes(loggedUser) || assBy.includes(loggedUser))) ||
              (loggedUserId && (createdBy === loggedUserId || recBy === loggedUserId || rawEmpId === loggedUserId));

            if (!isMyCall) continue;
          } else if (viewMode === 'followUp-Pending') {
            const followUps = t.followUps || [];
            const hasPending = followUps.some(
              (fu) =>
                !isValidDateString(fu.CallClosed) &&
                (!fu.CallDuration || fu.CallDuration === '00:00:00')
            );
            if (!hasPending) continue;
          } else if (viewMode === 'followUp-Completed') {
            const followUps = t.followUps || [];
            const hasCompleted = followUps.some(
              (fu) =>
                isValidDateString(fu.CallClosed) ||
                (fu.CallDuration && fu.CallDuration !== '00:00:00')
            );
            if (!hasCompleted) continue;
          }

          // 2. Left-Rail Company Avatar Click Filter — LOCAL CLIENT SIDE, EXACT MATCH ONLY
          // CompanyAvatarRail sends comp.projectId (numeric) OR comp.name (exact string)
          // We match EXACTLY to avoid "optigo" matching "optigocarely" etc.
          if (compFilter && compFilter.length > 0) {
            const tComp = norm(t.company);
            const tProjRaw = String(raw.projectID || raw.ProjectID || raw.projectId || '');

            const matchesComp = compFilter.some((c) => {
              if (!c) return false;
              // Numeric projectId match (e.g. "46" === "46")
              if (tProjRaw && tProjRaw === c) return true;
              // Exact company name match (normalized)
              if (tComp && tComp === c) return true;
              return false;
            });
            if (!matchesComp) continue;
          }

          // NOTE: Status filter is SERVER-SIDE (sent as statusId to API). Do NOT filter locally.
          // NOTE: TopBar Company dropdown (projectId) filter is SERVER-SIDE. Do NOT filter locally.

          // 3. Date Range Filter — LOCAL CLIENT SIDE (for AirbnbDateRangePicker)
          if (startDateMs || endDateMs) {
            const targetField = dateRange?.field;
            let callDateStr = '';
            if (targetField === 'callStart') {
              callDateStr = t.callStart || raw.callStart;
            } else if (targetField === 'callClosed') {
              callDateStr = t.callClosed || raw.callClosed;
            } else {
              callDateStr = t.date || raw.EntryDate || raw.date || t.callStart;
            }

            if (callDateStr && !String(callDateStr).startsWith('1900-01-01')) {
              const callTime = new Date(callDateStr).getTime();
              if (!isNaN(callTime)) {
                if (startDateMs && callTime < startDateMs) continue;
                if (endDateMs && callTime > endDateMs) continue;
              }
            }
          }

          // 4. Search Query Filter — LOCAL CLIENT SIDE
          if (query) {
            const tName = (t.name || '').toLowerCase();
            const tComp = (t.company || '').toLowerCase();
            const tCallBy = (t.callBy || '').toLowerCase();
            const tMsg = (t.lastMessage || '').toLowerCase();
            const tSr = String(t.sr || '');
            const tEmp = (t.receivedBy || t.AssignedEmpName || '').toLowerCase();

            if (
              !tName.includes(query) &&
              !tComp.includes(query) &&
              !tCallBy.includes(query) &&
              !tMsg.includes(query) &&
              !tSr.includes(query) &&
              !tEmp.includes(query)
            ) {
              continue;
            }
          }

          filtered.push(t);
        }

        return filtered;
      })
    );

    // Derived: Active Thread stream
    this.activeThread$ = combineLatest([
      this.threads$,
      this.activeThreadId$,
    ]).pipe(
      map(([threads, activeId]) => {
        if (!threads || threads.length === 0) return null;
        if (!activeId) return threads[0];
        return threads.find((t) => t.id === activeId || String(t.sr) === String(activeId)) || threads[0];
      })
    );
  }

  // Initialize data
  initData(rawCallsList, prebuiltCompanies = null) {
    if (!Array.isArray(rawCallsList)) return;

    const normalizedThreads = rawCallsList.map((rec, idx) => {
      const thread = normalizeCallRecord(rec, idx);
      if (!thread) return null;
      const isUnread =
        this.unreadThreadIds.has(thread.id) ||
        this.unreadThreadIds.has(String(thread.sr)) ||
        this.unreadThreadIds.has(`call-${thread.sr}`);
      thread.unread = isUnread;
      return thread;
    }).filter(Boolean);

    // Extract companies if not provided
    let companies = prebuiltCompanies;
    if (!companies || companies.length === 0) {
      const companyMap = new Map();
      for (let i = 0; i < normalizedThreads.length; i++) {
        const c = normalizedThreads[i].company;
        const pId =
          normalizedThreads[i].projectId ||
          normalizedThreads[i].rawRecord?.ProjectID ||
          normalizedThreads[i].rawRecord?.projectID;
        if (c && c !== 'Unknown Company') {
          if (!companyMap.has(c)) {
            companyMap.set(c, { count: 0, projectId: pId });
          }
          const entry = companyMap.get(c);
          entry.count += 1;
          if (!entry.projectId && pId) entry.projectId = pId;
        }
      }

      const palette = [
        '#6900C6',
        '#0284C7',
        '#059669',
        '#D97706',
        '#DC2626',
        '#4F46E5',
        '#7C3AED',
        '#DB2777',
        '#0891B2',
        '#475569',
      ];

      companies = Array.from(companyMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .map(([compName, meta], idx) => ({
          id: meta.projectId ? Number(meta.projectId) : compName.toLowerCase().replace(/\s+/g, '-'),
          projectId: meta.projectId ? Number(meta.projectId) : null,
          name: compName,
          count: meta.count,
          avatarColor: palette[idx % palette.length],
          initial: compName.charAt(0).toUpperCase(),
        }));
    }

    this.threads$.next(normalizedThreads);
    this.companies$.next(companies);

    const currentActive = this.activeThreadId$.getValue();
    const activeVoip = this.activeCall$.getValue();

    if (activeVoip?.sr) {
      this.activeThreadId$.next(`call-${activeVoip.sr}`);
    } else if (currentActive) {
      const stillExists = normalizedThreads.some(
        (t) => t.id === currentActive || String(t.sr) === String(currentActive) || `call-${t.sr}` === currentActive
      );
      if (!stillExists && normalizedThreads.length > 0) {
        this.activeThreadId$.next(normalizedThreads[0].id);
      }
    } else if (normalizedThreads.length > 0) {
      this.activeThreadId$.next(normalizedThreads[0].id);
    }
    this.isLoading$.next(false);
  }

  // Actions
  selectThread(threadId) {
    this.activeThreadId$.next(threadId);
    this.unreadThreadIds.delete(threadId);
    this.unreadThreadIds.delete(String(threadId));
    this.unreadThreadIds.delete(`call-${threadId}`);

    const currentThreads = this.threads$.getValue();
    const hasUnread = currentThreads.some(
      (t) => (t.id === threadId || String(t.sr) === String(threadId) || `call-${t.sr}` === threadId) && t.unread
    );
    if (hasUnread) {
      const updated = currentThreads.map((t) => {
        if (t.id === threadId || String(t.sr) === String(threadId) || `call-${t.sr}` === threadId) {
          return { ...t, unread: false };
        }
        return t;
      });
      this.threads$.next(updated);
    }
  }

  selectCompany(companyName) {
    this.selectedCompany$.next(companyName);
  }

  setSearchQuery(query) {
    this.searchQuery$.next(query);
  }

  setViewMode(mode) {
    this.viewMode$.next(mode);
  }

  setStatusFilter(status) {
    this.statusFilter$.next(status);
  }

  setDateRange(range) {
    this.dateRange$.next(range);
  }

  setCurrentUser(user) {
    this.currentUser$.next(user);
  }

  // Update Call Status, Priority, Rating in stream
  updateCallStatus(threadId, updates = {}) {
    const currentThreads = this.threads$.getValue();
    const updated = currentThreads.map((t) => {
      if (t.id === threadId || String(t.sr) === String(threadId)) {
        return {
          ...t,
          ...updates,
          rawRecord: {
            ...t.rawRecord,
            ...updates,
          },
        };
      }
      return t;
    });
    this.threads$.next(updated);
  }

  // Optimistically patch follow-up call data (Start, End, Duration, Status) in stream
  patchFollowUpCall(callLogId, followUpId, patchData = {}) {
    if (!callLogId || !followUpId) return;
    const currentThreads = this.threads$.getValue();
    const updatedThreads = currentThreads.map((t) => {
      if (String(t.sr) !== String(callLogId) && String(t.id) !== String(callLogId)) {
        return t;
      }
      const raw = { ...(t.rawRecord || {}) };
      let followUps = [];
      if (typeof raw.FollowUpList === 'string') {
        try {
          followUps = JSON.parse(raw.FollowUpList);
        } catch (_) {
          followUps = [];
        }
      } else if (Array.isArray(raw.FollowUpList)) {
        followUps = [...raw.FollowUpList];
      }

      let found = false;
      const updatedFollowUps = followUps.map((fu) => {
        const id = fu.Id ?? fu.id ?? fu.followUpCallId;
        if (String(id) === String(followUpId)) {
          found = true;
          return {
            ...fu,
            ...patchData,
          };
        }
        return fu;
      });

      if (!found && patchData) {
        updatedFollowUps.push({
          Id: followUpId,
          ...patchData,
        });
      }

      raw.FollowUpList = JSON.stringify(updatedFollowUps);
      return {
        ...t,
        rawRecord: raw,
        followUps: updatedFollowUps,
      };
    });
    this.threads$.next(updatedThreads);
  }

  // Optimistically patch primary call data (CallClosed, CallDuration, Status) in stream
  patchPrimaryCall(callLogId, patchData = {}) {
    if (!callLogId) return;
    const currentThreads = this.threads$.getValue();
    const updatedThreads = currentThreads.map((t) => {
      if (String(t.sr) !== String(callLogId) && String(t.id) !== String(callLogId)) {
        return t;
      }
      return {
        ...t,
        ...patchData,
        rawRecord: {
          ...t.rawRecord,
          ...patchData,
        },
      };
    });
    this.threads$.next(updatedThreads);
  }

  // Optimistically prepend newly created call log into reactive stream
  addNewCall(rawRecord, autoSelect = false) {
    if (!rawRecord) return;
    const currentThreads = this.threads$.getValue() || [];
    const normalized = normalizeCallRecord(rawRecord, currentThreads.length);
    if (!normalized) return;
    if (!autoSelect) {
      this.unreadThreadIds.add(normalized.id);
      this.unreadThreadIds.add(String(normalized.sr));
      this.unreadThreadIds.add(`call-${normalized.sr}`);
      normalized.unread = true;
    } else {
      this.unreadThreadIds.delete(normalized.id);
      this.unreadThreadIds.delete(String(normalized.sr));
      this.unreadThreadIds.delete(`call-${normalized.sr}`);
      normalized.unread = false;
    }

    // Update companies list with new count
    const currentCompanies = this.companies$.getValue() || [];
    const compName = normalized.company;
    if (compName && compName !== 'Unknown Company') {
      const idx = currentCompanies.findIndex(
        (c) => c.name?.toLowerCase() === compName.toLowerCase()
      );
      if (idx !== -1) {
        currentCompanies[idx] = {
          ...currentCompanies[idx],
          count: (currentCompanies[idx].count || 0) + 1,
        };
        this.companies$.next([...currentCompanies]);
      } else {
        this.companies$.next([
          { name: compName, count: 1, color: '#6900C6', projectId: normalized.projectId },
          ...currentCompanies,
        ]);
      }
    }

    const exists = currentThreads.some((t) => String(t.sr) === String(normalized.sr));
    const updatedThreads = exists
      ? currentThreads.map((t) => (String(t.sr) === String(normalized.sr) ? { ...t, ...normalized } : t))
      : [normalized, ...currentThreads];
    this.threads$.next(updatedThreads);

    const currentActive = this.activeThreadId$.getValue();
    const activeVoip = this.activeCall$.getValue();

    // If an active call is ongoing, NEVER switch!
    if (activeVoip?.sr) {
      this.activeThreadId$.next(`call-${activeVoip.sr}`);
      return;
    }

    if (autoSelect || !currentActive) {
      this.activeThreadId$.next(normalized.id);
    }
  }

  // Optimistically patch comment into thread's rawRecord and comments list
  patchComment(callLogId, commentObj) {
    if (!callLogId || !commentObj) return;
    const currentThreads = this.threads$.getValue();
    const updatedThreads = currentThreads.map((t) => {
      if (String(t.sr) !== String(callLogId) && String(t.id) !== String(callLogId)) {
        return t;
      }
      const raw = { ...(t.rawRecord || {}) };
      let comments = [];
      if (typeof raw.comment === 'string') {
        try {
          comments = JSON.parse(raw.comment);
        } catch (_) {
          comments = [];
        }
      } else if (Array.isArray(raw.comment)) {
        comments = [...raw.comment];
      }

      comments.push(commentObj);
      raw.comment = JSON.stringify(comments);
      return {
        ...t,
        rawRecord: raw,
        comments,
      };
    });
    this.threads$.next(updatedThreads);
  }

  // Add custom messages / follow-ups
  addCustomMessage(threadId, message, callLogSr = null) {
    if (!threadId || !message) return;
    const current = this.customMessages$.getValue();
    const existing = current[threadId] || [];
    const updated = {
      ...current,
      [threadId]: [...existing, message],
    };
    if (callLogSr && String(callLogSr) !== String(threadId)) {
      const existingSr = current[String(callLogSr)] || [];
      updated[String(callLogSr)] = [...existingSr, message];
    }
    this.customMessages$.next(updated);
  }

  // VoIP call start / update / end
  startCall(thread, options = {}) {
    const isFu = Boolean(options.isFollowUp || options.followUpId);
    const active = {
      callId: `live-${Date.now()}`,
      sr: thread?.sr,
      followUpId: options.followUpId || null,
      isFollowUp: isFu,
      isForwarded: Boolean(options.isForwarded),
      callTitle:
        options.title ||
        (isFu
          ? `Follow-Up Call #${options.followUpId || ''}`
          : options.isForwarded
          ? `Forwarded Call`
          : `Primary Call #${thread?.sr || ''}`),
      callerName: options.callerName || thread?.callBy || thread?.name || 'Client',
      company: thread?.company || 'Unknown',
      startTime: Date.now(),
      durationSeconds: 0,
      pausedDurationMs: 0,
      pausedAt: null,
      isMuted: false,
      isSpeaker: true,
      isPaused: false,
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('newcall_active_voip_session', JSON.stringify(active));
      } catch (_) {}
    }
    this.activeCall$.next(active);
    return active;
  }

  updateActiveCall(updates) {
    const current = this.activeCall$.getValue();
    if (!current) return;
    const merged = {
      ...current,
      ...updates,
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('newcall_active_voip_session', JSON.stringify(merged));
      } catch (_) {}
    }
    this.activeCall$.next(merged);
  }

  endCall() {
    const current = this.activeCall$.getValue();
    const duration = current?.durationSeconds || 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('newcall_active_voip_session');
      } catch (_) {}
    }
    this.activeCall$.next(null);
    return duration;
  }

  formatDuration(secs) {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(s)}`;
    return `00:${pad(mins)}:${pad(s)}`;
  }
}

export const callStreamService = new CallStreamService();
