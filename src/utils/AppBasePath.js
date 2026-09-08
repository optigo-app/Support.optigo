/**
 * getAppBasePath()
 *
 * Returns the base *pathname* (no trailing slash) where this app is deployed.
 *
 * Works by inspecting the already-loaded main bundle script tag in the DOM.
 * Because browsers always resolve <script src> to absolute URLs, we can
 * strip the "/static/js/main.*" suffix to recover the deployment root.
 *
 * Examples
 * ─────────────────────────────────────────────────────────────────────
 *  Local  (nzen sub-path): script.src = "http://nzen/calllogweb/call/static/js/main.abc.js"
 *                           → returns "/calllogweb/call"
 *
 *  Live   (custom domain): script.src = "https://mydomain.com/static/js/main.abc.js"
 *                           → returns ""   (app is at root, so no prefix needed)
 *
 *  Dev    (npm start):      no hashed main.*.js in DOM
 *                           → falls back to the 2-segment regex on pathname
 * ─────────────────────────────────────────────────────────────────────
 */
export function getAppBasePath() {
  try {
    const mainScript = Array.from(document.scripts).find(
      (s) => s.src && s.src.includes("/static/js/main.")
    );
    if (mainScript) {
      const idx = mainScript.src.indexOf("/static/js/main.");
      const baseHref = mainScript.src.substring(0, idx); // full absolute URL, e.g. "http://nzen/calllogweb/call"
      return new URL(baseHref).pathname.replace(/\/$/, ""); // just the pathname, e.g. "/calllogweb/call"
    }
  } catch (_) {
    // ignore
  }

  // Fallback for local dev — derive from first 2 path segments
  const path = window.location.pathname;
  const match = path.match(/^(\/[^/]+\/[^/]+)/);
  return match ? match[1] : "";
}

export function isArchiveDomain() {
  const host = typeof window !== "undefined" ? window?.location?.hostname || "" : "";
  return (
    host.includes("localhost") ||
    host.includes("nzen") ||
    host.includes("calllog.web")
  );
}

