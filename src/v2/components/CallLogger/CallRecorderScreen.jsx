import React, { useCallback, useMemo, useRef, useState } from "react";
import { Box, Button, Collapse, IconButton, Typography, List, Chip, MenuItem, Menu, Tooltip, Avatar, Paper, Card, CardContent, Grid, Divider, Badge, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { formatTime, FormatTime } from "../../libs/formatTime";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { BriefcaseBusiness, Icon, PhoneIncoming, X } from "lucide-react";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import { useCallLog } from "../../context/UseCallLog";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PauseIcon from "@mui/icons-material/Pause";
import CallEndIcon from "@mui/icons-material/CallEnd";
import CallIcon from "@mui/icons-material/Call";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BusinessIcon from "@mui/icons-material/Business";
import ListItemIcon from "@mui/material/ListItemIcon";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DeveloperBoardRoundedIcon from "@mui/icons-material/DeveloperBoardRounded";
import PostCallFeedbackForm from "./CallFaq";
import { useNavigate } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import { PremiumTooltip } from "../_ui/CustomUI";
import { truncateByWords, truncateByChars } from "../../libs/data";
import PersonIcon from "@mui/icons-material/Person";
import { findCompanyAndClosestOwner } from "../../libs/helper";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel, Autoplay } from 'swiper/modules';
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";



const MuiProps = {
	sx: {
		margin: "0px 4px !important",
		borderRadius: "4px !important",
		fontSize: "16px",
		"&:hover": {
			backgroundColor: "#f0f0f0 !important",
			borderRadius: "4px !important",
		},
	},
};

