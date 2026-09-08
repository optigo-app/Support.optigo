import React, { useState } from "react";
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider, IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ticketSidebarCollapsed$, toggleTicketSidebar, useSubject } from "../../../../rxjs/layoutStore";
import { ticketSidebarCounts$, useSubjectValue } from "../../../../rxjs/ticketStore";
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
import Select from "@mui/material/Select";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import MentionFilterSection from "./MentionFilterSection";
import { useTicket } from "../../../../context/useTicket";
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
	{ label: "Open Tickets", value: "openTicket" },
	{ label: "New Tickets", value: "newTicket" },
	{ label: "Suggestions", value: "isSuggested" },
	{ label: "Person Wise", value: "personWise" },
	{ label: "Mentions By Who", value: "mentionedBy" },
];
const Sidebar = ({ handleCreateTicket, activeItem, setActiveItem, AgesBasedFilter, setAgesBasedFilter }) => {
	const collapsed = useSubject(ticketSidebarCollapsed$);
	const toggleSidebar = () => toggleTicketSidebar();
	const [anchorEl, setanchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const theme = useTheme();
	const { tickets } = useTicket();

	// Read all 12 counts from the RxJS store — computed in ONE pass across all tickets
	const counts = useSubjectValue(ticketSidebarCounts$);

	const handleChange = (event) => {
		setAgesBasedFilter(event.target.value);
	};

	const renderStaticItem = (id, label, icon, count = 0, filterKey) => (
		<Tooltip title={collapsed ? `${filterKey ? filterKey : count} - ${label}` : ""} placement="right">
			<ListItem disablePadding sx={{ display: "block" }}>
				<Tooltip title={collapsed ? `${filterKey ? filterKey : count} - ${label}` : ""} placement="right">
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
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
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
					minWidth: collapsed ? 60 : 240,
					backgroundColor: "#ffffff",
					display: "flex",
					flexDirection: "column",
					overflowX: "hidden",
					overflowY: "auto",
					transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
					boxSizing: "border-box",
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
							{!collapsed && <Typography sx={{ ml: 2, fontWeight: 500, fontSize: "15px", whiteSpace: "nowrap" }}>Create</Typography>}
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
								whiteSpace: "nowrap",
								overflow: "hidden",
							}}
						>
							TICKET VIEWS
						</Typography>
					)}
					<List sx={{ p: 0 }}>
						{renderStaticItem("all", "All Tickets", <StarIcon fontSize="small" />, counts.all)}
						{renderStaticItem("new_ticket", "New Ticket", <NewReleasesIcon fontSize="small" />, counts.new_ticket)}
						{renderStaticItem("open_ticket", "Open Ticket", <WorkIcon fontSize="small" />, counts.open_ticket)}
						{renderStaticItem("closed_ticket", "Closed Ticket", <CheckCircleIcon fontSize="small" />, counts.closed_ticket)}
						{renderStaticItem("isSuggested", "Suggestion", <TipsAndUpdatesIcon fontSize="small" />, counts.isSuggested)}
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
									whiteSpace: "nowrap",
									overflow: "hidden",
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
									MenuProps={{
										PaperProps: {
											sx: {
												maxHeight: "320px",
												borderRadius: 2,
												boxShadow: "0px 4px 16px rgba(0,0,0,0.12)",
											},
										},
									}}
									sx={{
										fontSize: "0.75rem",
										height: "28px",
										maxWidth: "145px",
										"& .MuiSelect-select": {
											py: 0.5,
											pr: "24px !important",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
										},
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
						{renderStaticItem("all_age", "All Ages", <AllInclusiveIcon fontSize="small" />, counts.all_age, AgesBasedFilter)}
						{renderStaticItem("Today", "Today", <TodayIcon fontSize="small" />, counts.Today, AgesBasedFilter)}
						{renderStaticItem("1d", "1 Day", <TodayIcon fontSize="small" />, counts["1d"], AgesBasedFilter)}
						{renderStaticItem("2d", "2 Days", <CalendarViewDayIcon fontSize="small" />, counts["2d"], AgesBasedFilter)}
						{renderStaticItem("1w", "1 Week", <DateRangeIcon fontSize="small" />, counts["1w"], AgesBasedFilter)}
						{renderStaticItem("1m", "1 Month", <EventNoteIcon fontSize="small" />, counts["1m"], AgesBasedFilter)}
						{renderStaticItem("1y", "+1 Year", <EventNoteIcon fontSize="small" />, counts["1y"], AgesBasedFilter)}
					</List>
				</Box>
				<Divider sx={{ my: 1 }} />
				{/* Mentions Section */}
				<MentionFilterSection tickets={tickets} collapsed={collapsed} />
				<Divider sx={{ my: 1 }} />
			</Box>
		</Box>
	);
};

export default React.memo(Sidebar);
