import React, { useState } from "react";
import { Typography, Avatar, Card, CardMedia, CardActionArea, Collapse, ListItem, ListItemAvatar, ListItemText, IconButton, Box, Badge, Chip, Paper, Divider, Stack, Tooltip, Button } from "@mui/material";
import DownloadForOfflineRoundedIcon from "@mui/icons-material/DownloadForOfflineRounded";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getFileMetaData, ValidateAttachment, ValidFile } from "../../../../libs/helper";
import Previewer from "../Previewer";

const AttachmentCard = ({ comment, openAttachmentId, handleToggleCollapse }) => {
	const [open, setOpen] = useState(false);
	if (!comment?.attachment) return null;
	const { isMultiple, attachments, error } = ValidateAttachment(comment);

	return (
		<>
			<Box sx={{ mb: 1.5 }}>
				{isMultiple ? (
					<MultipleAttachmentCard HandleOpen={() => setOpen(true)} attachments={attachments} comment={comment} openAttachmentId={openAttachmentId} handleToggleCollapse={handleToggleCollapse} />
				) : (
					<SingleAttachmentCard HandleOpen={() => setOpen(true)} attachment={attachments[0]} comment={comment} openAttachmentId={openAttachmentId} handleToggleCollapse={handleToggleCollapse} />
				)}
			</Box>
			;
			<Previewer open={open} setOpen={setOpen} attachments={attachments} />
		</>
	);
};

const SingleAttachmentCard = ({ HandleOpen, attachment, comment, openAttachmentId, handleToggleCollapse }) => {
	const meta = getFileMetaData(attachment);
	const isImage = meta.type === "Image";
	const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].includes(meta.extension);
	const isExpanded = openAttachmentId === comment?.time;

	const handleOpenFile = (e) => {
		e.stopPropagation();
		window.open(attachment, "_blank");
	};

	if (!isImage && !isVideo) {
		return <FileCard meta={meta} fileSrc={attachment} handleOpenFile={handleOpenFile} />;
	}

	return (
		<Card
			sx={{
				maxWidth: 380,
				minWidth: 260,
				boxShadow: 1,
				backgroundColor: "#fff",
				borderRadius: 2,
				overflow: "hidden",
				border: "1px solid",
				borderColor: "divider",
				transition: "all 0.2s ease-in-out",
				"&:hover": {
					boxShadow: 3,
					borderColor: "primary.light",
				},
			}}
		>
			{/* Header */}
			<Box
				onClick={() => handleToggleCollapse(comment?.time)}
				sx={{
					p: 1.5,
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					transition: "background-color 0.2s",
					"&:hover": { backgroundColor: "grey.50" },
				}}
			>
				<Avatar
					variant="rounded"
					sx={{
						width: 36,
						height: 36,
						bgcolor: "primary.light",
						color: "primary.contrastText",
					}}
				>
					{meta.icon}
				</Avatar>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="body2"
						fontWeight="medium"
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{ValidFile(attachment)}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{`${meta.type} • ${meta.extension?.toUpperCase()}`}
					</Typography>
				</Box>

				<Stack direction="row" spacing={0.5} alignItems="center">
					<Tooltip title="Open in new tab">
						<IconButton size="small" onClick={HandleOpen}>
							<OpenInNewIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
				</Stack>
			</Box>

			{/* Preview */}
			<Collapse in={isExpanded} timeout={200}>
				<Divider />
				<Box sx={{ p: 1.5, pt: 1 }}>
					{isImage && (
						<CardActionArea onClick={handleOpenFile} sx={{ borderRadius: 1 }}>
							<CardMedia
								sx={{
									objectFit: "contain",
									width: "100%",
									borderRadius: 1,
									backgroundColor: "grey.50",
								}}
								component="img"
								height="180"
								image={attachment}
								alt={ValidFile(attachment)}
							/>
						</CardActionArea>
					)}
					{isVideo && (
						<CardMedia
							component="video"
							controls
							height="180"
							src={attachment}
							sx={{
								objectFit: "contain",
								width: "100%",
								borderRadius: 1,
								backgroundColor: "grey.50",
							}}
						/>
					)}
				</Box>
			</Collapse>
		</Card>
	);
};

