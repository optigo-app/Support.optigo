import React, { useState, useCallback, useContext, useEffect } from "react";
import { useAuth } from "./UseAuth";
import TicketApi from "../apis/TicketApiController";

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
				if (res?.rd1[0]?.stat == 1 && res?.rd1[0]?.stat_code == 1000) {
					await TicketApi.addComment({
						createdBy: user?.id,
						comment: ticketData?.instruction ?? "",
						filePath: ticketData?.attachment !== null ? ticketData?.attachment : "",
						callLogId: "",
						isOfficeUseOnly: 0,
						ticketNo: res?.rd1[0]?.TicketNo,
						Role: 1,
					});
				}

				setRefresh(!refresh);
			} catch (error) {
				console.log("Error adding ticket:", error);
			}
		},
		[tickets, setTickets],
	);

	// Api Done ✅
	const updateTicket = useCallback(
		async (TicketId, updatedFields) => {
			setLoading(true);
			try {
				const res = await TicketApi.updateTicket({
					ticketNo: TicketId,
					statusId: updatedFields?.Status,
					appId: updatedFields?.appname,
					cateId: updatedFields?.category,
					priorityId: updatedFields?.Priority,
					followUp1: updatedFields?.FollowUp,
					keywords: updatedFields?.tags,
					sendEmail: updatedFields?.sendMail === true ? "1" : "0",
					promiseDate: updatedFields?.PromiseDate,
					createdBy: user?.id,
					suggested: updatedFields?.suggested,
					star: updatedFields?.Star,
					mainSubject: updatedFields?.MainSubject,
				});
				setLastUpdatedTicketNo(TicketId);
				sessionStorage.setItem("LastUpdatedticket", TicketId);
				setRefresh(!refresh);
				console.log("Ticket Added in Suggested List successfully!");
			} catch (error) {
				console.log("Error updating ticket:", error);
			}
		},
		[tickets, setTickets],
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
				console.log(res, "Comment added successfully!");
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
				setRefresh((prev) => !prev);
			} catch (error) {
				console.log("Error adding comment:", error);
			}
		},
		[tickets, setTickets, selectedTicket],
	);

	return (
		<TicketContext.Provider
			value={{
				tickets,
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
