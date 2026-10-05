import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AllowedDomains = ["localhost", "http://calllog.web/", "http://calllog.web/", "calllog.web"];

const ALLOWED_COMPANY = "optigohub";

// Our OWN app session cookie. The shared `skey` cookie belongs to other
// Optigo domains and must only be READ (to suggest a session), never written/removed.
export const APP_AUTH_COOKIE = "cl_auth_token";
const REMEMBER_ME_KEY = "cl_remember_me";
const AUTH_EVENT_KEY = "cl_auth_event";
const REMEMBER_DAYS = 30;

function broadcastAuthEvent(type) {
  try {
    localStorage.setItem(AUTH_EVENT_KEY, `${type}:${Date.now()}`);
  } catch (_) {}
}

export function getRememberMe() {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === "1";
  } catch (_) {
    return false;
  }
}

export function setRememberMe(remember) {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, remember ? "1" : "0");
  } catch (_) {}
}

// if (process.env.NODE_ENV === "development" || AllowedDomains.some((domain) => window.location.hostname.includes(domain))) {
//   Cookies.set("skey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6ImFtVnVhWE5BWldjdVkyOXQiLCJleHAiOjE3NDYxODg3NDgsInVpZCI6ImFtVnVhWE5BWldjdVkyOXQiLCJ5YyI6ImUzdHVlbVZ1ZlgxN2V6SXdmWDE3ZTI5eVlXbHNNalY5Zlh0N2IzSmhhV3d5TlgxOSIsInN2IjoiMCJ9.Ui_Taj21Fb8oDWvhEc8IwHJZTeFxUos46Jb6H4Iyk8M", { path: "/" });
//   // Cookies.set("skey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6IllXMXlkWFJBWldjdVkyOXQiLCJleHAiOjE3NDcxMzk2ODYsInVpZCI6IllXMXlkWFJBWldjdVkyOXQiLCJ5YyI6ImUzdHVlbVZ1ZlgxN2V6SXdmWDE3ZTI5eVlXbHNNalY5Zlh0N2IzSmhhV3d5TlgxOSIsInN2IjoiMCJ9.m4NonzyJfWdM0frEq1Cn4h1ABThBa1wgosx8Z7Mg5VI", { path: "/" });
// }
// Amrut Sir Login Cookies
// if (process.env.NODE_ENV === 'development') {
//     console.log("AuthUtils.js is running in development mode");
// }

