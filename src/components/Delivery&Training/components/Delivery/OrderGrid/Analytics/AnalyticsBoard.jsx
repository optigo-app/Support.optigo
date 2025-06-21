import React from "react";
import { Grid, Box, Card, Typography } from "@mui/material";
import CardItem from "./CardItem";
import { getClientCardData } from "./config/clientCardData";
import { getGeneralCardData } from "./config/generalCardData";
import { getStatusColor, getStatusText } from "../../../../utils/deliveryUtils";

const utils = { getStatusColor, getStatusText };

const AnalyticsDashboardCards = ({ dashboardData, isClient }) => {
  const cardData = isClient
    ? getClientCardData(dashboardData, utils)
    : getGeneralCardData(dashboardData, utils);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {cardData.map((card, index) => (
          <CardItem key={index} card={card} />
        ))}
      </Grid>

      {!isClient && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                  Team Performance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dashboardData.teamAnalytics?.departmentWorkload?.length || 0} departments active
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                  Payment Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {((dashboardData.financialAnalytics?.totalPaidTickets / (dashboardData?.kpis?.totalTickets?.value || 1)) * 100).toFixed(1)}% payment success rate
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                  Efficiency Score
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(dashboardData?.kpis?.avgCodeUploadTime?.value || 0) < 2
                    ? "Excellent"
                    : (dashboardData?.kpis?.avgCodeUploadTime?.value || 0) < 4
                      ? "Good"
                      : "Needs Focus"} avg processing time
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