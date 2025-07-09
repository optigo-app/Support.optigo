import { parseISO, differenceInDays, startOfDay } from "date-fns";

export const getTicketAgeCategory = (dateString) => {
	if (!dateString) return "";

	try {
		const ticketDate = parseISO(dateString);
		const today = new Date();
		const days = differenceInDays(startOfDay(today), startOfDay(ticketDate));

		if (days === 0) return "Today";
		if (days === 1) return "1 day";
		if (days <= 7) return "1 week";
		if (days <= 30) return "1 month";
		if (days <= 365) return `${Math.floor(days / 30)} months`;
		return "1 year+";
	} catch (e) {
		console.error("Error parsing date:", dateString, e);
		return "Unknown";
	}
};

const getLatestCommentDate = (comments) => {
	try {
		let commentList;

		if (typeof comments === "string") {
			if (comments.trim() === "") {
				return null;
			}
			commentList = JSON.parse(comments);
		} else {
			commentList = comments;
		}
		if (!Array.isArray(commentList)) {
			return null;
		}
		const commentDates = commentList.map((c) => new Date(c.time)).filter((d) => d.toString() !== "Invalid Date");

		if (commentDates.length === 0) return null;
		const latestDate = new Date(Math.max(...commentDates));
		return latestDate.toISOString();
	} catch (e) {
		console.error("Failed to parse comments:", e);
		return null;
	}
};

export const getDateFieldByType = (ticket, filterType = "created") => {
	const status = ticket?.Status?.toLowerCase();

	switch (filterType) {
		case "updated":
			return ticket.UpdatedAt || ticket.CreatedOn;

		case "latestComment":
			const latestCommentDate = getLatestCommentDate(ticket.comments);
			return latestCommentDate || ticket.CreatedOn;

		case "closedTicket":
			if (excludedStatuses.includes(status)) {
				return ticket?.TicketCloseTime || null;
			}
			return null;

		case "created":
		default:
			return ticket.CreatedOn;
	}
};
// Statuses considered as closed/excluded
export const excludedStatuses = ["closed", "solved", "delivered"];

export const getFilteredTickets = (filterName, tickets, filterType = "created") => {
	if (!tickets || tickets.length === 0) return [];

	const filterByExactAge = (ageCategory) => {
		return tickets
			.map((ticket) => {
				const dateField = getDateFieldByType(ticket, filterType);
				const age = getTicketAgeCategory(dateField);
				return { ...ticket, Age: age };
			})
			.filter((ticket) => ticket.Age === ageCategory);
	};

	switch (filterName) {
		case "all":
			return [...tickets].sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn));

		case "all_age":
			return [...tickets].sort((a, b) => {
				const dateA = getDateFieldByType(a, filterType);
				const dateB = getDateFieldByType(b, filterType);
				return new Date(dateB) - new Date(dateA);
			});

		case "new_ticket":
			return tickets.filter((t) => !t?.UpdatedAt?.trim());

		case "open_ticket":
			return tickets.filter((t) => t?.UpdatedAt?.trim() && !excludedStatuses.includes(t?.Status?.toLowerCase() || ""));

		case "closed_ticket":
			return tickets.filter((t) => t.Status?.toLowerCase() === "closed");

		case "isSuggested":
			return tickets.filter((t) => t.isSuggested === true || t.isSuggested === "True");

		case "Today":
			return filterByExactAge("Today");

		case "1d":
			return filterByExactAge("1 day");

		case "2d":
			return filterByExactAge("2 days");

		case "1w":
			return filterByExactAge("1 week");

		case "1m":
			return filterByExactAge("1 month");

		case "1y":
			return filterByExactAge("1 year+");

		default:
			return [];
	}
};

export const getFilteredTicketCount = (filterName, tickets, filterType = "created") => {
	if (!tickets || tickets.length === 0) return 0;

	const filterByExactAge = (ageCategory) => {
		return tickets.filter((ticket) => {
			const dateField = getDateFieldByType(ticket, filterType);
			const age = getTicketAgeCategory(dateField);
			return age === ageCategory;
		}).length;
	};

	switch (filterName) {
		case "all":
		case "all_age":
			return tickets.length;

		case "new_ticket":
			return tickets.filter((t) => !t?.UpdatedAt?.trim()).length;

		case "open_ticket":
			return tickets.filter((t) => t?.UpdatedAt?.trim() && !excludedStatuses.includes(t?.Status?.toLowerCase() || "")).length;

		case "closed_ticket":
			return tickets.filter((t) => t.Status?.toLowerCase() === "closed").length;

		case "isSuggested":
			return tickets.filter((t) => t.isSuggested === true || t.isSuggested === "True").length;

		case "Today":
			return filterByExactAge("Today");

		case "1d":
			return filterByExactAge("1 day");

		case "2d":
			return filterByExactAge("2 days");

		case "1w":
			return filterByExactAge("1 week");

		case "1m":
			return filterByExactAge("1 month");

		case "1y":
			return filterByExactAge("1 year+");

		default:
			return 0;
	}
};

// import { parseISO, differenceInDays, startOfDay } from "date-fns";

// /**
//  * Gets the age category of a ticket based on the specified date
//  * @param {string} dateString - ISO date string to calculate age from
//  * @returns {string} - Age category of the ticket
//  */
// const getTicketAgeCategory = (dateString) => {
//   if (!dateString) return "";

