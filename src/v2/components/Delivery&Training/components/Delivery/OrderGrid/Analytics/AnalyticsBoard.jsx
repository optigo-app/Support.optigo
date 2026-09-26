import React from "react";
import { Grid, Box, Card, Typography } from "@mui/material";
import CardItem from "./CardItem";
import { getClientCardData } from "./config/clientCardData";
import { getGeneralCardData } from "./config/generalCardData";
import { getStatusColor, getStatusText } from "../../../../utils/deliveryUtils";

import DeliveryTabs from "../DeliveryTabs";

const utils = { getStatusColor, getStatusText };

const AnalyticsDashboardCards = ({ dashboardData, isClient }) => {
	const cardData = isClient ? getClientCardData(dashboardData, utils) : getGeneralCardData(dashboardData, utils);

	return (
		<Box sx={{ flexGrow: 1 }}>
			<Grid container spacing={2}>
				{cardData.map((card, index) => (
					<CardItem key={index} card={card} />
				))}
			</Grid>

			{!isClient && (
				<Box sx={{ mt: 1.5 }}>
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} sm={6} md={4}>
							<Card sx={{ p: 1.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2 }}>
								<Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "primary.main" }}>
									Team Performance
								</Typography>
								<Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 500 }}>
									{dashboardData.teamAnalytics?.departmentWorkload?.length || 0} departments active
								</Typography>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={4}>
							<Card sx={{ p: 1.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2 }}>
								<Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "primary.main" }}>
									Payment Status
								</Typography>
								<Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 500 }}>
									{((dashboardData.financialAnalytics?.totalPaidTickets / (dashboardData?.kpis?.totalTickets?.value || 1)) * 100).toFixed(1)}% payment success rate
								</Typography>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={4}>
							<Card sx={{ p: 1.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2 }}>
								<Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "primary.main" }}>
									Efficiency Score
								</Typography>
								<Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 500 }}>
									{(dashboardData?.kpis?.avgCodeUploadTime?.value || 0) < 2 ? "Excellent" : (dashboardData?.kpis?.avgCodeUploadTime?.value || 0) < 4 ? "Good" : "Needs Focus"} avg processing time
								</Typography>
							</Card>
						</Grid>
					</Grid>
				</Box>
			)}
		</Box>
	);
};

export default AnalyticsDashboardCards;
