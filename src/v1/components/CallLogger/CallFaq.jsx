import React, { useState } from "react";
import {
	TextField,
	Button,
	Typography,
	Box,
	IconButton,
	Paper,
	Container,
	Backdrop,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LiveHelpRoundedIcon from "@mui/icons-material/LiveHelpRounded";

const defaultQuestions = [
	{ id: 1, question: "How well did the customer explain their issue?", type: "binary", answer: "YES" },
	{ id: 2, question: "Was the issue clearly documented in the system?", type: "binary", answer: null },
	{ id: 3, question: "Was senior support required for this call?", type: "binary", answer: "NO" },
	{ id: 4, question: "How confident are you that the issue is fully resolved?", type: "binary", answer: null },
	{ id: 5, question: "Any additional notes or feedback on the call?", type: "text", answer: "" },
];

const PostCallFeedbackForm = ({ open, setOpen }) => {
	const [questions, setQuestions] = useState(defaultQuestions);

	const handleSelection = (index, val) => {
		const updated = [...questions];
		updated[index].answer = val;
		setQuestions(updated);
	};

	const handleTextChange = (index, val) => {
		const updated = [...questions];
		updated[index].answer = val;
		setQuestions(updated);
	};

	return (
		<Backdrop
			open={open}
			sx={{
				zIndex: (theme) => theme.zIndex.drawer + 1,
				backgroundColor: "rgba(15, 23, 42, 0.5)", // Modern Slate overlay
				backdropFilter: "blur(4px)",
			}}
		>
			<Container maxWidth="md">
				<Paper
					elevation={0}
					sx={{
						borderRadius: "16px",
						border: "1px solid #e2e8f0", // Clean Slate border
						maxHeight: "85vh",
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#ffffff",
						overflow: "hidden",
						boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
					}}
				>
					{/* Header */}
					<Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center",
						borderBottom: "1px solid #e2e8f0",
					 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
							<Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: "10px", display: "flex" }}>
								<LiveHelpRoundedIcon sx={{ color: "#475569", fontSize: 20 }} />
							</Box>
							<Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", fontSize: "1.1rem" }}>
								Post-Call Review
							</Typography>
						</Box>
						<IconButton onClick={() => setOpen(false)} size="small" sx={{ color: "#94a3b8" }}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>

					{/* Question List */}
					<Box
						sx={{
							overflowY: "auto",
							flexGrow: 1,
							px: 3,
							pb: 2,
							"&::-webkit-scrollbar": { width: "6px" },
							"&::-webkit-scrollbar-track": { background: "transparent" },
							"&::-webkit-scrollbar-thumb": { background: "#e2e8f0", borderRadius: "10px" },
							pt:3
						}}
					>
						{questions.map((item, index) => (
							<Box
								key={item.id}
								sx={{
									mb: 2.5,
									border: "1px solid #e2e8f0", // Subtle border
									borderRadius: "12px",
									overflow: "hidden",
									transition: "border-color 0.2s",
									"&:hover": { borderColor: "#cbd5e1" }
								}}
							>
								{/* TOP: Question */}
								<Box sx={{ p: 2, bgcolor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
									<Typography sx={{ fontSize: "0.9rem", color: "#334155", fontWeight: 600, lineHeight: 1.4 }}>
										{item.question}
									</Typography>
								</Box>

								{/* BOTTOM: Answer Layout */}
								<Box sx={{ display: "flex", height: "auto", bgcolor: "#f8fafc" }}>
									{item.type === "binary" ? (
										<>
											{/* YES BUTTON */}
											<Box
												onClick={() => handleSelection(index, "YES")}
												sx={{
													flex: 1,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													cursor: "pointer",
													fontSize: "0.75rem",
													fontWeight: 700,
													letterSpacing: "0.5px",
													transition: "all 0.15s ease",
													borderRight: "1px solid #e2e8f0",
													backgroundColor: item.answer === "YES" ? "#0f172a" : "transparent",
													color: item.answer === "YES" ? "#fff" : "#64748b",
													"&:hover": { bgcolor: item.answer === "YES" ? "#0f172a" : "#f1f5f9" },
													py:2
												}}
											>
												YES
											</Box>
											{/* NO BUTTON */}
											<Box
												onClick={() => handleSelection(index, "NO")}
												sx={{
													flex: 1,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													cursor: "pointer",
													fontSize: "0.75rem",
													fontWeight: 700,
													letterSpacing: "0.5px",
													transition: "all 0.15s ease",
													backgroundColor: item.answer === "NO" ? "#0f172a" : "transparent",
													color: item.answer === "NO" ? "#fff" : "#64748b",
													"&:hover": { bgcolor: item.answer === "NO" ? "#0f172a" : "#f1f5f9" },
												}}
											>
												NO
											</Box>
										</>
									) : (
										/* TEXT INPUT */
										<TextField
											fullWidth
											placeholder="Write your notes here..."
											variant="standard"
											value={item.answer}
											onChange={(e) => handleTextChange(index, e.target.value)}
											multiline
											rows={3}
											rowsMax={6}
											InputProps={{
												disableUnderline: true,
												sx: { px: 2, height: "100%", fontSize: "0.85rem", color: "#334155",
													py:2
												 },
											}}
										/>
									)}
								</Box>
							</Box>
						))}
					</Box>

					{/* Footer */}
					<Box sx={{ p: 3, borderTop: "1px solid #f1f5f9", display: "flex", gap: 2, alignItems: "center" }}>
						<Button
							startIcon={<AddIcon />}
							sx={{ 
								textTransform: "none", 
								color: "#64748b", 
								fontWeight: 600,
								"&:hover": { bgcolor: "#f1f5f9", color: "#1e293b" }
							}}
						>
							Add Question
						</Button>
						<Box sx={{ flexGrow: 1 }} />
						<Button
							variant="contained"
							disableElevation
							onClick={() => setOpen(false)}
							sx={{
								bgcolor: "#0f172a", // Deep Navy/Slate
								px: 4,
								py: 1,
								textTransform: "none",
								borderRadius: "8px",
								fontWeight: 600,
								"&:hover": { bgcolor: "#1e293b" },
								color:'#fff'
							}}
						>
							Finish Review
						</Button>
					</Box>
				</Paper>
			</Container>
		</Backdrop>
	);
};

export default PostCallFeedbackForm;
// import React, { useState } from "react";
// import {
// 	TextField,
// 	Button,
// 	Typography,
// 	Box,
// 	IconButton,
// 	Paper,
// 	Container,
// 	Divider,
// 	Backdrop,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import LiveHelpRoundedIcon from "@mui/icons-material/LiveHelpRounded";

// const defaultQuestions = [
// 	{ id: 1, question: "How well did the customer explain their issue?", type: "binary", answer: "YES" },
// 	{ id: 2, question: "Was the issue clearly documented in the system?", type: "binary", answer: null },
// 	{ id: 3, question: "Which resources were used to resolve the issue?", type: "text", answer: "" },
// 	{ id: 4, question: "How confident are you that the issue is fully resolved?", type: "binary", answer: null },
// 	{ id: 5, question: "Did the customer mention any competitor names?", type: "binary", answer: "NO" },
// ];

// const PostCallFeedbackForm = ({ open, setOpen }) => {
// 	const [questions, setQuestions] = useState(defaultQuestions);

// 	const handleSelection = (index, val) => {
// 		const updated = [...questions];
// 		updated[index].answer = val;
// 		setQuestions(updated);
// 	};

// 	const handleTextChange = (index, val) => {
// 		const updated = [...questions];
// 		updated[index].answer = val;
// 		setQuestions(updated);
// 	};

// 	return (
// 		<Backdrop
// 			open={open}
// 			sx={{
// 				zIndex: (theme) => theme.zIndex.drawer + 1,
// 				color: "#fff",
// 				backgroundColor: "rgba(0, 0, 0, 0.4)", // Darker backdrop
// 				backdropFilter: "blur(2px)",
// 			}}
// 		>
// 			<Container maxWidth="sm">
// 				<Paper
// 					elevation={10}
// 					sx={{
// 						p: 0, // Zero padding on main paper to let scrollbar hit the edge
// 						borderRadius: "12px",
// 						border: "1px solid #e0e0e0",
// 						maxHeight: "85vh",
// 						display: "flex",
// 						flexDirection: "column",
// 						backgroundColor: "#fff",
// 						overflow: "hidden",
// 					}}
// 				>
// 					{/* Header - Fixed */}
// 					<Box sx={{ p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// 						<Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700, color: "#24292e" }}>
// 							<LiveHelpRoundedIcon sx={{ color: "#24292e" }} /> Post-Call Review
// 						</Typography>
// 						<IconButton onClick={() => setOpen(false)} size="small">
// 							<CloseIcon fontSize="small" />
// 						</IconButton>
// 					</Box>

// 					{/* Question List - Scrollable */}
// 					<Box
// 						sx={{
// 							overflowY: "auto",
// 							flexGrow: 1,
// 							px: 3, // Padding inside for the content
// 							py: 1,
// 							// Custom Scrollbar Styling to make it visible on the right
// 							"&::-webkit-scrollbar": {
// 								width: "8px",
// 							},
// 							"&::-webkit-scrollbar-track": {
// 								background: "#f1f1f1",
// 							},
// 							"&::-webkit-scrollbar-thumb": {
// 								background: "#ccc",
// 								borderRadius: "10px",
// 							},
// 							"&::-webkit-scrollbar-thumb:hover": {
// 								background: "#999",
// 							},
// 						}}
// 					>
// 						{questions.map((item, index) => (
// 							<Box
// 								key={item.id}
// 								sx={{
// 									mb: 3,
// 									border: "1px solid black", // Blue-grey border from your sketch
// 									borderRadius: 2,
// 									overflow: "hidden",
// 									backgroundColor: "#fff",
// 								}}
// 							>
// 								{/* TOP: Question Area */}
// 								<Box sx={{ p: 2 }}>
// 									<Typography sx={{ fontSize: "0.95rem", color: "#24292e", fontWeight: 600 }}>
// 										{item.question}
// 									</Typography>
// 								</Box>

// 								<Divider sx={{ borderColor: "black", borderWidth: "1px" }} />

// 								{/* BOTTOM: Answer Area */}
// 								<Box sx={{ display: "flex", height: "48px" }}>
// 									{item.type === "binary" ? (
// 										<>
// 											{/* YES BUTTON (Dark Color when selected) */}
// 											<Box
// 												onClick={() => handleSelection(index, "YES")}
// 												sx={{
// 													flex: 1,
// 													display: "flex",
// 													alignItems: "center",
// 													justifyContent: "center",
// 													cursor: "pointer",
// 													fontSize: "0.85rem",
// 													fontWeight: 800,
// 													transition: "all 0.2s ease",
// 													borderRight: "1.5px solid #B0C4DE",
// 													backgroundColor: item.answer === "YES" ? "#24292e" : "transparent",
// 													color: item.answer === "YES" ? "#fff" : "#888",
// 													"&:hover": { bgcolor: item.answer === "YES" ? "#24292e" : "#f5f5f5" },
// 												}}
// 											>
// 												YES
// 											</Box>
// 											{/* NO BUTTON (Dark Color when selected) */}
// 											<Box
// 												onClick={() => handleSelection(index, "NO")}
// 												sx={{
// 													flex: 1,
// 													display: "flex",
// 													alignItems: "center",
// 													justifyContent: "center",
// 													cursor: "pointer",
// 													fontSize: "0.85rem",
// 													fontWeight: 800,
// 													transition: "all 0.2s ease",
// 													backgroundColor: item.answer === "NO" ? "#24292e" : "transparent",
// 													color: item.answer === "NO" ? "#fff" : "#888",
// 													"&:hover": { bgcolor: item.answer === "NO" ? "#24292e" : "#f5f5f5" },
// 												}}
// 											>
// 												NO
// 											</Box>
// 										</>
// 									) : (
// 										/* TEXT INPUT AREA */
// 										<TextField
// 											fullWidth
// 											placeholder="Write your response..."
// 											variant="standard"
// 											value={item.answer}
// 											onChange={(e) => handleTextChange(index, e.target.value)}
// 											InputProps={{
// 												disableUnderline: true,
// 												sx: { px: 2, height: "100%", fontSize: "0.9rem", color: "#24292e" },
// 											}}
// 										/>
// 									)}
// 								</Box>
// 							</Box>
// 						))}
// 					</Box>

// 					{/* Footer - Fixed */}
// 					<Box sx={{ p: 3, pt: 2, display: "flex", gap: 2, borderTop: "1px solid #eee" }}>
// 						<Button
// 							startIcon={<AddIcon />}
// 							sx={{ textTransform: "none", color: "#555", fontWeight: 600 }}
// 						>
// 							Add New Question
// 						</Button>
// 						<Box sx={{ flexGrow: 1 }} />
// 						<Button
// 							variant="contained"
// 							disableElevation
// 							onClick={() => setOpen(false)}
// 							sx={{
// 								bgcolor: "#24292e",
// 								px: 4,
// 								textTransform: "none",
// 								borderRadius: "6px",
// 								fontWeight: 600,
// 								"&:hover": { bgcolor: "#000" },
// 							}}
// 						>
// 							Finish Review
// 						</Button>
// 					</Box>
// 				</Paper>
// 			</Container>
// 		</Backdrop>
// 	);
// };

// export default PostCallFeedbackForm;