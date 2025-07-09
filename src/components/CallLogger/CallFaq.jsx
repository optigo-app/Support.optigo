import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, IconButton, Paper, Grid, Container, Checkbox, FormControlLabel, Rating, FormGroup } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import LiveHelpRoundedIcon from "@mui/icons-material/LiveHelpRounded";

const defaultQuestions = [
	{
		question: "How well did the customer explain their issue?",
		type: "rating",
		answer: 0,
		isDefault: true,
	},
	{
		question: "Was the issue clearly documented in the system?",
		type: "checkbox",
		answer: false,
		isDefault: true,
	},
	{
		question: "Which resources were used to resolve the issue?",
		type: "multi-checkbox",
		answer: [],
		isDefault: true,
	},
	{
		question: "How confident are you that the issue is fully resolved?",
		type: "rating",
		answer: 0,
		isDefault: true,
	},
	{
		question: "Any additional notes or feedback on the call?",
		type: "text",
		answer: "",
		isDefault: true,
	},
];

const PostCallFeedbackForm = ({ open, setOpen }) => {
	const [questions, setQuestions] = useState(defaultQuestions);

	useEffect(() => {
		if (open) {
			setQuestions(defaultQuestions);
		}
	}, [open]);

	const handleInputChange = (index, field, value) => {
		const newQuestions = [...questions];
		newQuestions[index][field] = value;
		setQuestions(newQuestions);
	};

	const handleMultiCheckboxChange = (index, option) => {
		const newQuestions = [...questions];
		const selectedOptions = newQuestions[index].answer;
		if (selectedOptions.includes(option)) {
			newQuestions[index].answer = selectedOptions.filter((item) => item !== option);
		} else {
			newQuestions[index].answer = [...selectedOptions, option];
		}
		setQuestions(newQuestions);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleAddQuestion = () => {
		setQuestions([...questions, { question: "", type: "text", answer: "", isDefault: false }]);
	};

	const handleRemoveQuestion = (index) => {
		if (!questions[index].isDefault) {
			setQuestions(questions.filter((_, i) => i !== index));
		}
	};

	const handleSubmit = () => {
		setOpen(false);
	};

	return (
		<Box
			sx={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				bgcolor: "rgba(0, 0, 0, 0.5)",
				display: open ? "flex" : "none",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 1400,
				p: 2,
			}}
		>
			<Container maxWidth="md">
				<Paper
					sx={{
						p: 4,
						borderRadius: 2,
						boxShadow: 4,
						backgroundColor: "#fff",
						position: "relative",
					}}
				>
					<IconButton
						onClick={handleClose}
						sx={{
							position: "absolute",
							top: 10,
							right: 10,
							color: "#333",
						}}
					>
						<CloseIcon />
					</IconButton>

					<Typography variant="h5" gutterBottom align="left" sx={{ mb: 3 }}>
						<LiveHelpRoundedIcon fontSize="medium" color="primary" /> Post Call Faq
					</Typography>

					<Grid
						container
						spacing={2}
						sx={{
							height: "60vh",
							overflowY: "auto",
						}}
					>
						{questions.map((item, index) => (
							<Grid item xs={12} sm={6} key={index}>
								<Paper
									sx={{
										p: 2,
										borderRadius: 2,
										backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
									}}
								>
									<TextField label="Question" variant="outlined" fullWidth value={item.question} onChange={(e) => handleInputChange(index, "question", e.target.value)} sx={{ mb: 1 }} />
									{item.type === "text" && <TextField variant="outlined" fullWidth value={item.answer} onChange={(e) => handleInputChange(index, "answer", e.target.value)} />}
									{item.type === "rating" && <Rating value={item.answer} onChange={(e, newValue) => handleInputChange(index, "answer", newValue)} />}
									{item.type === "checkbox" && <FormControlLabel control={<Checkbox checked={item.answer} onChange={(e) => handleInputChange(index, "answer", e.target.checked)} />} label="Yes" />}
									{item.type === "multi-checkbox" && (
										<FormGroup>
											{["Knowledge Base", "Senior Support", "Internal Documentation"].map((option) => (
												<FormControlLabel key={option} control={<Checkbox checked={item.answer.includes(option)} onChange={() => handleMultiCheckboxChange(index, option)} />} label={option} />
											))}
										</FormGroup>
									)}
									{!item.isDefault && (
										<IconButton color="error" onClick={() => handleRemoveQuestion(index)} sx={{ mt: 1 }}>
											<DeleteIcon />
										</IconButton>
									)}
								</Paper>
							</Grid>
						))}
					</Grid>

					<Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
						<Grid item>
							<Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddQuestion}>
								Add Question
							</Button>
						</Grid>
						<Grid item>
							<Button variant="contained" color="success" onClick={handleSubmit}>
								Submit Feedback
							</Button>
						</Grid>
					</Grid>
				</Paper>
			</Container>
		</Box>
	);
};

export default PostCallFeedbackForm;
