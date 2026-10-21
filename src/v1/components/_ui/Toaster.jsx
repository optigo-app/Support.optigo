import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import { Buildings, Phone, Ticket, User, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";
import { useTicket } from "../../context/useTicket";
import IncomingCallModal from "../CallLogger/Runinng/IncomingCallDialog";

const IOS_AVATAR_PALETTE = [
	"#EC4899", // iOS Magenta Pink (like the Messages AK screenshot)
	"#0EA5E9", // Sky Blue
	"#6366F1", // Indigo
	"#10B981", // Emerald Green
	"#F59E0B", // Amber
	"#8B5CF6", // Purple
	"#06B6D4", // Cyan
	"#EF4444", // Coral Red
];

const getAvatarBg = (str = "") => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return IOS_AVATAR_PALETTE[Math.abs(hash) % IOS_AVATAR_PALETTE.length];
};

const getInitials = (name = "") => {
	if (!name) return "C";
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
};

const extractNotificationInfo = ({ title = "", description = "", data = {} }) => {
	const isCall = data?.group === "CALL" || data?.type?.includes("CALL") || data?.type === "ADDCOMMENTS";
	const isTicket = data?.group === "TICKET" || data?.type?.includes("TICKET") || Boolean(data?.TicketNo || data?.TicketPreviewId);

	// App name in iOS header (uppercase, like WALLET, CALENDAR, MESSAGES)
	let appName = "SUPPORT";
	if (isCall) {
		appName = data?.type === "ADDCOMMENTS" ? "CALL COMMENT" : "CALL LOGGER";
	} else if (isTicket) {
		appName = data?.type === "TICKET_COMMENT" ? "TICKET COMMENT" : "TICKETS";
	}

	// Company Name
	let companyName = (data?.company || data?.companyname || data?.rawRecord?.company || "").trim();
	if (!companyName && description) {
		const compMatch = description.match(/Company:\s*([^\n\r]+)/i);
		if (compMatch) companyName = compMatch[1].trim();
	}
	if (!companyName && title) {
		const titleCompMatch = title.match(/-\s*([^\n\r]+)/);
		if (titleCompMatch) companyName = titleCompMatch[1].trim();
	}

	// Person / Caller Name
	let personName = (data?.callBy || data?.caller || data?.username || data?.CreatedByName || data?.LastUpdatedBy || data?.receivedBy || data?.Name || "").trim();
	if (!personName && description) {
		const personMatch = description.match(/(?:Caller|Created By|Updated By|By|Support):\s*([^\n\r]+)/i);
		if (personMatch) personName = personMatch[1].trim();
	}
	if (!personName && title) {
		const personMatch = title.match(/(?:Call Accepted -|Call Forwarded to|New Comment - Call|Ticket)[\s\-#]*([^\n\r\-]+)/i);
		if (personMatch) personName = personMatch[1].trim();
	}

	// Clean body message / comment text
	let cleanMessage = description || "";
	if (cleanMessage) {
		const descMatch = cleanMessage.match(/(?:Description|Subject|Comment):\s*([\s\S]+)/i);
		if (descMatch) {
			cleanMessage = descMatch[1].trim();
		} else {
			const lines = cleanMessage.split("\n").filter((l) => {
				const trimmed = l.trim();
				return !/^(?:Caller|Company|By|Created By|Updated By|Added By|Support):\s*/i.test(trimmed);
			});
			if (lines.length > 0) cleanMessage = lines.join(" ").trim();
		}
	}

	// Primary bold title in notification body
	const primaryTitle = personName || companyName || title || "New Notification";

	return {
		isCall,
		isTicket,
		appName,
		companyName,
		personName,
		cleanMessage,
		primaryTitle,
	};
};

export function toast({ title, description, data }) {
	return sonnerToast.custom((id) => <NotificationToast id={id} title={title} description={description} data={data} />, {
		position: "top-right",
		duration: Number.POSITIVE_INFINITY, // Let NotificationToast handle pause-on-hover timer
	});
}

export function NotificationToast({ id, title, description, data }) {
	const { setSelectedTicket } = useTicket();
	const navigate = useNavigate();
	const [open, setOpen] = useState(null);
	const timerRef = useRef(null);

	const { isCall, isTicket, appName, companyName, personName, cleanMessage, primaryTitle } = extractNotificationInfo({ title, description, data });

	const handleDismiss = (e) => {
		if (e) e.stopPropagation();
		if (timerRef.current) clearTimeout(timerRef.current);
		sonnerToast.dismiss(id);
	};

	// Auto-dismiss with pause on hover
	const startTimer = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			sonnerToast.dismiss(id);
		}, 7500);
	}, [id]);

	const pauseTimer = React.useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
	}, []);

	useEffect(() => {
		startTimer();
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [startTimer]);

	const HandleTicketUpgrade = (ticketData) => {
		try {
			const encodedId = btoa(ticketData?.id ?? "");
			const encodedApp = btoa(ticketData?.appname ?? "");
			const { forward, ...safeData } = ticketData || {};
			navigate(`/ticket?TicketId=${encodedId}&Appname=${encodedApp}`, {
				state: safeData,
			});
		} catch (_) {
			navigate("/ticket");
		}
	};

	const HandlePreviewTicket = (ticketId) => {
		try {
			const encodedId = btoa(String(ticketId ?? ""));
			navigate(`/ticket?TicketPreviewId=${encodedId}`);
		} catch (_) {
			navigate("/ticket");
		}
	};

	// Click action -> direct navigation to call/ticket/comment
	const handleOpen = (e) => {
		if (e) e.stopPropagation();
		if (timerRef.current) clearTimeout(timerRef.current);

		if (data?.topicRaisedBy === "client") {
			setOpen(data);
		}

		if (isTicket) {
			setSelectedTicket(data);
			const previewId = data?.TicketPreviewId || data?.TicketNo || data?.TicketId || data?.ticketId || data?.id;

			if (data?.appname && data?.id && !data?.TicketNo && !data?.TicketPreviewId) {
				HandleTicketUpgrade(data);
			} else if (previewId) {
				HandlePreviewTicket(previewId);
			} else {
				navigate("/ticket");
			}
			handleDismiss();
			return;
		}

		if (isCall) {
			const callId = data?.sr || data?.CallLogId || data?.CallLogid || data?.callLogId || data?.callId || data?.id;

			if (callId) {
				navigate(`/newcall?sr=${callId}`);
			} else {
				navigate("/newcall");
			}
			handleDismiss();
			return;
		}

		handleDismiss();
	};

	// Circular Avatar properties
	const avatarKey = personName || companyName || "User";
	const avatarBg = getAvatarBg(avatarKey);
	const avatarInitials = getInitials(avatarKey);

	return (
		<>
			{/* <IncomingCallModal open={open} setOpen={setOpen} handleDismiss={handleDismiss} /> */}
			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, y: -18, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -12, scale: 0.92 }}
					transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
					onMouseEnter={pauseTimer}
					onMouseLeave={startTimer}
					style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
				>
					{/* iOS iPhone Notification Banner */}
					<Paper
						elevation={0}
						onClick={handleOpen}
						sx={{
							width: 330,
							maxWidth: "calc(100vw - 32px)",
							borderRadius: "22px",
							p: "12px 14px 14px 14px",
							bgcolor: "#FFFFFF",
							border: "1px solid rgba(0, 0, 0, 0.08)",
							boxShadow: "0 10px 28px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)",
							cursor: "pointer",
							userSelect: "none",
							transition: "transform 0.15s ease, box-shadow 0.15s ease",
							"&:hover": {
								boxShadow: "0 14px 34px rgba(0, 0, 0, 0.14), 0 3px 8px rgba(0, 0, 0, 0.06)",
								transform: "translateY(-1px)",
							},
						}}
					>
						{/* 1. iOS HEADER ROW ([ICON] APP_NAME ......... NOW ×) */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								mb: "8px",
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
								{/* Small rounded squircle App Icon */}
								<Box
									sx={{
										width: 17,
										height: 17,
										borderRadius: "4px",
										bgcolor: isCall ? "#22C55E" : isTicket ? "#8B5CF6" : "#0F172A",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#FFFFFF",
										flexShrink: 0,
									}}
								>
									{isCall ? <Phone size={10} weight="fill" /> : isTicket ? <Ticket size={10} weight="fill" /> : <Buildings size={10} weight="fill" />}
								</Box>
								<Typography
									sx={{
										fontSize: "11px",
										fontWeight: 650,
										letterSpacing: "0.6px",
										color: "#71717A",
										textTransform: "uppercase",
										lineHeight: 1,
									}}
								>
									{appName}
								</Typography>
							</Box>

							<Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
								<Typography
									sx={{
										fontSize: "11px",
										fontWeight: 600,
										letterSpacing: "0.4px",
										color: "#71717A",
										textTransform: "uppercase",
										lineHeight: 1,
									}}
								>
									NOW
								</Typography>
								<Box
									component="span"
									onClick={handleDismiss}
									sx={{
										fontSize: "13px",
										fontWeight: 700,
										color: "#8E8E93",
										cursor: "pointer",
										lineHeight: 1,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										p: "2px",
										borderRadius: "50%",
										"&:hover": {
											color: "#000000",
											bgcolor: "rgba(0, 0, 0, 0.06)",
										},
									}}
								>
									✕
								</Box>
							</Box>
						</Box>

						{/* 2. CONTENT ROW ([AVATAR] SENDER + COMPANY + MESSAGE) */}
						<Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px", mb: "10px" }}>
							{/* Circular Avatar with Two-Letter Initials (like AK in screenshot) */}
							<Box
								sx={{
									width: 35,
									height: 35,
									borderRadius: "50%",
									bgcolor: avatarBg,
									color: "#FFFFFF",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "12.5px",
									fontWeight: 700,
									flexShrink: 0,
									mt: "1px",
									boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
								}}
							>
								{avatarInitials}
							</Box>

							{/* Right Info */}
							<Box sx={{ flex: 1, minWidth: 0 }}>
								{/* Person / Title */}
								<Typography
									sx={{
										fontSize: "13.5px",
										fontWeight: 700,
										color: "#18181B",
										lineHeight: 1.25,
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{primaryTitle}
								</Typography>

								{/* Company & Person Details in Order with Icons */}
								{(companyName || (personName && primaryTitle !== personName)) && (
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: "6px",
											mt: "2px",
											flexWrap: "nowrap",
											overflow: "hidden",
										}}
									>
										{companyName && (
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: "3px",
													minWidth: 0,
												}}
											>
												<Buildings size={11} weight="bold" color="#71717A" />
												<Typography
													sx={{
														fontSize: "11px",
														color: "#71717A",
														fontWeight: 500,
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
													}}
												>
													{companyName}
												</Typography>
											</Box>
										)}

										{personName && primaryTitle !== personName && (
											<>
												<Typography sx={{ fontSize: "11px", color: "#A1A1AA" }}>•</Typography>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: "3px",
														minWidth: 0,
													}}
												>
													<User size={11} weight="bold" color="#71717A" />
													<Typography
														sx={{
															fontSize: "11px",
															color: "#71717A",
															fontWeight: 500,
															whiteSpace: "nowrap",
															overflow: "hidden",
															textOverflow: "ellipsis",
														}}
													>
														{personName}
													</Typography>
												</Box>
											</>
										)}
									</Box>
								)}

								{/* Message */}
								{cleanMessage && (
									<Typography
										sx={{
											fontSize: "12px",
											color: "#3F3F46",
											lineHeight: 1.35,
											mt: "3px",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
										}}
									>
										{cleanMessage}
									</Typography>
								)}
							</Box>
						</Box>

						{/* 3. DUAL PILL BUTTONS (Reply/Open & Dismiss/Decline) */}
						<Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<Button
								fullWidth
								size="small"
								onClick={handleOpen}
								sx={{
									bgcolor: "#007AFF",
									color: "#FFFFFF",
									borderRadius: "14px",
									fontSize: "12px",
									fontWeight: 600,
									py: "5px",
									textTransform: "none",
									boxShadow: "none",
									transition: "background-color 0.15s ease",
									"&:hover": {
										bgcolor: "#0062CC",
										boxShadow: "none",
									},
								}}
							>
								Open
							</Button>

							<Button
								fullWidth
								size="small"
								onClick={handleDismiss}
								sx={{
									bgcolor: "#E5E5EA",
									color: "#1C1C1E",
									borderRadius: "14px",
									fontSize: "12px",
									fontWeight: 600,
									py: "5px",
									textTransform: "none",
									boxShadow: "none",
									transition: "background-color 0.15s ease",
									"&:hover": {
										bgcolor: "#D1D1D6",
										boxShadow: "none",
									},
								}}
							>
								Dismiss
							</Button>
						</Box>
					</Paper>
				</motion.div>
			</AnimatePresence>
		</>
	);
}
