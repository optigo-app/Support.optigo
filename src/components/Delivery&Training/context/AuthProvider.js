import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import { GetCredentialsFromCookie } from "../../../utils/AuthUtils";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CenteredCircularLoader from "../components/shared/ui/Loader";
import { useSearchParams } from "react-router-dom";
import { getFullName } from "../utils/helpers";
import DeliveryAPI from "../../../apis/DeliveryController";
import TrainingAPI from "./../../../apis/TrainingController";

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [apiConfig, setApiConfig] = useState(null);
	const [SearchParams] = useSearchParams();
	const LoggedUser = getFullName(user);

	// Get query parameters
	const SP_ID = SearchParams?.get("sp");
	const USER_ID = SearchParams?.get("userid") || "";
	const YEAR_CODE = SearchParams?.get("YearCode") || "";
	const SV_ID = SearchParams?.get("sv") || "";
	const VERSION_ID = SearchParams?.get("version") || "";
	const TYPE = SearchParams?.get("type") || "";
	const MODE = SearchParams?.get("mode") || "";

	const clearState = () => {
		setUser(null);
		setToken(null);
		setApiConfig(null);
	};

	const getToken = async (userId) => {
		try {
			const res = await TrainingAPI.getToken(userId);
			const { Data } = res;
			if (Data?.rd1?.length && Data?.rd?.length) {
				setUser(Data?.rd1[0]);
				setToken(Data?.rd[0]);
				return res;
			}
			throw new Error("Invalid token response");
		} catch (error) {
			console.error("Error getting token:", error);
			return null;
		}
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
					console.log("User credentials found in cookie", cookieUser);
					const config = TrainingAPI.initialize({
						...cookieUser,
						sp: SP_ID,
					});
					const Deliveryconfig = DeliveryAPI.initialize(cookieUser);
					if (!config || !Deliveryconfig) {
						console.error("Failed to initialize API with cookie data");
						setIsInitialized(true);
						return;
					}
					setApiConfig(config);
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

	const role = user?.role?.toLowerCase() || "guest";
	const isAdmin = role === "admin";
	const isOptigoAdmin = role === "optigoAdmin";
	const isClient = role !== "admin";
	const isGuest = role === "guest";
	const isStaff = isAdmin || isOptigoAdmin;

	const value = useMemo(
		() => ({
			role,
			isAdmin,
			isOptigoAdmin,
			isClient,
			isGuest,
			isStaff,
			user,
			token,
			isInitialized,
			apiConfig,
			clearState,
			LoggedUser,
		}),
		[role, isAdmin, isOptigoAdmin, isClient, isGuest, isStaff, user, token, isInitialized],
	);

	return (
		<AuthContext.Provider value={value}>
			{!isInitialized ? (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100vh",
						width: "100vw",
					}}
				>
					<CenteredCircularLoader />
				</Box>
			) : user ? (
				children
			) : (
				<UnauthorizedPage />
			)}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

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
