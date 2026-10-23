"use client";
import { Box, Button, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { Handshake, X } from "@phosphor-icons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useMemo } from "react";
import { Autoplay, Keyboard, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallLog } from "../../context/UseCallLog";
import { PremiumStatusTooltip } from "../_ui/CustomUI";
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";

dayjs.extend(relativeTime);

function CardTooltipContent({ card }) {
	const description = card?.fullTopic || card?.rawCall?.description || card?.rawCall?.Descr || card?.rawCall?.topic || "No description provided";
	return (
		<Typography
			sx={{
				fontSize: "12px",
				fontWeight: 400,
				color: "#000000ff",
				lineHeight: 1.5,
				whiteSpace: "pre-wrap",
				wordBreak: "break-word",
			}}
		>
			{description}
		</Typography>
	);
}

// Helper to calculate exact wait time metrics & colors (Green <=10m, Orange <=20m, Red >20m)
function getWaitMetrics(dateStr, timeStr) {
	if (!dateStr) {
		return { shortBadge: "1m", timeAgo: "recently", color: "#16A34A", bg: "#DCFCE7" };
	}
	try {
		let callDateTime = dayjs(dateStr);
		if (timeStr && typeof timeStr === "string" && timeStr.includes(":")) {
			const parts = timeStr.split(":");
			callDateTime = callDateTime.hour(Number.parseInt(parts[0], 10)).minute(Number.parseInt(parts[1], 10));
		}
		const now = dayjs();
		const diffMins = Math.max(0, now.diff(callDateTime, "minute"));
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffMins / 1440);

		let shortBadge = "1m";
		if (diffDays > 0) shortBadge = `${diffDays}d`;
		else if (diffHours > 0) shortBadge = `${diffHours}h`;
		else if (diffMins > 0) shortBadge = `${diffMins}m`;
		else shortBadge = "now";

		const timeAgo = callDateTime.fromNow();

		let color = "#DC2626";
		let bg = "#FEE2E2";
		if (diffMins <= 10) {
			color = "#16A34A";
			bg = "#DCFCE7";
		} else if (diffMins <= 20) {
			color = "#EA580C";
			bg = "#FFEDD5";
		}

		return { shortBadge, timeAgo, color, bg };
	} catch (_) {
		return { shortBadge: "1m", timeAgo: "recently", color: "#DC2626", bg: "#FEE2E2" };
	}
}

