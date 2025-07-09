export const filterAndSortCalls = (callLog, searchQuery, Status, viewMode, filterState, CompanyStatus) => {
	let filtered = [...callLog];

	const { filterTargetField, dateRange } = filterState;

	// Sort by timestamp (same as before)
	filtered = filtered.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp));

	// Search filter (same as before)
	if (searchQuery) {
		const searchTerms = searchQuery.toLowerCase().split(" ");
		filtered = filtered.filter((call) =>
			searchTerms.every((term) => [call.callDetails, call.company, call.callBy, call.receivedBy, call.appname, call.priority, call?.description, call?.status, call?.Estatus, call.forward?.designation, call.topicRaisedBy, call.forward?.person].filter(Boolean).some((field) => field.toLowerCase().includes(term))),
		);
	}

	// Filter based on dateRange only if no filterTargetField is selected
	if (!filterTargetField && dateRange?.startDate && dateRange?.endDate) {
		// Normalize the start and end dates to ensure time part doesn't affect the comparison
		const startDate = new Date(dateRange.startDate).setHours(0, 0, 0, 0); // Set startDate to midnight
		const endDate = new Date(dateRange.endDate).setHours(23, 59, 59, 999); // Set endDate to the last millisecond of the day

		filtered = filtered.filter((call) => {
			// Use call.timestamp or any other fallback date field to filter
			const callDate = new Date(call?.timestamp).getTime();
			return callDate >= startDate && callDate <= endDate;
		});
	}
	if (CompanyStatus === "All") {
		filtered = filtered;
	} else if (CompanyStatus) {
		filtered = filtered.filter((call) => call?.company?.toLowerCase() === CompanyStatus?.toLowerCase());
	}

	// Filter based on filterTargetField and dateRange
	else if (filterTargetField && dateRange?.startDate && dateRange?.endDate) {
		const startDate = new Date(dateRange.startDate).setHours(0, 0, 0, 0); // Set startDate to midnight
		const endDate = new Date(dateRange.endDate).setHours(23, 59, 59, 999); // Set endDate to the last millisecond of the day

		filtered = filtered.filter((call) => {
			// Get the value to filter based on filterTargetField (e.g., callStart or callClosed)
			const fieldValue = call[filterTargetField];

			// If the field doesn't exist, return false (skip this call)
			if (!fieldValue) return false;

			// Convert the field value to a Date (if it's not already a Date object)
			const fieldDate = new Date(fieldValue).getTime();

			// Check if the field value is within the provided date range
			return fieldDate >= startDate && fieldDate <= endDate;
		});
	} else if (filterTargetField) {
		// If no date range is selected, just filter by the filterTargetField (i.e., presence of the field)
		filtered = filtered.filter((call) => call[filterTargetField]);
	}

	// Status filter (same as before)
	if (Status) {
		if (Status === "Unanswered Call") {
			filtered = filtered.sort((a, b) => {
				if (!a.callStart) return -1;
				if (!b.callStart) return 1;
				return new Date(a.callStart) - new Date(b.callStart);
			});
		} else if (Status === "all") {
			filtered = filtered;
		} else {
			filtered = filtered.filter((call) => call.status?.toLowerCase() === Status.toLowerCase());
		}
	}

	// View mode filter
	if (viewMode) {
		if (viewMode === "normal") {
			filtered = filtered.filter((call) => call.receivedBy?.toLowerCase() === "Namrata".toLowerCase());
		} else if (viewMode === "team") {
			// No filter applied for "team"
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
