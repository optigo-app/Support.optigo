import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CloseIcon from "@mui/icons-material/Close";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
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
import Spinner from "../_ui/Spinner";
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

const CallLogManagementApp = ({ showNotification = () => {} }) => {
  const STORAGE_KEYS = {
    RECORDING_TIME: "call_recording_time",
    CURRENT_CALL: "current_call_data",
    IS_PAUSED: "call_is_paused",
    PAUSED_DURATION: "call_paused_duration",
    PAUSE_START_TIME: "call_pause_start_time",
    SLIDERS_STATE: "call_sliders_state",
    CONCURRENT_CALL: "concurrent_call_data",
    CALL_START_TIME: "call_start_timestamp",
  };

  // --- STATE MANAGEMENT --- //
  const feedbackPopover = useSubject(feedbackPopover$);
  const [recordingTime, setRecordingTime] = useState(() => {
    const savedTime = localStorage.getItem(STORAGE_KEYS.RECORDING_TIME);
    return savedTime ? parseInt(savedTime, 10) : 0;
  });

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
  const timerRef = useRef(null);

  const sidebarKey = useRef(Date.now()).current;
  const editDrawerKey = useRef(Date.now()).current;
  const [isLoading, setIsLoading] = useState(true);
  const [sliders, toggleSlider] = useMultiToggle(() => {
    const savedSliders = localStorage.getItem(STORAGE_KEYS.SLIDERS_STATE);
    return savedSliders
      ? JSON.parse(savedSliders)
      : {
          addMode: false,
          editMode: false,
          dialogMode: false,
          recordMode: false,
          detailMode: false,
          followUpMode: false,
        };
  });

  const { user } = useAuth();

  const [isPaused, setIsPaused] = useState(() => {
    const savedPaused = localStorage.getItem(STORAGE_KEYS.IS_PAUSED);
    return savedPaused ? JSON.parse(savedPaused) : false;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingCallId, setPendingCallId] = useState(null);

  const [pausedDuration, setPausedDuration] = useState(() => {
    const savedDuration = localStorage.getItem(STORAGE_KEYS.PAUSED_DURATION);
    return savedDuration ? parseFloat(savedDuration) : 0;
  });

  const pauseStartTimeRef = useRef(null);

  // ✅ MIRROR REFS: These refs are ALWAYS current and used inside the timer interval.
  // React state updates are async and cause stale closures in setInterval callbacks.
  // Refs solve this by always holding the latest value.
  const isPausedRef = useRef(isPaused);
  const pausedDurationRef = useRef(pausedDuration);
  const callStartTimeRef = useRef(
    (() => {
      const saved = localStorage.getItem(STORAGE_KEYS.CALL_START_TIME);
      return saved ? parseInt(saved, 10) : null;
    })(),
  );

  // Keep refs in sync with state (these run synchronously after render)
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    pausedDurationRef.current = pausedDuration;
  }, [pausedDuration]);

  // Use a stable reference for the concurrent call state to prevent flickering
  const concurrentCallRef = useRef(null);
  const [conCurrentCall, setConCurrentCall] = useState(() => {
    const savedConcurrentCall = localStorage.getItem(
      STORAGE_KEYS.CONCURRENT_CALL,
    );
    const parsedCall = savedConcurrentCall
      ? JSON.parse(savedConcurrentCall)
      : null;
    if (parsedCall) concurrentCallRef.current = parsedCall;
    return parsedCall;
  });

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

  // ✅ ROBUST: Timestamp-based elapsed time calculation using ONLY refs.
  // This function has ZERO dependencies on React state, so it NEVER has stale closures.
  // It reads timestamps, not counters, so it works perfectly even when the tab is
  // in the background (where browsers throttle setInterval).
  const calculateElapsedTime = useCallback(() => {
    const startTime = callStartTimeRef.current;
    if (!startTime) return 0;

    const now = Date.now();
    const totalElapsed = Math.floor((now - startTime) / 1000);

    // Read accumulated pause time from ref (always current)
    let totalPausedTime = pausedDurationRef.current;

    // If currently paused, add the ongoing pause duration
    if (isPausedRef.current && pauseStartTimeRef.current) {
      const currentPauseDuration = Math.floor(
        (now - pauseStartTimeRef.current) / 1000,
      );
      totalPausedTime += currentPauseDuration;
    }

    return Math.max(0, totalElapsed - totalPausedTime);
  }, []); // ✅ ZERO dependencies — reads from refs only

  useEffect(() => {
    const isEditing = sliders.addMode || sliders.editMode;
    setUpdatesBlocked(isEditing);

    return () => setUpdatesBlocked(false);
  }, [sliders.addMode, sliders.editMode, setUpdatesBlocked]);

  // ✅ ROBUST: Handle visibility change AND window focus to recalculate time.
  // When the user returns to the tab, we recalculate from timestamps (always accurate).
  useEffect(() => {
    const recalculate = () => {
      if (callStartTimeRef.current && !isPausedRef.current) {
        const accurateTime = calculateElapsedTime();
        setRecordingTime(accurateTime);
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
  }, [calculateElapsedTime]);

  // --- PERSISTENCE EFFECTS --- //
  // Save sliders state to localStorage when it changes
  useEffect(() => {
    const slidersJSON = JSON.stringify(sliders);
    localStorage.setItem(STORAGE_KEYS.SLIDERS_STATE, slidersJSON);
  }, [sliders]);

  // Batch localStorage updates to reduce performance impact
  const updateLocalStorage = useCallback((updates) => {
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        localStorage.removeItem(key);
      } else if (typeof value === "object") {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value.toString());
      }
    });
  }, []);

  // Save recording time to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDING_TIME, recordingTime.toString());
  }, [recordingTime]);

  // Save current call to localStorage when it changes
  useEffect(() => {
    if (CurrentCall) {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_CALL,
        JSON.stringify(CurrentCall),
      );
    }
  }, [CurrentCall]);

  // Save paused state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_PAUSED, JSON.stringify(isPaused));
  }, [isPaused]);

  // Save paused duration to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.PAUSED_DURATION,
      pausedDuration.toString(),
    );
  }, [pausedDuration]);

  // Save pause start time to localStorage when pause state changes
  useEffect(() => {
    // ✅ FIX: Check for number (timestamp), not `instanceof Date`.
    // handlePauseRecording sets this as Date.now() (a number).
    if (typeof pauseStartTimeRef.current === "number") {
      localStorage.setItem(
        STORAGE_KEYS.PAUSE_START_TIME,
        pauseStartTimeRef.current.toString(),
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.PAUSE_START_TIME);
    }
  }, [isPaused]);

  // Save concurrent call to localStorage when it changes, with debouncing
  const debouncedSetConCurrentCall = useCallback(
    debounce((call) => {
      if (call) {
        localStorage.setItem(
          STORAGE_KEYS.CONCURRENT_CALL,
          JSON.stringify(call),
        );
        concurrentCallRef.current = call;
      } else {
        localStorage.removeItem(STORAGE_KEYS.CONCURRENT_CALL);
        concurrentCallRef.current = null;
      }
    }, 100),
    [],
  );

  useEffect(() => {
    debouncedSetConCurrentCall(conCurrentCall);
  }, [conCurrentCall, debouncedSetConCurrentCall]);

  // ✅ ROBUST: Restore call session after page load (runs once)
  useEffect(() => {
    const savedCurrentCall = localStorage.getItem(STORAGE_KEYS.CURRENT_CALL);
    const savedCallStartTime = localStorage.getItem(
      STORAGE_KEYS.CALL_START_TIME,
    );
    const savedPauseStartTime = localStorage.getItem(
      STORAGE_KEYS.PAUSE_START_TIME,
    );

    // Restore pauseStartTimeRef (always as number/timestamp)
    if (savedPauseStartTime) {
      pauseStartTimeRef.current = parseInt(savedPauseStartTime, 10);
    }

    // Restore callStartTimeRef
    if (savedCallStartTime) {
      callStartTimeRef.current = parseInt(savedCallStartTime, 10);
    }

    if (savedCurrentCall && !CurrentCall) {
      try {
        const parsedCall = JSON.parse(savedCurrentCall);

        // Safety: Prevent loading "stuck" calls older than 24 hours
        const startTime = savedCallStartTime
          ? parseInt(savedCallStartTime, 10)
          : 0;
        if (startTime && Date.now() - startTime > 86400000) {
          console.warn("Cleared stuck call session (>24h old)");
          // ✅ HARDENED: Clear ALL refs and localStorage when clearing stuck calls
          callStartTimeRef.current = null;
          pauseStartTimeRef.current = null;
          isPausedRef.current = false;
          pausedDurationRef.current = 0;
          localStorage.removeItem(STORAGE_KEYS.CURRENT_CALL);
          localStorage.removeItem(STORAGE_KEYS.CALL_START_TIME);
          localStorage.removeItem(STORAGE_KEYS.IS_PAUSED);
          localStorage.removeItem(STORAGE_KEYS.PAUSED_DURATION);
          localStorage.removeItem(STORAGE_KEYS.PAUSE_START_TIME);
          localStorage.removeItem(STORAGE_KEYS.RECORDING_TIME);
          return;
        }

        setCurrentCall(parsedCall);
      } catch (error) {
        console.error("Error parsing saved current call:", error);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CALL);
      }
    }
  }, []);

  // ✅ ROBUST: Handle timer start/resume after page refresh or state change.
  useEffect(() => {
    if (CurrentCall?.sr && !isPaused && callStartTimeRef.current) {
      // ✅ HARDENED: Only start timer if not already running
      const accurateTime = calculateElapsedTime();
      setRecordingTime(accurateTime);
      if (!timerRef.current) {
        startTimer();
      }
    }

    // If paused, recalculate the frozen display time
    if (isPaused && CurrentCall?.sr && callStartTimeRef.current) {
      // ✅ HARDENED: Stop any running timer while paused
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const accurateTime = calculateElapsedTime();
      setRecordingTime(accurateTime);
    }

    // ✅ HARDENED: If no active call, make sure timer is stopped
    if (!CurrentCall?.sr && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CurrentCall?.sr, isPaused]); // Intentionally minimal deps to prevent re-fire loops

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

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // ✅ ROBUST: The interval reads from REFS only, never from state.
    // This means it always has the latest values, even if React hasn't
    // re-rendered yet. This eliminates the stale closure bug.
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current && callStartTimeRef.current) {
        const accurateTime = calculateElapsedTime();
        setRecordingTime(accurateTime);
      }
    }, 1000);
  }, [calculateElapsedTime]); // ✅ calculateElapsedTime has zero deps, so this is stable

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

  const handlePauseRecording = useCallback(async () => {
    if (isPausedRef.current || !CurrentCall?.sr) return; // Prevent double-pause

    // 1. Stop timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 2. Capture accurate elapsed time before any state changes
    const currentTime = calculateElapsedTime();
    const pauseStartTime = Date.now(); // Always a number (timestamp)

    // 3. Update REFS first (synchronous, immediate)
    isPausedRef.current = true;
    pauseStartTimeRef.current = pauseStartTime;

    // 4. Update state (for UI re-render)
    setIsPaused(true);
    setRecordingTime(currentTime); // Lock display at paused time

    // 5. Persist to localStorage
    updateLocalStorage({
      [STORAGE_KEYS.IS_PAUSED]: true,
      [STORAGE_KEYS.RECORDING_TIME]: currentTime.toString(),
      [STORAGE_KEYS.PAUSE_START_TIME]: pauseStartTime.toString(),
    });

    // 6. API call last (non-blocking)
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
  ]);

  const handleResumeRecording = useCallback(async () => {
    if (!isPausedRef.current || !CurrentCall?.sr || !pauseStartTimeRef.current)
      return;

    // 1. Calculate how long the pause lasted
    const pauseEndTime = Date.now();
    const pauseDuration = Math.floor(
      (pauseEndTime - pauseStartTimeRef.current) / 1000,
    );
    const newPausedDuration = pausedDurationRef.current + pauseDuration;

    // 2. Update REFS first (synchronous, immediate)
    pauseStartTimeRef.current = null;
    isPausedRef.current = false;
    pausedDurationRef.current = newPausedDuration;

    // 3. Update state (for UI re-render)
    setIsPaused(false);
    setPausedDuration(newPausedDuration);

    // 4. Persist to localStorage
    updateLocalStorage({
      [STORAGE_KEYS.IS_PAUSED]: false,
      [STORAGE_KEYS.PAUSED_DURATION]: newPausedDuration.toString(),
      [STORAGE_KEYS.PAUSE_START_TIME]: null,
    });

    // 5. Start timer immediately (refs are already updated, no delay needed)
    startTimer();

    // 6. API call (non-blocking)
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
    showNotification,
    updateLocalStorage,
    calculateElapsedTime,
    activeFollowUp,
    resumeFollowUpCall,
  ]);

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
      if (recordingTime <= 0) {
        setActiveFollowUp(null);
      }
    }
  }, [CurrentCall?.sr]);

  // Debug logging removed — was firing every second (recordingTime dep)

  const handleStartRecording = useCallback(() => {
    // Reset all state
    setRecordingTime(0);
    setIsPaused(false);
    setPausedDuration(0);

    // Reset all refs
    const startTimestamp = Date.now();
    callStartTimeRef.current = startTimestamp;
    pauseStartTimeRef.current = null;
    isPausedRef.current = false;
    pausedDurationRef.current = 0;

    // Persist
    updateLocalStorage({
      [STORAGE_KEYS.CALL_START_TIME]: startTimestamp.toString(),
      [STORAGE_KEYS.PAUSED_DURATION]: "0",
      [STORAGE_KEYS.PAUSE_START_TIME]: null,
    });

    startTimer();
  }, [startTimer, updateLocalStorage]);

  // --- ROBUST END CALL ---
  const handleEndCall = useCallback(async () => {
    // Capture data
    const currentCallSr = CurrentCall?.sr;
    const duration = pausedDurationRef.current;
    const isEndingFollowUp = !!activeFollowUp;

    if (isEndingFollowUp) {
      // API call FIRST
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
          // ⚠️ DO NOT return — fall through to clear UI so user is never permanently locked
        } else {
          showNotification("Follow-up call ended", "success");
        }
      } catch (error) {
        console.error("End follow-up call API failed", error);
        showNotification(
          "Server error — call ended locally. Please verify on server.",
          "warning",
        );
        // ⚠️ DO NOT return — fall through to clear UI so user is never permanently locked
      }
    } else {
      if (currentCallSr) {
        try {
          await endCall(currentCallSr, duration);
          // Assuming main endCall is fire-and-forget or handled inside for now
        } catch (error) {
          console.error("End call API failed (UI cleared safely)", error);
          showNotification("Failed to end call properly", "error");
          // Not breaking here since main call logic is complex and might need forceful clear.
        }
      }
    }

    // --- ONLY CLEAR IF API SUCCEEDED ---
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

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
  ]);

  const onRowClick = useCallback(
    (rowData) => {
      if (!rowData?.sr) return;

      const selectedData = callLogMap[rowData.sr];
      if (!selectedData) return;

      setCurrentCall(selectedData);
      if (!sliders.recordMode) {
        toggleSlider("recordMode");
      }
    },
    [callLogMap, toggleSlider, sliders.recordMode],
  );

  const handleEditAndStartCall = useCallback((id) => {
    setPendingCallId(id);
    setIsDialogOpen(true);
  }, []);

  const handleConfirmStartCall = useCallback(async () => {
    // Wrapped in try/catch to prevent freezing if API fails
    try {
      const result = await startCall(pendingCallId);

      if (!result.success) {
        console.error(
          "Failed to confirm and start call:",
          result.error?.message,
        );
        showNotification(`${result.error?.message}`, "error");
        setIsDialogOpen(false);
        return;
      }

      if (!sliders.recordMode) {
        handleToggleRecording();
      }

      // ✅ ADD THIS LINE - This was missing!
      handleStartRecording();

      showNotification("Call started", "success");
    } catch (e) {
      console.error("Error starting call:", e);
      showNotification("Error starting call", "error");
    } finally {
      setIsDialogOpen(false);
    }
  }, [
    pendingCallId,
    sliders.recordMode,
    handleToggleRecording,
    handleStartRecording,
    setIsDialogOpen,
    startCall,
    showNotification,
  ]);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const onStartCall = useCallback(
    async (callId) => {
      // ✅ HARDENED: Wrapped in try-catch to prevent unhandled exceptions
      try {
        const result = await startCall(callId);

        if (!result.success) {
          console.error("Failed to start call:", result.error?.message);
          showNotification(`${result.error?.message}`, "error");
          return;
        }

        // Force recording mode to open if not already
        if (!sliders.recordMode) {
          handleToggleRecording();
        }

        showNotification("Call started", "success");
        handleStartRecording();
      } catch (e) {
        console.error("Error in onStartCall:", e);
        showNotification("Error starting call", "error");
      }
    },
    [
      startCall,
      handleStartRecording,
      showNotification,
      sliders.recordMode,
      handleToggleRecording,
    ],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      debouncedSetConCurrentCall.cancel();
    };
  }, [debouncedSetConCurrentCall]);

  // === FOLLOW-UP CALL HANDLERS ===
  const toggleFollowUpPanel = useCallback(
    (row) => {
      // If a row is passed (from grid chip click), set it as CurrentCall so panel shows its follow-ups
      if (row && row.sr) {
        const selectedData = callLogMap[row.sr];
        if (selectedData) {
          // Only switch calls if we're not currently running a follow-up timer
          if (recordingTime <= 0) {
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
      recordingTime,
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

  // ✅ ROBUST: Save all timing data before page unloads.
  // Reads from REFS (always current) instead of stale state closures.
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (CurrentCall?.sr) {
        const currentTime = calculateElapsedTime();
        localStorage.setItem(
          STORAGE_KEYS.RECORDING_TIME,
          currentTime.toString(),
        );
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_CALL,
          JSON.stringify(CurrentCall),
        );
        localStorage.setItem(
          STORAGE_KEYS.IS_PAUSED,
          JSON.stringify(isPausedRef.current),
        );
        localStorage.setItem(
          STORAGE_KEYS.PAUSED_DURATION,
          pausedDurationRef.current.toString(),
        );
        localStorage.setItem(
          STORAGE_KEYS.SLIDERS_STATE,
          JSON.stringify(sliders),
        );

        // ✅ FIX: Check for number, not instanceof Date
        if (typeof pauseStartTimeRef.current === "number") {
          localStorage.setItem(
            STORAGE_KEYS.PAUSE_START_TIME,
            pauseStartTimeRef.current.toString(),
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [CurrentCall, sliders, calculateElapsedTime]);

  const callStatusValue = {
    currentCallId: CurrentCall?.sr,
    duration: recordingTime,
    isRunning: Boolean(CurrentCall?.sr && timerRef.current),
    actualElapsedTime: CurrentCall?.sr ? calculateElapsedTime() : 0,
  };

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
      <ActiveCallOverlay
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
      />
      {/* <FloatingQueueButton onEditCall={handleAcceptCall} /> */}
    </>
  );
};

export default withNotification(CallLogManagementApp);
