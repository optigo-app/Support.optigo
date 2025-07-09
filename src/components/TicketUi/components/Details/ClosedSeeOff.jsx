import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import React, { useState } from "react";
import { useTicket } from "../../../../context/useTicket";

const ClosedSeeOff = ({ IsClosed, TicketNo }) => {
	const [isReopened, setIsReopened] = useState(false);
	const { CloseTicket } = useTicket();

	const handleReopenTicket = () => {
		setIsReopened(true);
		CloseTicket(TicketNo, 1);
	};

	if (!IsClosed && !isReopened) return null;

	return (
		<Card
			elevation={0}
			sx={{
				backgroundColor: isReopened ? "#e8f5e9" : "#ffdfdc",
				border: isReopened ? "1px solid #c8e6c9" : "1px solid #ffdfdc",
				borderRadius: 0,
				position: "sticky",
				top: 0,
				paddingTop: 0,
				zIndex: 100,
			}}
		>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					{isReopened ? <CheckCircleOutlineIcon sx={{ color: "green", fontSize: 36 }} /> : <CheckCircleOutlineIcon sx={{ color: "red", fontSize: 36 }} />}

					<Box>
						<Typography variant="h6" sx={{ fontWeight: 600, color: "#1E293B", mb: 0.5 }}>
							{isReopened ? "This ticket is reopened" : "This ticket is closed"}
						</Typography>

						{isReopened ? (
							<Typography variant="body2" sx={{ color: "#1E293B" }}>
								This ticket has been successfully reopened. You may now continue working on it.
							</Typography>
						) : (
							<Typography variant="body2" sx={{ color: "#64748b" }}>
								You can reopen this ticket within 10 days of closure. After that, it will be archived and no longer editable.
							</Typography>
						)}
					</Box>
					{!isReopened && (
						<Chip
							icon={<ReplayIcon />}
							label="Reopen Ticket"
							variant="filled"
							color="warning"
							sx={{
								cursor: "pointer",
								mt: 1,
							}}
							onClick={handleReopenTicket}
						/>
					)}
				</Box>
			</CardContent>
		</Card>
	);
};

export default ClosedSeeOff;