//   const ticketDate = parseISO(dateString);
//   const today = new Date();
//   const days = differenceInDays(startOfDay(today), startOfDay(ticketDate));

//   if (days === 0) return "Today";
//   if (days === 1) return "1 day";
//   if (days === 2) return "2 days";
//   if (days <= 7) return "1 week";
//   if (days <= 30) return "1 month";
//   if (days <= 365) return `${Math.floor(days / 30)} months`;
//   return "1 year+";
// };

// const excludedStatuses = ["closed", "solved", "delivered"];

// /**
//  * Gets the appropriate date field from a ticket based on the filter type
//  * @param {Object} ticket - The ticket object
//  * @param {string} filterType - Type of date field to use (created, updated, latestComment)
//  * @returns {string} - The date string to use for age calculation
//  */
// const getDateFieldByType = (ticket, filterType = "created") => {
//   switch (filterType) {
//     case "updated":
//       return ticket.UpdatedAt;
//     case "latestComment":
//       try {
//         const comments = JSON.parse(ticket.comments || "[]");
//         if (comments.length > 0) {
//           const commentDates = comments.map(c => new Date(c.time));
//           return new Date(Math.max(...commentDates)).toISOString(); // latest comment
//         }
//       } catch (e) {
//         console.error("Failed to parse comments:", e);
//       }
//       return ticket.CreatedOn; // fallback
//     case "created":
//     default:
//       return ticket.CreatedOn;
//   }
// };
// /**
//  * Returns filtered tickets based on the specified filter name and filter type
//  * @param {string} filterName - the name of the filter
//  * @param {Array<Object>} tickets - the list of tickets to filter
//  * @param {string} filterType - type of date to filter by (created, updated, latestComment)
//  * @returns {Array<Object>} - the filtered tickets
//  */
// export const getFilteredTickets = (filterName, tickets, filterType = "created") => {
//   if (!tickets) return [];

//   const filterByExactAge = (ageCategory) => {
//     return tickets
//       ?.map((ticket) => {
//         const dateField = getDateFieldByType(ticket, filterType);
//         const age = getTicketAgeCategory(dateField);
//         return { ...ticket, Age: age };
//       })
//       .filter((ticket) => ticket.Age === ageCategory);
//   };

//   switch (filterName) {
//     case "all":
//       return tickets?.sort((a, b) => {
//         const dateA = getDateFieldByType(a, "created");
//         const dateB = getDateFieldByType(b, "created");
//         return new Date(dateB) - new Date(dateA);
//       });
//     case "all_age":
//       return tickets?.sort((a, b) => {
//         const dateA = getDateFieldByType(a, filterType);
//         const dateB = getDateFieldByType(b, filterType);
//         return new Date(dateB) - new Date(dateA);
//       });
//     case "new_ticket":
//       return tickets?.filter((t) => t.Status === "New");
//     case "open_ticket":
//       return tickets?.filter((tic) => !excludedStatuses?.includes(tic?.Status));
//     case "closed_ticket":
//       return tickets?.filter((t) => t?.Status === "Closed");
//     case "isSuggested":
//       return tickets?.filter((t) => t?.isSuggested === "True");
//     case "Today":
//       return filterByExactAge("Today");
//     case "1d":
//       return filterByExactAge("1 day");
//     case "2d":
//       return filterByExactAge("2 days");
//     case "1w":
//       return filterByExactAge("1 week");
//     case "1m":
//       return filterByExactAge("1 month");
//     case "1y":
//       return filterByExactAge("1 year+");
//     default:
//       return [];
//   }
// };

// /**
//  * Returns the count of tickets that matches the given filter name.
//  * @param {string} filterName - the name of the filter
//  * @param {Array<Object>} tickets - the list of tickets to filter
//  * @param {string} filterType - type of date to filter by (created, updated, latestComment)
//  * @returns {number} - the count of filtered tickets
//  */
// export const getFilteredTicketCount = (filterName, tickets, filterType = "created") => {
//   if (!tickets) return 0;

//   const filterByExactAge = (ageCategory) => {
//     return tickets
//       ?.map((ticket) => {
//         const dateField = getDateFieldByType(ticket, filterType);
//         const age = getTicketAgeCategory(dateField);
//         return { ...ticket, Age: age };
//       })
//       .filter((ticket) => ticket.Age === ageCategory).length;
//   };

//   switch (filterName) {
//     case "all":
//     case "all_age":
//       return tickets?.length;
//     case "new_ticket":
//       return tickets?.filter((t) => t.Status === "New").length;
//     case "open_ticket":
//       return tickets?.filter((tic) => !excludedStatuses?.includes(tic?.Status))?.length;
//     case "closed_ticket":
//       return tickets?.filter((t) => t.Status === "Closed").length;
//     case "isSuggested":
//       return tickets?.filter((t) => t?.isSuggested === "True")?.length;
//     case "Today":
//       return filterByExactAge("Today");
//     case "1d":
//       return filterByExactAge("1 day");
//     case "2d":
//       return filterByExactAge("2 days");
//     case "1w":
//       return filterByExactAge("1 week");
//     case "1m":
//       return filterByExactAge("1 month");
//     case "1y":
//       return filterByExactAge("1 year+");
//     default:
//       return 0;
//   }
// };
