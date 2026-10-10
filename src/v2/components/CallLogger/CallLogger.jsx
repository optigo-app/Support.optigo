import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { Box } from "@mui/material";
// import CallRecorderScreen from "./CallRecorderScreen";
import GridHeader from "./GridHeader";
import CallTable from "./CallTable";
import CallLogDrawer from "./SideBar";
import CallLogDetailsSidebar from "./DetailSideBar";
import { useMultiToggle } from "../../hooks/useMultiToggle";
import { useCallLog } from "../../context/UseCallLog";
import EditCallLogDrawer from "./EditCallLog";
import ConfirmBox from "./ConfirmBox";
import PostCallReviewForm from "./PostCallReview";
import { createCallLogMap } from "../../utils/callLogUtils";
// import { appBarHeight } from "../../libs/data";
import { useLocation, useNavigate } from "react-router-dom";
import FeedbackModal from "./FeedBackModal";
import AcceptCallModal from "./AcceptCallModal";
import CallLogApi from "../../apis/CallLogApiController";
import debounce from "lodash/debounce";
import { useAuth } from "../../context/UseAuth";
import withNotification from "./../../hoc/withNotification";
import { ExcelReportCallog } from "../../utils/ExcelReportDowload";
import { PopoverFeedbackCard } from "./PopoverFeedbackCard ";
import IncomingCallDialog from "./Runinng/IncomingCallDialog";
import CallDurationList from "./DurationMeter";
import FollowUpPanel from "./FollowUpPanel";
import AddFollowUpModal from "./AddFollowUpModal";
import ActiveCallOverlay from "./New/CallPop";
import FloatingQueueMarquee from "./CallQueue/FloatingQueueMarquee";
// import FloatingQueueButton from "./FloatingQueueButton";
import {
  isAnalysis$,
  followUpMode$,
  toggleAnalysis,
  toggleFollowUpMode,
  useSubject,
} from "../../rxjs/layoutStore";
import { acceptCallModal$, feedbackPopover$ } from "../../rxjs/tableUiStore";
import { MainLayoutheight } from "../_ui/HeaderWrapper";
import { recordingTime$ } from "../../rxjs/callTimerStore";
import { useCallSession } from "../../hooks/useCallSession";
import {
  CALL_STORAGE_KEYS as STORAGE_KEYS,
  callStorage,
} from "../../utils/callSessionStorage";

// ⚡ PERF: Only this wrapper subscribes to the 1s timer ticks, so the rest of
// the CallLogger tree (DataGrid, header, panels) does NOT re-render every second.
const LiveActiveCallOverlay = (props) => {
  const recordingTime = useSubject(recordingTime$);
  return <ActiveCallOverlay {...props} recordingTime={recordingTime} />;
};

const AcceptCallModalWrapper = ({ showNotification }) => {
  const [state, setState] = useState(null); // stores { callId }
  const [isAccepting, setIsAccepting] = useState(false);
  const { AcceptQueueCall } = useCallLog();

  useEffect(() => {
    const sub = acceptCallModal$.subscribe((val) => {
      setState(val);
      setIsAccepting(false);
    });
    return () => sub.unsubscribe();
  }, []);

  if (!state) return null;

  return (
    <AcceptCallModal
      isDialogOpen={Boolean(state)}
      loading={isAccepting}
      handleConfirmStartCall={async () => {
        setIsAccepting(true);
        try {
          const res = await AcceptQueueCall(state.callId);
          if (res && !res.success) {
            showNotification?.(
              res.error?.message || "Failed to accept call",
              "error",
            );
          } else if (res && res.success) {
            showNotification?.("Call accepted successfully.", "success");
          }
        } catch (err) {
          showNotification?.(err.message || "Failed to accept call", "error");
        } finally {
          setIsAccepting(false);
          acceptCallModal$.next(null);
        }
      }}
      handleCancel={() => {
        acceptCallModal$.next(null);
      }}
    />
  );
};

