import { Phone as PhoneIcon, Star as StarIcon, Warning as AlertTriangleIcon, CheckCircle as CheckCircleIcon, Message as MessageSquareIcon, Description as FileTextIcon } from "@mui/icons-material";
import { CalendarIcon, MessageCircleIcon, TrendingUpIcon, UserCheckIcon } from "lucide-react";

export const generateDynamicTimelineEvents = (callData) => {
	const events = [];

	const addEvent = (time, title, description, icon, status, dependencies = []) => {
		if (!time || dependencies.some((dep) => !dep)) return;

		events.push({ time, title, description, icon, status });
	};

	const callStart = callData.callStart || "N/A";
	const callEnd = callData.callEnd || "N/A";
	const company = callData.company || "Unknown Company";
	const callBy = callData.callBy || "Unknown";
	const receivedBy = callData.receivedBy || "Unknown";
	const topic = callData.topic || "General Inquiry";
	const topicRaisedBy = callData.topicRaisedBy || "Unknown";
	const callDetails = callData.callDetails || null;
	const callAnalysis = callData.callAnalysis || null;
	const callClosed = callData.callClosed || "No";
	const feedback = callData.feedback || "No Feedback";
	const rating = callData.rating || 0;

	addEvent(callStart, "Call Initiated", `Call started with ${company} by ${callBy}.`, <PhoneIcon />, "initiated");

	addEvent(callData.time, "Call Received", `Call picked up by ${receivedBy}.`, <UserCheckIcon />, "received", [callStart]);

	addEvent(topic !== "General Inquiry" ? "10:05 AM" : null, "Discussion Started", `Topic: ${topic} raised by ${topicRaisedBy}.`, <MessageSquareIcon />, "in-progress", [callStart]);

	addEvent(callDetails ? "10:20 AM" : null, "Information Shared", callDetails, <FileTextIcon />, "in-progress", [topic]);

	addEvent(callAnalysis ? "10:45 AM" : null, "Customer Interest Noted", callAnalysis, <TrendingUpIcon />, "analysis", [callDetails]);

	addEvent(callClosed === "No" ? "11:00 AM" : null, "Follow-Up Recommended", "Suggested scheduling a product demo next week.", <CalendarIcon />, "follow-up", [callAnalysis]);

	addEvent(callClosed === "No" ? "11:55 PM" : null, "Final Discussion", "Addressed last concerns, provided additional clarifications.", <MessageCircleIcon />, "final-talk", [callAnalysis]);

	addEvent(callEnd, "Call Ended", callClosed === "Yes" ? "Call closed successfully." : "Call remains open for follow-up.", callClosed === "Yes" ? <CheckCircleIcon /> : <AlertTriangleIcon />, callClosed === "Yes" ? "completed" : "pending", [callDetails]);

	addEvent(feedback !== "No Feedback" ? "12:05 AM" : null, "Call Summary & Feedback", `Feedback: ${feedback}, Rating: ${rating}/5.`, <StarIcon />, "summary", [callEnd]);

	return events;
};
