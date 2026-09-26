import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import CommentCard from "./CommentCard";
import { useAuth } from "../../context/UseAuth";
import { AnimatePresence, motion } from "framer-motion";

const MotionBox = motion(Box);

const CommentList = ({ data }) => {
	const [openAttachmentId, setOpenAttachmentId] = useState(null);
	const [showAttachments, setShowAttachments] = useState(true);
	const [sortOrder, setSortOrder] = useState("newest");
	const { user } = useAuth();

	const handleToggleAttachments = () => {
		setShowAttachments((prev) => !prev);
	};

	const handleSortChange = (order) => {
		setSortOrder(order);
	};

	const handleToggleCollapse = (attachmentId) => {
		setOpenAttachmentId((prevId) => (prevId === attachmentId ? null : attachmentId));
	};

	if (!data || data.length === 0) {
		return (
			<Box sx={{ p: 3, textAlign: "center", color: "#6b778c" }}>
				<Typography variant="body2">No comments available on this ticket.</Typography>
			</Box>
		);
	}

	const sortedData = [...data].sort((a, b) => {
		const timeA = new Date(a?.time);
		const timeB = new Date(b?.time);
		if (sortOrder === "newest") {
			return timeB - timeA;
		} else {
			return timeA - timeB;
		}
	});

	const filteredData = sortedData.map((comment) => {
		if (!showAttachments) {
			const { attachment, ...rest } = comment;
			return rest;
		}
		return comment;
	});

	return (
		<AnimatePresence>
			<MotionBox
				sx={{ p: 2 }}
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
			>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						alignItems: "center",
						justifyContent: { xs: "flex-start", sm: "flex-end" },
						mb: 2,
						gap: 1,
					}}
				>
					<Typography variant="body2" sx={{ color: "#5e6c84", fontWeight: 500 }}>
						Sort by:
					</Typography>
					<Button
						variant="contained"
						size="small"
						onClick={() => handleSortChange(sortOrder === "newest" ? "oldest" : "newest")}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							boxShadow: "none",
							bgcolor: "#0052cc",
							"&:hover": { bgcolor: "#0747a6" },
						}}
					>
						{sortOrder === "newest" ? "Oldest First" : "Newest First"}
					</Button>
					<Button
						variant="contained"
						size="small"
						onClick={handleToggleAttachments}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							boxShadow: "none",
							bgcolor: "#0052cc",
							"&:hover": { bgcolor: "#0747a6" },
						}}
					>
						{showAttachments ? "Hide Attachments" : "Show Attachments"}
					</Button>
				</Box>

				{filteredData?.map((comment, index) => (
					<CommentCard
						user={user}
						comment={comment}
						handleToggleCollapse={handleToggleCollapse}
						index={index}
						openAttachmentId={openAttachmentId}
						key={comment.id || comment.time || index}
					/>
				))}
			</MotionBox>
		</AnimatePresence>
	);
};

export default CommentList;