const CallTableLayout = ({
  sliders,
  toggleSlider,
  filteredCallLog,
  callStatusValue,
  viewMode,
  showNotification,
  setFeedBackModal,
  onCallAnalysis,
  onRowClick,
  handleEditAndStartCall,
  CurrentCall,
  activeFollowUp,
  setActiveFollowUp,
  handleAddFollowUp,
  handleStartFollowUp,
  isPaused,
  recordingTime,
  filterState,
  toggleFollowUpPanel,
  isLoading,
}) => {
  const isAnalysis = useSubject(isAnalysis$);
  const followUpMode = useSubject(followUpMode$);

  const memoizedTable = useMemo(
    () => (
      <CallTable
        ToggleAnalysis={() => toggleAnalysis()}
        ToggleFollowUp={toggleFollowUpPanel}
        showNotification={showNotification}
        key="call-table-grid"
        setFeedBackModal={setFeedBackModal}
        onCallAnalysis={onCallAnalysis}
        onRowClick={onRowClick}
        callLogs={filteredCallLog}
        callStatusValue={callStatusValue}
        onEditCall={handleEditAndStartCall}
        viewMode={viewMode}
        loading={isLoading}
      />
    ),
    [
      toggleFollowUpPanel,
      showNotification,
      setFeedBackModal,
      onCallAnalysis,
      onRowClick,
      filteredCallLog,
      callStatusValue,
      handleEditAndStartCall,
      viewMode,
      isLoading,
    ],
  );

  return (
    <Box
      sx={{
        flex: sliders?.recordMode ? "auto" : 1,
        transition: "height 0.3s ease-in-out",
        overflowX: "auto",
        width: "100%",
        display: "flex",
        gap: isAnalysis || followUpMode ? 0.5 : 0,
        pt: 0.3,
      }}
    >
      {memoizedTable}
      <FollowUpPanel
        CurrentCall={CurrentCall}
        activeFollowUp={activeFollowUp}
        setActiveFollowUp={setActiveFollowUp}
        onAddFollowUp={handleAddFollowUp}
        onStartFollowUp={handleStartFollowUp}
        isPaused={isPaused}
        recordingTime={recordingTime}
        RecordMode={sliders?.recordMode}
        showNotification={showNotification}
      />
      <CallDurationList
        data={filteredCallLog}
        dateRange={filterState?.dateRange}
        RecordMode={sliders?.recordMode}
      />
    </Box>
  );
};

