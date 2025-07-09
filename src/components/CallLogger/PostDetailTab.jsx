import { Box, Typography, Grid, Chip, Paper } from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CommentIcon from "@mui/icons-material/Comment";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";

const InfoItem = ({ label, value, icon }) => (
	<Grid item xs={12} sm={6}>
		<Box display="flex" alignItems="center" mb={1}>
			{icon && (
				<Box mr={1} color="primary.main">
					{icon}
				</Box>
			)}
			<Typography textTransform={"capitalize"} variant="body2" color="text.secondary" fontWeight="bold">
				{label}
			</Typography>
		</Box>
		<Typography textTransform={"capitalize"} variant="body1" fontWeight={500}>
			{value || "-"}
		</Typography>
	</Grid>
);

const PostDetailTab = ({ data }) => {
	const hasAnalysis = data?.callAnalysis && Object.keys(data?.callAnalysis).length > 0;
	const analysis = data?.callAnalysis;

	if (!hasAnalysis) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: 3,
					borderRadius: 2,
					backgroundColor: "#fff3f3",
					border: "1px solid #ffcccc",
					textAlign: "center",
				}}
			>
				<Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
					No Analysis Data Available
				</Typography>
				<Typography variant="body2" color="text.secondary">
					This call has not been analyzed yet. Once the analysis is completed, it will appear here.
				</Typography>
			</Paper>
		);
	}

	return (
		<Paper elevation={0}>
			<Grid container spacing={3}>
				<InfoItem label="Satisfaction" value={analysis?.satisfaction} icon={<SentimentSatisfiedAltIcon fontSize="small" />} />

				<Grid item xs={12}>
					<Box display="flex" alignItems="center" mb={1}>
						<BusinessIcon color="primary" fontSize="small" />
						<Typography variant="subtitle2" ml={1} color="text.secondary" fontWeight="bold">
							Departments Involved
						</Typography>
					</Box>
					<Box display="flex" flexWrap="wrap">
						{analysis?.departments?.map((dept, idx) => (
							<Chip key={idx} label={dept} color="primary" sx={{ mr: 1, mb: 1 }} />
						))}
					</Box>
				</Grid>

				<Grid item xs={12}>
					<Box display="flex" alignItems="center" mb={1}>
						<ReportProblemIcon color="error" fontSize="small" />
						<Typography variant="subtitle2" ml={1} color="text.secondary" fontWeight="bold">
							Issues Reported
						</Typography>
					</Box>
					<Box display="flex" flexWrap="wrap">
						{analysis?.issues?.map((issue, idx) => (
							<Chip key={idx} label={issue} variant="outlined" color="error" sx={{ mr: 1, mb: 1 }} />
						))}
					</Box>
				</Grid>

				<Grid item xs={12}>
					<Box display="flex" alignItems="center" mb={1}>
						<CommentIcon color="action" fontSize="small" />
						<Typography variant="subtitle2" ml={1} color="text.secondary" fontWeight="bold">
							Additional Comments
						</Typography>
					</Box>
					<Typography
						variant="body1"
						sx={{
							backgroundColor: "#fff",
							p: 2,
							borderRadius: 1,
							border: "1px solid #e0e0e0",
						}}
					>
						{analysis?.additionalComments || "-"}
					</Typography>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default PostDetailTab;