const MultipleAttachmentCard = ({ HandleOpen, attachments, comment, openAttachmentId, handleToggleCollapse }) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const isExpanded = openAttachmentId === comment?.time;

	const handleOpenFile = (attachment, e) => {
		e.stopPropagation();
		window.open(attachment, "_blank");
	};

	return (
		<Card
			sx={{
				maxWidth: 420,
				minWidth: 300,
				boxShadow: 1,
				backgroundColor: "#fff",
				borderRadius: 2,
				overflow: "hidden",
				border: "1px solid",
				borderColor: "divider",
				transition: "all 0.2s ease-in-out",
				"&:hover": {
					boxShadow: 3,
					borderColor: "primary.light",
				},
			}}
		>
			{/* Header */}
			<Box
				onClick={() => handleToggleCollapse(comment?.time)}
				sx={{
					p: 1.5,
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					transition: "background-color 0.2s",
					"&:hover": { backgroundColor: "grey.50" },
				}}
			>
				<Badge badgeContent={attachments.length} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.75rem" } }}>
					<Avatar
						variant="rounded"
						sx={{
							width: 36,
							height: 36,
							bgcolor: "primary.light",
							color: "primary.contrastText",
						}}
					>
						<AttachFileIcon fontSize="small" />
					</Avatar>
				</Badge>

				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" fontWeight="medium">
						Multiple Attachments
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{attachments.length} files
					</Typography>
				</Box>

				<Stack direction="row" spacing={0.5} alignItems="center">
					<Tooltip title="Open current file">
						<IconButton size="small" onClick={HandleOpen}>
							<OpenInNewIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
				</Stack>
			</Box>

			<Collapse in={isExpanded} timeout={200}>
				<Divider />

				{/* File Tabs */}
				<Box sx={{ p: 1.5, pb: 1 }}>
					<Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
						{attachments.map((attachment, index) => {
							const meta = getFileMetaData(attachment);
							const isSelected = selectedIndex === index;

							return (
								<Chip
									key={index}
									label={`${meta.type} ${index + 1}`}
									variant={isSelected ? "filled" : "outlined"}
									color={isSelected ? "info" : "default"}
									size="small"
									onClick={() => setSelectedIndex(index)}
									icon={meta.icon}
									sx={{
										cursor: "pointer",
										minWidth: "fit-content",
									}}
								/>
							);
						})}
					</Stack>
				</Box>

				{/* Selected File Preview */}
				<Box sx={{ px: 1.5, pb: 1.5 }}>
					<AttachmentPreview attachment={attachments[selectedIndex]} onOpen={(e) => handleOpenFile(attachments[selectedIndex], e)} />
				</Box>
			</Collapse>
		</Card>
	);
};

const AttachmentPreview = ({ attachment, onOpen }) => {
	const meta = getFileMetaData(attachment);
	const isImage = meta.type === "Image";
	const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].includes(meta.extension);

	if (isImage) {
		return (
			<CardActionArea onClick={onOpen} sx={{ borderRadius: 1 }}>
				<CardMedia
					sx={{
						objectFit: "contain",
						width: "100%",
						borderRadius: 1,
						backgroundColor: "grey.50",
					}}
					component="img"
					height="180"
					image={attachment}
					alt={ValidFile(attachment)}
				/>
			</CardActionArea>
		);
	}

	if (isVideo) {
		return (
			<CardMedia
				component="video"
				controls
				height="180"
				src={attachment}
				sx={{
					objectFit: "contain",
					width: "100%",
					borderRadius: 1,
					backgroundColor: "grey.50",
				}}
			/>
		);
	}

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				textAlign: "center",
				backgroundColor: "grey.50",
				cursor: "pointer",
				borderRadius: 1,
				border: "1px dashed",
				borderColor: "grey.300",
				transition: "all 0.2s",
				"&:hover": {
					backgroundColor: "grey.100",
					borderColor: "primary.light",
				},
			}}
			onClick={onOpen}
		>
			<Avatar
				sx={{
					width: 40,
					height: 40,
					mx: "auto",
					mb: 1,
				}}
			>
				{meta.icon}
			</Avatar>
			<Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
				{ValidFile(attachment)}
			</Typography>
			<Typography variant="caption" color="text.secondary">
				{`${meta.type} • ${meta.extension?.split("/")[0]?.toUpperCase()}`}
			</Typography>
		</Paper>
	);
};

const FileCard = ({ meta, fileSrc, handleOpenFile }) => {
	return (
		<Card
			sx={{
				maxWidth: 380,
				minWidth: 260,
				boxShadow: 1,
				backgroundColor: "#fff",
				borderRadius: 2,
				cursor: "pointer",
				border: "1px solid",
				borderColor: "divider",
				transition: "all 0.2s ease-in-out",
				"&:hover": {
					boxShadow: 3,
					borderColor: "primary.light",
				},
			}}
		>
			<ListItem alignItems="center" onClick={handleOpenFile}>
				<ListItemAvatar>
					<Avatar
						variant="rounded"
						sx={{
							width: 36,
							height: 36,
							bgcolor: "#ddd",
						}}
					>
						{meta.icon}
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={
						<Typography
							variant="body2"
							fontWeight="medium"
							sx={{
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{ValidFile(fileSrc)}
						</Typography>
					}
					secondary={
						<Typography variant="caption" color="text.secondary">
							{`${meta.type} • ${meta.extension?.split("/")[0]?.toUpperCase()}`}
						</Typography>
					}
					sx={{ mr: 1 }}
				/>
				<Tooltip title="Download">
					<IconButton size="small" color="primary">
						<DownloadForOfflineRoundedIcon fontSize="medium" />
					</IconButton>
				</Tooltip>
			</ListItem>
		</Card>
	);
};

export default AttachmentCard;
