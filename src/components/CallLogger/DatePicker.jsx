import React, { useState } from "react";
import { TextField, Box, Popover, InputAdornment, Button, Stack, MenuItem, IconButton } from "@mui/material";
import { DateRangePicker } from "mui-daterange-picker";
import { ThemeProvider } from "@mui/material/styles";
import { Datetheme } from "../../libs/DateTheme";
import { CalendarDays } from "lucide-react";
import ClearIcon from "@mui/icons-material/Clear";

const DualDatePicker = ({ filterState, setFilterState, tempDateRange, setTempDateRange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Handle date range change
  const handleDateChange = (range) => {
    setTempDateRange({
      startDate: range.startDate || "",
      endDate: range.endDate || "",
    });
  };

  const formatDateForApi = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";

    const localDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));
    return localDate.toISOString().split("T")[0];
  };

  const handleApply = () => {
    setFilterState({
      ...filterState,
      dateRange: {
        startDate: formatDateForApi(tempDateRange.startDate),
        endDate: formatDateForApi(tempDateRange.endDate),
      },
    });
    handleClose();
  };
  const formatDate = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
    return d instanceof Date && !isNaN(d) ? d.toLocaleDateString("en-GB") : "";
  };

  const displayValue = tempDateRange.startDate && tempDateRange.endDate ? `${formatDate(tempDateRange.startDate)} - ${formatDate(tempDateRange.endDate)}` : "";

  const handleClear = () => {
    setTempDateRange({ startDate: "", endDate: "" });
    setFilterState({
      ...filterState,
      dateRange: { startDate: "", endDate: "" },
      filterTargetField: "",
    });
    handleClose();
  };

  return (
    <ThemeProvider theme={Datetheme}>
      <Box display="flex" gap={1} alignItems="center">
        <TextField
          label="Filter By"
          select
          size="small"
          value={filterState.filterTargetField}
          onChange={(e) => setFilterState({ ...filterState, filterTargetField: e.target.value })}
          sx={{
            minWidth: "180px",
            "& .MuiInputBase-input": {
              padding: "8.5px 12px",
            },
          }}
        >
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="callStart">Call Start</MenuItem>
          <MenuItem value="callClosed">Call Closed</MenuItem>
          <MenuItem value="">None</MenuItem>
        </TextField>

        <TextField
          label="Date Range"
          value={displayValue}
          onClick={handleOpen}
          size="small"
          fullWidth
          sx={{
            minWidth: "150px",
            "& .MuiInputBase-input": {
              padding: "8.5px 12px",
            },
          }}
          readOnly
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarDays />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="ClearIcon" onClick={handleClear} color="default">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }}>
          <Box p={2}>
            <DateRangePicker open toggle={handleClose} onChange={handleDateChange} initialDateRange={tempDateRange} />
            <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleApply} variant="contained" color="primary">
                Apply
              </Button>
            </Stack>
          </Box>
        </Popover>
      </Box>
    </ThemeProvider>
  );
};

export default DualDatePicker;
