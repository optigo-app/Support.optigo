import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { hasRealTicket } from '../utils/ticketStatusUtils';
import { isValidDate, formatFriendlyTime, getLocalISOString } from '../utils/dateUtils';
import { getCallSource } from '../utils/callSource';
import {
  getCommentRecordId,
  normalizeCommentRecord,
  parseCommentRecords,
  upsertCommentRecord,
} from '../utils/commentStreamUtils';
export const COMPANY_PALETTE = [
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

export const normComp = (s) => (s ? String(s).toLowerCase().replace(/[\s\-_]/g, '') : '');
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
  } else if (rec.CommentsArray) {
    if (typeof rec.CommentsArray === 'string') {
      try {
        parsedComments = JSON.parse(rec.CommentsArray);
      } catch (_) {
        parsedComments = [];
      }
    } else if (Array.isArray(rec.CommentsArray)) {
      parsedComments = rec.CommentsArray;
    }
  } else if (Array.isArray(rec.comments)) {
    parsedComments = rec.comments;
  }

  // Extract latest comment (WhatsApp style preview & timestamp)
  let latestCommentText = '';
  let latestCommentTime = '';
  if (Array.isArray(parsedComments) && parsedComments.length > 0) {
    const lastComment = parsedComments[parsedComments.length - 1];
    latestCommentText = (
      lastComment.text ||
      lastComment.comment ||
      lastComment.Comments ||
      lastComment.Remarks ||
      (lastComment.img || lastComment.FilePath ? '📷 Photo' : '') ||
      ''
    ).trim();

    const rawCommentTime = lastComment.time || lastComment.CreatedDate || lastComment.createdDate;
    if (rawCommentTime) {
      try {
        const clean = String(rawCommentTime).replace(/Z$/i, '').replace(' ', 'T');
        const dt = new Date(clean);
        if (!isNaN(dt.getTime())) {
          latestCommentTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch (_) {}
    }
  }

  const sr = rec.sr || rec.id || idx;
  const company = (rec.company || 'Unknown Company').trim();
  const callBy = (rec.callBy || 'Client Caller').trim();
  const receivedBy = (rec.receivedBy || rec.AssignedEmpName || 'Support Desk').trim();
  const projectId = rec.ProjectID || rec.projectID || rec.projectId || rec.CompanyID || rec.project_id || '';

  const hasTicket = hasRealTicket(rec);
  const isEnded = Boolean(
    ((rec.callClosed || rec.CallClosed) && isValidDate(rec.callClosed || rec.CallClosed)) ||
    (rec.CallDuration && !['00:00:00', '00:00', '0'].includes(String(rec.CallDuration)))
  );

  // A missing close time/duration means the call has not been completed.
  // Do not infer "Solved" or "Completed" from an absent status.
  let rawStatus = rec.status || (isEnded ? 'Solved' : 'Pending');
  let rawEstatus = rec.Estatus || rec.estatus || (isEnded ? 'Completed' : 'Running');
  if (!isEnded && !isValidDate(rec.callStart || rec.CallStart) &&
      String(rawStatus).trim().toLowerCase() === 'solved') {
    rawStatus = 'Pending';
  }
  if (!isEnded && !isValidDate(rec.callStart || rec.CallStart) &&
      String(rawEstatus).trim().toLowerCase() === 'completed') {
    rawEstatus = 'Running';
  }

  if (!hasTicket) {
    if (String(rawStatus).trim().toLowerCase() === 'ticket generated') {
      rawStatus = isEnded ? 'Solved' : 'Pending';
    }
    if (String(rawEstatus).trim().toLowerCase() === 'ticket generated') {
      rawEstatus = isEnded ? 'Completed' : 'Running';
    }
  }

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
      latestCommentText ||
      rec.description ||
      (rawEstatus ? `Call Status: ${rawEstatus}` : 'Voice support call logged'),
    timestamp: latestCommentTime || rec.time || '',
    date: rec.date || rec.callStart || '',
    status: rawStatus,
    estatus: rawEstatus,
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
    topicRaisedBy: getCallSource(rec),
    unread: Boolean(rec.hasNewComment || rec.HasNewComment || rec.unread),
    unreadCount: Math.max(
      0,
      Number(rec.unreadCount ?? rec.UnreadCount ?? rec.NewCommentCount ?? rec.newCommentCount ?? (rec.hasNewComment ? 1 : 0)) || 0
    ),
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
    this.unreadCommentCounts = new Map();
    this.newCallThreadIds = new Set();
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
            const hasPending = followUps.some((fu) => {
              const fuInternalStatus = String(fu.InternalStatus || fu.internalStatus || fu.status || '').trim().toLowerCase();
              const isSolved =
                fu.statusId === 4 ||
                fu.StatusId === 4 ||
                fuInternalStatus === 'solved' ||
                fuInternalStatus === 'completed' ||
                fuInternalStatus === 'closed' ||
                String(fu.Estatus || fu.estatus || '').trim().toLowerCase() === 'completed';

              return !isSolved && !isValidDateString(fu.CallClosed) && (!fu.CallDuration || fu.CallDuration === '00:00:00');
            });
            if (!hasPending) continue;
          } else if (viewMode === 'followUp-Completed') {
            const followUps = t.followUps || [];
            const hasCompleted = followUps.some((fu) => {
              const fuInternalStatus = String(fu.InternalStatus || fu.internalStatus || fu.status || '').trim().toLowerCase();
              const isSolved =
                fu.statusId === 4 ||
                fu.StatusId === 4 ||
                fuInternalStatus === 'solved' ||
                fuInternalStatus === 'completed' ||
                fuInternalStatus === 'closed' ||
                String(fu.Estatus || fu.estatus || '').trim().toLowerCase() === 'completed';

              return isSolved || isValidDateString(fu.CallClosed) || (fu.CallDuration && fu.CallDuration !== '00:00:00');
            });
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
        this.unreadThreadIds.has(`call-${thread.sr}`) ||
        Boolean(thread.unread);
      thread.unread = isUnread;
      thread.isNewCall = this.newCallThreadIds.has(thread.id) || this.newCallThreadIds.has(String(thread.sr));
      const savedUnreadCount = this.unreadCommentCounts.get(String(thread.sr));
      thread.unreadCount = isUnread
        ? Math.max(1, Number(savedUnreadCount ?? thread.unreadCount) || 0)
        : (isUnread ? Math.max(1, Number(thread.unreadCount) || 0) : 0);
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

      companies = Array.from(companyMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .map(([compName, meta], idx) => ({
          id: meta.projectId ? Number(meta.projectId) : compName.toLowerCase().replace(/\s+/g, '-'),
          projectId: meta.projectId ? Number(meta.projectId) : null,
          name: compName,
          count: meta.count,
          avatarColor: COMPANY_PALETTE[idx % COMPANY_PALETTE.length],
          initial: compName.charAt(0).toUpperCase(),
        }));
    }

    // Attach company avatarColor to each thread directly so thread displays match company rail
    if (companies && Array.isArray(companies)) {
      const compColorMap = new Map();
      companies.forEach((c) => {
        if (c.name) compColorMap.set(normComp(c.name), c.avatarColor);
        if (c.projectId) compColorMap.set(String(c.projectId), c.avatarColor);
      });
      normalizedThreads.forEach((t) => {
        const cNorm = normComp(t.company);
        const pId = String(t.projectId || '');
        t.avatarColor = compColorMap.get(pId) || compColorMap.get(cNorm) || COMPANY_PALETTE[0];
      });
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
    this.newCallThreadIds.delete(threadId);
    this.newCallThreadIds.delete(String(threadId));
    this.newCallThreadIds.delete(`call-${threadId}`);

    const currentThreads = this.threads$.getValue();
    const hasUpdatesToClear = currentThreads.some(
      (t) => (t.id === threadId || String(t.sr) === String(threadId) || `call-${t.sr}` === threadId) && (t.unread || t.isNewCall)
    );
    if (hasUpdatesToClear) {
      const updated = currentThreads.map((t) => {
        if (t.id === threadId || String(t.sr) === String(threadId) || `call-${t.sr}` === threadId) {
          this.unreadCommentCounts.delete(String(t.sr));
          return { ...t, unread: false, unreadCount: 0, isNewCall: false };
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

  markThreadRead(id) {
    this.unreadThreadIds.delete(id);
    this.unreadThreadIds.delete(String(id));
    this.unreadThreadIds.delete(`call-${id}`);
    this.unreadCommentCounts.delete(String(id).replace(/^call-/, ''));
  }

  // Update Call Status, Priority, Rating in stream
  updateCallStatus(threadId, updates = {}) {
    const cleanUpdates = { ...updates };
    // Prevent 0, '0', empty string or numeric ID values from polluting status labels
    if (
      cleanUpdates.estatus === 0 ||
      cleanUpdates.estatus === '0' ||
      cleanUpdates.estatus === '' ||
      (typeof cleanUpdates.estatus === 'number')
    ) {
      delete cleanUpdates.estatus;
    }
    if (
      cleanUpdates.Estatus === 0 ||
      cleanUpdates.Estatus === '0' ||
      cleanUpdates.Estatus === '' ||
      (typeof cleanUpdates.Estatus === 'number')
    ) {
      delete cleanUpdates.Estatus;
    }
    if (
      cleanUpdates.status === 0 ||
      cleanUpdates.status === '0' ||
      cleanUpdates.status === '' ||
      (typeof cleanUpdates.status === 'number')
    ) {
      delete cleanUpdates.status;
    }

    const currentThreads = this.threads$.getValue();
    const updated = currentThreads.map((t) => {
      if (t.id === threadId || String(t.sr) === String(threadId)) {
        return {
          ...t,
          ...cleanUpdates,
          rawRecord: {
            ...t.rawRecord,
            ...cleanUpdates,
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
    this.markThreadRead(callLogId);
    const currentThreads = this.threads$.getValue();
    const updatedThreads = currentThreads.map((t) => {
      if (String(t.sr) !== String(callLogId) && String(t.id) !== String(callLogId)) {
        return t;
      }
      return {
        ...t,
        ...patchData,
        unread: false,
        rawRecord: {
          ...t.rawRecord,
          ...patchData,
        },
      };
    });
    this.threads$.next(updatedThreads);
  }

  // Replace a call's complete comment snapshot without marking the thread read
  // or reordering it. Used for idempotent edit/delete socket reconciliation.
  replaceComments(callLogId, commentRecords = []) {
    if (callLogId == null) return false;

    const comments = Array.isArray(commentRecords) ? commentRecords : [];
    let changed = false;
    const updatedThreads = (this.threads$.getValue() || []).map((thread) => {
      if (
        String(thread.sr) !== String(callLogId) &&
        String(thread.id) !== String(callLogId) &&
        `call-${thread.sr}` !== String(callLogId)
      ) return thread;

      changed = true;
      const rawRecord = {
        ...(thread.rawRecord || {}),
        comment: JSON.stringify(comments),
        comments,
      };
      const latest = comments[comments.length - 1];
      const latestText = String(
        latest?.text ?? latest?.comment ?? latest?.Comments ?? latest?.comments ?? ''
      ).trim();
      const latestPath = latest?.FilePath ?? latest?.filePath ?? latest?.img ?? '';
      const lastMessage = latestText || (latestPath ? '📷 Photo' : '') ||
        rawRecord.description || rawRecord.Descr || 'Voice support call logged';
      const latestTime = latest?.CreatedDate ?? latest?.time ?? '';
      let timestamp = thread.timestamp;
      if (latestTime) {
        const parsed = new Date(String(latestTime).replace(/Z$/i, '').replace(' ', 'T'));
        if (!Number.isNaN(parsed.getTime())) {
          timestamp = parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }

      return {
        ...thread,
        comments,
        rawRecord,
        lastMessage,
        timestamp: comments.length ? timestamp : (rawRecord.time || thread.timestamp),
      };
    });

    if (changed) {
      this.threads$.next(updatedThreads);
      this.removeLegacyCommentBubbles(callLogId);
    }
    return changed;
  }

  // Optimistically prepend newly created call log into reactive stream
  addNewCall(rawRecord, autoSelect = false) {
    if (!rawRecord) return;
    const currentThreads = this.threads$.getValue() || [];
    const normalized = normalizeCallRecord(rawRecord, currentThreads.length);
    if (!normalized) return;
    const exists = currentThreads.some((t) => String(t.sr) === String(normalized.sr));
    if (autoSelect) {
      this.newCallThreadIds.delete(normalized.id);
      this.newCallThreadIds.delete(String(normalized.sr));
      this.newCallThreadIds.delete(`call-${normalized.sr}`);
      normalized.isNewCall = false;
    } else if (exists) {
      normalized.isNewCall = Boolean(currentThreads.find((t) => String(t.sr) === String(normalized.sr))?.isNewCall);
    } else {
      this.newCallThreadIds.add(normalized.id);
      this.newCallThreadIds.add(String(normalized.sr));
      this.newCallThreadIds.add(`call-${normalized.sr}`);
      normalized.isNewCall = true;
      normalized.unread = false;
      normalized.unreadCount = 0;
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

    const updatedThreads = exists
      ? currentThreads.map((t) => (String(t.sr) === String(normalized.sr)
        ? {
            ...t,
            ...normalized,
            unread: autoSelect ? false : t.unread,
            unreadCount: autoSelect ? 0 : t.unreadCount,
            isNewCall: autoSelect ? false : t.isNewCall,
          }
        : t))
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
    const hasAttachmentField = ['FilePath', 'filePath', 'img', 'attachment'].some((key) =>
      Object.prototype.hasOwnProperty.call(commentObj, key)
    );
    const currentThreads = this.threads$.getValue();
    let hasUpdated = false;
    const activeId = this.activeThreadId$.getValue();
    const currentUserId = this.currentUser$.getValue()?.id;

    const normalizedComment = normalizeCommentRecord({
      ...commentObj,
      time: commentObj.time || commentObj.CreatedDate || getLocalISOString(),
      Name: commentObj.Name || commentObj.CreatedByName || 'Support Agent',
      IsClient: commentObj.IsClient ?? commentObj.isClient ?? 0,
    }, { optimistic: Boolean(commentObj._optimisticComment) });

    const isFromOtherUser =
      normalizedComment.CreatedBy && currentUserId
        ? String(normalizedComment.CreatedBy) !== String(currentUserId)
        : true;

    const updatedThreads = currentThreads.map((t) => {
      if (
        String(t.sr) !== String(callLogId) &&
        String(t.id) !== String(callLogId) &&
        `call-${t.sr}` !== String(callLogId)
      ) {
        return t;
      }
      hasUpdated = true;
      const raw = { ...(t.rawRecord || {}) };
      const existingComments = parseCommentRecords(raw.comment);
      const incomingId = getCommentRecordId(commentObj);
      const matchingExisting = incomingId == null
        ? null
        : existingComments.find((item) => String(getCommentRecordId(item)) === String(incomingId));
      if (!hasAttachmentField && matchingExisting) {
        const retainedPath = matchingExisting.FilePath ?? matchingExisting.filePath ?? matchingExisting.img ?? matchingExisting.attachment?.imgUrl ?? '';
        normalizedComment.FilePath = Array.isArray(retainedPath) ? retainedPath.join(',') : retainedPath;
        normalizedComment.img = normalizedComment.FilePath;
      }
      const hasSameSocketRecord = existingComments.some((item) => {
        const sameText = String(item.text ?? item.comment ?? item.Comments ?? '').trim() === normalizedComment.text.trim();
        const sameFile = String(item.FilePath ?? item.filePath ?? item.img ?? '') === String(normalizedComment.FilePath ?? '');
        const sameAuthor = item.CreatedBy == null || normalizedComment.CreatedBy == null || String(item.CreatedBy) === String(normalizedComment.CreatedBy);
        const itemTime = String(item.CreatedDate ?? item.time ?? '');
        const incomingTime = String(normalizedComment.CreatedDate ?? normalizedComment.time ?? '');
        return sameText && sameFile && sameAuthor && itemTime !== '' && itemTime === incomingTime;
      });
      const isDuplicateComment = Boolean(matchingExisting || hasSameSocketRecord);
      const comments = upsertCommentRecord(
        existingComments,
        normalizedComment,
        { optimistic: Boolean(commentObj._optimisticComment) }
      );

      raw.comment = JSON.stringify(comments);

      // Check if this thread is currently open / being viewed
      const isActive =
        activeId === t.id ||
        String(activeId) === String(t.sr) ||
        activeId === `call-${t.sr}`;

      // Mark unread dot if user is doing something else (viewing another thread)
      const shouldMarkUnread = !isActive && isFromOtherUser;
      const shouldIncrementUnread = shouldMarkUnread && !isDuplicateComment;
      if (shouldIncrementUnread) {
        this.unreadThreadIds.add(t.id);
        this.unreadThreadIds.add(String(t.sr));
        this.unreadThreadIds.add(`call-${t.sr}`);
        this.unreadCommentCounts.set(String(t.sr), (this.unreadCommentCounts.get(String(t.sr)) || 0) + 1);
      }

      // Format time for timestamp display
      let displayTime = t.timestamp;
      try {
        if (normalizedComment.time) {
          const cleanTime = String(normalizedComment.time).replace(/Z$/i, '').replace(' ', 'T');
          const d = new Date(cleanTime);
          if (!isNaN(d.getTime())) {
            displayTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      } catch (_) {}

      const previewText = normalizedComment.text || t.lastMessage;

      return {
        ...t,
        unread: shouldIncrementUnread ? true : t.unread,
        unreadCount: shouldIncrementUnread
          ? (this.unreadCommentCounts.get(String(t.sr)) || 1)
          : (t.unreadCount || 0),
        lastMessage: previewText,
        timestamp: displayTime || t.timestamp,
        date: normalizedComment.time || t.date,
        rawRecord: raw,
        comments,
      };
    });

    if (hasUpdated) {
      // Re-order threads so the most recently messaged thread jumps to the top (WhatsApp style)
      const targetIndex = updatedThreads.findIndex(
        (t) =>
          String(t.sr) === String(callLogId) ||
          String(t.id) === String(callLogId) ||
          `call-${t.sr}` === String(callLogId)
      );
      if (targetIndex > 0) {
        const [movedThread] = updatedThreads.splice(targetIndex, 1);
        this.threads$.next([movedThread, ...updatedThreads]);
      } else {
        this.threads$.next(updatedThreads);
      }
      this.removeLegacyCommentBubbles(callLogId);
    }
  }

  // Remove the duplicate purple bubbles created by the former optimistic
  // comment path. Comments now render from the normalized comment stream only.
  removeLegacyCommentBubbles(callLogId) {
    const thread = (this.threads$.getValue() || []).find((item) =>
      String(item.sr) === String(callLogId) ||
      String(item.id) === String(callLogId) ||
      `call-${item.sr}` === String(callLogId)
    );
    if (!thread) return;

    const keys = new Set([String(thread.id), String(thread.sr), `call-${thread.sr}`]);
    const current = this.customMessages$.getValue() || {};
    let changed = false;
    const updated = { ...current };
    keys.forEach((key) => {
      if (!Array.isArray(current[key])) return;
      const filtered = current[key].filter((message) => !String(message?.id || '').startsWith('msg-'));
      if (filtered.length !== current[key].length) {
        updated[key] = filtered;
        changed = true;
      }
    });
    if (changed) this.customMessages$.next(updated);
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
    // Keep one authoritative timer/session at a time. Starting another call
    // must not silently overwrite the active call in memory and localStorage.
    if (this.activeCall$.getValue()) return null;
    if (thread?.sr) {
      this.markThreadRead(thread.sr);
      this.threads$.next(
        this.threads$.getValue().map((t) => (String(t.sr) === String(thread.sr) ? { ...t, unread: false } : t))
      );
    }

    const isFu = Boolean(options.isFollowUp || options.followUpId);
    const active = {
      callId: `live-${Date.now()}`,
      sr: thread?.sr,
      followUpId: options.followUpId || null,
      isFollowUp: isFu,
      isForwarded: Boolean(options.isForwarded),
      ownerId: options.ownerId || thread?.ForwardedEmpId || thread?.AssignedEmpId || null,
      ownerName: options.ownerName || thread?.ForwardedEmp || thread?.AssignedEmpName || thread?.receivedBy || '',
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
