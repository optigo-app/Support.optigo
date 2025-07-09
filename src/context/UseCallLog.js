import { createContext, useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import CallLogApi from "../apis/CallLogApiController";
import { useAuth } from "./UseAuth";

const CallLogContext = createContext(null);

export function CallLogProvider(props) {
	const { user } = useAuth();
	const [callLog, setCallLog] = useState([]);
	const [CurrentCall, setCurrentCall] = useState(null);
	const currentTime = format(new Date(), "hh:mm a");
	const [masterData, setMasterData] = useState(() => {
		const stored = sessionStorage.getItem("masterData");
		return stored ? JSON.parse(stored) : { master: null, employees: null };
	});
	const isFilterActiveRef = useRef(false); // <- shared mutable ref
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
	const INTERNAL_STATUS_LIST = "INTERNAL_STATUS";
	const INTERNAL_ESTATUS_LIST = "INTERNAL_ESTATUS";
	const location = window.location;

	const companyOptions =
		COMPANY_LIST.map((option) => ({
			label: option?.ProjectCode,
			value: option?.ProjectID,
		})) || [];

	const departmentsNames = (EMPLOYEE_LIST && Object.groupBy?.(EMPLOYEE_LIST, (emp) => emp?.designation)) || {};

	const forwardOption = Object.entries(departmentsNames).flatMap(([designation, people]) =>
		people.map((emp) => ({
			designation,
			person: emp?.user,
			id: `${emp?.DesignaitonId},${emp?.userid}`,
		})),
	);

	const [refreshList, setrefreshList] = useState(false);

	useEffect(() => {
		const GetMasterData = async () => {
			try {
				const [master, employees] = await Promise.all([CallLogApi.getMasterData(), CallLogApi.getEmployeeMasterD()]);
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
				setCallLog(data?.rd);
			} catch (error) {
				console.log(error);
			}
		};
		GetAllCallLogs();
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
				});
				const newCall = data?.rd1?.[0];
				setrefreshList(!refreshList);
				if (!isConcurrent) {
					setCurrentCall(newCall);
				}
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
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
				);
				// const updatedCall = data?.rd1?.[0];
				// setCurrentCall(updatedCall);
				setrefreshList(!refreshList);
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
	);

	const UpdateStatusAndPriority = useCallback(
		async (callId, updatedFields, type) => {
			let data;
			try {
				if (INTERNAL_STATUS_LIST == type) {
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
				setrefreshList(!refreshList);
				console.log(data, type);
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
	);

	// Call Forward API
	const ForwardCall = useCallback(
		async (callId, updatedFields) => {
			try {
				const data = await CallLogApi.forwardCall({
					callLogId: callId,
					...updatedFields,
				});
				const updatedCall = data?.rd1?.[0];
				setCurrentCall(updatedCall);
				setrefreshList(!refreshList);
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
	);
	const startCall = useCallback(
		async (callId) => {
			try {
				const data = await CallLogApi.startCall({
					callLogId: callId,
					createdBy: user?.id,
				});

				const rdStatus = data?.rd?.[0];
				const rd1Status = data?.rd1?.[0];

				if (rd1Status?.stat === 0 || rd1Status?.stat_code === 1001 || rdStatus?.stat === 0 || rdStatus?.stat_code === 1001) {
					const errorMessage = rdStatus?.stat_msg || rd1Status?.stat_msg || "Unknown error.";
					const errorCode = rdStatus?.stat_code || rd1Status?.stat_code || 500;
					return { success: false, error: new Error(errorMessage), errorCode };
				}

				setCurrentCall(data?.rd1?.[0]);
				setrefreshList((prev) => !prev);
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
				setrefreshList(!refreshList);
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
	);

	const PauseCall = useCallback(
		async (callId) => {
			try {
				const data = await await CallLogApi.pauseCall({
					callLogId: callId,
				});
				setrefreshList(!refreshList);
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
	);

	const AcceptQueueCall = useCallback(
		async (callId) => {
			try {
				const data = await await CallLogApi.AcceptCall({
					callLogId: callId,
					createdBy: user?.id,
				});
				console.log(data, "Accept Queue Call");
				setrefreshList(!refreshList);
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
	);

	const ResumeCall = useCallback(
		async (callId) => {
			try {
				const data = await await CallLogApi.resumeCall({
					callLogId: callId,
				});
				setrefreshList(!refreshList);
			} catch (error) {
				console.log(error);
			}
		},
		[callLog, setCallLog],
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
		[callLog, setCallLog],
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
		async (callId, comment, img, createdBy) => {
			try {
				const data = await CallLogApi.addCallComments(callId, comment, img, createdBy);
				console.log(data, "data");
				setrefreshList(!refreshList);
			} catch (error) {}
		},
		[updateCallLog, currentTime],
	);

	const queue = useMemo(() => {
		return [...callLog].filter((val) => !val?.receivedBy)?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
	}, [callLog]);

	const forwardedCalls = useMemo(() => {
		const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim().toLowerCase();
		const designation = user?.designation?.toLowerCase();

		return [...callLog]
			.filter((val) => {
				const assignedName = val?.AssignedEmpName?.toLowerCase();
				const deptName = val?.DeptName?.toLowerCase();
				const isForwarded = !!assignedName && !!deptName;

				const isAssignedToCurrentUser = assignedName === fullName && deptName === designation;

				const isNotClosed = !val?.callClosed;

				return isForwarded && isAssignedToCurrentUser && isNotClosed;
			})
			.sort((a, b) => new Date(b?.date) - new Date(a?.date));
	}, [callLog]);

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
		}),
		[queue, callLog, CurrentCall, masterData],
	);
	return <CallLogContext.Provider value={contextValue}>{props.children}</CallLogContext.Provider>;
}

export function useCallLog() {
	if (!useContext(CallLogContext)) {
		throw new Error("useCallLog must be used within a CallLogProvider");
	}
	return useContext(CallLogContext);
}
