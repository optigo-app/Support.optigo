import { memo, useState } from "react";
import { Box, Button, Grid, Paper, Select, MenuItem, IconButton, Stack, FormControl, InputLabel, Tooltip } from "@mui/material";
import { Add, FilterList } from "@mui/icons-material";
import CustomDualDatePicker from "../../../Delivery&Training/components/shared/ui/CustomDatePicker";
import AutocompleteComponent from "../../../Delivery&Training/components/shared/ui/Autocomplete";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOffRounded";
import SearchBar from "../../../Delivery&Training/components/Delivery/OrderGrid/Analytics/SearchBar";
import { useDelivery } from "./../../../Delivery&Training/context/DeliveryProvider";
import { isAnyFilterActive } from "./../../../Delivery&Training/utils/deliveryUtils";
import { FilterMenu } from "./../../../Delivery&Training/components/Delivery/OrderGrid/FilterMenu";
import MeFilterButton from "../../../_ui/MeFilterButton";
import { getPillButtonStyle } from "../../../_ui/pillButtonStyle";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";

function FilterOptions({showAdvanceFilter = false , onformToggle, filters, setFilters, meOnly = false, onMeToggle = () => {}, onMeClear = () => {}, isFullscreen = false, onToggleFullscreen = () => {} }) {
  const [open, setOpen] = useState(false);
  const IsHasFilters = isAnyFilterActive(filters) || meOnly;
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
    onMeClear();
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
      currentStatus: "",
    });
  };

  return (
    <Paper elevation={0} sx={{ boxShadow: "none", border: "none", mb: 0 ,borderRadius:"0 !important"  }}>
      <Grid container spacing={1} alignItems="center" sx={{ borderRadius:"0 !important" ,marginTop:"0 !important" ,marginBottom:0.5 }}>
        <Grid item xs={12} md={6}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} width="100%">
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
                New Topic
              </Button>
            </Box>
            <SearchBar filters={filters} handleSearchChange={handleFilterChange} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                p: "4px",
                borderRadius: "25px",
                backgroundColor: "#EFEAF2",
                flexShrink: 0,
              }}
            >
              <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} arrow>
                <IconButton
                  size="small"
                  disableRipple
                  onClick={onToggleFullscreen}
                  sx={{ ...getPillButtonStyle(isFullscreen), color: isFullscreen ? "#8B07A7" : "#6E5678" }}
                >
                  {isFullscreen ? <FullscreenExitRoundedIcon sx={{ fontSize: 20 }} /> : <FullscreenRoundedIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="More filters" arrow>
                <IconButton
                  size="small"
                  disableRipple
                  onClick={() => setOpen(true)}
                  sx={{ ...getPillButtonStyle(open), color: open ? "#8B07A7" : "#6E5678" }}
                >
                  <FilterList sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <MeFilterButton active={meOnly} onToggle={onMeToggle} />
            </Box>
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
            <AutocompleteComponent isWantLabel={true} options={COMPANY_MASTER_LIST} size="small" fullWidth={false} label={"Company Code"} sx={{ minWidth: 250 }} labelId="Company-label" value={filters.projectCode} onChange={(value) => handleFilterChange("projectCode", value)} />
            <CustomDualDatePicker showAdvanceFilter={showAdvanceFilter}  value={filters.date} onChange={handleDateChange} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 172 }}>
                <InputLabel id="approval-label">Approval Status</InputLabel>
                <Select labelId="approval-label" id="approval-select" value={filters.approval} onChange={(e) => handleFilterChange("approval", e.target.value)} label="Approval Status">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              {/* <FormControl size="small" sx={{ minWidth: 168 }}>
                <InputLabel id="delivery-status-label">Delivery Status</InputLabel>
                <Select labelId="delivery-status-label" id="delivery-status-select" value={filters.deliveryStatus} onChange={(e) => handleFilterChange("deliveryStatus", e.target.value)} label="Delivery Status">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Running">Running</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </Select>
              </FormControl> */}
            </Box>

          </Box>
        </Grid>
      </Grid>
      <FilterMenu showAdvanceFilter={showAdvanceFilter} open={open} setOpen={setOpen} filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
    </Paper>
  );
}

export default memo(FilterOptions);
