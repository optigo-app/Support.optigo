import { isUpcoming } from "./helpers";


export const calculateTotalTrainingTime = (data) => {
	if (!Array.isArray(data)) return 0;

	const validData = data.filter((training) => training?.Status !== "Cancelled" && training?.DurationTime > 0);

	const totalDuration = validData.reduce((total, training) => {
		return total + (parseFloat(training.DurationTime) || 0);
	}, 0);

	return parseFloat(totalDuration.toFixed(2));
};

export const calculateAverageAttendees = (data) => {
	const validData = data?.filter((training) => training?.Status !== "Cancelled");

	const totalAttendees = validData.reduce((total, training) => {
		const att = training?.Attendees?.split(",").length || 0;
		return total + att;
	}, 0);

	return validData.length ? totalAttendees / validData.length : 0;
};

export const calculateTrainingTypesDistribution = (data) => {
	const validData = data?.filter((training) => training?.Status !== "Cancelled" && training?.TrainingType?.trim() !== "");

	const distribution = validData.reduce((acc, training) => {
		const type = training.TrainingType.trim();
		acc[type] = (acc[type] || 0) + 1;
		return acc;
	}, {});

	return distribution;
};

export const calculateTrainingModeDistribution = (data) => {
	const validData = data?.filter((training) => training?.Status !== "Cancelled" && training?.TrainingMode?.trim() !== "");

	const distribution = validData.reduce((acc, training) => {
		const mode = training.TrainingMode.trim();
		acc[mode] = (acc[mode] || 0) + 1;
		return acc;
	}, {});

	return distribution;
};

