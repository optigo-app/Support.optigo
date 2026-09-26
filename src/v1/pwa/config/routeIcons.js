import callIcon from "../../assets/appicons/optimized/call.png";
import newCallIcon from "../../assets/appicons/optimized/newcall.png";
import archiveIcon from "../../assets/appicons/optimized/archive.png";
import ticketIcon from "../../assets/appicons/optimized/ticket.png";
import orderIcon from "../../assets/appicons/optimized/order.png";
import trainingIcon from "../../assets/appicons/optimized/training.png";
import defaultLogo from "../../assets/logos/Black_Optigo_R_Logo.svg";

/**
 * Route-to-Icon Mapping Matrix
 * Each entry defines:
 * - key: Unique module identifier
 * - matches: Function or route prefixes that match the route
 * - bundledIcon: Webpack bundled image asset for React UI rendering
 * - publicIcon192: Static public URL for PWA 192x192 manifest icon
 * - publicIcon512: Static public URL for PWA 512x512 manifest icon
 * - favicon32: Static public URL for 32x32 browser tab favicon
 * - favicon64: Static public URL for 64x64 browser tab touch/high-dpi icon
 * - name: Full application title when installed from this route
 * - shortName: Concise home screen / app shortcut name
 * - description: Module-specific description for PWA install prompt
 * - themeColor: Module theme accent
 */
export const ROUTE_ICON_CONFIG = {
  callLog: {
    key: "callLog",
    label: "Call Log",
    bundledIcon: callIcon,
    publicIcon192: "/appicons/call-192.png",
    publicIcon512: "/appicons/call-512.png",
    favicon32: "/appicons/call-favicon-32.png",
    favicon64: "/appicons/call-favicon-64.png",
    name: "Optigo - Call Logger",
    shortName: "Calls",
    description: "Manage and monitor real-time business phone calls and client interactions.",
    startUrl: "/callLog",
    themeColor: "#2563EB",
  },
  newCall: {
    key: "newCall",
    label: "New Call",
    bundledIcon: newCallIcon,
    publicIcon192: "/appicons/newcall-192.png",
    publicIcon512: "/appicons/newcall-512.png",
    favicon32: "/appicons/newcall-favicon-32.png",
    favicon64: "/appicons/newcall-favicon-64.png",
    name: "Optigo - New Call",
    shortName: "New Call",
    description: "Initiate and log incoming and outgoing phone calls instantly.",
    startUrl: "/newCall",
    themeColor: "#10B981",
  },
  archive: {
    key: "archive",
    label: "Archived Calls",
    bundledIcon: archiveIcon,
    publicIcon192: "/appicons/archive-192.png",
    publicIcon512: "/appicons/archive-512.png",
    favicon32: "/appicons/archive-favicon-32.png",
    favicon64: "/appicons/archive-favicon-64.png",
    name: "Optigo - Archived Calls",
    shortName: "Archive",
    description: "Search and restore historical call logs and records.",
    startUrl: "/Archive",
    themeColor: "#64748B",
  },
  ticket: {
    key: "ticket",
    label: "Ticket Management",
    bundledIcon: ticketIcon,
    publicIcon192: "/appicons/ticket-192.png",
    publicIcon512: "/appicons/ticket-512.png",
    favicon32: "/appicons/ticket-favicon-32.png",
    favicon64: "/appicons/ticket-favicon-64.png",
    name: "Optigo - Ticket Management",
    shortName: "Tickets",
    description: "Track, prioritize, and resolve enterprise support tickets.",
    startUrl: "/Ticket",
    themeColor: "#8B5CF6",
  },
  orders: {
    key: "orders",
    label: "Orders & Delivery",
    bundledIcon: orderIcon,
    publicIcon192: "/appicons/order-192.png",
    publicIcon512: "/appicons/order-512.png",
    favicon32: "/appicons/order-favicon-32.png",
    favicon64: "/appicons/order-favicon-64.png",
    name: "Optigo - Orders",
    shortName: "Orders",
    description: "Real-time delivery management and order tracking.",
    startUrl: "/Orders",
    themeColor: "#F59E0B",
  },
  training: {
    key: "training",
    label: "Training Dashboard",
    bundledIcon: trainingIcon,
    publicIcon192: "/appicons/training-192.png",
    publicIcon512: "/appicons/training-512.png",
    favicon32: "/appicons/training-favicon-32.png",
    favicon64: "/appicons/training-favicon-64.png",
    name: "Optigo - Training",
    shortName: "Training",
    description: "Corporate training, sessions, and employee learning management.",
    startUrl: "/Training",
    themeColor: "#06B6D4",
  },
  default: {
    key: "default",
    label: "Optigo Call Logger",
    bundledIcon: callIcon,
    publicIcon192: "/appicons/call-192.png",
    publicIcon512: "/appicons/call-512.png",
    favicon32: "/appicons/call-favicon-32.png",
    favicon64: "/appicons/call-favicon-64.png",
    name: "Optigo - Call Logger",
    shortName: "Calls",
    description: "Enterprise operations, call logging, ticket management, and real-time business intelligence.",
    startUrl: "/",
    themeColor: "#2563EB",
  },
};

/**
 * Resolves a route pathname to the corresponding module icon config
 * @param {string} pathname
 * @returns {typeof ROUTE_ICON_CONFIG.callLog}
 */
export function getRouteIconConfig(pathname = "") {
  const path = (pathname || "").toLowerCase().replace(/\/$/, "");

  // 1. New Call
  if (path === "/newcall" || path.startsWith("/newcall/")) {
    return ROUTE_ICON_CONFIG.newCall;
  }

  // 2. Archive
  if (path === "/archive" || path.startsWith("/archive/")) {
    return ROUTE_ICON_CONFIG.archive;
  }

  // 3. Ticket
  if (path === "/ticket" || path.startsWith("/ticket/")) {
    return ROUTE_ICON_CONFIG.ticket;
  }

  // 4. Orders & Order Request
  if (path === "/orders" || path.startsWith("/orders/") || path === "/orderrequest" || path.startsWith("/orderrequest/")) {
    return ROUTE_ICON_CONFIG.orders;
  }

  // 5. Training
  if (path === "/training" || path.startsWith("/training/")) {
    return ROUTE_ICON_CONFIG.training;
  }

  // 6. Call Log / Root ("All")
  if (path === "" || path === "/" || path === "/calllog" || path.startsWith("/calllog/")) {
    return ROUTE_ICON_CONFIG.callLog;
  }

  // Default fallback (login, account, 404, etc.)
  return ROUTE_ICON_CONFIG.default;
}
