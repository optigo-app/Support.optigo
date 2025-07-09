import { useState, useRef, useEffect } from "react";
import { Box, InputBase, IconButton, Paper, Typography, Popper, ClickAwayListener, Divider, Chip, Stack, Grid, Badge, Avatar, Tooltip } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { DetailgetPriorityColor, DetailgetStatusColor } from "../../../../libs/data";
import { useTicket } from "../../../../context/useTicket";

// Custom styled components
const Search = styled("div")(({ theme }) => ({
	position: "relative",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: "100%",
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(3),
		width: "auto",
	},
	color: theme.palette.common.white,
}));

const ResultsContainer = styled(Paper)(({ theme }) => ({
	width: "100%",
	maxWidth: "600px",
	maxHeight: "400px",
	overflowY: "auto",
	marginTop: theme.spacing(1),
	boxShadow: theme.shadows[4],
}));

const ResultHeader = styled(Box)(({ theme }) => ({
	position: "sticky",
	top: 0,
	padding: theme.spacing(1.5),
	backgroundColor: theme.palette.background.paper,
	borderBottom: `1px solid ${theme.palette.divider}`,
	zIndex: 1,
}));

const ResultItem = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1.5),
	transition: theme.transitions.create("background-color"),
	"&:hover": {
		backgroundColor: theme.palette.action.hover,
	},
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
	let color;
	if (status.toLowerCase().includes("pending")) {
		color = "warning";
	} else if (status.toLowerCase().includes("change")) {
		color = "secondary";
	} else {
		color = "info";
	}
	return {
		height: "18px",
		"& .MuiChip-label": {
			fontSize: "0.70rem",
			padding: "0 8px",
		},
		textTransform: "capitalize",
		variant: "outlined",
		color: color,
	};
});

const PriorityChip = styled(Chip)(({ priority, theme }) => {
	let color;
	switch (priority) {
		case "High":
			color = "error";
			break;
		case "Medium":
			color = "warning";
			break;
		case "Low":
			color = "success";
			break;
		default:
			color = "default";
	}
	return {
		height: "18px",
		"& .MuiChip-label": {
			fontSize: "0.70rem",
			padding: "0 8px",
		},
		textTransform: "capitalize",
		variant: "outlined",
	};
});

const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("md")]: {
			width: "40ch",
		},
	},
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
	position: "absolute",
	right: theme.spacing(1),
	top: "50%",
	transform: "translateY(-50%)",
	color: alpha(theme.palette.common.white, 0.7),
	"&:hover": {
		color: theme.palette.common.white,
	},
}));

