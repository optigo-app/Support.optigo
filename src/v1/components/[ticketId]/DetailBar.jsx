import React from "react";
import { Box, Typography, Grid, Divider, Tooltip, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormatTime } from "../../libs/formatTime";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";

const EllipsisCell = ({ value }) => (
	<Tooltip title={value || ""} placement="top">
		<Typography
			component="span"
			variant="body2"
			sx={{
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis",
				display: "inline-block",
				maxWidth: 180,
				verticalAlign: "bottom",
				color: "#091E42",
				fontWeight: 500,
			}}
		>
			{value}
		</Typography>
	</Tooltip>
);

const DetailSection = styled(Box)(({ theme }) => ({
	padding: theme.spacing(2),
	borderBottom: "1px solid #DFE1E6",
}));

const DetailBar = ({ ticket }) => {
	return (
		<DetailSection>
			{/* Subject / MainSubject */}
			<Box sx={{ mb: 1 }}>
				<Typography
					sx={{
						fontWeight: 700,
						fontSize: 22,
						color: "#172B4D",
						whiteSpace: "pre-line",
						wordBreak: "break-word",
						lineHeight: 1.4,
					}}
				>
					{ticket?.MainSubject || ticket?.subject || "No Main Subject"}
				</Typography>
				{ticket?.MainSubject && ticket?.subject && (
					<Typography
						sx={{
							fontWeight: 500,
							fontSize: 16,
							color: "#6B778C",
							mt: 0.5,
							whiteSpace: "pre-line",
							wordBreak: "break-word",
							lineHeight: 1.3,
						}}
					>
						{ticket?.subject}
					</Typography>
				)}
			</Box>

			{/* Project Code with Icon */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					mb: 1,
				}}
			>
				<ApartmentRoundedIcon fontSize="small" sx={{ color: "#A5ADBA" }} />
				<Typography
					variant="body1"
					sx={{
						fontWeight: 500,
						color: "#253858",
						lineHeight: "normal",
						display: "flex",
						alignItems: "center",
						gap: 0.6,
					}}
				>
					{ticket?.companyname || "No Project Code"}
					{!!ticket?.IsClient && (
						<Chip
							label="Client Ticket"
							size="small"
							color="primary"
							sx={{
								width: "fit-content",
								fontSize: 12,
								fontWeight: 500,
								backgroundColor: "#E6F0FF",
								color: "#0B69FF",
							}}
						/>
					)}
				</Typography>
			</Box>

			{/* Divider */}
			<Divider sx={{ my: 1.5 }} />

			{/* Ticket Info Block */}
			<Grid container spacing={2} alignItems="center">
				{/* Ticket Number */}
				<Grid item xs={12} sm="auto">
					<Typography sx={{ fontWeight: 600, color: "#091E42" }}>
						Ticket No: <span style={{ fontWeight: 700 }}>{ticket?.TicketNo}</span>
					</Typography>
				</Grid>

				{/* Created By */}
				<Grid item xs={12} sm>
					<Typography
						variant="body2"
						sx={{
							color: "#5E6C84",
							display: "flex",
							flexWrap: "wrap",
							alignItems: "center",
							gap: 0.6,
							wordBreak: "break-word",
						}}
					>
						Created on <strong>{FormatTime(ticket?.CreatedOn, "shortDate")}</strong>
						{ticket?.CreatedBy && (
							<>
								&nbsp;by <EllipsisCell value={ticket?.CreatedBy} />
								on Behalf of <EllipsisCell value={ticket?.username} /> for <EllipsisCell value={ticket?.companyname} />.
							</>
						)}
					</Typography>
				</Grid>

				{/* Last Updated */}
				<Grid item xs={12} sm="auto">
					{ticket?.UpdatedAt && (
						<Typography
							variant="caption"
							sx={{
								color: "#7A869A",
								display: "flex",
								flexWrap: "wrap",
								alignItems: "center",
								gap: 0.6,
							}}
						>
							Last updated {FormatTime(ticket?.UpdatedAt, "relative")}
							<EllipsisCell value={ticket?.LastUpdatedBy && `By ` + ticket?.LastUpdatedBy} />
						</Typography>
					)}
				</Grid>
			</Grid>

			{/* Special Instruction if available */}
			{ticket?.instruction && (
				<>
					<Divider sx={{ my: 1.5 }} />
					<Box sx={{ width: "100%" }}>
						<Typography
							variant="body2"
							sx={{
								color: "#5E6C84",
								whiteSpace: "pre-line",
								wordBreak: "break-word",
							}}
						>
							<strong>Special Instruction:</strong>&nbsp;{ticket?.instruction}
						</Typography>
					</Box>
				</>
			)}
		</DetailSection>
	);
};

export default DetailBar;
