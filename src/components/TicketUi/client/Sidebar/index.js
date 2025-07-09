import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider, IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import TodayIcon from "@mui/icons-material/Today";
import CalendarViewDayIcon from "@mui/icons-material/CalendarViewDay";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventNoteIcon from "@mui/icons-material/EventNote";
import EditOutlinedIcon from "@mui/icons-material/ModeEditOutlineRounded";
import { useTheme } from "@mui/styles";
import { getFilteredTicketCount } from "../../../../utils/TicketListUtils";
import Select from "@mui/material/Select";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
const CountBadge = styled(Box)(({ theme }) => ({
	backgroundColor: "#EBECF0",
	borderRadius: "10px",
	padding: "0 8px",
	fontSize: "12px",
	color: "#172B4D",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	minWidth: "24px",
	height: "20px",
}));

const ageBaseOptions = [
	{ label: "Ticket Created", value: "created" },
	{ label: "Last Updated", value: "updated" },
	{ label: "Latest Comment", value: "latestComment" },
	{ label: "Ticket Closed", value: "closedTicket" },
];
const Sidebar = ({ handleCreateTicket, activeItem, setActiveItem, tickets, AgesBasedFilter, setAgesBasedFilter }) => {
	const [collapsed, setCollapsed] = useState(false);
	const [anchorEl, setanchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const theme = useTheme();
	const toggleSidebar = () => setCollapsed((prev) => !prev);

	const handleChange = (event) => {
		setAgesBasedFilter(event.target.value);
	};

	useEffect(() => {
		sessionStorage.setItem("AgesBasedFilter", JSON.stringify(AgesBasedFilter));
	}, [AgesBasedFilter]);

	const renderStaticItem = (id, label, icon, count = 0, filterKey) => (
		<Tooltip title={collapsed ? `${filterKey} - ${label}` : ""} placement="right">
			<ListItem disablePadding sx={{ display: "block" }}>
				<Tooltip title={collapsed ? `${filterKey} - ${label}` : ""} placement="right">
					<ListItemButton
						sx={{
							background: activeItem === id ? theme.custom.gradients.lightPurpleBlue : "transparent",
							"&:hover": {
								background: activeItem === id ? theme.custom.gradients.lightPurpleBlueHover : theme.custom.gradients.lightPurpleBlueSubtle,
							},
							py: 0.5,
							px: collapsed ? 0 : 2,
							justifyContent: collapsed ? "center" : "flex-start",
						}}
						onClick={() => setActiveItem(id)}
					>
						<Box
							sx={{
								width: 36,
								height: 36,
								borderRadius: "50%",
								backgroundColor: collapsed ? "#F4F5F7" : "transparent",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{icon}
						</Box>

						{!collapsed && (
							<>
								<ListItemText
									primary={label}
									sx={{
										ml: 1,
										"& .MuiListItemText-primary": {
											fontSize: "15px !important",
											fontWeight: activeItem === id ? "bold" : "normal",
											color: "#172B4D",
										},
									}}
								/>
								<CountBadge>{count}</CountBadge>
							</>
						)}
					</ListItemButton>
				</Tooltip>
			</ListItem>
		</Tooltip>
	);

	const HandleComposeButtonClick = () => {
		handleCreateTicket();
	};

	const HandleCompose = (e) => {
		setAgesBasedFilter(e);
		setanchorEl(null);
	};

	return (
		<Box sx={{ display: "flex", height: "100%" }}>
			<Box
				sx={{
					width: collapsed ? 60 : 240,
					backgroundColor: "#ffffff",
					display: "flex",
					flexDirection: "column",
					overflow: "auto",
					transition: "width 0.3s ease",
					borderRight: "1px solid #DFE1E6",
				}}
			>
				{/* Toggle Button */}
				<Box
					sx={{
						display: "flex",
						justifyContent: collapsed ? "center" : "flex-end",
						px: 1,
						py: 1,
					}}
				>
					<IconButton onClick={toggleSidebar} size="small">
						{collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
					</IconButton>
				</Box>
				{/* Compose Button */}
				<Box sx={{ px: collapsed ? 1 : 1, pb: 1, mb: collapsed ? 0 : 1 }}>
					<Tooltip title="Compose" placement="right" disableHoverListener={!collapsed}>
						<ListItemButton
							onClick={HandleComposeButtonClick}
							sx={{
								borderRadius: "50px",
								background: (theme) => theme.palette.gradient.main,
								color: "white",
								px: collapsed ? 0 : 2,
								justifyContent: collapsed ? "center" : "flex-start",
								minHeight: 40,
								"&:hover": {
									backgroundColor: "#0065FF",
								},
							}}
						>
							<EditOutlinedIcon fontSize="small" />
							{!collapsed && <Typography sx={{ ml: 2, fontWeight: 500, fontSize: "15px" }}>Create</Typography>}
						</ListItemButton>
					</Tooltip>
				</Box>

				{/* Ticket Views Section */}
				<Box>
					{!collapsed && (
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: "bold",
								color: "#42526E",
								mb: 2,
								px: collapsed ? 0 : 2,
								mt: 1,
							}}
						>
							TICKET VIEWS
						</Typography>
					)}
					<List sx={{ p: 0 }}>
						{renderStaticItem("all", "All Tickets", <StarIcon fontSize="small" />, getFilteredTicketCount("all", tickets))}
						{/* {renderStaticItem("new_ticket", "New Ticket", <NewReleasesIcon fontSize="small" />, getFilteredTicketCount("new_ticket", tickets))} */}
						{/* {renderStaticItem("open_ticket", "Open Ticket", <WorkIcon fontSize="small" />, getFilteredTicketCount("open_ticket", tickets))} */}
						{renderStaticItem("closed_ticket", "Closed Ticket", <CheckCircleIcon fontSize="small" />, getFilteredTicketCount("closed_ticket", tickets))}
						{/* {renderStaticItem("isSuggested", "Suggestion", <TipsAndUpdatesIcon fontSize="small" />, getFilteredTicketCount("isSuggested", tickets))} */}
					</List>
				</Box>

				<Divider sx={{ my: 1 }} />
				<Box>
					{!collapsed ? (
						<Box
							sx={{
								px: collapsed ? 0 : 2,
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: "bold",
									color: "#42526E",
									mb: 2,
									mt: 1,
								}}
							>
								AGES
							</Typography>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: "bold",
									color: "#42526E",
									mb: 2,
									mt: 1,
								}}
							>
								<Select
									value={AgesBasedFilter}
									onChange={handleChange}
									size="small"
									sx={{
										fontSize: "0.75rem",
										height: "28px",
										border: "0px solid transparent",
									}}
								>
									{ageBaseOptions?.map((option, index) => (
										<MenuItem key={index} value={option?.value} selected={option?.value === AgesBasedFilter} sx={{ fontSize: "0.75rem" }}>
											{option?.label}
										</MenuItem>
									))}
								</Select>
							</Typography>
						</Box>
					) : (
						<>
							<ListItemButton
								sx={{
									background: "transparent",
									"&:hover": {
										background: theme.custom.gradients.lightPurpleBlueSubtle,
									},
									py: 0.5,
									px: collapsed ? 0 : 2,
									justifyContent: collapsed ? "center" : "flex-start",
								}}
							>
								<Box
									sx={{
										width: 36,
										height: 36,
										borderRadius: "50%",
										backgroundColor: collapsed ? "#F4F5F7" : "transparent",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
									onClick={(e) => setanchorEl(e.currentTarget)}
								>
									<WidgetsRoundedIcon />
								</Box>

								<Menu
									anchorEl={anchorEl}
									open={open}
									onClose={() => setanchorEl(null)}
									onClick={(e) => e.stopPropagation()}
									PaperProps={{
										style: {
											borderRadius: 15,
											boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
											padding: "4px",
											border: "1px solid #E0E0E0",
										},
									}}
									sx={{
										mt: 1,
										"& .MuiMenu-list": {
											padding: 0,
											display: "flex",
											flexDirection: "column",
											gap: 0.4,
										},
									}}
								>
									{ageBaseOptions.map((option) => (
										<MenuItem
											selected={option.value === AgesBasedFilter}
											onClick={() => HandleCompose(option.value)}
											sx={{
												fontSize: "14px",
												fontWeight: option.value === AgesBasedFilter ? 600 : 400,
												color: option.value === AgesBasedFilter ? "primary.main" : "text.primary",
												backgroundColor: option.value === AgesBasedFilter ? "action.selected" : "transparent",
												borderRadius: 3,
												"&:hover": {
													backgroundColor: "action.hover",
												},
												py: 0.6,
												px: 2,
											}}
										>
											{option.label}
										</MenuItem>
									))}
								</Menu>
							</ListItemButton>
						</>
					)}
					<List sx={{ p: 0 }}>
						{renderStaticItem("all_age", "All Ages", <AllInclusiveIcon fontSize="small" />, getFilteredTicketCount("all_age", tickets, AgesBasedFilter), AgesBasedFilter)}
						{renderStaticItem("Today", "Today", <TodayIcon fontSize="small" />, getFilteredTicketCount("Today", tickets, AgesBasedFilter), AgesBasedFilter)}
						{renderStaticItem("1d", "1 Day", <TodayIcon fontSize="small" />, getFilteredTicketCount("1d", tickets, AgesBasedFilter), AgesBasedFilter)}
						{renderStaticItem("2d", "2 Days", <CalendarViewDayIcon fontSize="small" />, getFilteredTicketCount("2d", tickets, AgesBasedFilter), AgesBasedFilter)}
						{renderStaticItem("1w", "1 Week", <DateRangeIcon fontSize="small" />, getFilteredTicketCount("1w", tickets, AgesBasedFilter), AgesBasedFilter)}
						{renderStaticItem("1m", "1 Month", <EventNoteIcon fontSize="small" />, getFilteredTicketCount("1m", tickets, AgesBasedFilter), AgesBasedFilter)}
						{renderStaticItem("1y", "+1 Year", <EventNoteIcon fontSize="small" />, getFilteredTicketCount("1y", tickets, AgesBasedFilter), AgesBasedFilter)}
					</List>
				</Box>
				<Divider sx={{ my: 1 }} />
			</Box>
		</Box>
	);
};

export default Sidebar;