const SearchPopover = ({ onSelect = () => {} }) => {
	const [searchText, setSearchText] = useState("");
	const [showPopover, setShowPopover] = useState(false);
	const searchRef = useRef(null);
	const inputRef = useRef(null);
	const { tickets } = useTicket();
	const [highlightedIndex, setHighlightedIndex] = useState(0);

	const ticketsData = [];

	const [searchResults, setSearchResults] = useState([]);

	useEffect(() => {
		if (searchText.length >= 3) {
			const filteredResults = ticketsData.filter((ticket) => {
				const searchLower = searchText.toLowerCase();

				// Search across all properties of the ticket
				const searchableFields = [ticket.subject, ticket.TicketNo, ticket.companyname, ticket.username, ticket.category, ticket.Status, ticket.CreatedBy, ticket.Priority];

				return searchableFields.some((field) => field && field.toString().toLowerCase().includes(searchLower));
			});

			setSearchResults(filteredResults);
			setShowPopover(true);
		} else {
			setShowPopover(false);
		}
	}, [searchText]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!showPopover || searchResults.length === 0) return;

			if (e.key === "ArrowDown") {
				setHighlightedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
				e.preventDefault();
			} else if (e.key === "ArrowUp") {
				setHighlightedIndex((prev) => Math.max(prev - 1, 0));
				e.preventDefault();
			} else if (e.key === "Enter") {
				handleResultClick(searchResults[highlightedIndex]);
				e.preventDefault();
			} else if (e.key === "Escape") {
				setShowPopover(false);
				e.preventDefault();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [showPopover, searchResults, highlightedIndex]);

	const handleSearchChange = (e) => {
		setSearchText(e.target.value);
	};

	const handleClearSearch = () => {
		setSearchText("");
		setShowPopover(false);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleResultClick = (ticket) => {
		setSearchText("");
		setShowPopover(false);
		onSelect(ticket);
	};

	const handleClickAway = () => {
		setShowPopover(false);
	};

	return (
		<ClickAwayListener onClickAway={handleClickAway}>
			<Box sx={{ position: "relative", width: "100%" }}>
				<Search ref={searchRef}>
					<SearchIconWrapper>
						<SearchIcon />
					</SearchIconWrapper>
					<StyledInputBase inputRef={inputRef} placeholder="Search Tickets..." value={searchText} onChange={handleSearchChange} inputProps={{ "aria-label": "search" }} />
					{searchText && (
						<ClearButton size="small" aria-label="clear search" onClick={handleClearSearch}>
							<CloseIcon fontSize="small" />
						</ClearButton>
					)}
				</Search>

				{/* Results Popper */}
				{showPopover && (
					<Popper open={showPopover} anchorEl={searchRef.current} placement="bottom-start" style={{ width: searchRef.current?.offsetWidth, zIndex: 1200 }}>
						<ResultsContainer>
							<ResultHeader>
								<Typography variant="subtitle2">
									{searchResults.length} Results for "{searchText}"
								</Typography>
							</ResultHeader>

							{searchResults.length > 0 ? (
								searchResults.slice(0, 20).map((ticket, index) => {
									const isHighlighted = index === highlightedIndex;
									return (
										<Box
											onClick={() => handleResultClick(ticket)}
											key={ticket.TicketId}
											sx={{
												position: "relative",
												"&:hover": {
													borderLeft: "4px solid #a84db8",
												},
												bgcolor: isHighlighted ? "rgba(0, 0, 0, 0.04)" : "transparent",
												borderLeft: isHighlighted ? "4px solid #a84db8" : "none",
												cursor: "pointer",
											}}
										>
											<ResultItem>
												<Grid container spacing={1}>
													{/* Left section */}
													<Grid item xs={12} sm={7}>
														<Box
															sx={{
																mb: 0.5,
																display: "flex",
																alignItems: "center",
															}}
														>
															<Typography variant="body2" fontWeight="medium" noWrap sx={{ mr: 0.5 }}>
																{ticket.subject}
															</Typography>
															<IconButton size="small" sx={{ p: 0.5 }}>
																{ticket.star ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
															</IconButton>
														</Box>
														<Typography variant="caption" color="text.secondary" noWrap>
															{ticket.TicketNo} | {ticket.companyname}
														</Typography>
													</Grid>

													{/* Middle section - status and priority chips */}
													<Grid item xs={12} sm={3}>
														<Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
															<StatusChip color={DetailgetStatusColor(ticket?.Status)} label={ticket.Status} status={ticket.Status} size="small" />
															{ticket.Priority && <PriorityChip color={DetailgetPriorityColor(ticket?.Priority)} label={ticket.Priority} priority={ticket.Priority} size="small" />}
														</Stack>
													</Grid>

													{/* Right section */}
													<Grid item xs={12} sm={2}>
														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
															}}
														>
															<BadgeAvatars title={ticket.CreatedBy} />
														</Box>
													</Grid>
												</Grid>
											</ResultItem>
											{/* <Box sx={{ p: "3px 4px", bgcolor: "#f5f5f5", display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {ticket.CreatedOn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated: {ticket.UpdatedAt} ({ticket.UpdatedAge})
                      </Typography>
                    </Box> */}
											<Divider />
										</Box>
									);
								})
							) : (
								<Box sx={{ p: 3, textAlign: "center" }}>
									<Typography variant="body2" color="text.secondary">
										No results found for "{searchText}"
									</Typography>
								</Box>
							)}
						</ResultsContainer>
					</Popper>
				)}
			</Box>
		</ClickAwayListener>
	);
};

export default SearchPopover;

const StyledBadge = styled(Badge)(({ theme }) => ({
	"& .MuiBadge-badge": {
		backgroundColor: "#44b700",
		color: "#44b700",
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
		"&::after": {
			position: "absolute",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			borderRadius: "50%",
			animation: "ripple 1.2s infinite ease-in-out",
			border: "1px solid currentColor",
			content: '""',
		},
	},
	"@keyframes ripple": {
		"0%": {
			transform: "scale(.8)",
			opacity: 1,
		},
		"100%": {
			transform: "scale(2.4)",
			opacity: 0,
		},
	},
}));

function BadgeAvatars({ title }) {
	return (
		<Stack direction="row" spacing={2}>
			<StyledBadge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
				<Tooltip title={title} placement="top">
					<Avatar
						alt={title}
						sx={{
							width: 24,
							height: 24,
							fontSize: 14,
							textTransform: "uppercase",
							fontWeight: "bold",
						}}
						src="/static/images/avatar/1.jpg"
					/>
				</Tooltip>
			</StyledBadge>
		</Stack>
	);
}
