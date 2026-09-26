import React from "react";
import { Modal, Box, Typography, TextField, Button, Chip, Grid, Checkbox, FormControlLabel, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/CloseRounded";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useDelivery } from "../../../context/DeliveryProvider";

const paymentOptions = [
	{ id: "card", label: "Card", icon: <CreditCardIcon fontSize="small" /> },
	{
		id: "upi",
		label: "UPI",
		icon: <AccountBalanceWalletIcon fontSize="small" />,
	},
	{ id: "qr", label: "QR Code", icon: <QrCodeIcon fontSize="small" /> },
];

const ClientPay = ({ open, onClose, Ticketdata }) => {
	const { OrderNo, date, time, SrNo, ticketNo, description } = Ticketdata;
	const [selectedMethod, setSelectedMethod] = React.useState("card");
	const [loading, setLoading] = React.useState(false);
	const { editData } = useDelivery();

	const handlePayment = async () => {
		setLoading(true);
		try {
			await editData(SrNo, { PaymentStatus: "Paid" });
			setLoading(false);
			onClose();
		} catch (error) {
			console.log(`Error: ${error}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "1000px",
					maxWidth: "80vw",
					bgcolor: "#fff",
					boxShadow: 24,
					borderRadius: 3,
					overflow: "hidden",
					maxHeight: "90vh",
					display: "flex",
					flexDirection: "column",
					height: "600px",
					overflowY: { xs: "auto", md: "hidden" },
				}}
			>
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						p: 3,
						borderBottom: "1px solid #e0e0e0",
					}}
				>
					<Typography variant="h6" fontWeight="bold">
						Payment for Order #{OrderNo}
					</Typography>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>

				<Grid container height={"100%"}>
					{/* Left Section: Summary */}
					<Grid item xs={12} md={5}>
						<Box
							sx={{
								backgroundColor: "#f9f9f9",
								p: 3,
								borderRight: { md: "1px solid #e0e0e0" },
								height: { xs: "auto", md: "100%" },
							}}
						>
							<Typography variant="body2" color="textSecondary" gutterBottom>
								ORDER SUMMARY
							</Typography>
							<Typography variant="h5" fontWeight="bold" gutterBottom>
								{description}
							</Typography>
							<Box sx={{ mt: 2 }}>
								<Typography variant="body2">Date: {date}</Typography>
								<Typography variant="body2">Time: {time}</Typography>
								<Typography variant="body2">Ticket No: {ticketNo}</Typography>
							</Box>
						</Box>
					</Grid>

					{/* Right Section: Payment Form */}
					<Grid item xs={12} md={7} sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom fontWeight="medium">
							Payment Method
						</Typography>

						{/* Tabs / Chips */}
						<Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
							{paymentOptions.map((option) => (
								<Chip
									key={option.id}
									icon={option.icon}
									label={option.label}
									clickable
									color={selectedMethod === option.id ? "primary" : "default"}
									variant={selectedMethod === option.id ? "filled" : "outlined"}
									onClick={() => setSelectedMethod(option.id)}
									sx={{
										fontWeight: selectedMethod === option.id ? "bold" : "normal",
										cursor: "pointer",
										transition: "all 0.2s ease",
										px: 1,
									}}
								/>
							))}
						</Box>

						{/* Dynamic Form Based on Selected Method */}
						{selectedMethod === "card" && (
							<>
								<TextField label="Card Number" fullWidth margin="normal" variant="outlined" />
								<TextField label="Cardholder Name" fullWidth margin="normal" variant="outlined" />
								<Grid container spacing={2} sx={{ mt: 1 }}>
									<Grid item xs={6}>
										<TextField label="MM / YY" fullWidth variant="outlined" />
									</Grid>
									<Grid item xs={6}>
										<TextField label="CVV" fullWidth variant="outlined" />
									</Grid>
								</Grid>
								<FormControlLabel control={<Checkbox defaultChecked />} label="Save card details for future use" sx={{ mt: 2 }} />
							</>
						)}

						{selectedMethod === "upi" && <TextField label="Enter UPI ID" placeholder="e.g. user@bank" fullWidth margin="normal" variant="outlined" />}

						{selectedMethod === "qr" && (
							<Box
								sx={{
									textAlign: "center",
									py: 4,
									display: "flex",
									justifyContent: "center",
									flexDirection: "column",
								}}
							>
								<Typography variant="body1" gutterBottom>
									Scan the QR code to pay
								</Typography>
								<Box
									component="img"
									src="https://hexdocs.pm/qr_code/docs/qrcode.svg"
									alt="QR Code"
									sx={{
										width: "150px",
										height: "150px",
										mx: "auto",
										mb: 2,
										border: "1px solid #ddd",
										borderRadius: 1,
										bgcolor: "#fff",
									}}
								/>
								<Typography variant="caption" color="textSecondary">
									This is a demo QR code.
								</Typography>
							</Box>
						)}

						{/* Pay Now Button */}
						<Button
							onClick={handlePayment}
							variant="contained"
							fullWidth
							endIcon={loading ? <CircularProgress color="inherit" size={30} /> : <ArrowRightIcon />}
							sx={{
								mt: 3,
								py: 1.5,
								textTransform: "none",
								fontWeight: 600,
								borderRadius: 2,
								bgcolor: "primary.main",
								color: "white",
								"&:hover": {
									bgcolor: "primary.dark",
								},
							}}
						>
							{loading ? "  " : "Pay Now"}
						</Button>
					</Grid>
				</Grid>
			</Box>
		</Modal>
	);
};

export default ClientPay;
