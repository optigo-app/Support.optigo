

import {
    TrendingUp as TrendingUpIcon, Assessment as AssessmentIcon, Payment as PaymentIcon,
    Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, Pending as PendingIcon
} from "@mui/icons-material";


export const getClientCardData = (dashboardData, utils) => {
    console.log("🚀 ~ getClientCardData ~ dashboardData:", dashboardData)
    const { getStatusColor, getStatusText } = utils;

    const clientData = dashboardData?.clientAnalytics?.topClients[0] || {};
    const myTotalOrders = clientData.ticketCount || 0;
    const myCompletedOrders = clientData.completedTickets || 0;
    const myPendingOrders = clientData.pendingTickets || 0;
    const myCompletionRate = parseFloat(clientData.completionRate || 0);
    const myPaidOrders = clientData.paidTickets || 0;
    const avgProcessingTime = parseFloat(dashboardData?.kpis?.avgCodeUploadTime?.value || 0);

    return [
        {
            title: "My Total Orders",
            value: myTotalOrders,
            icon: <AssessmentIcon sx={{ fontSize: 20, color: "#1976d2" }} />,
            subtitle: getStatusText(myTotalOrders, { high: 20, medium: 10 }, {
                high: "High activity",
                medium: "Regular client",
                low: "Getting started"
            }),
            color: getStatusColor(myTotalOrders, { high: 20, medium: 10 }),
            secondarySubtitle: "Just a quick view",
        },
        {
            title: "Completed Orders",
            value: myCompletedOrders,
            icon: <CheckCircleIcon sx={{ fontSize: 20, color: "#1976d2" }} />,
            subtitle: "Successfully delivered to you",
            color: "#4caf50",
            secondarySubtitle: "Delivered with consistency",
        },
        {
            title: "Orders in Progress",
            value: myPendingOrders,
            icon: <PendingIcon sx={{ fontSize: 20, color: "#ff9800" }} />,
            subtitle: myPendingOrders === 0 ? "No pending orders" : `${myPendingOrders} orders in progress`,
            color: myPendingOrders === 0 ? "#4caf50" : "#ff9800",
            secondarySubtitle: "A quick glance",
        },
        {
            title: "My Success Rate",
            value: `${myCompletionRate.toFixed(1)}%`,
            icon: <TrendingUpIcon sx={{ fontSize: 20, color: "#607d8b" }} />,
            subtitle: `${myCompletedOrders} out of ${myTotalOrders} completed`,
            color: "#1976d2",
            showProgress: true,
            percentage: myCompletionRate,
            secondarySubtitle: "All good here",

        },
        {
            title: "Payment Status",
            value: myPaidOrders,
            total: myTotalOrders,
            icon: <PaymentIcon sx={{ fontSize: 20, color: "#f44336" }} />,
            subtitle: `${myPaidOrders} of ${myTotalOrders} paid`,
            color: "#4caf50",
            showTotal: true,
            secondarySubtitle: "Basic info only",
        },
        {
            title: "Avg Processing Time",
            value: `${avgProcessingTime.toFixed(1)}h`,
            icon: <ScheduleIcon sx={{ fontSize: 20, color: "#9c27b0" }} />,
            subtitle: avgProcessingTime < 2 ? "Lightning fast!" : avgProcessingTime < 4 ? "Quick delivery" : "Standard timing",
            color: avgProcessingTime < 2 ? "#4caf50" : avgProcessingTime < 4 ? "#ff9800" : "#9c27b0",
            secondarySubtitle: "Stats at a glance",
        }
    ];
};