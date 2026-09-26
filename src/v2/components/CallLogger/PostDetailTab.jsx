import { Box, Typography, Chip, Paper, Stack } from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";

const getSoftSatisfactionStyle = (satisfaction) => {
	if (!satisfaction) return { bgcolor: "#F3F4F6", color: "#374151", border: "1px solid #D1D5DB" };
	const normalized = satisfaction.toLowerCase();
	if (normalized.includes("satisfied") || normalized.includes("happy") || normalized.includes("good")) {
		return { bgcolor: "#D1FAE5", color: "#047857", border: "1px solid #6EE7B7" };
	}
	if (normalized.includes("neutral") || normalized.includes("average")) {
		return { bgcolor: "#FEF3C7", color: "#D97706", border: "1px solid #FCD34D" };
	}
	return { bgcolor: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5" };
};

const DetailRow = ({ label, icon, children }) => {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				py: 1.5,
				px: 0.5,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: 150, flexShrink: 0, pt: 0.2 }}>
				{icon && <Box sx={{ color: "#80868B", display: "flex", alignItems: "center" }}>{icon}</Box>}
				<Typography sx={{ fontSize: 13, color: "#5F6368", fontWeight: 500 }}>
					{label}
				</Typography>
			</Box>
			<Box sx={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: 0.8 }}>
				{children}
			</Box>
		</Box>
	);
};

const PostDetailTab = ({ data }) => {
	const hasAnalysis = data?.callAnalysis && Object.keys(data?.callAnalysis).length > 0;
	const analysis = data?.callAnalysis;

	if (!hasAnalysis) {
		return (
			<Box
				sx={{
					p: 3,
					borderRadius: "8px",
					backgroundColor: "#FEF2F2",
					border: "1px solid #FEE2E2",
					textAlign: "center",
					mt: 2,
				}}
			>
				<Typography variant="subtitle1" color="#991B1B" fontWeight="700" gutterBottom>
					No Analysis Data Available
				</Typography>
				<Typography sx={{ fontSize: 13, color: "#7F1D1D" }}>
					This call has not been analyzed yet. Once the analysis is completed, it will appear here.
				</Typography>
			</Box>
		);
	}

	return (
		<Paper elevation={0} sx={{ bgcolor: "transparent" }}>
			<Stack spacing={0.5}>
				<DetailRow label="Satisfaction" icon={<SentimentSatisfiedAltIcon sx={{ fontSize: 16 }} />}>
					<Chip
						label={analysis?.satisfaction || "Unknown"}
						size="small"
						sx={{
							fontSize: "12px",
							fontWeight: 600,
							borderRadius: "6px",
							height: "24px",
							px: 0.5,
							...getSoftSatisfactionStyle(analysis?.satisfaction),
						}}
					/>
				</DetailRow>

				<DetailRow label="Departments" icon={<BusinessIcon sx={{ fontSize: 16 }} />}>
					{analysis?.departments && analysis.departments.length > 0 ? (
						analysis.departments.map((dept, idx) => (
							<Chip
								key={idx}
								label={dept}
								size="small"
								sx={{
									fontSize: "12px",
									fontWeight: 600,
									borderRadius: "6px",
									height: "24px",
									px: 0.5,
									bgcolor: "#EFF6FF",
									color: "#1D4ED8",
									border: "1px solid #93C5FD",
								}}
							/>
						))
					) : (
						<Typography sx={{ fontSize: 13, color: "#80868B" }}>-</Typography>
					)}
				</DetailRow>

				<DetailRow label="Issues" icon={<ReportProblemIcon sx={{ fontSize: 16 }} />}>
					{analysis?.issues && analysis.issues.length > 0 ? (
						analysis.issues.map((issue, idx) => (
							<Chip
								key={idx}
								label={issue}
								size="small"
								sx={{
									fontSize: "12px",
									fontWeight: 600,
									borderRadius: "6px",
									height: "24px",
									px: 0.5,
									bgcolor: "#FEE2E2",
									color: "#B91C1C",
									border: "1px solid #FCA5A5",
								}}
							/>
						))
					) : (
						<Typography sx={{ fontSize: 13, color: "#80868B" }}>-</Typography>
					)}
				</DetailRow>

				{analysis?.additionalComments && (
					<Box sx={{ mt: 3, px: 0.5 }}>
						<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124", mb: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
							Additional Comments
						</Typography>
						<Typography sx={{ fontSize: 13, color: "#3C4043", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
							{analysis?.additionalComments}
						</Typography>
					</Box>
				)}
			</Stack>
		</Paper>
	);
};

export default PostDetailTab;
