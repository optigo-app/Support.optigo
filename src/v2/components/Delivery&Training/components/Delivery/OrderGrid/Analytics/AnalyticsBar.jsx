import { memo, useState } from "react";
import { Box, Typography, Button, Grid, Paper, Select, MenuItem, IconButton, Stack, FormControl, InputLabel } from "@mui/material";
import { Add, FilterList } from "@mui/icons-material";
import CustomDualDatePicker from "../../../shared/ui/CustomDatePicker";
import { FilterMenu } from "../FilterMenu";
import AutocompleteComponent from "../../../shared/ui/Autocomplete";
import { isAnyFilterActive } from "../../../../utils/deliveryUtils";
import DeliveryTabs, { ToggleButton, ToggleWrapper } from "../DeliveryTabs";
import AnalyticsDashboardCards from "./AnalyticsBoard";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOffRounded";
import { useDelivery } from "../../../../context/DeliveryProvider";
import SearchBar from "./SearchBar";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";

const Dashboard = memo(({ isFullscreen = false, toggleFullscreen = () => { }, role, dashboardData, onformToggle, greeting, LoggedUser, filters = null, setFilters = () => { }, isAdmin }) => {
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
        {!isFullscreen && (
          <AnalyticsDashboardCards
            isClient={!isAdmin}
            dashboardData={dashboardData}
            filters={filters}
            setFilters={setFilters}
          />
        )}
        <FilterOptions isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} role={role} isAdmin={isAdmin} onformToggle={onformToggle} filters={filters} setFilters={setFilters} />
      </Box>
    </>
  );
});

export default Dashboard;

function FilterOptions({ isFullscreen = false, toggleFullscreen = () => { }, role, onformToggle, filters, setFilters, isAdmin }) {
  const [open, setOpen] = useState(false);
  const IsHasFilters = isAnyFilterActive(filters);
  const { COMPANY_MASTER_LIST } = useDelivery();

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
      deliveryStatus: "",
    });
  };

  return (
    <Paper elevation={0} sx={{ boxShadow: "none", border: "none", mb: 0, pt: 1, pb: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          width: "100%",
        }}
      >
        {/* Left side - Tabs, New Order and Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            flex: { xs: "1 1 100%", lg: "0 0 auto" },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <ToggleWrapper>
              <ToggleButton
                onClick={onformToggle}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#ffde77",
                  color: "#856404",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: "#ffde77",
                    color: "#856404",
                  },
                  px: 2,
                }}
              >
                <Add />
              </ToggleButton>
            </ToggleWrapper>
          </Box>
          {filters && setFilters && (
            <Box sx={{ minWidth: 180 }}>
              <DeliveryTabs filters={filters} setFilters={setFilters} />
            </Box>
          )}

          <Box sx={{ minWidth: 200, flex: { xs: "1 1 200px", sm: "0 0 auto" } }}>
            <SearchBar filters={filters} handleSearchChange={handleFilterChange} />
          </Box>
        </Box>

        {/* Right side - Action buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            flex: { xs: "1 1 100%", lg: "1 1 auto" },
          }}
        >
          {IsHasFilters && (
            <IconButton
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                "&:hover": { bgcolor: "primary.main", color: "white" },
              }}
              color="primary"
              size="medium"
              onClick={clearFilters}
            >
              <FilterAltOffIcon />
            </IconButton>
          )}
          {isAdmin && (
            <Box sx={{ minWidth: 180, maxWidth: 240, flex: "1 1 180px" }}>
              <AutocompleteComponent
                isWantLabel={true}
                options={COMPANY_MASTER_LIST}
                size="small"
                fullWidth={true}
                label={"Company Code"}
                labelId="Company-label"
                value={filters.projectCode}
                onChange={(value) => handleFilterChange("projectCode", value)}
              />
            </Box>
          )}
          <Box sx={{ minWidth: 260, maxWidth: 350, flex: "1 1 260px" }}>
            <CustomDualDatePicker value={filters.date} onChange={handleDateChange} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <FormControl size="small" sx={{ minWidth: 140, flex: "1 1 140px" }}>
              <InputLabel id="approval-label">Approval Status</InputLabel>
              <Select
                labelId="approval-label"
                id="approval-select"
                value={filters.approval}
                onChange={(e) => handleFilterChange("approval", e.target.value)}
                label="Approval Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140, flex: "1 1 140px" }}>
              <InputLabel id="delivery-status-label">Delivery Status</InputLabel>
              <Select
                labelId="delivery-status-label"
                id="delivery-status-select"
                value={filters.deliveryStatus}
                onChange={(e) => handleFilterChange("deliveryStatus", e.target.value)}
                label="Delivery Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Running">Running</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {isAdmin && (
            <IconButton onClick={() => setOpen(true)}>
              <FilterList />
            </IconButton>
          )}
          <IconButton sx={{ bgcolor: "rgba(92, 92, 92, 0.1)" }} onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Pass filters and setFilters to FilterMenu */}
      <FilterMenu open={open} setOpen={setOpen} filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
    </Paper>
  );
}
