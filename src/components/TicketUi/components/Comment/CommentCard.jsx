import { Box, Typography, Avatar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormatTime } from "../../../../libs/formatTime";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import { Collapse, IconButton } from "@mui/material";
import { MessageSquareLock } from "lucide-react";
import { getFileMetaData } from "./../../../../libs/helper";
import AttachmentCard from "./AttachmentCard";

const CommentBox = styled(Box)(({ theme }) => ({
	padding: theme.spacing(2),
	borderRadius: theme.shape.borderRadius,
	backgroundColor: "#fff",
	marginBottom: theme.spacing(2),
}));

const CommentCard = ({ index, comment, handleToggleCollapse, openAttachmentId, user }) => {
	if (!comment) {
		return null;
	}

	return (
		<>
			<CommentBox
				key={index}
				sx={{
					backgroundColor: comment?.isOfficeUseOnly
						? "#ffe0b26e" // light orange
						: comment?.Name?.toLowerCase() === user?.fullName?.toLowerCase()
							? "#E0F7FA" // light sky
							: "#F8F9F9", // light gray
					position: "relative",
					// borderLeft: comment?.isOfficeUseOnly ? "4px solid #686868" : "none",
					padding: "12px 16px",
					marginBottom: "12px",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					{/* Left side: Avatar, Name, Time */}
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar
							sx={{
								mr: 2,
								bgcolor: comment?.isOfficeUseOnly ? "#FF8B00" : comment?.Name?.toLowerCase() === user?.fullName?.toLowerCase() ? "#4FC3F7" : "#0052CC",
								textTransform: "uppercase",
							}}
						>
							{comment?.Name && comment?.Name?.charAt(0)}
						</Avatar>
						<Box>
							<Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#172B4D" }} fontSize={14}>
								{comment?.Name}
							</Typography>
							<Typography variant="caption" sx={{ display: "block", color: "#6B778C", mt: 0.3 }}>
								{FormatTime(comment?.time, "datetime")}
							</Typography>
						</Box>
					</Box>
					{/* Right side: Office Use Only Icon */}
					{comment?.isOfficeUseOnly && (
						<Tooltip title="Office Use Only">
							<IconButton aria-label="office-use-only">
								<MessageSquareLock sx={{ fontSize: 15 }} />
							</IconButton>
						</Tooltip>
					)}
				</Box>

				<Typography
					variant="body2"
					sx={{
						color: "#172B4D",
						whiteSpace: "pre-line",
						mb: 2,
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						maxWidth: "100%",
					}}
					fontSize={13.5}
				>
					{comment?.attachment && <AttachmentCard comment={comment} openAttachmentId={openAttachmentId} handleToggleCollapse={handleToggleCollapse} />}
					{comment?.message}
				</Typography>
			</CommentBox>
		</>
	);
};

export default CommentCard;
