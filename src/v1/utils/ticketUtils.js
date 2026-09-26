const TICKET_PREFIX = "I";
const TICKET_INCREMENT = 2;
const STORAGE_KEY = "ticketHistory";
const COUNTER_KEY = "lastTicketNumber";

export const getLastTicketNumber = () => {
	return parseInt(localStorage.getItem(COUNTER_KEY) || "15013", 10);
};

export const saveLastTicketNumber = (num) => {
	localStorage.setItem(COUNTER_KEY, num.toString());
};

export const saveTicketHistory = (tickets) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

export const getTicketHistory = () => {
	const data = localStorage.getItem(STORAGE_KEY);
	return data ? JSON.parse(data) : [];
};

export const generateTicket = (createdBy) => {
	const last = getLastTicketNumber();
	const next = last + TICKET_INCREMENT;
	const id = `${TICKET_PREFIX}${next}`;
	const newTicket = {
		id,
		createdBy,
		createdAt: new Date().toISOString(),
	};
	const history = [...getTicketHistory(), newTicket];
	saveLastTicketNumber(next);
	saveTicketHistory(history);
	return newTicket;
};

export const resetTickets = () => {
	localStorage.removeItem(COUNTER_KEY);
	localStorage.removeItem(STORAGE_KEY);
};

// utils.js or wherever you store utilities

export const DataParser = (input, removeOfficeuseonly) => {
	try {
		if (!input) return { data: [], length: 0 };

		const parsed = JSON.parse(input);

		if (Array.isArray(parsed)) {
			const filtered = removeOfficeuseonly ? parsed.filter((off) => !off?.isOfficeUseOnly) : parsed;

			return { data: filtered, length: filtered.length };
		}

		return { data: [], length: 0 };
	} catch (e) {
		return { data: [], length: 0 };
	}
};

export const GetTicketStatusStyle = (status) => {
	const normalized = status?.toLowerCase();

	const statusMap = {
		solved: { bgColor: "#d4edda", textColor: "#155724" }, // light green
		"training pending": { bgColor: "#fff3cd", textColor: "#856404" }, // light yellow
		"in development": { bgColor: "#d1ecf1", textColor: "#0c5460" }, // light cyan
		"feedback pending": { bgColor: "#f8d7da", textColor: "#721c24" }, // light red
		approved: { bgColor: "#d4edda", textColor: "#155724" }, // light green
		new: { bgColor: "#d6d8d9", textColor: "#383d41" }, // light gray
		"feedback received": { bgColor: "#e2e3e5", textColor: "#41464b" }, // pale gray
		"in-review": { bgColor: "#e8eaf6", textColor: "#3f51b5" }, // light indigo
		"in-progress": { bgColor: "#e3f2fd", textColor: "#0d47a1" }, // soft blue
		"pending customer input": { bgColor: "#fff3cd", textColor: "#856404" }, // light yellow
		"in observation": { bgColor: "#d1ecf1", textColor: "#0c5460" }, // light cyan
		"solved - upcoming release": { bgColor: "#d4edda", textColor: "#155724" },
		"upcoming release": { bgColor: "#fefefe", textColor: "#6c757d" }, // near white
		closed: { bgColor: "#e2e3e5", textColor: "#383d41" }, // gray
		"pending maintenance": { bgColor: "#fff3cd", textColor: "#856404" },
		"client conversation pending": { bgColor: "#f8d7da", textColor: "#721c24" },
		"pending close": { bgColor: "#f8d7da", textColor: "#721c24" },
		"upload pending": { bgColor: "#fff3cd", textColor: "#856404" },
		"in planning": { bgColor: "#d1ecf1", textColor: "#0c5460" },
	};

	return statusMap[normalized] || { bgColor: "#f0f0f0", textColor: "#333" }; // default: light gray
};
