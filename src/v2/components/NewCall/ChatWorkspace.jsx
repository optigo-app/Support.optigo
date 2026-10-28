'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import debounce from 'lodash/debounce';
import TopBar from './TopBar';
import CompanyAvatarRail from './CompanyAvatarRail';
import DirectMessagesSidebar from './DirectMessagesSidebar';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import RightDetailInspector from './RightDetailInspector';
import FloatingCallWidget from './FloatingCallWidget';
import { Toaster, toast } from 'sonner';
import { callStreamService } from '../../services/callStreamService';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';
import CallLogApi from '../../apis/CallLogApiController';
import {
  openAddCallModal,
  closeAddCallModal,
  addCallModal$,
  useNewCallSubject,
} from './rxjs/newCallEvents';
import CallLogDrawer from '../CallLogger/SideBar';
import NewCallFollowUpModal from './NewCallFollowUpModal';
import NewCallEditModal from './NewCallEditModal';
import NewCallForwardModal from './NewCallForwardModal';
import NewCallDurationModal from './NewCallDurationModal';
import QuickQueryCardsRail from './QuickQueryCardsRail';
import AcceptCallModal from '../CallLogger/AcceptCallModal';
import { acceptCallModal$ } from '../../rxjs/tableUiStore';
import { globalSearchQuery$, setGlobalSearchQuery } from '../../rxjs/globalSearchStore';
import { formatLocalDateToYYYYMMDD } from './AirbnbDateRangePicker';
import { formatFriendlyTime, formatTimeOnly, formatDateGroup, isValidDate, getEpochMs, getLocalISOString } from './utils/dateUtils';
import { hasRealTicket, getResolvedTicketId } from './utils/ticketStatusUtils';
import { useSocketEvent } from '../../hooks/useSocketListener';
import ChatBgPattern from '../../../assets/images/chat-bg.png';
import { getCallSource } from './utils/callSource';
import {
  getUnreferencedAttachmentPaths,
  parseCommentAttachmentPaths,
  removeCommentAttachments,
  uploadCommentAttachments,
} from './utils/commentAttachmentUtils';
import {
  getCommentRecordId,
  parseCommentRecords,
  removeCommentRecord,
  upsertCommentRecord,
} from './utils/commentStreamUtils';

const STORAGE_KEYS = {
  VOIP_SESSION: 'newcall_active_voip_session',
};

const parseFilterValues = (value) => {
  if (value == null || value === '' || value === 'all') return 'all';
  const values = String(value).split(',').map((item) => item.trim()).filter(Boolean);
  return values.length > 1 ? values : (values[0] || 'all');
};

const parseCallComments = (record) => {
  const commentField = ['comment', 'CommentsArray', 'comments', 'Comments'].find((field) =>
    Object.prototype.hasOwnProperty.call(record || {}, field) && record[field] !== undefined
  );
  return commentField ? parseCommentRecords(record[commentField]) : [];
};

const getCommentId = getCommentRecordId;

const unwrapCommentSocketPayload = (payload) => {
  const value = Array.isArray(payload) ? payload[0] : payload;
  return value?.Data?.rd1?.[0] || value?.rd1?.[0] || value?.data?.rd1?.[0] || value?.data || value;
};

const assertCommentMutationSucceeded = (response, fallbackMessage) => {
  const result = response?.rd?.[0];
  // BaseAPI returns Data directly, so the status is expected at rd[0]. Do not
  // treat a malformed/empty response as success: attachment cleanup depends on
  // this check and must only happen after the server confirms the mutation.
  if (!result || Number(result.stat) !== 1) {
    throw new Error(result?.stat_msg || fallbackMessage);
  }
  if (response === false || response?.success === false || response?.Success === false) {
    throw new Error(response?.message || response?.Message || fallbackMessage);
  }
};

const mutateCallCommentsInStream = (callLogId, mutate) => {
  if (callLogId == null || typeof mutate !== 'function') return false;
  const threads = callStreamService.threads$.getValue() || [];
  const thread = threads.find((item) =>
    String(item.sr ?? item.rawRecord?.sr ?? '') === String(callLogId)
  );
  if (!thread) return false;

  const comments = parseCallComments(thread.rawRecord || thread);
  const nextComments = mutate(comments);
  if (!Array.isArray(nextComments)) return false;

  return callStreamService.replaceComments?.(callLogId, nextComments) || false;
};

const removeCallCommentFromStream = (callLogId, commentId) =>
  callStreamService.removeComment?.(callLogId, commentId) || false;


