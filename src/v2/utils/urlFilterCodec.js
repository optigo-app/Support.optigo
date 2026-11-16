import LZString from "lz-string";
import qs from "qs";

export const FILTER_KEYS = ["projectCode", "status", "isStarred", "priority", "followup", "searchQuery", "category", "appname", "mentions", "mentionedBy"];

const SEARCH_ALIAS_KEY = "search";
const COMPRESSED_KEY = "f";
const OVERFLOW_KEY = "fk";
const FORMAT_PREFIX = "1.";
const PLAIN_MAX_LENGTH = 200;
const MAX_URL_LENGTH = 1800;
const MAX_DECODED_LENGTH = 100000;
const OVERFLOW_STORAGE_KEY = "ticket_filters_overflow";

const isNotEmpty = (val) => {
	if (Array.isArray(val)) return val.length > 0;
	if (typeof val === "boolean") return val === true;
	return val !== "" && val != null;
};

const stringifyPlain = (data, rest) => {
	const query = {};
	Object.entries(data || {}).forEach(([key, value]) => {
		if (isNotEmpty(value)) query[key] = Array.isArray(value) ? value.join(",") : value;
	});
	return qs.stringify({ ...query, ...(rest || {}) }, { addQueryPrefix: true, skipNulls: true });
};

const hashId = (text) => {
	let h = 5381;
	for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
	return (h >>> 0).toString(36);
};

const getStorage = () => {
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
};

/**
 * Builds the URL search string ("?..." or "") for a filter object.
 * - short result  -> readable plain params (same format as before)
 * - longer result -> ?f=1.<lz-string>
 * - still too long -> ?fk=<id>, payload kept in sessionStorage (this tab only)
 * @param {Object} data - filter values (arrays stay arrays)
 * @param {Object} [rest] - non-filter params to preserve as plain params
 */
export const encodeFilterQuery = (data, rest = {}) => {
	const plain = stringifyPlain(data, rest);
	if (plain.length <= PLAIN_MAX_LENGTH) return plain;

	const filtersOnly = {};
	Object.entries(data || {}).forEach(([key, value]) => {
		if (isNotEmpty(value)) filtersOnly[key] = value;
	});
	const json = JSON.stringify(filtersOnly);
	const restPart = qs.stringify(rest || {}, { skipNulls: true });
	const compressedPart = `${COMPRESSED_KEY}=${FORMAT_PREFIX}${LZString.compressToEncodedURIComponent(json)}`;
	const compressed = `?${[restPart, compressedPart].filter(Boolean).join("&")}`;
	const best = compressed.length < plain.length ? compressed : plain;
	if (best.length <= MAX_URL_LENGTH) return best;

	const storage = getStorage();
	if (!storage) return best;
	try {
		const id = hashId(json);
		storage.setItem(OVERFLOW_STORAGE_KEY, JSON.stringify({ id, json }));
		return qs.stringify({ ...(rest || {}), [OVERFLOW_KEY]: id }, { addQueryPrefix: true, skipNulls: true });
	} catch {
		return best;
	}
};

const safeParseObject = (json) => {
	if (typeof json !== "string" || !json || json.length > MAX_DECODED_LENGTH) return null;
	try {
		const parsed = JSON.parse(json);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
	} catch {
		return null;
	}
};

const pickFilters = (obj) => {
	const data = {};
	const rest = {};
	Object.entries(obj || {}).forEach(([key, value]) => {
		if (key === COMPRESSED_KEY || key === OVERFLOW_KEY) return;
		if (FILTER_KEYS.includes(key) || key === SEARCH_ALIAS_KEY) data[key] = value;
		else rest[key] = value;
	});
	return { data, rest };
};

/**
 * Reads filters from a URL search string. Never throws.
 * Supports ?f= (compressed), ?fk= (sessionStorage overflow) and legacy plain params.
 * @returns {{ source: "compressed"|"overflow"|"plain"|"invalid", data: Object, rest: Object }}
 */
export const decodeFilterQuery = (search) => {
	let query = {};
	try {
		query = qs.parse(search || "", { ignoreQueryPrefix: true });
	} catch {
		return { source: "invalid", data: {}, rest: {} };
	}
	const { rest } = pickFilters(query);

	if (typeof query[COMPRESSED_KEY] === "string") {
		const payload = query[COMPRESSED_KEY];
		let json = null;
		if (payload.startsWith(FORMAT_PREFIX)) {
			try {
				json = LZString.decompressFromEncodedURIComponent(payload.slice(FORMAT_PREFIX.length));
			} catch {
				json = null;
			}
		}
		const parsed = safeParseObject(json);
		return parsed ? { source: "compressed", data: pickFilters(parsed).data, rest } : { source: "invalid", data: {}, rest };
	}

	if (typeof query[OVERFLOW_KEY] === "string") {
		const storage = getStorage();
		try {
			const stored = JSON.parse(storage?.getItem(OVERFLOW_STORAGE_KEY) || "null");
			const parsed = stored?.id === query[OVERFLOW_KEY] ? safeParseObject(stored.json) : null;
			if (parsed) return { source: "overflow", data: pickFilters(parsed).data, rest };
		} catch {
			/* fall through */
		}
		return { source: "invalid", data: {}, rest };
	}

	return { source: "plain", data: pickFilters(query).data, rest };
};

const toStr = (v) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const toList = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x) : typeof v === "string" ? v.split(",").filter(Boolean) : []);

/**
 * Coerces whatever was decoded (plain strings or JSON values) into the shape
 * the filter hook expects, so a hand-edited URL can never inject a wrong type.
 */
export const normalizeFilters = (raw) => ({
	projectCode: toStr(raw?.projectCode),
	status: toList(raw?.status),
	isStarred: raw?.isStarred === true || raw?.isStarred === "true",
	priority: toStr(raw?.priority),
	followup: toStr(raw?.followup),
	searchQuery: toStr(raw?.searchQuery) || toStr(raw?.search),
	category: toStr(raw?.category),
	appname: toStr(raw?.appname),
	mentions: toList(raw?.mentions),
	mentionedBy: toList(raw?.mentionedBy),
});

/** Search text currently stored in the URL, whether plain or compressed. */
export const getSearchTextFromUrl = (search) => normalizeFilters(decodeFilterQuery(search).data).searchQuery;

/** Returns a new search string with the search text removed (other filters/params kept). */
export const removeSearchTextFromUrl = (search) => {
	const { data, rest } = decodeFilterQuery(search);
	if (!normalizeFilters(data).searchQuery) return search;
	const next = { ...data };
	delete next.searchQuery;
	delete next[SEARCH_ALIAS_KEY];
	return encodeFilterQuery(next, rest);
};
