import { format } from "date-fns";

/**
 * Formats the given date to DD/MM/YYYY format.
 * @param {Date | string} date - The date to format.
 * @returns {string} - The formatted date in DD/MM/YYYY format.
 */
export const formatDate = (date) => {
	if (!date) return ""; // Return an empty string if no date is provided
	return format(new Date(date), "dd/MM/yyyy");
};

const ADMIN_LIST = ["prashant", "khushbu", "Rajan", "Ketan", "pradeep1", "pradeep", "admin"];

const normalize = (str) => str.trim().toLowerCase();
const getSimilarity = (a, b) => {
	a = normalize(a);
	b = normalize(b);

	// Exact match
	if (a === b) return 1;

	let intersection = 0;
	const setB = new Set(b);

	for (let char of a) {
		if (setB.has(char)) {
			intersection++;
			setB.delete(char); // avoid double counting
		}
	}

	return (2 * intersection) / (a.length + b.length); // Jaccard-like index
};
export const SetRole = (obj) => {
	if (!obj || !obj.firstname) {
		return { ...obj, role: "user" };
	}

	// if (obj.designation && normalize(obj.designation) === 'admin') {
	//   return { ...obj, role: 'admin' };
	// }

	const firstName = obj.firstname;

	// Step 1: Check for exact match
	const perfectMatch = ADMIN_LIST.some((admin) => normalize(admin) === normalize(firstName));

	if (perfectMatch) {
		return { ...obj, role: "admin" };
	}

	// Step 2: Check for fuzzy match (similarity > 75%)
	const fuzzyMatch = ADMIN_LIST.some((admin) => getSimilarity(firstName, admin) >= 0.75);

	if (fuzzyMatch) {
		return { ...obj, role: "admin" };
	}

	// Default: Not an admin
	return { ...obj, role: "user" };
};
