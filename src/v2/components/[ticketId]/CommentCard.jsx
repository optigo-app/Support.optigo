import React from "react";
import { Box, Typography, Avatar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormatTime } from "../../libs/formatTime";
import { MessageSquareLock } from "lucide-react";
import AttachmentCard from "../TicketUi/components/Comment/AttachmentCard";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

const CommentBox = styled(Box)(({ theme }) => ({
	padding: theme.spacing(2),
	borderRadius: theme.shape.borderRadius,
	backgroundColor: "#fff",
	marginBottom: theme.spacing(2),
}));

const CommentCard = ({ index, comment, handleToggleCollapse, openAttachmentId, user }) => {
	if (!comment) return null;

	const isCurrentUser =
		user?.fullName &&
		comment?.Name &&
		comment?.Name?.toLowerCase() === user?.fullName?.toLowerCase();

	return (
		<Box sx={{ mb: 1.5 }}>
			{comment?.Role === "Client" && (
				<Box
					sx={{
						width: "100%",
						padding: "5px 14px",
						bgcolor: "#cbade424",
						borderRadius: "11px 11px 0 0",
						borderTop: "1px solid #cbade459",
						borderLeft: "1px solid #cbade459",
						borderRight: "1px solid #cbade459",
						boxShadow: "0 2px 6px rgba(203, 173, 228, 0.25)",
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<Tooltip title="Commented By Client">
						<AccountCircleRoundedIcon sx={{ fontSize: 16, color: "#7B6F9A" }} />
					</Tooltip>
					<Typography
						sx={{
							color: "#7B6F9A",
							fontWeight: 500,
							userSelect: "none",
							fontSize: "12.4px",
						}}
					>
						Comment added by Client
					</Typography>
				</Box>
			)}

			<CommentBox
				key={index}
				sx={{
					...(comment?.Role === "Client" && {
						borderLeft: "1px solid #cbade459",
						borderRight: "1px solid #cbade459",
						borderBottom: "1px solid #cbade459",
					}),
					backgroundColor: comment?.isOfficeUseOnly
						? "#ffe0b26e"
						: isCurrentUser
						? "#E0F7FA"
						: "#F8F9F9",
					position: "relative",
					padding: "12px 16px",
					borderRadius: comment?.Role === "Client" ? "0 0 16px 16px" : 4,
					boxShadow:
						comment?.Role === "Client"
							? "0px 4px 8px rgba(199, 199, 199, 0.33)"
							: "0px 2px 4px rgba(199, 199, 199, 0.33)",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 1.5,
					}}
				>
					{/* Left side: Avatar, Name, Time */}
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar
							sx={{
								mr: 1.5,
								bgcolor: comment?.isOfficeUseOnly
									? "#FF8B00"
									: isCurrentUser
									? "#4FC3F7"
									: "#0052CC",
								textTransform: "uppercase",
								width: 34,
								height: 34,
								fontSize: 15,
							}}
						>
							{comment?.Name ? comment.Name.charAt(0) : "U"}
						</Avatar>
						<Box>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: "bold",
									color: "#172B4D",
									textTransform: "capitalize",
									fontSize: 14,
								}}
							>
								{comment?.Name}
							</Typography>
							<Typography
								variant="caption"
								sx={{ display: "block", color: "#6B778C", mt: 0.2 }}
							>
								{FormatTime(comment?.time, "datetime")}
							</Typography>
						</Box>
					</Box>

					{/* Right side: Office Use Only Icon */}
					<Box sx={{ display: "flex", alignItems: "center" }}>
						{comment?.isOfficeUseOnly && (
							<Tooltip title="Office Use Only">
								<Box sx={{ p: 0.5 }}>
									<MessageSquareLock size={16} color="#FF8B00" />
								</Box>
							</Tooltip>
						)}
					</Box>
				</Box>

				<Box
					sx={{
						color: "#172B4D",
						whiteSpace: "pre-line",
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						maxWidth: "100%",
						fontSize: 13.5,
					}}
				>
					{comment?.attachment && (
						<AttachmentCard
							comment={comment}
							openAttachmentId={openAttachmentId}
							handleToggleCollapse={handleToggleCollapse}
						/>
					)}
					<Typography variant="body2" sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
						{comment?.message}
					</Typography>
				</Box>
			</CommentBox>
		</Box>
	);
};

export default CommentCard;