// LIVE Testing Cookie
// if (process.env.NODE_ENV === "development" || AllowedDomains.some((domain) => window.location.hostname.includes(domain))) {
// 	Cookies.set("skey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6ImNtRnFZVzR1Y0VCdmNtRnBiQzVwYmc9PSIsImV4cCI6MTc1Njc5MjMwOCwidWlkIjoiY21GcVlXNHVjRUJ2Y21GcGJDNXBiZz09IiwieWMiOiJlM3RzYVhabExtOXdkR2xuYjJGd2NITXVZMjl0ZlgxN2V6SXdmWDE3ZTI5d2RHbG5iMmgxWW4xOWUzdHZjSFJwWjI5b2RXSjlmUT09Iiwic3YiOiIxIn0.27EeeBr3CxvX3yb45FgfzWZcNOpt_pQx_9lUubpYNAA", { path: "/" });
// }
export function decodeBase64(base64Str) {
  try {
    return decodeURIComponent(
      atob(base64Str)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
  } catch (error) {
    console.error("Base64 decoding failed:", error);
    return null;
  }
}

/**
 * Extracts ALL `skey` token values present in browser `document.cookie`.
 * When multiple cookies share the name `skey` (different paths/domains),
 * standard Cookies.get("skey") only returns an arbitrary one.
 * This parser retrieves every unique `skey` string.
 */
export function getAllSkeyTokens() {
  if (typeof document === "undefined" || !document.cookie) {
    return [];
  }
  const raw = document.cookie || "";
  const parts = raw.split(";");
  const tokens = [];

  for (const part of parts) {
    const trimmed = part.trim();
    const equalIdx = trimmed.indexOf("=");
    if (equalIdx === -1) continue;

    const key = trimmed.slice(0, equalIdx).trim().toLowerCase();
    const val = trimmed.slice(equalIdx + 1).trim();

    if (key === "skey" && val && !tokens.includes(val)) {
      tokens.push(val);
    }
  }

  return tokens;
}

/**
 * Safely parses any JWT or encoded token payload without throwing.
 */
export function parseTokenPayload(token) {
  if (!token || typeof token !== "string") return null;

  try {
    // 1. Try standard JWT decode
    const decoded = jwtDecode(token);
    const companyEncoded = decoded?.uid;
    let user = companyEncoded ? decodeBase64(companyEncoded) : null;
    if (!user && decoded?.email) user = decoded.email;
    if (!user && decoded?.sub) user = decoded.sub;

    const isExpired = decoded?.exp
      ? decoded.exp * 1000 < Date.now()
      : false;

    return {
      ...decoded,
      userId: user,
      token,
      isExpired,
    };
  } catch (jwtErr) {
    // 2. Fallback: try direct base64 JSON
    try {
      const rawClean = token.trim().replace(/\s+/g, "");
      const decodedStr = decodeBase64(rawClean) || atob(rawClean);
      const parsed = JSON.parse(decodedStr);
      if (parsed?.appuserid || parsed?.email) {
        let user = parsed.appuserid || parsed.email;
        try {
          const dec = decodeBase64(user) || atob(String(user).trim());
          if (dec) user = dec;
        } catch (_) {}

        return {
          ...parsed,
          userId: user,
          token,
          isExpired: false,
        };
      }
    } catch (_) {}

    return null;
  }
}

/**
 * Reads all shared `skey` tokens from cookies (READ-ONLY) and returns parsed session objects.
 * Used only to SUGGEST a session on the login screen - never for auto-login.
 * Deduplicated by userId / email.
 */
export function getAllDetectedSessions() {
  const tokens = getAllSkeyTokens();
  const sessions = [];
  const seenUserIds = new Set();

  for (const tok of tokens) {
    const parsed = parseTokenPayload(tok);
    if (parsed?.userId) {
      const key = parsed.userId.toLowerCase();
      if (!seenUserIds.has(key)) {
        seenUserIds.add(key);
        sessions.push({
          skey: tok,
          email: parsed.userId,
          yc: parsed.yc,
          sv: parsed.sv,
          exp: parsed.exp,
          isExpired: parsed.isExpired,
        });
      }
    }
  }

  // Sort unexpired first
  return sessions.sort((a, b) => (a.isExpired === b.isExpired ? 0 : a.isExpired ? 1 : -1));
}

/**
 * Purges OUR app auth cookie (cl_auth_token) across path/domain variants.
 * Does NOT touch the shared `skey` cookie used by other domains.
 */
export function purgeAllSkeyCookies() {
  if (typeof document === "undefined") return;

  const paths = ["/", "", window.location.pathname];
  const hostname = window.location.hostname || "";
  const domains = [undefined, "", hostname, `.${hostname}`];

  // Also include base domain if subdomain (e.g. calllog.web or optigoapps.com)
  const parts = hostname.split(".");
  if (parts.length > 2) {
    const parentDomain = parts.slice(-2).join(".");
    domains.push(parentDomain, `.${parentDomain}`);
  }

  for (const p of paths) {
    for (const d of domains) {
      try {
        const opts = { path: p };
        if (d) opts.domain = d;
        Cookies.remove(APP_AUTH_COOKIE, opts);

        // Direct manual cookie header expire fallback
        let expireStr = `${APP_AUTH_COOKIE}=; Path=${p}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        if (d) expireStr += `; Domain=${d}`;
        document.cookie = expireStr;
      } catch (_) {}
    }
  }
}

/**
 * Writes OUR app auth cookie.
 * - Remember me ON  -> persistent cookie (30 days)
 * - Remember me OFF -> session cookie (cleared when browser closes)
 */
export function syncActiveSkeyCookie(token) {
  purgeAllSkeyCookies();
  if (!token) return;
  const opts = { path: "/", sameSite: "Lax" };
  if (getRememberMe()) opts.expires = REMEMBER_DAYS;
  Cookies.set(APP_AUTH_COOKIE, token, opts);
}

/**
 * Primary token accessor: ONLY our own app cookie.
 * The shared `skey` cookie is intentionally NOT used here, so logging in on
 * another Optigo domain does not auto-login this app, and logout sticks.
 */
export function getActiveAuthToken() {
  if (typeof window === "undefined") return null;
  const tok = Cookies.get(APP_AUTH_COOKIE);
  if (tok && parseTokenPayload(tok)?.userId) return tok.trim();
  return null;
}

/**
 * Sets the active app session in our own cookie.
 * @param {string} token
 * @param {boolean} [remember] - if provided, updates the "remember me" preference.
 */
export function setActiveAuthSession(token, remember) {
  if (!token) {
    clearActiveAuthSession();
    return;
  }
  if (typeof remember === "boolean") setRememberMe(remember);
  try {
    // Legacy cleanup: token used to be persisted here, which broke logout.
    localStorage.removeItem("app_active_skey");
  } catch (_) {}
  syncActiveSkeyCookie(token);
  broadcastAuthEvent("login");
}

/**
 * Completely clears the active app session (our cookie + local state).
 * Leaves the shared `skey` cookie untouched so other domains stay logged in.
 */
export function clearActiveAuthSession() {
  try {
    localStorage.removeItem("app_active_skey");
    localStorage.removeItem("app_direct_credentials");
    localStorage.removeItem("app_current_user");
    sessionStorage.removeItem("direct_token_credentials");
    sessionStorage.removeItem("currentUser");
  } catch (_) {}
  purgeAllSkeyCookies();
  broadcastAuthEvent("logout");
}

/**
 * Preserved credentials extractor for backward compatibility.
 * Accepts an optional token override or uses the active token.
 */
export function GetCredentialsFromCookie(tokenOverride) {
  try {
    const token = tokenOverride || getActiveAuthToken();
    if (!token) {
      console.warn("No active skey token found");
      return null;
    }
    const parsed = parseTokenPayload(token);
    if (!parsed) {
      console.warn("Failed to parse token payload");
      return null;
    }
    return {
      ...parsed,
      userId: parsed.userId,
    };
  } catch (error) {
    console.error("Failed to parse credentials from token:", error);
    return null;
  }
}

/**
 * Logout cookie remover (calls exhaustive purge)
 */
export function removeSkeyCookie() {
  clearActiveAuthSession();
}

/**
 * Returns the currently active logged-in user object from session or saved accounts
 */
export function getCurrentUser() {
  try {
    const stored = sessionStorage.getItem("currentUser");
    if (stored) return JSON.parse(stored);
    const saved = JSON.parse(localStorage.getItem("saved_accounts_list") || "[]");
    if (Array.isArray(saved) && saved.length > 0) {
      const last = saved[saved.length - 1];
      return {
        ...last,
        fullName:
          last.fullName ||
          [last.firstname, last.lastname].filter(Boolean).join(" ") ||
          last.email ||
          "",
      };
    }
  } catch (_) {}
  return null;
}


