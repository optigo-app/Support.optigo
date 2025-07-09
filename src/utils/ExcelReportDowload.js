import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FormatDateIST } from "../components/Delivery&Training/utils/helpers";
import { DataParser } from "./ticketUtils";

/**
 * Downloads the given tickets as an Excel report.
 *
 * @param {Ticket[]} data - The tickets to be exported.
 */

const ExcelReportDowload = (data) => {
	if (!data || data.length === 0) return;

	const maxCommentCount = Math.max(
		...data.map((ticket) => {
			const comments = DataParser(ticket?.comments).data;
			return comments.length;
		}),
	);

	const exportData = data.map((ticket) => {
		const comments = DataParser(ticket?.comments).data;

		const commentFields = {};
		comments.forEach((comment, idx) => {
			const num = idx + 1;

			// Format comment as structured string or JSON-style
			commentFields[`Comment ${num}`] = JSON.stringify({
				message: comment?.message || "",
				time: comment?.time || "",
				by: comment?.Name || "",
			});
		});

		// Fill empty comments to match maxCommentCount
		for (let i = comments.length + 1; i <= maxCommentCount; i++) {
			commentFields[`Comment ${i}`] = "";
		}

		return {
			TicketNo: ticket.TicketNo,
			ProjectCode: ticket.companyname || "-",
			UserName: ticket.username || "-",
			Subject: ticket.subject,
			Category: ticket.category,
			Status: ticket.Status,
			Priority: ticket.Priority || "-",
			FollowUp: ticket.FollowUp || "-",
			CreatedOn: FormatDateIST(ticket?.CreatedOn, "dd-mm-yyyy"),
			UpdatedAt: FormatDateIST(ticket?.UpdatedAt, "dd-mm-yyyy"),
			SendMail: ticket.sendMail ? "Yes" : "No",
			Starred: ticket.star ? "Yes" : "No",
			Tags: ticket?.keywords?.split(",")?.join(", "),
			Instruction: ticket.instruction || "-",
			CommentsCount: comments.length || 0,
			...commentFields,
		};
	});

	const worksheet = XLSX.utils.json_to_sheet(exportData);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

	const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
	const downloadedFiledata = new Blob([excelBuffer], {
		type: "application/octet-stream",
	});

	saveAs(downloadedFiledata, `Tickets_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export default ExcelReportDowload;

export const ExcelReportCallog = (data) => {
	if (!data || data.length === 0) return;

	const exportData = data?.map((log, i) => ({
		"Sr No": i + 1,
		Date: new Date(log.date).toLocaleDateString(),
		Company: log.company,
		"Call By": log.callBy,
		"App Name": log.appname || "N/A",
		Description: log.description,
		"Received By": log.receivedBy,
		Time: log.time,
		Department: log.DeptName,
		"Assigned To": log.AssignedEmpName,
		Status: log.status,
		"Employee Status": log.Estatus,
		Feedback: log.feedback || "",
		Rating: log.rating || 0,
		"Topic Raised By": log.topicRaisedBy || "",
		Priority: log.priority,
		"Call Start": log.callStart,
		"Call Closed": log.callClosed,
		"Call Duration": log.CallDuration,
		"Call Details": log.callDetails || "",
		"Ticket No": log.ticket || "",
	}));

	const worksheet = XLSX.utils.json_to_sheet(exportData);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Call Logs");

	const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
	const downloadedFiledata = new Blob([excelBuffer], {
		type: "application/octet-stream",
	});

	saveAs(downloadedFiledata, `CallLog_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
