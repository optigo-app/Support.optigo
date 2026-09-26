import { getDisplayNamesFromKeywords, parseKeywordUserIds } from "./keywordUtils";

function safeJsonParse(jsonString, defaultValue = []) {
	try {
		return typeof jsonString === "string" ? JSON.parse(jsonString) : defaultValue;
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return defaultValue;
	}
}

export function filterTickets(tickets = [], filters = {}) {
	const query = filters?.searchQuery?.trim()?.toLowerCase();
	const dateKeysToExclude = ["CreatedOn", "UpdatedAt", "PromiseDate"];



	const normalizedQuery = query?.trim().toLowerCase();

	return tickets
		?.filter((ticket) => {
			if (filters?.projectCode && ticket?.companyname?.trim()?.toLowerCase() !== filters?.projectCode?.trim()?.toLowerCase()) return false;
			if (filters?.status?.length > 0 && !filters?.status?.includes(ticket?.Status)) return false;
			if (filters?.priority && ticket?.Priority?.trim()?.toLowerCase() !== filters.priority?.trim()?.toLowerCase()) return false;
			if (filters?.followup && ticket?.FollowUp?.trim()?.toLowerCase() !== filters.followup?.trim()?.toLowerCase()) return false;
			if (filters?.category && ticket?.category?.trim()?.toLowerCase() !== filters.category?.trim()?.toLowerCase()) return false;
			if (filters?.appname && ticket?.appname?.trim()?.toLowerCase() !== filters.appname?.trim()?.toLowerCase()) return false;
			if (filters?.isStarred && ticket?.star !== true) return false;

			if (!normalizedQuery) return true;

			const comments = safeJsonParse(ticket.comments, []);
			const rawKeywords = ticket?.Keywords || ticket?.keywords;
			const keywords = getDisplayNamesFromKeywords(rawKeywords);
			const keywordUserIds = parseKeywordUserIds(rawKeywords);

			// Search fields
			for (const [key, value] of Object.entries(ticket)) {
				if (dateKeysToExclude.includes(key)) continue;

				if (typeof value === "string" && value.toLowerCase().includes(normalizedQuery)) return true;

				if (Array.isArray(value) && key === "tags" && value.some((tag) => tag?.toLowerCase().includes(normalizedQuery))) return true;

				if (key === "comments" && comments.some((c) =>
					c.message?.toLowerCase().includes(normalizedQuery) ||
					c.Name?.toLowerCase().includes(normalizedQuery) ||
					c.Role?.toLowerCase().includes(normalizedQuery)
				)) return true;

				if ((key === "keywords" || key === "Keywords") && (
					keywords.some((kw) => kw.toLowerCase().includes(normalizedQuery)) ||
					keywordUserIds.some((id) => String(id).toLowerCase().includes(normalizedQuery))
				)) return true;
			}

			return false;
		})
		?.sort((a, b) => new Date(b?.CreatedOn) - new Date(a?.CreatedOn));

}

// const dateKeysToExclude = ["CreatedOn", "UpdatedAt", "PromiseDate"]; // add more if needed
// export function filterTickets(tickets = [], filters = {}) {
//     console.log("🚀 ~ filterTickets ~ tickets:", tickets)
//     const query = filters?.searchQuery?.trim()?.toLowerCase();

//     return tickets
//         ?.filter((ticket) => {
//             if (filters?.projectCode && ticket?.projectCode !== filters?.projectCode) return false;
//             if (filters?.status?.length > 0 && !filters.status.includes(ticket?.Status)) return false;
//             if (filters?.priority && ticket?.Priority !== filters.priority) return false;
//             if (filters?.followup && ticket?.FollowUp !== filters.followup) return false;
//             if (filters?.category && ticket?.category !== filters.category) return false;
//             if (filters?.appname && ticket?.appname !== filters.appname) return false;
//             if (filters?.isStarred && ticket?.star !== true) return false;

//             if (query) {
//                 const matchesQuery = Object.entries(ticket).some(([key, value]) => {
//                     if (dateKeysToExclude.includes(key)) return false;
//                     if (typeof value === "string") {
//                         return value.toLowerCase().includes(query);
//                     }
//                     if (Array?.isArray(value) && key === "tags") {
//                         return value?.some(tag => tag?.toLowerCase()?.includes(query));
//                     }
//                     if (Array?.isArray(value) && key === "Comments") {
//                         return value.some((comment) => {
//                             return Object?.entries(comment)?.some(([subKey, subValue]) => {
//                                 if (typeof subValue === "string" && subValue?.toLowerCase()?.includes(query)) {
//                                     return true;
//                                 }
//                                 return false;
//                             });
//                         });
//                     }
//                     return false;
//                 });
//                 if (!matchesQuery) return false;
//             }

//             return true;
//         })
//         ?.sort((a, b) => new Date(b?.CreatedOn) - new Date(a?.CreatedOn));
// }

// const data = filteredByMenu
//   ?.filter((ticket) => {
//     if (filters?.projectCode && ticket?.projectCode !== filters?.projectCode) return false;
//     if (filters?.status?.length > 0 && !filters.status.includes(ticket?.Status)) return false;
//     if (filters?.priority && ticket?.Priority !== filters.priority) return false;
//     if (filters?.followup && ticket?.FollowUp !== filters.followup) return false;
//     if (filters?.isStarred && ticket?.IsStarred !== true) return false;
//     if (filters?.searchQuery?.trim()) {
//       const query = filters?.searchQuery?.trim().toLowerCase();

//       return Object?.entries(ticket)?.some(([key, value]) => {
//         if (dateKeysToExclude?.includes(key)) return false;
//         if (typeof value === "string") {
//           return value.toLowerCase()?.includes(query);
//         }
//         return false;
//       });
//     }

//     return true;
//   })
//   ?.sort((a, b) => new Date(b?.CreatedOn) - new Date(a?.CreatedOn));
