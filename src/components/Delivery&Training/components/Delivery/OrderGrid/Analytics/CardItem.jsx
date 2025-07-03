import React from "react";
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Chip } from "@mui/material";

const CardItem = ({ card }) => {
    const IconComponent = card.icon;

    return (
        <Grid item xs={12} sm={6} md={3} lg={2.4} xl={2}>
            <Card sx={{
                height: "100%",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
            }}>
                <CardContent sx={{ px: 2, py: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {card.title}
                        </Typography>
                        {card.icon && IconComponent}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: card.color, fontSize: { xs: "1.5rem", sm: "1.8rem" } }}>
                            {card.value}
                        </Typography>
                        {card.showTotal && (
                            <Typography variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                                / {card.total}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                            {card.secondarySubtitle}
                        </Typography>
                        {card.showProgress && (
                            <Box sx={{ position: "relative", display: "inline-flex" }}>
                                <CircularProgress variant="determinate" value={card.percentage} size={40} thickness={4} sx={{ color: card.color }} />
                                <CircularProgress
                                    variant="determinate"
                                    value={100}
                                    size={40}
                                    thickness={4}
                                    sx={{ color: "#e0e0e0", position: "absolute", top: 0, left: 0, zIndex: -1 }}
                                />
                                <Box sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: "absolute",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.6rem" }}>
                                        {Math.round(card.percentage)}%
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ mt: 1 }}>
                        <Chip
                            label={card.subtitle}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                bgcolor: `${card.color}15`,
                                color: card.color,
                                border: `1px solid ${card.color}30`,
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default CardItem;