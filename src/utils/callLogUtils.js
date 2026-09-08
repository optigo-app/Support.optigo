/**
 * Safely parses various date formats including DD/MM/YYYY hh:mm A or ISO strings
 */
const parseCallDate = (dateVal) => {
	if (!dateVal) return null;
	if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
	if (typeof dateVal === "number") return new Date(dateVal);
	if (typeof dateVal !== "string") return null;

	const trimmed = dateVal.trim();
	if (!trimmed || trimmed.startsWith("1900-01-01")) return null;

	// Check for DD/MM/YYYY or DD/MM/YYYY hh:mm AM/PM format
	const ddmmRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?/i;
	const match = trimmed.match(ddmmRegex);
	if (match) {
		const [, day, month, year, hoursStr, minutesStr, secondsStr, ampm] = match;
		let hours = hoursStr ? parseInt(hoursStr, 10) : 0;
		const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
		const seconds = secondsStr ? parseInt(secondsStr, 10) : 0;

		if (ampm) {
			const isPM = ampm.toUpperCase() === "PM";
			if (isPM && hours < 12) hours += 12;
			if (!isPM && hours === 12) hours = 0;
		}
		const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hours, minutes, seconds);
		return isNaN(d.getTime()) ? null : d;
	}

	const fallback = new Date(trimmed);
	return isNaN(fallback.getTime()) ? null : fallback;
};

export const filterAndSortCalls = (callLog, searchQuery, Status, viewMode, filterState, CompanyStatus) => {
	if (!Array.isArray(callLog)) return [];
	let filtered = [...callLog];

	const { filterTargetField, dateRange } = filterState || {};

	// Search filter
	if (searchQuery) {
		const searchTerms = searchQuery.toLowerCase().split(" ");
		filtered = filtered.filter((call) =>
			searchTerms.every((term) =>
				[call.callDetails, call.company, call.callBy, call.receivedBy, call.appname, call.priority, call?.description, call?.status, call?.Estatus, call.forward?.designation, call.topicRaisedBy, call.forward?.person]
					.filter(Boolean)
					.some((field) => field.toLowerCase().includes(term)),
			),
		);
	}

	// Company filter (matches by company name OR ProjectID)
	if (CompanyStatus && CompanyStatus !== "All") {
		const companyFilterStr = String(CompanyStatus).toLowerCase();
		filtered = filtered.filter((call) => {
			const matchName = call?.company?.toLowerCase() === companyFilterStr;
			const matchId = String(call?.ProjectID || call?.projectId || "") === companyFilterStr;
			return matchName || matchId;
		});
	}

	// Date Range filter (using parseCallDate)
	if (dateRange?.startDate && dateRange?.endDate) {
		const startMs = new Date(dateRange.startDate).setHours(0, 0, 0, 0);
		const endMs = new Date(dateRange.endDate).setHours(23, 59, 59, 999);
		const targetField = filterTargetField || "date";

		filtered = filtered.filter((call) => {
			const val = call[targetField] || call.date || call.timestamp || call.createdDate;
			const parsed = parseCallDate(val);
			if (!parsed) return false;
			const time = parsed.getTime();
			return time >= startMs && time <= endMs;
		});
	} else if (filterTargetField) {
		filtered = filtered.filter((call) => Boolean(call[filterTargetField]));
	}

	// Status filter (matches by status name OR StatusID)
	if (Status && Status !== "all") {
		if (Status === "Unanswered Call") {
			filtered = filtered.sort((a, b) => {
				if (!a.callStart) return -1;
				if (!b.callStart) return 1;
				return new Date(a.callStart) - new Date(b.callStart);
			});
		} else {
			const statusFilterStr = String(Status).toLowerCase();
			filtered = filtered.filter((call) => {
				const matchName = call.status?.toLowerCase() === statusFilterStr;
				const matchId = String(call.StatusID || call.statusId || "") === statusFilterStr;
				return matchName || matchId;
			});
		}
	}

	return filtered;
};

export const createCallLogMap = (callLogs) => {
	return callLogs?.reduce((map, row) => {
		map[row?.sr] = row;
		return map;
	}, {});
};

/**
 * Triggers notification based on status code
 * @param statusCode - The code returned from backend (e.g. 1000 = success, 1001 = no-permission)
 * @param notifyFn - Function to call (toast, alert, etc)
 * @param message - Message to display
 */
export const handleStatusNotification = (data, notifyFn ,msg ,error) => {
	const {stat_code, stat_msg} = data ;
	switch (stat_code) {
		case 1000:
			notifyFn(msg || stat_msg, "success");
			break;
		case 1001:
			notifyFn(error || stat_msg, "error");
			break;
		default:
			notifyFn("Unhandled status code.", "info");
	}
};

/**
 * Determines if a sub-call item is a forwarded call
 * @param {Object} fu - Sub-call item from FollowUpList
 * @returns {boolean} True if the sub-call is a forwarded call
 */
export const isForwardedCall = (fu) => {
	if (!fu) return false;
	return (
		fu.IsForwardFollowup === 1 ||
		fu.IsForwardFollowup === "1" ||
		fu.IsForwardFollowup === true ||
		(fu.ForwardedEmpId && Number(fu.ForwardedEmpId) > 0) ||
		(fu.ForwardedEmp && String(fu.ForwardedEmp).trim() !== "")
	);
};

/**
 * Parses FollowUpList JSON string or array safely
 * @param {string|Array} followUpList - FollowUpList JSON string or array
 * @returns {Array} List of sub-call items
 */
