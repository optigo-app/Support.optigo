import { useContext, createContext, useState, useEffect } from "react";
import { GetCredentialsFromCookie } from "../utils/AuthUtils";
import { BaseAPI } from "../apis/BaseAPI";
import CenteredCircularLoader from "../components/CallLogger/Loading";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

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

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [services, setServices] = useState({
		ticket: false,
		callLog: false,
	});
	const [CompanyInfo, SetCompanyInfo] = useState(null);

	const clearState = () => {
		setUser(null);
		setToken(null);
		setServices({
			ticket: false,
			callLog: false,
		});
	};

	const getToken = async (userId) => {
		try {
			const res = await BaseAPI.getToken(userId);
			console.log("🚀 ~ getToken ~ res:", res);
			if (res?.rd1?.[0] && res?.rd?.[0]) {
				const user = {
					...res.rd1[0],
					fullName: `${res.rd1[0].firstname} ${res.rd1[0].lastname}`,
				};
				SetCompanyInfo({ ...res?.rd?.[0], ...res?.rd1[0] });
				setUser(user);
				setToken(res.rd[0]);
				return res;
			}
			throw new Error("Invalid token response");
		} catch (error) {
			console.error("Error getting token:", error);
			return null;
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

	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.ready
				.then((registration) => {
					const messageChannel = new MessageChannel();
					messageChannel.port1.onmessage = (event) => {
						if (event.data === "CHECK_COOKIE") {
							const cookieUser = GetCredentialsFromCookie();
							if (!cookieUser) {
								console.log("No user credentials found in cookie");
								clearState();
							}
						}
					};

					window.swChannel = messageChannel;
					registration.active.postMessage("START_TIMER", [messageChannel.port2]);
				})
				.catch((err) => {
					console.error("Service worker error:", err);
				});

			navigator.serviceWorker.addEventListener("message", (event) => {
				console.log("Global SW message received:", event.data);
			});
		}

		return () => {
			if (window.swChannel?.port1 && typeof window.swChannel.port1.close === "function") {
				window.swChannel.port1.close();
			}
		};
	}, []);

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const cookieUser = GetCredentialsFromCookie();

				if (cookieUser) {
					// Initialize both services
					const ticketInitialized = initializeService(SERVICE_CONFIG.TICKET, cookieUser);
					const callLogInitialized = initializeService(SERVICE_CONFIG.CALL_LOG, cookieUser);

					setServices({
						ticket: ticketInitialized,
						callLog: callLogInitialized,
					});

					await getToken(cookieUser.userId);
				} else {
					console.log("No user credentials found in cookie");
				}
			} catch (error) {
				console.error("Error in initialization:", error);
			} finally {
				setIsInitialized(true);
			}
		};

		initializeAuth();
	}, []);

	const contextData = {
		user,
		token,
		isInitialized,
		services,
		clearState,
		getToken,
		initializeService,
		CompanyInfo,
	};

	return <AuthContext.Provider value={contextData}>{!isInitialized ? <CenteredCircularLoader /> : user ? children : <UnauthorizedPage />}</AuthContext.Provider>;
}

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
					You do not have valid credentials or your session has expired. Please ensure you are logged in correctly or refresh the page.
				</Typography>
				<Button variant="contained" color="primary" onClick={handleReload}>
					Reload Page
				</Button>
			</Paper>
		</Container>
	);
};
