import React, { useState, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useAuth } from "./UseAuth";
import TicketApi from "../apis/TicketApiController";
import { useSocketEvent } from "../hooks/useSocketListener";
import { notify } from "../libs/NOTIFICATION_TEMPLATES";
import { useNavigate } from "react-router-dom";

export const TicketContext = React.createContext();

export const TicketProvider = ({ children }) => {
	const [tickets, setTickets] = useState([]);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [error, setError] = useState(null);
	const [TicketMaster, setTicketMaster] = useState(null);
	const [lastUpdatedTicketNo, setLastUpdatedTicketNo] = useState(sessionStorage.getItem("LastUpdatedticket") || null);
	const [refreshComment, setRefreshComment] = useState(false);
	const navigate = useNavigate();
	const notificationRef = useRef(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [isTicketDirty, setIsTicketDirty] = useState(false);

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
			if (lastUpdatedTicketNo) {
				const updatedTicket = response.rd.find((ticket) => ticket?.TicketNo === lastUpdatedTicketNo);
				if (updatedTicket) {
					setSelectedTicket(updatedTicket);
				}
				setLastUpdatedTicketNo(null);
				sessionStorage.removeItem("LastUpdatedticket");
			} else if (selectedTicket) {
				const currentTicket = response.rd.find((ticket) => ticket?.TicketNo === selectedTicket.TicketNo);

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
	}, [lastUpdatedTicketNo, selectedTicket]);


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
					description: ticketData?.instruction, //
					projectId: ticketData?.projectCode, //
					subject: ticketData?.subject, //
					filePath: ticketData?.attachment !== null ? ticketData?.attachment : "",
					callLogId: ticketData?.CallId || "",
				});
				// if (res?.rd1[0]?.stat == 1 && res?.rd1[0]?.stat_code == 1000) {
				// 	await TicketApi.addComment({
				// 		createdBy: user?.id,
				// 		comment: ticketData?.instruction ?? "",
				// 		filePath: ticketData?.attachment !== null ? ticketData?.attachment : "",
				// 		callLogId: "",
				// 		isOfficeUseOnly: 0,
				// 		ticketNo: res?.rd1[0]?.TicketNo,
				// 		Role: 1,
				// 	});
				// }

				setRefresh(!refresh);
			} catch (error) {
				console.log("Error adding ticket:", error);
			}
		},
		[tickets, setTickets],
	);

	const updateTicket = useCallback(
		async (TicketId, updatedFields) => {
			setLoading(true);
			try {
				const keywordsPayload = updatedFields?.tags !== undefined ? updatedFields?.tags : updatedFields?.keywords;
				if (keywordsPayload !== undefined) {
					setSelectedTicket((prev) => {
						if (!prev || prev.TicketNo !== TicketId) return prev;
						return { ...prev, Keywords: keywordsPayload, keywords: keywordsPayload };
					});
					setTickets((prevTickets) =>
						prevTickets.map((t) => (t?.TicketNo === TicketId ? { ...t, Keywords: keywordsPayload, keywords: keywordsPayload } : t))
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
		[tickets, setTickets, selectedTicket, setSelectedTicket, user?.id],
	);

	// Api Done ✅
	const AddComment = useCallback(
		async (commentData) => {
			try {
				const res = await TicketApi.addComment({
					createdBy: user?.id,
					comment: commentData?.message ?? "",
					filePath: commentData?.attachment?.preview !== null ? commentData?.attachment?.preview : "https://jeremyqho.com/static/3/bug-process.jpeg",
					callLogId: commentData?.CallId || "",
					isOfficeUseOnly: commentData?.isOfficeUseOnly === true ? 1 : 0,
					ticketNo: commentData?.TicketNo,
					Role: commentData?.Role,
				});
				setLastUpdatedTicketNo(commentData?.TicketNo);
				sessionStorage.setItem("LastUpdatedticket", commentData?.TicketNo);
				setRefresh(!refresh);
			} catch (error) {
				console.log("Error adding comment:", error);
			}
		},
		[tickets, setTickets, selectedTicket],
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
				setLastUpdatedTicketNo(TicketNo);
				sessionStorage.setItem("LastUpdatedticket", TicketNo);
				console.log(res, "Ticket closed successfully!");

				// Optimistic update instead of expensive full refetch
				const newStatus = openTicket ? "Open" : "Closed";
				setTickets((prev) =>
					prev.map((t) => (t.TicketNo === TicketNo ? { ...t, Status: newStatus } : t))
				);
				setSelectedTicket((prev) =>
					prev?.TicketNo === TicketNo ? { ...prev, Status: newStatus } : prev
				);
			} catch (error) {
				console.log("Error adding comment:", error);
			}
		},
		[tickets, setTickets, selectedTicket],
	);

	const EditComment = useCallback(async (commentmsg, commentId, filePath, isOfficeUseOnly, ticketNo) => {
		try {
			const res = await TicketApi.EditComment({
				comment: commentmsg,
				commentId,
				createdBy: user?.id,
				filePath,
				isOfficeUseOnly: isOfficeUseOnly === true ? 1 : 0,
				ticketNo
			});
			const status = res?.rd[0]?.stat_msg;
			if (status === "Comment update successfully") {
				setRefresh(!refresh);
			}
			return status;
		} catch (error) {
			console.log("Error adding comment:", error);
		}
	}, [tickets, setTickets, selectedTicket])


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
			}
		};
		return () => channel.close();
	}, []);




	// 🔹 SOCKET EVENT HANDLERS  ✅
	useSocketEvent("CreateTicket", (data) => {
		if (data?.CreatedBy == user?.fullName) return;
		notify(data, "CREATE_TICKET");
		setTickets((prev) => {
			const exists = prev.some((t) => t.TicketNo === data.TicketNo);
			if (exists) return prev;
			return [data, ...prev];
		});
	});

	useSocketEvent("TicketComment", (data) => {
		notify(data, "TICKET_COMMENT");
		setTickets((prev) =>
			prev.map((t) =>
				t.TicketNo === data?.TicketNo
					? { ...t, ...data }
					: t
			)
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

		setTickets((prev) =>
			prev.map((t) =>
				t.TicketNo === data.TicketNo
					? { ...t, ...data }
					: t
			)
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



	return (
		<TicketContext.Provider
			value={{
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
				setIsTicketDirty
			}}
		>
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
