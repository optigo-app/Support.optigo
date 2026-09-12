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
import { formatLocalDateToYYYYMMDD } from './AirbnbDateRangePicker';
import { formatTimeOnly, formatDateGroup, isValidDate, getEpochMs } from './utils/dateUtils';
import { filesUploadApi } from '../../apis/UploadFille';
import { useSocketEvent } from '../../hooks/useSocketListener';

const STORAGE_KEYS = {
  VOIP_SESSION: 'newcall_active_voip_session',
};

export default function ChatWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [threads, setThreads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('all'); // Sidebar Screen Filter
  const [topBarCompany, setTopBarCompany] = useState('all'); // TopBar Dropdown Server API Filter (ProjectID)
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('team'); // 'normal' | 'team' | 'followUp-Pending' | 'followUp-Completed'
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterBy, setFilterBy] = useState(''); // Date target field: 'date' | 'callStart' | 'callClosed'
  const [dateRangeObj, setDateRangeObj] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [customMessagesMap, setCustomMessagesMap] = useState({});
  const [conversationViewMode, setConversationViewMode] = useState('single'); // 'single' | 'timeline'

  const lastFilterKeyRef = useRef('');
  const isInternalUrlUpdateRef = useRef(false);
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
      status: 'Solved',
      estatus: 'Completed',
      Estatus: 'Completed',
      receivedBy: user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.name || 'Support Desk',
    };
    callStreamService.addNewCall(createdThreadRecord, true);
    callStreamService.selectCompany('all');
    toast.success(`Call logged successfully for ${companyLabel}`);
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

  // 2. Sync live Call Logs into RxJS Stream
  // - If workspace hasn't done its own fetch yet: full initData (initial load path)
  // - If workspace HAS done its own fetch: smart merge — update existing threads only,
  //   preserving the filtered data set. This prevents description/status saves from
  //   wiping the filtered view (UseCallLog refreshes with different URL param keys).
  useEffect(() => {
    if (!Array.isArray(liveCallLog)) return;

    if (!workspaceOwnsDataRef.current) {
      // Initial load path: workspace hasn't fetched yet, use context data directly
      callStreamService.initData(liveCallLog);
    } else {
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

        // Check if anything meaningful changed (including comments!)
        const changed =
          fresh.description !== (t.rawRecord?.description || t.rawRecord?.Descr) ||
          fresh.FollowUpList !== t.rawRecord?.FollowUpList ||
          fresh.comment !== t.rawRecord?.comment ||
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

        return {
          ...t,
          unread: isUnread,
          status: fresh.status || t.status,
          estatus: fresh.Estatus || fresh.estatus || t.estatus,
          callStart: fresh.callStart || t.callStart,
          callClosed: fresh.callClosed || t.callClosed,
          lastMessage: fresh.description || fresh.Descr || t.lastMessage,
          comment: fresh.comment || t.comment,
          comments: (() => {
            if (!fresh.comment) return t.comments;
            try {
              const parsed = typeof fresh.comment === 'string'
                ? JSON.parse(fresh.comment)
                : fresh.comment;
              return Array.isArray(parsed) ? parsed : t.comments;
            } catch { return t.comments; }
          })(),
          followUps: (() => {
            if (!fresh.FollowUpList) return t.followUps;
            try {
              const parsed = typeof fresh.FollowUpList === 'string'
                ? JSON.parse(fresh.FollowUpList)
                : fresh.FollowUpList;
              return Array.isArray(parsed) ? parsed : t.followUps;
            } catch { return t.followUps; }
          })(),
          rawRecord: { ...t.rawRecord, ...fresh },
        };
      });

      if (hasChanges) {
        callStreamService.threads$.next(merged);
      }
    }
  }, [liveCallLog]);

  // 3. Subscribe to RxJS Reactive Streams
  useEffect(() => {
    const subThreads = callStreamService.filteredThreads$.subscribe(setThreads);
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
      subCompanies.unsubscribe();
      subSelectedComp.unsubscribe();
      subActiveId.unsubscribe();
      subLoading.unsubscribe();
      subViewMode.unsubscribe();
      subCustomMsgs.unsubscribe();
    };
  }, []);

  // 4. Initialize from URL Query Params on mount (exact CallLogger behavior)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const savedSearch = params.get('search') || '';
    const savedView = params.get('view') || 'team';
    const savedCompany = params.get('company') || params.get('companyStatus') || '';
    const savedStatus = params.get('status') || '';
    const savedTarget = params.get('target') || '';
    const start = params.get('start');
    const end = params.get('end');

    if (savedSearch) {
      setSearchQuery(savedSearch);
      callStreamService.setSearchQuery(savedSearch);
    }
    if (savedView) {
      setViewMode(savedView);
      callStreamService.setViewMode(savedView);
    }
    if (savedCompany && savedCompany !== 'all') {
      setSelectedCompany(savedCompany);
      callStreamService.selectCompany(savedCompany);
    }
    if (savedStatus && savedStatus !== 'all') {
      setStatusFilter(savedStatus);
      callStreamService.setStatusFilter(savedStatus);
    }
    if (savedTarget) {
      setFilterBy(savedTarget);
    }
    if (start && end) {
      const range = { start: new Date(start), end: new Date(end) };
      setDateRangeObj(range);
      callStreamService.setDateRange({ ...range, field: savedTarget || 'date' });
    }
  }, []);

  // 5. Sync filters into URL search params safely without triggering re-render loops
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('search', searchQuery);
    if (viewMode && viewMode !== 'team') newParams.set('view', viewMode);
    if (selectedCompany && selectedCompany !== 'all') {
      newParams.set('company', Array.isArray(selectedCompany) ? selectedCompany.join(',') : selectedCompany);
    }
    if (statusFilter && statusFilter !== 'all') newParams.set('status', statusFilter);
    if (filterBy) newParams.set('target', filterBy);
    if (dateRangeObj?.start) newParams.set('start', formatLocalDateToYYYYMMDD(dateRangeObj.start));
    if (dateRangeObj?.end) newParams.set('end', formatLocalDateToYYYYMMDD(dateRangeObj.end));

    const newQueryStr = newParams.toString();
    const currentQueryStr = currentParams.toString();

    if (newQueryStr !== currentQueryStr) {
      isInternalUrlUpdateRef.current = true;
      navigate({ pathname: location.pathname, search: newQueryStr ? `?${newQueryStr}` : '' }, { replace: true });
    }
  }, [searchQuery, viewMode, selectedCompany, statusFilter, filterBy, dateRangeObj, navigate, location.pathname, location.search]);

  // 6. Sync search query when URL changes externally (e.g. from GlobalSearchBar)
  useEffect(() => {
    if (isInternalUrlUpdateRef.current) {
      isInternalUrlUpdateRef.current = false;
      return;
    }
    const params = new URLSearchParams(location.search);
    const savedSearch = params.get('search') || params.get('searchQuery') || '';
    if (savedSearch !== searchQuery) {
      setSearchQuery(savedSearch);
      callStreamService.setSearchQuery(savedSearch);
    }
  }, [location.search, searchQuery]);

  // ID Resolvers to ensure Backend gets ProjectID and StatusId numbers
  const getProjectId = useCallback(
    (comp) => {
      if (!comp || comp === 'all') return '';
      const rawVal = Array.isArray(comp) ? comp[0] : comp;
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
      const rawVal = Array.isArray(st) ? st[0] : st;
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
        try {
          setIsLoading(true);
          const data = await CallLogApi.getCallLogs({
            endDate: filters.endDate || '',
            startDate: filters.startDate || '',
            statusId: filters.statusId !== undefined && filters.statusId !== 'all' ? filters.statusId : '',
            projectId: filters.projectId !== undefined && filters.projectId !== 'all' ? filters.projectId : '',
            filter: filters.filter || '',
            searchTerm: filters.searchTerm || '',
          });
          if (data?.rd && Array.isArray(data.rd)) {
            // Workspace now owns the data stream — block UseCallLog full-replace
            workspaceOwnsDataRef.current = true;
            callStreamService.initData(data.rd);
          }
        } catch (error) {
          console.error('CallLogApi.getCallLogs error:', error);
        } finally {
          setIsLoading(false);
        }
      }, 400),
    []
  );

  // 6b. Server API Refetch when TopBar filters change (exact old CallLog behavior)
  // viewMode is NOT sent to API — it is a local-only RxJS filter.
  // statusFilter IS sent to API as statusId (like old CallLog `status` state)
  // topBarCompany IS sent to API as projectId (like old CallLog `companyStatus` state)
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

    // If filter criteria changed from last run, hit the server
    if (lastFilterKeyRef.current !== filterKey) {
      const wasInitialized = lastFilterKeyRef.current !== '';
      lastFilterKeyRef.current = filterKey;

      if (wasInitialized) {
        setIsLoading(true);
        debouncedFilterCallLog({
          startDate: startStr,
          endDate: endStr,
          projectId: resolvedProjectId,
          statusId: resolvedStatusId,
          filter: targetFilter,
          searchTerm: searchStr,
        });
      }
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
    toast.info(`New Incoming Call #${data.sr}`, {
      description: `From ${caller} • ${data.description || data.appname || 'Voice call logged'}`,
      duration: 5000,
    });
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
      toast.warning(`Call #${data.sr} Forwarded to You`, {
        description: `From ${data.callBy || data.company || 'Client'} (${data.company || ''})`,
        duration: 6000,
      });
    }
  });

  // Helper to build chronological message sequence for any individual call record
  const buildMessagesForCall = useCallback((rec, callId) => {
    if (!rec) return [];

    const dateFormatted = formatDateGroup(rec.date || rec.callStart);
    const baseStartTime = getEpochMs(rec.callStart || rec.date, Date.now());
    const mainCallTime = formatTimeOnly(rec.time, rec.callStart);

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
          status: rec.status || 'Solved',
          Estatus: rec.Estatus || rec.estatus || 'Completed',
          priority: rec.priority || 'Normal',
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
          const isForwarded = Boolean(
            fu.ForwardedEmp ||
            String(fu.InternalStatus || '').toLowerCase() === 'forwarded' ||
            fu.InternalStatusId === 5 ||
            fu.statusId === 5
          );

          const rawCallStart = fu.CallStart || fu.callStart || '';
          const hasRealStart = isValidDate(rawCallStart);

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
            ? formatTimeOnly(null, effectiveDateStr)
            : formatTimeOnly(null, rec.callClosed || rec.callStart);

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
    if (rec.comment) {
      let commentsList = [];
      if (typeof rec.comment === 'string') {
        try {
          commentsList = JSON.parse(rec.comment);
        } catch (_) {
          commentsList = [];
        }
      } else if (Array.isArray(rec.comment)) {
        commentsList = rec.comment;
      }

      if (Array.isArray(commentsList)) {
        try {
          commentsList.forEach((cItem, cIdx) => {
            const commentText = cItem.text || cItem.comment || '';
            const cTimeFormatted = cItem.time
              ? formatTimeOnly(null, cItem.time)
              : mainCallTime;

            const cDateFormatted = formatDateGroup(cItem.time || rec.date || rec.callStart);
            const cSortTime = getEpochMs(
              cItem.time,
              baseStartTime + (cIdx + 2) * 60000
            );

            const hasAttachment = Boolean(cItem.img);
            const isAgent = Boolean(cItem.Name && cItem.Name !== rec.callBy);
            const rawImg = cItem.img || '';
            const filenameFromUrl = rawImg ? rawImg.split('/').pop() : '';

            const attachmentData = hasAttachment
              ? {
                  id: cItem.id || cIdx + 1,
                  filename: filenameFromUrl ? `${filenameFromUrl}` : `Attachment_${cItem.id || '58'}`,
                  subTitle: 'Image file',
                  fileType: 'Image file',
                  type: 'image',
                  imgUrl: cItem.img,
                  text: commentText,
                }
              : null;

            const isCurrentUser = Boolean(
              user?.firstname &&
              (cItem.Name || '').toLowerCase().trim() ===
                `${user.firstname} ${user.lastname || ''}`.toLowerCase().trim()
            );

            items.push({
              id: `comment-${rec.sr}-${cItem.id || cIdx}-${cIdx}`,
              dateGroup: cDateFormatted,
              sender: cItem.Name || (isAgent ? rec.receivedBy || 'Support Executive' : rec.callBy || 'Client'),
              company: rec.company,
              avatar: isCurrentUser ? user?.avatar || '' : '',
              time: cTimeFormatted,
              content: commentText.trim(),
              isComment: !isCurrentUser,
              isOutgoing: isCurrentUser,
              hasAttachment: hasAttachment,
              attachment: attachmentData,
              isClientReply: false,
              sortTime: cSortTime,
            });
          });
        } catch (_) {}
      }
    }

    // Append Ticket Entry Card if call is upgraded to Ticket
    const hasTicket = Boolean(
      (rec.ticket && String(rec.ticket).trim() !== '' && String(rec.ticket).trim() !== 'Upgrade to Ticket') ||
      (rec.Ticket_CreatedDate && String(rec.Ticket_CreatedDate).trim() !== '') ||
      rec.Ticket_Id ||
      rec.ticketId
    );
    if (hasTicket) {
      const ticketTime = rec.Ticket_CreatedDate && isValidDate(rec.Ticket_CreatedDate)
        ? formatTimeOnly(null, rec.Ticket_CreatedDate)
        : mainCallTime;
      const ticketDate = rec.Ticket_CreatedDate && isValidDate(rec.Ticket_CreatedDate)
        ? formatDateGroup(rec.Ticket_CreatedDate)
        : dateFormatted;

      const resolvedTicketNo =
        rec.ticket && rec.ticket !== 'In Ticket' && rec.ticket !== 'Upgrade to Ticket'
          ? rec.ticket
          : rec.Ticket_Id || rec.ticketId || rec.id || rec.sr;

      items.push({
        id: `ticket-card-${rec.sr || 'main'}-${callId}`,
        dateGroup: ticketDate,
        sender: rec.receivedBy || rec.AssignedEmpName || 'Support Team',
        time: ticketTime,
        isTicketCard: true,
        sortTime: baseStartTime + 400,
        ticketData: {
          ticketId: resolvedTicketNo,
          ticketCreatedDate: rec.Ticket_CreatedDate || '',
          ticketTitle: rec.description || rec.Descr || 'Helpdesk Ticket',
          appname: rec.appname || rec.company || '',
          createdBy: rec.receivedBy || rec.AssignedEmpName || 'Support Agent',
          company: rec.company || '',
          sr: rec.sr,
          rawRecord: rec,
        },
      });
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
        sender: rec.receivedBy || rec.AssignedEmpName || 'Support Team',
        time: mainCallTime,
        isiTaskCard: true,
        sortTime: baseStartTime + 500,
        itaskData: {
          taskId: rec.TaskId || rec.taskId,
          taskName: rec.description || rec.Descr || 'Call Task in iTask',
          customerName: rec.company || '',
          assignedTo: rec.receivedBy || rec.AssignedEmpName || 'Support Agent',
          sr: rec.sr,
          rawRecord: rec,
        },
      });
    }

    return items;
  }, [user]);

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

    if (conversationViewMode === 'timeline' && currentCompany !== 'all') {
      const companyCalls = threads.filter(
        (t) => (t.company || '').toLowerCase() === currentCompany.toLowerCase()
      );

      const aggregated = [];
      companyCalls.forEach((callItem) => {
        const rawRec = callItem.rawRecord || callItem;
        const callItems = buildMessagesForCall(rawRec, callItem.id);
        const injectedCustom = getCustomForCall(callItem).filter((msg) => {
          const cText = (msg.content || '').trim().toLowerCase();
          return !callItems.some((ci) => (ci.content || '').trim().toLowerCase() === cText);
        });
        aggregated.push(...callItems, ...injectedCustom);
      });

      aggregated.sort((a, b) => (a.sortTime || 0) - (b.sortTime || 0));
      setMessages(aggregated);
    } else {
      const rawRec = activeThread.rawRecord || activeThread;
      const callItems = buildMessagesForCall(rawRec, activeThread.id);
      const injectedCustom = getCustomForCall(activeThread).filter((msg) => {
        const cText = (msg.content || '').trim().toLowerCase();
        return !callItems.some((ci) => (ci.content || '').trim().toLowerCase() === cText);
      });
      const combined = [...callItems, ...injectedCustom];
      combined.sort((a, b) => (a.sortTime || 0) - (b.sortTime || 0));
      setMessages(combined);
    }
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
    callStreamService.selectCompany(compName);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    callStreamService.setSearchQuery(query);
  }, []);

  // Start Live VoIP Support Call & push call record via RxJS Stream
  const handleStartCall = useCallback(async () => {
    if (!activeThread) {
      toast.error('Select a conversation to start a call');
      return;
    }

    if (activeThread?.sr && callLogCtx?.startCall) {
      try {
        const result = await callLogCtx.startCall(activeThread.sr);
        if (result && !result.success) {
          const errMsg =
            result.error?.message ||
            result.msg?.stat_msg ||
            'You cannot start this call.';
          toast.error(errMsg);
          return;
        }
      } catch (err) {
        console.error('startCall API error:', err);
        toast.error(err?.message || 'Failed to start call');
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

    const callData = callStreamService.startCall(activeThread);
    if (callData) {
      toast.success('Live VoIP Call Started', {
        description: `Connected with ${callData.callerName} (${callData.company})`,
      });
    }
  }, [activeThread, callLogCtx, user]);

  const handleSendMessage = useCallback(
    async (text, fileOrAttachment = null) => {
      if (!activeThreadId) return;

      const activeThreadItem = activeThread || threadMap.get(activeThreadId);
      const callLogSr =
        activeThreadItem?.sr ||
        activeThreadItem?.rawRecord?.sr ||
        (typeof activeThreadId === 'number' ? activeThreadId : null);

      const senderName = user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.name || '-';

      const now = new Date();
      const nowFormatted = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      let uploadedUrl = null;
      let attachmentData = null;

      // 1. If a file is attached, upload via filesUploadApi
      if (
        fileOrAttachment instanceof File ||
        (fileOrAttachment && typeof fileOrAttachment === 'object' && fileOrAttachment.name && fileOrAttachment.size !== undefined)
      ) {
        const file = fileOrAttachment;
        try {
          const uploadRes = await filesUploadApi({
            ukey: user?.ukey,
            folderName: 'CallLog',
            uniqueNo: callLogSr,
            attachments: [file],
          });
          uploadedUrl =
            uploadRes?.files?.[0]?.url ||
            uploadRes?.files?.[0]?.fileUrl ||
            uploadRes?.url ||
            uploadRes?.data?.[0]?.url ||
            null;

          attachmentData = {
            id: Date.now(),
            filename: file.name,
            size: file.size,
            fileType: file.type || 'file',
            type: file.type?.startsWith('image/') ? 'image' : 'file',
            imgUrl: uploadedUrl,
            text: text || '',
          };
        } catch (uploadErr) {
          console.error('File upload failed:', uploadErr);
          toast.error('Failed to upload attachment');
          return;
        }
      } else if (fileOrAttachment) {
        attachmentData = fileOrAttachment;
        uploadedUrl = fileOrAttachment.imgUrl || fileOrAttachment.url || null;
      }

      const messageContent = text?.trim() || (uploadedUrl ? 'Shared an attachment' : '');
      if (!messageContent && !uploadedUrl) return;

      const newMsg = {
        id: `msg-${Date.now()}`,
        dateGroup: nowFormatted,
        sender: senderName,
        avatar: user?.avatar || '',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: messageContent,
        isOutgoing: true,
        sortTime: now.getTime(),
        attachment: attachmentData,
      };

      // 2. Optimistically append message to stream (indexed by both activeThreadId and callLogSr)
      callStreamService.addCustomMessage(activeThreadId, newMsg, callLogSr);

      // Optimistically update thread's rawRecord.comment immediately
      if (callLogSr) {
        callStreamService.patchComment(callLogSr, {
          text: messageContent,
          img: uploadedUrl || '',
          time: new Date().toISOString(),
          Name: senderName,
        });
      }

      // 3. Persist to Backend API via CallLogApi.addCallComments or addComment
      if (callLogSr) {
        try {
          if (callLogCtx?.addComment) {
            await callLogCtx.addComment(callLogSr, messageContent, uploadedUrl || '', user?.id, 0); // IsClient=0 => Support Agent
          } else {
            await CallLogApi.addCallComments(callLogSr, messageContent, uploadedUrl || '', user?.id, 0);
          }
          toast.success('Comment posted');
          if (callLogCtx?.triggerRefresh) callLogCtx.triggerRefresh();
        } catch (error) {
          console.error('Error posting comment:', error);
          toast.error('Could not save comment to server');
        }
      }
    },
    [activeThreadId, activeThread, threadMap, user, callLogCtx]
  );

  const handleExportCSV = useCallback(() => {
    const currentFiltered = threads;

    if (currentFiltered.length === 0) {
      toast.error('No call logs to export for selected filters');
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

    toast.success(`Exported ${currentFiltered.length} calls as CSV`);
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
      />

      {/* Global Floating VoIP Call Widget */}
      <FloatingCallWidget />

      {/* Main Workspace: Company Avatars Rail + Direct Messages Sidebar + Chat Canvas + Inspector */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        {/* Inner Sidebar 1: Company Avatars Rail */}
        <CompanyAvatarRail
          companies={companies}
          selectedCompany={selectedCompany}
          onSelectCompany={handleSelectCompany}
          totalCallsCount={threads.length}
          isLoading={isLoading}
        />

        {/* Inner Sidebar 2: Individual Calls List */}
        <DirectMessagesSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          searchQuery={searchQuery}
          selectedCompany={selectedCompany}
          onSelectCompany={handleSelectCompany}
          isLoading={isLoading}
        />

        {/* Right Center: Main Chat Conversation Canvas */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
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
          />

          {/* Messages Feed */}
          <MessageList messages={messages} isLoading={isLoading} />

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
        onRecordToggle={() => {}}
      />
      <NewCallFollowUpModal />
      <NewCallEditModal />
      <NewCallForwardModal />
      <NewCallDurationModal />

      {/* Toast Notification Container */}
      <Toaster position="bottom-right" closeButton />
    </Box>
  );
}