export const parseFollowUpList = (followUpList) => {
	if (!followUpList) return [];
	if (Array.isArray(followUpList)) return followUpList;
	try {
		const parsed = JSON.parse(followUpList);
		return Array.isArray(parsed) ? parsed : [];
	} catch (e) {
		console.error("Failed to parse FollowUpList:", e);
		return [];
	}
};

/**
 * Separates sub-calls into standard follow-ups and forwarded calls
 * @param {string|Array} followUpList - FollowUpList JSON string or array
 * @returns {{ followUpList: Array, standardFollowUps: Array, forwardedFollowUps: Array, totalCount: number }}
 */
export const separateFollowUpsAndForwarded = (followUpList) => {
	const list = parseFollowUpList(followUpList);
	const standardFollowUps = [];
	const forwardedFollowUps = [];

	list.forEach((fu) => {
		if (isForwardedCall(fu)) {
			forwardedFollowUps.push(fu);
		} else {
			standardFollowUps.push(fu);
		}
	});

	return {
		followUpList: list,
		standardFollowUps,
		forwardedFollowUps,
		totalCount: list.length,
	};
};

/**
 * Safely parses date and time inputs into a valid Date object.
 * Handles ISO strings ("2026-08-27T14:30:00"), DD/MM/YYYY ("27/08/2026"), 
 * separated date & time ("2026-08-27" & "14:30"), etc.
 */
export const parseCallDateTime = (dateInput, timeInput) => {
	if (!dateInput && !timeInput) return null;

	let dStr = typeof dateInput === "string" ? dateInput.trim() : "";
	let tStr = typeof timeInput === "string" ? timeInput.trim() : "";

	// If date string contains DD/MM/YYYY format, convert to YYYY-MM-DD
	if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dStr)) {
		const parts = dStr.split(/[\sT]+/)[0].split("/");
		if (parts.length === 3) {
			dStr = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
		}
	}

	// If time string is embedded in date string (ISO or space separated)
	if (!tStr && (dStr.includes("T") || dStr.includes(" "))) {
		const dt = new Date(dStr);
		if (!isNaN(dt.getTime())) return dt;
	}

	// Combine YYYY-MM-DD date part with time string
	const baseDate = dStr.split(/[T\s]/)[0] || new Date().toISOString().split("T")[0];

	if (tStr) {
		const ampmMatch = tStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
		if (ampmMatch) {
			let hours = parseInt(ampmMatch[1], 10);
			const minutes = parseInt(ampmMatch[2], 10);
			const isPm = ampmMatch[4].toUpperCase() === "PM";
			if (isPm && hours < 12) hours += 12;
			if (!isPm && hours === 12) hours = 0;
			tStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
		} else if (/^\d{1,2}:\d{2}$/.test(tStr)) {
			tStr = `${tStr}:00`;
		}

		const combined = new Date(`${baseDate}T${tStr}`);
		if (!isNaN(combined.getTime())) return combined;
		const combinedSpace = new Date(`${baseDate} ${tStr}`);
		if (!isNaN(combinedSpace.getTime())) return combinedSpace;
	}

	const directDate = new Date(dStr);
	return !isNaN(directDate.getTime()) ? directDate : null;
};

/**
 * Formats time string or date into user-friendly 12-hour format ("02:30 PM")
 */
export const formatQueueTime = (timeInput, dateInput) => {
	if (typeof timeInput === "string" && /AM|PM/i.test(timeInput)) {
		return timeInput.trim();
	}

	if (typeof timeInput === "string" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeInput.trim())) {
		const parts = timeInput.trim().split(":");
		let h = parseInt(parts[0], 10);
		const m = parseInt(parts[1], 10);
		if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
			const ampm = h >= 12 ? "PM" : "AM";
			h = h % 12 || 12;
			return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
		}
	}

	const dt = parseCallDateTime(dateInput, timeInput);
	if (dt) {
		let h = dt.getHours();
		const m = dt.getMinutes();
		const ampm = h >= 12 ? "PM" : "AM";
		h = h % 12 || 12;
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
	}

	return "";
};

/**
 * Formats date into readable string ("27 Aug")
 */
export const formatQueueDate = (dateInput) => {
	const dt = parseCallDateTime(dateInput, null);
	if (!dt) return "";
	try {
		return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
	} catch (e) {
		return "";
	}
};

/**
 * Returns numeric timestamp for sorting queue items deterministically
 */
export const getQueueTimestamp = (item) => {
	const dt = parseCallDateTime(item?.CreatedDate || item?.date || item?.entryDate, item?.time);
	if (dt) return dt.getTime();
	const srNum = Number(item?.sr || item?.id || 0);
	return isNaN(srNum) ? 0 : srNum;
};
/**
 * Master Reset function to clear all call session state (timers, active calls, paused calls)
 * while preserving login credentials and active authentication skey token.
 */
export const clearCallSessionState = () => {
	const CALL_STORAGE_KEYS = [
		"call_recording_time",
		"current_call_data",
		"call_is_paused",
		"call_paused_duration",
		"call_pause_start_time",
		"call_sliders_state",
		"concurrent_call_data",
		"call_start_timestamp",
		"active_follow_up",
	];

	CALL_STORAGE_KEYS.forEach((key) => {
		try {
			localStorage.removeItem(key);
		} catch (e) {
			console.error(`Failed to remove key ${key}:`, e);
		}
	});

	try {
		sessionStorage.clear();
	} catch (e) {
		console.error("Failed to clear sessionStorage:", e);
	}

	window.location.reload();
};