export function extractRecordingLink(htmlString) {
	const cleanHtml = htmlString.trim().replace(/^"|"$/g, "");

	const paragraphs = cleanHtml.split("<p>");
	for (const p of paragraphs) {
		const urlMatch = p.match(/https?:\/\/[^\s"'>]+/i);
		if (urlMatch) {
			return urlMatch[0];
		}
	}
	return null;
}

export function getTrainingDuration(startTime, endTime) {
	if (!startTime || !endTime) return "Invalid time";

	const [startHour, startMinute] = startTime.split(":").map(Number);
	const [endHour, endMinute] = endTime.split(":").map(Number);

	const startDate = new Date(0, 0, 0, startHour, startMinute);
	const endDate = new Date(0, 0, 0, endHour, endMinute);

	let diffMs = endDate - startDate;

	// If end is before start (crossed midnight), add 24h
	if (diffMs < 0) {
		diffMs += 24 * 60 * 60 * 1000;
	}

	const diffMins = Math.floor(diffMs / 60000);
	const hours = Math.floor(diffMins / 60);
	const minutes = diffMins % 60;

	return `${hours}h ${minutes}m`;
}



export const filterDeliveryData = (tickets, filters = null) => {
	if (!Array.isArray(tickets)) return [];
	if (!tickets || tickets.length === 0) return [];
	if (!filters) return tickets;

	const { currentStatus = "", search = "", approval = "", projectCode = null, topicType = "", serviceType = [], onDemandOption = "", paymentMethod = [], paymentStatus = [], isFavorite = false, date = {}, Tabs = -1, deliveryStatus = "" } = filters;

	const hasActiveFilters = Boolean(
		(currentStatus && currentStatus.length > 0) || search || approval || projectCode || topicType || (serviceType && serviceType.length > 0) || onDemandOption || (paymentMethod && paymentMethod.length > 0) || (paymentStatus && paymentStatus.length > 0) || isFavorite || date?.startDate || date?.endDate || Tabs !== -1 || deliveryStatus,
	);

	if (!hasActiveFilters) return tickets;

	const matchesMultiSelect = (filterArray, ticketValue) => {
		if (!filterArray || filterArray.length === 0) return true;
		const normalizedTicketValue = ticketValue?.toLowerCase();
		return filterArray.some((option) => option?.toLowerCase() === normalizedTicketValue);
	};

	// Improved date validation function
	const isValidDate = (dateStr) => {
		if (!dateStr) return false;
		const placeholderDates = ['1900-01-01', '1900-01-01T00:00:00.000Z'];
		if (placeholderDates.some(placeholder => dateStr.includes(placeholder))) {
			return false;
		}

		const date = new Date(dateStr);
		return !isNaN(date.getTime()) && date.getFullYear() > 1900;
	};

	// Improved date extraction function
	const getFilterDate = (ticket, dateStatus) => {
		if (!ticket) return null;
		let dateStr = null;

		if (!dateStatus) {
			// Default fallback to first available valid date
			const dateFields = ["Date", "RequestDate", "UpdatedAt", "ConfirmationDate", "TicketDate", "SampleApprovalDate", "DeliveryDate"];

			for (const field of dateFields) {
				if (ticket[field] && isValidDate(ticket[field])) {
					dateStr = ticket[field];
					break;
				}
			}
		} else {
			// Normalize the status string for better matching
			const normalizedStatus = dateStatus
				?.toString()
				?.toLowerCase()
				?.trim()
				?.replace(/\s+/g, "_")
				?.replace(/[^a-z_]/g, "") || "created";

			console.log("🚀 ~ Normalized status:", normalizedStatus);

			// More comprehensive status mapping
			const statusFieldMap = {
				"ticket": "TicketDate",
				"ticket_date": "TicketDate",
				"requested": "RequestDate",
				"requested_date": "RequestDate",
				"request": "RequestDate",
				"request_date": "RequestDate",
				"updated": "UpdatedAt",
				"updated_date": "UpdatedAt",
				"updated_at": "UpdatedAt",
				"confirmed": "ConfirmationDate",
				"confirmed_date": "ConfirmationDate",
				"confirmation": "ConfirmationDate",
				"confirmation_date": "ConfirmationDate",
				"created": "Date",
				"created_date": "Date",
				"approve": "ApproveDate",
				"approve_date": "ApproveDate",
				"approval_date": "ApproveDate",
				"sample_approve": "SampleApprovalDate",
				"sample_approve_date": "SampleApprovalDate",
				"sample_approval": "SampleApprovalDate",
				"sample_approval_date": "SampleApprovalDate",
				"delivery": "DeliveryDate",
				"delivery_date": "DeliveryDate"
			};

			// Try exact match first
			const fieldName = statusFieldMap[normalizedStatus];
			if (fieldName && ticket[fieldName]) {
				dateStr = ticket[fieldName];
			} else {
				// Fallback: try to find field containing the status keyword
				const matchingField = Object.keys(ticket).find(key => {
					const keyLower = key.toLowerCase();
					return keyLower.includes(normalizedStatus) ||
						normalizedStatus.includes(keyLower.replace(/date$/i, ''));
				});

				if (matchingField && ticket[matchingField]) {
					dateStr = ticket[matchingField];
				}
			}
		}

		// Validate the extracted date
		if (!dateStr || !isValidDate(dateStr)) {
			console.warn(`No valid date found for ticket ${ticket.TicketNo} with status: ${dateStatus}`);
			return null;
		}

		try {
			const parsedDate = new Date(dateStr);
			return parsedDate;
		} catch (error) {
			console.warn("Date parsing error:", error, "for dateStr:", dateStr);
			return null;
		}
	};

	// Improved date normalization - handles timezone issues
	const normalizeToLocalDate = (date) => {
		if (!date) return null;

		// Create a new date in local timezone, ignoring time components
		const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		return normalized;
	};

	// More robust same day comparison
	const isSameDay = (date1, date2) => {
		if (!date1 || !date2) return false;

		const d1 = normalizeToLocalDate(date1);
		const d2 = normalizeToLocalDate(date2);

		return d1.getTime() === d2.getTime();
	};

	// Improved search function (keeping your existing implementation)
	const matchesSearch = (ticket, searchQuery) => {
		if (!searchQuery) return true;

		try {
			const searchLower = searchQuery.toLowerCase();
			const excludeFields = ["Date", "TicketDate", "RequestDate", "UpdatedAt", "ConfirmationDate", "time", "startTime", "endTime", "CodeUploadTime", "SentMail"];

			const searchInObject = (obj, excludeKeys = []) => {
				if (!obj || typeof obj !== "object") return false;

				for (const [key, value] of Object.entries(obj)) {
					if (excludeKeys.includes(key)) continue;

					if (typeof value === "string") {
						if (value.toLowerCase().includes(searchLower)) {
							return true;
						}
					} else if (typeof value === "number") {
						if (value.toString().includes(searchQuery)) {
							return true;
						}
					} else if (Array.isArray(value)) {
						for (const item of value) {
							if (typeof item === "object" && item !== null) {
								if (searchInObject(item)) return true;
							} else if (typeof item === "string") {
								if (item.toLowerCase().includes(searchLower)) return true;
							}
						}
					} else if (typeof value === "object" && value !== null) {
						if (searchInObject(value)) return true;
					}
				}
				return false;
			};

			return searchInObject(ticket, excludeFields);
		} catch (error) {
			console.warn("Error in search function:", error);
			return false;
		}
	};

	const MatchedCompany = (ticket, projectCode) => {
		if (!projectCode) return true;
		const companyCode = ticket?.ClientCode;
		return companyCode?.toLowerCase() === projectCode?.toLowerCase();
	};

	return tickets?.filter((ticket) => {
		try {
			const matchesSearchQuery = matchesSearch(ticket, search);
			const matchesApproval = !approval || ticket?.ApprovedStatus?.toLowerCase() === approval?.toLowerCase();
			const matchesDeliveryStatus = !deliveryStatus || ticket?.Status?.toLowerCase() === deliveryStatus?.toLowerCase();
			const matchesProjectCode = MatchedCompany(ticket, projectCode);
			const matchesTopicTypeFilter = !topicType || ticket?.TopicType?.toLowerCase() === topicType?.toLowerCase();
			const matchesServiceTypeFilter = matchesMultiSelect(serviceType, ticket?.ServiceType);
			const matchesCurrentStatusFilter = matchesMultiSelect(currentStatus, ticket?.CurrentStatus);
			const Demand = onDemandOption;
			const matchesOnDemand = !onDemandOption || ticket?.OnDemand?.toLowerCase() === Demand?.toLowerCase();
			const matchesPaymentMethodFilter = matchesMultiSelect(paymentMethod, ticket?.PaymentMethod);
			const matchesPaymentStatusFilter = matchesMultiSelect(paymentStatus, ticket?.PaymentStatus);
			const matchesFavorite = !isFavorite || ticket?.isFavorite === true;

			// Significantly improved date range matching
			const matchesDateRange = (() => {
				const { startDate, endDate, status } = date || {};

				// If no date filter is applied, return true
				if (!startDate && !endDate) return true;

				// Get the ticket date based on the specified status
				const ticketDate = getFilterDate(ticket, status);

				// If no valid ticket date found, exclude this ticket
				if (!ticketDate) {
					console.warn(`❌ No valid date found for ticket: ${ticket.TicketNo} with status: ${status}`);
					return false;
				}

				let start = null;
				let end = null;

				// Parse filter dates
				try {
					if (startDate) {
						start = new Date(startDate);
						if (isNaN(start.getTime())) {
							console.warn("Invalid start date:", startDate);
							return false;
						}
					}

					if (endDate) {
						end = new Date(endDate);
						if (isNaN(end.getTime())) {
							console.warn("Invalid end date:", endDate);
							return false;
						}
					}
				} catch (error) {
					console.warn("Error parsing filter dates:", error);
					return false;
				}

				// Normalize all dates to local date (ignore time)
				const normalizedTicketDate = normalizeToLocalDate(ticketDate);
				const normalizedStart = start ? normalizeToLocalDate(start) : null;
				const normalizedEnd = end ? normalizeToLocalDate(end) : null;



				// Handle single date selection (start and end are the same)
				if (normalizedStart && normalizedEnd && normalizedStart.getTime() === normalizedEnd.getTime()) {
					const matches = isSameDay(ticketDate, normalizedStart);
					return matches;
				}

				// Handle date range
				const afterStart = normalizedStart ? normalizedTicketDate >= normalizedStart : true;
				const beforeEnd = normalizedEnd ? normalizedTicketDate <= normalizedEnd : true;

				const matches = afterStart && beforeEnd;

				return matches;
			})();

			const matchesTab = (() => {
				if (Tabs === 0) {
					return ticket.Status === "Delivered";
				}

				if (Tabs === 1) {
					return isUpcoming(ticket.Status, ticket.Date);
				}

				return true;
			})();

			const finalMatch = matchesCurrentStatusFilter &&
				matchesSearchQuery &&
				matchesApproval &&
				matchesProjectCode &&
				matchesTopicTypeFilter &&
				matchesServiceTypeFilter &&
				matchesOnDemand &&
				matchesPaymentMethodFilter &&
				matchesPaymentStatusFilter &&
				matchesFavorite &&
				matchesDateRange &&
				matchesTab &&
				matchesDeliveryStatus;

			if (date?.startDate || date?.endDate) {
				console.log(`🚀 ~ Final match result for ${ticket.TicketNo}:`, finalMatch);
			}

			return finalMatch;
		} catch (error) {
			console.warn("Error filtering ticket:", error, "Ticket:", ticket.TicketNo);
			return false;
		}
	});
};

// Keep your existing isAnyFilterActive function unchanged
export const isAnyFilterActive = (filters) => {
	if (!filters) return false;

	const { currentStatus, search = "", approval = "", projectCode = null, topicType = "", serviceType = [], onDemandOption = "", paymentMethod = [], paymentStatus = [], isFavorite = false, date = {}, Tabs = -1, deliveryStatus = "" } = filters;

	const hasSearch = Boolean(search && search.trim());
	const hasApproval = Boolean(approval);
	const hasDelivery = Boolean(deliveryStatus);
	const hasProjectCode = Boolean(projectCode);
	const hasTopicType = Boolean(topicType);
	const hasServiceType = Array.isArray(serviceType) && serviceType.length > 0;
	const hasOnDemandOption = Boolean(onDemandOption);
	const hasPaymentMethod = Array.isArray(paymentMethod) && paymentMethod.length > 0;
	const hasPaymentStatus = Array.isArray(paymentStatus) && paymentStatus.length > 0;
	const hasFavorite = Boolean(isFavorite);
	const hasDateFilter = Boolean(date?.startDate || date?.endDate);
	const hasTabs = Tabs !== -1;
	const hasCurrentStatus = Array.isArray(currentStatus) && currentStatus.length > 0;

	return hasCurrentStatus || hasSearch || hasApproval || hasProjectCode || hasTopicType || hasServiceType || hasOnDemandOption || hasPaymentMethod || hasPaymentStatus || hasFavorite || hasDateFilter || hasTabs || hasDelivery;
};

export function parseAssignments(assignmentsJson) {
	try {
		const parsed = typeof assignmentsJson === "string" ? JSON.parse(assignmentsJson) : assignmentsJson;
		if (!Array.isArray(parsed)) {
			console.warn("Expected an array of assignments");
			return [];
		}

		return parsed.map((assignment) => ({
			department: assignment?.Department || assignment?.department,
			user: assignment?.user || assignment?.AssignedTo || assignment?.User,
			userId: assignment?.userid || assignment?.AssignedToUserId || assignment?.UserId || assignment?.userId,
			estimate: { hours: assignment?.EstimatedHours ?? assignment?.estimate?.hours ?? assignment?.hours ?? 0 },
			description: assignment?.Description || assignment?.description,
		}));
	} catch (error) {
		console.error("Failed to parse assignments JSON:", error);
		return [];
	}
}

export function formatToDateInput(value, newFormat) {
	if (!value) return "";
	try {
		if (newFormat) {
			const isoString = value.includes("T") ? value : value.replace(" ", "T");
			return new Date(isoString).toISOString().split("T")[0];
		}
		return new Date(value).toISOString().split("T")[0];
	} catch (error) {
		console.error("Invalid date value:", value);
		return "";
	}
}


export const mapToApiKey = (key) => {
	const map = {
		clientCode: "ClientCode",
		createdBy: "CreatedBy",
		ticketNo: "TicketNo",
		ticketDate: "TicketDate",
		requestDate: "RequestDate",
		topic: "Topic",
		topicType: "TopicType",
		noPrints: "NoPrints",
		description: "Description",
		serviceType: "ServiceType",
		paymentStatus: "PaymentStatus",
		paymentMethod: "PaymentMethod",
		approvedStatus: "ApproveStatus",
		communicationWith: "CommunicationWith",
		confirmationDate: "ConfirmationDate",
		codeUploadTime: "CodeUploadTime",
		Status: "Status",
		onDemand: "OnDemand",
	};
	return map[key] || key; // fallback to original key if unmapped
};

export const getStatusColor = (status, value, thresholds) => {
	if (status === "success") return "#4caf50";
	if (status === "warning") return "#ff9800";
	if (status === "error") return "#f44336";

	if (value >= thresholds?.high) return "#f44336";
	if (value >= thresholds?.medium) return "#ff9800";
	return "#4caf50";
};

export const getStatusText = (value, thresholds, labels) => {
	if (value >= thresholds?.high) return labels?.high;
	if (value >= thresholds?.medium) return labels?.medium;
	return labels.low;
};