const CallLogManagementApp = ({ showNotification = () => { } }) => {

  // --- STATE MANAGEMENT --- //
  const feedbackPopover = useSubject(feedbackPopover$);

  const {
    endCall,
    setUpdatesBlocked,
    AcceptQueueCall,
    CurrentCall,
    setCurrentCall,
    startCall,
    setCallLog,
    callLog,
    PauseCall,
    ResumeCall,
    isFilterActiveRef,
    // Follow-up call
    activeFollowUp,
    setActiveFollowUp,
    addFollowUpCall,
    startFollowUpCall,
    pauseFollowUpCall,
    resumeFollowUpCall,
    endFollowUpCall,
    editFollowUpCall,
  } = useCallLog();

  const sidebarKey = useRef(Date.now()).current;
  const editDrawerKey = useRef(Date.now()).current;
  const [isLoading, setIsLoading] = useState(true);
  const [sliders, toggleSlider] = useMultiToggle(() =>
    callStorage.getJSON(STORAGE_KEYS.SLIDERS_STATE, {
      addMode: false,
      editMode: false,
      dialogMode: false,
      recordMode: false,
      detailMode: false,
      followUpMode: false,
    }),
  );

  const { user } = useAuth();

  // --- CALL SESSION (timer, pause/resume, start/end, persistence) --- //
  // All session logic lives in hooks/useCallSession.js
  const {
    recordingTime,
    recordingTimeRef,
    isPaused,
    callStatusValue,
    conCurrentCall,
    concurrentCallRef,
    timerRef,
    callStartTimeRef,
    setConCurrentCall,
    handlePauseRecording,
    handleResumeRecording,
    handleStartRecording,
    handleEndCall,
  } = useCallSession({
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
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingCallId, setPendingCallId] = useState(null);


  const [postReview, setPostReview] = useState(false);
  const [feedBackModal, setFeedBackModal] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // filters states
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || params.get("searchQuery") || "";
  });
  const [viewMode, setViewMode] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("view") || "team";
  });
  const [companyStatus, setCompanyStatus] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("companyStatus") || "";
  });
  const [filterState, setFilterState] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      dateRange: {
        startDate: params.get("start") || "",
        endDate: params.get("end") || "",
      },
      filterTargetField: params.get("target") || "",
    };
  });
  const [status, setStatus] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("status") || "";
  });
  const [filteredCallLog, setFilteredCallLog] = useState([]);

  // Flag to distinguish our own URL writes from external navigation
  const isInternalUrlUpdate = useRef(false);

  useEffect(() => {
    const isEditing = sliders.addMode || sliders.editMode;
    setUpdatesBlocked(isEditing);

    return () => setUpdatesBlocked(false);
  }, [sliders.addMode, sliders.editMode, setUpdatesBlocked]);

  // --- PERSISTENCE EFFECTS --- //
  // Save sliders state to localStorage when it changes
  useEffect(() => {
    callStorage.set(STORAGE_KEYS.SLIDERS_STATE, sliders);
  }, [sliders]);

  const clearFilters = () => {
    setSearchQuery("");
    setViewMode("team");
    setCompanyStatus("");
    setStatus("");
    navigate({ pathname: location.pathname }, { replace: true });
    debouncedFilterCallLog({
      endDate: "",
      startDate: "",
      statusId: "",
      projectId: "",
      filter: "",
      searchTerm: "",
    });
    setFilterState({
      dateRange: { startDate: "", endDate: "" },
      filterTargetField: "",
    });
  };

  const clearFiltersState = () => {
    setSearchQuery("");
    setViewMode("team");
    setCompanyStatus("");
    setStatus("");
    setFilterState({
      dateRange: { startDate: "", endDate: "" },
      filterTargetField: "",
    });
    navigate({ pathname: location.pathname }, { replace: true });
  };

  const getQueryParams = (search) => {
    const params = new URLSearchParams(search);
    return {
      queue: params.get("queue"),
    };
  };

  const debouncedFilterCallLog = useCallback(
    debounce(async (filters) => {
      try {
        const data = await CallLogApi.getCallLogs({
          endDate: filters.endDate || "",
          startDate: filters.startDate || "",
          statusId: filters.statusId || "",
          projectId: filters.projectId || "",
          filter: filters.filter || "",
          searchTerm: filters.searchTerm || "",
        });
        setCallLog(data?.rd);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false); // ✅ Stop loading
      }
    }, 500),
    [],
  );

  // URL parameter management
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (viewMode) params.set("view", viewMode);
    if (companyStatus) params.set("companyStatus", companyStatus);
    if (status && status !== "all") params.set("status", status);
    if (filterState?.filterTargetField)
      params.set("target", filterState.filterTargetField);
    if (filterState?.dateRange?.startDate)
      params.set("start", filterState.dateRange.startDate);
    if (filterState?.dateRange?.endDate)
      params.set("end", filterState.dateRange.endDate);

    // Only navigate if the URL actually needs to change (prevents loops)
    const newSearch = params.toString();
    const currentSearch = location.search.replace(/^\?/, "");
    if (newSearch !== currentSearch) {
      isInternalUrlUpdate.current = true;
      // Use replace to avoid adding to history
      navigate(
        { pathname: location.pathname, search: newSearch },
        { replace: true },
      );
    }
  }, [
    searchQuery,
    viewMode,
    companyStatus,
    filterState,
    status,
    navigate,
    location.pathname,
    location.search,
  ]);

  // Load URL parameters when query params change externally (e.g. Global Search)
  useEffect(() => {
    // Skip URL changes we made ourselves — state is already the source of truth
    if (isInternalUrlUpdate.current) {
      isInternalUrlUpdate.current = false;
      return;
    }
    const params = new URLSearchParams(location.search);
    const savedSearch = params.get("search") || params.get("searchQuery") || "";
    const savedView = params.get("view") || "team";
    const savedCompanyStatus = params.get("companyStatus") || "";
    const savedStatus = params.get("status") || "";
    const savedTarget = params.get("target") || "";
    const start = params.get("start");
    const end = params.get("end");

    if (savedSearch !== searchQuery) {
      setSearchQuery(savedSearch);
    }
    if (savedView !== viewMode) {
      setViewMode(savedView);
    }
    if (savedCompanyStatus !== companyStatus) {
      setCompanyStatus(savedCompanyStatus);
    }
    if (savedStatus !== status) {
      setStatus(savedStatus);
    }
    if (start || end || savedTarget) {
      setFilterState((prev) => ({
        ...prev,
        filterTargetField: savedTarget,
        dateRange: {
          startDate: start || "",
          endDate: end || "",
        },
      }));
    }
  }, [location.search]);

  const isFilterActive = useMemo(() => {
    return (
      searchQuery ||
      companyStatus ||
      (status && status !== "all") ||
      filterState?.filterTargetField ||
      filterState?.dateRange?.startDate ||
      filterState?.dateRange?.endDate
    );
  }, [searchQuery, companyStatus, status, filterState]);

  useEffect(() => {
    isFilterActiveRef.current = !!isFilterActive;
  }, [isFilterActive]);

  // Filter data on criteria change
  useEffect(() => {
    setIsLoading(true); // ⚡ Show skeleton IMMEDIATELY on filter change!
    const startDate = filterState?.dateRange?.startDate || "";
    const endDate = filterState?.dateRange?.endDate || "";
    const targetFilter =
      filterState?.filterTargetField || (startDate && endDate ? "date" : "");

    const filters = {
      endDate,
      startDate,
      statusId: status || "",
      projectId: companyStatus || "",
      filter: targetFilter,
      searchTerm: searchQuery || "",
    };

    debouncedFilterCallLog(filters);
    return () => {
      debouncedFilterCallLog.cancel();
    };
  }, [searchQuery, companyStatus, status, filterState, debouncedFilterCallLog]);

  const removeQueueParam = () => {
    const { queue, ...params } = getQueryParams(location.search);
    const newParams = new URLSearchParams(params);
    navigate({ search: newParams.toString() });
  };

  // Filters props
  const filterProps = {
    searchQuery,
    setsearchQuery: setSearchQuery,
    Status: status,
    SetStatus: setStatus,
    viewMode,
    setViewMode,
    filterState,
    setFilterState,
    CompanyStatus: companyStatus,
    SetCompanyStatus: setCompanyStatus,
  };

  const memoizedFilteredCalls = useMemo(() => {
    if (!callLog) return [];
    let filtered = [...callLog];

    const isValidDateString = (d) =>
      d && typeof d === "string" && !d.startsWith("1900-01-01");

    if (viewMode === "normal" && user) {
      const loggedUser = `${user.firstname} ${user.lastname}`.toLowerCase();
      filtered = filtered.filter(
        (call) =>
          (call.receivedBy && call.receivedBy.toLowerCase() === loggedUser) ||
          (call.AssignedEmpName &&
            call.AssignedEmpName.toLowerCase() === loggedUser),
      );
    } else if (viewMode === "followUp-Pending") {
      filtered = filtered.filter((call) => {
        if (!call.FollowUpList) return false;
        try {
          const followUps = JSON.parse(call.FollowUpList);
          if (!Array.isArray(followUps)) return false;
          return followUps.some(
            (fu) =>
              !isValidDateString(fu.CallClosed) &&
              (!fu.CallDuration || fu.CallDuration === "00:00:00"),
          );
        } catch (e) {
          return false;
        }
      });
    } else if (viewMode === "followUp-Completed") {
      filtered = filtered.filter((call) => {
        if (!call.FollowUpList) return false;
        try {
          const followUps = JSON.parse(call.FollowUpList);
          if (!Array.isArray(followUps)) return false;
          return followUps.some(
            (fu) =>
              isValidDateString(fu.CallClosed) ||
              (fu.CallDuration && fu.CallDuration !== "00:00:00"),
          );
        } catch (e) {
          return false;
        }
      });
    }
    return filtered;
  }, [viewMode, callLog, user]);

  useEffect(() => {
    setFilteredCallLog(memoizedFilteredCalls);
  }, [memoizedFilteredCalls]);

  const callLogMap = useMemo(() => createCallLogMap(callLog), [callLog]);

  // Sync CurrentCall proactively with updated API data.
  // This solves issues where Follow-Up completion timestamps
  // from backend aren't shown in the UI until they click away and back.
  useEffect(() => {
    if (CurrentCall?.sr && callLogMap[CurrentCall.sr]) {
      const freshCallData = callLogMap[CurrentCall.sr];

      // We do a simple comparison to see if we really need to update state
      // This prevents infinite loops and unnecessary re-renders
      const isDifferent =
        CurrentCall.FollowUpList !== freshCallData.FollowUpList ||
        CurrentCall.callClosed !== freshCallData.callClosed;

      if (isDifferent) {
        // SAFETY: Don't overwrite a CurrentCall that already has callStart
        // with stale callLogMap data that doesn't have it yet.
        // This prevents the "Start" button from reappearing after a call is started.
        if (CurrentCall?.callStart && !freshCallData?.callStart) {
          return; // Skip — stale data would regress the UI
        }
        setCurrentCall(freshCallData);
      }
    }
  }, [callLogMap, CurrentCall]);

  const handleToggleRecording = useCallback(() => {
    if (!sliders.recordMode) {
      toggleSlider("recordMode");
    }
  }, [sliders.recordMode, toggleSlider]);

  const handleRecordModeClose = useCallback(() => {
    // ✅ HARDENED: Only close if no active call, otherwise just close UI
    toggleSlider("recordMode");
    if (!CurrentCall?.sr || !callStartTimeRef.current) {
      // No active call — safe to fully clean up
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Don't clear CurrentCall if there's an active follow-up
      if (!activeFollowUp) {
        setCurrentCall(null);
      }
    }
  }, [toggleSlider, CurrentCall?.sr, setCurrentCall, activeFollowUp]);

  // ✅ Automatically open record mode when a call is active
  useEffect(() => {
    if (CurrentCall?.sr && !sliders.recordMode) {
      toggleSlider("recordMode");
    }
  }, [CurrentCall?.sr]); // Don't include sliders.recordMode in deps to avoid loops

  // Clear activeFollowUp when switching to a different call
  useEffect(() => {
    if (
      activeFollowUp &&
      CurrentCall?.sr &&
      activeFollowUp.callLogId !== CurrentCall.sr
    ) {
      // Only clear if no timer is running (don't interrupt an active follow-up call)
      if (recordingTimeRef.current <= 0) {
        setActiveFollowUp(null);
      }
    }
  }, [CurrentCall?.sr]);

  const onRowClick = useCallback(
    (rowData) => {
      if (!rowData?.sr) return;

      const selectedData = callLogMap[rowData.sr];
      if (!selectedData) return;

      if (selectedData.hasNewComment) {
        setCallLog((prev) =>
          prev.map((c) =>
            c.sr === selectedData.sr ? { ...c, hasNewComment: false } : c,
          ),
        );
      }

      setCurrentCall(selectedData);
      if (!sliders.recordMode) {
        toggleSlider("recordMode");
      }
    },
    [callLogMap, toggleSlider, sliders.recordMode, setCallLog, setCurrentCall],
  );

  const handleEditAndStartCall = useCallback((id) => {
    setPendingCallId(id);
    setIsDialogOpen(true);
  }, []);

  const handleConfirmStartCall = useCallback(async () => {
    // ⚡ Optimistic update: start timer & mark call active immediately (0ms delay)
    if (!sliders.recordMode) {
      handleToggleRecording();
    }
    handleStartRecording();
    setCurrentCall((prev) => (prev ? { ...prev, callStart: true } : prev));
    setIsDialogOpen(false);

    try {
      const result = await startCall(pendingCallId);

      if (!result.success) {
        console.error(
          "Failed to confirm and start call:",
          result.error?.message,
        );
        showNotification(`${result.error?.message}`, "error");
        handleEndCall({ skipApi: true });
        return;
      }

      showNotification("Call started", "success");
    } catch (e) {
      console.error("Error starting call:", e);
      showNotification("Error starting call", "error");
      handleEndCall({ skipApi: true });
    }
  }, [
    pendingCallId,
    sliders.recordMode,
    handleToggleRecording,
    handleStartRecording,
    handleEndCall,
    setIsDialogOpen,
    startCall,
    showNotification,
    setCurrentCall,
  ]);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const onStartCall = useCallback(
    async (callId) => {
      // ⚡ Optimistic update: start timer & mark call active immediately (0ms delay)
      handleStartRecording();
      if (!sliders.recordMode) {
        handleToggleRecording();
      }
      setCurrentCall((prev) => (prev ? { ...prev, callStart: true } : prev));

      try {
        const result = await startCall(callId);

        if (!result.success) {
          console.error("Failed to start call:", result.error?.message);
          showNotification(`${result.error?.message}`, "error");
          handleEndCall({ skipApi: true });
          return;
        }

        showNotification("Call started", "success");
      } catch (e) {
        console.error("Error in onStartCall:", e);
        showNotification("Error starting call", "error");
        handleEndCall({ skipApi: true });
      }
    },
    [
      startCall,
      handleStartRecording,
      handleEndCall,
      showNotification,
      sliders.recordMode,
      handleToggleRecording,
      setCurrentCall,
    ],
  );

  // === FOLLOW-UP CALL HANDLERS ===
  const toggleFollowUpPanel = useCallback(
    (row) => {
      // If a row is passed (from grid chip click), set it as CurrentCall so panel shows its follow-ups
      if (row && row.sr) {
        const selectedData = callLogMap[row.sr];
        if (selectedData) {
          // Only switch calls if we're not currently running a follow-up timer
          if (recordingTimeRef.current <= 0) {
            setCurrentCall(selectedData);
          }

          // Always OPEN record mode when clicking a specific row's chip
          if (!sliders.recordMode) {
            toggleSlider("recordMode");
          }
        }
      }

      // Always OPEN follow-up panel, never toggle to close it from here
      toggleFollowUpMode(true);
    },
    [
      toggleSlider,
      setCurrentCall,
      sliders.recordMode,
      callLogMap,
    ],
  );

  const handleAddFollowUp = useCallback(
    async (descr) => {
      if (!CurrentCall?.sr || !CurrentCall?.callClosed) return;
      try {
        const result = await addFollowUpCall(CurrentCall.sr);
        if (!result.success) {
          showNotification(
            result.error?.message || "Failed to add follow-up",
            "error",
          );
          return;
        }

        // Update description
        if (descr && result.followUp?.followUpCallId) {
          await editFollowUpCall({
            callLogId: CurrentCall.sr,
            followUpCallId: result.followUp.followUpCallId,
            descr,
          });
        }

        showNotification("Follow-up call added", "success");
        // Open the follow-up panel automatically
        toggleFollowUpMode(true);
      } catch (e) {
        console.error("Error adding follow-up:", e);
        showNotification("Error adding follow-up call", "error");
      }
    },
    [
      CurrentCall?.sr,
      CurrentCall?.callClosed,
      addFollowUpCall,
      editFollowUpCall,
      showNotification,
    ],
  );

  const handleStartFollowUp = useCallback(
    async (explicitFuId, explicitLogId) => {
      const targetFuId = explicitFuId || activeFollowUp?.followUpCallId;
      const callLogId =
        explicitLogId || activeFollowUp?.callLogId || CurrentCall?.sr;

      if (!targetFuId) {
        showNotification("No follow-up call selected", "error");
        return;
      }
      if (!callLogId) {
        showNotification("No call log ID found", "error");
        return;
      }
      try {
        const result = await startFollowUpCall(targetFuId, callLogId);
        if (!result.success) {
          showNotification(
            result.error?.message || "Failed to start follow-up",
            "error",
          );
          return;
        }

        // Auto toggle record mode if closed
        if (!sliders.recordMode) {
          handleToggleRecording();
        }

        // We explicitly make sure activeFollowUp is set so that HandleStartRecording correctly associates the timer with it
        setActiveFollowUp({ followUpCallId: targetFuId, callLogId: callLogId });

        handleStartRecording();
      } catch (err) {
        console.error("Failed to start follow-up call:", err);
        showNotification("Failed to start follow-up", "error");
      }
    },
    [
      activeFollowUp,
      CurrentCall?.sr,
      startFollowUpCall,
      showNotification,
      handleStartRecording,
      sliders.recordMode,
      handleToggleRecording,
      setActiveFollowUp,
    ],
  );

  // Handle queue parameter in URL
  useEffect(() => {
    let timeout;
    const { queue } = getQueryParams(location.search);
    if (queue === "1") {
      handleToggleRecording();
      timeout = setTimeout(() => {
        removeQueueParam();
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [location.search, navigate, handleToggleRecording, removeQueueParam]);

  const onEditToggle = useCallback(() => {
    toggleSlider("editMode");
    toggleSlider("detailMode");
  }, [toggleSlider]);

  const addConCurrentCall = useCallback(
    (data) => {
      setConCurrentCall(data);
      // Only toggle after the data is set
      setTimeout(() => {
        toggleSlider("addMode");
      }, 10);
    },
    [toggleSlider],
  );

  const onCallAnalysis = useCallback(
    (data) => {
      if (!data?.sr) return;

      const selectedData = filteredCallLog.find(
        (item) => item?.sr === data?.sr,
      );
      if (!selectedData) return;

      setCurrentCall({ ...selectedData, isAnalysis: true });
      toggleSlider("detailMode");
    },
    [filteredCallLog, toggleSlider],
  );

  const handleAcceptCall = useCallback((id) => {
    acceptCallModal$.next({ callId: id });
  }, []);

  const contentHeight = MainLayoutheight;

  const Dowloadexcel = async () => {
    try {
      await ExcelReportCallog(filteredCallLog);
    } catch (error) {
      console.error("Failed to download Excel:", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          height: contentHeight,
          display: "flex",
          flexDirection: "column",
          px: 1,
          bgcolor: "white",
          pt: 0,
          pb: 1,
        }}
      >
        {feedBackModal !== null && (
          <FeedbackModal
            id={feedBackModal}
            setFeedBackModal={setFeedBackModal}
          />
        )}
        {feedbackPopover?.anchorEl && (
          <PopoverFeedbackCard
            anchorEl={feedbackPopover.anchorEl}
            open={Boolean(feedbackPopover.anchorEl)}
            rating={feedbackPopover.data?.rating}
            name={feedbackPopover.data?.callBy}
            description={feedbackPopover.data?.feedback}
            onClose={() =>
              feedbackPopover$.next({ data: null, anchorEl: null })
            }
          />
        )}
        {/* <CallRecorderScreen
          isPaused={isPaused}
          onPause={handlePauseRecording}
          onResume={handleResumeRecording}
          onStartCall={onStartCall}
          CurrentCall={CurrentCall}
          onEndCall={handleEndCall}
          onCloseRecord={handleRecordModeClose}
          isRecordingExpanded={sliders?.recordMode}
          recordingTime={recordingTime}
          onAddConCurrentCall={addConCurrentCall}
          onEditCall={handleAcceptCall}
          onEditToggle={() => toggleSlider("editMode")}
          onDetailsToggle={() => toggleSlider("detailMode")}
          setPostReview={setPostReview}
          callStatusValue={callStatusValue}
          activeFollowUp={activeFollowUp}
          onStartFollowUp={handleStartFollowUp}
        /> */}

        <Box sx={{ transition: "0.3s ease-in-out" }}>
          <GridHeader
            filterCount={filteredCallLog?.length || 0}
            isFilterData={filteredCallLog?.length > 0}
            onExcel={Dowloadexcel}
            onClearAll={clearFilters}
            {...filterProps}
            callStatusValue={callStatusValue}
            onAdd={() => toggleSlider("addMode")}
          />
          <FloatingQueueMarquee onEditCall={handleAcceptCall} />
        </Box>

        <CallTableLayout
          sliders={sliders}
          toggleSlider={toggleSlider}
          filteredCallLog={filteredCallLog}
          callStatusValue={callStatusValue}
          viewMode={viewMode}
          showNotification={showNotification}
          setFeedBackModal={setFeedBackModal}
          onCallAnalysis={onCallAnalysis}
          onRowClick={onRowClick}
          handleEditAndStartCall={handleEditAndStartCall}
          CurrentCall={CurrentCall}
          activeFollowUp={activeFollowUp}
          setActiveFollowUp={setActiveFollowUp}
          handleAddFollowUp={handleAddFollowUp}
          handleStartFollowUp={handleStartFollowUp}
          isPaused={isPaused}
          recordingTime={recordingTime}
          filterState={filterState}
          toggleFollowUpPanel={toggleFollowUpPanel}
          isLoading={isLoading}
        />

        <EditCallLogDrawer
          key="static-edit-key" // Keep this stable!
          open={sliders?.editMode}
          onClose={() => toggleSlider("editMode")}
          callData={CurrentCall}
          showNotification={showNotification}
        />

        <CallLogDrawer
          key="static-add-edit-key" // Keep thi
          onclearFilters={clearFiltersState}
          callStatusValue={callStatusValue}
          data={conCurrentCall || concurrentCallRef.current}
          open={sliders?.addMode}
          StartRecording={handleStartRecording}
          onRecordToggle={handleToggleRecording}
          onClose={() => toggleSlider("addMode")}
        />

        <CallLogDetailsSidebar
          onEditToggle={onEditToggle}
          key={`details-${CurrentCall?.sr || "none"}`}
          callLogData={CurrentCall}
          open={sliders?.detailMode}
          onClose={() => toggleSlider("detailMode")}
        />

        <ConfirmBox
          handleCancel={handleCancel}
          handleConfirmStartCall={handleConfirmStartCall}
          isDialogOpen={isDialogOpen}
        />

        <PostCallReviewForm
          open={postReview}
          onClose={() => setPostReview(false)}
          data={CurrentCall}
        />

        <AcceptCallModalWrapper showNotification={showNotification} />
        <AddFollowUpModal showNotification={showNotification} />

      </Box>
      <IncomingCallDialog />
      <LiveActiveCallOverlay
        isPaused={isPaused}
        onPause={handlePauseRecording}
        onResume={handleResumeRecording}
        onStartCall={onStartCall}
        CurrentCall={CurrentCall}
        onEndCall={handleEndCall}
        onCloseRecord={handleRecordModeClose}
        isRecordingExpanded={sliders?.recordMode}
        onAddConCurrentCall={addConCurrentCall}
        onEditCall={handleAcceptCall}
        onEditToggle={() => toggleSlider("editMode")}
        onDetailsToggle={() => toggleSlider("detailMode")}
        setPostReview={setPostReview}
        callStatusValue={callStatusValue}
        activeFollowUp={activeFollowUp}
        onStartFollowUp={handleStartFollowUp}
      />
      {/* <FloatingQueueButton onEditCall={handleAcceptCall} /> */}
    </>
  );
};

export default withNotification(CallLogManagementApp);
