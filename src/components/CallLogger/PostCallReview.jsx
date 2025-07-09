import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button, Typography, Box, Tabs, Tab, Checkbox, FormControlLabel, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Paper } from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { useCallLog } from "../../context/UseCallLog";
import { departments, satisfactionOptions } from "../../libs/data";

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
			{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
		</div>
	);
}

function PostCallReviewForm({ open, onClose, data }) {
	const [selectedDepartments, setSelectedDepartments] = useState([]);
	const [selectedIssues, setSelectedIssues] = useState([]);
	const [additionalComments, setAdditionalComments] = useState("");
	const [satisfaction, setSatisfaction] = useState("");
	const [activeTab, setActiveTab] = useState(0);
	const { editCall } = useCallLog();
	const handleDepartmentChange = (department) => {
		setSelectedDepartments((prev) => {
			if (prev.includes(department)) {
				const newDepts = prev.filter((d) => d !== department);
				setSelectedIssues((prevIssues) => prevIssues.filter((issue) => !departments[department].includes(issue)));
				return newDepts;
			} else {
				return [...prev, department];
			}
		});
	};

	const handleIssueChange = (issue) => {
		setSelectedIssues((prev) => (prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]));
	};

	const handleSubmit = () => {
		const formData = {
			departments: selectedDepartments,
			issues: selectedIssues,
			satisfaction,
			additionalComments,
		};
		editCall(data?.id, { callAnalysis: formData });
		setSelectedDepartments([]);
		setSelectedIssues([]);
		setSatisfaction("");
		setAdditionalComments("");
		setActiveTab(0);
		onClose();
	};

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const handleNext = () => {
		setActiveTab(activeTab + 1);
	};

	const handleBack = () => {
		setActiveTab(activeTab - 1);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					maxHeight: "90vh",
				},
			}}
		>
			<DialogTitle sx={{ textAlign: "left", pt: 3 }}>
				<Typography variant="h5" component="div" fontWeight="bold">
					<RateReviewIcon fontSize="medium" color="primary" /> Post-Call Review Form
				</Typography>
				<Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
					Kindly review the call and provide your insights to help us improve.
				</Typography>
			</DialogTitle>

			<Divider />

			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ px: 2 }}>
					<Tab label="Departments" />
					<Tab label="Issues" disabled={selectedDepartments.length === 0} />
					<Tab label="Feedback" />
				</Tabs>
			</Box>

			<DialogContent sx={{ p: 3 }}>
				<TabPanel value={activeTab} index={0}>
					<Paper
						variant="outlined"
						sx={{
							maxHeight: 300,
							overflow: "auto",
							p: 2,
							borderRadius: 1,
						}}
					>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
							{Object.keys(departments).map((department) => (
								<FormControlLabel key={department} control={<Checkbox checked={selectedDepartments.includes(department)} onChange={() => handleDepartmentChange(department)} />} label={department} />
							))}
						</Box>
					</Paper>

					<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
						<Button variant="contained" onClick={handleNext} disabled={selectedDepartments.length === 0}>
							Next
						</Button>
					</Box>
				</TabPanel>

				<TabPanel value={activeTab} index={1}>
					<Paper
						variant="outlined"
						sx={{
							maxHeight: 300,
							overflow: "auto",
							p: 2,
							borderRadius: 1,
						}}
					>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							{selectedDepartments.map((department) => (
								<Box key={department}>
									<Typography variant="subtitle1" fontWeight="medium">
										{department}
									</Typography>
									<Box
										sx={{
											ml: 2,
											mt: 1,
											display: "flex",
											flexDirection: "column",
											gap: 1,
										}}
									>
										{departments[department].map((issue) => (
											<FormControlLabel key={issue} control={<Checkbox checked={selectedIssues.includes(issue)} onChange={() => handleIssueChange(issue)} size="small" />} label={<Typography variant="body2">{issue}</Typography>} />
										))}
									</Box>
									<Divider sx={{ mt: 2 }} />
								</Box>
							))}
						</Box>
					</Paper>

					<Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
						<Button variant="outlined" onClick={handleBack}>
							Back
						</Button>
						<Button variant="contained" onClick={handleNext}>
							Next
						</Button>
					</Box>
				</TabPanel>

				<TabPanel value={activeTab} index={2}>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<FormControl fullWidth>
							<InputLabel id="satisfaction-label">Overall Satisfaction</InputLabel>
							<Select labelId="satisfaction-label" value={satisfaction} label="Overall Satisfaction" onChange={(e) => setSatisfaction(e.target.value)}>
								{satisfactionOptions.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField label="Additional Comments" multiline rows={4} value={additionalComments} onChange={(e) => setAdditionalComments(e.target.value)} placeholder="Please provide any additional feedback or details about the issues..." fullWidth />
					</Box>

					<Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
						<Button variant="outlined" onClick={handleBack}>
							Back
						</Button>
						<Button variant="contained" color="primary" onClick={handleSubmit}>
							Submit
						</Button>
					</Box>
				</TabPanel>
			</DialogContent>
		</Dialog>
	);
}

export default PostCallReviewForm;
