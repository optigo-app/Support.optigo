import React, { useEffect, useState } from "react";
import { Box, Paper, TextField, Button, IconButton, Typography, ClickAwayListener, FormControl, FormLabel, Stack } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LinkIcon from "@mui/icons-material/Link";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CloseIcon from "@mui/icons-material/Close";
import { MailTemplate } from "../../../utils/helpers";

const GmailCompose = ({ orderdata, onClose }) => {
	const [showCc, setShowCc] = useState(false);
	const [showBcc, setShowBcc] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [formData, setFormData] = useState({
		to: "",
		cc: "",
		bcc: "",
		subject: "",
		body: "",
	});

	useEffect(() => {
		if (orderdata) {
			FetchOrderData();
		}
	}, [orderdata]);

	const FetchOrderData = async () => {
		const success = await MailTemplate(orderdata);
		console.log("Clipboard copy result:", success);
		setFormData((prev) => ({
			...prev,
			body: success || "",
		}));
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSend = () => {
		if (!formData.to || !formData.subject) {
			return;
		}
		console.log("Sending email:", formData);
		onClose();
	};

	if (isMinimized) {
		return (
			<Box
				sx={{
					position: "fixed",
					bottom: 0,
					right: 15,
					width: 256,
					bgcolor: "white",
					border: "1px solid #ccc",
					borderTopLeftRadius: 8,
					boxShadow: 10,
					zIndex: 9999,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						p: 1,
						borderBottom: "1px solid #eee",
						bgcolor: "#f9f9f9",
					}}
				>
					<Typography variant="body2" fontWeight="medium">
						New Message
					</Typography>
					<Box>
						<IconButton size="small" onClick={() => setIsMinimized(false)}>
							<MinimizeIcon fontSize="small" />
						</IconButton>
						<IconButton size="small" onClick={onClose}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				</Box>
			</Box>
		);
	}

	return (
		<ClickAwayListener onClickAway={() => setIsMinimized(true)}>
			<Paper
				elevation={15}
				sx={{
					position: "fixed",
					bottom: 15,
					right: 30,
					width: 540,
					height: 620,
					borderRadius: 3,
					overflow: "hidden",
					bgcolor: "white",
					zIndex: 9999,
					display: "flex",
					flexDirection: "column",
					boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)", // Custom shadow
				}}
			>
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						p: 1,
						borderBottom: "1px solid #eee",
						bgcolor: "#f9f9f9",
					}}
				>
					<Typography variant="body2" fontWeight="medium">
						New Message
					</Typography>
					<Box>
						<IconButton size="small" onClick={() => setIsMinimized(true)}>
							<MinimizeIcon fontSize="small" />
						</IconButton>
						<IconButton size="small" onClick={onClose}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				</Box>

				{/* Recipient Fields */}
				<Box sx={{ borderBottom: "1px solid #eee" }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							borderBottom: "1px solid #f0f0f0",
						}}
					>
						<FormControl sx={{ width: 70 }}>
							<FormLabel
								sx={{
									color: "text.secondary",
									px: 1,
									py: 1.5,
									fontSize: "15px",
								}}
							>
								To
							</FormLabel>
						</FormControl>
						<TextField fullWidth variant="standard" value={formData.to} onChange={(e) => handleInputChange("to", e.target.value)} placeholder="Recipients" sx={{ flexGrow: 1, px: 1 }} InputProps={{ disableUnderline: true }} />
						<Box sx={{ display: "flex", gap: 1, px: 1 }}>
							{!showCc && (
								<Button size="small" onClick={() => setShowCc(true)}>
									Cc
								</Button>
							)}
							{!showBcc && (
								<Button size="small" onClick={() => setShowBcc(true)}>
									Bcc
								</Button>
							)}
						</Box>
					</Box>

					{showCc && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								borderBottom: "1px solid #f0f0f0",
							}}
						>
							<FormControl sx={{ width: 70 }}>
								<FormLabel
									sx={{
										color: "text.secondary",
										px: 1,
										py: 1.5,
										fontSize: "15px",
									}}
								>
									Cc
								</FormLabel>
							</FormControl>
							<TextField fullWidth variant="standard" value={formData.cc} onChange={(e) => handleInputChange("cc", e.target.value)} placeholder="Carbon copy recipients" sx={{ flexGrow: 1, px: 1 }} InputProps={{ disableUnderline: true }} />
							<IconButton size="small" onClick={() => setShowCc(false)}>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>
					)}

					{showBcc && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								borderBottom: "1px solid #f0f0f0",
							}}
						>
							<FormControl sx={{ width: 70 }}>
								<FormLabel
									sx={{
										color: "text.secondary",
										px: 1,
										py: 1.5,
										fontSize: "15px",
									}}
								>
									Bcc
								</FormLabel>
							</FormControl>
							<TextField fullWidth variant="standard" value={formData.bcc} onChange={(e) => handleInputChange("bcc", e.target.value)} placeholder="Blind carbon copy recipients" sx={{ flexGrow: 1, px: 1 }} InputProps={{ disableUnderline: true }} />
							<IconButton size="small" onClick={() => setShowBcc(false)}>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>
					)}

					<Box sx={{ display: "flex", alignItems: "center" }}>
						<FormControl sx={{ width: 70 }}>
							<FormLabel
								sx={{
									color: "text.secondary",
									px: 1,
									py: 1.5,
									fontSize: "15px",
								}}
							>
								Subject
							</FormLabel>
						</FormControl>
						<TextField fullWidth variant="standard" value={formData.subject} onChange={(e) => handleInputChange("subject", e.target.value)} placeholder="Subject" sx={{ flexGrow: 1, px: 1 }} InputProps={{ disableUnderline: true }} />
					</Box>
				</Box>

				{/* Formatting Toolbar */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						px: 1,
						py: 0.1,
						borderBottom: "1px solid #eee",
						bgcolor: "#f9f9f9",
					}}
				></Box>

				<Box sx={{ flex: 1, p: 1 }}>
					<textarea
						value={formData.body}
						onChange={(e) => handleInputChange("body", e.target.value)}
						placeholder="Write your email here..."
						style={{
							width: "100%",
							minHeight: showCc && showBcc ? 300 : showCc || showBcc ? 350 : 400,
							outline: "none",
							fontSize: "0.875rem",
							lineHeight: 1.6,
							border: "1px solid transparent",
							padding: "8px",
							resize: "none",
							overflow: "auto",
							maxHeight: 250,
							fontFamily: "inherit",
							fontSize: "inherit",
							color: "inherit",
						}}
					/>
				</Box>

				{/* Footer Buttons */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						p: 1,
						borderTop: "1px solid #eee",
					}}
				>
					<Stack direction="row" spacing={1} alignItems="center">
						<Button
							variant="contained"
							startIcon={<SendIcon />}
							onClick={handleSend}
							sx={{
								textTransform: "none",
								borderRadius: 10,
								bgcolor: "primary.main",
								color: "#fff",
								":hover": {
									backgroundColor: "primary.dark",
								},
							}}
						>
							Send
						</Button>
						<Button
							variant="contained"
							sx={{
								textTransform: "none",
								borderRadius: 10,
								bgcolor: "primary.main",
								color: "#fff",
								":hover": {
									backgroundColor: "primary.dark",
								},
							}}
						>
							<MoreVertIcon />
						</Button>
						<IconButton size="small">
							<AttachFileIcon />
						</IconButton>
						<IconButton size="small">
							<LinkIcon />
						</IconButton>
						<IconButton size="small">
							<InsertEmoticonIcon />
						</IconButton>
						<IconButton size="small">
							<AccountBalanceWalletIcon />
						</IconButton>
					</Stack>
					<Stack direction="row" spacing={1}>
						<IconButton size="small">
							<DeleteOutlineIcon />
						</IconButton>
						<IconButton size="small">
							<MoreVertIcon />
						</IconButton>
					</Stack>
				</Box>
			</Paper>
		</ClickAwayListener>
	);
};

export default GmailCompose;
