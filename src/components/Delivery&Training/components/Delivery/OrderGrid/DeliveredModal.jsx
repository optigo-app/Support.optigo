import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, Alert } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled } from "@mui/material/styles";
import { Truck, Calendar, X } from "lucide-react";
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import { useDelivery } from "../../../../Delivery&Training/context/DeliveryProvider";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const StyledDialog = styled(Dialog)(({ theme }) => ({
	"& .MuiDialog-paper": {
		borderRadius: 24,
		padding: 0,
		maxWidth: 480,
		width: "100%",
		boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15)",
	},
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
	padding: "24px 24px 0 24px",
	paddingBottom: 0,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
	padding: "24px",
	paddingTop: "16px",
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
	padding: "0 24px 24px 24px",
	gap: "12px",
}));

const HeaderIcon = styled(Box)(({ theme }) => ({
	backgroundColor: "#e3f2fd",
	borderRadius: "16px",
	padding: "12px",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	marginBottom: "16px",
}));

export default function DeliveredModal({ open, onClose, Ticketdata }) {
	const [selectedDate, setSelectedDate] = useState(null);
	const { editData } = useDelivery();

	useEffect(() => {
		if (open) {
			setSelectedDate(null);
		}
	}, [open]);

	const handleDateChange = (date) => {
		console.log("🚀 ~ handleDateChange ~ date:", date);
		setSelectedDate(date);
	};

	const handleSave = () => {
		if (selectedDate) {
			const istDate = dayjs(selectedDate).tz("Asia/Kolkata").format("YYYY-MM-DD");

			editData(Ticketdata?.SrNo, { DeliveryDate: istDate });
			onClose();
		} else {
			alert("Please select a delivery date.");
		}
	};

	return (
		<StyledDialog
			open={open}
			onClose={onClose}
			aria-labelledby="delivery-dialog-title"
			PaperProps={{
				sx: {
					background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
				},
			}}
		>
			<StyledDialogTitle id="delivery-dialog-title">
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box>
						<HeaderIcon>
							<DonutLargeRoundedIcon size={24} color="#1976d2" />
						</HeaderIcon>
						<Typography variant="h5" component="h2" fontWeight="600" color="text.primary">
							Schedule Delivery
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							Select your preferred delivery date
						</Typography>
					</Box>
					<IconButton
						onClick={onClose}
						sx={{
							color: "text.secondary",
							"&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
						}}
					>
						<X size={20} />
					</IconButton>
				</Box>
			</StyledDialogTitle>

			<StyledDialogContent>
				<Box sx={{ mb: 3 }}>
					<Box display="flex" alignItems="center" gap={1} mb={2}>
						<Calendar size={18} color="#666" />
						<Typography variant="subtitle2" fontWeight="600" color="text.primary">
							Delivery Date
						</Typography>
					</Box>

					<DatePicker
						value={selectedDate}
						onChange={handleDateChange}
						slotProps={{
							textField: {
								fullWidth: true,
								placeholder: "Select delivery date",
								variant: "outlined",
								sx: {
									"& .MuiOutlinedInput-root": {
										borderRadius: "16px",
										backgroundColor: "#f8fafc",
										"&:hover": {
											backgroundColor: "#f1f5f9",
										},
										"&.Mui-focused": {
											backgroundColor: "#ffffff",
										},
									},
								},
							},
						}}
					/>
				</Box>

				<Alert
					severity="info"
					sx={{
						borderRadius: "16px",
						backgroundColor: "#e3f2fd",
						border: "1px solid #bbdefb",
						"& .MuiAlert-icon": {
							color: "#1976d2",
						},
					}}
				>
					<Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
						Delivery Information
					</Typography>
					<Typography variant="caption" color="text.secondary">
						• Feature delivery: 1–3 business days after confirmation
						<br />• Deployment includes QA and release notes
						<br />• Email confirmation will follow once completed
					</Typography>
				</Alert>
			</StyledDialogContent>

			<StyledDialogActions>
				<Button
					onClick={onClose}
					variant="outlined"
					sx={{
						borderRadius: "16px",
						textTransform: "none",
						fontWeight: "500",
						flex: 1,
						py: 1.5,
						borderColor: "#e0e0e0",
						color: "#666",
						"&:hover": {
							borderColor: "#bdbdbd",
							backgroundColor: "#f5f5f5",
						},
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					disabled={!selectedDate}
					sx={{
						borderRadius: "16px",
						textTransform: "none",
						fontWeight: "600",
						flex: 1,
						py: 1.5,
						background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
						boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
						"&:hover": {
							background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
							boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
						},
						"&:disabled": {
							background: "#e0e0e0",
							boxShadow: "none",
						},
						color: "#fff",
						transition: "background-color 0.3s ease-in-out",
					}}
				>
					Confirm Delivery
				</Button>
			</StyledDialogActions>
		</StyledDialog>
	);
}
