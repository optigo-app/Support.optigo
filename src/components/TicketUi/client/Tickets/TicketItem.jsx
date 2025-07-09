import React, { useEffect, useState } from "react";
import { Box, Typography, ListItem, Checkbox, Chip, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { FormatTime } from "../../../../libs/formatTime";
import { useTicket } from "../../../../context/useTicket";
import { DataParser } from "../../../../utils/ticketUtils";
import { useAuth } from "../../../../context/UseAuth";

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

	const handleStarChange = (data, id) => {
		const isStarred = data === true || data === "true";
		setStar(isStarred);
		updateTicket(id, { Star: isStarred ? 1 : 0 });
	};

	useEffect(() => {
		setStar(ticket?.star === true || ticket?.star === "true");
	}, [ticket]);

	const CommentCount = DataParser(ticket?.comments, true).length;

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
							disabled={user?.designation !== "Admin"}
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

					{/* 
          <Typography fontSize={13} variant="body2" sx={{ color: "#6B778C", mr: 1 }}>
            <Chip label={ticket?.companyname} variant="filled" color="default" sx={{ fontSize: "12px", height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }} />
          </Typography> */}

					<Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: 1 }}>
						{/* Priority Chips with Tooltips */}
						{/* {ticket?.Priority === "High" && (
              <Tooltip title="High Priority" arrow>
                <Box>
                  <PriorityChip color="#FF5630">
                    <PriorityHighIcon sx={{ color: "white", fontSize: 15 }} />
                  </PriorityChip>
                </Box>
              </Tooltip>
            )} */}

						{/* {ticket?.Priority == "Medium" && (
              <Tooltip title="Medium Priority" arrow>
                <Box>
                  <PriorityChip color="#FFAB00">
                    <ErrorOutlineIcon sx={{ color: "white", fontSize: 15 }} />
                  </PriorityChip>
                </Box>
              </Tooltip>
            )} */}

						{/* Comment Count Chip with Tooltip */}
						<Tooltip title={`${CommentCount} Comments`} arrow>
							<Chip
								avatar={
									<Box
										component="span"
										sx={{
											width: 22,
											height: 22,
											borderRadius: "50%",
											backgroundColor: "#FF5630",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color: "white !important",
											fontWeight: "bold",
											fontSize: "12px",
										}}
									>
										{CommentCount}
									</Box>
								}
								sx={{
									backgroundColor: "transparent",
									border: "none",
									"& .MuiChip-avatar": {
										marginLeft: 0,
										marginRight: 0,
										height: 22,
										width: 22,
									},
								}}
							/>
						</Tooltip>
					</Box>
				</Box>
				<Typography
					variant="subtitle2"
					fontSize={13}
					fontStyle="italic"
					sx={{
						width: "100%",
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						textOverflow: "ellipsis",
						wordBreak: "break-word",
					}}
					color={"#6B778C"}
				>
					{ticket?.instruction}
				</Typography>

				{ticket?.Status && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							flexWrap: "wrap",
							gap: 0.9,
							mt: 0.5,
						}}
					>
						<Chip
							label={`Status: ${ticket?.Status || "-"}`}
							size="small"
							color="primary"
							sx={{
								// backgroundColor: ticket?.Status === "Approved" ? "rgb(16, 172, 132)" : ticket?.Status?.includes("Pending") ? "#FFAB00" : ticket?.Status?.includes("Review") ? "#6554C0" : "rgb(243, 104, 224)",
								color: "#fff",
								fontWeight: 500,
								fontSize: "11px",
								height: 20,
							}}
						/>

						{/* {ticket?.instruction &&
            // ticket?.instruction?.split(/[/|,]+/)?.map((person, index) => (
              <Chip
                key={'1'}
                label={ticket?.instruction}
                size="small"
                sx={{
                  backgroundColor: "#E3F2FD",
                  color: "#1E88E5",
                  fontSize: "11px",
                  fontWeight: 500,
                  height: 20,
                }}
              />
            // ))
            } */}
					</Box>
				)}
			</Box>
		</ListItem>
	);
};

export default TicketItem;
