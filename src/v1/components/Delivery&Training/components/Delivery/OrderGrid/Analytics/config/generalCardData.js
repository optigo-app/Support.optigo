

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


    const onDemandData = dashboardData?.operationalAnalytics?.onDemandRequests || [];
    const getCount = (label) =>
        onDemandData.find((item) => item.label?.toLowerCase() === label)?.count || 0;

    const onDemandYesCount = getCount("yes");
    const onDemandNoCount = getCount("no");
    const totalRequests = onDemandYesCount + onDemandNoCount;


    return [
        {
            title: "Total Orders",
            value: totalOrders,
            icon: <AssessmentIcon sx={{ fontSize: 20, color: "#1976d2" }} />,
            subtitle: getStatusText(totalOrders, { high: 100, medium: 50 }, {
                high: "High volume", medium: "Moderate", low: "Low volume"
            }),
            color: getStatusColor(totalOrders, { high: 100, medium: 50 }),
            secondarySubtitle: "Overview summary",
        },
        {
            title: "Pending Approvals",
            value: pendingApprovals,
            icon: <PendingIcon sx={{ fontSize: 20, color: "#ff9800" }} />,
            subtitle: getStatusText(pendingApprovals, { high: 10, medium: 5 }, {
                high: "High priority", medium: "Attention needed", low: "All caught up"
            }),
            color: getStatusColor(pendingApprovals, { high: 10, medium: 5 }),
            secondarySubtitle: "Status pending",
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
            secondarySubtitle: "For tracking only",
        },
        {
            title: "Completion Rate",
            value: `${completionRate.toFixed(1)}%`,
            icon: <CheckCircleIcon sx={{ fontSize: 20, color: "#1976d2" }} />,
            subtitle: `${Math.round((completionRate * totalOrders) / 100)} Order Delivered`,
            color: "#1976d2",
            showProgress: true,
            percentage: completionRate,
            secondarySubtitle: "Auto-calculated metric",
        },
        {
            title: "Total Hours",
            value: totalHours?.toFixed(1),
            icon: <ScheduleIcon sx={{ fontSize: 20, color: "#9c27b0" }} />,
            subtitle: `${Math.round(totalHours * 0.15)} hrs this week`,
            color: "#9c27b0",
            secondarySubtitle: "Logged time only",
        },
        {
            title: "Service Engagement",
            value: totalRequests,
            icon: <TrendingUpIcon sx={{ fontSize: 20, color: "#607d8b" }} />,
            subtitle: `${onDemandYesCount} on-demand, ${onDemandNoCount} proactive`,
            color: "#1976d2",
            secondarySubtitle: "Client vs. internal delivery",
        },
    ];

};