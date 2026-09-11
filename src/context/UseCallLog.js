import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useTransition,
} from "react";
import { format } from "date-fns";
import CallLogApi from "../apis/CallLogApiController";
import ITaskApi from "../apis/ITaskApi";
import { useAuth } from "./UseAuth";
import { useSocketEvent } from "../hooks/useSocketListener";
import { notify } from "../libs/NOTIFICATION_TEMPLATES";
import { useNavigate } from "react-router-dom";
import { concatMap } from "rxjs/operators";
import { statusPriorityUpdates$ } from "../rxjs/callUpdateQueue";

const isValidCallPayload = (data) => {
  if (!data || typeof data !== "object") return false;
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
};

const CallLogContext = createContext(null);

export function CallLogProvider(props) {
  const { user } = useAuth();
  const [callLog, setCallLog] = useState([]);
  const [callQueue, setCallQueue] = useState([]);
  const [CurrentCall, setCurrentCall] = useState(null);

  const callLogRef = useRef(callLog);
  useEffect(() => {
    callLogRef.current = callLog;
  }, [callLog]);

  useEffect(() => {
    if (CurrentCall?.sr && Array.isArray(callLog)) {
      const latestCall = callLog.find((c) => c.sr === CurrentCall.sr);
      if (latestCall) {
        setCurrentCall((prev) => {
          if (!prev) return prev;
          const merged = { ...prev, ...latestCall };
          return JSON.stringify(merged) !== JSON.stringify(prev)
            ? merged
            : prev;
        });
      }
    }
  }, [callLog, CurrentCall?.sr]);

  const currentTime = format(new Date(), "hh:mm a");
  const [activeFollowUp, _setActiveFollowUp] = useState(() => {
    const saved = localStorage.getItem("active_follow_up");
    return saved ? JSON.parse(saved) : null;
  });

  const setActiveFollowUp = useCallback((val) => {
    _setActiveFollowUp(val);
    if (val === null) {
      localStorage.removeItem("active_follow_up");
    } else {
      localStorage.setItem("active_follow_up", JSON.stringify(val));
    }
  }, []);
  const [isPending, startTransition] = useTransition();
  const areUpdatesBlocked = useRef(false);
  const updateQueue = useRef([]);

  const [masterData, setMasterData] = useState(() => {
    const stored = sessionStorage.getItem("masterData");
    return stored ? JSON.parse(stored) : { master: null, employees: null };
  });
  const navigate = useNavigate();
  const isFilterActiveRef = useRef(false);
  const EMPLOYEE_LIST = masterData?.employees || [];
  const COMPANY_LIST = masterData?.master?.rd || [];
  const APPNAME_LIST = masterData?.master?.rd1 || [];
  const STATUS_LIST =
    masterData?.master?.rd2?.map((val) => ({
      value: val?.StatusID,
      label: val?.Name,
    })) || [];
  const PRIORITY_LIST =
    masterData?.master?.rd3?.map((val) => ({
      value: val?.PriorityID,
      label: val?.Name,
    })) || [];
  const ESTATUS_LIST =
    masterData?.master?.rd6?.map((val) => ({
      value: val?.StatusID,
      label: val?.Name,
    })) || [];
  const COMPANY_INFO_MASTER = masterData?.master?.rd7 || [];
  const CALL_TYPE_MASTER =
    masterData?.master?.rd8?.map((val) => ({
      label: val?.TypeName,
      value: val?.Id,
    })) || [];

  const CALLFORWARD_REASON_MASTER =
    masterData?.master?.rd9?.map((val) => ({
      label: val?.Reason,
      value: val?.Id,
    })) || [];
  const INTERNAL_STATUS_LIST = "INTERNAL_STATUS";
  const INTERNAL_ESTATUS_LIST = "INTERNAL_ESTATUS";
  const location = window.location;

  const companyOptions =
    COMPANY_LIST.map((option) => ({
      label: String(option?.ProjectCode || ""),
      value: String(option?.ProjectID || ""),
    }))?.filter((option) => option.label && option.value) || [];

  const departmentsNames =
    (EMPLOYEE_LIST &&
      Object.groupBy?.(EMPLOYEE_LIST, (emp) => emp?.designation)) ||
    {};

  const forwardOption = Object.entries(departmentsNames).flatMap(
    ([designation, people]) =>
      people.map((emp) => ({
        designation,
        person: emp?.user,
        id: `${emp?.DesignaitonId},${emp?.userid}`,
      })),
  );

  const [refreshList, setrefreshList] = useState(false);

  const setUpdatesBlocked = useCallback((isBlocked) => {
    areUpdatesBlocked.current = isBlocked;
    if (!isBlocked && updateQueue.current.length > 0) {
      console.log(`Flushing ${updateQueue.current.length} queued updates...`);

      setCallLog((prevLog) => {
        let newLog = [...prevLog];
        updateQueue.current.forEach((event) => {
          if (!isValidCallPayload(event.data)) return;
          if (event.type === "ADD") {
            newLog = [event.data, ...newLog];
          } else if (event.type === "UPDATE") {
            const exists = newLog.some((c) => c.sr === event.data.sr);
            if (exists) {
              newLog = newLog.map((c) =>
                c.sr === event.data.sr ? { ...c, ...event.data } : c,
              );
            } else {
              newLog = [event.data, ...newLog];
            }
          }
        });
        updateQueue.current = [];
        return newLog;
      });
    }
  }, []);

  const triggerRefresh = useCallback(() => {
    // 3. Mark list refresh as "low priority" so it doesn't freeze the drawer
    startTransition(() => {
      setrefreshList((prev) => !prev);
    });
  }, []);

  // RxJS queue: process status/priority updates in order, applying changes only on success
  useEffect(() => {
    const sub = statusPriorityUpdates$
      .pipe(
        concatMap(
          async ({
            callId,
            updatedFields,
            type,
            originalRow,
            optimisticFields,
            resolve,
            reject,
          }) => {
            try {
              let data;
              if (INTERNAL_STATUS_LIST === type) {
                data = await CallLogApi.changeInternalStatus({
                  callLogId: callId,
                  ...updatedFields,
                });
              } else {
                data = await CallLogApi.changeExternalStatusAndPriority({
                  callLogId: callId,
                  ...updatedFields,
                });
              }
              console.log(data, "data");

              if (
                !data ||
                data.stat === 0 ||
                data.stat_code === 1001 ||
                (data.stat_code && data.stat_code !== 1000)
              ) {
                console.error(
                  "Failed to update status/priority on server:",
                  data,
                );
                // Ensure UI is kept at originalRow in case of any partial updates
                setCallLog((prev) => {
                  if (!Array.isArray(prev)) return prev;
                  return prev.map((c) =>
                    String(c.sr) === String(callId) ? originalRow : c,
                  );
                });
                setCurrentCall((prev) => {
                  if (!prev || String(prev.sr) !== String(callId)) return prev;
                  return originalRow;
                });
                resolve({ msg: data, success: false, type });
              } else {
                // Apply updates locally on success
                setCallLog((prev) => {
                  if (!Array.isArray(prev)) return prev;
                  return prev.map((c) =>
                    String(c.sr) === String(callId)
                      ? { ...c, ...optimisticFields }
                      : c,
                  );
                });
                setCurrentCall((prev) => {
                  if (!prev || String(prev.sr) !== String(callId)) return prev;
                  return { ...prev, ...optimisticFields };
                });
                triggerRefresh();
                resolve({ msg: data, success: true, type });
              }
            } catch (err) {
              console.error("Failed to update status/priority:", err);
              // Rollback to original state on error
              setCallLog((prev) => {
                if (!Array.isArray(prev)) return prev;
                return prev.map((c) =>
                  String(c.sr) === String(callId) ? originalRow : c,
                );
              });
              setCurrentCall((prev) => {
                if (!prev || String(prev.sr) !== String(callId)) return prev;
                return originalRow;
              });
              reject(err);
            }
          },
        ),
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRefresh]);

  const getCallQueue = useCallback(async () => {
    try {
      const data = await CallLogApi.getCallQueue();
      console.log("🚀 ~ CallLogProvider ~ data:", data);
      // setCallLog(data?.rd);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const GetMasterData = async () => {
      try {
        const [master, employees] = await Promise.all([
          CallLogApi.getMasterData(),
          CallLogApi.getEmployeeMasterD(),
        ]);
        const data = { master, employees: employees?.rd };
        setMasterData(data);
        sessionStorage.setItem("masterData", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching master data:", err.message);
      }
    };
    if (!sessionStorage.getItem("masterData")) {
      GetMasterData();
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const savedSearch = params.get("search") || "";
    const savedCompanyStatus = params.get("companyStatus") || "";
    const savedStatus = params.get("status") || "";
    const savedTarget = params.get("target") || "";
    const start = params.get("start");
    const end = params.get("end");

    const GetAllCallLogs = async () => {
      try {
        const data = await CallLogApi.getCallLogs({
          endDate: end || "",
          startDate: start || "",
          statusId: savedStatus || "",
          projectId: savedCompanyStatus || "",
          filter: savedTarget || "",
          searchTerm: savedSearch || "",
        });
        if (areUpdatesBlocked.current) {
          console.log("Background refresh skipped due to active edit mode.");
          return;
        }
        startTransition(() => {
          setCallLog(data?.rd);
        });
      } catch (error) {
        console.log(error);
      }
    };
    GetAllCallLogs();
    // getCallQueue();
  }, [refreshList]);

  const addCall = useCallback(
    async (call, isConcurrent) => {
      try {
        const data = await CallLogApi.addCall({
          appID: call?.appname,
          createdBy: call?.receivedBy,
          customerName: call?.callBy,
          deptId: call?.forward && call?.forward?.split(",")[0],
          empId: call?.forward && call?.forward?.split(",")[1],
          description: call?.description,
          entryDate: call?.date,
          projectID: call?.company,
          callType: call?.callType,
          ParentCalllogId: call?.ParentCalllogId,
        });
        const newCall = data?.rd1?.[0];
        if (!isConcurrent) {
          setCurrentCall(newCall);
        }
        triggerRefresh();
      } catch (error) {
        console.log(error);
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  const editCall = useCallback(
    async (callId, updatedFields) => {
      try {
        const data = await CallLogApi.editCallApi(
          callId,
          updatedFields.CreatedBy,
          updatedFields.CustomerName,
          updatedFields.PriorityId,
          updatedFields.ParentId,
          updatedFields.Descr,
          updatedFields.EmpId,
          updatedFields.DeptId,
          updatedFields.StatusId,
          updatedFields.Estatus,
          updatedFields.calldetails,
          updatedFields.EntryDate,
          updatedFields.CallType,
          updatedFields.AppId,
        );
        const statusObj = data?.rd?.[0];
        if (statusObj?.stat === 0 || statusObj?.stat_code === 1001) {
          return { success: false, msg: statusObj };
        }
        if (statusObj?.sr) {
          setCurrentCall(statusObj);
        }
        triggerRefresh();
        return { success: true, msg: statusObj };
      } catch (error) {
        console.log(error);
        return { success: false, error };
      }
    },
    [triggerRefresh],
  );

  const UpdateStatusAndPriority = useCallback(
    (callId, updatedFields, type) => {
      return new Promise((resolve, reject) => {
        // 1. Find original row to rollback in case of error
        const originalRow = callLogRef.current.find(
          (c) => String(c.sr) === String(callId),
        );
        if (!originalRow) {
          reject(new Error("Call log row not found."));
          return;
        }

        // Clone originalRow to avoid mutations and reference issues during rollback
        const originalRowCopy = { ...originalRow };

        // 2. Compute optimistic updates
        const optimisticFields = {};
        if (INTERNAL_STATUS_LIST === type) {
          if (updatedFields.statusId !== undefined) {
            const statusObj = STATUS_LIST.find(
              (s) => String(s.value) === String(updatedFields.statusId),
            );
            if (statusObj) {
              optimisticFields.status = statusObj.label;
            }
          }
        } else {
          if (updatedFields.priorityId !== undefined) {
            const priorityObj = PRIORITY_LIST.find(
              (p) => String(p.value) === String(updatedFields.priorityId),
            );
            if (priorityObj) {
              optimisticFields.priority = priorityObj.label;
            }
          }
          if (updatedFields.statusId !== undefined) {
            const estatusObj = ESTATUS_LIST.find(
              (e) => String(e.value) === String(updatedFields.statusId),
            );
            if (estatusObj) {
              optimisticFields.Estatus = estatusObj.label;
            }
          }
        }

        // 4. Push to RxJS Subject queue
        statusPriorityUpdates$.next({
          callId,
          updatedFields,
          type,
          originalRow: originalRowCopy,
          optimisticFields,
          resolve,
          reject,
        });
      });
    },
    [STATUS_LIST, ESTATUS_LIST, PRIORITY_LIST],
  );
  // Call Forward API
  const ForwardCall = useCallback(
    async (callId, updatedFields) => {
      try {
        const response = await CallLogApi.forwardCall({
          callLogId: callId,
          ...updatedFields,
        });
        const statusObj = response?.rd?.[0];
        if (statusObj?.stat === 0 || statusObj?.stat_code === 1001) {
          return { msg: statusObj, success: false };
        }
        const updatedCall = response?.rd1?.[0];
        if (updatedCall) {
          setCurrentCall(updatedCall);
        }
        triggerRefresh();
        return { msg: statusObj, success: true };
      } catch (error) {
        console.log(error);
        return { msg: error, success: false };
      }
    },
    [triggerRefresh],
  );

  const UpdateCall = useCallback(
    async (callId, updatedFields) => {
      try {
        const response = await CallLogApi.updateCallDynamic({
          CallLogid: callId,
          ...updatedFields,
        });
        const rd = response?.rd;
        const raw = Array.isArray(rd) ? rd[0] : null;

        if (raw === null || raw?.stat === 0 || raw?.stat_code) {
          return {
            success: false,
            message: "Invalid response format from server",
            code: 500,
          };
        }
        setCurrentCall((prev) => {
          if (!prev) return prev;
          if (prev.sr !== raw.sr) return prev;
          return { ...prev, ...updatedFields };
        });

        setCallLog((prev) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((c) =>
            c.sr === raw.sr ? { ...c, ...updatedFields } : c,
          );
        });
        triggerRefresh();
        return {
          success: true,
          message: "Field updated successfully",
          data: raw,
        };
      } catch (error) {
        console.error("Dynamic update error:", error);
        return {
          success: false,
          message: "Something went wrong",
          error,
        };
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  const startCall = useCallback(
    async (callId) => {
      try {
        const data = await CallLogApi.startCall({
          callLogId: callId,
          createdBy: user?.id,
        });

        const rdStatus = data?.Data?.rd?.[0] || data?.rd?.[0];
        const rd1Status = data?.Data?.rd1?.[0] || data?.rd1?.[0];

        if (
          rd1Status?.stat === 0 ||
          rd1Status?.stat_code === 1001 ||
          rdStatus?.stat === 0 ||
          rdStatus?.stat_code === 1001
        ) {
          const errorMessage =
            rdStatus?.stat_msg || rd1Status?.stat_msg || "You cannot start this call.";
          const errorCode = rdStatus?.stat_code || rd1Status?.stat_code || 500;
          return { success: false, error: new Error(errorMessage), errorCode, msg: rdStatus || rd1Status };
        }

        setCurrentCall(rd1Status || rdStatus || data?.rd1?.[0]);
        triggerRefresh();
        return { success: true, data };
      } catch (err) {
        console.error("Error starting call:", err);
        return { success: false, error: err };
      }
    },
    [user?.id, setCurrentCall, setrefreshList],
  );

  const endCall = useCallback(
    async (callId) => {
      try {
        const data = await await CallLogApi.endCall({
          callLogId: callId,
          createdBy: user?.id,
        });
        // setCurrentCall(data?.rd1?.[0]);
        triggerRefresh();
      } catch (error) {
        console.log(error);
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  const PauseCall = useCallback(
    async (callId) => {
      try {
        const data = await await CallLogApi.pauseCall({
          callLogId: callId,
        });
        triggerRefresh();
      } catch (error) {
        console.log(error);
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  const AcceptQueueCall = useCallback(
    async (callId) => {
      if (!callId) {
        return { success: false, error: new Error("Invalid Call Log ID.") };
      }
      try {
        const data = await CallLogApi.AcceptCall({
          callLogId: callId,
          createdBy: user?.id,
        });
        console.log(data, "Accept Queue Call");
        const status = data?.rd?.[0];
        if (status?.stat === 0 || status?.stat_code === 1001) {
          const errorMessage =
            status?.stat_msg ||
            "CallLogId does not exist or this call has already been accepted.";
          return {
            success: false,
            error: new Error(errorMessage),
            errorCode: status?.stat_code,
          };
        }
        triggerRefresh();
        return { success: true, data };
      } catch (error) {
        console.error("Error accepting queue call:", error);
        return { success: false, error };
      }
    },
    [user?.id, triggerRefresh],
  );

  const ResumeCall = useCallback(
    async (callId) => {
      try {
        const data = await await CallLogApi.resumeCall({
          callLogId: callId,
        });
        triggerRefresh();
      } catch (error) {
        console.log(error);
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  // === FOLLOW-UP CALL METHODS ===

  // Save activeFollowUp to localStorage
  useEffect(() => {
    if (activeFollowUp) {
      localStorage.setItem("active_follow_up", JSON.stringify(activeFollowUp));
    } else {
      localStorage.removeItem("active_follow_up");
    }
  }, [activeFollowUp]);

  const addFollowUpCall = useCallback(
    async (callLogId) => {
      try {
        const data = await CallLogApi.addFollowUpCall({
          callLogId,
          createdBy: user?.id,
        });
        const rdStatus = data?.rd?.[0];
        if (rdStatus?.stat === 0 || rdStatus?.stat_code === 1001) {
          return {
            success: false,
            error: new Error(
              rdStatus?.stat_msg || "Failed to add follow-up call",
            ),
          };
        }

        // Update CurrentCall and main callLog with fresh data from rd1
        const updatedCallData = data?.rd1?.[0];
        if (updatedCallData) {
          setCurrentCall(updatedCallData);
          setCallLog((prev) =>
            Array.isArray(prev)
              ? prev.map((c) =>
                  c.sr === updatedCallData.sr ? updatedCallData : c,
                )
              : prev,
          );
        }

        // Extract followUpCallId from the FollowUpList JSON string
        let followUpCallId = null;
        try {
          const followUpListStr =
            updatedCallData?.FollowUpList || data?.rd1?.[0]?.FollowUpList;
          if (followUpListStr) {
            const followUpList = JSON.parse(followUpListStr);
            if (Array.isArray(followUpList) && followUpList.length > 0) {
              // Find the newest follow-up (highest Id)
              const highestId = Math.max(
                ...followUpList.map((fu) => parseInt(fu.Id, 10) || 0),
              );
              if (highestId > 0) followUpCallId = highestId;
            }
          }
        } catch (e) {
          console.error("Error parsing FollowUpList:", e);
        }

        if (!followUpCallId) {
          return {
            success: false,
            error: new Error("Could not get follow-up call ID from response"),
          };
        }

        const followUp = { followUpCallId, callLogId };
        setActiveFollowUp(followUp);
        triggerRefresh();
        return { success: true, data, followUp };
      } catch (error) {
        console.error("Error adding follow-up call:", error);
        return { success: false, error };
      }
    },
    [user?.id, triggerRefresh, setCurrentCall],
  );

  const startFollowUpCall = useCallback(
    async (followUpCallId, callLogId) => {
      try {
        const data = await CallLogApi.startFollowUpCall({
          followUpCallId,
          callLogId,
          createdBy: user?.id,
        });
        const rdStatus = data?.Data?.rd?.[0] || data?.rd?.[0];
        if (rdStatus?.stat === 0 || rdStatus?.stat_code === 1001) {
          return {
            success: false,
            error: new Error(
              rdStatus?.stat_msg || "Failed to start follow-up call",
            ),
            msg: rdStatus,
          };
        }
        triggerRefresh();
        return { success: true, data };
      } catch (error) {
        console.error("Error starting follow-up call:", error);
        return { success: false, error };
      }
    },
    [user?.id, triggerRefresh],
  );

  const pauseFollowUpCall = useCallback(
    async (followUpCallId, callLogId) => {
      try {
        await CallLogApi.pauseFollowUpCall({ followUpCallId, callLogId });
        triggerRefresh();
      } catch (error) {
        console.error("Error pausing follow-up call:", error);
      }
    },
    [triggerRefresh],
  );

  const resumeFollowUpCall = useCallback(
    async (followUpCallId, callLogId) => {
      try {
        await CallLogApi.resumeFollowUpCall({ followUpCallId, callLogId });
        triggerRefresh();
      } catch (error) {
        console.error("Error resuming follow-up call:", error);
      }
    },
    [triggerRefresh],
  );

  const endFollowUpCall = useCallback(
    async (followUpCallId, callLogId) => {
      try {
        const data = await CallLogApi.endFollowUpCall({
          followUpCallId,
          callLogId,
        });
        const rdStatus = data?.rd?.[0];
        if (rdStatus?.stat === 0 || rdStatus?.stat_code === 1001) {
          return {
            success: false,
            error: new Error(
              rdStatus?.stat_msg?.replace(/"/g, "") ||
                "Failed to end follow-up call",
            ),
          };
        }

        setActiveFollowUp(null);
        triggerRefresh();
        return { success: true, data };
      } catch (error) {
        console.error("Error ending follow-up call:", error);
        return { success: false, error };
      }
    },
    [triggerRefresh],
  );

  const editFollowUpCall = useCallback(
    async ({ callLogId, followUpCallId, empId, statusId, descr }) => {
      try {
        const data = await CallLogApi.editFollowUpCall({
          callLogId,
          followUpCallId,
          empId,
          statusId,
          descr,
        });
        const rdStatus = data?.rd?.[0];
        if (rdStatus?.stat === 0 || rdStatus?.stat_code === 1001) {
          return {
            success: false,
            error: new Error(
              rdStatus?.stat_msg || "Failed to edit follow-up call",
            ),
          };
        }

        // API returns only rd (no rd1), so patch FollowUpList inline on success
        if (rdStatus?.stat === 1) {
          const patchFollowUpList = (list) => {
            let isString = false;
            let parsed = list;
            if (typeof list === "string") {
              isString = true;
              try {
                parsed = JSON.parse(list);
              } catch (e) {
                console.error("Failed to parse FollowUpList string:", e);
                return list;
              }
            }
            if (!Array.isArray(parsed)) return list;

            const updated = parsed.map((fu) => {
              if (
                String(fu.Id) !== String(followUpCallId) &&
                String(fu.FollowUpCallId) !== String(followUpCallId)
              ) {
                return fu;
              }

              // Find status text
              let statusText = undefined;
              if (statusId !== undefined) {
                const statusObj = STATUS_LIST.find(
                  (s) => String(s.value) === String(statusId),
                );
                if (statusObj) statusText = statusObj.label;
              }

              // Find employee text
              let empName = undefined;
              if (empId !== undefined) {
                const empObj = forwardOption.find(
                  (f) => String(f.id?.split(",")?.[1]) === String(empId),
                );
                if (empObj) empName = empObj.person;
              }

              return {
                ...fu,
                ...(descr !== undefined && {
                  Description: descr,
                  Descr: descr,
                }),
                ...(statusId !== undefined && {
                  InternalStatusId: statusId,
                  StatusId: statusId,
                }),
                ...(statusText !== undefined && {
                  InternalStatus: statusText,
                  StatusName: statusText,
                }),
                ...(empId !== undefined && { EmpId: empId }),
                ...(empName !== undefined && {
                  ForwardedEmp: empName,
                  AssignedEmpName: empName,
                  EmpName: empName,
                }),
              };
            });

            return isString ? JSON.stringify(updated) : updated;
          };

          // Patch CurrentCall immediately → instant UI update
          setCurrentCall((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              FollowUpList: patchFollowUpList(prev.FollowUpList),
            };
          });

          // Mirror the patch into the main callLog list
          setCallLog((prev) => {
            if (!Array.isArray(prev)) return prev;
            return prev.map((call) => {
              if (call.sr !== callLogId) return call;
              return {
                ...call,
                FollowUpList: patchFollowUpList(call.FollowUpList),
              };
            });
          });
        }

        triggerRefresh();
        return { success: true, data };
      } catch (error) {
        console.error("Error editing follow-up call:", error);
        return { success: false, error };
      }
    },
    [
      user?.id,
      triggerRefresh,
      setCurrentCall,
      setCallLog,
      STATUS_LIST,
      forwardOption,
    ],
  );

  const ConCurrentCall = useCallback(
    async (callId) => {
      try {
        // const data = await await CallLogApi.ConcurrentCall({
        //   callLogId: callId,
        // })
        // setrefreshList(!refreshList);
      } catch (error) {
        console.log(error);
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  const updateCallLog = useCallback(
    (updateFn) => {
      setCallLog((prev) => {
        const updated = updateFn(prev);
        const current = updated.find((c) => c.id === CurrentCall?.id);
        if (current) setCurrentCall(current);
        return updated;
      });
    },
    [CurrentCall, setCallLog, setCurrentCall],
  );

  const addComment = useCallback(
    async (callId, comment, img, createdBy, isClient = 0) => {
      try {
        const data = await CallLogApi.addCallComments(
          callId,
          comment,
          img,
          createdBy,
          isClient,
        );
        console.log(data, "data");
        triggerRefresh();
      } catch (error) {}
    },
    [updateCallLog, currentTime],
  );

  const queue = useMemo(() => {
    return [...callLog]
      .filter((val) => !val?.receivedBy)
      ?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
  }, [callLog]);

  const forwardedCalls = useMemo(() => {
    const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`
      .trim()
      .toLowerCase();
    const designation = user?.designation?.toLowerCase();

    return [...callLog]
      .filter((val) => {
        const assignedName = val?.AssignedEmpName?.toLowerCase();
        const deptName = val?.DeptName?.toLowerCase();
        const isForwarded = !!assignedName && !!deptName;

        const isAssignedToCurrentUser =
          assignedName === fullName && deptName === designation;

        const isNotClosed = !val?.callClosed;

        return isForwarded && isAssignedToCurrentUser && isNotClosed;
      })
      .sort((a, b) => new Date(b?.date) - new Date(a?.date));
  }, [callLog]);

  const EditCallDuration = useCallback(
    async (callId, startDateTime, endDateTime) => {
      try {
        const data = await CallLogApi.EditCallDuration({
          callLogId: callId,
          StartDateTime: startDateTime,
          EndDateTime: endDateTime,
        });
        triggerRefresh();
        return data;
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  const getTaskList = useCallback(async (TaskId) => {
    try {
      const res = await ITaskApi.getCallLogList({
        taskId: TaskId,
      });
      const isSuccess = res?.Status === "200";

      if (!isSuccess) {
        console.error("getTaskList failed:", res);
        return {
          success: false,
          message: res?.Message || "Failed to fetch tasks",
        };
      }

      return {
        success: true,
        message: res?.Message || "Success",
        data: res?.Data || {},
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }, []);

  const saveCallLogTask = useCallback(
    async (taskData) => {
      try {
        const res = await ITaskApi.saveCallLogTask({
          taskData,
        });

        const isSuccess =
          res?.Status === "200" && res?.Data?.rd?.[0]?.stat === 1;

        if (!isSuccess) {
          console.error("saveCallLogTask failed:", res);
          return {
            success: false,
            message: res?.Message || "Failed to fetch tasks",
          };
        }
        triggerRefresh();
        return {
          success: true,
          message: res?.Message || "Success",
          data: res?.Data || {},
        };
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    [triggerRefresh, callLog, setCallLog],
  );

  useEffect(() => {
    const channel = new BroadcastChannel("notification_channel");
    channel.onmessage = (event) => {
      if (event?.data?.type !== "NOTIFICATION_CLICK") return;
      const payload = event.data.payload;
      if (!payload || payload.group !== "CALL") return;
      // setCurrentCall(payload);
      navigate("/");
    };
    return () => channel.close();
  }, []);

  // Add Call Events
  useSocketEvent("AddCall", (data) => {
    if (!isValidCallPayload(data)) return;
    if (areUpdatesBlocked.current) {
      updateQueue.current.push({ type: "ADD", data });
      return;
    }
    setCallLog((prev) => {
      if (data?.sr && prev.some((c) => c?.sr === data?.sr)) return prev;
      return [data, ...prev];
    });
    notify(data, "ADD_CALL");
  });

  // Accept Call Events
  useSocketEvent("AcceptCall", (data) => {
    if (!isValidCallPayload(data)) return;
    if (areUpdatesBlocked.current) {
      updateQueue.current.push({ type: "UPDATE", data });
      return;
    }
    setCallLog((prev) => {
      return prev.map((c) => (c.sr === data.sr ? { ...c, ...data } : c));
    });
    notify(data, "ACCEPT_CALL");
  });

  // Forwarded Call Events
  useSocketEvent("ForwardedCall", (data) => {
    if (!isValidCallPayload(data)) return;
    if (areUpdatesBlocked.current) {
      updateQueue.current.push({ type: "UPDATE", data }); // Treat as update or add based on logic
      return;
    }
    setCallLog((prev) => {
      const exists = prev.some((c) => c.sr === data.sr);
      return exists
        ? prev.map((c) => (c.sr === data.sr ? { ...c, ...data } : c))
        : [data, ...prev];
    });
    notify(data, "FORWARDED_CALL", user);
  });

  const contextValue = useMemo(
    () => ({
      queue,
      forwardedCalls,
      addComment,
      callLog,
      setCallLog,
      addCall,
      editCall,
      startCall,
      endCall,
      CurrentCall,
      setCurrentCall,
      masterData,
      EMPLOYEE_LIST,
      COMPANY_LIST,
      APPNAME_LIST,
      companyOptions,
      departmentsNames,
      forwardOption,
      ForwardCall,
      STATUS_LIST,
      ESTATUS_LIST,
      PRIORITY_LIST,
      UpdateStatusAndPriority,
      INTERNAL_STATUS_LIST,
      INTERNAL_ESTATUS_LIST,
      PauseCall,
      ResumeCall,
      AcceptQueueCall,
      ConCurrentCall,
      isFilterActiveRef,
      COMPANY_INFO_MASTER,
      EditCallDuration,
      CALL_TYPE_MASTER,
      getTaskList,
      saveCallLogTask,
      UpdateCall,
      setUpdatesBlocked,
      // Follow-up call
      activeFollowUp,
      setActiveFollowUp,
      addFollowUpCall,
      startFollowUpCall,
      pauseFollowUpCall,
      resumeFollowUpCall,
      endFollowUpCall,
      editFollowUpCall,
      CALLFORWARD_REASON_MASTER,
    }),
    [queue, callLog, CurrentCall, masterData, activeFollowUp],
  );
  return (
    <CallLogContext.Provider value={contextValue}>
      {props.children}
    </CallLogContext.Provider>
  );
}

export function useCallLog() {
  if (!useContext(CallLogContext)) {
    throw new Error("useCallLog must be used within a CallLogProvider");
  }
  return useContext(CallLogContext);
}
