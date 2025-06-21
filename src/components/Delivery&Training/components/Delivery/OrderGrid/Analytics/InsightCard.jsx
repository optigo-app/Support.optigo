import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

const InsightCard = ({ card }) => {
  return (
    <Grid item xs={12} md={4}>
      <Card sx={{ p: 2, bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
          {card.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {card.value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {card.subtitle}
        </Typography>
      </Card>
    </Grid>
  );
};

export default InsightCard;