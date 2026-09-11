import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import TicketApi from "../../apis/TicketApiController";
import { DataParser } from "../../utils/ticketUtils";
import { TicketTheme } from "../../styles/MuiStyles";
import { HeaderHeight } from "../_ui/HeaderWrapper";
import DetailBar from "./DetailBar";
import DetailSideBar from "./DetailSideBar";
import CommentList from "./CommentList";
import MetaWrapper from "../../meta/MetaWrapper";

const SingleTicketView = () => {
	const { ticketId } = useParams();
	const [ticket, setTicket] = useState(null);
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const contentHeight = "100vh";

	useEffect(() => {
		const fetchTicket = async () => {
			if (!ticketId) {
				setError("Ticket ID not provided.");
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);
				const response = await TicketApi.getSingleTickets({
					ticketId: ticketId,
				});

				if (response?.rd && response.rd.length > 0) {
					const ticketData = response.rd[0];
					setTicket(ticketData);
					const parsedComments = DataParser(ticketData?.comments || "").data || [];
					setComments(parsedComments);
				} else {
					setError(response?.msg || "Ticket not found");
				}
			} catch (err) {
				console.error("Error fetching single ticket:", err);
				setError(err?.message || "Failed to load ticket details");
			} finally {
				setLoading(false);
			}
		};

		fetchTicket();
	}, [ticketId]);

	return (
		<ThemeProvider theme={TicketTheme}>
			<MetaWrapper page="SingleTicket" />
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: contentHeight,
					bgcolor: "#f8f9fa",
					overflow: "hidden",
				}}
			>
				{loading ? (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
							gap: 2,
						}}
					>
						<CircularProgress size={40} />
						<Typography variant="body2" sx={{ color: "#5e6c84", fontWeight: 500 }}>
							Loading ticket details...
						</Typography>
					</Box>
				) : error || !ticket ? (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
							p: 3,
						}}
					>
						<Paper
							elevation={0}
							sx={{
								p: 4,
								textAlign: "center",
								maxWidth: 450,
								border: "1px solid #dfe1e6",
								borderRadius: 2,
								bgcolor: "#fff",
							}}
						>
							<Typography variant="h6" sx={{ color: "#d32f2f", fontWeight: 600, mb: 1 }}>
								Unable to Load Ticket
							</Typography>
							<Typography variant="body2" sx={{ color: "#5e6c84" }}>
								{error || `Ticket ${ticketId} could not be found.`}
							</Typography>
						</Paper>
					</Box>
				) : (
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							flexGrow: 1,
							overflow: { xs: "auto", md: "hidden" },
							bgcolor: "#fff",
							width: "100%",
							height: "100%",
						}}
					>
						{/* Left / Main Column: DetailBar + CommentList */}
						<Box
							sx={{
								flex: 1,
								minWidth: 0,
								display: "flex",
								flexDirection: "column",
								overflow: { xs: "visible", md: "auto" },
								borderRight: { md: "1px solid #DFE1E6" },
								borderBottom: { xs: "1px solid #DFE1E6", md: "none" },
								height: { md: "100%" },
							}}
						>
							<Box sx={{ flex: 1, overflow: { xs: "visible", md: "auto" } }}>
								<DetailBar ticket={ticket} />
								<CommentList data={comments} key={ticket?.TicketId || ticket?.TicketNo} />
							</Box>
						</Box>

						{/* Right Column: Read-Only DetailSideBar */}
						<DetailSideBar
							key={ticket?.TicketNo || ticket?.TicketId}
							ticket={ticket}
						/>
					</Box>
				)}
			</Box>
		</ThemeProvider>
	);
};

export default SingleTicketView;
