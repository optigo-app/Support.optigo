import { useState } from "react";
import { Box, Typography, Card, CardContent, CardHeader, Grid, Paper, Divider, Chip, CircularProgress } from "@mui/material";
import { AccessTime as ClockIcon, Phone as PhoneIcon, Star as StarIcon, Warning as AlertTriangleIcon, CheckCircle as CheckCircleIcon, Message as MessageSquareIcon, Description as FileTextIcon } from "@mui/icons-material";
import { StyledCardHeader, StyledCardContent, MetricValue, MetricLabel, SectionTitle, SectionContent, TimelineContainer, TimelineEvent, TimelineIcon, TimelineTime, TimelineTitle, TimelineDescription } from "../../styles/MuiStyles";
import { generateDynamicTimelineEvents } from "../../libs/EventGenerator";
import { formatDuration, formatTimeAn, calculateMetrics, generateSummary } from "../../libs/formatTime";

export default function ({ data }) {
	const [callData] = useState(data);
	const timelineEvents = generateDynamicTimelineEvents(callData);
	const { durationEfficiency, ratingPercentage, conversionPotential } = calculateMetrics(callData);
	const { details, analysis } = generateSummary(callData);

	const metrics = [
		{ title: "Duration Efficiency", value: durationEfficiency, avg: "65% avg" },
		{
			title: "Customer Rating",
			value: ratingPercentage,
			avg: "3.5/5 avg",
			displayValue: `${callData?.rating || 0}/5`,
		},
		{
			title: "Conversion Potential",
			value: conversionPotential,
			avg: "60% avg",
		},
	];
	return (
		<Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
			<Paper>
				<Grid container spacing={2} padding={1}>
					<Grid item xs={12} md={6}>
						<Card>
							<StyledCardHeader title="Call Duration" titleTypographyProps={{ variant: "subtitle2" }} action={<ClockIcon fontSize="small" color="action" />} />
							<StyledCardContent>
								<MetricValue>{formatDuration(callData?.callStart, callData?.callClosed)}</MetricValue>
								<MetricLabel>
									{callData?.callStart && "From " + formatTimeAn(callData?.callStart)} {callData?.callClosed && " to " + formatTimeAn(callData?.callClosed)}
								</MetricLabel>
							</StyledCardContent>
						</Card>
					</Grid>

					<Grid item xs={12} md={6}>
						<Card>
							<StyledCardHeader title="Customer Rating" titleTypographyProps={{ variant: "subtitle2" }} action={<StarIcon fontSize="small" color="action" />} />
							<StyledCardContent>
								<MetricValue>{callData?.rating}/5</MetricValue>
								<MetricLabel>Feedback: {callData?.feedback}</MetricLabel>
							</StyledCardContent>
						</Card>
					</Grid>

					<Grid item xs={12} md={6}>
						<Card>
							<StyledCardHeader title="Priority" titleTypographyProps={{ variant: "subtitle2" }} action={<AlertTriangleIcon fontSize="small" color="action" />} />
							<StyledCardContent>
								<MetricValue>{callData?.priority}</MetricValue>
								<MetricLabel>Status: {callData?.status}</MetricLabel>
							</StyledCardContent>
						</Card>
					</Grid>

					<Grid item xs={12} md={6}>
						<Card>
							<StyledCardHeader title="Ticket" titleTypographyProps={{ variant: "subtitle2" }} action={<FileTextIcon fontSize="small" color="action" />} />
							<StyledCardContent>
								<MetricValue>{callData?.ticket || "-"}</MetricValue>
								<MetricLabel>Parent ID: {callData?.parentId}</MetricLabel>
							</StyledCardContent>
						</Card>
					</Grid>

					{/* Call Details & Call Summary - Two Columns Per Row */}
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Call Details" subheader={`Call received on ${callData?.date} at ${callData?.time}`} />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12} md={4}>
										<SectionTitle>Company</SectionTitle>
										<SectionContent>{callData?.company}</SectionContent>
									</Grid>
									<Grid item xs={12} md={4}>
										<SectionTitle>Called By</SectionTitle>
										<SectionContent>{callData?.callBy}</SectionContent>
									</Grid>
									<Grid item xs={12} md={4}>
										<SectionTitle>Received By</SectionTitle>
										<SectionContent>{callData?.receivedBy}</SectionContent>
									</Grid>
									<Grid item xs={12} md={4}>
										<SectionTitle>AppName</SectionTitle>
										<SectionContent>{callData?.appname}</SectionContent>
									</Grid>
									<Grid item xs={12} md={4}>
										<SectionTitle>Topic Raised By</SectionTitle>
										<SectionContent>{callData?.topicRaisedBy}</SectionContent>
									</Grid>
									{callData?.forward && (
										<Grid item xs={12} md={4}>
											<SectionTitle>Forwarded</SectionTitle>
											<SectionContent>{callData?.forward}</SectionContent>
										</Grid>
									)}
								</Grid>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12}>
						<Card>
							<CardHeader title="Call Summary" subheader="Key points and action items" />
							<CardContent>
								<Box mb={2}>
									<Typography variant="h6" fontWeight="medium">
										Details
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{details}
									</Typography>
								</Box>
								<Box>
									<Typography variant="h6" fontWeight="medium">
										Analysis
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{analysis}
									</Typography>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				{/* Analytics Tab */}
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Grid container spacing={4}>
								<Grid item xs={12}>
									<Box>
										<Typography variant="body2" fontWeight="medium">
											Key Topics Discussed
										</Typography>
										<Box display="flex" flexWrap="wrap" gap={1} mt={1}>
											{["Product Pricing", "Availability", "XYZ Product Series", "Product Demo", "Premium Features"].map((topic, i) => (
												<Chip key={i} label={topic} size="small" color="primary" variant="outlined" />
											))}
										</Box>
									</Box>
								</Grid>
								{/* Call Metrics Comparison */}
								<Grid item xs={12}>
									<Divider sx={{ my: 1 }} />
									<Typography variant="h6" fontWeight="medium" mb={2}>
										Call Metrics Comparison
									</Typography>
									<Grid container spacing={4} justifyContent="center">
										{metrics?.map((metric, i) => (
											<Grid item xs={12} sm={6} md={4} key={i} display="flex" flexDirection="column" alignItems="center" textAlign="center">
												<Box position="relative" display="flex" alignItems="center" justifyContent="center" mb={2} sx={{ width: 120, height: 120 }}>
													<CircularProgress variant="determinate" value={metric?.value} size={85} thickness={5} color="primary" />
													<Box
														sx={{
															position: "absolute",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															width: "100%",
															height: "100%",
														}}
													>
														<Typography variant="h6" fontWeight="bold" color="text.primary">
															{metric?.displayValue || `${Math.round(metric?.value)}%`}
														</Typography>
													</Box>
												</Box>
												<Typography variant="body1" fontWeight="medium">
													{metric?.title}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{metric?.avg}
												</Typography>
											</Grid>
										))}
									</Grid>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>
				{/* timline */}
				<Card>
					<Divider sx={{ mt: 1 }} />
					<CardHeader title="Call Timeline" subheader={`Chronological events during the call with ${callData?.company}`} subheaderTypographyProps={{ color: "grey.500", fontSize: "0.9rem" }} titleTypographyProps={{ fontSize: "1.4rem" }} />
					<CardContent>
						<TimelineContainer>
							{timelineEvents.map((event, index) => (
								<TimelineEvent key={index}>
									<TimelineIcon status={event.status}>{event.icon}</TimelineIcon>
									<TimelineTime>{event.time}</TimelineTime>
									<TimelineTitle>{event.title}</TimelineTitle>
									<TimelineDescription>{event.description}</TimelineDescription>
								</TimelineEvent>
							))}
						</TimelineContainer>
					</CardContent>
				</Card>
			</Paper>
		</Box>
	);
}

const CallSummary = ({ callData }) => {
	const { details, analysis } = generateSummary(callData);

	return (
		<Grid item xs={12}>
			<Card>
				<CardHeader title="Call Summary" subheader="Key points and action items" />
				<CardContent>
					<Box mb={2}>
						<Typography variant="h6" fontWeight="medium">
							Details
						</Typography>
						<Typography variant="body1" color="text.secondary">
							{details}
						</Typography>
					</Box>
					<Box>
						<Typography variant="h6" fontWeight="medium">
							Analysis
						</Typography>
						<Typography variant="body1" color="text.secondary">
							{analysis}
						</Typography>
					</Box>
				</CardContent>
			</Card>
		</Grid>
	);
};
