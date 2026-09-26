import React from "react";
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Chip } from "@mui/material";

const CardItem = ({ card }) => {
	const IconComponent = card.icon;

	return (
		<Grid item xs={12} sm={6} md={3} lg={2.4} xl={2}>
			<Card
				sx={{
					height: "100%",
					border: "1px solid #e2e8f0",
					boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
					borderRadius: 2.5,
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					transition: "all 0.2s ease-in-out",
					"&:hover": {
						boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
					},
				}}
			>
				<CardContent sx={{ px: 1.75, py: 1.25, "&:last-child": { pb: 1.25 }, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
					{/* Top Header Row: Title & Icon */}
					<Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 0.25,
							}}
						>
							<Typography
								noWrap
								sx={{
									fontSize: "0.78rem",
									fontWeight: 600,
									color: "#64748b",
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{card.title}
							</Typography>
							{card.icon && (
								<Box sx={{ color: card.color, opacity: 0.9, display: "flex", alignItems: "center", flexShrink: 0, ml: 0.5 }}>
									{IconComponent}
								</Box>
							)}
						</Box>

						{/* Main Value Row */}
						<Box sx={{ display: "flex", alignItems: "baseline", mb: 0.5 }}>
							<Typography
								sx={{
									fontWeight: 800,
									color: card.color || "#0f172a",
									fontSize: "1.45rem",
									lineHeight: 1.1,
								}}
							>
								{card.value}
							</Typography>
							{card.showTotal && (
								<Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#94a3b8", ml: 0.4 }}>
									/ {card.total}
								</Typography>
							)}
						</Box>
					</Box>

					{/* Bottom Section: Single Line Subtitle & Chip/Progress Under It */}
					<Box sx={{ mt: "auto" }}>
						{/* Subtitle on 1 single line */}
						<Typography
							noWrap
							title={card.secondarySubtitle}
							sx={{
								fontSize: "0.7rem",
								color: "#64748b",
								fontWeight: 500,
								lineHeight: 1.2,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								display: "block",
								mb: card.subtitle || card.showProgress ? 0.4 : 0,
							}}
						>
							{card.secondarySubtitle || "\u00A0"}
						</Typography>

						{/* Chip / Progress placed under the subtitle in a fixed row */}
						<Box sx={{ display: "flex", alignItems: "center", minHeight: 22 }}>
							{card.showProgress ? (
								<Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
									<CircularProgress variant="determinate" value={card.percentage} size={24} thickness={4.5} sx={{ color: card.color }} />
									<CircularProgress
										variant="determinate"
										value={100}
										size={24}
										thickness={4.5}
										sx={{
											color: "#e2e8f0",
											position: "absolute",
											top: 0,
											left: 0,
											zIndex: -1,
										}}
									/>
									<Box
										sx={{
											top: 0,
											left: 0,
											bottom: 0,
											right: 0,
											position: "absolute",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Typography component="div" sx={{ fontWeight: 700, fontSize: "0.52rem", color: "#334155" }}>
											{Math.round(card.percentage)}%
										</Typography>
									</Box>
								</Box>
							) : card.subtitle ? (
								<Chip
									label={card.subtitle}
									size="small"
									sx={{
										height: 20,
										fontSize: "0.65rem",
										fontWeight: 600,
										bgcolor: `${card.color}15`,
										color: card.color,
										border: `1px solid ${card.color}30`,
										maxWidth: "100%",
										"& .MuiChip-label": {
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
											px: 0.8,
										},
									}}
								/>
							) : null}
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Grid>
	);
};

export default CardItem;
