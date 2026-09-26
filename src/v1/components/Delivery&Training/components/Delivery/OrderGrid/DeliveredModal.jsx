import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { styled } from "@mui/material/styles";
import { Calendar, X } from "lucide-react";
import { useDelivery } from "../../../../Delivery&Training/context/DeliveryProvider";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
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
const StyledDialogTitle = styled(DialogTitle)({ padding: "24px 24px 0 24px" });
const StyledDialogContent = styled(DialogContent)({
  padding: "16px 24px 24px",
});
const StyledDialogActions = styled(DialogActions)({
  padding: "0 24px 24px",
  gap: 12,
});

export default function DeliveredModal({ open, onClose, Ticketdata }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const { editData } = useDelivery();

  useEffect(() => {
    if (!open) return;
    const src = Ticketdata?.DeliveryDate;
    if (src) {
      const ist = dayjs.utc(src).tz("Asia/Kolkata");
      setSelectedDate(ist);
    } else {
      setSelectedDate(null);
    }
  }, [open, Ticketdata?.DeliveryDate]);

  const handleDateChange = useCallback((value) => {
    setSelectedDate(value);
  }, []);

  const handleSave = useCallback(() => {
    if (selectedDate?.isValid()) {
      const dateString = selectedDate.format("YYYY-MM-DD");

      editData(Ticketdata?.SrNo, {
        Status: "Delivered",
        DeliveryDate: dateString,
      });

      onClose();
      setSelectedDate(null);
    } else {
      alert("Please select a valid delivery date.");
    }
  }, [selectedDate, editData, Ticketdata?.SrNo, onClose]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!open) return null;

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delivery-dialog-title"
      PaperProps={{
        sx: { background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" },
      }}
    >
      <StyledDialogTitle id="delivery-dialog-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Schedule Delivery
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Select your preferred delivery date
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Calendar size={18} />
            <Typography variant="subtitle2" fontWeight={600}>
              Delivery Date
            </Typography>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              timezone="Asia/Kolkata"
              value={selectedDate}
              onChange={handleDateChange}
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "Select delivery date",
                  variant: "outlined",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      backgroundColor: "#f8fafc",
                      "&:hover": { backgroundColor: "#f1f5f9" },
                      "&.Mui-focused": { backgroundColor: "#ffffff" },
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </StyledDialogContent>

      <StyledDialogActions>
        <Button
          onClick={handleClose}
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
