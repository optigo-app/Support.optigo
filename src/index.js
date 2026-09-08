import "./styles/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Entry from "./Entry";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { registerAuthServiceWorker } from "./utils/registerAuthServiceWorker";
import { Maintheme } from "./libs/DateTheme";
import { AuthProvider } from "./context/UseAuth";
import { TicketProvider } from "./context/useTicket";
import { CallLogProvider } from "./context/UseCallLog";
import { NotificationProvider } from "./context/NotificationManager";
import { PWAProvider } from "./pwa";
import "@fontsource/poppins";
import { HelmetProvider } from "react-helmet-async";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "sonner";
import Spinner from "./components/_ui/Spinner";

registerAuthServiceWorker();

// ─── Runtime base-path detection ────────────────────────────────────────────
// Instead of hardcoding the deployment sub-path (which breaks when the same
// build is deployed to different environments), we look at the <script src>
// of the already-loaded main bundle.  Because the browser always resolves
// script srcs to absolute URLs, this gives us the exact origin + path prefix
// where the static files live — regardless of whether the app is at "/" or
// at "/calllogweb/call/" or anywhere else.
//
// Example on local:  script.src = "http://nzen/calllogweb/call/static/js/main.abc.js"
//                    → detectedBase  = "/calllogweb/call"
//                    → __webpack_public_path__ = "http://nzen/calllogweb/call/"
//
// Example on live:   script.src = "https://mydomain.com/static/js/main.abc.js"
//                    → detectedBase  = ""
//                    → __webpack_public_path__ = "https://mydomain.com/"
//
// Setting __webpack_public_path__ before any lazy() import resolves ensures
// all dynamic chunks load from the correct absolute URL.
// ─────────────────────────────────────────────────────────────────────────────

function detectAppBase() {
  try {
    const mainScript = Array.from(document.scripts).find(
      (s) => s.src && s.src.includes("/static/js/main.")
    );
    if (mainScript) {
      const idx = mainScript.src.indexOf("/static/js/main.");
      // e.g. "http://nzen/calllogweb/call"  (no trailing slash)
      const baseHref = mainScript.src.substring(0, idx);
      return baseHref;
    }
  } catch (_) {
    // ignore — fall through to empty string (root)
  }
  return "";
}

const _appBase = detectAppBase(); // e.g. "http://nzen/calllogweb/call"

// Override webpack's chunk-loading path BEFORE React renders any lazy component.
// eslint-disable-next-line no-undef
if (_appBase) __webpack_public_path__ = _appBase + "/";

// Derive the BrowserRouter basename from the same detected base href.
// We only want the *pathname* part (strip origin).
function getBaseName() {
  try {
    if (_appBase) {
      return new URL(_appBase).pathname; // e.g. "/calllogweb/call"
    }
  } catch (_) {}
  // Fallback for local dev (script src won't have hashed name during npm start)
  const path = window.location.pathname;
  const match = path.match(/^\/([^/]+\/[^/]+)/);
  return match ? `/${match[1]}` : "/";
}

const Main = () => {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <HelmetProvider>
          <BrowserRouter basename={getBaseName()}>
            <PWAProvider>
              <SocketProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <CallLogProvider>
                      <TicketProvider>
                        <ThemeProvider theme={Maintheme}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <CssBaseline />
                            <Entry />
                            <Toaster />
                          </LocalizationProvider>
                        </ThemeProvider>
                      </TicketProvider>
                    </CallLogProvider>
                  </NotificationProvider>
                </AuthProvider>
              </SocketProvider>
            </PWAProvider>
          </BrowserRouter>
        </HelmetProvider>
      </Suspense>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Main />);
