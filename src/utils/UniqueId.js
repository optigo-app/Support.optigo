// utils/UniqueId.js

const TICKET_PREFIX = "TI";
const TICKET_INCREMENT = 1;
const LOCAL_STORAGE_KEY = "lastTicketNumber";

export const generateTicketNumber = () => {
	// Get last used ticket number or start at 15013
	const last = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || "15013", 10);

	// Increment to get the next ticket number
	const next = last + TICKET_INCREMENT;

	// Save updated number in localStorage
	localStorage.setItem(LOCAL_STORAGE_KEY, next.toString());

	// Return formatted ticket ID
	return `${TICKET_PREFIX}${next}`;
};
