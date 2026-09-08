import { getDisplayNamesFromKeywords, parseKeywordUserIds } from "./keywordUtils";

function safeJsonParse(jsonString, defaultValue = []) {
	try {
		if (Array.isArray(jsonString)) return jsonString;
		if (typeof jsonString === "object" && jsonString !== null) return jsonString;
		return typeof jsonString === "string" ? JSON.parse(jsonString) : defaultValue;
	} catch (error) {
		return defaultValue;
	}
}

// Cache heavy per-ticket computations (keyword extraction, comment parsing, field flattening)
// WeakMap ensures entries are garbage-collected when the ticket object itself is GC'd
const ticketFacetCache = new WeakMap();

/**
 * Extracts all keyword display names, employee names, and IDs into normalized lowercase strings
 */
function extractAllKeywordStrings(rawKeywords) {
	if (!rawKeywords) return [];
	const results = new Set();

	if (typeof rawKeywords === "string") {
		const trimmed = rawKeywords.trim();
		if (trimmed) {
			try {
				let parsed = JSON.parse(trimmed);
				if (typeof parsed === "string") {
					try {
						parsed = JSON.parse(parsed);
					} catch (e) {}
				}
				if (Array.isArray(parsed)) {
					parsed.forEach((item) => {
						if (typeof item === "object" && item !== null) {
							if (item.EmployeeName) results.add(String(item.EmployeeName).toLowerCase().trim());
							if (item.name) results.add(String(item.name).toLowerCase().trim());
							if (item.user) results.add(String(item.user).toLowerCase().trim());
							if (item.username) results.add(String(item.username).toLowerCase().trim());
							if (item.EmployeeId != null) results.add(String(item.EmployeeId).toLowerCase().trim());
							if (item.id != null) results.add(String(item.id).toLowerCase().trim());
						} else if (item != null) {
							results.add(String(item).toLowerCase().trim());
						}
					});
				}
			} catch (e) {
				trimmed.split(/[/|,]+/).forEach((part) => {
					if (part.trim()) results.add(part.trim().toLowerCase());
				});
			}
		}
	} else if (Array.isArray(rawKeywords)) {
		rawKeywords.forEach((item) => {
			if (typeof item === "object" && item !== null) {
				if (item.EmployeeName) results.add(String(item.EmployeeName).toLowerCase().trim());
				if (item.name) results.add(String(item.name).toLowerCase().trim());
				if (item.user) results.add(String(item.user).toLowerCase().trim());
				if (item.EmployeeId != null) results.add(String(item.EmployeeId).toLowerCase().trim());
			} else if (item != null) {
				results.add(String(item).toLowerCase().trim());
			}
		});
	}

	try {
		const displayNames = getDisplayNamesFromKeywords(rawKeywords);
		displayNames.forEach((name) => {
			if (name) results.add(String(name).toLowerCase().trim());
		});
		const userIds = parseKeywordUserIds(rawKeywords);
		userIds.forEach((id) => {
			if (id != null) results.add(String(id).toLowerCase().trim());
		});
	} catch (e) {}

	return Array.from(results).filter(Boolean);
}

// Hoisted to module level — not recreated per filterTickets call
const DATE_KEYS_TO_EXCLUDE = new Set(["CreatedOn", "UpdatedAt", "PromiseDate", "TicketCloseTime", "Order_CreatedDate"]);

/**
 * Filter tickets with standard SaaS multi-token & @mention keyword search
 */
