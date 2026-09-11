import React, { useMemo } from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import { Info } from "lucide-react";
import { FormatTime } from "../../libs/formatTime";
import { FeedbackCardComponent } from "../TicketUi/components/Details/FeedBack";
import { DataParser } from "../../utils/ticketUtils";
import { getDisplayNamesFromKeywords } from "../../utils/keywordUtils";

const ReadOnlyField = ({ label, value }) => {
	return (
		<Box sx={{ mb: 1.5 }}>
			<Typography
				variant="caption"
				sx={{
					color: "#5e6c84",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.5px",
					fontSize: 11,
					display: "block",
					mb: 0.3,
				}}
			>
				{label}
			</Typography>
			<Paper
				elevation={0}
				sx={{
					bgcolor: "#f4f5f7",
					border: "1px solid #dfe1e6",
					borderRadius: 1,
					px: 1.2,
					py: 0.6,
					fontSize: 13.5,
					color: "#172b4d",
					fontWeight: 500,
					minHeight: 32,
					display: "flex",
					alignItems: "center",
				}}
			>
				{value || "-"}
			</Paper>
		</Box>
	);
};

const DetailSideBar = ({ ticket }) => {
	const rawKeywords = ticket?.Keywords || ticket?.keywords;
	const tags = rawKeywords ? getDisplayNamesFromKeywords(rawKeywords) : [];

	const RatingData = useMemo(() => {
		const data = DataParser(ticket?.Rating)?.data || [];
		return data.sort((a, b) => new Date(b.EntryDate) - new Date(a.EntryDate));
	}, [ticket?.Rating]);

	const sendEmailValue =
		ticket?.sendMail === true ||
		ticket?.sendMail === "1" ||
		ticket?.sendMail === 1 ||
		ticket?.sendMail === "YES" ||
		ticket?.sendEmail === 1 ||
		ticket?.sendEmail === "1" ||
		ticket?.sendEmail === true
			? "YES"
			: "NO";

	const promiseDateValue = ticket?.PromiseDate
		? FormatTime(ticket?.PromiseDate, "shortDate")
		: "-";

	return (
		<Box
			sx={{
				width: { xs: "100%", md: 280, lg: 320 },
				flexShrink: 0,
				height: { xs: "auto", md: "100%" },
				bgcolor: "#ffffff",
				overflowY: { xs: "visible", md: "auto" },
				borderLeft: { md: "1px solid #dfe1e6" },
			}}
		>
			{RatingData?.length > 0 && (
				<Box sx={{ padding: "12px 16px 0 16px" }}>
					<FeedbackCardComponent
						name={RatingData[0]?.RatingBy}
						rating={RatingData[0]?.RatingValue}
						description={RatingData[0]?.RatingDescription}
						ticketNo={RatingData[0]?.TicketNo}
						RatingDate={RatingData[0]?.EntryDate}
						key={RatingData[0]?.Id + "rating"}
					/>
				</Box>
			)}

			<Box p={2}>
				{/* Section Title */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<Info size="18px" color="#172B4D" />
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: 700,
							color: "#172B4D",
							fontSize: 15,
						}}
					>
						Ticket Info
					</Typography>
				</Box>

				{/* Read-Only Fields */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr" },
						columnGap: 2,
					}}
				>
					<ReadOnlyField label="Status" value={ticket?.Status} />
					<ReadOnlyField label="App Name" value={ticket?.appname} />
					<ReadOnlyField label="Category" value={ticket?.category} />
					<ReadOnlyField label="Priority" value={ticket?.Priority} />
					<ReadOnlyField label="Follow Up" value={ticket?.FollowUp || "Follow Up 1"} />
					<ReadOnlyField label="Send Email" value={sendEmailValue} />
					<ReadOnlyField label="Promise Date" value={promiseDateValue} />
				</Box>

				{/* Keywords */}
				<Box sx={{ mb: 2 }}>
					<Typography
						variant="caption"
						sx={{
							color: "#5e6c84",
							fontWeight: 600,
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							fontSize: 11,
							display: "block",
							mb: 0.5,
						}}
					>
						Keywords
					</Typography>
					{tags?.length > 0 ? (
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
							{tags.map((tag) => (
								<Chip
									key={tag}
									label={tag}
									size="small"
									sx={{
										bgcolor: "#ebecf0",
										color: "#172b4d",
										fontWeight: 500,
										fontSize: 12,
									}}
								/>
							))}
						</Box>
					) : (
						<Typography variant="body2" sx={{ color: "#8993a4", fontSize: 13 }}>
							No keywords
						</Typography>
					)}
				</Box>

				{/* Created / Updated Timestamps */}
				<Box sx={{ pt: 1, borderTop: "1px solid #ebecf0" }}>
					<Box sx={{ mb: 1.2 }}>
						<Typography
							variant="caption"
							sx={{
								color: "#5e6c84",
								fontWeight: 600,
								textTransform: "uppercase",
								fontSize: 11,
								display: "block",
							}}
						>
							Created
						</Typography>
						<Typography variant="body2" sx={{ color: "#172b4d", fontSize: 13 }}>
							{FormatTime(ticket?.CreatedOn, "datetime") || "-"}
						</Typography>
					</Box>

					<Box>
						<Typography
							variant="caption"
							sx={{
								color: "#5e6c84",
								fontWeight: 600,
								textTransform: "uppercase",
								fontSize: 11,
								display: "block",
							}}
						>
							Updated
						</Typography>
						<Typography variant="body2" sx={{ color: "#172b4d", fontSize: 13 }}>
							{FormatTime(ticket?.UpdatedAt, "datetime") || "-"}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default DetailSideBar;
