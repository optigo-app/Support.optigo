import React, { useEffect, useState } from "react";
import { Box, Typography, ListItem, Checkbox, Chip, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { FormatTime } from "../../../../libs/formatTime";
import { useTicket } from "../../../../context/useTicket";
import { DataParser, GetTicketStatusStyle } from "../../../../utils/ticketUtils";
import { useAuth } from "../../../../context/UseAuth";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { LiaComment } from "react-icons/lia";

const PriorityChip = styled(Box)(({ color }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: 22,
	height: 22,
	borderRadius: "50%",
	backgroundColor: color,
}));

const TicketItem = ({ selectedTicket, onTicketSelect, ticket }) => {
	const [Star, setStar] = useState(ticket?.star === true || ticket?.star === "true");
	const { updateTicket } = useTicket();
	const { user } = useAuth();

	const { bgColor, textColor } = GetTicketStatusStyle(ticket?.Status);

	const handleStarChange = (data, id) => {
		const isStarred = data === true || data === "true";
		setStar(isStarred);
		updateTicket(id, { Star: isStarred ? 1 : 0 });
	};

	useEffect(() => {
		setStar(ticket?.star === true || ticket?.star === "true");
	}, [ticket]);

	const CommentCount = DataParser(ticket?.comments).length;

	return (
		<ListItem
			disablePadding
			sx={{
				display: "block",
				backgroundImage: selectedTicket?.TicketNo === ticket?.TicketNo ? "linear-gradient(135deg, rgba(178,6,155,0.1), rgba(57,9,194,0.1))" : "none",
				borderLeft: selectedTicket?.TicketNo === ticket?.TicketNo ? "4px solid #7808AE" : "4px solid transparent",
				"&:hover": {
					backgroundImage: selectedTicket?.TicketNo === ticket?.TicketNo ? "linear-gradient(135deg, rgba(178,6,155,0.1), rgba(57,9,194,0.1))" : "linear-gradient(135deg, rgba(178,6,155,0.05), rgba(57,9,194,0.05))",
				},
				transition: "all .2s ease-in-out",
				cursor: "pointer",
			}}
			onClick={() => onTicketSelect(ticket)}
		>
			<Box sx={{ p: 2 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						gap: 2,
					}}
				>
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: "medium",
							color: "#172B4D",
							flex: 1,
							wordBreak: "break-word",
							whiteSpace: "pre-wrap",
							display: "-webkit-box",
							WebkitLineClamp: 1,
							WebkitBoxOrient: "vertical",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
						fontSize={14}
					>
						{ticket?.subject}
					</Typography>

					<Typography
						variant="caption"
						sx={{
							color: "#6B778C",
							whiteSpace: "nowrap",
							flexShrink: 0,
						}}
					>
						{FormatTime(ticket?.CreatedOn, "shortDate")}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Tooltip title={`Only Admin can Star Tickets`}>
						<Checkbox
							onClick={(e) => e.stopPropagation()}
							// disabled={user?.designation !== "Admin"}
							onChange={(e) => handleStarChange(e.target.checked, ticket?.TicketNo)}
							size="small"
							icon={<StarBorderRoundedIcon fontSize="medium" />}
							checkedIcon={<StarRoundedIcon fontSize="medium" />}
							sx={{ p: 0, mr: 1 }}
							checked={Star}
						/>
					</Tooltip>
					<Typography fontSize={13} variant="body2" sx={{ color: "#6B778C", mr: 1 }}>
						{ticket?.TicketNo}
					</Typography>

					<Typography fontSize={13} variant="body2" sx={{ color: "#6B778C", mr: 1 }}>
						<Chip
							icon={<BusinessRoundedIcon fontSize="small" />}
							label={ticket?.companyname}
							variant="filled"
							color="default"
							sx={{
								fontSize: "12px",
								height: 24,
								borderRadius: 5,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								bgcolor: "#56565614",
							}}
						/>
					</Typography>

					<Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: 1 }}>
						{/* Priority Chips with Tooltips */}
						{ticket?.Priority === "High" && (
							<Tooltip title="High Priority" arrow>
								<Box>
									<PriorityChip color="#FF5630">
										<PriorityHighIcon sx={{ color: "white", fontSize: 15 }} />
									</PriorityChip>
								</Box>
							</Tooltip>
						)}

						{ticket?.Priority == "Medium" && (
							<Tooltip title="Medium Priority" arrow>
								<Box>
									<PriorityChip color="#FFAB00">
										<ErrorOutlineIcon sx={{ color: "white", fontSize: 15 }} />
									</PriorityChip>
								</Box>
							</Tooltip>
						)}

						{/* Comment Count Chip with Tooltip */}
						{CommentCount > 0 && (
							<Tooltip title={`${CommentCount} Comments`} arrow>
								<Chip
									label={`${CommentCount}`}
									color="primary"
									icon={<LiaComment fontSize={"18px"} />}
									sx={{
										border: "none",
										height: 23,
									}}
								/>
							</Tooltip>
						)}
					</Box>
				</Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 0.9,
						mt: 0.5,
					}}
				>
					{ticket?.Status && (
						<Chip
							label={`Status: ${ticket?.Status}`}
							size="small"
							sx={{
								backgroundColor: bgColor,
								color: textColor,
								fontWeight: 500,
								fontSize: "11px",
								height: 22,
							}}
						/>
					)}

					{/* {ticket?.instruction &&
            ticket?.instruction?.split(/[/|,]+/)?.map((person, index) => (
              <Chip
                key={index}
                label={`${person}`}
                size="small"
                sx={{
                  backgroundColor: "#E3F2FD",
                  color: "#1E88E5",
                  fontSize: "11px",
                  fontWeight: 500,
                  height: 20,
                }}
              />
            ))} */}
				</Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						mt: 0.5,
					}}
				>
					{ticket?.instruction && (
						<Typography
							variant="body2"
							fontSize={13}
							sx={{
								display: "-webkit-box",
								WebkitLineClamp: 3,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{ticket.instruction}
						</Typography>
					)}
				</Box>
			</Box>
		</ListItem>
	);
};

export default TicketItem;
