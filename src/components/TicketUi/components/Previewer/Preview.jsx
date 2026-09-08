import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogTitle, DialogContent, Box, List, ListItem, ListItemButton, ListItemText, Typography, IconButton, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, useMediaQuery, Drawer, AppBar, Toolbar, Divider, Chip, Button, Tabs, Tab, TextField, InputAdornment, TablePagination, Tooltip } from "@mui/material";
import { Close as CloseIcon, DescriptionRounded as DescriptionIcon , InsertDriveFile as FileIcon, Image as ImageIcon, VideoFile as VideoIcon, PictureAsPdf as PdfIcon, Code as CodeIcon, TableChart as TableIcon, Menu as MenuIcon, Description as TextIcon, Search as SearchIcon, FilterList as FilterIcon, Download as DownloadIcon } from "@mui/icons-material";
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
		case "doc":
		case "docx":
		case "docs":
			return <DescriptionIcon color="primary" />;
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
		case "doc":
		case "docx":
		case "docs":
			return "doc";
		default:
			return "unknown";
	}
};

// Document Preview Component for Word Documents
const DocumentPreview = ({ url, fileName }) => {
	const theme = useTheme();
	const [previewMethod, setPreviewMethod] = useState("google"); // google, microsoft, or none
	const [iframeLoading, setIframeLoading] = useState(true);
	const [iframeError, setIframeError] = useState(false);

	// Try loading with current preview method
	const handleIframeLoad = () => {
		setIframeLoading(false);
		setIframeError(false);
	};

	const handleIframeError = () => {
		setIframeLoading(false);
		setIframeError(true);

		// Try fallback to Microsoft viewer if Google fails
		if (previewMethod === "google") {
			console.log("Google Docs viewer failed, trying Microsoft Office viewer...");
			setPreviewMethod("microsoft");
			setIframeLoading(true);
			setIframeError(false);
		}
	};

	const handleRetry = (method) => {
		setPreviewMethod(method);
		setIframeLoading(true);
		setIframeError(false);
	};

	// Construct preview URL based on method
	const getPreviewUrl = () => {
		const encodedUrl = encodeURIComponent(url);
		
		switch (previewMethod) {
			case "google":
				return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
			case "microsoft":
				return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
			default:
				return null;
		}
	};

	const previewUrl = getPreviewUrl();

	if (iframeError && previewMethod === "microsoft") {
		// Both preview methods failed
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				height="100%"
				flexDirection="column"
				sx={{ p: 4 }}
			>
				<DescriptionIcon sx={{ fontSize: 80, color: "text.secondary", mb: 3 }} />
				<Typography variant="h6" color="text.secondary" gutterBottom>
					Preview Unavailable
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center", maxWidth: 500 }}>
					Unable to preview this document. The file may be too large, restricted, or not publicly accessible.
				</Typography>
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button 
						variant="outlined" 
						onClick={() => handleRetry("google")}
						size="small"
					>
						Retry with Google Viewer
					</Button>
					<Button 
						variant="outlined" 
						onClick={() => handleRetry("microsoft")}
						size="small"
					>
						Retry with Microsoft Viewer
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Box sx={{ height: "100%", position: "relative", bgcolor: "background.default" }}>
			{iframeLoading && (
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					height="100%"
					flexDirection="column"
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						bgcolor: "background.default",
						zIndex: 1,
					}}
				>
					<CircularProgress size={48} thickness={4} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Loading document preview...
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
						Using {previewMethod === "google" ? "Google Docs" : "Microsoft Office"} viewer
					</Typography>
				</Box>
			)}
			{previewUrl && (
				<iframe
					src={previewUrl}
					width="100%"
					height="100%"
					style={{ border: "none", display: "block" }}
					title="Document Preview"
					onLoad={handleIframeLoad}
					onError={handleIframeError}
				/>
			)}
		</Box>
	);
};

