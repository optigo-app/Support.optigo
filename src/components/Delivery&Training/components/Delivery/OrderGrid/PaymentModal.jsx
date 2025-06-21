import React, { useState } from "react";
import { Modal, Box, Typography, Card, CardContent, Divider, Grid, Avatar, IconButton, useTheme } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import QrCodeIcon from "@mui/icons-material/QrCodeScanner"; // For UPI QR Code
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseIcon from "@mui/icons-material/Close";
import { useDelivery } from "./../../../context/DeliveryProvider";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 480 },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  p: 3,
};

// Payment Methods
const paymentMethods = [
  {
    type: "Credit Card",
    description: "Pay securely with your credit card",
    icon: <CreditCardIcon fontSize="large" color="primary" />,
    value: "Credit Card",
  },
  {
    type: "Debit Card",
    description: "Use your domestic or international debit card",
    icon: <CreditCardIcon fontSize="large" color="success" />,
    value: "Debit Card",
  },
  {
    type: "Bank Transfer",
    description: "Direct bank account transfer",
    icon: <AccountBalanceIcon fontSize="large" color="secondary" />,
    value: "Bank Transfer",
  },
  {
    type: "UPI (BHIM UPI)",
    description: "Scan QR code to pay via UPI",
    icon: <QrCodeIcon fontSize="large" color="warning" />,
    value: "UPI",
  },
];

const PaymentMethodModal = ({ open, onClose, ticketData }) => {
  const theme = useTheme();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const { editData } = useDelivery();

  // Handle payment selection

  const handleEditClick = (...args) => {
    editData(...args);
  };

  const handleSelectPaymentMethod = (method) => {
    setSelectedMethod(method);
    setLoading(true);
    setTimeout(() => {
      handleEditClick(ticketData?.SrNo, { paymentMethod: method?.value });
      setLoading(false);
      onClose();
      setSelectedMethod(null);
    }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Header */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Select a Payment Method
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Choose your preferred way to pay for this order.
        </Typography>

        {/* Order Info Banner */}
        <Box
          sx={{
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f9f9f9",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Order: #{ticketData?.OrderNo || "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ticket No: {ticketData?.TicketNo || "N/A"} • Client: {ticketData?.ClientCode || "N/A"}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Payment Options Grid */}
        {!loading && (
          <Grid container spacing={2}>
            {paymentMethods.map((method, index) => (
              <Grid item xs={12} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: 4,
                      borderColor: "primary.main",
                    },
                  }}
                  onClick={() => handleSelectPaymentMethod(method)}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", p: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: "transparent",
                        mr: 2,
                        boxShadow: 1,
                      }}
                    >
                      {method.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {method.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {method.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PaymentSuccessfulModal key={open} onClose={onClose} />
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PaymentMethodModal;

const PaymentSuccessfulModal = ({ onClose }) => {
  return (
    <Box
      sx={{
        borderRadius: 3,
        p: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: { xs: "100%", sm: "auto" },
        bgcolor: "background.paper",
        zIndex: 1,
      }}
    >
      {/* Close Button */}
      <IconButton
        aria-label="close"
        sx={{
          position: "absolute",
          top: 3,
          right: 3,
        }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
      {/* Message */}
      <CheckCircleRoundedIcon
        color="success"
        sx={{
          fontSize: "7rem",
          mb: 2,
        }}
      />
      <Typography
        sx={{
          mt: 2,
          fontWeight: 600,
          fontSize: "1.2rem",
          color: "text.primary",
          textAlign: "center",
        }}
      >
        Payment request sent successfully!
      </Typography>
    </Box>
  );
};
