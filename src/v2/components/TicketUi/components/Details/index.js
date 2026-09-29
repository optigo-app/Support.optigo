import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import TicketComment from "../Comment";
import CommentList from "../Comment/CommentList";
import ClosedSeeOff from "./ClosedSeeOff";
import DetailBar from "./DetailBar";
import DetailSideBar from "./DetailSideBar";
import { DataParser } from "../../../../utils/ticketUtils";
import { useTicket } from "../../../../context/useTicket";
import { FormatTime } from "../../../../libs/formatTime";

const getFormattedClosedTime = (ticketObj) => {
	const raw = ticketObj?.TicketCloseTime || ticketObj?.UpdatedAt;
	if (!raw) return "";
	const isoStr = typeof raw === "string" ? raw.trim().replace(" ", "T") : raw;
	const formatted = FormatTime(isoStr, "datetime");
	if (formatted) return formatted;
	try {
		const d = new Date(isoStr);
		if (!isNaN(d.getTime())) {
			return d.toLocaleString("en-US", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});
		}
	} catch (e) {}
	return String(raw);
};

const TicketDetail = ({ ticket, onClose, showNotification }) => {
	const IsClosed = ticket?.Status === "Closed" || String(ticket?.Status).toLowerCase() === "closed";
	const closedByName = ticket?.LastUpdatedBy || ticket?.username || ticket?.CreatedBy || "Admin";
	const closedDateTime = IsClosed ? getFormattedClosedTime(ticket) : "";

	const [Comments, setComments] = useState([]);
	const [anchorEl, setAnchorEl] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const { updateTicket, refreshComment, CloseTicket } = useTicket();

	const handleReopen = () => {
		if (ticket?.TicketNo && CloseTicket) {
			CloseTicket(ticket.TicketNo, 1);
		}
	};

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const handleInputChange = (event) => {
		const value = event.target.value;
		setInputValue(value);
	};

	const HandleSave = async () => {
		try {
			const res = await updateTicket(ticket?.TicketNo, {
				MainSubject: inputValue,
			});
			setInputValue("");
			handleClose();
		} catch (error) {
			console.log(error, "error");
		}
	};

	useEffect(() => {
		setComments([]);
		if (ticket?.MainSubject) {
			setInputValue(ticket?.MainSubject ?? "");
		}

		const parsedComments = DataParser(ticket?.comments || "").data || [];
		setComments([...parsedComments]);
	}, [ticket, ticket?.TicketNo, refreshComment , ticket?.TicketId]);

	return (
		<Box
			sx={{
				flexGrow: 1,
				display: "flex",
				overflow: "hidden",
				width: "100%",
			}}
		>
			<Box
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					borderRight: "1px solid #DFE1E6",
					width: "50%",
					height: "100%",
				}}
			>
				<Box sx={{ flex: 1, overflow: "auto" }}>
					<Box sx={{ padding: '8px' }}>
						<ClosedSeeOff IsClosed={IsClosed} TicketNo={ticket?.TicketNo} />
					</Box>
					<DetailBar handleClick={handleClick} anchorEl={anchorEl} open={open} handleClose={handleClose} inputValue={inputValue} HandleSave={HandleSave} handleInputChange={handleInputChange} onClose={onClose} ticket={ticket} />
					<TicketComment showNotification={showNotification} data={ticket} setComments={setComments} />
					<CommentList data={Comments} key={ticket?.TicketId} />
				</Box>

				{/* Fixed Minimal Aesthetic Closed Bar Pinned to Bottom */}
				{IsClosed && (
					<Box
						sx={{
							flexShrink: 0,
							py: 0.9,
							px: 2,
							bgcolor: "#FFFFFF",
							borderTop: "1px solid #E2E8F0",
							boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.03)",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 1.5,
							zIndex: 20,
							borderRadius: '40px',
							transition: 'all 0.15s ease',
							"&:hover": {
							py: 1.5,
							}
						}}
					>
						{/* Left: Status indicator + text */}
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
							<Box
								sx={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									bgcolor: "#DC2626",
									boxShadow: "0 0 0 3px #FEE2E2",
									flexShrink: 0,
								}}
							/>

							<Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0, flexWrap: "wrap" }}>
								<Typography sx={{ fontSize: "0.82rem", fontWeight: 750, color: "#0F172A", whiteSpace: "nowrap" }}>
									Ticket has been closed
								</Typography>

								<Typography sx={{ fontSize: "0.78rem", color: "#64748B", whiteSpace: "nowrap" }}>
									by <Box component="span" sx={{ fontWeight: 650, color: "#334155" }}>{closedByName}</Box>
									{closedDateTime && (
										<Box component="span" sx={{ color: "#94A3B8" }}> • {closedDateTime}</Box>
									)}
								</Typography>
							</Box>
						</Box>

						{/* Right: Reopen Button */}
						<Button
							size="small"
							onClick={handleReopen}
							sx={{
								height: 24,
								fontSize: "0.74rem",
								fontWeight: 700,
								textTransform: "none",
								color: "#DC2626",
								bgcolor: "#FEF2F2",
								border: "1px solid #FECACA",
								borderRadius: "5px",
								px: 1.2,
								minWidth: 0,
								transition: "all 0.15s ease",
								"&:hover": {
									bgcolor: "#FEE2E2",
									borderColor: "#DC2626",
								},
							}}
						>
							Reopen
						</Button>
					</Box>
				)}
			</Box>
			<DetailSideBar key={ticket?.TicketNo || ticket?.TicketId} ticket={ticket} IsClosed={IsClosed} />
		</Box>
	);
};

export default TicketDetail;