export default function QuickQueryCardsRail({ activeThreadId, onSelectThread, onAcceptCall, onClose }) {
	const { queue = [] } = useCallLog();

	// Normalize queue items for the compact rail
	const queueCards = useMemo(() => {
		if (!Array.isArray(queue) || queue.length === 0) return [];

		return queue.map((item, idx) => {
			const sr = item.sr || item.id || idx;
			const company = item.company || item.CompanyName || "Company";
			const appName = item.appname || item.DeptName || company;
			const caller = item.callBy || item.CustomerName || item.name || "";
			const topic = item.description || item.Descr || item.topic || `${company} • Support Enquiry`;
			const dateStr = item.date || item.callStart || "";
			const timeStr = item.time || "";

			const { shortBadge, timeAgo, color, bg } = getWaitMetrics(dateStr, timeStr);

			return {
				id: `queue-${sr}`,
				sr,
				badge: shortBadge,
				color,
				bg,
				company,
				appName,
				caller,
				fullTopic: topic,
				topicSnippet: topic.length > 30 ? `${topic.substring(0, 28)}...` : topic,
				timeAgo,
				rawCall: item,
			};
		});
	}, [queue]);

	if (!queueCards || queueCards.length === 0) {
		return null;
	}

	return (
		<Box
			sx={{
				width: "100%",
				background: "#F4F5F6",
				px: 0.6,
				pt: 0.6,
				pb: 0.3,
				display: "flex",
				alignItems: "center",
				gap: 1,
				zIndex: 5,
				flexShrink: 0,
				overflow: "hidden",
			}}
		>
			{/* Horizontal Swiper Carousel with Autoplay */}
			<Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
				<Swiper
					spaceBetween={10}
					slidesPerView="auto"
					autoplay={{
						delay: 3500,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					}}
					speed={700}
					loop={queueCards.length > 4}
					grabCursor={true}
					keyboard={{ enabled: true }}
					mousewheel={{ forceToAxis: true }}
					modules={[Autoplay, Keyboard, Mousewheel]}
					style={{ width: "100%", minWidth: 0, padding: "2px 0" }}
				>
					{queueCards.map((card) => {
						const isSelected = activeThreadId === `call-${card.sr}` || activeThreadId === card.id || activeThreadId === String(card.sr);

						return (
							<SwiperSlide key={card.id} style={{ width: "auto" }}>
								<Box
									onClick={() => {
										onSelectThread && onSelectThread?.(`call-${card.sr}`, card.rawCall);
										if (onAcceptCall) onAcceptCall(card.sr);
									}}
									sx={{
										width: 275,
										height: 54,
										bgcolor: isSelected ? "#EEF0F2" : "#FFFFFF",
										border: isSelected ? "1.5px solid #64748B" : "1px solid #D8DDE3",
										borderRadius: "8px",
										px: 1,
										py: 0.5,
										display: "flex",
										alignItems: "center",
										gap: 1,
										cursor: "pointer",
										boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
										transition: "all 0.15s ease-in-out",
										userSelect: "none",
										flexShrink: 0,
										"&:hover": {
											borderColor: "#AEB6BF",
											bgcolor: "#F8F9FA",
											boxShadow: "0 3px 8px rgba(15,23,42,0.08)",
										},
									}}
								>
									<PremiumStatusTooltip
										title={<CardTooltipContent card={card} />}
										placement="top"
										arrow
										enterDelay={200}
										PopperProps={{
											sx: { zIndex: 9999 },
											modifiers: [
												{
													name: "flip",
													enabled: false,
												},
												{
													name: "offset",
													options: {
														offset: [0, 8],
													},
												},
											],
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
											{/* Elapsed Wait Time Square Badge */}
											<Box
												sx={{
													width: 34,
													height: 34,
													bgcolor: card.bg,
													color: card.color,
													borderRadius: "55px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontWeight: 850,
													fontSize: "0.78rem",
													flexShrink: 0,
													boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.04)",
												}}
											>
												{card.badge}
											</Box>

											{/* Content Details */}
											<Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.1 }}>
												{/* Row 1: Company / Caller + App Chip */}
												<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
													<Typography
														noWrap
														sx={{
															fontWeight: 750,
															fontSize: "0.78rem",
															color: "#0F172A",
															lineHeight: 1.2,
															maxWidth: 125,
														}}
													>
														{card.company}
													</Typography>
													<Chip
														label={card.appName}
														size="small"
														sx={{
															height: 16,
															fontSize: "0.62rem",
															fontWeight: 750,
															bgcolor: "#F1F3F5",
															color: "#475569",
															border: "1px solid #D8DDE3",
															borderRadius: "4px",
															px: 0.2,
															maxWidth: 75,
															"& .MuiChip-label": { px: 0.4, overflow: "hidden", textOverflow: "ellipsis" },
														}}
													/>
												</Box>

												{/* Row 2: Topic Snippet */}
												<Typography
													noWrap
													sx={{
														color: "#475569",
														fontSize: "0.68rem",
														fontWeight: 500,
														lineHeight: 1.2,
													}}
												>
													{card.caller ? `${card.caller} • ` : ""}
													{card.topicSnippet}
												</Typography>

												{/* Row 3: Time Ago in Dynamic Wait Color */}
												<Typography
													sx={{
														color: "#64748B",
														fontSize: "0.66rem",
														fontWeight: 750,
														lineHeight: 1.1,
													}}
												>
													{card.timeAgo}
												</Typography>
											</Box>
										</Box>
									</PremiumStatusTooltip>

									{/* Direct Accept Action Button */}
									<Tooltip title="Accept this call from queue" arrow>
										<Button
											size="small"
											variant="contained"
											onClick={(e) => {
												e.stopPropagation();
												if (onAcceptCall) onAcceptCall(card.sr);
											}}
											sx={{
												minWidth: 28,
												width: 28,
												height: 28,
												p: 0,
												borderRadius: "55px",
												bgcolor: "#16A34A",
												color: "#FFFFFF",
												boxShadow: "none",
												flexShrink: 0,
												"&:hover": {
													bgcolor: "#15803D",
													boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
												},
											}}
										>
											<Handshake size={15} weight="bold" />
										</Button>
									</Tooltip>
								</Box>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</Box>

			{/* Right Close Button */}
			{onClose && (
				<IconButton
					size="small"
					onClick={onClose}
					sx={{
						color: "#fff",
						bgcolor: "#AF7BFF",
						p: 0.5,
						borderRadius: "25px",
						flexShrink: 0,
						"&:hover": { bgcolor: "#552FFF" },
					}}
				>
					<X size={16} weight="bold" />
				</IconButton>
			)}
		</Box>
	);
}
