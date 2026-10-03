import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AllowedDomains = ["localhost", "http://calllog.web/", "http://calllog.web/", "calllog.web"];

const ALLOWED_COMPANY = "optigohub";

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
 * Reads all `skey` tokens from cookies and returns parsed session objects.
 * Deduplicated by userId / email.
 */
export function getAllDetectedSessions() {
  const tokens = getAllSkeyTokens();
  try {
    const local = localStorage.getItem("app_active_skey");
    if (local && !tokens.includes(local)) {
      tokens.push(local);
    }
  } catch (_) {}
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
 * Exhaustively purges all `skey` cookies across every possible path and domain variant.
 * This completely cleans up phantom/ghost duplicate cookies.
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
        Cookies.remove("skey", opts);

        // Direct manual cookie header expire fallback
        let expireStr = `skey=; Path=${p}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        if (d) expireStr += `; Domain=${d}`;
        document.cookie = expireStr;
      } catch (_) {}
    }
  }
}

/**
 * Sets a single canonical `skey` cookie while ensuring no conflicting duplicates exist.
 * Configured with a 30-day persistence to prevent overnight session loss on browser close.
 */
export function syncActiveSkeyCookie(token) {
  if (!token) {
    purgeAllSkeyCookies();
    return;
  }
  purgeAllSkeyCookies();
  Cookies.set("skey", token, { path: "/", expires: 30, sameSite: "Lax" });
}

/**
 * Primary token accessor:
 * Checks localStorage ("app_active_skey") first.
 * If not in localStorage, falls back to detected cookie sessions or saved accounts.
 * Returns the token string even if near/at expiry so caller can auto-renew with backend.
 */
export function getActiveAuthToken() {
  if (typeof window === "undefined") return null;

  try {
    const local = localStorage.getItem("app_active_skey");
    if (local && typeof local === "string" && local.trim()) {
      const parsed = parseTokenPayload(local);
      if (parsed?.userId) {
        return local.trim();
      }
    }
  } catch (_) {}

  // Fallback: examine all tokens from cookies
  const detected = getAllDetectedSessions();
  const valid = detected.find((s) => !s.isExpired) || detected[0];
  if (valid?.skey) {
    return valid.skey;
  }

  // Fallback: check saved accounts list
  try {
    const saved = JSON.parse(localStorage.getItem("saved_accounts_list") || "[]");
    if (Array.isArray(saved) && saved.length > 0) {
      const sorted = saved.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
      if (sorted[0]?.skey) {
        return sorted[0].skey;
      }
    }
  } catch (_) {}

  // Last resort: standard cookie
  return Cookies.get("skey") || null;
}

/**
 * Sets the active user session atomically:
 * 1. Writes to localStorage ("app_active_skey")
 * 2. Purges conflicting cookies and synchronizes a single canonical cookie
 */
export function setActiveAuthSession(token) {
  if (!token) {
    clearActiveAuthSession();
    return;
  }
  try {
    localStorage.setItem("app_active_skey", token);
  } catch (err) {
    console.warn("Failed to set app_active_skey in localStorage:", err);
  }
  syncActiveSkeyCookie(token);
}

/**
 * Completely clears the active user session:
 * Clears localStorage tokens, direct credentials, and purges all cookies.
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