const CallRecorderScreen = ({ callStatusValue, onEditToggle, setPostReview, onDetailsToggle, onEditCall, onAddConCurrentCall, onStartCall, isRecordingExpanded, recordingTime, onEndCall, CurrentCall, onCloseRecord, onPause, onResume, isPaused, activeFollowUp, onStartFollowUp }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const [FaqModal, setFaqModal] = useState(false);
	const Navigate = useNavigate();
	const [ShowCustomerInfo, setShowCustomerInfo] = useState(false);
	const { COMPANY_INFO_MASTER } = useCallLog();
	const collapsibleRef = useRef(null);

	const CompanyInfo = useMemo(() => {
		if (!CurrentCall || !CurrentCall?.company) {
			return null;
		}
		return findCompanyAndClosestOwner(CurrentCall, COMPANY_INFO_MASTER);
	}, [CurrentCall]);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const HandleEndCall = () => {
		onEndCall();
		// setFaqModal(true);
	};

	const handleFAQ = () => {
		setFaqModal(true);
		setAnchorEl(false);
	};

	const handlePostCallReview = () => {
		setAnchorEl(false);
		setPostReview(true);
	};

	const hasAnalysis = !!CurrentCall?.callAnalysis &&
		Object.keys(CurrentCall.callAnalysis).length > 0;

	// Parse follow-up list from the call data
	const followUpList = useMemo(() => {
		try {
			if (CurrentCall?.FollowUpList) {
				return JSON.parse(CurrentCall.FollowUpList);
			}
		} catch (e) {
			console.error("Error parsing FollowUpList:", e);
		}
		return [];
	}, [CurrentCall?.FollowUpList]);

	const selectedFollowUp = activeFollowUp ? followUpList.find(f => f.Id === activeFollowUp.followUpCallId) : null;
	const isTimerRunning = recordingTime > 0;

	const isValidDate = (d) => d && typeof d === 'string' && !d.startsWith("1900-01-01");
	const isFollowUpCompleted = selectedFollowUp
		? (isValidDate(selectedFollowUp.CallClosed) || (selectedFollowUp.CallDuration && selectedFollowUp.CallDuration !== "00:00:00") || (isValidDate(selectedFollowUp.CallStart) && !isTimerRunning))
		: false;

	const isFollowUpActive = !!activeFollowUp && activeFollowUp.callLogId === CurrentCall?.sr && !isFollowUpCompleted;

	return (
		<Collapse in={isRecordingExpanded} ref={collapsibleRef}>
			<Box
				sx={{
					borderRadius: 2,
					marginBottom: 2,
					display: "flex",
					alignItems: "center",
					height: "48vh",
					justifyContent: "center",
					position: "relative",
					gap: 2,
				}}
			>
				<Box
					sx={{
						flex: "0.25",
						height: "100%",
						display: "flex",
						alignItems: "center",
						backgroundColor: "#F8F9F9",
						borderRadius: 5,
						flexDirection: "column",
					}}
				>
					<CallQueueUI onEditCall={onEditCall} />
				</Box>
				<Box
					sx={{
						flex: "0.85",
						height: "100%",
						display: "flex",
						alignItems: "center",
						flexDirection: "column",
						justifyContent: "center",
						borderRadius: 5,
						backgroundColor: "#F8F9F9",
						position: "relative",
						flexGrow: 1,
					}}
				>
					{!CurrentCall || Object?.keys(CurrentCall).length === 0 ? (
						<Typography fontWeight={500} fontSize="1.5rem" color="gray">
							{!CurrentCall?.callStart && (
								<IconButton
									onClick={onCloseRecord}
									sx={{
										position: "absolute",
										top: "10px",
										right: "25px",
										color: "black",
									}}
								>
									<X />
								</IconButton>
							)}
							No active call at the moment
						</Typography>
					) : (
						<>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									flexDirection: "column",
								}}
							>
								{(!CurrentCall?.callStart || (CurrentCall?.callStart && !CurrentCall?.CallDuration) || (CurrentCall?.callClosed && CurrentCall?.CallDuration)) && (
									<IconButton
										onClick={onCloseRecord}
										sx={{
											position: "absolute",
											top: "15px",
											right: "25px",
											color: "black",
											pointerEvents: callStatusValue?.isRunning ? "none" : "auto",
											cursor: callStatusValue?.isRunning ? "no-drop" : "default",
											opacity: callStatusValue?.isRunning ? 0.6 : 1,
										}}
									>
										<X />
									</IconButton>
								)}
								{isFollowUpActive && (
									<Chip
										icon={<PhoneCallbackRoundedIcon style={{ fontSize: 16 }} />}
										label={`Follow-Up #${activeFollowUp?.followUpCallId}`}
										color="warning"
										sx={{
											position: "absolute",
											top: "15px",
											left: "25px",
											fontWeight: 700,
											color: "#fff",
											px: 0.5,
										}}
									/>
								)}
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										flexDirection: "column",
									}}
								>
									<Tooltip title={`Call from ${CurrentCall?.company}`} placement="top">
										<Chip
											label={CurrentCall?.company}
											icon={<BriefcaseBusiness height={15} width={15} />}
											size="small"
											color="primary"
											sx={{
												width: "fit-content",
												fontSize: 14,
												fontWeight: 500,
												backgroundColor: "#E6F0FF",
												color: "#0B69FF",
												px: 1,
												py: 0.5,
												mb: 1.2,
											}}
										/>
									</Tooltip>
									<Typography fontWeight={600} letterSpacing={2} variant="h3">
										<AccountCircleIcon
											sx={{
												color: "#2177EA",
												fontSize: "60px",
												marginRight: "15px",
											}}
										/>
										{CurrentCall?.callBy}
									</Typography>
								</Box>
								{CurrentCall?.description && (
									<Typography
										fontWeight={300}
										letterSpacing={1}
										color="#b5b2b2"
										variant="h6"
										mb={0.5}
										mt={1.2}
										sx={{
											width: "400px",
											textAlign: "center",
											textWrap: "balance",
										}}
									>
										<Tooltip title={CurrentCall?.description} placement="bottom-end">
											<Chip
												sx={{
													borderRadius: "8px",
												}}
												label={CurrentCall?.description}
												color="default"
												variant="outlined"
											/>
										</Tooltip>
									</Typography>
								)}
								{!CurrentCall?.callClosed && !isFollowUpActive && (
									<Typography fontWeight={300} letterSpacing={1} variant="subtitle1" mb={0.5} mt={1}>
										<FiberManualRecordIcon color="error" /> {recordingTime > 0 ? `Call Duration : ${formatTime(recordingTime)}` : "Start A Call"}
									</Typography>
								)}
								{CurrentCall?.callClosed && !isFollowUpActive && (
									<Typography fontWeight={300} letterSpacing={1} variant="subtitle1" mb={0.5} mt={1} color="text.secondary">
										Call Completed {CurrentCall?.CallDuration ? `• Duration: ${CurrentCall.CallDuration}` : ""}
										{followUpList.length > 0 && ` • ${followUpList.length} Follow-up${followUpList.length > 1 ? "s" : ""}`}
									</Typography>
								)}
								{isFollowUpActive && (
									<Typography fontWeight={300} letterSpacing={1} variant="subtitle1" mb={0.5} mt={1}>
										<FiberManualRecordIcon sx={{ color: "#FF9800" }} /> {recordingTime > 0 ? `Follow-Up Duration : ${formatTime(recordingTime)}` : "Start Follow-Up Call"}
									</Typography>
								)}
							</Box>
							{/* controls for call */}
							<Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<Box sx={{ display: "flex", gap: 2.5 }}>
										{/* Call Completed Button */}
										{CurrentCall?.callClosed && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													sx={{
														p: 1.5,
														backgroundColor: "green",
														color: "white",
														":hover": { bgcolor: "green" },
													}}
												>
													<CheckCircleRoundedIcon fontSize="medium" />
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Call Done</Typography>
											</Box>
										)}
										{/* Start Call Button */}
										{!CurrentCall?.callStart && !CurrentCall?.callClosed && !isFollowUpActive && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													onClick={() => onStartCall(CurrentCall?.sr)}
													sx={{
														p: 1.5,
														backgroundColor: "green",
														color: "white",
														":hover": { bgcolor: "green" },
													}}
												>
													<CallIcon fontSize="medium" />
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Start</Typography>
											</Box>
										)}
										{/* Start Follow-Up Button — when follow-up added but not yet started */}
										{isFollowUpActive && recordingTime <= 0 && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													onClick={() => onStartFollowUp()}
													sx={{
														p: 1.5,
														backgroundColor: "#FF9800",
														color: "white",
														":hover": { bgcolor: "#F57C00" },
													}}
												>
													<CallIcon fontSize="medium" />
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Start Follow-Up</Typography>
											</Box>
										)}
										{/* pause and resume Button — for both normal and follow-up calls */}
										{((CurrentCall?.callStart && !CurrentCall?.callClosed) || (isFollowUpActive && recordingTime > 0)) && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													onClick={isPaused ? onResume : onPause}
													sx={{
														p: 1.5,
														backgroundColor: isFollowUpActive ? "#FF9800" : "#444",
														color: "white",
														":hover": { bgcolor: isFollowUpActive ? "#F57C00" : "#444" },
													}}
												>
													{isPaused ? <PlayArrowRoundedIcon fontSize="medium" /> : <PauseIcon fontSize="medium" />}
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>{isPaused ? "Resume" : "Pause"}</Typography>
											</Box>
										)}
										{/* Add Call Button — only during normal active call (not follow-up) */}
										{!CurrentCall?.callClosed && recordingTime > 0 && !isFollowUpActive && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													onClick={() => onAddConCurrentCall(CurrentCall)}
													disabled={recordingTime < 1}
													sx={{
														p: 1.5,
														backgroundColor: "#444",
														color: "white",
														":hover": { bgcolor: "#444" },
														":disabled": {
															bgcolor: "#c0bcbc",
															color: "white",
															cursor: "not-allowed",
														},
													}}
												>
													<AddIcon fontSize="medium" />
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Add Call</Typography>
											</Box>
										)}
										{/* Call Edit Button */}
										{(recordingTime <= 0 || !CurrentCall?.callStart || (CurrentCall?.callStart && !CurrentCall?.CallDuration) || (CurrentCall?.callClosed && CurrentCall?.CallDuration)) && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													onClick={onEditToggle}
													sx={{
														p: 1.5,
														backgroundColor: "#444",
														color: "white",
														":hover": { bgcolor: "#444" },
													}}
												>
													<CreateRoundedIcon fontSize="medium" />
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Edit</Typography>
											</Box>
										)}

										{/* Call Details Button */}
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
											}}
										>
											<IconButton
												onClick={onDetailsToggle}
												sx={{
													p: 1.5,
													backgroundColor: "#444",
													color: "white",
													":hover": { bgcolor: "#444" },
												}}
											>
												<ArticleRoundedIcon fontSize="medium" />
											</IconButton>
											<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Details</Typography>
										</Box>

										{/* Call End Button — for both normal and follow-up calls */}
										{((CurrentCall?.callStart && !CurrentCall?.callClosed) || (isFollowUpActive && recordingTime > 0)) && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													onClick={HandleEndCall}
													sx={{
														p: 1.5,
														backgroundColor: "red",
														color: "white",
														":hover": { bgcolor: "red" },
													}}
												>
													<CallEndIcon fontSize="medium" />
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>{isFollowUpActive ? "End Follow-Up" : "Hang up"}</Typography>
											</Box>
										)}
										{/* customer info */}
										{CompanyInfo !== null && (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
												}}
											>
												<IconButton
													onClick={() => setShowCustomerInfo(!ShowCustomerInfo)}
													sx={{
														p: 1.5,
														backgroundColor: ShowCustomerInfo ? "green" : "blue",
														color: "white",
														":hover": {
															bgcolor: ShowCustomerInfo ? "green" : "blue",
														},
													}}
												>
													<PersonIcon fontSize="medium" />
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Customer</Typography>
											</Box>
										)}
										{/* More Details Button */}
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
											}}
										>
											<IconButton
												aria-controls={open ? "menu" : undefined}
												aria-haspopup="true"
												onClick={handleClick}
												sx={{
													p: 1.5,
													backgroundColor: "#444",
													color: "white",
													":hover": { bgcolor: "#444" },
												}}
											>
												<MoreVertIcon fontSize="medium" />
											</IconButton>
											<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>More</Typography>
										</Box>
										<Menu
											id="menu"
											anchorEl={anchorEl}
											open={open}
											onClose={handleClose}
											anchorOrigin={{
												horizontal: "left",
												vertical: "bottom",
											}}
											transformOrigin={{
												horizontal: "left",
												vertical: "top",
											}}
											slotProps={{
												paper: {
													sx: {
														"& .MuiList-root": {
															paddingTop: 0,
															paddingBottom: 0,
															paddingBlock: "4px !important",
														},
														borderRadius: "4px !important",
														boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
													},
												},
											}}
											sx={{ marginTop: 1 }}
										>
											{/* <MenuItem onClick={() => HandleTicketUpgrade(CurrentCall?.id, CurrentCall)} {...MuiProps}>
                        <ListItemIcon>
                          <DeveloperBoardRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        Upgrade to Ticket
                      </MenuItem> */}

											<Tooltip title={"Coming Soon!"} placement="top">
												<MenuItem
													// disabled
													// ={CurrentCall?.callStart}
													onClick={handleFAQ}
													{...MuiProps}
												>
													<ListItemIcon>
														<CallIcon fontSize="small" />
													</ListItemIcon>
													Call FAQ
												</MenuItem>
											</Tooltip>

											<MenuItem
												//   disabled={CurrentCall && !hasAnalysis}
												onClick={handlePostCallReview} {...MuiProps}>
												<ListItemIcon>
													<RateReviewIcon fontSize="small" />
												</ListItemIcon>
												Post-Call Review
											</MenuItem>
										</Menu>
									</Box>
								</Box>
							</Box>
						</>
					)}
				</Box>

				{ShowCustomerInfo && (
					<Box
						sx={{
							flex: "0.35",
							height: "100%",
							display: "flex",
							alignItems: "center",
							backgroundColor: "#F8F9F9",
							borderRadius: 5,
							flexDirection: "column",
						}}
					>
						<CustomerInfoCard data={CompanyInfo} onClose={() => setShowCustomerInfo(false)} />
					</Box>
				)}
			</Box>
			<PostCallFeedbackForm open={FaqModal} setOpen={setFaqModal} />
		</Collapse>
	);
};