// Advanced Excel Preview Component
const AdvancedExcelPreview = ({ url, fileName }) => {
	const theme = useTheme();
	const [workbook, setWorkbook] = useState(null);
	const [sheets, setSheets] = useState([]);
	const [activeSheet, setActiveSheet] = useState(0);
	const [sheetData, setSheetData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [stats, setStats] = useState({ rows: 0, cols: 0, sheets: 0 });
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		loadExcelFile();
	}, [url]);

	useEffect(() => {
		if (workbook && sheets.length > 0 && sheets[activeSheet]) {
			processSheet(sheets[activeSheet]);
		}
	}, [activeSheet, workbook, sheets]);

	const loadExcelFile = async (isRetry = false) => {
		if (!isRetry) {
			setLoading(true);
		}
		setError(null);

		if (isRetry && retryCount > 0) {
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		try {
			if (!url || typeof url !== 'string') {
				throw new Error("Invalid file URL");
			}

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
			}

			const contentType = response.headers.get('content-type');
			console.log('Content-Type:', contentType);

			const arrayBuffer = await response.arrayBuffer();

			if (!arrayBuffer || arrayBuffer.byteLength === 0) {
				throw new Error("Empty file received");
			}

			console.log('File size:', arrayBuffer.byteLength, 'bytes');

			let wb;
			try {
				wb = XLSX.read(arrayBuffer, {
					type: "array",
					cellStyles: true,
					cellDates: true,
					cellNF: true,
					raw: false,
				});
			} catch (xlsxError) {
				console.error('XLSX parsing error:', xlsxError);
				throw new Error("Failed to parse Excel file. File may be corrupted or in an unsupported format.");
			}

			if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
				throw new Error("No sheets found in the Excel file");
			}

			console.log('Sheets found:', wb.SheetNames);

			setWorkbook(wb);
			setSheets(wb.SheetNames);
			setStats({
				sheets: wb.SheetNames.length,
				rows: 0,
				cols: 0,
			});

			if (wb.SheetNames.length > 0) {
				await processSheetSafely(wb, wb.SheetNames[0]);
			}

			setRetryCount(0);
		} catch (err) {
			console.error("Excel loading error:", err);

			if (!isRetry && retryCount < 2) {
				console.log(`Auto-retrying... (attempt ${retryCount + 1})`);
				setRetryCount(prev => prev + 1);
				setTimeout(() => loadExcelFile(true), 1500);
				return;
			}

			setError(err.message || "Failed to load Excel file. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const processSheetSafely = async (wb, sheetName) => {
		try {
			const worksheet = wb.Sheets[sheetName];
			if (!worksheet) {
				throw new Error(`Sheet "${sheetName}" not found`);
			}

			if (!worksheet['!ref']) {
				console.warn('Empty sheet detected');
				setSheetData([]);
				setStats((prev) => ({
					...prev,
					rows: 0,
					cols: 0,
				}));
				return;
			}

			const range = XLSX.utils.decode_range(worksheet["!ref"]);
			const data = [];

			for (let R = range.s.r; R <= range.e.r; R++) {
				const row = [];
				for (let C = range.s.c; C <= range.e.c; C++) {
					const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
					const cell = worksheet[cellAddress];

					if (cell) {
						let value = cell.v;

						try {
							if (cell.t === "d") {
								value = cell.w || new Date(cell.v).toLocaleDateString();
							}
							else if (cell.t === "n" && cell.w) {
								value = cell.w;
							}
							else if (cell.f) {
								value = cell.v !== undefined ? cell.v : `=${cell.f}`;
							}
						} catch (formatError) {
							console.warn('Cell formatting error:', formatError);
							value = cell.v;
						}

						row.push({
							value: value !== undefined && value !== null ? String(value) : "",
							type: cell.t || "s",
							style: cell.s,
						});
					} else {
						row.push({ value: "", type: "z" });
					}
				}
				data.push(row);
			}

			if (data.length === 0) {
				console.warn('No data extracted from sheet');
			}

			setSheetData(data);
			setStats((prev) => ({
				...prev,
				rows: data.length,
				cols: data[0]?.length || 0,
			}));
			setPage(0);

			console.log('Sheet processed successfully:', data.length, 'rows');
		} catch (err) {
			console.error("Sheet processing error:", err);
			throw new Error("Failed to process sheet data: " + err.message);
		}
	};

	const processSheet = (sheetName) => {
		if (!workbook || !sheetName) {
			console.error('Invalid workbook or sheet name');
			return;
		}

		try {
			processSheetSafely(workbook, sheetName);
		} catch (err) {
			console.error('Error in processSheet:', err);
			setError("Failed to process sheet: " + err.message);
		}
	};

	const handleSheetChange = (event, newValue) => {
		setActiveSheet(newValue);
		setSearchQuery("");
		setPage(0);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleRetry = () => {
		setRetryCount(0);
		loadExcelFile();
	};

	const filteredData = useMemo(() => {
		const dataOnly = sheetData.slice(1);
		if (!searchQuery.trim()) return dataOnly;

		return dataOnly.filter((row) =>
			row.some((cell) => (cell.value || "").toString().toLowerCase().includes(searchQuery.toLowerCase()))
		);
	}, [sheetData, searchQuery]);

	const paginatedData = useMemo(() => {
		const start = page * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredData.slice(start, end);
	}, [filteredData, page, rowsPerPage]);

	const getCellStyle = (cell, isHeader) => {
		const baseStyle = {
			whiteSpace: "nowrap",
			maxWidth: "300px",
			overflow: "hidden",
			textOverflow: "ellipsis",
			fontSize: "0.875rem",
			px: 2,
			py: 1.5,
		};

		if (isHeader) {
			return {
				...baseStyle,
				fontWeight: 600,
				bgcolor: theme.palette.mode === "dark" ? "#1a1a1a" : "#ffffff",
				borderBottom: 2,
				borderColor: "divider",
			};
		}

		if (cell.type === "n") {
			return { ...baseStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" };
		}

		return baseStyle;
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" sx={{ p: 4 }}>
				<CircularProgress size={48} thickness={4} />
				<Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
					Loading Excel file...
				</Typography>
				<Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
					{retryCount > 0 ? `Retrying (attempt ${retryCount + 1})...` : 'Processing spreadsheet data'}
				</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ m: 3 }} icon={<TableIcon />}>
				<Typography variant="h6" gutterBottom>
					Unable to Load Excel File
				</Typography>
				<Typography variant="body2" sx={{ mb: 2 }}>
					{error}
				</Typography>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button size="small" variant="contained" onClick={handleRetry}>
						Retry
					</Button>
					<Typography variant="caption" color="text.secondary" sx={{ ml: 2, alignSelf: 'center' }}>
						Attempts: {retryCount}
					</Typography>
				</Box>
			</Alert>
		);
	}

	if (!sheetData || sheetData.length === 0) {
		return (
			<Alert severity="info" sx={{ m: 3 }}>
				<Typography variant="h6">Empty Spreadsheet</Typography>
				<Typography variant="body2">This Excel file doesn't contain any data.</Typography>
			</Alert>
		);
	}

	const headers = sheetData.length > 0 ? sheetData[0] : [];

	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.default" }}>
			<Box
				sx={{
					borderBottom: 1,
					borderColor: "divider",
					bgcolor: "background.paper",
					flexShrink: 0,
				}}
			>
				<Box
					sx={{
						px: 3,
						py: 1.5,
						display: "flex",
						alignItems: "center",
						gap: 3,
						borderBottom: 1,
						borderColor: "divider",
						bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<TableIcon fontSize="small" color="warning" />
						<Typography variant="body2" fontWeight={600}>
							{fileName}
						</Typography>
					</Box>
					<Divider orientation="vertical" flexItem />
					<Chip label={`${stats.sheets} Sheet${stats.sheets > 1 ? "s" : ""}`} size="small" color="primary" variant="outlined" />
					<Chip label={`${stats.rows.toLocaleString()} Rows`} size="small" color="success" variant="outlined" />
					<Chip label={`${stats.cols} Columns`} size="small" color="info" variant="outlined" />
				</Box>

				<Tabs value={activeSheet} onChange={handleSheetChange} variant="scrollable" scrollButtons="auto" sx={{ px: 2 }}>
					{sheets.map((sheet, index) => (
						<Tab key={index} label={sheet} sx={{ textTransform: "none", fontWeight: 500, minHeight: 48 }} />
					))}
				</Tabs>

				<Box sx={{ p: 2 }}>
					<TextField
						fullWidth
						size="small"
						placeholder="Search in spreadsheet..."
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setPage(0);
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon fontSize="small" />
								</InputAdornment>
							),
							endAdornment: searchQuery && (
								<InputAdornment position="end">
									<IconButton size="small" onClick={() => setSearchQuery("")}>
										<CloseIcon fontSize="small" />
									</IconButton>
								</InputAdornment>
							),
						}}
						sx={{
							"& .MuiOutlinedInput-root": {
								bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
							},
						}}
					/>
				</Box>
			</Box>

			<Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
				<TableContainer
					sx={{
						height: "100%",
						maxHeight: "100%",
					}}
				>
					<Table stickyHeader size="small" sx={{ tableLayout: "auto" }}>
						<TableHead>
							<TableRow>
								{headers.map((cell, index) => (
									<TableCell key={index} sx={getCellStyle(cell, true)}>
										<Tooltip title={cell.value} placement="top">
											<span>{cell.value || `Column ${index + 1}`}</span>
										</Tooltip>
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedData.map((row, rowIndex) => (
								<TableRow
									key={page * rowsPerPage + rowIndex}
									hover
									sx={{
										"&:hover": {
											bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
										},
									}}
								>
									{row.map((cell, cellIndex) => (
										<TableCell key={cellIndex} sx={getCellStyle(cell, false)}>
											<Tooltip title={cell.value} placement="top" enterDelay={500}>
												<span>{cell.value}</span>
											</Tooltip>
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

			<Paper
				elevation={0}
				sx={{
					borderTop: 1,
					borderColor: "divider",
					bgcolor: "background.paper",
					flexShrink: 0,
				}}
			>
				<TablePagination
					component="div"
					count={filteredData.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[10, 25, 50, 100]}
					labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count.toLocaleString() : `more than ${to}`} rows`}
					sx={{
						"& .MuiTablePagination-toolbar": {
							minHeight: 56,
							display: "flex",
							alignItems: "center",
							px: 2,
							justifyContent: 'flex-end'
						},
						"& .MuiTablePagination-spacer": {
							flex: "none",
						},
						"& .MuiTablePagination-selectLabel": {
							margin: 0,
							display: "flex",
							alignItems: "center",
						},
						"& .MuiTablePagination-select": {
							display: "flex",
							alignItems: "center",
						},
						"& .MuiTablePagination-displayedRows": {
							margin: 0,
							display: "flex",
							alignItems: "center",
						},
						"& .MuiTablePagination-actions": {
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							ml: 2,
						},
					}}
				/>
			</Paper>
		</Box>
	);
};

const FilePreviewDialog = ({ open, onClose, attachments = [], title = "File Previewer" }) => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewData, setPreviewData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [downloading, setDownloading] = useState(false);

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
				size: null,
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
			case "doc":
			case "docx":
				return "primary";
			default:
				return "default";
		}
	};

	// Robust download handler
	const handleDownload = async (file) => {
		setDownloading(true);
		try {
			// Fetch the file as a blob
			const response = await fetch(file.url);
			
			if (!response.ok) {
				throw new Error(`Failed to download file: ${response.status}`);
			}

			const blob = await response.blob();
			
			// Create a temporary URL for the blob
			const blobUrl = window.URL.createObjectURL(blob);
			
			// Create a temporary anchor element and trigger download
			const link = document.createElement('a');
			link.href = blobUrl;
			link.download = file.name;
			link.style.display = 'none';
			
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			
			// Clean up the blob URL after a short delay
			setTimeout(() => {
				window.URL.revokeObjectURL(blobUrl);
			}, 100);
			
		} catch (err) {
			console.error('Download error:', err);
			// Fallback: open in new tab if blob download fails
			window.open(file.url, '_blank');
		} finally {
			setDownloading(false);
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
					setLoading(false);
					break;

				case "doc":
				case "docx":
					setPreviewData({ type: "doc", url: file.url, fileName: file.name });
					setLoading(false);
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
					setLoading(false);
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
					setLoading(false);
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
					setLoading(false);
					break;

				case "excel":
					setPreviewData({ type: "excel", url: file.url, fileName: file.name });
					setLoading(false);
					break;

				default:
					setError("Unsupported file type");
					setLoading(false);
			}
		} catch (err) {
			setError("Failed to load file preview");
			setLoading(false);
		}
	};

	useEffect(() => {
		if (open && fileList.length > 0) {
			handleFileSelect(fileList[0]);
		}
		if (!open) {
			setSelectedFile(null);
			setPreviewData(null);
			setError(null);
		}
	}, [open, attachments]);

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
			case "doc":
			case "docx":
				return <DocumentPreview url={previewData.url} fileName={previewData.fileName} />;

			case "excel":
				return <AdvancedExcelPreview url={previewData.url} fileName={previewData.fileName} />;

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
								backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : theme.palette.grey[50],
								color: theme.palette.text.primary,
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
												backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : theme.palette.grey[100],
											}}
										>
											{header}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{previewData.data.slice(1).map((row, rowIndex) => (
									<TableRow 
										key={rowIndex} 
										hover
										sx={{
											"&:hover": {
												bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
											},
										}}
									>
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
			<Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
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
									bgcolor: "primary.main",
									color: "primary.contrastText",
									"&:hover": {
										bgcolor: "primary.dark",
									},
									"& .MuiChip-root": {
										borderColor: "primary.contrastText",
										color: "primary.contrastText",
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
			sx={{
				"& .MuiDialog-container": {
					"& .MuiPaper-root": {
						maxWidth: "1600px",
					},
				},
			}}
		>
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
						flexShrink: 0,
					}}
				>
					<Typography variant="h6">{title}</Typography>
					<IconButton onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
			)}

			<DialogContent sx={{ p: 0, display: "flex", height: "calc(100% - 64px)", overflow: "hidden" }}>
				{isMobile && (
					<Drawer
						variant="temporary"
						open={mobileOpen}
						onClose={() => setMobileOpen(false)}
						ModalProps={{
							keepMounted: true,
							sx: { zIndex: theme.zIndex.modal + 1 }
						}}
						PaperProps={{
							sx: { bgcolor: "background.paper" },
						}}
					>
						{sidebarContent}
					</Drawer>
				)}

				{!isMobile && (
					<Box
						sx={{
							borderRight: 1,
							borderColor: "divider",
							flexShrink: 0,
							height: "100%",
							overflow: "hidden",
						}}
					>
						{sidebarContent}
					</Box>
				)}

				<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
					{selectedFile && !isMobile && previewData?.type !== "excel" && previewData?.type !== "doc" && previewData?.type !== "docx" && (
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								p: 2,
								borderBottom: 1,
								borderColor: "divider",
								bgcolor: "background.paper",
								flexShrink: 0,
							}}
						>
							<Box>
								<Typography variant="h6" noWrap>
									{selectedFile.name}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{selectedFile.type.toUpperCase()} File
								</Typography>
							</Box>
							<Button
								variant="contained"
								color="primary"
								startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
								onClick={() => handleDownload(selectedFile)}
								disabled={downloading}
							>
								{downloading ? "Downloading..." : "Download"}
							</Button>
						</Box>
					)}

					<Box
						sx={{
							flexGrow: 1,
							overflow: "hidden",
							bgcolor: "background.default",
							height: "100%",
						}}
					>
						{renderPreview()}
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

const Preview = ({ attachments = [], open, setOpen }) => {
	return <FilePreviewDialog open={open} onClose={() => setOpen(false)} attachments={attachments} title="Ticket Attachments" />;
};

export default Preview;

// import React, { useState, useEffect, useMemo } from "react";
// import { Dialog, DialogTitle, DialogContent, Box, List, ListItem, ListItemButton, ListItemText, Typography, IconButton, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, useMediaQuery, Drawer, AppBar, Toolbar, Divider, Chip, Button, Tabs, Tab, TextField, InputAdornment, TablePagination, Tooltip } from "@mui/material";
// import { Close as CloseIcon, DescriptionRounded as DescriptionIcon , InsertDriveFile as FileIcon, Image as ImageIcon, VideoFile as VideoIcon, PictureAsPdf as PdfIcon, Code as CodeIcon, TableChart as TableIcon, Menu as MenuIcon, Description as TextIcon, Search as SearchIcon, FilterList as FilterIcon, Download as DownloadIcon } from "@mui/icons-material";
// import * as XLSX from "xlsx";

// const getFileIcon = (type) => {
// 	switch (type) {
// 		case "pdf":
// 			return <PdfIcon color="error" />;
// 		case "image":
// 			return <ImageIcon color="success" />;
// 		case "video":
// 			return <VideoIcon color="secondary" />;
// 		case "json":
// 			return <CodeIcon color="info" />;
// 		case "text":
// 			return <TextIcon color="primary" />;
// 		case "doc":
// 			case "docx":
//         case "docs":
// 			return <DescriptionIcon color="primary" />;
// 		case "excel":
// 			return <TableIcon color="warning" />;
// 		default:
// 			return <FileIcon color="action" />;
// 	}
// };

// const getFileType = (filename) => {
// 	const ext = filename.split(".").pop().toLowerCase();
// 	switch (ext) {
// 		case "pdf":
// 			return "pdf";
// 		case "jpg":
// 		case "jpeg":
// 		case "png":
// 		case "gif":
// 		case "webp":
// 		case "svg":
// 			return "image";
// 		case "mp4":
// 		case "webm":
// 		case "ogg":
// 		case "avi":
// 		case "mov":
// 			return "video";
// 		case "json":
// 			return "json";
// 		case "txt":
// 		case "log":
// 		case "md":
// 			return "text";
// 		case "csv":
// 			return "csv";
// 		case "xls":
// 		case "xlsx":
// 			return "excel";
// 		default:
// 			return "unknown";
// 	}
// };

// // Advanced Excel Preview Component
// const AdvancedExcelPreview = ({ url, fileName }) => {
// 	const theme = useTheme();
// 	const [workbook, setWorkbook] = useState(null);
// 	const [sheets, setSheets] = useState([]);
// 	const [activeSheet, setActiveSheet] = useState(0);
// 	const [sheetData, setSheetData] = useState([]);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState(null);
// 	const [searchQuery, setSearchQuery] = useState("");
// 	const [page, setPage] = useState(0);
// 	const [rowsPerPage, setRowsPerPage] = useState(25);
// 	const [stats, setStats] = useState({ rows: 0, cols: 0, sheets: 0 });
// 	const [retryCount, setRetryCount] = useState(0);

// 	useEffect(() => {
// 		loadExcelFile();
// 	}, [url]);

// 	useEffect(() => {
// 		if (workbook && sheets.length > 0 && sheets[activeSheet]) {
// 			processSheet(sheets[activeSheet]);
// 		}
// 	}, [activeSheet, workbook, sheets]);

// 	const loadExcelFile = async (isRetry = false) => {
// 		if (!isRetry) {
// 			setLoading(true);
// 		}
// 		setError(null);

// 		// Add delay for retry attempts
// 		if (isRetry && retryCount > 0) {
// 			await new Promise(resolve => setTimeout(resolve, 1000));
// 		}

// 		try {
// 			// Validate URL
// 			if (!url || typeof url !== 'string') {
// 				throw new Error("Invalid file URL");
// 			}

// 			const response = await fetch(url, {
// 				method: 'GET',
// 				headers: {
// 					'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
// 				},
// 			});

// 			if (!response.ok) {
// 				throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
// 			}

// 			// Check content type
// 			const contentType = response.headers.get('content-type');
// 			console.log('Content-Type:', contentType);

// 			const arrayBuffer = await response.arrayBuffer();

// 			// Validate arrayBuffer
// 			if (!arrayBuffer || arrayBuffer.byteLength === 0) {
// 				throw new Error("Empty file received");
// 			}

// 			console.log('File size:', arrayBuffer.byteLength, 'bytes');

// 			// Try to read the workbook with error handling
// 			let wb;
// 			try {
// 				wb = XLSX.read(arrayBuffer, {
// 					type: "array",
// 					cellStyles: true,
// 					cellDates: true,
// 					cellNF: true,
// 					raw: false,
// 				});
// 			} catch (xlsxError) {
// 				console.error('XLSX parsing error:', xlsxError);
// 				throw new Error("Failed to parse Excel file. File may be corrupted or in an unsupported format.");
// 			}

// 			// Validate workbook
// 			if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
// 				throw new Error("No sheets found in the Excel file");
// 			}

// 			console.log('Sheets found:', wb.SheetNames);

// 			setWorkbook(wb);
// 			setSheets(wb.SheetNames);
// 			setStats({
// 				sheets: wb.SheetNames.length,
// 				rows: 0,
// 				cols: 0,
// 			});

// 			// Process first sheet
// 			if (wb.SheetNames.length > 0) {
// 				await processSheetSafely(wb, wb.SheetNames[0]);
// 			}

// 			setRetryCount(0); // Reset retry count on success
// 		} catch (err) {
// 			console.error("Excel loading error:", err);

// 			// Auto-retry logic for initial load
// 			if (!isRetry && retryCount < 2) {
// 				console.log(`Auto-retrying... (attempt ${retryCount + 1})`);
// 				setRetryCount(prev => prev + 1);
// 				setTimeout(() => loadExcelFile(true), 1500);
// 				return;
// 			}

// 			setError(err.message || "Failed to load Excel file. Please try again.");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const processSheetSafely = async (wb, sheetName) => {
// 		try {
// 			const worksheet = wb.Sheets[sheetName];
// 			if (!worksheet) {
// 				throw new Error(`Sheet "${sheetName}" not found`);
// 			}

// 			// Check if sheet has any data
// 			if (!worksheet['!ref']) {
// 				console.warn('Empty sheet detected');
// 				setSheetData([]);
// 				setStats((prev) => ({
// 					...prev,
// 					rows: 0,
// 					cols: 0,
// 				}));
// 				return;
// 			}

// 			// Get range of cells
// 			const range = XLSX.utils.decode_range(worksheet["!ref"]);
// 			const data = [];


// 			// Extract data with proper formatting
// 			for (let R = range.s.r; R <= range.e.r; R++) {
// 				const row = [];
// 				for (let C = range.s.c; C <= range.e.c; C++) {
// 					const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
// 					const cell = worksheet[cellAddress];

// 					if (cell) {
// 						// Handle different cell types
// 						let value = cell.v;

// 						try {
// 							// Format dates
// 							if (cell.t === "d") {
// 								value = cell.w || new Date(cell.v).toLocaleDateString();
// 							}
// 							// Format numbers with proper precision
// 							else if (cell.t === "n" && cell.w) {
// 								value = cell.w;
// 							}
// 							// Handle formulas
// 							else if (cell.f) {
// 								value = cell.v !== undefined ? cell.v : `=${cell.f}`;
// 							}
// 						} catch (formatError) {
// 							console.warn('Cell formatting error:', formatError);
// 							value = cell.v;
// 						}

// 						row.push({
// 							value: value !== undefined && value !== null ? String(value) : "",
// 							type: cell.t || "s",
// 							style: cell.s,
// 						});
// 					} else {
// 						row.push({ value: "", type: "z" });
// 					}
// 				}
// 				data.push(row);
// 			}

// 			if (data.length === 0) {
// 				console.warn('No data extracted from sheet');
// 			}

// 			setSheetData(data);
// 			setStats((prev) => ({
// 				...prev,
// 				rows: data.length,
// 				cols: data[0]?.length || 0,
// 			}));
// 			setPage(0);

// 			console.log('Sheet processed successfully:', data.length, 'rows');
// 		} catch (err) {
// 			console.error("Sheet processing error:", err);
// 			throw new Error("Failed to process sheet data: " + err.message);
// 		}
// 	};

// 	const processSheet = (sheetName) => {
// 		if (!workbook || !sheetName) {
// 			console.error('Invalid workbook or sheet name');
// 			return;
// 		}

// 		try {
// 			processSheetSafely(workbook, sheetName);
// 		} catch (err) {
// 			console.error('Error in processSheet:', err);
// 			setError("Failed to process sheet: " + err.message);
// 		}
// 	};

// 	const handleSheetChange = (event, newValue) => {
// 		setActiveSheet(newValue);
// 		setSearchQuery("");
// 		setPage(0);
// 	};

// 	const handleChangePage = (event, newPage) => {
// 		setPage(newPage);
// 	};

// 	const handleChangeRowsPerPage = (event) => {
// 		setRowsPerPage(parseInt(event.target.value, 10));
// 		setPage(0);
// 	};

// 	const handleRetry = () => {
// 		setRetryCount(0);
// 		loadExcelFile();
// 	};

// 	// Filter data based on search query
// 	const filteredData = useMemo(() => {
// 		const dataOnly = sheetData.slice(1); // remove header
// 		if (!searchQuery.trim()) return dataOnly;

// 		return dataOnly.filter((row) =>
// 			row.some((cell) => (cell.value || "").toString().toLowerCase().includes(searchQuery.toLowerCase()))
// 		);
// 	}, [sheetData, searchQuery]);


// 	// Paginate data
// 	const paginatedData = useMemo(() => {
// 		const start = page * rowsPerPage;
// 		const end = start + rowsPerPage;
// 		return filteredData.slice(start, end);
// 	}, [filteredData, page, rowsPerPage]);

// 	const getCellStyle = (cell, isHeader) => {
// 		const baseStyle = {
// 			whiteSpace: "nowrap",
// 			maxWidth: "300px",
// 			overflow: "hidden",
// 			textOverflow: "ellipsis",
// 			fontSize: "0.875rem",
// 			px: 2,
// 			py: 1.5,
// 		};

// 		if (isHeader) {
// 			return {
// 				...baseStyle,
// 				fontWeight: 600,
// 				bgcolor: theme.palette.mode === "dark" ? "#1a1a1a" : "#ffffff",
// 				borderBottom: 2,
// 				borderColor: "divider",
// 			};
// 		}

// 		// Number alignment
// 		if (cell.type === "n") {
// 			return { ...baseStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" };
// 		}

// 		return baseStyle;
// 	};

// 	if (loading) {
// 		return (
// 			<Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" sx={{ p: 4 }}>
// 				<CircularProgress size={48} thickness={4} />
// 				<Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
// 					Loading Excel file...
// 				</Typography>
// 				<Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
// 					{retryCount > 0 ? `Retrying (attempt ${retryCount + 1})...` : 'Processing spreadsheet data'}
// 				</Typography>
// 			</Box>
// 		);
// 	}

// 	if (error) {
// 		return (
// 			<Alert severity="error" sx={{ m: 3 }} icon={<TableIcon />}>
// 				<Typography variant="h6" gutterBottom>
// 					Unable to Load Excel File
// 				</Typography>
// 				<Typography variant="body2" sx={{ mb: 2 }}>
// 					{error}
// 				</Typography>
// 				<Box sx={{ display: 'flex', gap: 1 }}>
// 					<Button size="small" variant="contained" onClick={handleRetry}>
// 						Retry
// 					</Button>
// 					<Typography variant="caption" color="text.secondary" sx={{ ml: 2, alignSelf: 'center' }}>
// 						Attempts: {retryCount}
// 					</Typography>
// 				</Box>
// 			</Alert>
// 		);
// 	}

// 	if (!sheetData || sheetData.length === 0) {
// 		return (
// 			<Alert severity="info" sx={{ m: 3 }}>
// 				<Typography variant="h6">Empty Spreadsheet</Typography>
// 				<Typography variant="body2">This Excel file doesn't contain any data.</Typography>
// 			</Alert>
// 		);
// 	}

// 	const headers = sheetData.length > 0 ? sheetData[0] : [];
// 	const dataRows = sheetData.slice(1); // skip first row (header)

// 	return (
// 		<Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.default" }}>
// 			{/* Header with Tabs and Controls - Fixed, not scrollable */}
// 			<Box
// 				sx={{
// 					borderBottom: 1,
// 					borderColor: "divider",
// 					bgcolor: "background.paper",
// 					flexShrink: 0,
// 				}}
// 			>
// 				{/* Stats Bar */}
// 				<Box
// 					sx={{
// 						px: 3,
// 						py: 1.5,
// 						display: "flex",
// 						alignItems: "center",
// 						gap: 3,
// 						borderBottom: 1,
// 						borderColor: "divider",
// 						bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
// 					}}
// 				>
// 					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
// 						<TableIcon fontSize="small" color="warning" />
// 						<Typography variant="body2" fontWeight={600}>
// 							{fileName}
// 						</Typography>
// 					</Box>
// 					<Divider orientation="vertical" flexItem />
// 					<Chip label={`${stats.sheets} Sheet${stats.sheets > 1 ? "s" : ""}`} size="small" color="primary" variant="outlined" />
// 					<Chip label={`${stats.rows.toLocaleString()} Rows`} size="small" color="success" variant="outlined" />
// 					<Chip label={`${stats.cols} Columns`} size="small" color="info" variant="outlined" />
// 				</Box>

// 				{/* Sheet Tabs */}
// 				<Tabs value={activeSheet} onChange={handleSheetChange} variant="scrollable" scrollButtons="auto" sx={{ px: 2 }}>
// 					{sheets.map((sheet, index) => (
// 						<Tab key={index} label={sheet} sx={{ textTransform: "none", fontWeight: 500, minHeight: 48 }} />
// 					))}
// 				</Tabs>

// 				{/* Search Bar */}
// 				<Box sx={{ p: 2 }}>
// 					<TextField
// 						fullWidth
// 						size="small"
// 						placeholder="Search in spreadsheet..."
// 						value={searchQuery}
// 						onChange={(e) => {
// 							setSearchQuery(e.target.value);
// 							setPage(0);
// 						}}
// 						InputProps={{
// 							startAdornment: (
// 								<InputAdornment position="start">
// 									<SearchIcon fontSize="small" />
// 								</InputAdornment>
// 							),
// 							endAdornment: searchQuery && (
// 								<InputAdornment position="end">
// 									<IconButton size="small" onClick={() => setSearchQuery("")}>
// 										<CloseIcon fontSize="small" />
// 									</IconButton>
// 								</InputAdornment>
// 							),
// 						}}
// 						sx={{
// 							"& .MuiOutlinedInput-root": {
// 								bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
// 							},
// 						}}
// 					/>
// 				</Box>
// 			</Box>

// 			{/* Table Container - Scrollable */}
// 			<Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
// 				<TableContainer
// 					sx={{
// 						height: "100%",
// 						maxHeight: "100%",
// 					}}
// 				>
// 					<Table stickyHeader size="small" sx={{ tableLayout: "auto" }}>
// 						<TableHead>
// 							<TableRow>
// 								{headers.map((cell, index) => (
// 									<TableCell key={index} sx={getCellStyle(cell, true)}>
// 										<Tooltip title={cell.value} placement="top">
// 											<span>{cell.value || `Column ${index + 1}`}</span>
// 										</Tooltip>
// 									</TableCell>
// 								))}
// 							</TableRow>
// 						</TableHead>
// 						<TableBody>
// 							{paginatedData.map((row, rowIndex) => (
// 								<TableRow
// 									key={page * rowsPerPage + rowIndex}
// 									hover
// 									sx={{
// 										"&:hover": {
// 											bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
// 										},
// 									}}
// 								>
// 									{row.map((cell, cellIndex) => (
// 										<TableCell key={cellIndex} sx={getCellStyle(cell, false)}>
// 											<Tooltip title={cell.value} placement="top" enterDelay={500}>
// 												<span>{cell.value}</span>
// 											</Tooltip>
// 										</TableCell>
// 									))}
// 								</TableRow>
// 							))}
// 						</TableBody>
// 					</Table>
// 				</TableContainer>
// 			</Box>

// 			{/* Pagination - Fixed at bottom */}
// 			<Paper
// 				elevation={0}
// 				sx={{
// 					borderTop: 1,
// 					borderColor: "divider",
// 					bgcolor: "background.paper",
// 					flexShrink: 0,
// 				}}
// 			>
// 				<TablePagination
// 					component="div"
// 					count={filteredData.length - 1}
// 					page={page}
// 					onPageChange={handleChangePage}
// 					rowsPerPage={rowsPerPage}
// 					onRowsPerPageChange={handleChangeRowsPerPage}
// 					rowsPerPageOptions={[10, 25, 50, 100]}
// 					labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count.toLocaleString() : `more than ${to}`} rows`}
// 					sx={{
// 						"& .MuiTablePagination-toolbar": {
// 							minHeight: 56,
// 							display: "flex",
// 							alignItems: "center",
// 							px: 2,
// 							justifyContent: 'flex-end'
// 						},
// 						"& .MuiTablePagination-spacer": {
// 							flex: "none",
// 						},
// 						"& .MuiTablePagination-selectLabel": {
// 							margin: 0,
// 							display: "flex",
// 							alignItems: "center",
// 						},
// 						"& .MuiTablePagination-select": {
// 							display: "flex",
// 							alignItems: "center",
// 						},
// 						"& .MuiTablePagination-displayedRows": {
// 							margin: 0,
// 							display: "flex",
// 							alignItems: "center",
// 						},
// 						"& .MuiTablePagination-actions": {
// 							display: "flex",
// 							alignItems: "center",
// 							gap: 0.5,
// 							ml: 2,
// 						},
// 					}}
// 				/>
// 			</Paper>
// 		</Box>
// 	);
// };

// const FilePreviewDialog = ({ open, onClose, attachments = [], title = "File Previewer" }) => {
// 	const [selectedFile, setSelectedFile] = useState(null);
// 	const [previewData, setPreviewData] = useState(null);
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState(null);
// 	const [mobileOpen, setMobileOpen] = useState(false);

// 	const theme = useTheme();
// 	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

// 	const processAttachments = (attachments) => {
// 		if (!attachments || !Array.isArray(attachments)) return [];

// 		return attachments.map((url, index) => {
// 			const fileName = url.split("/").pop() || `file_${index + 1}`;
// 			const fileType = getFileType(fileName);

// 			return {
// 				id: index + 1,
// 				name: fileName,
// 				type: fileType,
// 				url: url,
// 				size: null,
// 			};
// 		});
// 	};

// 	const fileList = processAttachments(attachments);

// 	const getFileTypeColor = (type) => {
// 		switch (type) {
// 			case "pdf":
// 				return "error";
// 			case "image":
// 				return "success";
// 			case "video":
// 				return "secondary";
// 			case "json":
// 				return "info";
// 			case "text":
// 				return "primary";
// 			case "csv":
// 			case "excel":
// 				return "warning";
//             case "doc":
// 			case "docx":
// 				return "primary";
// 			default:
// 				return "default";
			
// 		}
// 	};

// 	const handleFileSelect = async (file) => {
// 		setSelectedFile(file);
// 		setPreviewData(null);
// 		setError(null);
// 		setLoading(true);
// 		setMobileOpen(false);

// 		try {
// 			const fileType = file.type || getFileType(file.name);

// 			switch (fileType) {
// 				case "pdf":
// 				case "image":
// 				case "video":
// 					setPreviewData({ type: fileType, url: file.url });
// 					setLoading(false);
// 					break;

// 				case "json":
// 					try {
// 						const response = await fetch(file.url);
// 						const jsonData = await response.json();
// 						setPreviewData({
// 							type: "json",
// 							content: JSON.stringify(jsonData, null, 2),
// 						});
// 					} catch (err) {
// 						setError("Failed to load JSON file");
// 					}
// 					setLoading(false);
// 					break;

// 				case "text":
// 					try {
// 						const response = await fetch(file.url);
// 						const textData = await response.text();
// 						setPreviewData({
// 							type: "text",
// 							content: textData,
// 						});
// 					} catch (err) {
// 						setError("Failed to load text file");
// 					}
// 					setLoading(false);
// 					break;

// 				case "csv":
// 					try {
// 						const response = await fetch(file.url);
// 						const csvText = await response.text();
// 						const rows = csvText.split("\n").map((row) => row.split(","));
// 						setPreviewData({ type: "table", data: rows });
// 					} catch (err) {
// 						setError("Failed to load CSV file");
// 					}
// 					setLoading(false);
// 					break;

// 				case "excel":
// 					// For Excel, we use the AdvancedExcelPreview component
// 					setPreviewData({ type: "excel", url: file.url, fileName: file.name });
// 					setLoading(false);
// 					break;

// 				default:
// 					setError("Unsupported file type");
// 					setLoading(false);
// 			}
// 		} catch (err) {
// 			setError("Failed to load file preview");
// 			setLoading(false);
// 		}
// 	};

// 	const renderPreview = () => {
// 		if (loading) {
// 			return (
// 				<Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
// 					<CircularProgress />
// 					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
// 						Loading preview...
// 					</Typography>
// 				</Box>
// 			);
// 		}

// 		if (error) {
// 			return (
// 				<Alert
// 					severity="error"
// 					sx={{ m: 2 }}
// 					action={
// 						<IconButton aria-label="close" color="inherit" size="small" onClick={() => setError(null)}>
// 							<CloseIcon fontSize="inherit" />
// 						</IconButton>
// 					}
// 				>
// 					{error}
// 				</Alert>
// 			);
// 		}

// 		if (!previewData) {
// 			return (
// 				<Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
// 					<FileIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
// 					<Typography variant="h6" color="text.secondary">
// 						Select a file to preview
// 					</Typography>
// 					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
// 						{fileList.length} file{fileList.length !== 1 ? "s" : ""} available
// 					</Typography>
// 				</Box>
// 			);
// 		}

// 		switch (previewData.type) {
// 			case "doc":
// 				case "docx":
// 				return (
// 					<Box sx={{ height: "100%", position: "relative" }}>
// 						<iframe
// 							src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewData?.url)}`}
// 							width="100%"
// 							height="600px"
// 							style={{ border: "none" }}
// 						/>
// 					</Box>
// 				);
// 			case "excel":
// 				return <AdvancedExcelPreview url={previewData.url} fileName={previewData.fileName} />;

// 			case "pdf":
// 				return (
// 					<Box sx={{ height: "100%", position: "relative" }}>
// 						<iframe src={previewData.url} width="100%" height="100%" style={{ border: "none" }} title="PDF Preview" />
// 					</Box>
// 				);

// 			case "image":
// 				return (
// 					<Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2 }}>
// 						<img
// 							src={previewData.url}
// 							alt="Preview"
// 							style={{
// 								maxWidth: "100%",
// 								maxHeight: "100%",
// 								objectFit: "contain",
// 								borderRadius: theme.shape.borderRadius,
// 							}}
// 							onError={(e) => {
// 								e.target.style.display = "none";
// 								setError("Failed to load image");
// 							}}
// 						/>
// 					</Box>
// 				);

// 			case "video":
// 				return (
// 					<Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{ p: 2 }}>
// 						<video
// 							controls
// 							style={{
// 								maxWidth: "100%",
// 								maxHeight: "100%",
// 								borderRadius: theme.shape.borderRadius,
// 							}}
// 							onError={() => setError("Failed to load video")}
// 						>
// 							<source src={previewData.url} type="video/mp4" />
// 							Your browser does not support the video tag.
// 						</video>
// 					</Box>
// 				);

// 			case "json":
// 			case "text":
// 				return (
// 					<Box sx={{ height: "100%", overflow: "auto" }}>
// 						<pre
// 							style={{
// 								fontFamily: "monospace",
// 								fontSize: "14px",
// 								lineHeight: "1.5",
// 								padding: "16px",
// 								margin: 0,
// 								backgroundColor: theme.palette.grey[50],
// 								whiteSpace: "pre-wrap",
// 								wordBreak: "break-word",
// 								height: "100%",
// 								boxSizing: "border-box",
// 							}}
// 						>
// 							{previewData.content}
// 						</pre>
// 					</Box>
// 				);

// 			case "table":
// 				return (
// 					<TableContainer component={Paper} sx={{ height: "100%", overflow: "auto" }}>
// 						<Table stickyHeader size="small">
// 							<TableHead>
// 								<TableRow>
// 									{previewData.data[0]?.map((header, index) => (
// 										<TableCell
// 											key={index}
// 											sx={{
// 												fontWeight: "bold",
// 												backgroundColor: theme.palette.grey[100],
// 											}}
// 										>
// 											{header}
// 										</TableCell>
// 									))}
// 								</TableRow>
// 							</TableHead>
// 							<TableBody>
// 								{previewData.data.slice(1).map((row, rowIndex) => (
// 									<TableRow key={rowIndex} hover>
// 										{row.map((cell, cellIndex) => (
// 											<TableCell key={cellIndex}>{cell}</TableCell>
// 										))}
// 									</TableRow>
// 								))}
// 							</TableBody>
// 						</Table>
// 					</TableContainer>
// 				);

// 			default:
// 				return (
// 					<Alert severity="warning" sx={{ m: 2 }}>
// 						<Typography variant="h6">Unsupported file type</Typography>
// 						<Typography variant="body2">Cannot preview {selectedFile?.name}. File type is not supported.</Typography>
// 					</Alert>
// 				);
// 		}
// 	};

// 	const sidebarContent = (
// 		<Box
// 			sx={{
// 				width: isMobile ? 300 : 320,
// 				height: "100%",
// 				display: "flex",
// 				flexDirection: "column",
// 				bgcolor: "background.paper",
// 			}}
// 		>
// 			<Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
// 				<Typography variant="h6" gutterBottom>
// 					Files ({fileList.length})
// 				</Typography>
// 				{fileList.length === 0 && (
// 					<Typography variant="body2" color="text.secondary">
// 						No files to preview
// 					</Typography>
// 				)}
// 			</Box>

// 			<List sx={{ flexGrow: 1, overflow: "auto", p: 0 }}>
// 				{fileList.map((file) => (
// 					<ListItem key={file.id} disablePadding>
// 						<ListItemButton
// 							onClick={() => handleFileSelect(file)}
// 							selected={selectedFile?.id === file.id}
// 							sx={{
// 								py: 1.5,
// 								px: 2,
// 								"&.Mui-selected": {
// 									bgcolor: "primary.main",
// 									color: "primary.contrastText",
// 									"&:hover": {
// 										bgcolor: "primary.dark",
// 									},
// 								},
// 							}}
// 						>
// 							<Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>{getFileIcon(file.type)}</Box>
// 							<ListItemText
// 								primary={file.name}
// 								secondary={<Chip label={file.type.toUpperCase()} size="small" variant="outlined" color={getFileTypeColor(file.type)} sx={{ mt: 0.5 }} />}
// 								primaryTypographyProps={{
// 									noWrap: true,
// 									title: file.name,
// 									fontSize: "0.875rem",
// 								}}
// 								secondaryTypographyProps={{
// 									component: "div",
// 								}}
// 							/>
// 						</ListItemButton>
// 					</ListItem>
// 				))}
// 			</List>
// 		</Box>
// 	);

// 	if (!attachments || attachments.length === 0) {
// 		return null;
// 	}

// 	return (
// 		<Dialog
// 			open={open}
// 			onClose={onClose}
// 			maxWidth="xl"
// 			fullWidth
// 			fullScreen={isMobile}
// 			PaperProps={{
// 				sx: {
// 					height: isMobile ? "100%" : "90vh",
// 					maxHeight: "90vh",
// 					bgcolor: "background.default",
// 				},
// 			}}
// 			sx={{
// 				"& .MuiDialog-container": {
// 					"& .MuiPaper-root": {
// 						maxWidth: "1600px",
// 					},
// 				},
// 			}}
// 		>
// 			{isMobile && (
// 				<AppBar position="static" color="default" elevation={0}>
// 					<Toolbar>
// 						<IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
// 							<MenuIcon />
// 						</IconButton>
// 						<Typography variant="h6" sx={{ flexGrow: 1 }}>
// 							{title}
// 						</Typography>
// 						<IconButton edge="end" onClick={onClose}>
// 							<CloseIcon />
// 						</IconButton>
// 					</Toolbar>
// 				</AppBar>
// 			)}

// 			{!isMobile && (
// 				<DialogTitle
// 					sx={{
// 						display: "flex",
// 						justifyContent: "space-between",
// 						alignItems: "center",
// 						borderBottom: 1,
// 						borderColor: "divider",
// 						flexShrink: 0,
// 					}}
// 				>
// 					<Typography variant="h6">{title}</Typography>
// 					<IconButton onClick={onClose}>
// 						<CloseIcon />
// 					</IconButton>
// 				</DialogTitle>
// 			)}

// 			<DialogContent sx={{ p: 0, display: "flex", height: "calc(100% - 120px)", overflow: "hidden" }}>
// 				{/* Mobile Drawer */}
// 				{isMobile && (
// 					<Drawer
// 						variant="temporary"
// 						open={mobileOpen}
// 						onClose={() => setMobileOpen(false)}
// 						ModalProps={{
// 							keepMounted: true,
// 							sx: { zIndex: theme.zIndex.modal + 1 }
// 						}}
// 						PaperProps={{
// 							sx: { bgcolor: "background.paper" },
// 						}}
// 					>
// 						{sidebarContent}
// 					</Drawer>
// 				)}

// 				{/* Desktop Sidebar - Fixed, not scrollable */}
// 				{!isMobile && (
// 					<Box
// 						sx={{
// 							borderRight: 1,
// 							borderColor: "divider",
// 							flexShrink: 0,
// 							height: "100%",
// 							overflow: "hidden",
// 						}}
// 					>
// 						{sidebarContent}
// 					</Box>
// 				)}

// 				{/* Preview Area */}
// 				<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
// 					{selectedFile && !isMobile && previewData?.type !== "excel" && (
// 						<Box
// 							sx={{
// 								p: 2,
// 								borderBottom: 1,
// 								borderColor: "divider",
// 								bgcolor: "background.paper",
// 								flexShrink: 0,
// 							}}
// 						>
// 							<Typography variant="h6" noWrap>
// 								{selectedFile.name}
// 							</Typography>
// 							<Typography variant="body2" color="text.secondary">
// 								{selectedFile.type.toUpperCase()} File
// 							</Typography>
// 						</Box>
// 					)}

// 					<Box
// 						sx={{
// 							flexGrow: 1,
// 							overflow: "hidden",
// 							bgcolor: "background.default",
// 							height: "100%",
// 						}}
// 					>
// 						{renderPreview()}
// 					</Box>
// 				</Box>
// 			</DialogContent>
// 		</Dialog>
// 	);
// };

// const Preview = ({ attachments = [], open, setOpen }) => {
// 	return <FilePreviewDialog open={open} onClose={() => setOpen(false)} attachments={attachments} title="Ticket Attachments" />;
// };

// export default Preview;
