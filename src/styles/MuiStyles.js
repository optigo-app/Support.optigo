import { Box, Typography, CardContent, CardHeader, Avatar } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
	paddingBottom: theme.spacing(1),
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	paddingTop: theme.spacing(1),
}));

const MetricValue = styled(Typography)(({ theme }) => ({
	fontSize: "1.5rem",
	fontWeight: "bold",
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
	fontSize: "0.75rem",
	color: theme.palette.text.secondary,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
	fontSize: "0.875rem",
	fontWeight: "medium",
	marginBottom: theme.spacing(1),
}));

const SectionContent = styled(Typography)(({ theme }) => ({
	fontSize: "0.875rem",
	color: theme.palette.text.secondary,
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
	position: "relative",
	"&::before": {
		content: '""',
		position: "absolute",
		left: 24,
		top: 0,
		bottom: 0,
		width: 2,
		backgroundColor: theme.palette.divider,
	},
}));

const TimelineEvent = styled(Box)(({ theme }) => ({
	position: "relative",
	paddingLeft: theme.spacing(8),
	marginBottom: theme.spacing(2.3),
}));

const TimelineIcon = styled(Avatar)(({ theme, status }) => ({
	position: "absolute",
	left: 0,
	width: theme.spacing(6),
	height: theme.spacing(6),
	backgroundColor:
		{
			initiated: "#0056D2", // Premium Deep Blue
			received: "#FF6F00", // Rich Amber Orange
			"in-progress": "#F4B400", // Gold Yellow
			analysis: "#6A1B9A", // Elegant Purple
			"follow-up": "#0097A7", // Premium Cyan
			"final-talk": "#2E7D32", // Luxe Green
			completed: "#1E8449", // Professional Deep Green
			pending: "#D81B60", // Premium Red-Pink
			summary: "#FFC107", // Bright Warm Yellow
		}[status] || "#B71C1C", // Deep Red as fallback for unknown status
}));

const TimelineTime = styled(Typography)(({ theme }) => ({
	fontSize: "0.75rem",
	color: theme.palette.text.secondary,
	marginBottom: theme.spacing(0.5),
}));

const TimelineTitle = styled(Typography)(({ theme }) => ({
	fontWeight: "medium",
	fontSize: "1rem",
}));

const TimelineDescription = styled(Typography)(({ theme }) => ({
	color: theme.palette.text.secondary,
	fontSize: "14px",
}));

const TicketTheme = createTheme({
	palette: {
		primary: {
			main: "#0052CC",
		},
		secondary: {
			main: "#FF5630",
		},
		background: {
			default: "#fff",
		},
		gradient: {
			main: "linear-gradient(135deg, #b2069b 0%, #3909c2 100%)",
		},
	},
	typography: {
		fontFamily: '"Poppins", sans-serif',
		h4: {
			fontWeight: 600,
		},
	},
	custom: {
		gradients: {
			lightPurpleBlue: "linear-gradient(135deg, rgba(178,6,155,0.1), rgba(57,9,194,0.1))",
			lightPurpleBlueHover: "linear-gradient(135deg, rgba(178,6,155,0.15), rgba(57,9,194,0.15))",
			lightPurpleBlueSubtle: "linear-gradient(135deg, rgba(178,6,155,0.05), rgba(57,9,194,0.05))",
			lightPurpleHover: "linear-gradient(200deg, #ce79c3 2%, #532ebe 56%)",
		},
		optigo: {
			color: "#8007AB",
		},
	},
});

export { StyledCardHeader, StyledCardContent, MetricValue, MetricLabel, SectionTitle, SectionContent, TimelineContainer, TimelineEvent, TimelineIcon, TimelineTime, TimelineTitle, TimelineDescription, TicketTheme };
