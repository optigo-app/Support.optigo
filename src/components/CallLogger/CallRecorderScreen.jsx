import React, { useCallback, useMemo, useRef, useState } from "react";
import { Box, Button, Collapse, IconButton, Typography, List, Chip, MenuItem, Menu, Tooltip, Stack, Paper, Card, CardContent, Grid, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { formatTime } from "../../libs/formatTime";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { BriefcaseBusiness, Icon, PhoneIncoming, X } from "lucide-react";
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
import { truncateByWords, truncateByChars } from "../../libs/data";
import PersonIcon from "@mui/icons-material/Person";
import { findCompanyAndClosestOwner } from "../../libs/helper";

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

const CallRecorderScreen = ({ callStatusValue, onEditToggle, setPostReview, onDetailsToggle, onEditCall, onAddConCurrentCall, onStartCall, isRecordingExpanded, recordingTime, onEndCall, CurrentCall, onCloseRecord, onPause, onResume, isPaused }) => {
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
								{!CurrentCall?.callClosed && (
									<Typography fontWeight={300} letterSpacing={1} variant="subtitle1" mb={0.5} mt={1}>
										<FiberManualRecordIcon color="error" /> {recordingTime > 0 ? `Call Duration : ${formatTime(recordingTime)}` : "Start A Call"}
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
										{!CurrentCall?.callStart && !CurrentCall?.callClosed && (
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
										{/* pause and resume Button */}
										{CurrentCall?.callStart && !CurrentCall?.callClosed && (
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
														backgroundColor: "#444",
														color: "white",
														":hover": { bgcolor: "#444" },
													}}
												>
													{isPaused ? <PlayArrowRoundedIcon fontSize="medium" /> : <PauseIcon fontSize="medium" />}
												</IconButton>
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>{isPaused ? "Resume" : "Pause"}</Typography>
											</Box>
										)}
										{/* Add Call Button */}
										{!CurrentCall?.callClosed && recordingTime > 0 && (
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

										{/* Call End Button */}
										{CurrentCall?.callStart && !CurrentCall?.callClosed && (
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
												<Typography sx={{ marginTop: 0.5, fontSize: "12px" }}>Hang up</Typography>
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
													disabled
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

											{/* <MenuItem disabled={Object?.keys(CurrentCall?.callAnalysis).length !== 0} onClick={handlePostCallReview} {...MuiProps}>
                        <ListItemIcon>
                          <RateReviewIcon fontSize="small" />
                        </ListItemIcon>
                        Post-Call Review
                      </MenuItem> */}
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

const CallQueueUI = ({ onEditCall }) => {
	const { queue } = useCallLog();
	const handleCall = (id) => {
		onEditCall(id);
	};
	return (
		<>
			<Typography
				variant="h6"
				sx={{
					display: "flex",
					alignItems: "center",
					width: "100%",
					px: 1.5,
					gap: 1,
					paddingBottom: "0 !important",
					paddingTop: "10px",
				}}
			>
				<PhoneCallbackRoundedIcon color="success" /> Queue
			</Typography>
			<List
				sx={{
					width: "100%",
					maxHeight: "41.8vh",
					overflowY: "auto",
					paddingInline: "7px",
					borderBottomRightRadius: "20px",
					borderBottomLeftRadius: "20px",
				}}
			>
				{queue?.map((call) => (
					<div key={call?.id}>
						<UserRequestCard appname={call?.appname} company={call?.company} department={call?.department} description={call?.description} name={call?.callBy} onAccept={() => handleCall(call?.sr)} />
					</div>
				))}
			</List>
		</>
	);
};

const UserRequestCard = ({ name, appname, company, description, onAccept }) => {
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const truncatedDesc = description?.length > 20 ? `${description?.substring(0, 20)}...` : description;
	const truncatedAppName = appname?.length > 10 ? `${appname?.substring(0, 10)}...` : appname;

	return (
		<Paper
			elevation={2}
			sx={{
				p: 2,
				borderRadius: 2,
				transition: "all 0.2s",
				position: "relative",
				overflow: "hidden",
				"&:hover": {
					boxShadow: 3,
				},
				mb: 1,
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between" }}>
				<Stack>
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							display: "flex",
							gap: "0.3rem",
							mt: 0.4,
							ml: 0.7,
						}}
					>
						{company && <Chip label={company} size="small" color="primary" sx={{ fontSize: "0.7rem", height: 17, borderRadius: 1 }} />}
						{truncatedAppName && <Chip label={truncatedAppName} size="small" color="warning" sx={{ fontSize: "0.7rem", height: 17, borderRadius: 2 }} />}
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
						<Typography variant="subtitle1" fontWeight={600}>
							{name}
						</Typography>
						<Tooltip title={description} open={tooltipOpen} onClose={() => setTooltipOpen(false)} onOpen={() => setTooltipOpen(true)} arrow>
							<IconButton size="small" onMouseEnter={() => setTooltipOpen(true)} onMouseLeave={() => setTooltipOpen(false)}>
								<InfoIcon fontSize="small" color="primary" />
							</IconButton>
						</Tooltip>
					</Box>
					{description && (
						<Typography variant="body2" color="text.secondary">
							{truncatedDesc}
						</Typography>
					)}
				</Stack>

				<Button
					variant="contained"
					size="small"
					sx={{
						alignSelf: "center",
						px: 2,
						borderRadius: 1.5,
						textTransform: "none",
						minWidth: "80px",
					}}
					color="success"
					onClick={onAccept}
				>
					Accept
				</Button>
			</Box>
		</Paper>
	);
};

const CustomerInfoCard = ({ data = null, onClose = () => {} }) => {
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
