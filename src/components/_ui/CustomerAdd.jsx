import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, IconButton, InputAdornment, Autocomplete, Drawer, Divider, Grid } from "@mui/material";
import { Camera, Mail } from "lucide-react";

export function CustomerRegistrationForm({ onSubmit = () => {}, onClose }) {
  const projectCodes = [
    { label: "PRJ001", code: "PRJ001" },
    { label: "PRJ002", code: "PRJ002" },
    { label: "PRJ003", code: "PRJ003" },
    { label: "PRJ004", code: "PRJ004" },
  ];

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    code: "",
    projectCode: null,
    firstName: "",
    middleName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    address: "",
    mobile: "",
    email: "",
    salary: "",
    pictureFile: null,
    picturePreview: null,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectCodeChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      projectCode: newValue,
    }));
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        pictureFile: file,
        picturePreview: previewUrl,
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (formData.picturePreview) {
        URL.revokeObjectURL(formData.picturePreview);
      }
    };
  }, [formData.picturePreview]);

  const handleReset = () => {
    setFormData({
      userId: "",
      code: "",
      projectCode: null,
      firstName: "",
      middleName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      address: "",
      mobile: "",
      email: "",
      salary: "",
      pictureFile: null,
      picturePreview: null,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    onSubmit(formData); // pass form data
    handleReset();
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" color="primary" gutterBottom sx={{ mb: 4, fontWeight: "medium" }}>
        Customer Registration
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ flexGrow: 1, overflow: "auto", pb: 10 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
              <Box sx={{ color: "error.main", mr: 1, fontSize: "1.2rem" }}>•</Box>
              <Typography variant="body2">UserId:</Typography>
            </Box>
            <TextField fullWidth size="small" name="userId" value={formData.userId} onChange={handleChange} variant="outlined" sx={{ bgcolor: "action.hover" }} />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
                  <Box sx={{ color: "error.main", mr: 1, fontSize: "1.2rem" }}>•</Box>
                  <Typography variant="body2">Code:</Typography>
                </Box>
                <TextField fullWidth size="small" name="code" value={formData.code} onChange={handleChange} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
                  <Box sx={{ color: "error.main", mr: 1, fontSize: "1.2rem" }}>•</Box>
                  <Typography variant="body2">Project Code:</Typography>
                </Box>
                <Autocomplete options={projectCodes} value={formData.projectCode} onChange={handleProjectCodeChange} renderInput={(params) => <TextField {...params} size="small" />} getOptionLabel={(option) => option.label || ""} isOptionEqualToValue={(option, value) => option?.code === value?.code} fullWidth disableClearable />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="body2" color="primary" gutterBottom>
              Click On Image To Upload Picture
            </Typography>
            <input type="file" accept="image/*" name="picture" style={{ display: "none" }} onChange={handlePictureUpload} id="upload-picture" />
            <Paper
              elevation={1}
              sx={{
                width: "100%",
                height: 150,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                bgcolor: "grey.100",
              }}
              component="label"
              htmlFor="upload-picture"
            >
              {formData.picturePreview ? <img src={formData.picturePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%" }} /> : <Camera size={48} color="#bdbdbd" />}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>
              First Name:
            </Typography>
            <TextField fullWidth size="small" name="firstName" value={formData.firstName} onChange={handleChange} variant="outlined" />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>
              Middle Name:
            </Typography>
            <TextField fullWidth size="small" name="middleName" value={formData.middleName} onChange={handleChange} variant="outlined" />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>
              Last Name:
            </Typography>
            <TextField fullWidth size="small" name="lastName" value={formData.lastName} onChange={handleChange} variant="outlined" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
              <Box sx={{ color: "error.main", mr: 1, fontSize: "1.2rem" }}>•</Box>
              <Typography variant="body2">Password:</Typography>
            </Box>
            <TextField fullWidth size="small" type="password" name="password" value={formData.password} onChange={handleChange} variant="outlined" sx={{ bgcolor: "action.hover" }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
              <Box sx={{ color: "error.main", mr: 1, fontSize: "1.2rem" }}>•</Box>
              <Typography variant="body2">Confirm Password:</Typography>
            </Box>
            <TextField fullWidth size="small" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} variant="outlined" />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              Address:
            </Typography>
            <TextField fullWidth size="small" name="address" value={formData.address} onChange={handleChange} variant="outlined" multiline rows={4} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Mobile No:
            </Typography>
            <TextField fullWidth size="small" name="mobile" value={formData.mobile} onChange={handleChange} variant="outlined" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Email ID:
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end">
                      <Mail size={16} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "background.paper",
          py: 2,
          mt: "auto",
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading} sx={{ minWidth: 120 }}>
          Save
        </Button>
        <Button variant="outlined" onClick={handleReset} sx={{ minWidth: 120 }}>
          Clear
        </Button>
      </Box>
    </Box>
  );
}

const CustomerAdd = ({ open = false, handleClose = () => {} }) => {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (open) {
      setShowForm(true);
    }
  }, [open]);

  const handleDrawerClose = () => {
    setShowForm(false);
    handleClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "40%",
          boxSizing: "border-box",
          borderRadius: 0,
        },
      }}
    >
      <CustomerRegistrationForm onSubmit={handleDrawerClose} onClose={handleDrawerClose} />
    </Drawer>
  );
};

export default CustomerAdd;
