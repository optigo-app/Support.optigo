import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "./UseAuth";
import TicketApi from "../apis/TicketApiController";
import { useSocketEvent } from "../hooks/useSocketListener";
import { notify } from "../libs/NOTIFICATION_TEMPLATES";
import { useNavigate } from "react-router-dom";
import { patchTicketInMap, addTicketToMap, setSelectedTicketNo, setCurrentView, setSelectedTicketInStore } from "../rxjs/ticketStore";

export const TicketContext = React.createContext();

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicketState] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState(null);
  const [TicketMaster, setTicketMaster] = useState(null);
  const [lastUpdatedTicketNo, setLastUpdatedTicketNo] = useState(
    sessionStorage.getItem("LastUpdatedticket") || null,
  );
  const [refreshComment, setRefreshComment] = useState(false);
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTicketDirty, setIsTicketDirty] = useState(false);

  // Refs to break stale closures in fetchTicketList — the callback reads from
  // these refs instead of closed-over state, so it never needs to be recreated.
  const selectedTicketRef = useRef(null);
  const lastUpdatedTicketNoRef = useRef(sessionStorage.getItem("LastUpdatedticket") || null);

  // Stable wrapper that drives both React state and the RxJS selectedTicketNo$.
  // Everything in the app that calls setSelectedTicket continues to work unchanged;
  // TicketItem now additionally gets the update through the RxJS observable.
  const setSelectedTicket = useCallback((ticketOrUpdater) => {
    setSelectedTicketState((prev) => {
      const next = typeof ticketOrUpdater === "function" ? ticketOrUpdater(prev) : ticketOrUpdater;
      selectedTicketRef.current = next;
      // Drive the RxJS highlight — only 2 rows re-render (old + new selected)
      setSelectedTicketNo(next?.TicketNo ?? null);
      // Drive selectedTicket$ — RightPanel reads from here, not from context
      // This means setSelectedTicket no longer forces ALL context consumers to re-render
      setSelectedTicketInStore(next);
      return next;
    });
  }, []);

  const setNotificationInstance = useCallback((fn) => {
    notificationRef.current = fn;
  }, []);

  const showNotify = useCallback((payload) => {
    if (notificationRef.current) {
      notificationRef.current(payload);
    } else {
      console.warn("Notification instance not registered yet");
    }
  }, []);

  const handleRefresh = () => {
    setRefreshComment(!refresh);
  };

  const CalllogMaster = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("masterData")) || null;
    } catch {
      return null;
    }
  })();
  const APPNAME_LIST =
    TicketMaster?.rd?.map((val) => ({
      value: val?.AppId,
      label: val?.AppName,
    })) || [];
  const COMPANY_LIST =
    TicketMaster?.rd1?.map((val) => ({
      value: val?.id,
      label: val?.companyname,
    })) || [];
  const CATEGORY_LIST =
    TicketMaster?.rd2?.map((val) => ({
      value: val?.CateId,
      label: val?.categoryname,
    })) || [];
  const STATUS_LIST =
    TicketMaster?.rd3?.map((val) => ({
      value: val?.StatusID,
      label: val?.Name,
    })) || [];
  const PRIORITY_LIST =
    TicketMaster?.rd4?.map((val) => ({
      value: val?.PriorityID,
      label: val?.Name,
    })) || [];

  const CORPORATE_LOGIN_MASTER = useMemo(() => {
    return (companyname) => {
      return (
        TicketMaster?.rd7
          ?.filter((val) => val?.CustId === companyname)
          ?.map((val) => ({
            label: val?.UserName,
            value: val?.Id,
          })) ?? []
      );
    };
  }, [TicketMaster]);

  const USERNAME_LIST =
    CalllogMaster?.employees?.map((val) => ({
      value: val?.userid,
      label: val?.user,
    })) || [];

  const fetchTicketList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TicketApi.getTicketsList({});
      if (!response?.rd) {
        setError(response?.msg);
        return;
      }

      setTickets(response?.rd);

      // Read from refs — no stale closure, no need to recreate this callback
      const currentLastUpdated = lastUpdatedTicketNoRef.current;
      const currentSelected = selectedTicketRef.current;

      if (currentLastUpdated) {
        const updatedTicket = response.rd.find(
          (ticket) => ticket?.TicketNo === currentLastUpdated,
        );
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
        lastUpdatedTicketNoRef.current = null;
        setLastUpdatedTicketNo(null);
        sessionStorage.removeItem("LastUpdatedticket");
      } else if (currentSelected) {
        const currentTicket = response.rd.find(
          (ticket) => ticket?.TicketNo === currentSelected.TicketNo,
        );
        if (currentTicket) {
          setSelectedTicket(currentTicket);
        }
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
      setIsInitialLoading(false); // ✅ ONLY after first API resolves
    }
  // No state deps — reads from refs; recreated only if setSelectedTicket changes (stable)
  }, [setSelectedTicket]);

  const fetchSingleTicket = useCallback(async (ticketId) => {
    try {
      const response = await TicketApi.getSingleTickets({
			ticketId: ticketId,
	  });
      if (!response?.rd) {
        setError(response?.msg);
        return;
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const GetMasterData = async () => {
      try {
        const master = await TicketApi.getMasterData();
        sessionStorage.setItem("ticketmasterData", JSON.stringify(master));
        setTicketMaster(master);
      } catch (err) {
        console.error("Error fetching master data:", err.message);
      }
    };
    if (!sessionStorage.getItem("ticketmasterData")) {
      GetMasterData();
    } else {
      setTicketMaster(JSON?.parse(sessionStorage.getItem("ticketmasterData")));
    }
  }, []);

  useEffect(() => {
    fetchTicketList();
  }, [refresh]);

  // Api Done ✅
  const addTicket = useCallback(
    async (ticketData) => {
      try {
        const res = await TicketApi.createTicket({
          createdBy: user?.id,
          appId: ticketData?.appname,
          cateId: ticketData?.category,
          custId: ticketData?.userName,
          description: ticketData?.instruction,
          projectId: ticketData?.projectCode,
          subject: ticketData?.subject,
          filePath:
            ticketData?.attachment !== null ? ticketData?.attachment : "",
          callLogId: ticketData?.CallId || "",
        });
        setRefresh(!refresh);
      } catch (error) {
        console.log("Error adding ticket:", error);
      }
    },
    [refresh],
  );

  const updateTicket = useCallback(
    async (TicketId, updatedFields) => {
      setLoading(true);
      try {
        const keywordsPayload =
          updatedFields?.tags !== undefined
            ? updatedFields?.tags
            : updatedFields?.keywords;
        if (keywordsPayload !== undefined) {
          // Patch only the affected ticket in RxJS map — zero cost for all other rows
          patchTicketInMap(TicketId, { Keywords: keywordsPayload, keywords: keywordsPayload });
          setSelectedTicket((prev) => {
            if (!prev || prev.TicketNo !== TicketId) return prev;
            return {
              ...prev,
              Keywords: keywordsPayload,
              keywords: keywordsPayload,
            };
          });
          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              t?.TicketNo === TicketId
                ? { ...t, Keywords: keywordsPayload, keywords: keywordsPayload }
                : t,
            ),
          );
        }

        const res = await TicketApi.updateTicket({
          ticketNo: TicketId,
          statusId: updatedFields?.Status,
          appId: updatedFields?.appname,
          cateId: updatedFields?.category,
          priorityId: updatedFields?.Priority,
          followUp1: updatedFields?.FollowUp,
          keywords: keywordsPayload,
          sendEmail: Number(updatedFields?.sendMail),
          promiseDate: updatedFields?.PromiseDate,
          createdBy: user?.id,
          suggested: updatedFields?.suggested,
          star: updatedFields?.Star,
          mainSubject: updatedFields?.MainSubject,
        });
        lastUpdatedTicketNoRef.current = TicketId;
        setLastUpdatedTicketNo(TicketId);
        sessionStorage.setItem("LastUpdatedticket", TicketId);
        setRefresh((prev) => !prev);
        console.log("Ticket updated successfully!");
      } catch (error) {
        console.log("Error updating ticket:", error);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, setSelectedTicket],
  );

  // Api Done ✅
  const AddComment = useCallback(
    async (commentData) => {
      try {
        const res = await TicketApi.addComment({
          createdBy: user?.id,
          comment: commentData?.message ?? "",
          filePath:
            commentData?.attachment?.preview !== null
              ? commentData?.attachment?.preview
              : "https://jeremyqho.com/static/3/bug-process.jpeg",
          callLogId: commentData?.CallId || "",
          isOfficeUseOnly: commentData?.isOfficeUseOnly === true ? 1 : 0,
          ticketNo: commentData?.TicketNo,
          Role: commentData?.Role,
        });
        lastUpdatedTicketNoRef.current = commentData?.TicketNo;
        setLastUpdatedTicketNo(commentData?.TicketNo);
        sessionStorage.setItem("LastUpdatedticket", commentData?.TicketNo);
        setRefresh(!refresh);
      } catch (error) {
        console.log("Error adding comment:", error);
      }
    },
    [refresh, user?.id],
  );

  // Api Done ✅
  const CloseTicket = useCallback(
    async (TicketNo, openTicket) => {
      try {
        const res = await TicketApi.closeTicket({
          createdBy: user?.id,
          ticketNo: TicketNo,
          reopen: openTicket,
        });
        lastUpdatedTicketNoRef.current = TicketNo;
        setLastUpdatedTicketNo(TicketNo);
        sessionStorage.setItem("LastUpdatedticket", TicketNo);
        console.log(res, "Ticket closed successfully!");

        // Optimistic update — patch only the affected row in RxJS map
        const newStatus = openTicket ? "Open" : "Closed";
        patchTicketInMap(TicketNo, { Status: newStatus });
        setTickets((prev) =>
          prev.map((t) =>
            t.TicketNo === TicketNo ? { ...t, Status: newStatus } : t,
          ),
        );
        setSelectedTicket((prev) =>
          prev?.TicketNo === TicketNo ? { ...prev, Status: newStatus } : prev,
        );
      } catch (error) {
        console.log("Error closing ticket:", error);
      }
    },
    [user?.id, setSelectedTicket],
  );

  const EditComment = useCallback(
    async (commentmsg, commentId, filePath, isOfficeUseOnly, ticketNo) => {
      try {
        const res = await TicketApi.EditComment({
          comment: commentmsg,
          commentId,
          createdBy: user?.id,
          filePath,
          isOfficeUseOnly: isOfficeUseOnly === true ? 1 : 0,
          ticketNo,
        });
        const status = res?.rd[0]?.stat_msg;
        if (status === "Comment update successfully") {
          setRefresh(!refresh);
        }
        return status;
      } catch (error) {
        console.log("Error adding comment:", error);
      }
    },
    [refresh, user?.id],
  );

  useEffect(() => {
    const channel = new BroadcastChannel("notification_channel");
    channel.onmessage = (event) => {
      if (event?.data?.type !== "NOTIFICATION_CLICK") return;
      const payload = event.data.payload;
      if (payload?.group === "TICKET") {
        if (window.location.pathname !== "/ticket") {
          navigate("/ticket");
        }
        setSelectedTicket(payload);
        // Drive detail panel via RxJS — instant, no parent re-render
        setCurrentView("detail");
      }
    };
    return () => channel.close();
  }, []);

  // 🔹 SOCKET EVENT HANDLERS  ✅
  useSocketEvent("CreateTicket", (data) => {
    if (data?.CreatedBy == user?.fullName) return;
    notify(data, "CREATE_TICKET");
    // Add to RxJS map first — TicketItem for this ticket will subscribe on mount
    addTicketToMap(data);
    setTickets((prev) => {
      const exists = prev.some((t) => t.TicketNo === data.TicketNo);
      if (exists) return prev;
      return [data, ...prev];
    });
  });

  useSocketEvent("TicketComment", (data) => {
    console.log(data, "TicketComment");
    notify(data, "TICKET_COMMENT");
    // Patch only the affected row in RxJS — zero re-renders for the other 799 rows
    patchTicketInMap(data?.TicketNo, data);
    setTickets((prev) =>
      prev.map((t) => (t.TicketNo === data?.TicketNo ? { ...t, ...data } : t)),
    );
    setSelectedTicket((prev) => {
      if (prev?.TicketNo === data?.TicketNo) {
        return { ...prev, ...data };
      }
      return prev;
    });
    setRefreshComment((prev) => !prev);
  });

  useSocketEvent("CloseTicket", (data) => {
    notify(data, "CLOSE_TICKET", user);
    // Patch only the affected row in RxJS
    patchTicketInMap(data?.TicketNo, data);
    setTickets((prev) =>
      prev.map((t) => (t.TicketNo === data.TicketNo ? { ...t, ...data } : t)),
    );
    setSelectedTicket((prev) => {
      if (prev?.TicketNo === data?.TicketNo) {
        return { ...prev, ...data };
      }
      return prev;
    });
  });

  useSocketEvent("UpdateTicket", (data) => {
    notify(data, "UPDATE_TICKET", user);
    // Patch only the affected row in RxJS — zero re-renders for all other rows
    patchTicketInMap(data?.TicketNo, data);
    setTickets((prev) => {
      const idx = prev.findIndex((t) => t?.TicketNo === data?.TicketNo);
      if (idx === -1) return [data, ...prev];
      const updated = [...prev];
      updated[idx] = { ...prev[idx], ...data };
      const [ticket] = updated.splice(idx, 1);
      return [ticket, ...updated];
    });
    setSelectedTicket((prev) => {
      if (prev?.TicketNo === data?.TicketNo) {
        return { ...prev, ...data };
      }
      return prev;
    });
    setRefreshComment((prev) => !prev);
  });

  // Memoize the context value — prevents ALL consumers from re-rendering
  // when only one piece of state (e.g. loading) changes.
  const contextValue = useMemo(() => ({
    tickets,
    setTickets,
    addTicket,
    updateTicket,
    selectedTicket,
    setSelectedTicket,
    TicketMaster,
    APPNAME_LIST,
    COMPANY_LIST,
    CATEGORY_LIST,
    STATUS_LIST,
    PRIORITY_LIST,
    USERNAME_LIST,
    AddComment,
    CloseTicket,
    loading,
    refreshComment,
    handleRefresh,
    CORPORATE_LOGIN_MASTER,
    setRefresh,
    EditComment,
    // 🔔 notification handlers
    setNotificationInstance,
    showNotify,
    isInitialLoading,
    isTicketDirty,
    setIsTicketDirty,
    fetchSingleTicket,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    tickets, addTicket, updateTicket, selectedTicket, setSelectedTicket,
    TicketMaster, AddComment, CloseTicket, loading, refreshComment,
    CORPORATE_LOGIN_MASTER, EditComment, isInitialLoading, isTicketDirty,
  ]);

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTicket must be used within a TicketProvider");
  }
  return context;
};
