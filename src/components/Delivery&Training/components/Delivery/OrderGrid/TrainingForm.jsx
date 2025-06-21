import React, { useState } from "react";
import { TextField, MenuItem, Select, FormControl, InputLabel, Button, Grid, Typography, Box, Drawer, IconButton, Divider, useTheme, useMediaQuery, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";

const trainingTypes = ["Technical", "Soft Skills", "Leadership"];
const trainingModes = ["Online", "Offline"];
const trainingByOptions = ["Internal Trainer", "External Trainer"];

export default function TrainingDrawer({ open, setOpen, onSave  }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    setOpen(null);
  };

  const handleSave = (formData) => {
    onSave(open?.row?.ticketNo, open?.field, [formData]);
  }

  return (
    <Drawer
      anchor="left"
      open={Boolean(open)}
      onClose={handleClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: isMobile ? "90%" : "30%",
          height: "100%",
          background: "linear-gradient(to bottom, #ffffff, #f7f9fc)",
          boxShadow: "2px 0px 20px rgba(0, 0, 0, 0.08)",
          overflowY: "auto",
          borderRadius: "0px ",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VerticalSplitIcon color="warning" fontSize="large" />
            <Typography
              variant="h5"
              component="h2"
              sx={{
                letterSpacing: "-0.5px",
                fontWeight: 500,
              }}
            >
              New Training Session
            </Typography>
          </Box>
          <IconButton onClick={handleClose} edge="end" color="default">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3, mt: 2 }} />
        <Form handleClose={handleClose} handleSave={handleSave} />
      </Box>
    </Drawer>
  );
}

const Form = ({ handleClose, handleSave }) => {
  const [formData, setFormData] = useState({
    date: null,
    projectCode: "",
    ticketNo: "",
    trainingType: "",
    trainingMode: "",
    trainingBy: "",
    attendees: "",
    startTime: null,
    endTime: null,
    details: "",
    schedule: {
      dateTime: null,
      zoomLink: ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (value) => {
    setFormData({ ...formData, date: value });
  };

  const handleStartTimeChange = (value) => {
    setFormData({ ...formData, startTime: value });
  };

  const handleEndTimeChange = (value) => {
    setFormData({ ...formData, endTime: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(formData);
    handleClose();
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Date */}
          <Grid item xs={12}>
            <DatePicker label="Date" sx={{ width: "100%" }} value={formData.date} onChange={handleDateChange} renderInput={(params) => <TextField {...params} fullWidth required />} />
          </Grid>

          {/* Project Code */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Project Code" name="projectCode" value={formData.projectCode} onChange={handleChange} required variant="outlined" />
          </Grid>

          {/* Ticket No */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Ticket No" name="ticketNo" value={formData.ticketNo} onChange={handleChange} required variant="outlined" />
          </Grid>

          {/* Training Type */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Training Type</InputLabel>
              <Select name="trainingType" value={formData.trainingType} onChange={handleChange} label="Training Type">
                {trainingTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Training Mode */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Training Mode</InputLabel>
              <Select name="trainingMode" value={formData.trainingMode} onChange={handleChange} label="Training Mode">
                {trainingModes.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {mode}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Training By */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Training By" name="trainingBy" value={formData.trainingBy} onChange={handleChange} required variant="outlined" />
          </Grid>

          {/* Attendees */}
          <Grid item xs={12}>
            <TextField fullWidth label="Attendees" name="attendees" value={formData.attendees} onChange={handleChange} required variant="outlined" />
          </Grid>

          {/* Start & End Time in same row */}
          <Grid item xs={12} sm={6}>
            <TimePicker label="Start Time" value={formData.startTime} onChange={handleStartTimeChange} renderInput={(params) => <TextField {...params} fullWidth required />} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TimePicker label="End Time" value={formData.endTime} onChange={handleEndTimeChange} renderInput={(params) => <TextField {...params} fullWidth required />} />
          </Grid>

          {/* Details */}
          <Grid item xs={12}>
            <TextField fullWidth label="Details" name="details" value={formData.details} onChange={handleChange} multiline rows={4} required variant="outlined" />
          </Grid>

          {/* Submit Button */}
          <Grid
            item
            xs={12}
            sx={{
              position: "absolute",
              bottom: 0,
              paddingBottom: "1rem",
              width: "calc(100% - 28px)",
            }}
          >
            <Button
              fullWidth
              variant="contained"
              color="warning"
              type="submit"
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Submit Training
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