export default function ChatWorkspace() {
  const { user, CompanyInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [threads, setThreads] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('all'); // Sidebar Screen Filter
  const [topBarCompany, setTopBarCompany] = useState('all'); // TopBar Dropdown Server API Filter (ProjectID)
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('team'); // 'normal' | 'team' | 'followUp-Pending' | 'followUp-Completed'
  const [statusFilter, setStatusFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    const paramStatus = params.get('status');
    const paramSr = params.get('sr') || params.get('callId');
    // A call opened from the legacy Call Log must not inherit list filters.
    if (paramSr) return 'all';
    if (paramStatus !== null) {
      return parseFilterValues(paramStatus);
    }
    // Default to 44 (Pending) when coming from sidebar or general navigation
    return 44;
  });
  const [filterBy, setFilterBy] = useState(''); // Date target field: 'date' | 'callStart' | 'callClosed'
  const [dateRangeObj, setDateRangeObj] = useState(() => {
    const params = new URLSearchParams(location.search);
    const start = params.get('start');
    const end = params.get('end');
    if (params.get('sr') || params.get('callId')) return null;
    if (start && end) return { start: new Date(start), end: new Date(end) };
    if (params.get('status') === 'all') return null;
    const today = new Date();
    return {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [showCompanies, setShowCompanies] = useState(true);
  const [showCallsList, setShowCallsList] = useState(true);

  const isSidebarsCollapsed = !showCompanies && !showCallsList;

  const handleToggleSidebars = useCallback(() => {
    if (showCompanies || showCallsList) {
      setShowCompanies(false);
      setShowCallsList(false);
    } else {
      setShowCompanies(true);
      setShowCallsList(true);
    }
  }, [showCompanies, showCallsList]);

  const [customMessagesMap, setCustomMessagesMap] = useState({});
  const [conversationViewMode, setConversationViewMode] = useState('single'); // 'single' | 'timeline'
  const [isQueueOpen, setIsQueueOpen] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('queue') !== '0'; // Open by default
  });
  const [acceptCallState, setAcceptCallState] = useState(null);
  const [isAcceptingQueue, setIsAcceptingQueue] = useState(false);

  const lastFilterKeyRef = useRef('');
  const filterRequestIdRef = useRef(0);
  const isInternalUrlUpdateRef = useRef(false);
  const hasInitializedUrlSyncRef = useRef(false);
  const lastHandledExternalSrRef = useRef('');
  const requestedCallSrRef = useRef('');
  // When ChatWorkspace has fetched its own filtered data, it "owns" the stream.
  // After that, UseCallLog background refreshes do a smart MERGE (patch existing threads)
  // instead of a full replace — so description saves, status updates etc. work smoothly.
  const workspaceOwnsDataRef = useRef(false);

  // Live CallLog Context
  const callLogCtx = useCallLog();
  const liveCallLog = callLogCtx?.callLog;

  const addModalState = useNewCallSubject(addCallModal$);

  const handleCallAdded = useCallback((addedCallData) => {
    if (!addedCallData) return;
    const companyObj = callLogCtx?.companyOptions?.find(
      (c) =>
        String(c.value) === String(addedCallData.company || addedCallData.ProjectID) ||
        c.label?.toLowerCase() === String(addedCallData.company || '').toLowerCase() ||
        c.label?.split('/')?.[0]?.toLowerCase() === String(addedCallData.company || '').toLowerCase()
    );
    const companyLabel = companyObj?.label || addedCallData.company || 'Company';
    const createdThreadRecord = {
      sr: addedCallData.sr || addedCallData.id || Date.now(),
      company: companyLabel,
      CompanyName: companyLabel,
      ProjectID: addedCallData.company || addedCallData.ProjectID || companyObj?.value || '',
      projectId: addedCallData.company || addedCallData.ProjectID || companyObj?.value || '',
      callBy: addedCallData.callBy || addedCallData.CustomerName || 'Client Caller',
      CustomerName: addedCallData.callBy || addedCallData.CustomerName || 'Client Caller',
      appname: addedCallData.appname || '',
      description: addedCallData.description || '',
      Descr: addedCallData.description || '',
      lastMessage: addedCallData.description || 'Voice support call logged',
      date: addedCallData.date || new Date().toISOString().split('T')[0],
      time: addedCallData.time || '',
      timestamp: addedCallData.time ? String(addedCallData.time).slice(0, 5) : '00:00',
      // A newly created call has not ended; keep the optimistic stream state
      // aligned with the server's pending/running state before its refresh lands.
      status: 'Pending',
      estatus: 'Running',
      Estatus: 'Running',
      receivedBy: user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.name || 'Support Desk',
    };
    callStreamService.addNewCall(createdThreadRecord, true);
    callStreamService.selectCompany('all');
    if (callLogCtx?.triggerRefresh) {
      callLogCtx.triggerRefresh();
    }
  }, [callLogCtx, user]);

  // 1. Sync current user to RxJS stream
  useEffect(() => {
    if (user) {
      callStreamService.setCurrentUser(user);
    }
  }, [user]);

  // 2. Sync live Call Logs into RxJS Stream (Smart Merge ONLY)
  // NewCall owns its own dataset and queries the API independently.
  // We ONLY patch existing threads when liveCallLog has updates (comments, status, duration).
  // We NEVER overwrite or replace NewCall's thread list with liveCallLog.
  useEffect(() => {
    if (!Array.isArray(liveCallLog) || liveCallLog.length === 0) return;
    if (!workspaceOwnsDataRef.current) return;

    // Merge path: workspace owns the filtered data set.
    // Only UPDATE threads that already exist in the stream (description/status/followUp changes).
    // Do NOT add or remove threads — that would change the filtered count.
    const currentThreads = callStreamService.threads$.getValue();
    if (!currentThreads || currentThreads.length === 0) return;

    const liveMap = new Map();
    for (const rec of liveCallLog) {
      const key = String(rec.sr || rec.id || '');
      if (key) liveMap.set(key, rec);
    }

    let hasChanges = false;
    const merged = currentThreads.map((t) => {
      const key = String(t.sr || t.id || '');
      const fresh = liveMap.get(key);
      if (!fresh) return t;

      const commentsField = ['comment', 'CommentsArray', 'comments', 'Comments'].find((field) =>
        Object.prototype.hasOwnProperty.call(fresh, field) && fresh[field] !== undefined
      );
      const freshComments = commentsField
        ? callStreamService.filterDeletedComments(fresh.sr ?? t.sr, parseCommentRecords(fresh[commentsField]))
        : t.comments || [];
      const commentsChanged = commentsField != null &&
        JSON.stringify(freshComments) !== JSON.stringify(t.comments || []);

      // Check if anything meaningful changed (including comments!)
      const changed =
        fresh.description !== (t.rawRecord?.description || t.rawRecord?.Descr) ||
        fresh.FollowUpList !== t.rawRecord?.FollowUpList ||
        commentsChanged ||
        fresh.callClosed !== t.callClosed ||
        fresh.callStart !== t.callStart ||
        fresh.Estatus !== (t.rawRecord?.Estatus || t.estatus) ||
        fresh.status !== t.status;

      if (!changed) return t;
      hasChanges = true;

      // Re-normalize only the updated fields, keeping the thread shape and unread state intact
      const isUnread =
        callStreamService.unreadThreadIds.has(t.id) ||
        callStreamService.unreadThreadIds.has(String(t.sr)) ||
        callStreamService.unreadThreadIds.has(`call-${t.sr}`) ||
        Boolean(t.unread);

      const finalFollowUps = (() => {
        if (!fresh.FollowUpList) return t.followUps;
        try {
          const parsed = typeof fresh.FollowUpList === 'string'
            ? JSON.parse(fresh.FollowUpList)
            : fresh.FollowUpList;
          if (!Array.isArray(parsed)) return t.followUps;

          // Merge server data with local optimistic data
          return parsed.map((serverFu) => {
            const serverId = String(serverFu.Id ?? serverFu.id ?? serverFu.followUpCallId);
            const localFu = (t.followUps || []).find(
              (l) => String(l.Id ?? l.id ?? l.followUpCallId) === serverId
            );
            if (!localFu) return serverFu;

            const merged = { ...serverFu };

            // Preserve Description
            const serverDescr = (serverFu.Description || serverFu.Descr || '').trim();
            const localDescr = (localFu.Description || localFu.Descr || '').trim();
            if (!serverDescr && localDescr) {
              merged.Description = localDescr;
              merged.Descr = localDescr;
            }

            // Preserve Duration
            const serverDur = serverFu.CallDuration || serverFu.callDuration;
            const localDur = localFu.CallDuration || localFu.callDuration;
            if ((!serverDur || serverDur === '00:00:00') && localDur && localDur !== '00:00:00') {
              merged.CallDuration = localDur;
            }

            // Preserve Closed Date
            const serverClosed = serverFu.CallClosed || serverFu.callClosed;
            const localClosed = localFu.CallClosed || localFu.callClosed;
            if ((!serverClosed || serverClosed.startsWith('1900-01-01')) && localClosed && !localClosed.startsWith('1900-01-01')) {
              merged.CallClosed = localClosed;
            }

            // Preserve Status
            const serverStatus = serverFu.InternalStatusId ?? serverFu.StatusId;
            const localStatus = localFu.InternalStatusId ?? localFu.StatusId;
            if ((!serverStatus || serverStatus === 0) && localStatus) {
              merged.InternalStatusId = localFu.InternalStatusId;
              merged.InternalStatus = localFu.InternalStatus;
              merged.StatusId = localFu.StatusId;
            }

            return merged;
          });
        } catch { return t.followUps; }
      })();

      const parsedComments = freshComments;
      const serializedComments = JSON.stringify(parsedComments);

      let latestCommentText = '';
      let latestCommentTime = '';
      if (Array.isArray(parsedComments) && parsedComments.length > 0) {
        const lastC = parsedComments[parsedComments.length - 1];
        latestCommentText = (
          lastC.text ||
          lastC.comment ||
          lastC.Comments ||
          lastC.Remarks ||
          (lastC.img || lastC.FilePath ? '📷 Photo' : '') ||
          ''
        ).trim();

        const rawCDate = lastC.time || lastC.CreatedDate || lastC.createdDate;
        if (rawCDate) {
          try {
            const clean = String(rawCDate).replace(/Z$/i, '').replace(' ', 'T');
            const dt = new Date(clean);
            if (!isNaN(dt.getTime())) {
              latestCommentTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (_) { }
        }
      }

      const isClean = (v) => v != null && v !== '' && v !== '0' && v !== 0 && isNaN(Number(v));
      const nextStatus = isClean(fresh.status) ? fresh.status : isClean(fresh.Status) ? fresh.Status : t.status;
      const nextEstatus = isClean(fresh.Estatus) ? fresh.Estatus : isClean(fresh.estatus) ? fresh.estatus : t.estatus;

      return {
        ...t,
        unread: isUnread,
        status: nextStatus,
        estatus: nextEstatus,
        callStart: fresh.callStart || t.callStart,
        callClosed: fresh.callClosed || t.callClosed,
        lastMessage:
          latestCommentText ||
          fresh.description ||
          fresh.Descr ||
          t.lastMessage ||
          'Voice support call logged',
        timestamp: latestCommentTime || t.timestamp,
        comment: serializedComments,
        comments: parsedComments,
        followUps: finalFollowUps,
        rawRecord: {
          ...t.rawRecord,
          ...fresh,
          comment: serializedComments,
          comments: parsedComments,
          CommentsArray: serializedComments,
          FollowUpList: JSON.stringify(finalFollowUps)
        },
      };
    });

    if (hasChanges) {
      callStreamService.threads$.next(merged);
    }
  }, [liveCallLog]);

  // 2b. Initial Dedicated Fetch for NewCall (completely independent of CallLogger)
  useEffect(() => {
    let isCancelled = false;
    const loadNewCallData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(location.search);
        const targetSr = params.get('sr') || params.get('callId') || '';
        if (targetSr) requestedCallSrRef.current = String(targetSr).replace(/^call-/, '');
        const clearFiltersForCallLink = Boolean(targetSr);
        const today = new Date();
        const todayString = formatLocalDateToYYYYMMDD(today);
        const isClearedFilterState = params.get('status') === 'all';
        const start = targetSr || isClearedFilterState ? '' : (params.get('start') || todayString);
        const end = targetSr || isClearedFilterState ? '' : (params.get('end') || todayString);
        const paramStatus = params.get('status');
        const status = clearFiltersForCallLink ? 'all' : (paramStatus !== null ? parseFilterValues(paramStatus) : 44);
        const companyParam = params.get('company') || params.get('companyStatus') || '';
        const company = clearFiltersForCallLink || !companyParam ? '' : parseFilterValues(companyParam);
        const target = clearFiltersForCallLink
          ? ''
          : (params.get('target') || (start && end ? 'date' : ''));
        // Load the normal unfiltered list for deep links. Search by SR only as
        // a fallback if the requested older call is outside that result set.
        const search = targetSr ? '' : (params.get('search') || params.get('searchQuery') || '');

        const resolvedProjectId = getProjectId(company);
        const resolvedStatusId = getStatusId(status);

        // A direct call link is fetched by call ID below; mark the cleared
        // filter state so the generic list fetch cannot overwrite that result.
        lastFilterKeyRef.current = clearFiltersForCallLink
          ? '|||||'
          : `${start}|${end}|${resolvedProjectId}|${resolvedStatusId}|${search}|${target}`;

        const requestId = ++filterRequestIdRef.current;
        const data = await CallLogApi.getCallLogs({
          endDate: end,
          startDate: start,
          statusIds: resolvedStatusId,
          projectIds: resolvedProjectId,
          filter: target,
          searchTerm: search,
        });

        if (!isCancelled && requestId === filterRequestIdRef.current && data?.rd && Array.isArray(data.rd)) {
          // If a specific call was requested via ?sr=... and is NOT in data.rd,
          // fetch it specifically to ensure it's loaded and selectable
          if (targetSr) {
            const cleanSr = String(targetSr).replace(/^call-/, '');
            const exists = data.rd.some((r) => String(r.sr || r.id) === cleanSr);
            if (!exists) {
              try {
                requestedCallSrRef.current = cleanSr;
                const specificRes = await CallLogApi.getCallLogs({ searchTerm: cleanSr, projectIds: '', statusIds: '' });
                if (specificRes?.rd && Array.isArray(specificRes.rd) && specificRes.rd.length > 0) {
                  data.rd = [...specificRes.rd, ...data.rd];
                }
              } catch (e) {
                console.warn('Could not fetch specific call for targetSr:', cleanSr, e);
              }
            }
          }

          workspaceOwnsDataRef.current = true;
          callStreamService.initData(data.rd);

          if (targetSr) {
            const cleanSr = String(targetSr).replace(/^call-/, '');
            callStreamService.selectThread(`call-${cleanSr}`);
          }
        }
      } catch (err) {
        console.error('Failed to load initial NewCall data:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadNewCallData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 3. Subscribe to RxJS Reactive Streams
  useEffect(() => {
    const subThreads = callStreamService.filteredThreads$.subscribe(setThreads);
    const subAllThreads = callStreamService.threads$.subscribe(setAllThreads);
    const subCompanies = callStreamService.companies$.subscribe(setCompanies);
    const subSelectedComp = callStreamService.selectedCompany$.subscribe((comp) => {
      setSelectedCompany(comp);
      if (comp && comp !== 'all') {
        const isArr = Array.isArray(comp);
        if (!isArr || (isArr && comp.length > 0)) {
          setConversationViewMode('single');
        }
      }
    });
    const subActiveId = callStreamService.activeThreadId$.subscribe(setActiveThreadId);
    const subLoading = callStreamService.isLoading$.subscribe(setIsLoading);
    const subViewMode = callStreamService.viewMode$.subscribe(setViewMode);
    const subCustomMsgs = callStreamService.customMessages$.subscribe(setCustomMessagesMap);

    return () => {
      subThreads.unsubscribe();
      subAllThreads.unsubscribe();
      subCompanies.unsubscribe();
      subSelectedComp.unsubscribe();
      subActiveId.unsubscribe();
      subLoading.unsubscribe();
      subViewMode.unsubscribe();
      subCustomMsgs.unsubscribe();
    };
  }, []);

  // Counts use the active result scope but deliberately omit the selected
  // company rail filter. This keeps the rail and overall total stable while
  // the call list is narrowed to one company.
  const countScopeThreads = useMemo(() => {
    const normalizeText = (value) => String(value || '').toLowerCase();
    const query = String(searchQuery || '').trim().toLowerCase();
    const validDateString = (value) => value && typeof value === 'string' && !value.startsWith('1900-01-01');
    const loggedUser = user?.firstname
      ? `${user.firstname} ${user.lastname || ''}`.trim().toLowerCase()
      : normalizeText(user?.name);
    const loggedUserId = String(user?.id || '').toLowerCase();
    const startDateMs = dateRangeObj?.start ? new Date(dateRangeObj.start).setHours(0, 0, 0, 0) : null;
    const endDateMs = dateRangeObj?.end ? new Date(dateRangeObj.end).setHours(23, 59, 59, 999) : null;

    return (allThreads || []).filter((thread) => {
      const raw = thread.rawRecord || {};
      if (viewMode === 'normal' && (loggedUser || loggedUserId)) {
        const receivedBy = normalizeText(thread.receivedBy || raw.receivedBy);
        const assignedBy = normalizeText(thread.AssignedEmpName || raw.AssignedEmpName);
        const createdBy = String(raw.CreatedBy || raw.createdBy || '').toLowerCase();
        const employeeId = String(raw.EmpId || raw.empId || '').toLowerCase();
        const isMyCall =
          (loggedUser && (receivedBy === loggedUser || assignedBy === loggedUser || receivedBy.includes(loggedUser) || assignedBy.includes(loggedUser))) ||
          (loggedUserId && (createdBy === loggedUserId || receivedBy === loggedUserId || employeeId === loggedUserId));
        if (!isMyCall) return false;
      }

      if (viewMode === 'followUp-Pending' || viewMode === 'followUp-Completed') {
        const followUps = thread.followUps || [];
        const matchesFollowUpMode = followUps.some((fu) => {
          const internalStatus = String(fu.InternalStatus || fu.internalStatus || fu.status || '').trim().toLowerCase();
          const isSolved = fu.statusId === 4 || fu.StatusId === 4 || ['solved', 'completed', 'closed'].includes(internalStatus) ||
            String(fu.Estatus || fu.estatus || '').trim().toLowerCase() === 'completed';
          const isCompleted = isSolved || validDateString(fu.CallClosed) || Boolean(fu.CallDuration && fu.CallDuration !== '00:00:00');
          return viewMode === 'followUp-Pending' ? !isCompleted : isCompleted;
        });
        if (!matchesFollowUpMode) return false;
      }

      if (startDateMs || endDateMs) {
        const dateValue = filterBy === 'callStart'
          ? (thread.callStart || raw.callStart)
          : filterBy === 'callClosed'
            ? (thread.callClosed || raw.callClosed)
            : (thread.date || raw.EntryDate || raw.date || thread.callStart);
        if (dateValue && !String(dateValue).startsWith('1900-01-01')) {
          const time = new Date(dateValue).getTime();
          if (!Number.isNaN(time) && ((startDateMs && time < startDateMs) || (endDateMs && time > endDateMs))) return false;
        }
      }

      if (query) {
        const searchable = [thread.name, thread.company, thread.callBy, thread.lastMessage, thread.sr, thread.receivedBy || thread.AssignedEmpName]
          .map(normalizeText);
        if (!searchable.some((value) => value.includes(query))) return false;
      }
      return true;
    });
  }, [allThreads, viewMode, user, dateRangeObj, filterBy, searchQuery]);

  // Keep every company in the current result set visible while a rail company
  // is selected; only the call list is narrowed by that local selection.
  const visibleCompanies = useMemo(() => {
    const companyCatalog = new Map();
    const companyCounts = new Map();
    const normalize = (value) => String(value || '').trim().toLowerCase().replace(/[\s_-]/g, '');

    (allThreads || []).forEach((thread) => {
      const name = String(thread.company || '').trim();
      if (!name || name.toLowerCase() === 'unknown company') return;
      const key = normalize(name);
      const projectId = thread.projectId || thread.rawRecord?.ProjectID || thread.rawRecord?.projectID || thread.rawRecord?.projectId || null;
      const existing = companyCatalog.get(key);
      if (existing) {
        if (!existing.projectId && projectId) existing.projectId = projectId;
      } else {
        companyCatalog.set(key, { name, projectId });
      }
    });

    countScopeThreads.forEach((thread) => {
      const name = String(thread.company || '').trim();
      if (!name || name.toLowerCase() === 'unknown company') return;
      const key = normalize(name);
      companyCounts.set(key, (companyCounts.get(key) || 0) + 1);
    });

    const colorByName = new Map((companies || []).map((company) => [normalize(company.name), company]));
    const palette = ['#6900C6', '#0284C7', '#059669', '#D97706', '#DC2626', '#4F46E5', '#7C3AED', '#DB2777', '#0891B2', '#475569'];
    return [...companyCatalog.entries()]
      .map(([key, company], index) => ({
        ...colorByName.get(key),
        ...company,
        count: companyCounts.get(key) || 0,
        avatarColor: colorByName.get(key)?.avatarColor || palette[index % palette.length],
        initial: company.name.charAt(0).toUpperCase(),
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [allThreads, countScopeThreads, companies]);

  // 3b. Subscribe to global search query stream (from GlobalSearchBar)
  useEffect(() => {
    const sub = globalSearchQuery$.subscribe((q) => {
      if (typeof q === 'string' && q !== searchQuery) {
        setSearchQuery(q);
        callStreamService.setSearchQuery(q);
      }
    });
    return () => sub.unsubscribe();
  }, [searchQuery]);

  // 4. Initialize from URL Query Params on mount (exact CallLogger behavior)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const savedSearch = params.get('search') || params.get('searchQuery') || '';
    const savedView = params.get('view') || 'team';
    const savedCompanyParam = params.get('company') || params.get('companyStatus') || '';
    const savedCompany = savedCompanyParam ? parseFilterValues(savedCompanyParam) : '';
    const savedRailCompany = params.get('railCompany') || '';
    const savedStatusParam = params.get('status');
    const savedStatus = savedStatusParam === null ? '' : parseFilterValues(savedStatusParam);
    const savedTarget = params.get('target') || '';
    const start = params.get('start');
    const end = params.get('end');
    const targetSr = params.get('sr') || params.get('callId');

    if (targetSr) {
      const cleanSr = String(targetSr).replace(/^call-/, '');
      setSearchQuery('');
      setGlobalSearchQuery('');
      callStreamService.setSearchQuery('');
      setViewMode('team');
      callStreamService.setViewMode('team');
      setTopBarCompany('all');
      callStreamService.selectCompany('all');
      setStatusFilter('all');
      callStreamService.setStatusFilter('all');
      setFilterBy('');
      setDateRangeObj(null);
      callStreamService.setDateRange(null);
      callStreamService.selectThread(`call-${cleanSr}`);
      return;
    }

    if (savedSearch) {
      setSearchQuery(savedSearch);
      callStreamService.setSearchQuery(savedSearch);
      setGlobalSearchQuery(savedSearch);
    }
    if (savedView) {
      setViewMode(savedView);
      callStreamService.setViewMode(savedView);
    }
    if (savedCompany && savedCompany !== 'all') {
      setTopBarCompany(savedCompany);
    } else {
      setTopBarCompany('all');
    }
    if (savedRailCompany && savedRailCompany !== 'all') {
      callStreamService.selectCompany(savedRailCompany);
    } else {
      callStreamService.selectCompany('all');
    }
    const initialStatus = savedStatus || 44;
    setStatusFilter(initialStatus);
    callStreamService.setStatusFilter(initialStatus);
    if (savedTarget) {
      setFilterBy(savedTarget);
    }
    if (start && end) {
      const range = { start: new Date(start), end: new Date(end) };
      setDateRangeObj(range);
      callStreamService.setDateRange({ ...range, field: savedTarget || 'date' });
    } else if (savedStatus !== 'all') {
      const today = new Date();
      const todayRange = {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      };
      setDateRangeObj(todayRange);
      callStreamService.setDateRange({ ...todayRange, field: savedTarget || 'date' });
    } else {
      setDateRangeObj(null);
      callStreamService.setDateRange(null);
    }
  }, []);

  // 5. Sync filters into URL search params safely without overwriting external search
  useEffect(() => {
    // Let the mount-time URL parser apply saved filters before serializing state.
    // Otherwise the initial "all" state can erase a saved railCompany value.
    if (!hasInitializedUrlSyncRef.current) {
      hasInitializedUrlSyncRef.current = true;
      return;
    }

    const currentParams = new URLSearchParams(location.search);
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('search', searchQuery);
    if (viewMode && viewMode !== 'team') newParams.set('view', viewMode);
    if (topBarCompany && topBarCompany !== 'all') {
      newParams.set('company', Array.isArray(topBarCompany) ? topBarCompany.join(',') : topBarCompany);
    }
    if (selectedCompany && selectedCompany !== 'all') {
      newParams.set('railCompany', Array.isArray(selectedCompany) ? selectedCompany.join(',') : selectedCompany);
    }
    if (statusFilter && statusFilter !== 'all') {
      newParams.set('status', Array.isArray(statusFilter) ? statusFilter.join(',') : statusFilter);
    } else {
      newParams.set('status', 'all');
    }
    if (filterBy) newParams.set('target', filterBy);
    if (dateRangeObj?.start) newParams.set('start', formatLocalDateToYYYYMMDD(dateRangeObj.start));
    if (dateRangeObj?.end) newParams.set('end', formatLocalDateToYYYYMMDD(dateRangeObj.end));

    // Keep an incoming call deep link while no thread is selected yet. Do not
    // add sr from the active thread: that turns normal chat selection into a
    // deep link on refresh and can override the current date range.
    const existingSr = currentParams.get('sr') || currentParams.get('callId');
    if (existingSr && !activeThreadId) newParams.set('sr', existingSr.replace(/^call-/, ''));

    const newQueryStr = newParams.toString();
    const currentQueryStr = currentParams.toString();

    if (newQueryStr !== currentQueryStr) {
      isInternalUrlUpdateRef.current = true;
      navigate({ pathname: location.pathname, search: newQueryStr ? `?${newQueryStr}` : '' }, { replace: true });
    }
  }, [searchQuery, viewMode, selectedCompany, topBarCompany, statusFilter, filterBy, dateRangeObj, activeThreadId, navigate, location.pathname]);

  // 6. Sync external URL search changes (e.g. from GlobalSearchBar or direct navigation)
  useEffect(() => {
    if (isInternalUrlUpdateRef.current) {
      isInternalUrlUpdateRef.current = false;
      return;
    }
    const params = new URLSearchParams(location.search);
    const savedSearch = params.get('search') || params.get('searchQuery') || '';
    const savedView = params.get('view') || 'team';
    const savedCompanyParam = params.get('company') || params.get('companyStatus') || 'all';
    const savedCompany = savedCompanyParam === 'all' ? 'all' : parseFilterValues(savedCompanyParam);
    const savedRailCompany = params.get('railCompany') || 'all';
    const savedTarget = params.get('target') || '';
    const start = params.get('start');
    const end = params.get('end');
    if (savedSearch !== searchQuery) {
      setSearchQuery(savedSearch);
      callStreamService.setSearchQuery(savedSearch);
      setGlobalSearchQuery(savedSearch);
    }
    if (savedView !== viewMode) {
      setViewMode(savedView);
      callStreamService.setViewMode(savedView);
    }
    if (savedCompany !== topBarCompany) setTopBarCompany(savedCompany);
    if (savedRailCompany !== selectedCompany) {
      setSelectedCompany(savedRailCompany);
      callStreamService.selectCompany(savedRailCompany);
    }
    if (savedTarget !== filterBy) setFilterBy(savedTarget);
    const paramStatus = params.get('status');
    const savedStatus = paramStatus === null ? 44 : parseFilterValues(paramStatus);
    if (JSON.stringify(savedStatus) !== JSON.stringify(statusFilter)) {
      setStatusFilter(savedStatus);
      callStreamService.setStatusFilter(savedStatus);
    }
    const externalSr = params.get('sr') || params.get('callId');
    const cleanSr = externalSr ? String(externalSr).replace(/^call-/, '') : '';
    const targetId = cleanSr ? `call-${cleanSr}` : '';
    const shouldHandleExternalSr = Boolean(externalSr && lastHandledExternalSrRef.current !== cleanSr);
    if (externalSr) {
      if (shouldHandleExternalSr) {
        lastHandledExternalSrRef.current = cleanSr;
        lastFilterKeyRef.current = '|||||';
      }
      if (callStreamService.activeThreadId$.getValue() !== targetId) {
        callStreamService.selectThread(targetId);
      }
    }
    if (params.get('queue') === '1') {
      setIsQueueOpen(true);
    } else if (params.get('queue') === '0') {
      setIsQueueOpen(false);
    }
    if (shouldHandleExternalSr) {
      // If this is a newly selected deep-linked call, clear list filters once.
      setSearchQuery('');
      setGlobalSearchQuery('');
      callStreamService.setSearchQuery('');
      setViewMode('team');
      callStreamService.setViewMode('team');
      setTopBarCompany('all');
      setSelectedCompany('all');
      callStreamService.selectCompany('all');
      setStatusFilter('all');
      callStreamService.setStatusFilter('all');
      setFilterBy('');
      setDateRangeObj(null);
      callStreamService.setDateRange(null);
      const currentThreads = callStreamService.threads$.getValue() || [];
      const callExists = currentThreads.some((thread) => String(thread.sr) === cleanSr);
      if (!callExists && requestedCallSrRef.current !== cleanSr) {
        requestedCallSrRef.current = cleanSr;
        CallLogApi.getCallLogs({ searchTerm: cleanSr, projectIds: '', statusIds: '' })
          .then((result) => {
            const latestParams = new URLSearchParams(window.location.search);
            const latestSr = latestParams.get('sr') || latestParams.get('callId');
            if (String(latestSr || '').replace(/^call-/, '') !== cleanSr || !Array.isArray(result?.rd)) return;
            const matchingCalls = result.rd.filter((record) => String(record.sr || record.id) === cleanSr);
            if (matchingCalls.length === 0) return;
            const existingRecords = (callStreamService.threads$.getValue() || []).map((thread) => thread.rawRecord || thread);
            workspaceOwnsDataRef.current = true;
            callStreamService.initData([...matchingCalls, ...existingRecords]);
            callStreamService.selectThread(targetId);
          })
          .catch((error) => console.error('Failed to fetch linked call:', error));
      }
      return;
    }
    if (start && end) {
      const nextRange = { start: new Date(start), end: new Date(end) };
      setDateRangeObj((current) => {
        if (
          current?.start && current?.end &&
          new Date(current.start).getTime() === nextRange.start.getTime() &&
          new Date(current.end).getTime() === nextRange.end.getTime()
        ) return current;
        return nextRange;
      });
      callStreamService.setDateRange({ ...nextRange, field: savedTarget || 'date' });
    } else if (!externalSr && savedStatus !== 'all') {
      const today = new Date();
      const todayRange = {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      };
      setDateRangeObj(todayRange);
      callStreamService.setDateRange({ ...todayRange, field: savedTarget || 'date' });
    } else if (!externalSr) {
      setDateRangeObj(null);
      callStreamService.setDateRange(null);
    }
  }, [location.search]);

  // 7. Listen for toggle-newcall-queue event from Header button
  useEffect(() => {
    const handleToggle = () => setIsQueueOpen((prev) => !prev);
    window.addEventListener('toggle-newcall-queue', handleToggle);
    return () => window.removeEventListener('toggle-newcall-queue', handleToggle);
  }, []);

  // 8. Subscribe to RxJS acceptCallModal$ for queue acceptance
  useEffect(() => {
    const sub = acceptCallModal$.subscribe((val) => {
      setAcceptCallState(val);
      setIsAcceptingQueue(false);
    });
    return () => sub.unsubscribe();
  }, []);

  // ID Resolvers to ensure Backend gets ProjectID and StatusId numbers
  const getProjectId = useCallback(
    (comp) => {
      if (!comp || comp === 'all') return '';
      if (Array.isArray(comp)) {
        return comp.map((value) => getProjectId(value)).filter((value) => value !== '').join(',');
      }
      const rawVal = comp;
      if (!rawVal) return '';

      // If it's already a number or numeric string (e.g. 3 or "3")
      if (typeof rawVal === 'number' || (!Number.isNaN(Number(rawVal)) && String(Number(rawVal)) === String(rawVal).trim())) {
        return Number(rawVal);
      }

      const cleanStr = String(rawVal).toLowerCase().replace(/[\s\-_]/g, '');

      // 1. Lookup in COMPANY_LIST (masterData.master.rd)
      const compList = callLogCtx?.COMPANY_LIST || [];
      const matched = compList.find(
        (c) =>
          String(c?.ProjectCode || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(c?.CompanyName || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(c?.label || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(c?.ProjectID || '') === String(rawVal).trim()
      );
      if (matched?.ProjectID) return Number(matched.ProjectID) || matched.ProjectID;

      // 2. Lookup in companyOptions
      const optList = callLogCtx?.companyOptions || [];
      const matchedOpt = optList.find(
        (c) =>
          String(c?.label || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(c?.value || '') === String(rawVal).trim()
      );
      if (matchedOpt?.value) return Number(matchedOpt.value) || matchedOpt.value;

      // 3. Lookup in current live threads
      const currentThreads = callStreamService.threads$.getValue() || [];
      const matchedThread = currentThreads.find(
        (t) =>
          String(t?.company || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(t?.name || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr
      );
      const threadProjId =
        matchedThread?.projectId ||
        matchedThread?.rawRecord?.ProjectID ||
        matchedThread?.rawRecord?.projectID ||
        matchedThread?.rawRecord?.projectId;
      if (threadProjId) return Number(threadProjId) || threadProjId;

      return '';
    },
    [callLogCtx?.COMPANY_LIST, callLogCtx?.companyOptions]
  );

  const getStatusId = useCallback(
    (st) => {
      if (!st || st === 'all') return '';
      if (Array.isArray(st)) {
        return st.map((value) => getStatusId(value)).filter((value) => value !== '').join(',');
      }
      const rawVal = st;
      if (!rawVal) return '';

      // If it's already a number or numeric string (e.g. 1 or "1")
      if (typeof rawVal === 'number' || (!Number.isNaN(Number(rawVal)) && String(Number(rawVal)) === String(rawVal).trim())) {
        return Number(rawVal);
      }

      const cleanStr = String(rawVal).toLowerCase().replace(/[\s\-_]/g, '');

      // 1. Lookup in STATUS_LIST and ESTATUS_LIST
      const allStatuses = [...(callLogCtx?.STATUS_LIST || []), ...(callLogCtx?.ESTATUS_LIST || [])];
      const matched = allStatuses.find(
        (s) =>
          String(s?.label || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(s?.Name || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(s?.value || '') === String(rawVal).trim()
      );
      if (matched?.value !== undefined) return Number(matched.value) || matched.value;

      // 2. Lookup in current live threads
      const currentThreads = callStreamService.threads$.getValue() || [];
      const matchedThread = currentThreads.find(
        (t) =>
          String(t?.status || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr ||
          String(t?.estatus || '').toLowerCase().replace(/[\s\-_]/g, '') === cleanStr
      );
      const threadStatId =
        matchedThread?.statusId ||
        matchedThread?.estatusId ||
        matchedThread?.rawRecord?.StatusID ||
        matchedThread?.rawRecord?.EStatusId;
      if (threadStatId) return Number(threadStatId) || threadStatId;

      return '';
    },
    [callLogCtx?.STATUS_LIST, callLogCtx?.ESTATUS_LIST]
  );

  // 6. Dynamic Backend API Filtering via CallLogApi.getCallLogs
  const debouncedFilterCallLog = useMemo(
    () =>
      debounce(async (filters) => {
        const requestId = filters.requestId ?? ++filterRequestIdRef.current;
        try {
          setIsLoading(true);
          const data = await CallLogApi.getCallLogs({
            endDate: filters.endDate || '',
            startDate: filters.startDate || '',
            statusIds: filters.statusIds !== undefined && filters.statusIds !== 'all' ? filters.statusIds : '',
            projectIds: filters.projectIds !== undefined && filters.projectIds !== 'all' ? filters.projectIds : '',
            filter: filters.filter || '',
            searchTerm: filters.searchTerm || '',
          });
          if (requestId === filterRequestIdRef.current && data?.rd && Array.isArray(data.rd)) {
            // Workspace now owns the data stream — block UseCallLog full-replace
            workspaceOwnsDataRef.current = true;
            callStreamService.initData(data.rd);
          }
        } catch (error) {
          console.error('CallLogApi.getCallLogs error:', error);
        } finally {
          if (requestId === filterRequestIdRef.current) {
            setIsLoading(false);
          }
        }
      }, 400),
    []
  );

  // 6b. Server API Refetch when TopBar filters change (exact old CallLog behavior)
  // viewMode is NOT sent to API — it is a local-only RxJS filter.
  // NewCall sends multi-select status and company IDs using the plural API fields.
  useEffect(() => {
    const startStr = formatLocalDateToYYYYMMDD(dateRangeObj?.start);
    const endStr = formatLocalDateToYYYYMMDD(dateRangeObj?.end);
    const resolvedProjectId = getProjectId(topBarCompany);
    const resolvedStatusId = getStatusId(statusFilter);
    const searchStr = searchQuery || '';
    const targetFilter = filterBy || (startStr && endStr ? 'date' : '');

    // Always update RxJS dateRange stream immediately (for local client-side date filter)
    callStreamService.setDateRange(
      startStr && endStr ? { start: dateRangeObj.start, end: dateRangeObj.end, field: targetFilter } : null
    );

    const filterKey = `${startStr}|${endStr}|${resolvedProjectId}|${resolvedStatusId}|${searchStr}|${targetFilter}`;

    // On initial mount or whenever filter criteria changes, fetch NewCall data from server
    if (lastFilterKeyRef.current !== filterKey) {
      lastFilterKeyRef.current = filterKey;
      const requestId = ++filterRequestIdRef.current;
      setIsLoading(true);
      debouncedFilterCallLog({
        startDate: startStr,
        endDate: endStr,
        projectIds: resolvedProjectId,
        statusIds: resolvedStatusId,
        filter: targetFilter,
        searchTerm: searchStr,
        requestId,
      });
    }

    return () => {
      debouncedFilterCallLog.cancel();
    };
  }, [searchQuery, topBarCompany, statusFilter, filterBy, dateRangeObj, getProjectId, getStatusId, debouncedFilterCallLog]);

  // 7. VoIP Active Call Session Persistence in localStorage across page refreshes
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEYS.VOIP_SESSION);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed?.startTime && Date.now() - parsed.startTime < 86400000) {
          callStreamService.activeCall$.next(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEYS.VOIP_SESSION);
        }
      } catch (_) {
        localStorage.removeItem(STORAGE_KEYS.VOIP_SESSION);
      }
    }

    const sub = callStreamService.activeCall$.subscribe((call) => {
      if (call) {
        localStorage.setItem(STORAGE_KEYS.VOIP_SESSION, JSON.stringify(call));
      } else {
        localStorage.removeItem(STORAGE_KEYS.VOIP_SESSION);
      }
    });

    return () => sub.unsubscribe();
  }, []);

  // 8. Real-Time Socket Event Listeners for Live Call Logs
  const isValidCallPayload = useCallback((data) => {
    if (!data || typeof data !== 'object') return false;
    if (
      data.stat === 0 ||
      data.stat_code === 1001 ||
      (data.stat_code && data.stat_code !== 1000) ||
      data.rd?.[0]?.stat === 0 ||
      data.rd?.[0]?.stat_code === 1001
    ) {
      return false;
    }
    if (!data.sr || isNaN(Number(data.sr)) || Number(data.sr) <= 0) {
      return false;
    }
    return true;
  }, []);

  useSocketEvent('AddCall', (data) => {
    if (!isValidCallPayload(data)) return;
    callStreamService.addNewCall(data, false);
    const caller = data.callBy || data.company || 'Client';
    // toast.info(`New Incoming Call #${data.sr}`, {
    //   description: `From ${caller} • ${data.description || data.appname || 'Voice call logged'}`,
    //   duration: 5000,
    // });
  });

  useSocketEvent('AcceptCall', (data) => {
    if (!isValidCallPayload(data)) return;
    callStreamService.patchPrimaryCall(data.sr, data);
  });

  useSocketEvent('ForwardedCall', (data) => {
    if (!isValidCallPayload(data)) return;
    const currentThreads = callStreamService.threads$.getValue() || [];
    const exists = currentThreads.some((t) => String(t.sr) === String(data.sr));
    if (exists) {
      callStreamService.patchPrimaryCall(data.sr, data);
    } else {
      callStreamService.addNewCall(data, false);
    }

    const currentUserName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim().toLowerCase();
    const forwardedTo = (data.ForwardedEmp || data.forward?.person || '').trim().toLowerCase();

    if (currentUserName && forwardedTo && currentUserName === forwardedTo) {
      // toast.warning(`Call #${data.sr} Forwarded to You`, {
      //   description: `From ${data.callBy || data.company || 'Client'} (${data.company || ''})`,
      //   duration: 6000,
      // });
    }
  });

  useSocketEvent('ADDCOMMENTS', (data) => {
    if (!data) return;
    const comment = unwrapCommentSocketPayload(data);
    const callLogSr = comment?.CallLogId ?? comment?.CallLogid ?? comment?.sr ?? comment?.callLogId;
    if (!callLogSr) return;
    callStreamService.patchComment(callLogSr, {
      ...comment,
      id: getCommentId(comment),
      time: comment.CreatedDate || comment.time || getLocalISOString(),
      Name: comment.Name || comment.CreatedByName || 'Support',
      IsClient: comment.IsClient ?? comment.isClient ?? 0,
    });
  });

  const handleEditCommentSocketEvent = useCallback((data) => {
    const comment = unwrapCommentSocketPayload(data);
    const callLogId = comment?.CallLogId ?? comment?.CallLogid ?? comment?.callLogId ?? comment?.sr;
    const commentId = getCommentId(comment);
    if (callLogId == null || commentId == null) return;

    mutateCallCommentsInStream(callLogId, (comments) => {
      return upsertCommentRecord(comments, comment);
    });
  }, []);

  const handleDeleteCommentSocketEvent = useCallback((data) => {
    const event = unwrapCommentSocketPayload(data);
    const callLogId = event?.CallLogid ?? event?.CallLogId ?? event?.callLogId ?? event?.sr;
    const commentId = event?.CommentId ?? event?.CommentID ?? event?.commentId ?? event?.id;
    if (callLogId == null || commentId == null) return;

    removeCallCommentFromStream(callLogId, commentId);
  }, []);

  useSocketEvent('EDITCOMMENTS', handleEditCommentSocketEvent);
  useSocketEvent('EDIT_COMMENTS', handleEditCommentSocketEvent);
  useSocketEvent('EditComments', handleEditCommentSocketEvent);
  useSocketEvent('EditComment', handleEditCommentSocketEvent);
  useSocketEvent('DELETECOMMENTS', handleDeleteCommentSocketEvent);
  useSocketEvent('DELETE_COMMENTS', handleDeleteCommentSocketEvent);
  useSocketEvent('DeleteComments', handleDeleteCommentSocketEvent);
  useSocketEvent('DeleteComment', handleDeleteCommentSocketEvent);

  // Helper to build chronological message sequence for any individual call record
  const buildMessagesForCall = useCallback((rec, callId) => {
    if (!rec) return [];

    const dateFormatted = formatDateGroup(rec.date || rec.callStart);
    const baseStartTime = getEpochMs(rec.callStart || rec.date, Date.now());
    const mainCallTime = formatFriendlyTime(rec.time, rec.callStart);

    const items = [
      {
        id: `primary-call-${rec.sr || 'main'}-${callId}`,
        dateGroup: dateFormatted,
        sender: rec.company || 'Client',
        time: mainCallTime,
        isCallCard: true,
        sortTime: baseStartTime,
        record: {
          ...rec,
          sr: rec.sr,
          callerName: rec.callBy || 'Client',
          companyName: rec.company || '',
          company: rec.company || '',
          time: rec.time || mainCallTime,
          callerPhone: rec.phone || '',
          receivedBy: rec.receivedBy || rec.AssignedEmpName || '',
          agentName: rec.receivedBy || rec.AssignedEmpName || 'Support Desk',
          AssignedEmpName: rec.AssignedEmpName || rec.receivedBy || '',
          agentAvatar: '',
          appname: rec.appname || '',
          callStart: rec.callStart || '',
          callClosed: rec.callClosed || '',
          duration: rec.CallDuration || '',
          CallDuration: rec.CallDuration || '',
          transcript:
            rec.description ||
            (rec.topicRaisedBy
              ? `Client logged support call regarding ${rec.topicRaisedBy}`
              : ''),
          status: rec.status || (rec.callClosed || rec.CallClosed || (rec.CallDuration && !['00:00', '00:00:00', '0'].includes(String(rec.CallDuration))) ? 'Solved' : 'Pending'),
          Estatus: rec.Estatus || rec.estatus || (rec.callClosed || rec.CallClosed || (rec.CallDuration && !['00:00', '00:00:00', '0'].includes(String(rec.CallDuration))) ? 'Completed' : 'Running'),
          priority: rec.priority ?? '',
          rating: rec.rating || 0,
        },
      },
    ];

    // Append Real Follow-Up calls
    if (rec.FollowUpList) {
      let followUps = [];
      if (typeof rec.FollowUpList === 'string') {
        try {
          followUps = JSON.parse(rec.FollowUpList);
        } catch (_) {
          followUps = [];
        }
      } else if (Array.isArray(rec.FollowUpList)) {
        followUps = rec.FollowUpList;
      }

      if (Array.isArray(followUps)) {
        followUps.forEach((fu, fuIdx) => {
          const fuInternalStatus = String(fu.InternalStatus || fu.internalStatus || fu.status || '').trim().toLowerCase();
          const isForwarded = Boolean(
            fu.ForwardedEmp ||
            fuInternalStatus === 'forwarded' ||
            fu.InternalStatusId === 5 ||
            fu.statusId === 5
          );

          const isSolved =
            fu.statusId === 4 ||
            fu.StatusId === 4 ||
            fuInternalStatus === 'solved' ||
            fuInternalStatus === 'completed' ||
            fuInternalStatus === 'closed' ||
            String(fu.Estatus || fu.estatus || '').trim().toLowerCase() === 'completed';

          const rawCallStart = fu.CallStart || fu.callStart || '';
          const hasRealStart = isValidDate(rawCallStart);
          const hasRealClosed = isValidDate(fu.CallClosed);

          const isPending = !isSolved && !hasRealClosed && (!fu.CallDuration || fu.CallDuration === '00:00:00' || fu.CallDuration === '0');

          if (viewMode === 'followUp-Pending' && !isPending) {
            return;
          }

          if (viewMode === 'followUp-Completed' && isPending) {
            return;
          }

          const rawCreated =
            fu.CreatedDate ||
            fu.createdDate ||
            fu.EntryDate ||
            fu.entryDate ||
            fu.StartDate ||
            fu.startDate ||
            '';

          const hasRealCreated = isValidDate(rawCreated);

          const effectiveDateStr = hasRealStart
            ? rawCallStart
            : hasRealCreated
              ? rawCreated
              : '';

          const fuStartMs = getEpochMs(
            effectiveDateStr,
            baseStartTime + (fuIdx + 1) * 60000
          );

          const fuDateFormatted = formatDateGroup(
            effectiveDateStr || rec.date || rec.callStart
          );

          const fuTimeFormatted = effectiveDateStr
            ? formatFriendlyTime(null, effectiveDateStr)
            : formatFriendlyTime(null, rec.callClosed || rec.callStart);

          const fuDescr =
            fu.Description ||
            fu.description ||
            fu.Descr ||
            fu.descr ||
            fu.Remarks ||
            fu.remarks ||
            fu.Reason ||
            fu.reason ||
            '';
          const fuDuration =
            fu.CallDuration || fu.callDuration || fu.duration || fu.Duration || '00:00:00';
          const fuStart = rawCallStart;
          const fuClosed =
            fu.CallClosed || fu.callClosed || fu.EndDate || fu.endDate || fu.ClosedDate || fu.closedDate || '';
          const fuCreatedBy = fu.CreatedBy || fu.createdBy || '';
          const fuReceivedBy = fu.ReceivedBy || fu.receivedBy || '';
          const fuForwardedEmp = fu.ForwardedEmp || fu.forwardedEmp || '';
          const fuStatus = isForwarded
            ? 'Forwarded'
            : fu.InternalStatus || fu.internalStatus || fu.status || 'Pending';

          const followUpData = {
            ...fu,
            id: fu.Id || fu.followUpCallId || fu.id || fuIdx + 1,
            Id: fu.Id || fu.followUpCallId || fu.id || fuIdx + 1,
            callLogId: rec.sr,
            sr: rec.sr,
            Description: fuDescr,
            description: fuDescr,
            Descr: fuDescr,
            CallStart: fuStart,
            callStart: fuStart,
            CallClosed: fuClosed,
            callClosed: fuClosed,
            CallDuration: fuDuration,
            callDuration: fuDuration,
            duration: fuDuration,
            CreatedBy: fuCreatedBy,
            createdBy: fuCreatedBy,
            ReceivedBy: fuReceivedBy,
            receivedBy: fuReceivedBy,
            ForwardedEmp: fuForwardedEmp,
            forwardedEmp: fuForwardedEmp,
            InternalStatus: fuStatus,
            internalStatus: fuStatus,
            InternalStatusId: fu.InternalStatusId || fu.internalStatusId || 0,
            internalStatusId: fu.InternalStatusId || fu.internalStatusId || 0,
            isForwarded: isForwarded,
            callerName: rec.callBy,
            companyName: rec.company,
            topicRaisedBy: getCallSource(fu) || getCallSource(rec),
          };

          items.push({
            id: `followup-${rec.sr}-${fu.Id || fu.followUpCallId || fu.id || fuIdx}-${fuIdx}`,
            dateGroup: fuDateFormatted,
            sender:
              isForwarded && fuForwardedEmp
                ? fuForwardedEmp
                : fuCreatedBy || rec.receivedBy || 'Support Executive',
            company: rec.company,
            time: fuTimeFormatted,
            isFollowUpCard: true,
            isForwarded: isForwarded,
            sortTime: fuStartMs,
            followup: followUpData,
            followUpData: followUpData,
          });
        });
      }
    }

    // Append Real Comments & Attachments
    if (rec.comment || rec.CommentsArray || rec.comments) {
      const commentsList = parseCallComments(rec);
      if (Array.isArray(commentsList)) {
        try {
          commentsList.forEach((cItem, cIdx) => {
            const commentText = cItem.text || cItem.comment || cItem.Comments || cItem.comments || '';
            const commentId = getCommentId(cItem);
            const cTimeFormatted = cItem.time
              ? formatFriendlyTime(null, cItem.time)
              : mainCallTime;

            const cDateFormatted = formatDateGroup(cItem.time || rec.date || rec.callStart);
            const cSortTime = getEpochMs(
              cItem.time,
              baseStartTime + (cIdx + 2) * 60000
            );

            const rawImg = cItem.img || cItem.FilePath || cItem.filePath || '';
            const hasAttachment = Boolean(rawImg);
            const filenameFromUrl = rawImg ? rawImg.split('/').pop() : '';

            const attachmentData = hasAttachment
              ? {
                id: cItem.id || cIdx + 1,
                filename: filenameFromUrl || 'Attachment',
                subTitle: 'Image file',
                fileType: 'Image file',
                type: 'image',
                imgUrl: rawImg,
                text: commentText,
              }
              : null;

            const commentCreatedBy = cItem.CreatedBy ?? cItem.createdBy;
            const clientFlag = cItem.IsClient ?? cItem.isClient;
            const isClient = Number(clientFlag) === 1;
            const explicitSender = String(cItem.Name || cItem.CreatedByName || '').trim();
            const fallbackSender = clientFlag == null
              ? rec.callBy || 'Client'
              : isClient
                ? rec.callBy || 'Client'
                : rec.receivedBy || rec.AssignedEmpName || 'Support Executive';
            const currentUserName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim().toLowerCase() || String(user?.name || '').trim().toLowerCase();
            const isAdmin = String(user?.role || '').trim().toLowerCase() === 'admin' || Number(user?.roleid) === 1;
            const isCurrentUser = commentCreatedBy != null && user?.id != null
              ? String(commentCreatedBy) === String(user.id)
              : Boolean(currentUserName && String(cItem.Name || cItem.CreatedByName || '').toLowerCase().trim() === currentUserName);

            items.push({
              id: `comment-${rec.sr}-${cItem._clientKey || commentId || 'comment'}-${cIdx}`,
              commentId,
              filePath: rawImg,
              createdBy: commentCreatedBy,
              dateGroup: cDateFormatted,
              sender: explicitSender || fallbackSender,
              company: rec.company,
              avatar: isCurrentUser ? user?.avatar || '' : '',
              time: cTimeFormatted,
              content: commentText.trim(),
              // IsClient is the source of truth: client left, support right.
              isComment: true,
              isOutgoing: false,
              isClient,
              IsClient: cItem.IsClient,
              canManageComment: user?.id != null && (isCurrentUser || isAdmin) && Boolean(commentId) && !isClient && !cItem._optimisticComment,
              hasAttachment: hasAttachment,
              attachment: attachmentData,
              isClientReply: false,
              sortTime: cSortTime,
            });
          });
        } catch (_) { }
      }
    }

    // Append Ticket Entry Card if call is upgraded to a genuine Ticket
    const hasTicket = hasRealTicket(rec);
    if (hasTicket) {
      const ticketTime = rec.Ticket_CreatedDate && isValidDate(rec.Ticket_CreatedDate)
        ? formatFriendlyTime(null, rec.Ticket_CreatedDate)
        : mainCallTime;
      const ticketDate = rec.Ticket_CreatedDate && isValidDate(rec.Ticket_CreatedDate)
        ? formatDateGroup(rec.Ticket_CreatedDate)
        : dateFormatted;

      const resolvedTicketNo = getResolvedTicketId(rec) || rec.TicketNo || rec.ticket;

      if (resolvedTicketNo) {
        items.push({
          id: `ticket-card-${rec.sr || 'main'}-${callId}`,
          dateGroup: ticketDate,
          sender: rec.receivedBy || rec.AssignedEmpName,
          time: ticketTime,
          isTicketCard: true,
          sortTime: baseStartTime + 400,
          ticketData: {
            ticketId: resolvedTicketNo,
            ticketCreatedDate: rec.Ticket_CreatedDate || '',
            ticketTitle: rec.description || rec.Descr || '',
            appname: rec.appname || rec.company || '',
            createdBy: rec.receivedBy || rec.AssignedEmpName,
            company: rec.company || '',
            sr: rec.sr,
            rawRecord: rec,
          },
        });
      }
    }

    // Append iTask Entry Card if call is moved to iTask
    const hasTask = Boolean(
      (rec.TaskId && Number(rec.TaskId) > 0) ||
      (rec.taskId && Number(rec.taskId) > 0)
    );
    if (hasTask) {
      items.push({
        id: `itask-card-${rec.sr || 'main'}-${callId}`,
        dateGroup: dateFormatted,
        sender: rec.receivedBy || rec.AssignedEmpName,
        time: mainCallTime,
        isiTaskCard: true,
        sortTime: baseStartTime + 500,
        itaskData: {
          taskId: rec.TaskId || rec.taskId,
          taskName: rec.description || rec.Descr || 'Call Task in iTask',
          customerName: rec.company || '',
          assignedTo: rec.receivedBy || rec.AssignedEmpName,
          sr: rec.sr,
          rawRecord: rec,
        },
      });
    }

    return items;
  }, [user, viewMode]);

  // O(1) Map for 15,000+ instant lookups across IDs, serials, and prefix formats
  const threadMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < threads.length; i++) {
      const t = threads[i];
      map.set(t.id, t);
      if (t.sr) {
        map.set(String(t.sr), t);
        map.set(Number(t.sr), t);
        map.set(`call-${t.sr}`, t);
      }
    }
    return map;
  }, [threads]);

  const activeThread = useMemo(() => {
    // 1. If activeThreadId is set, find match in current threads (User clicks have top priority)
    if (activeThreadId) {
      const match =
        threadMap.get(activeThreadId) ||
        threadMap.get(String(activeThreadId)) ||
        threadMap.get(`call-${activeThreadId}`) ||
        threads.find((t) => t.id === activeThreadId || String(t.sr) === String(activeThreadId) || `call-${t.sr}` === activeThreadId);
      if (match) return match;
    }

    // 2. If an active VoIP call is running and no thread is manually selected, find VoIP match
    const activeVoip = callStreamService.activeCall$.getValue();
    if (activeVoip?.sr) {
      const voipMatch =
        threadMap.get(`call-${activeVoip.sr}`) ||
        threadMap.get(String(activeVoip.sr)) ||
        threads.find((t) => String(t.sr) === String(activeVoip.sr));
      if (voipMatch) return voipMatch;
    }

    return threads[0] || null;
  }, [threadMap, activeThreadId, threads]);

  // Render conversation based on Timeline Mode vs Single Call Mode
  useEffect(() => {
    if (!activeThread) {
      setMessages([]);
      return;
    }

    const currentCompany = selectedCompany !== 'all'
      ? selectedCompany
      : (activeThread.company || 'all');

    const getCustomForCall = (callItem) => {
      if (!callItem) return [];
      const threadKey = callItem.id;
      const srKey = String(callItem.sr || callItem.rawRecord?.sr || '');
      const rawList = [
        ...(customMessagesMap[threadKey] || []),
        ...(srKey ? (customMessagesMap[srKey] || []) : []),
      ];
      const seen = new Set();
      return rawList.filter((msg) => {
        if (!msg || !msg.id || seen.has(msg.id)) return false;
        seen.add(msg.id);
        if (msg.isFollowUp || msg.isFollowUpCard || msg.fuData || msg.followup) return false;
        const cText = (msg.content || '').trim().toLowerCase();
        if (cText.startsWith('"comment":') || cText.startsWith('{') || cText.startsWith('[')) return false;
        return true;
      });
    };

    // Always render single active call conversation exclusively
    const rawRec = activeThread.rawRecord || activeThread;
    const callItems = buildMessagesForCall(rawRec, activeThread.id);
    const injectedCustom = getCustomForCall(activeThread).filter((msg) => {
      const cText = (msg.content || '').trim().toLowerCase();
      return !callItems.some((ci) => (ci.content || '').trim().toLowerCase() === cText);
    });
    const combined = [...callItems, ...injectedCustom];
    combined.sort((a, b) => (a.sortTime || 0) - (b.sortTime || 0));
    setMessages(combined);
  }, [
    activeThread,
    threads,
    selectedCompany,
    conversationViewMode,
    customMessagesMap,
    buildMessagesForCall,
  ]);

  const handleSelectThread = useCallback((threadId) => {
    callStreamService.selectThread(threadId);
    setActiveThreadId(threadId);
    setConversationViewMode('single');
  }, []);

  const handleSelectCompany = useCallback((compName) => {
    // Rail selection filters the calls locally; keep the broader result set
    // available so other companies and their counts remain visible.
    callStreamService.selectCompany(compName);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    callStreamService.setSearchQuery(query);
    setGlobalSearchQuery(query);
  }, []);

  // Clear all active filters and reset to full unfiltered call list
  const handleClearAllFilters = useCallback(() => {
    // 1. Reset all filter state variables
    setSearchQuery('');
    setGlobalSearchQuery('');
    callStreamService.setSearchQuery('');

    setViewMode('team');
    callStreamService.setViewMode('team');

    setSelectedCompany('all');
    callStreamService.selectCompany('all');

    setTopBarCompany('all');

    setStatusFilter('all');
    callStreamService.setStatusFilter('all');

    setFilterBy('');

    setDateRangeObj(null);
    callStreamService.setDateRange(null);

    // 2. Clear URL search query parameters safely
    isInternalUrlUpdateRef.current = true;
    navigate({ pathname: location.pathname, search: '?status=all' }, { replace: true });

    // The filter effect observes the reset state and performs the single refetch.
  }, [navigate, location.pathname]);

  // Start Live VoIP Support Call & push call record via RxJS Stream
  const handleStartCall = useCallback(async () => {
    if (!activeThread) {
      // toast.error('Select a conversation to start a call');
      return;
    }
    if (callStreamService.activeCall$.getValue()) return;

    const rawCall = activeThread.rawRecord || activeThread;
    const isForwardedPrimary = rawCall.CallType === 'Forwarded' || Boolean(
      rawCall.ForwardedEmp || rawCall.ForwardedEmpId || activeThread.ForwardedEmp || activeThread.ForwardedEmpId
    );
    const forwardedToId = rawCall.ForwardedEmpId || activeThread.ForwardedEmpId;
    const forwardedToName = rawCall.ForwardedEmp || activeThread.ForwardedEmp;
    const currentUserName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.name || '';
    if (
      (forwardedToId && String(forwardedToId) !== String(user?.id)) ||
      (!forwardedToId && forwardedToName && currentUserName && forwardedToName.trim().toLowerCase() !== currentUserName.trim().toLowerCase())
    ) return;

    if (activeThread?.sr && callLogCtx?.startCall) {
      try {
        const result = await callLogCtx.startCall(activeThread.sr);
        if (result && !result.success) {
          const errMsg =
            result.error?.message ||
            result.msg?.stat_msg ||
            'You cannot start this call.';
          // toast.error(errMsg);
          return;
        }
      } catch (err) {
        console.error('startCall API error:', err);
        // toast.error(err?.message || 'Failed to start call');
        return;
      }
    }

    const userName = user?.firstname
      ? `${user.firstname} ${user.lastname || ''}`.trim()
      : user?.name || 'Support Executive';

    if (activeThread?.sr) {
      callStreamService.patchPrimaryCall(activeThread.sr, {
        receivedBy: userName,
        AssignedEmpName: userName,
        callStart: new Date().toISOString(),
        status: 'In Progress',
        Estatus: 'Running',
      });
    }

    const callData = callStreamService.startCall(activeThread, {
      isForwarded: isForwardedPrimary,
      ownerId: isForwardedPrimary ? forwardedToId : user?.id,
      ownerName: isForwardedPrimary ? forwardedToName : userName,
    });
    if (callData) {

    }
  }, [activeThread, callLogCtx, user]);

  // Handle Confirm Accept Call from Queue (Exact same API & logic as CallLogger)
  const handleConfirmAcceptCall = useCallback(async () => {
    if (!acceptCallState?.callId) return;
    setIsAcceptingQueue(true);
    try {
      const res = await callLogCtx.AcceptQueueCall(acceptCallState.callId);
      if (res && !res.success) {
        // toast.error(res.error?.message || 'Failed to accept call');
      } else if (res && res.success) {
        const userName = user?.firstname
          ? `${user.firstname} ${user.lastname || ''}`.trim()
          : user?.name || 'unknown';
        callStreamService.patchPrimaryCall(acceptCallState.callId, {
          receivedBy: userName,
          AssignedEmpName: userName,
          status: 'In Progress',
          Estatus: 'Running',
        });
        callStreamService.selectThread(`call-${acceptCallState.callId}`);
        callLogCtx?.triggerRefresh?.();
      }
    } catch (err) {
      // toast.error(err.message || 'Failed to accept call');
    } finally {
      setIsAcceptingQueue(false);
      acceptCallModal$.next(null);
    }
  }, [acceptCallState, callLogCtx, user]);

  // Handle selecting a call directly from the Queue Rail
  const handleSelectQueueCall = useCallback(
    (threadId, rawCall) => {
      if (rawCall) {
        const currentThreads = callStreamService.threads$.getValue() || [];
        const exists = currentThreads.some(
          (t) => t.id === threadId || t.sr === rawCall.sr || t.sr === rawCall.id
        );
        if (!exists) {
          callStreamService.addNewCall(rawCall, false);
        }
      }
      handleSelectThread(threadId);
    },
    [handleSelectThread]
  );

  const handleEditComment = useCallback(async (message, { text, files = [], removeAttachmentPaths = [], removeAttachment = false }) => {
    const callLogId = activeThread?.sr || activeThread?.rawRecord?.sr;
    const commentId = message?.commentId;
    if (!callLogId || commentId == null) {
      toast.error('This comment is missing its call or comment ID.');
      return false;
    }

    const oldPaths = parseCommentAttachmentPaths(message.filePath || message.attachment?.imgUrl);
    const removedPaths = new Set(removeAttachment ? oldPaths : parseCommentAttachmentPaths(removeAttachmentPaths));
    const retainedOldPaths = oldPaths.filter((path) => !removedPaths.has(path));
    const filesToUpload = Array.isArray(files) ? files : (files ? [files] : []);
    let uploadedPaths = [];
    let nextFilePath = retainedOldPaths.join(',');
    let commentText = String(text || '').trim();
    let attachmentCleanupFailed = false;

    try {
      if (filesToUpload.length) {
        uploadedPaths = await uploadCommentAttachments({
          files: filesToUpload,
          callLogId,
          ukey: CompanyInfo?.ukey || user?.ukey,
        });
        nextFilePath = [...retainedOldPaths, ...uploadedPaths].join(',');
      }

      if (!commentText && nextFilePath) commentText = 'Shared an attachment';
      if (!commentText && !nextFilePath) {
        toast.error('A comment must include text or an attachment.');
        if (uploadedPaths.length) await removeCommentAttachments(uploadedPaths);
        return false;
      }

      const response = await CallLogApi.editCallComments({
        callLogId,
        commentId,
        comments: commentText,
        filePath: nextFilePath,
        createdBy: user?.id,
      });
      assertCommentMutationSucceeded(response, 'The comment could not be updated.');

      const savedComment = response?.rd1?.[0] || {};
      const savedCommentId = getCommentId(savedComment) ?? commentId;
      const savedText = savedComment.Comments ?? commentText;
      // The edit endpoint can echo the old FilePath when it receives an empty
      // value. A user's explicit remove selection is authoritative: persist the
      // intended path locally and remove the old files from storage below.
      const hasExplicitAttachmentRemoval = removeAttachment || removedPaths.size > 0;
      const savedFilePath = hasExplicitAttachmentRemoval
        ? nextFilePath
        : (savedComment.FilePath ?? nextFilePath);

      mutateCallCommentsInStream(callLogId, (comments) => {
        const updated = upsertCommentRecord(comments, {
          ...savedComment,
          id: savedCommentId,
          Comments: savedText,
          FilePath: savedFilePath,
        });
        return updated;
      });

      const pathsToRemove = getUnreferencedAttachmentPaths(
        [...oldPaths, ...uploadedPaths],
        hasExplicitAttachmentRemoval ? nextFilePath : savedFilePath
      );
      if (pathsToRemove.length) {
        try {
          await removeCommentAttachments(pathsToRemove);
        } catch (fileError) {
          attachmentCleanupFailed = true;
          console.error('Comment saved, but old attachment cleanup failed:', fileError);
          toast.warning('Comment updated, but its old attachment could not be removed.');
        }
      }

      if (!attachmentCleanupFailed) toast.success('Comment updated.');
      return true;
    } catch (error) {
      if (uploadedPaths.length) {
        try {
          await removeCommentAttachments(uploadedPaths);
        } catch (cleanupError) {
          console.error('Failed to clean up an unused uploaded comment attachment:', cleanupError);
        }
      }
      console.error('Failed to edit call comment:', error);
      toast.error(error?.message || 'Could not update the comment.');
      return false;
    }
  }, [activeThread, CompanyInfo, user]);

  const handleDeleteComment = useCallback(async (message) => {
    const callLogId = activeThread?.sr || activeThread?.rawRecord?.sr;
    const commentId = message?.commentId;
    if (!callLogId || commentId == null) {
      toast.error('This comment is missing its call or comment ID.');
      return false;
    }

    let attachmentCleanupFailed = false;
    try {
      const response = await CallLogApi.deleteCallComments({
        callLogId,
        commentId,
        createdBy: user?.id,
      });
      assertCommentMutationSucceeded(response, 'The comment could not be deleted.');

      const deletedComment = response?.rd1?.[0] || {};
      const deletedCallLogId = deletedComment.CallLogid ?? deletedComment.CallLogId ?? callLogId;
      const deletedCommentId = getCommentId(deletedComment) ?? commentId;
      removeCallCommentFromStream(deletedCallLogId, deletedCommentId);

      const pathsToRemove = parseCommentAttachmentPaths(message.filePath || message.attachment?.imgUrl);
      if (pathsToRemove.length) {
        try {
          await removeCommentAttachments(pathsToRemove);
        } catch (fileError) {
          attachmentCleanupFailed = true;
          console.error('Comment deleted, but attachment cleanup failed:', fileError);
          toast.warning('Comment deleted, but its attachment could not be removed.');
        }
      }

      if (!attachmentCleanupFailed) toast.success('Comment deleted.');
      return true;
    } catch (error) {
      // Keep the comment visible unless the API confirms deletion. In
      // particular, "Comment not found" can mean the submitted ID did not
      // match a server record, so removing it locally would hide undeleted data.
      console.error('Failed to delete call comment:', error);
      toast.error(error?.message || 'Could not delete the comment.');
      return false;
    }
  }, [activeThread, CompanyInfo, user]);

  const handleSendMessage = useCallback(
    async (text, fileOrAttachment = null) => {
      if (!activeThreadId) return;

      const activeThreadItem = activeThread || threadMap.get(activeThreadId);
      const callLogSr =
        activeThreadItem?.sr ||
        activeThreadItem?.rawRecord?.sr ||
        (typeof activeThreadId === 'number' ? activeThreadId : null);
      if (!callLogSr) {
        toast.error('Select a call before adding a comment or attachment.');
        return;
      }

      const senderName = user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.name || '-';

      const now = new Date();
      let uploadedUrl = null;

      const isArrayOfFiles = Array.isArray(fileOrAttachment) && fileOrAttachment.length > 0;
      const isSingleFile = fileOrAttachment instanceof File ||
        (fileOrAttachment && typeof fileOrAttachment === 'object' && fileOrAttachment.name && fileOrAttachment.size !== undefined && !Array.isArray(fileOrAttachment));

      // 1. If files are attached, upload via filesUploadApi
      if (isArrayOfFiles || isSingleFile) {
        const filesToUpload = isArrayOfFiles ? fileOrAttachment : [fileOrAttachment];
        try {
          const uploadedPaths = await uploadCommentAttachments({
            files: filesToUpload,
            callLogId: callLogSr,
            ukey: CompanyInfo?.ukey || user?.ukey,
          });

          uploadedUrl = uploadedPaths.join(',') || null;
        } catch (uploadErr) {
          console.error('File upload failed:', uploadErr);
          toast.error(uploadErr?.message || 'Failed to upload attachment.');
          return;
        }
      } else if (fileOrAttachment && !isArrayOfFiles) {
        uploadedUrl = fileOrAttachment.imgUrl || fileOrAttachment.url || null;
      }

      const messageContent = text?.trim() || (uploadedUrl ? 'Shared an attachment' : '');
      if (!messageContent && !uploadedUrl) return;

      const pendingCommentId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      if (callLogSr) {
        callStreamService.patchComment(callLogSr, {
          id: pendingCommentId,
          _clientKey: pendingCommentId,
          text: messageContent,
          img: uploadedUrl || '',
          time: getLocalISOString(),
          Name: senderName,
          CreatedBy: user?.id,
          IsClient: 0,
          _optimisticComment: true,
        });
      }

      // Keep the optimistic comment in the comment stream and reconcile it
      // with the API/socket record; do not add a second generic chat bubble.
      if (callLogSr) {
        try {
          const response = await CallLogApi.addCallComments(
            callLogSr,
            messageContent,
            uploadedUrl || '',
            user?.id,
            0
          );
          assertCommentMutationSucceeded(response, 'The comment could not be sent.');

          const savedComment = response?.rd1?.[0];
          if (savedComment) {
            callStreamService.patchComment(callLogSr, savedComment);
            const savedPathField = savedComment.FilePath ?? savedComment.filePath ?? savedComment.img;
            if (uploadedUrl && savedPathField != null) {
              const orphanedPaths = getUnreferencedAttachmentPaths(
                parseCommentAttachmentPaths(uploadedUrl),
                savedPathField
              );
              if (orphanedPaths.length) {
                try {
                  await removeCommentAttachments(orphanedPaths);
                } catch (cleanupError) {
                  console.error('Comment saved, but its unreferenced uploaded attachment could not be removed:', cleanupError);
                  toast.warning('Comment saved, but an unused attachment could not be removed.');
                }
              }
            }
          }
        } catch (error) {
          console.error('Error posting comment:', error);
          mutateCallCommentsInStream(callLogSr, (comments) => {
            const remaining = removeCommentRecord(comments, pendingCommentId);
            return remaining.length === comments.length ? null : remaining;
          });
          if (uploadedUrl) {
            try {
              await removeCommentAttachments(parseCommentAttachmentPaths(uploadedUrl));
            } catch (cleanupError) {
              console.error('Failed to clean up an unused comment attachment:', cleanupError);
            }
          }
          toast.error(error?.message || 'Could not send the comment.');
        }
      }
    },
    [activeThreadId, activeThread, threadMap, CompanyInfo, user]
  );

  const handleExportCSV = useCallback(() => {
    const currentFiltered = threads;

    if (currentFiltered.length === 0) {
      // toast.error('No call logs to export for selected filters');
      return;
    }

    const headers = ['Sr', 'Company', 'Caller', 'Assigned To', 'App Name', 'Status', 'Internal Status', 'Priority', 'Rating', 'Date', 'Duration', 'Description'];
    const rows = currentFiltered.map((t) => [
      t.sr || '',
      `"${(t.company || '').replace(/"/g, '""')}"`,
      `"${(t.callBy || '').replace(/"/g, '""')}"`,
      `"${(t.receivedBy || '').replace(/"/g, '""')}"`,
      `"${(t.appname || '').replace(/"/g, '""')}"`,
      `"${(t.status || '').replace(/"/g, '""')}"`,
      `"${(t.estatus || '').replace(/"/g, '""')}"`,
      `"${(t.priority || '').replace(/"/g, '""')}"`,
      t.rating || '0',
      `"${(t.date || '').replace(/"/g, '""')}"`,
      `"${(t.duration || '').replace(/"/g, '""')}"`,
      `"${(t.lastMessage || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = `data:text/csv;charset=utf-8,${[headers.join(','), ...rows.map((e) => e.join(','))].join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Call_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }, [threads]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        selectedCompany={topBarCompany}
        setSelectedCompany={setTopBarCompany}
        companies={companies}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        viewMode={viewMode}
        setViewMode={(mode) => {
          setViewMode(mode);
          callStreamService.setViewMode(mode);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(st) => {
          setStatusFilter(st);
        }}
        dateRangeObj={dateRangeObj}
        setDateRangeObj={(range) => {
          setDateRangeObj(range);
          callStreamService.setDateRange(range);
        }}
        onAddClick={() => openAddCallModal('')}
        onExportClick={handleExportCSV}
        onClearAll={handleClearAllFilters}
        isRailCompanyFiltered={selectedCompany !== 'all'}
        isSidebarsCollapsed={isSidebarsCollapsed}
        onToggleSidebars={handleToggleSidebars}
      />

      {/* Global Floating VoIP Call Widget */}
      <FloatingCallWidget />

      {/* Call Queue Horizontal Rail (Collapsible via Header Queue Button or URL) */}
      {isQueueOpen && (
        <QuickQueryCardsRail
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectQueueCall}
          onAcceptCall={(callId) => {
            acceptCallModal$.next({ callId });
          }}
          onClose={() => {
            setIsQueueOpen(false);
          }}
        />
      )}

      {/* Main Workspace: Company Avatars Rail + Direct Messages Sidebar + Chat Canvas + Inspector */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden', bgcolor: '#d6d6d83d', p: 0.5 }}>
        {/* Inner Sidebar 1: Company Avatars Rail */}
        <Box
          sx={{
            display: 'flex',
            bgcolor: "#fff",
            borderRadius: 1,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <CompanyAvatarRail
            open={showCompanies}
            onClose={() => setShowCompanies(false)}
            onOpen={() => setShowCompanies(true)}
            isCallsOpen={showCallsList}
            onOpenCalls={() => setShowCallsList(true)}
            companies={visibleCompanies}
            selectedCompany={selectedCompany}
            onSelectCompany={handleSelectCompany}
            totalCallsCount={countScopeThreads.length}
            isLoading={isLoading}
          />

          {/* Inner Sidebar 2: Individual Calls List */}
          <DirectMessagesSidebar
            open={showCallsList}
            onClose={() => setShowCallsList(false)}
            onOpen={() => setShowCallsList(true)}
            isCompaniesOpen={showCompanies}
            onOpenCompanies={() => setShowCompanies(true)}
            threads={threads}
            companies={visibleCompanies}
            overallCallsCount={countScopeThreads.length}
            activeThreadId={activeThreadId}
            onSelectThread={handleSelectThread}
            searchQuery={searchQuery}
            selectedCompany={selectedCompany}
            onSelectCompany={handleSelectCompany}
            isLoading={isLoading}
          />
        </Box>

        {/* Right Center: Main Chat Conversation Canvas */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            px: 0.8,
            borderRadius: 3,
            borderRight: '1px solid #E5E7EB',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          {/* Header with Sleek Status Pills & Company Timeline Switch */}
          <ChatHeader
            activeThread={activeThread}
            selectedCompany={selectedCompany}
            viewMode={conversationViewMode}
            onToggleViewMode={setConversationViewMode}
            isLoading={isLoading}
            isInspectorOpen={isInspectorOpen}
            onToggleInspector={setIsInspectorOpen}
            onOpenCallModal={handleStartCall}
            showCallsList={showCallsList}
            onToggleCallsList={() => {
              setShowCallsList(true);
              setShowCompanies(true);
            }}
          />

          {/* Messages Feed */}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />

          {/* Bottom Message Composer */}
          <MessageComposer
            placeholder={`Reply to ${activeThread?.callBy || activeThread?.company || 'call'}...`}
            onSendMessage={handleSendMessage}
            activeThread={activeThread}
          />
        </Box>

        {/* Right Side Detail & Attachments Inspector Panel */}
        <RightDetailInspector
          open={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          activeThread={activeThread}
          selectedCompany={selectedCompany}
          threads={threads}
          companies={companies}
          onSelectThread={handleSelectThread}
        />
      </Box>

      {/* Modals triggered via RxJS Event Bus */}
      <CallLogDrawer
        key={`newcall-add-drawer-${addModalState?.open ? 'open' : 'closed'}`}
        open={Boolean(addModalState?.open)}
        onClose={closeAddCallModal}
        defaultCompany=""
        onSuccess={handleCallAdded}
        onRecordToggle={() => { }}
      />
      <NewCallFollowUpModal />
      <NewCallEditModal />
      <NewCallForwardModal />
      <NewCallDurationModal />

      {/* Accept Queue Call Modal (Exact same modal & confirmation as CallLogger) */}
      {Boolean(acceptCallState) && (
        <AcceptCallModal
          isDialogOpen={Boolean(acceptCallState)}
          loading={isAcceptingQueue}
          handleConfirmStartCall={handleConfirmAcceptCall}
          handleCancel={() => {
            acceptCallModal$.next(null);
          }}
        />
      )}
    </Box>
  );
}