export default CallRecorderScreen;

export const CallQueueUI = ({ onEditCall }) => {
	const { queue } = useCallLog();
	window.__queue = queue;
	const handleCall = (id) => {
		onEditCall(id);
	};

	if (!queue || queue.length === 0) {
		return (
			<Box sx={{
				display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
				minHeight: '64px',
				opacity: 0.7,
				bgcolor: '#cccccc2a',
				mb: 0,
				borderRadius: 4
			}}>
				<PhoneCallbackRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
				<Typography variant="caption" color="text.secondary" fontWeight={500}>
					No calls in queue
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ width: "100%", overflow: "hidden", px: 0.5, py: 0.5 }}>
			<Swiper
				spaceBetween={12}
				slidesPerView={1.2}
				breakpoints={{
					600: {
						slidesPerView: 2.2,
					},
					960: {
						slidesPerView: 4.2,
					},
					1400: {
						slidesPerView: 5,
					},
				}}
				autoplay={{
					delay: 4000,
					disableOnInteraction: false,
					pauseOnMouseEnter: true,
				}}
				speed={800}
				loop={queue && queue.length > 6}
				grabCursor={true}
				keyboard={{ enabled: true }}
				mousewheel={{ forceToAxis: true }}
				modules={[Autoplay, Keyboard, Mousewheel]}
			>
				{queue?.map((call) => (
					<SwiperSlide key={call?.id || call?.sr}
					>
						<UserRequestCard
							appname={call?.appname}
							company={call?.company}
							department={call?.department}
							description={call?.description}
							name={call?.callBy}
							date={call?.date}
							time={call?.time}
							onAccept={() => handleCall(call?.sr)}
						/>
					</SwiperSlide>
				))}
			</Swiper>
		</Box>
	);
};



