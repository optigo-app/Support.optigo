import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid, Paper, TextField, InputAdornment, Select, MenuItem, IconButton, Stack } from "@mui/material";
import { Add, FilterList } from "@mui/icons-material";
import CustomDualDatePicker from "../../../shared/ui/CustomDatePicker";
import { FilterMenu } from "../FilterMenu";
import AutocompleteComponent from "../../../shared/ui/Autocomplete";
import { CompanyMaster } from "../../../../constants/constants";
import { isAnyFilterActive } from "../../../../utils/deliveryUtils";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import DeliveryTabs from "../DeliveryTabs";
import AnalyticsDashboardCards from "./AnalyticsBoard";
import { Search } from "lucide-react";

const Dashboard = ({ dashboardData, onformToggle, greeting, LoggedUser, filters = null, setFilters = () => {}, isAdmin }) => {
  return (
    <>
      <Box
        sx={{
          zIndex: -1,
          position: "absolute",
          top: "-70px",
          left: "-70px",
        }}
        id="wavy-circle"
      ></Box>
      <Box sx={{ mb: 1, zIndex: 10 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
          <Box>
            <Typography
              variant="body1"
              sx={{
                marginBottom: -0.5,
                color: "rgb(45, 52, 54)",
                // mixBlendMode: "color-dodge",
                fontWeight: "600",
              }}
            >
              {greeting}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "text.primary",
                textTransform: "capitalize",
                fontWeight: 600,
                mb: 1,
              }}
            >
              {LoggedUser}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Track and manage all deliveries and training schedules.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <DeliveryTabs filters={filters} setFilters={setFilters} />
          </Box>
        </Box>
        <AnalyticsDashboardCards isClient={!isAdmin} dashboardData={dashboardData} />
        <FilterOptions isAdmin={isAdmin} onformToggle={onformToggle} filters={filters} setFilters={setFilters} />
      </Box>
    </>
  );
};

export default Dashboard;

function FilterOptions({ onformToggle, filters, setFilters, isAdmin }) {
  const [open, setOpen] = useState(false);
  const IsHasFilters = isAnyFilterActive(filters);
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateChange = (updatedFilters) => {
    handleFilterChange("date", updatedFilters);
  };
  const clearFilters = () => {
    setFilters({
      search: "",
      approval: "",
      projectCode: null,
      topicType: "",
      serviceType: [],
      onDemandOption: "",
      paymentMethod: [],
      paymentStatus: [],
      isFavorite: false,
      tagColor: "",
      date: {
        startDate: "",
        endDate: "",
        status: "",
      },
    });
  };

  return (
    <Paper elevation={0} sx={{ boxShadow: "none", border: "none", mb: 0, pt: 2, pb: 1 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Left side - Search and Filter */}
        <Grid item xs={12} md={6}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} width="100%">
            {isAdmin && (
              <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
                <Button
                  onClick={onformToggle}
                  variant="contained"
                  size="medium"
                  startIcon={<Add />}
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#ffde77",
                    color: "#856404",
                    "&:hover": {
                      backgroundColor: "#ffde77",
                      color: "#856404",
                    },
                  }}
                >
                  New Order
                </Button>
              </Box>
            )}
            <TextField
              placeholder="Search tickets..."
              size="small"
              sx={{ width: "50%" }}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Grid>

        {/* Right side - Action buttons */}
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            {IsHasFilters && (
              <IconButton sx={{ bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.main", color: "white" } }} color="primary" size="medium" onClick={clearFilters}>
                <TuneRoundedIcon />
              </IconButton>
            )}
            {isAdmin && <AutocompleteComponent isWantLabel={true} options={CompanyMaster} size="small" fullWidth={false} label={"Company Code"} sx={{ minWidth: 250 }} labelId="Company-label" value={filters.projectCode} onChange={(value) => handleFilterChange("projectCode", value)} />}
            <CustomDualDatePicker value={filters.date} onChange={handleDateChange} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Select displayEmpty size="small" value={filters.approval} onChange={(e) => handleFilterChange("approval", e.target.value)} sx={{ minWidth: 168 }}>
                <MenuItem value="" disabled>
                  Approval Status
                </MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </Box>
            <IconButton onClick={() => setOpen(true)}>
              <FilterList />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* Pass filters and setFilters to FilterMenu */}
      <FilterMenu open={open} setOpen={setOpen} filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
    </Paper>
  );
}
