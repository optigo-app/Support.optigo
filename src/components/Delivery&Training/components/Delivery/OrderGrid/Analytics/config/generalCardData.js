

import {
    TrendingUp as TrendingUpIcon, Assessment as AssessmentIcon, Payment as PaymentIcon,
    Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, Pending as PendingIcon
} from "@mui/icons-material";

export const getGeneralCardData = (dashboardData, utils) => {
    const { getStatusColor, getStatusText } = utils;

    const totalOrders = dashboardData?.kpis?.totalTickets?.value || 0;
    const pendingApprovals = dashboardData?.approvalAnalytics?.pendingApprovals || 0;
    const pendingPayments = dashboardData?.financialAnalytics?.paymentStatus?.find((p) => p?.label === "Unpaid")?.count || 0;
    const totalHours = dashboardData?.kpis?.totalEstimatedHours?.value || 0;
    const completionRate = parseFloat(dashboardData?.kpis?.completionRate?.value || 0);
    const avgUploadTime = parseFloat(dashboardData?.kpis?.avgCodeUploadTime?.value || 0);

    return [
        {
            title: "Total Orders",
            value: totalOrders,
            icon: <AssessmentIcon sx={{ fontSize: 20, color: "#1976d2" }} />,
            subtitle: getStatusText(totalOrders, { high: 100, medium: 50 }, {
                high: "High volume", medium: "Moderate", low: "Low volume"
            }),
            color: getStatusColor(totalOrders, { high: 100, medium: 50 }),
        },
        {
            title: "Pending Approvals",
            value: pendingApprovals,
            icon: <PendingIcon sx={{ fontSize: 20, color: "#ff9800" }} />,
            subtitle: getStatusText(pendingApprovals, { high: 10, medium: 5 }, {
                high: "High priority", medium: "Attention needed", low: "All caught up"
            }),
            color: getStatusColor(pendingApprovals, { high: 10, medium: 5 }),
        },
        {
            title: "Pending Payments",
            value: pendingPayments,
            total: totalOrders,
            icon: <PaymentIcon sx={{ fontSize: 20, color: "#f44336" }} />,
            subtitle: getStatusText(pendingPayments, { high: 10, medium: 5 }, {
                high: "Urgent follow-up", medium: "Follow up required", low: "On track"
            }),
            color: getStatusColor(pendingPayments, { high: 10, medium: 5 }),
            showTotal: true,
        },
        {
            title: "Completion Rate",
            value: `${completionRate.toFixed(1)}%`,
            icon: <CheckCircleIcon sx={{ fontSize: 20, color: "#1976d2" }} />,
            subtitle: `${Math.round((completionRate * totalOrders) / 100)} Order Delivered`,
            color: "#1976d2",
            showProgress: true,
            percentage: completionRate,
        },
        {
            title: "Total Hours",
            value: totalHours?.toFixed(1),
            icon: <ScheduleIcon sx={{ fontSize: 20, color: "#9c27b0" }} />,
            subtitle: `${Math.round(totalHours * 0.15)} hrs this week`,
            color: "#9c27b0",
        },
        {
            title: "Avg Upload Time",
            value: `${avgUploadTime.toFixed(1)}h`,
            icon: <TrendingUpIcon sx={{ fontSize: 20, color: "#607d8b" }} />,
            subtitle: avgUploadTime < 1 ? "Excellent" : avgUploadTime < 3 ? "Good" : "Needs improvement",
            color: avgUploadTime < 1 ? "#4caf50" : avgUploadTime < 3 ? "#ff9800" : "#f44336",
        },
    ];
};