const stringToColor = (string) => {
	if (!string) return "#1A73E8";
	let hash = 0;
	for (let i = 0; i < string.length; i += 1) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash);
	}
	let color = "#";
	for (let i = 0; i < 3; i += 1) {
		const value = (hash >> (i * 8)) & 0xff;
		color += `00${value.toString(16)}`.slice(-2);
	}
	return color;
};

const COLORS = {
	bg: "#F8FAFC",
	surface: "#FFFFFF",
	border: "#E5E7EB",

	textPri: "#111827",
	textSec: "#6B7280",
	textMuted: "#9CA3AF",

	callFg: "#2563EB",
	callBg: "#EFF6FF",
	callBorder: "#BFDBFE",

	tickFg: "#7C3AED",
	tickBg: "#F3E8FF",

	greenFg: "#16A34A",
	greenBg: "#DCFCE7",

	orangeFg: "#EA580C",
	orangeBg: "#FFEDD5",

	redFg: "#DC2626",
	redBg: "#FEE2E2",

	liveGreen: "#22C55E",
};

const UserRequestCard = ({ name, appname, company, description, date, time, onAccept }) => {
	const truncatedDesc = description?.length > 15 ? `${description?.substring(0, 15)}...` : description;
	const truncatedAppName = appname?.length > 12 ? `${appname?.substring(0, 12)}...` : appname;
	const truncatedCompany = company?.length > 12 ? `${company?.substring(0, 12)}...` : company;

	const displayTime = time ? time : "";
	const displayDate = date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "";
	const fullTimeText = `${displayDate} ${displayTime}`.trim();

	const titleText = (
		<Box sx={{ p: 0.5 }}>
			{company && <Typography sx={{ fontSize: 12, mb: 0.5 }}><strong>Company:</strong> {company}</Typography>}
			{appname && <Typography sx={{ fontSize: 12, mb: 0.5 }}><strong>App:</strong> {appname}</Typography>}
			{description && <Typography sx={{ fontSize: 12 }}><strong>Description:</strong> {description}</Typography>}
		</Box>
	);

	// Calculate wait time for conditional row coloring
	const { baseBgColor, hoverBgColor, textColor, relativeTime, shortTime } = React.useMemo(() => {
		if (!date) return { baseBgColor: "#fff", hoverBgColor: "#F1F3F4", textColor: "#80868b", relativeTime: "", shortTime: "" };

		let callDateTime = new Date(date);
		if (time) {
			const dateStr = date.includes('T') ? date.split('T')[0] : date.split(' ')[0];
			const combined = new Date(`${dateStr} ${time}`);
			if (!isNaN(combined.getTime())) {
				callDateTime = combined;
			}
		}

		const diffMins = Math.floor((Date.now() - callDateTime.getTime()) / 60000);

		const relTime = FormatTime(callDateTime, "relative");
		let sTime = "";
		if (diffMins < 1) {
			sTime = "now";
		} else if (diffMins < 60) {
			sTime = `${diffMins}m`;
		} else if (diffMins < 1440) {
			const hours = Math.floor(diffMins / 60);
			sTime = `${hours}h`;
		} else {
			const days = Math.floor(diffMins / 1440);
			sTime = `${days}d`;
		}

		if (diffMins < 0) return { baseBgColor: "#fff", hoverBgColor: "#F1F3F4", textColor: "#80868b", relativeTime: relTime, shortTime: sTime };
		if (diffMins <= 10) return { baseBgColor: COLORS.greenBg, hoverBgColor: COLORS.greenBg, textColor: COLORS.greenFg, relativeTime: relTime, shortTime: sTime }; // Green
		if (diffMins <= 20) return { baseBgColor: COLORS.orangeBg, hoverBgColor: COLORS.orangeBg, textColor: COLORS.orangeFg, relativeTime: relTime, shortTime: sTime }; // Orange
		return { baseBgColor: COLORS.redBg, hoverBgColor: COLORS.redBg, textColor: COLORS.redFg, relativeTime: relTime, shortTime: sTime }; // Red
	}, [date, time]);

	return <>
		<PremiumTooltip title={titleText} placement="top" arrow>
			<Paper
				elevation={0}
				sx={{
					width: "100%",
					borderRadius: 1,
					px: 1.5,
					py: 0.7,
					border: "1px solid",
					borderColor: textColor + "40",
					// background: baseBgColor,
					backdropFilter: "blur(10px)",
					transition: "0.3s",
					cursor: 'pointer',
					"&:hover": {
						filter: "brightness(0.98)",
						borderColor: textColor
					},
				}}
				onClick={onAccept}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					{/* Left */}
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
					>
						<Avatar
							sx={{
								width: 40,
								height: 40,
								borderRadius: 1,
								bgcolor: textColor,
								color: 'white',
								fontSize: '0.85rem',
								fontWeight: 800
							}}
							variant="square"
						>
							{shortTime}
						</Avatar>

						<Box>
							<Typography
								fontWeight={700}
								fontSize={14}
								sx={{
									textTransform: 'capitalize'
								}}
							>
								{name || "Unknown"}  {company && (<Chip
									sx={{ fontSize: "0.7rem", height: 20, color: COLORS.callFg, bgcolor: COLORS.callBg }}
									title={company}
									label={truncatedCompany}
									size="small"
								/>)}
							</Typography>

							<Stack
								direction="row"
								spacing={0.5}
								alignItems="center"
							>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									<Typography sx={{ fontSize: 11, color: "#5F6368", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
										{truncatedAppName ? truncatedAppName : company ? truncatedCompany : "No App"} {truncatedDesc ? ` • ${truncatedDesc}` : ""}
									</Typography>
								</Typography>
							</Stack>
							<Stack
								direction="row"
								spacing={1.5}
								alignItems="center"
								mt={0.5}
							>
								{relativeTime && (
									<Typography sx={{ fontSize: "0.65rem", color: textColor, fontWeight: 600, lineHeight: 1 }}>
										{relativeTime}
									</Typography>
								)}
							</Stack>
						</Box>
					</Stack>

				</Stack>
			</Paper>
		</PremiumTooltip>
	</>

	return (
		<PremiumTooltip title={titleText} placement="right" arrow>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					p: 1,
					mb: 0.5,
					borderRadius: 2,
					transition: "background-color 0.15s ease",
					cursor: "pointer",
					backgroundColor: baseBgColor,
					overflow: "hidden", // Never grow the parent
					"&:hover": {
						backgroundColor: hoverBgColor,
					},
				}}
			>
				{/* Left Avatar */}
				<Avatar
					sx={{
						width: 32,
						height: 32,
						bgcolor: baseBgColor,
						color: COLORS.callFg,
						fontSize: 14,
						flexShrink: 0
					}}
				>
					{name ? name.charAt(0).toUpperCase() : "U"}
				</Avatar>

				{/* Center Content */}
				<Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
					<Typography
						sx={{
							fontSize: 13,
							fontWeight: 600,
							color: "#202124",
							lineHeight: 1.2,
							mb: 0.3
						}}
					>
						{name || "Unknown"}  {company && (<Chip
							sx={{ fontSize: "0.7rem", height: 20, color: COLORS.callFg, bgcolor: COLORS.callBg }}
							title={company}
							label={truncatedCompany}
							size="small"
						/>)}
					</Typography>

					<Box sx={{ display: "flex", flexDirection: "column" }}>
						<Typography sx={{ fontSize: 11, color: "#5F6368", lineHeight: 1.1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
							{truncatedAppName ? truncatedAppName : company ? truncatedCompany : "No App"} {truncatedDesc ? ` • ${truncatedDesc}` : ""}
						</Typography>
					</Box>
				</Box>

				{/* Right Accept Button & Time */}
				<Box sx={{ flexShrink: 0, ml: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
					{fullTimeText && (
						<Typography sx={{ fontSize: "0.65rem", color: textColor, fontWeight: 600, lineHeight: 1 }}>
							{fullTimeText}
						</Typography>
					)}
					<Button
						variant="contained"
						size="small"
						onClick={onAccept}
						sx={{
							borderRadius: 1.5,
							textTransform: "none",
							minWidth: "auto",
							px: 1.2,
							height: "26px",
							fontWeight: 600,
							fontSize: "0.7rem",
							boxShadow: "none",
							bgcolor: COLORS.greenBg,
							color: COLORS.greenFg,
							"&:hover": {
								bgcolor: COLORS.greenBg,
								filter: "brightness(0.95)"
							}
						}}
					>
						Accept
					</Button>
				</Box>
			</Box>
		</PremiumTooltip>
	);
};

const CustomerInfoCard = ({ data = null, onClose = () => { } }) => {
	const safeData = data || {};
	const { CompanyName, SignUp = "", Flow = "", owner = "", Package, BusinessType = "", subscription = {}, advancedFeatures = [], specialFlow = "", integrations = [] } = safeData;

	const renderField = (value, fallback = "No information available") => {
		const isEmpty = value === null || value === undefined || (typeof value === "string" && value.trim() === "");

		return isEmpty ? (
			<Typography variant="body2" color="text.secondary">
				{fallback}
			</Typography>
		) : (
			<Typography
				variant="body1"
				sx={{
					fontSize: "14px !important",
					textTransform: "capitalize !important",
				}}
			>
				{value}
			</Typography>
		);
	};

	return (
		<Card
			sx={{
				maxWidth: 1000,
				margin: "auto",
				borderRadius: 3,
				maxHeight: "80vh",
				overflowY: "auto",
				position: "relative",
			}}
		>
			<Box
				sx={{
					position: "sticky",
					top: 0,
					backgroundColor: "white",
					zIndex: 1,
					p: "10px 20px",
					borderBottom: "1px solid #e0e0e0",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="h6" fontWeight={600}>
					<BusinessIcon sx={{ verticalAlign: "middle", mr: 1 }} />
					Customer Profile
				</Typography>
				<IconButton onClick={onClose}>
					<X />
				</IconButton>
			</Box>

			<CardContent>
				<Grid container spacing={2}>
					{/* Company Info */}
					<Grid item xs={12} sm={6}>
						<Typography variant="subtitle2" color="text.secondary">
							Company Name
						</Typography>
						{renderField(CompanyName)}
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography variant="subtitle2" color="text.secondary">
							Sign Up
						</Typography>
						{renderField(SignUp)}
					</Grid>

					{Flow && (
						<Grid item xs={12}>
							<Typography variant="subtitle2" color="text.secondary">
								Flow
							</Typography>
							<Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
								{truncateByChars(Flow, 1500)}
							</Typography>
						</Grid>
					)}

					<Grid item xs={12} sm={6}>
						<Typography variant="subtitle2" color="text.secondary">
							Owner
						</Typography>
						{renderField(owner)}
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography variant="subtitle2" color="text.secondary">
							Business Type
						</Typography>
						{renderField(BusinessType)}
					</Grid>

					{/* Subscription Info */}
					<Grid item xs={12}>
						<Divider sx={{ my: 2 }} />
						<Typography variant="h6" fontWeight={500} gutterBottom>
							Subscription Info
						</Typography>
					</Grid>

					{Package && (
						<Grid item xs={12} sm={6}>
							<Typography variant="subtitle2" color="text.secondary">
								Package
							</Typography>
							<Chip label={renderField(Package, "No package")} size="small" sx={{ height: "18px" }} color="primary" />
						</Grid>
					)}

					<Grid item xs={12} sm={6}>
						<Typography variant="subtitle2" color="text.secondary">
							Subscription Date
						</Typography>
						{renderField(subscription.subscriptionDate)}
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography variant="subtitle2" color="text.secondary">
							Last Upgradation
						</Typography>
						{renderField(subscription.lastUpgradation)}
					</Grid>

					{/* Advanced Features */}
					<Grid item xs={12}>
						<Divider sx={{ my: 2 }} />
						<Typography variant="h6" fontWeight={500} gutterBottom>
							Advanced Features
						</Typography>
						{advancedFeatures.length > 0 ? (
							<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
								{advancedFeatures.slice(0, 200).map((feature, index) => (
									<Chip key={index} label={feature} size="small" />
								))}
							</Box>
						) : (
							<Typography variant="body2" color="text.secondary">
								No advanced features available
							</Typography>
						)}
					</Grid>

					{/* Special Flow */}
					<Grid item xs={12}>
						<Divider sx={{ my: 2 }} />
						<Typography variant="h6" fontWeight={500} gutterBottom>
							Special Flow
						</Typography>
						{renderField(specialFlow)}
					</Grid>

					{/* 3rd Party Integrations */}
					<Grid item xs={12}>
						<Divider sx={{ my: 2 }} />
						<Typography variant="h6" fontWeight={500} gutterBottom>
							3rd Party Integrations
						</Typography>
						{integrations.length > 0 ? (
							<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
								{integrations.slice(0, 200).map((integration, index) => (
									<Chip key={index} label={integration} size="small" />
								))}
							</Box>
						) : (
							<Typography variant="body2" color="text.secondary">
								No integrations available
							</Typography>
						)}
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
};
