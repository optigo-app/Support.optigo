import { BehaviorSubject, combineLatest } from "rxjs";
import { map, distinctUntilChanged, debounceTime } from "rxjs/operators";
import { useSyncExternalStore, useRef, useEffect, useState } from "react";
import { getFilteredTickets, getDateFieldByType, getTicketAgeCategory } from "../utils/TicketListUtils";
import { filterTickets } from "../utils/TicketFilter";

// ─── Ticket Store ─────────────────────────────────────────────────────────────

/**
 * All tickets from server
 * @type {BehaviorSubject<Array>}
 */
export const ticketRawList$ = new BehaviorSubject([]);

/**
 * Active sidebar tab (all | new_ticket | open_ticket | closed_ticket | isSuggested | all_age | Today | 1d | 2d | 1w | 1m | 1y)
 * @type {BehaviorSubject<string>}
 */
export const ticketActiveTab$ = new BehaviorSubject(
	(() => {
		try {
			return JSON.parse(localStorage.getItem("activeItem") || '"all"');
		} catch {
			return "all";
		}
	})()
);

ticketActiveTab$.subscribe((tab) => {
	try {
		localStorage.setItem("activeItem", JSON.stringify(tab));
	} catch {}
});

/**
 * Ages-based sort field
 * @type {BehaviorSubject<string>}
 */
export const ticketAgesFilter$ = new BehaviorSubject(
	(() => {
		try {
			return JSON.parse(sessionStorage.getItem("AgesBasedFilter") || '"latestComment"');
		} catch {
			return "latestComment";
		}
	})()
);

ticketAgesFilter$.subscribe((val) => {
	try {
		sessionStorage.setItem("AgesBasedFilter", JSON.stringify(val));
	} catch {}
});

// ─── URL Filters State ────────────────────────────────────────────────────────

/** @type {import('../hooks/useFilters').Filters} */
const DEFAULT_FILTERS = {
	projectCode: "",
	status: [],
	isStarred: false,
	priority: "",
	followup: "",
	searchQuery: "",
	category: "",
	appname: "",
	mentions: [],
	mentionedBy: [],
};

/**
 * Active URL-synced filter state
 * @type {BehaviorSubject<import('../hooks/useFilters').Filters>}
 */
export const ticketFilters$ = new BehaviorSubject({ ...DEFAULT_FILTERS });

// ─── Derived: Single-pass Sidebar Counts ─────────────────────────────────────

/**
 * Computed in ONE pass: all 12 sidebar tab counts
 * Avoids 12× separate loops each doing JSON.parse(comments) on all tickets
 * @type {BehaviorSubject<Object>}
 */
const ZERO_COUNTS = {
	all: 0, new_ticket: 0, open_ticket: 0, closed_ticket: 0, isSuggested: 0,
	all_age: 0, Today: 0, "1d": 0, "2d": 0, "1w": 0, "1m": 0, "1y": 0,
};

export const ticketSidebarCounts$ = new BehaviorSubject({ ...ZERO_COUNTS });

// Subscribe to ticket list + ages filter to compute all counts in one pass
combineLatest([ticketRawList$, ticketAgesFilter$])
	.pipe(
		debounceTime(0), // batch microtask flush — prevents cascades on same tick
		map(([tickets, filterType]) => {
			if (!tickets?.length) {
				return { ...ZERO_COUNTS };
			}

			// Parse all dates & comments ONCE per ticket, use results for all categories
			const counts = {
				all: tickets.length,
				all_age: 0,
				new_ticket: 0,
				open_ticket: 0,
				closed_ticket: 0,
				isSuggested: 0,
				Today: 0,
				"1d": 0,
				"2d": 0,
				"1w": 0,
				"1m": 0,
				"1y": 0,
			};

			const excludedStatuses = ["closed", "delivered"];

			for (const t of tickets) {
				if (!t) continue;
				const status = (t.Status || "").toLowerCase();

				// View tab counts — use same logic as TicketListUtils.getFilteredTickets
				if (!t?.UpdatedAt?.trim()) counts.new_ticket++;
				if (t?.UpdatedAt?.trim() && !excludedStatuses.includes(status)) counts.open_ticket++;
				if (status === "closed") counts.closed_ticket++;
				if (t.isSuggested === true || t.isSuggested === "True" || t.isSuggested === "true") counts.isSuggested++;

				// Age counts — getTicketAgeCategory returns: "Today"|"1 day"|"2 days"|"1 week"|"1 month"|"1 year+"|""
				const dateField = getDateFieldByType(t, filterType);
				if (dateField) {
					counts.all_age++;
					const age = getTicketAgeCategory(dateField);
					if (age === "Today") counts["Today"]++;
					else if (age === "1 day") counts["1d"]++;
					else if (age === "2 days") counts["2d"]++;
					else if (age === "1 week") counts["1w"]++;
					else if (age === "1 month") counts["1m"]++;
					else if (age === "1 year+") counts["1y"]++;
				}
			}

			return counts;
		}),
		distinctUntilChanged((a, b) => {
			// Fast shallow key compare — avoids serialising 800 tickets on every tick
			const keys = Object.keys(a);
			for (let i = 0; i < keys.length; i++) {
				if (a[keys[i]] !== b[keys[i]]) return false;
			}
			return true;
		})
	)
	.subscribe((counts) => ticketSidebarCounts$.next(counts));

