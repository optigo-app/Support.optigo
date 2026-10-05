import { useContext, createContext, useState, useEffect } from "react";
import {
  GetCredentialsFromCookie,
  decodeBase64,
  getActiveAuthToken,
  setActiveAuthSession,
  clearActiveAuthSession,
  getAllDetectedSessions,
  syncActiveSkeyCookie,
  parseTokenPayload,
} from "../utils/AuthUtils";
import { createJWT } from "../utils/jwt";
import { getAppBasePath } from "../utils/AppBasePath";
import { BaseAPI } from "../apis/BaseAPI";
import Cookies from "js-cookie";
import CenteredCircularLoader from "../components/CallLogger/Loading";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocketEvent } from "../hooks/useSocketListener";
import Spinner from "../components/_ui/Spinner";

const AuthContext = createContext(null);

const SERVICE_CONFIG = {
  TICKET: {
    SERVICE_NAME: "Ticket",
    VERSION_NO: "_Ticketv4",
    SP: "14",
  },
  CALL_LOG: {
    SERVICE_NAME: "CallLog",
    VERSION_NO: "v4",
    SP: "14",
  },
};

const PUBLIC_ROUTES = ["/login"]; // public pages

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [detectedSession, setDetectedSession] = useState(null);
  const [detectedSessions, setDetectedSessions] = useState([]);
  const [services, setServices] = useState({
    ticket: false,
    callLog: false,
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [CompanyInfo, SetCompanyInfo] = useState(null);
  const [UserRights, setUserRights] = useState(() => {
    const stored = sessionStorage.getItem("UserRights");
    return stored ? JSON.parse(stored) : [];
  });
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saved_accounts_list") || "[]");
    } catch {
      return [];
    }
  });

  const clearState = () => {
    setUser(null);
    setToken(null);
    setServices({
      ticket: false,
      callLog: false,
    });
    sessionStorage.removeItem("direct_token_credentials");
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("app_direct_credentials");
    localStorage.removeItem("app_current_user");
  };

  const switchAccount = (skey) => {
    setActiveAuthSession(skey);
    sessionStorage.clear();
    localStorage.removeItem("app_direct_credentials");
    localStorage.removeItem("app_current_user");
    window.location.href = `${getAppBasePath()}/`;
  };

  const removeSavedAccount = (companyCode, email) => {
    const updated = savedAccounts.filter(
      (acc) =>
        !(
          acc.companyCode?.toLowerCase() === companyCode?.toLowerCase() &&
          acc.email?.toLowerCase() === email?.toLowerCase()
        ),
    );
    setSavedAccounts(updated);
    localStorage.setItem("saved_accounts_list", JSON.stringify(updated));
  };

  const getToken = async (userId, fallbackCredentials = null) => {
    try {
      const res = await BaseAPI.getToken(userId);
      if (res?.rd1?.[0] && res?.rd?.[0]) {
        const user = {
          ...res.rd1[0],
          fullName: `${res.rd1[0].firstname} ${res.rd1[0].lastname}`,
        };
        SetCompanyInfo({ ...res?.rd?.[0], ...res?.rd1[0] });
        setUser(user);
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("app_current_user", JSON.stringify(user));
        setToken(res.rd[0]);
        const rights = res?.rd3 ?? [];
        setUserRights(rights);
        sessionStorage.setItem("UserRights", JSON.stringify(rights));

        // Auto-refresh or create persistent active session token so all tabs & next day work seamlessly
        try {
          let activeSkey = getActiveAuthToken();
          let needsRenewal = false;

          if (activeSkey) {
            const parsed = parseTokenPayload(activeSkey);
            if (!parsed || parsed.isExpired) {
              needsRenewal = true;
            }
          } else {
            needsRenewal = true;
          }

          if (needsRenewal) {
            try {
              const freshJwt = await createJWT({
                userid: user.userid || userId,
                yearcode:
                  res.rd[0]?.yearcode ||
                  res.rd1[0]?.yearcode ||
                  fallbackCredentials?.yc ||
                  "",
                svid:
                  res.rd[0]?.svid ||
                  fallbackCredentials?.sv ||
                  "1",
              });
              if (freshJwt) {
                activeSkey = freshJwt;
                setActiveAuthSession(freshJwt);
              }
            } catch (jwtErr) {
              console.warn("Could not generate fresh JWT:", jwtErr);
            }
          }

          if (activeSkey) {
            setActiveAuthSession(activeSkey);
            const savedList = JSON.parse(
              localStorage.getItem("saved_accounts_list") || "[]",
            );
            const newAccount = {
              companyCode:
                res.rd[0]?.companycode || res.rd1[0]?.companycode || "",
              email: userId || user.email || user.userid || "",
              skey: activeSkey,
              firstname: user.firstname || "",
              lastname: user.lastname || "",
              designation: user.designation || "",
              lastActive: Date.now(),
            };

            const filtered = savedList.filter(
              (acc) =>
                !(
                  acc.companyCode.toLowerCase() ===
                    newAccount.companyCode.toLowerCase() &&
                  acc.email.toLowerCase() === newAccount.email.toLowerCase()
                ),
            );
            filtered.push(newAccount);
            localStorage.setItem(
              "saved_accounts_list",
              JSON.stringify(filtered),
            );
          }
        } catch (e) {
          console.error("Failed to update saved accounts list:", e);
        }

        return res;
      }
      throw new Error("Invalid token response");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const updateVersion = async (version) => {
    setIsUpdate(true);
    try {
      await BaseAPI.UpdateVersion(version);
      setIsUpdate(false);
    } catch (error) {
      console.error("Error updating version:", error);
      setIsUpdate(false);
    }
  };

  const initializeService = (service, credentials) => {
    if (!credentials) return false;

    const config = {
      YEAR_CODE: credentials.yc,
      SV: credentials.sv,
      SP: service.SP,
      APP_USER_ID: credentials.userId,
      VERSION_NO: service.VERSION_NO,
    };

    BaseAPI.initialize(config, service.SERVICE_NAME);
    return true;
  };

  // Cross-tab synchronization: logout in one tab logs out all tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "cl_auth_event" && String(e.newValue || "").startsWith("logout")) {
        clearState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data === "CHECK_COOKIE") {
              // Session lives in our own cookie (cl_auth_token); nothing to heal here.
              // IMPORTANT: Never call clearActiveAuthSession() here in a background timer!
            }
          };

          window.swChannel = messageChannel;
          registration.active.postMessage("START_TIMER", [
            messageChannel.port2,
          ]);
        })
        .catch((err) => {
          console.error("Service worker error:", err);
        });

      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Global SW message received:", event.data);
      });
    }

    return () => {
      if (
        window.swChannel?.port1 &&
        typeof window.swChannel.port1.close === "function"
      ) {
        window.swChannel.port1.close();
      }
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        // 1. Check for direct login token in URL query (e.g. ?-=ey... or ?token=ey...)
        let directToken = params.get("-") || params.get("token") || params.get("auth");
        if (!directToken) {
          for (const [key, val] of params.entries()) {
            if (val && typeof val === "string" && val.trim().startsWith("ey")) {
              directToken = val.trim();
              break;
            } else if (key && typeof key === "string" && key.trim().startsWith("ey")) {
              directToken = key.trim();
              break;
            }
          }
        }

        let directCredentials = null;
        if (directToken) {
          try {
            const rawClean = directToken.trim().replace(/\s+/g, "");
            const decodedStr = decodeBase64(rawClean) || atob(rawClean);
            const parsed = JSON.parse(decodedStr);
            if (parsed?.appuserid && parsed?.yearcode) {
              let userId = parsed.appuserid;
              try {
                const decUser = decodeBase64(parsed.appuserid) || atob(String(parsed.appuserid).trim().replace(/\s+/g, ""));
                if (decUser) userId = decUser;
              } catch (_) {}

              const host = window?.location?.hostname || "";
              const isLocal =
                host === "localhost" ||
                host === "127.0.0.1" ||
                host.includes("calllog.web") ||
                host.includes("nzen") ||
                process.env.NODE_ENV !== "production";
              const sv = isLocal ? "0" : "1";

              directCredentials = {
                userId,
                yc: parsed.yearcode,
                sv,
              };

              sessionStorage.setItem(
                "direct_token_credentials",
                JSON.stringify(directCredentials),
              );
              localStorage.setItem(
                "app_direct_credentials",
                JSON.stringify(directCredentials),
              );
            }
          } catch (err) {
            console.error("Failed to parse direct token credentials from URL:", err);
          }
        }

        // Check sessionStorage first, then fallback to localStorage so duplicated tabs and new tabs inherit it
        if (!directCredentials) {
          try {
            const stored =
              sessionStorage.getItem("direct_token_credentials") ||
              localStorage.getItem("app_direct_credentials");
            if (stored) {
              directCredentials = JSON.parse(stored);
            }
          } catch (_) {}
        }

        // 2. Check for skey in URL query parameters first
        const urlSkey = params.get("skey");

        if (urlSkey) {
          console.log("Found skey in URL, activating session...");
          setActiveAuthSession(urlSkey);

          // Clean the query parameter from the URL to keep it tidy
          params.delete("skey");
          const newSearch = params.toString();
          const newPath =
            window.location.pathname + (newSearch ? `?${newSearch}` : "");
          window.history.replaceState({}, "", newPath);
        }

        const activeToken = getActiveAuthToken();
        let cookieUser = null;
        if (activeToken) {
          cookieUser = GetCredentialsFromCookie(activeToken);
          if (cookieUser) {
            // Refresh our own cookie (extends expiry when "remember me" is on)
            syncActiveSkeyCookie(activeToken);
          }
        }

        // NOTE: No auto-login from saved accounts or the shared `skey` cookie.
        // Those are only offered as choices on the login screen.

        const effectiveUser = directCredentials || cookieUser;

        if (effectiveUser) {
          // Initialize both services
          const ticketInitialized = initializeService(
            SERVICE_CONFIG.TICKET,
            effectiveUser,
          );
          const callLogInitialized = initializeService(
            SERVICE_CONFIG.CALL_LOG,
            effectiveUser,
          );

          setServices({
            ticket: ticketInitialized,
            callLog: callLogInitialized,
          });

          await getToken(effectiveUser.userId, effectiveUser);
        } else {
          console.log("No active app session found");
          clearState();

          // Read ALL detected sessions across browser cookies
          const rawSessions = getAllDetectedSessions();
          if (rawSessions.length > 0) {
            const enriched = [];
            for (const s of rawSessions) {
              try {
                initializeService(SERVICE_CONFIG.TICKET, s);
                initializeService(SERVICE_CONFIG.CALL_LOG, s);

                const res = await BaseAPI.getToken(s.email);
                enriched.push({
                  email: s.email,
                  companyCode:
                    res?.rd?.[0]?.companycode || res?.rd1?.[0]?.companycode || "",
                  firstname: res?.rd1?.[0]?.firstname || "",
                  lastname: res?.rd1?.[0]?.lastname || "",
                  designation: res?.rd1?.[0]?.designation || "",
                  skey: s.skey,
                  isExpired: s.isExpired,
                });
              } catch (e) {
                console.error("Failed to fetch detected session info for", s.email, e);
                enriched.push({
                  email: s.email,
                  companyCode: "",
                  firstname: "",
                  lastname: "",
                  designation: "",
                  skey: s.skey,
                  isExpired: s.isExpired,
                });
              }
            }
            setDetectedSessions(enriched);
            if (enriched.length > 0) {
              setDetectedSession(enriched[0]);
            }
          } else {
            setDetectedSessions([]);
            setDetectedSession(null);
          }
        }
      } catch (error) {
        console.error("Error in initialization:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");
    const isPublic = PUBLIC_ROUTES.includes(currentPath || "/");
    const params = new URLSearchParams(location.search);
    const isAddAccount =
      params.get("addAccount") === "1" || params.get("add") === "1";

    if (user && isPublic && !isAddAccount) {
      navigate("/", { replace: true });
    } else if (!user && !isPublic) {
      navigate("/login", { replace: true });
    }
  }, [user, isInitialized, location.pathname, location.search, navigate]);

  // Add Call Events
  useSocketEvent("versionupdate", (data) => {
    // updateVersion(data.version);
    console.log(data);
  });

  const contextData = {
    user,
    token,
    isInitialized,
    services,
    clearState,
    getToken,
    initializeService,
    CompanyInfo,
    UserRights,
    updateVersion,
    isUpdate,
    detectedSession,
    setDetectedSession,
    detectedSessions,
    setDetectedSessions,
    savedAccounts,
    switchAccount,
    removeSavedAccount,
  };
  if (!isInitialized) {
    return <Spinner />;
  }

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
}
// 	return <AuthContext.Provider value={
// 		contextData}>{
// 			!isInitialized ?
// 		<CenteredCircularLoader /> : user
// 		? children : <UnauthorizedPage />
// 		}</AuthContext.Provider>;
// }

// Hook for consuming the Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const UnauthorizedPage = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Paper elevation={0} sx={{ p: 4, textAlign: "center" }}>
        <Box sx={{ mb: 2 }}>
          <LockOutlinedIcon color="error" sx={{ fontSize: 60 }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Unauthorized Access
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You do not have valid credentials or your session has expired. Please
          ensure you are logged in correctly or refresh the page.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleReload}>
          Reload Page
        </Button>
      </Paper>
    </Container>
  );
};
