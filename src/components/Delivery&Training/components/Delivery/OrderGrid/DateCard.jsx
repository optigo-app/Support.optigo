import { Box, Typography, Card, CardContent, Stack } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarTodayOutlined";
import { styled } from "@mui/material/styles";
import { formatDateFun as formatDate } from "../../../utils/helpers";

// Styled components
const DateCardContainer = styled(Card)(({ theme }) => ({
	width: 320,
	margin: "auto",
	boxShadow: theme.shadows[3],
	borderRadius: theme.shape.borderRadius * 2,
	transition: "transform 0.3s ease, box-shadow 0.3s ease",
	"&:hover": {
		boxShadow: theme.shadows[6],
		transform: "translateY(-4px)",
	},
}));

const DateItem = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: theme.spacing(1),
	padding: theme.spacing(0.5, 1),
	borderRadius: theme.shape.borderRadius,
	transition: "background-color 0.3s ease",
	"&:hover": {
		backgroundColor: theme.palette.action.hover,
	},
}));

export default function DateCard({ ticketData, isClient = false }) {
	const dateFields = [
		{ label: "Created At", value: ticketData?.Date, order: 0 },
		{ label: "Ticket Date", value: ticketData?.TicketDate, order: 1 },
		{ label: "Request Date", value: ticketData?.RequestDate, order: 2 },
		{
			label: "Confirmation Date",
			value: ticketData?.ConfirmationDate,
			order: 3,
		},
		{ label: "Delivery Date", value: ticketData?.DeliveryDate, order: 3 },
		{ label: "Last Updated", value: ticketData?.UpdatedAt, order: 4 },
	];

	const visibleDateFields = isClient ? dateFields.filter(({ label }) => label !== "Last Updated" && label !== "Created At") : dateFields;

	const filteredDates = ticketData && visibleDateFields.map(({ label, value }) => ({ label, formatted: formatDate(value) })).filter(({ formatted }) => formatted);

	return (
		<DateCardContainer>
			<CardContent>
				{/* Header */}
				<Box mb={2}>
					<Typography variant="h6" fontWeight="bold" gutterBottom>
						Order Timeline
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Key dates associated with this Order.
					</Typography>
				</Box>

				{filteredDates.length > 0 ? (
					<Stack spacing={1.5}>
						{filteredDates.map(({ label, formatted }, index) => (
							<DateItem key={index}>
								<CalendarMonthIcon fontSize="small" color="action" />
								<Box>
									<Typography variant="caption" color="text.secondary">
										{label}
									</Typography>
									<Typography variant="body2" fontWeight="medium">
										{formatted}
									</Typography>
								</Box>
							</DateItem>
						))}
					</Stack>
				) : (
					<Typography variant="body2" color="text.secondary">
						No date information available.
					</Typography>
				)}
			</CardContent>
		</DateCardContainer>
	);
}