// ─── Derived: Filtered Ticket List for Display ────────────────────────────────

/**
 * The final filtered, sorted ticket list to render in TicketList
 * Derived from: raw tickets + active tab + ages filter + URL filters
 * @type {BehaviorSubject<Array>}
 */
export const ticketDisplayList$ = new BehaviorSubject([]);

combineLatest([ticketRawList$, ticketActiveTab$, ticketAgesFilter$, ticketFilters$])
	.pipe(
		map(([tickets, activeTab, agesFilter, filters]) => {
			// When searching: bypass tab filter, search all tickets
			const baseList = filters?.searchQuery?.trim()
				? tickets || []
				: getFilteredTickets(activeTab, tickets, agesFilter);

			return filterTickets(baseList, filters);
		})
	)
	.subscribe((list) => ticketDisplayList$.next(list));

// ─── Per-Ticket BehaviorSubject Map ──────────────────────────────────────────
//
// Each ticket gets its own BehaviorSubject keyed by TicketNo.
// When a socket patches one ticket, only that subject emits → only that row re-renders.
// The outer ticketMap$ holds the Map reference itself (changes only when tickets are
// added or removed — not on every single-ticket update).

/** @type {BehaviorSubject<Map<string, BehaviorSubject<Object>>>} */
export const ticketMap$ = new BehaviorSubject(new Map());

/**
 * Rebuild / update the per-ticket map from a fresh ticket list.
 * Existing subjects are reused (only .next() is called on them) so subscribers
 * that are already mounted don't get a new subscription object.
 * @param {Array} tickets
 */
function syncTicketMap(tickets) {
	const current = ticketMap$.getValue();
	const next = new Map(current);
	const incomingNos = new Set();

	(tickets || []).forEach((t) => {
		if (!t?.TicketNo) return;
		const key = String(t.TicketNo);
		incomingNos.add(key);
		if (next.has(key)) {
			// Reuse existing subject — only push new value
			next.get(key).next(t);
		} else {
			// New ticket — create a subject for it
			next.set(key, new BehaviorSubject(t));
		}
	});

	// Remove subjects for tickets that are no longer in the list
	for (const key of current.keys()) {
		if (!incomingNos.has(key)) {
			next.delete(key);
		}
	}

	ticketMap$.next(next);
}

/**
 * Patch a single ticket in the map without touching any other subject.
 * Call this from socket event handlers for zero-cost single-row updates.
 * @param {string} ticketNo
 * @param {Object} updates  — partial ticket fields to merge
 */
export const patchTicketInMap = (ticketNo, updates) => {
	if (!ticketNo) return;
	const key = String(ticketNo);
	const subject = ticketMap$.getValue().get(key);
	if (subject) {
		subject.next({ ...subject.getValue(), ...updates });
	}
};

/**
 * Add a single new ticket to the map (used by CreateTicket socket event).
 * @param {Object} ticket
 */
export const addTicketToMap = (ticket) => {
	if (!ticket?.TicketNo) return;
	const key = String(ticket.TicketNo);
	const current = ticketMap$.getValue();
	if (current.has(key)) {
		current.get(key).next(ticket);
	} else {
		const next = new Map(current);
		next.set(key, new BehaviorSubject(ticket));
		ticketMap$.next(next);
	}
};

