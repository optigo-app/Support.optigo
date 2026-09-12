import { BehaviorSubject } from "rxjs";
import { useSyncExternalStore } from "react";

export const MODULE_PREFIXES = [
  {
    key: "ticket",
    label: "Ticket",
    path: "/Ticket",
    aliases: ["ticket", "tickets", "t"],
    iconName: "ticket",
    description: "Search in Tickets module",
    chipColor: "#3B82F6",
    chipBg: "#EFF6FF",
    chipBorder: "#BFDBFE",
  },
  {
    key: "call",
    label: "Call log",
    path: "/",
    aliases: ["call", "calllog", "c", "calls"],
    iconName: "call",
    description: "Search in Live Call Logs",
    chipColor: "#10B981",
    chipBg: "#ECFDF5",
    chipBorder: "#A7F3D0",
  },
  {
    key: "newcall",
    label: "New Call",
    path: "/newCall",
    aliases: ["newcall", "new", "nc", "newcalls", "new_call"],
    iconName: "newcall",
    description: "Search in New Call module",
    chipColor: "#6366F1",
    chipBg: "#EEF2FF",
    chipBorder: "#C7D2FE",
  },
  {
    key: "archive",
    label: "Archive Calllog",
    path: "/Archive",
    aliases: ["archive", "archived", "a"],
    iconName: "archive",
    description: "Search in Archived Call Logs",
    chipColor: "#F59E0B",
    chipBg: "#FFFBEB",
    chipBorder: "#FDE68A",
  },
  {
    key: "orders",
    label: "Orders",
    path: "/Orders",
    aliases: ["orders", "order", "delivery", "o"],
    iconName: "orders",
    description: "Search in Orders & Deliveries",
    chipColor: "#8B5CF6",
    chipBg: "#F5F3FF",
    chipBorder: "#DDD6FE",
  },
  {
    key: "training",
    label: "Training",
    path: "/Training",
    aliases: ["training", "tr", "trainings"],
    iconName: "training",
    description: "Search in Training module",
    chipColor: "#EC4899",
    chipBg: "#FDF2F8",
    chipBorder: "#FBCFE8",
  },
  {
    key: "orderrequest",
    label: "Order Request",
    path: "/OrderRequest",
    aliases: ["orderrequest", "request", "or", "requests"],
    iconName: "orderrequest",
    description: "Search in Order Requests",
    chipColor: "#06B6D4",
    chipBg: "#ECFEFF",
    chipBorder: "#A5F3FC",
  },
];

export function getModuleByPath(pathname = "/") {
  const normalized = pathname.toLowerCase();
  if (normalized.startsWith("/newcall")) {
    return MODULE_PREFIXES.find((m) => m.key === "newcall");
  }
  if (normalized === "/" || normalized.startsWith("/calllog")) {
    return MODULE_PREFIXES.find((m) => m.key === "call");
  }
  if (normalized.startsWith("/ticket")) {
    return MODULE_PREFIXES.find((m) => m.key === "ticket");
  }
  if (normalized.startsWith("/archive")) {
    return MODULE_PREFIXES.find((m) => m.key === "archive");
  }
  if (normalized.startsWith("/orders")) {
    return MODULE_PREFIXES.find((m) => m.key === "orders");
  }
  if (normalized.startsWith("/training")) {
    return MODULE_PREFIXES.find((m) => m.key === "training");
  }
  if (normalized.startsWith("/orderrequest")) {
    return MODULE_PREFIXES.find((m) => m.key === "orderrequest");
  }
  return null;
}

export function matchPrefix(prefixInput) {
  if (!prefixInput) return null;
  const clean = prefixInput.replace(/^@/, "").toLowerCase().trim();
  return MODULE_PREFIXES.find(
    (m) =>
      m.key.toLowerCase() === clean ||
      m.aliases.some((alias) => alias.toLowerCase() === clean)
  );
}

export function filterModuleSuggestions(query) {
  if (!query || !query.startsWith("@")) return [];
  const searchPart = query.slice(1).toLowerCase().trim();
  if (!searchPart) return MODULE_PREFIXES;

  return MODULE_PREFIXES.filter(
    (m) =>
      m.key.toLowerCase().includes(searchPart) ||
      m.label.toLowerCase().includes(searchPart) ||
      m.aliases.some((alias) => alias.toLowerCase().startsWith(searchPart))
  );
}

// ─── RxJS State Subjects ───────────────────────────────────────────────────────
export const globalActiveModule$ = new BehaviorSubject(null);
export const globalSearchQuery$ = new BehaviorSubject("");
export const globalSuggestionsOpen$ = new BehaviorSubject(false);

export const setActiveModule = (moduleObj) => {
  globalActiveModule$.next(moduleObj);
};

export const clearActiveModule = () => {
  globalActiveModule$.next(null);
};

export const setGlobalSearchQuery = (query) => {
  globalSearchQuery$.next(query);
};

export function dispatchGlobalSearch({ query, targetModule, navigate, currentPath }) {
  const trimmed = (query || "").trim();
  const destModule =
    targetModule ||
    getModuleByPath(currentPath) ||
    MODULE_PREFIXES.find((m) => m.key === "call") ||
    MODULE_PREFIXES[0];
  const targetPath = destModule ? destModule.path : "/";

  const searchParams = new URLSearchParams();
  if (trimmed) {
    searchParams.set("search", trimmed);
  }

  const fullSearchString = searchParams.toString() ? `?${searchParams.toString()}` : "";

  if (navigate) {
    navigate(`${targetPath}${fullSearchString}`);
  }
}

export function useRxSubject(subject$) {
  return useSyncExternalStore(
    (callback) => {
      const sub = subject$.subscribe(callback);
      return () => sub.unsubscribe();
    },
    () => subject$.getValue()
  );
}
