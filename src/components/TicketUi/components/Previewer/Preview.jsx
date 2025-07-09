import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, Box, List, ListItem, ListItemButton, ListItemText, Typography, IconButton, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, useMediaQuery, Drawer, AppBar, Toolbar, Divider, Chip, Button } from "@mui/material";
import { Close as CloseIcon, InsertDriveFile as FileIcon, Image as ImageIcon, VideoFile as VideoIcon, PictureAsPdf as PdfIcon, Code as CodeIcon, TableChart as TableIcon, Menu as MenuIcon, Description as TextIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";

const getFileIcon = (type) => {
	switch (type) {
		case "pdf":
			return <PdfIcon color="error" />;
		case "image":
			return <ImageIcon color="success" />;
		case "video":
			return <VideoIcon color="secondary" />;
		case "json":
			return <CodeIcon color="info" />;
		case "text":
			return <TextIcon color="primary" />;
		case "csv":
		case "excel":
			return <TableIcon color="warning" />;
		default:
			return <FileIcon color="action" />;
	}
};

const getFileType = (filename) => {
	const ext = filename.split(".").pop().toLowerCase();
	switch (ext) {
		case "pdf":
			return "pdf";
		case "jpg":
		case "jpeg":
		case "png":
		case "gif":
		case "webp":
		case "svg":
			return "image";
		case "mp4":
		case "webm":
		case "ogg":
		case "avi":
		case "mov":
			return "video";
		case "json":
			return "json";
		case "txt":
		case "log":
		case "md":
			return "text";
		case "csv":
			return "csv";
		case "xls":
		case "xlsx":
			return "excel";
		default:
			return "unknown";
	}
};

const FilePreviewDialog = ({ open, onClose, attachments = [], title = "File Previewer" }) => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewData, setPreviewData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [mobileOpen, setMobileOpen] = useState(false);

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Convert URL arrays to file objects
	const processAttachments = (attachments) => {
		if (!attachments || !Array.isArray(attachments)) return [];

		return attachments.map((url, index) => {
			const fileName = url.split("/").pop() || `file_${index + 1}`;
			const fileType = getFileType(fileName);

			return {
				id: index + 1,
				name: fileName,
				type: fileType,
				url: url,
				size: null, // You can add size if available from API
			};
		});
	};

	const fileList = processAttachments(attachments);

	const getFileTypeColor = (type) => {
		switch (type) {
			case "pdf":
				return "error";
			case "image":
				return "success";
			case "video":
				return "secondary";
			case "json":
				return "info";
			case "text":
				return "primary";
			case "csv":
			case "excel":
				return "warning";
			default:
				return "default";
		}
	};

	const handleFileSelect = async (file) => {
		setSelectedFile(file);
		setPreviewData(null);
		setError(null);
		setLoading(true);
		setMobileOpen(false);

		try {
			const fileType = file.type || getFileType(file.name);

			switch (fileType) {
				case "pdf":
				case "image":
				case "video":
					setPreviewData({ type: fileType, url: file.url });
					break;

				case "json":
					try {
						const response = await fetch(file.url);
						const jsonData = await response.json();
						setPreviewData({
							type: "json",
							content: JSON.stringify(jsonData, null, 2),
						});
					} catch (err) {
						setError("Failed to load JSON file");
					}
					break;

				case "text":
					try {
						const response = await fetch(file.url);
						const textData = await response.text();
						setPreviewData({
							type: "text",
							content: textData,
						});
					} catch (err) {
						setError("Failed to load text file");
					}
					break;

				case "csv":
					try {
						const response = await fetch(file.url);
						const csvText = await response.text();
						const rows = csvText.split("\n").map((row) => row.split(","));
						setPreviewData({ type: "table", data: rows });
					} catch (err) {
						setError("Failed to load CSV file");
					}
					break;

				case "excel":
					try {
						const response = await fetch(file?.url);
						const arrayBuffer = await response.arrayBuffer();
						const workbook = XLSX.read(arrayBuffer, { type: "array" });
						const sheetName = workbook.SheetNames[0];
						const worksheet = workbook.Sheets[sheetName];
						const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
						setPreviewData({ type: "table", data: jsonData });
					} catch (err) {
						setError("Failed to load Excel file");
					}
					break;

				default:
					setError("Unsupported file type");
			}
		} catch (err) {
			setError("Failed to load file preview");
		} finally {
			setLoading(false);
		}
	};

	const renderPreview = () => {
		if (loading) {
			return (
				<Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
					<CircularProgress />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Loading preview...
					</Typography>
				</Box>
			);
		}

		if (error) {
			return (
				<Alert
					severity="error"
					sx={{ m: 2 }}
					action={
						<IconButton aria-label="close" color="inherit" size="small" onClick={() => setError(null)}>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					}
				>
					{error}
				</Alert>
			);
		}

		if (!previewData) {
			return (
				<Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
					<FileIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
					<Typography variant="h6" color="text.secondary">
						Select a file to preview
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						{fileList.length} file{fileList.length !== 1 ? "s" : ""} available
					</Typography>
				</Box>
			);
		}

		switch (previewData.type) {
			case "pdf":
				return (
					<Box sx={{ height: "100%", position: "relative" }}>
						<iframe src={previewData.url} width="100%" height="100%" style={{ border: "none" }} title="PDF Preview" />
					</Box>
				);

			case "image":
				return (
					<Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2 }}>
						<img
							src={previewData.url}
							alt="Preview"
							style={{
								maxWidth: "100%",
								maxHeight: "100%",
								objectFit: "contain",
								borderRadius: theme.shape.borderRadius,
							}}
							onError={(e) => {
								e.target.style.display = "none";
								setError("Failed to load image");
							}}
						/>
					</Box>
				);

			case "video":
				return (
					<Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2 }}>
						<video
							controls
							style={{
								maxWidth: "100%",
								maxHeight: "100%",
								borderRadius: theme.shape.borderRadius,
							}}
							onError={() => setError("Failed to load video")}
						>
							<source src={previewData.url} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					</Box>
				);

			case "json":
			case "text":
				return (
					<Box sx={{ height: "100%", overflow: "auto" }}>
						<pre
							style={{
								fontFamily: "monospace",
								fontSize: "14px",
								lineHeight: "1.5",
								padding: "16px",
								margin: 0,
								backgroundColor: theme.palette.grey[50],
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								height: "100%",
								boxSizing: "border-box",
							}}
						>
							{previewData.content}
						</pre>
					</Box>
				);

			case "table":
				return (
					<TableContainer component={Paper} sx={{ height: "100%", overflow: "auto" }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									{previewData.data[0]?.map((header, index) => (
										<TableCell
											key={index}
											sx={{
												fontWeight: "bold",
												backgroundColor: theme.palette.grey[100],
											}}
										>
											{header}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{previewData.data.slice(1).map((row, rowIndex) => (
									<TableRow key={rowIndex} hover>
										{row.map((cell, cellIndex) => (
											<TableCell key={cellIndex}>{cell}</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				);

			default:
				return (
					<Alert severity="warning" sx={{ m: 2 }}>
						<Typography variant="h6">Unsupported file type</Typography>
						<Typography variant="body2">Cannot preview {selectedFile?.name}. File type is not supported.</Typography>
					</Alert>
				);
		}
	};

	const sidebarContent = (
		<Box
			sx={{
				width: isMobile ? 300 : 320,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.paper",
			}}
		>
			<Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
				<Typography variant="h6" gutterBottom>
					Files ({fileList.length})
				</Typography>
				{fileList.length === 0 && (
					<Typography variant="body2" color="text.secondary">
						No files to preview
					</Typography>
				)}
			</Box>

			<List sx={{ flexGrow: 1, overflow: "auto", p: 0 }}>
				{fileList.map((file) => (
					<ListItem key={file.id} disablePadding>
						<ListItemButton
							onClick={() => handleFileSelect(file)}
							selected={selectedFile?.id === file.id}
							sx={{
								py: 1.5,
								px: 2,
								"&.Mui-selected": {
									bgcolor: "default.main",
									"&:hover": {
										bgcolor: "default.dark",
									},
								},
							}}
						>
							<Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>{getFileIcon(file.type)}</Box>
							<ListItemText
								primary={file.name}
								secondary={<Chip label={file.type.toUpperCase()} size="small" variant="outlined" color={getFileTypeColor(file.type)} sx={{ mt: 0.5 }} />}
								primaryTypographyProps={{
									noWrap: true,
									title: file.name,
									fontSize: "0.875rem",
								}}
								secondaryTypographyProps={{
									component: "div",
								}}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Box>
	);

	if (!attachments || attachments.length === 0) {
		return null;
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xl"
			fullWidth
			fullScreen={isMobile}
			PaperProps={{
				sx: {
					height: isMobile ? "100%" : "90vh",
					maxHeight: "90vh",
					bgcolor: "background.default",
				},
			}}
		>
			<Box
				sx={{
					width: "100%",
					backgroundColor: "lightcoral",
					color: "info.contrastText",
					textAlign: "center",
					py: 1,
					position: "sticky",
					top: 0,
					zIndex: 1000,
				}}
			>
				<Typography variant="body2" fontWeight="bold">
					🚧 This feature is currently under development 🚧
				</Typography>
			</Box>
			{isMobile && (
				<AppBar position="static" color="default" elevation={0}>
					<Toolbar>
						<IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" sx={{ flexGrow: 1 }}>
							{title}
						</Typography>
						<IconButton edge="end" onClick={onClose}>
							<CloseIcon />
						</IconButton>
					</Toolbar>
				</AppBar>
			)}

			{!isMobile && (
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottom: 1,
						borderColor: "divider",
					}}
				>
					<Typography variant="h6">{title}</Typography>
					<IconButton onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
			)}

			<DialogContent sx={{ p: 0, display: "flex", height: "100%" }}>
				{/* Mobile Drawer */}
				{isMobile && (
					<Drawer
						variant="temporary"
						open={mobileOpen}
						onClose={() => setMobileOpen(false)}
						ModalProps={{ keepMounted: true }}
						PaperProps={{
							sx: { bgcolor: "background.paper" },
						}}
					>
						{sidebarContent}
					</Drawer>
				)}

				{/* Desktop Sidebar */}
				{!isMobile && <Box sx={{ borderRight: 1, borderColor: "divider" }}>{sidebarContent}</Box>}

				{/* Preview Area */}
				<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
					{selectedFile && !isMobile && (
						<Box
							sx={{
								p: 2,
								borderBottom: 1,
								borderColor: "divider",
								bgcolor: "background.paper",
							}}
						>
							<Typography variant="h6" noWrap>
								{selectedFile.name}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{selectedFile.type.toUpperCase()} File
							</Typography>
						</Box>
					)}

					<Box
						sx={{
							flexGrow: 1,
							overflow: "hidden",
							bgcolor: "background.default",
						}}
					>
						{renderPreview()}
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

// Demo App Component
const Preview = ({ attachments = [], open, setOpen }) => {
	return <FilePreviewDialog open={open} onClose={() => setOpen(false)} attachments={attachments} title="Ticket Attachments" />;
};

export default Preview;