// ─── Current View (RxJS-driven) ───────────────────────────────────────────────
//
// Tracks which panel is visible: "blank" | "detail" | "create"
// Moved out of React state so clicking a ticket only re-renders the isolated
// RightPanel component — not the entire TicketUi parent.

/** @type {BehaviorSubject<"blank"|"detail"|"create">} */
export const currentView$ = new BehaviorSubject("blank");

export const setCurrentView = (view) => currentView$.next(view);

// ─── Selected Ticket (RxJS-driven) ───────────────────────────────────────────
//
// Tracks only the TicketNo of the currently selected ticket.
// TicketItem subscribes to this to know if it is highlighted.
// Changing selection emits to exactly 2 items (old + new) — not all 800.

/** @type {BehaviorSubject<string|null>} */
export const selectedTicketNo$ = new BehaviorSubject(null);

export const setSelectedTicketNo = (ticketNo) =>
	selectedTicketNo$.next(ticketNo ? String(ticketNo) : null);

/** @type {BehaviorSubject<Object|null>} */
export const selectedTicket$ = new BehaviorSubject(null);

export const setSelectedTicketInStore = (ticket) => {
	selectedTicket$.next(ticket ?? null);
};

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * @param {Array} tickets
 */
export const setTicketRawList = (tickets) => {
	ticketRawList$.next(tickets || []);
	syncTicketMap(tickets);
};
export const setTicketActiveTab = (tab) => ticketActiveTab$.next(tab);
export const setTicketAgesFilter = (filter) => ticketAgesFilter$.next(filter);
// setTicketFilters replaces the entire filter object (callers from useUrlFilters pass the complete object)
export const setTicketFilters = (newFilters) => {
	ticketFilters$.next({ ...DEFAULT_FILTERS, ...newFilters });
};
export const clearTicketFilters = () => ticketFilters$.next({ ...DEFAULT_FILTERS });

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Subscribe to any BehaviorSubject using useSyncExternalStore (React 18 optimised)
 * @template T
 * @param {BehaviorSubject<T>} subject$
 * @returns {T}
 */
export function useSubjectValue(subject$) {
	return useSyncExternalStore(
		(callback) => {
			const sub = subject$.subscribe(callback);
			return () => sub.unsubscribe();
		},
		() => subject$.getValue()
	);
}

/**
 * Subscribe to a single ticket's BehaviorSubject from ticketMap$.
 * Only this hook (and therefore only this TicketItem) re-renders when that
 * specific ticket is patched — all other rows are completely unaffected.
 *
 * @param {string} ticketNo
 * @returns {Object|null} the latest ticket data
 */
export function useTicketFromMap(ticketNo) {
	const key = ticketNo ? String(ticketNo) : null;

	// We need to subscribe to the *inner* BehaviorSubject for the ticket,
	// but the inner subject reference itself may not exist yet (race on first render).
	// We fall back gracefully: read from the map, and if the subject isn't there yet,
	// return null so the item renders nothing (it will re-render once the map populates).
	return useSyncExternalStore(
		(callback) => {
			if (!key) return () => {};
			// Subscribe to both the map (in case the subject is added later)
			// and the inner subject (for per-field updates).
			const mapSub = ticketMap$.subscribe(() => callback());
			const innerSubject = ticketMap$.getValue().get(key);
			const innerSub = innerSubject ? innerSubject.subscribe(() => callback()) : null;
			return () => {
				mapSub.unsubscribe();
				if (innerSub) innerSub.unsubscribe();
			};
		},
		() => {
			if (!key) return null;
			return ticketMap$.getValue().get(key)?.getValue() ?? null;
		}
	);
}

/**
 * Returns true only when this ticket is the currently selected one.
 * Subscribes to selectedTicketNo$ — so on a click, only 2 TicketItems
 * (old selected + new selected) re-render. The other 798 are untouched.
 *
 * @param {string} ticketNo
 * @returns {boolean}
 */
export function useIsTicketSelected(ticketNo) {
	return useSyncExternalStore(
		(callback) => {
			const sub = selectedTicketNo$.subscribe(callback);
			return () => sub.unsubscribe();
		},
		() => selectedTicketNo$.getValue() === (ticketNo ? String(ticketNo) : null)
	);
}