export function filterTickets(tickets = [], filters = {}) {
	const rawQuery = (filters?.searchQuery || "").trim();

	// Parse search query into:
	// - mentionQueries (@name): matches strictly in Keywords / tags
	// - anywhereTokens (#word or plain text): matches anywhere across all ticket fields, comments, creators, etc.
	const mentionQueries = [];
	const anywhereTokens = [];

	if (rawQuery) {
		const tokens = rawQuery.split(/\s+/).filter(Boolean);
		let currentMode = null; // null | '@' | '#'
		let currentPhrase = [];

		for (const token of tokens) {
			if (token.startsWith("@")) {
				if (currentPhrase.length > 0) {
					if (currentMode === "@") mentionQueries.push(currentPhrase.join(" ").toLowerCase());
					else anywhereTokens.push(currentPhrase.join(" ").toLowerCase());
					currentPhrase = [];
				}
				currentMode = "@";
				const clean = token.slice(1).trim();
				if (clean) currentPhrase.push(clean);
			} else if (token.startsWith("#")) {
				if (currentPhrase.length > 0) {
					if (currentMode === "@") mentionQueries.push(currentPhrase.join(" ").toLowerCase());
					else anywhereTokens.push(currentPhrase.join(" ").toLowerCase());
					currentPhrase = [];
				}
				currentMode = "#";
				const clean = token.slice(1).trim();
				if (clean) currentPhrase.push(clean);
			} else {
				if (currentMode) {
					currentPhrase.push(token);
				} else {
					anywhereTokens.push(token.toLowerCase());
				}
			}
		}

		if (currentPhrase.length > 0) {
			if (currentMode === "@") mentionQueries.push(currentPhrase.join(" ").toLowerCase());
			else anywhereTokens.push(currentPhrase.join(" ").toLowerCase());
		}
	}

	return (tickets || [])
		.filter((ticket) => {
			if (!ticket) return false;

			// 1. Project Code / Company Name filter
			if (filters?.projectCode) {
				const target = filters.projectCode.trim().toLowerCase();
				const comp = (ticket?.companyname || ticket?.projectCode || "").trim().toLowerCase();
				if (comp !== target) return false;
			}

			// 2. Status filter
			if (filters?.status?.length > 0) {
				const statusList = filters.status.map((s) => String(s).trim().toLowerCase());
				const ticketStatus = String(ticket?.Status || "").trim().toLowerCase();
				if (!statusList.includes(ticketStatus)) return false;
			}

			// 3. Priority filter
			if (filters?.priority) {
				const target = filters.priority.trim().toLowerCase();
				const p = String(ticket?.Priority || "").trim().toLowerCase();
				if (p !== target) return false;
			}

			// 4. Follow Up filter
			if (filters?.followup) {
				const target = filters.followup.trim().toLowerCase();
				const f = String(ticket?.FollowUp || "").trim().toLowerCase();
				if (f !== target) return false;
			}

			// 5. Category filter
			if (filters?.category) {
				const target = filters.category.trim().toLowerCase();
				const c = String(ticket?.category || "").trim().toLowerCase();
				if (c !== target) return false;
			}

			// 6. App Name filter
			if (filters?.appname) {
				const target = filters.appname.trim().toLowerCase();
				const a = String(ticket?.appname || "").trim().toLowerCase();
				if (a !== target) return false;
			}

			// 7. Starred filter
			if (filters?.isStarred) {
				const isStarred = ticket?.star === true || ticket?.star === "true" || ticket?.IsStarred === true;
				if (!isStarred) return false;
			}

			// Helper to get cached or computed facets
			const getFacets = () => {
				let facets = ticketFacetCache.get(ticket);
				if (!facets) {
					const rawKeywords = ticket?.Keywords || ticket?.keywords || ticket?.tags;
					const allKeywordTexts = extractAllKeywordStrings(rawKeywords);

					const peopleTexts = [
						ticket?.CreatedBy,
						ticket?.createdBy,
						ticket?.created_by,
						ticket?.LastUpdatedBy,
						ticket?.LastUpdatedByName,
						ticket?.onBehalfOf,
						ticket?.OnBehalfOf,
						ticket?.CustomerName,
						ticket?.clientname,
						ticket?.username,
						ticket?.user,
						ticket?.to,
					]
						.filter(Boolean)
						.map((p) => String(p).toLowerCase().trim());

					const comments = safeJsonParse(ticket?.comments || ticket?.Comments, []);
					const commentTexts = [];
					if (Array.isArray(comments)) {
						comments.forEach((c) => {
							if (c?.message) commentTexts.push(String(c.message).toLowerCase());
							if (c?.Name) {
								commentTexts.push(String(c.Name).toLowerCase());
								peopleTexts.push(String(c.Name).toLowerCase().trim());
							}
							if (c?.Role) commentTexts.push(String(c.Role).toLowerCase());
						});
					}

					const generalTexts = [];
					for (const [key, value] of Object.entries(ticket)) {
						if (DATE_KEYS_TO_EXCLUDE.has(key) || value == null) continue;
						if (typeof value === "string") {
							generalTexts.push(value.toLowerCase());
						} else if (typeof value === "number") {
							generalTexts.push(String(value).toLowerCase());
						} else if (Array.isArray(value) && key === "tags") {
							value.forEach((tag) => generalTexts.push(String(tag).toLowerCase()));
						}
					}

					facets = {
						allKeywordTexts,
						peopleTexts,
						allGeneralText: [...generalTexts, ...allKeywordTexts, ...peopleTexts, ...commentTexts].join(" "),
					};
					ticketFacetCache.set(ticket, facets);
				}
				return facets;
			};

			// 8. Mentions filter (multi-select person chips from sidebar)
			if (filters?.mentions?.length > 0) {
				const selectedMentions = filters.mentions.map((m) => String(m).trim().toLowerCase()).filter(Boolean);
				if (selectedMentions.length > 0) {
					const { allKeywordTexts } = getFacets();
					const matchesMention = selectedMentions.some((m) => {
						if (!m) return false;
						return allKeywordTexts.some((kw) => kw === m || kw.includes(m) || m.includes(kw));
					});
					if (!matchesMention) return false;
				}
			}

			// 8b. Mentions By Who filter (who authored comments / mentions on the ticket)
			if (filters?.mentionedBy?.length > 0) {
				const selectedAuthors = filters.mentionedBy.map((m) => String(m).trim().toLowerCase()).filter(Boolean);
				if (selectedAuthors.length > 0) {
					const comments = safeJsonParse(ticket?.comments || ticket?.Comments, []);
					const authorTexts = [
						ticket?.CreatedBy,
						ticket?.createdBy,
						ticket?.created_by,
						ticket?.LastUpdatedBy,
						ticket?.LastUpdatedByName,
					]
						.filter(Boolean)
						.map((p) => String(p).toLowerCase().trim());

					if (Array.isArray(comments)) {
						comments.forEach((c) => {
							if (c?.Name) authorTexts.push(String(c.Name).toLowerCase().trim());
						});
					}

					const matchesAuthor = selectedAuthors.some((auth) => {
						if (!auth) return false;
						return authorTexts.some((a) => a === auth || a.includes(auth) || auth.includes(a));
					});
					if (!matchesAuthor) return false;
				}
			}

			// If no search query provided, ticket passed all filter criteria
			if (!rawQuery || (mentionQueries.length === 0 && anywhereTokens.length === 0)) {
				return true;
			}

			const { allKeywordTexts, allGeneralText } = getFacets();

			// --- 1. Multi-Mention Matching: EACH @mention must match ONLY in Keywords/tags ---
			if (mentionQueries.length > 0) {
				const allMentionsMatch = mentionQueries.every((m) => {
					if (!m) return true;

					// Match ONLY in keywords (e.g. "bhavisha", "rajan", "john parker")
					const matchKw = allKeywordTexts.some((kw) => {
						if (kw === m || kw.includes(m) || m.includes(kw)) return true;
						const mWords = m.split(/\s+/).filter(Boolean);
						return mWords.length > 0 && mWords.every((w) => kw.includes(w));
					});
					return matchKw;
				});

				if (!allMentionsMatch) return false;
			}

			// --- 2. Anywhere Matching: EACH #tag or plain token matches anywhere on the ticket ---
			if (anywhereTokens.length > 0) {
				const allTokensMatch = anywhereTokens.every((t) => {
					if (!t) return true;
					const words = t.split(/\s+/).filter(Boolean);
					return words.every((w) => allGeneralText.includes(w));
				});

				if (!allTokensMatch) return false;
			}

			return true;
		})
		.sort((a, b) => new Date(b?.CreatedOn) - new Date(a?.CreatedOn));
}
