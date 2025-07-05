import { Box, Typography, Button, Popover, MenuItem, FormControl, Select, InputLabel, TextField, Chip, Autocomplete } from "@mui/material";
import { Sheet } from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useUrlFilters } from "../../../../hooks/useFilters";
import { useTicket } from "../../../../context/useTicket";

const FilterPopOver = ({ anchorEl, handleClose, open, HandleDownloadExcel }) => {
  const { filters, updateFilters, clearFilters, hasFilters } = useUrlFilters();
  const { APPNAME_LIST, COMPANY_LIST, CATEGORY_LIST, STATUS_LIST, PRIORITY_LIST } = useTicket();

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 360,
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            Ticket Filters
          </Typography>
          <Button size="small" onClick={clearFilters} sx={{ textTransform: "none" }}>
            Reset
          </Button>
        </Box>

        {/* status name */}
        {/* Main Filters */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }} variant="outlined">
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            multiple
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            label="Status"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip
                    key={val}
                    label={val}
                    size="small"
                    sx={{
                      backgroundColor: val === "Open" ? "#e3f2fd" : val === "Closed" ? "#e8f5e9" : "#fff8e1",
                      color: val === "Open" ? "#1976d2" : val === "Closed" ? "#388e3c" : "#f57c00",
                    }}
                  />
                ))}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: "28vh",
                },
              },
            }}
          >
            {STATUS_LIST?.map(({ label }) => (
              <MenuItem key={label} value={label}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* company name */}
        <Autocomplete
          fullWidth
          size="small"
          options={COMPANY_LIST?.map((val) => val?.label) || []}
          value={filters?.projectCode || null}
          onChange={(_, newValue) => updateFilters({ projectCode: newValue || "" })}
          renderInput={(params) => <TextField {...params} label="ProjectCode" placeholder="Search Projects..." />}
          isOptionEqualToValue={(option, value) => option === value}
          sx={{ mb: 2 }}
          ListboxProps={{
            style: {
              maxHeight: "28vh",
            },
          }}
          clearOnEscape
        />
        {/* PRIORITY_LIST */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={filters.priority} onChange={(e) => updateFilters({ priority: e.target.value })} label="Priority" defaultValue="">
            {PRIORITY_LIST?.map(({ label }) => (
              <MenuItem key={label} value={label}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* category name */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }} variant="outlined">
          <InputLabel id="category-label">Category</InputLabel>
          <Select labelId="category-label" value={filters?.category} onChange={(e) => updateFilters({ category: e.target.value })} label="Category" defaultValue="">
            <MenuItem value="">All</MenuItem>
            {CATEGORY_LIST?.map(({ label }) => (
              <MenuItem key={label} value={label}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* followup */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }} variant="outlined">
          <InputLabel id="followup-label">Follow Up</InputLabel>
          <Select labelId="followup-label" value={filters.followup} onChange={(e) => updateFilters({ followup: e.target.value })} label="Follow Up" defaultValue="">
            <MenuItem value="Follow Up 1">Follow Up 1</MenuItem>
            <MenuItem value="Follow Up 2">Follow Up 2</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }} variant="outlined">
          <InputLabel id="Appname">Appname</InputLabel>
          <Select
            labelId="Appname"
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: "28vh",
                },
              },
            }}
            value={filters.appname}
            onChange={(e) => updateFilters({ appname: e.target.value })}
            label="Appname"
            defaultValue=""
          >
            {APPNAME_LIST?.map(({ label }) => (
              <MenuItem key={label} value={label}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button fullWidth variant="outlined" startIcon={<Sheet color="green" />} sx={{ textTransform: "none", fontWeight: 500, mb: 2 }} onClick={HandleDownloadExcel}>
          Download Excel
        </Button>
        {/* Star / Unstar */}
        <Box display="flex" gap={1} mb={2}>
          <Button disabled={filters.isStarred} value={filters.isStarred} onClick={(e) => updateFilters({ isStarred: true })} variant="outlined" fullWidth size="small" startIcon={<StarIcon fontSize="small" />}>
            Star Ticket
          </Button>
          <Button disabled={!filters.isStarred} value={filters.isStarred} onClick={(e) => updateFilters({ isStarred: false })} variant="outlined" fullWidth size="small" startIcon={<StarBorderIcon fontSize="small" />}>
            UnStar Ticket
          </Button>
        </Box>

        {/* Apply Button */}
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          size="small"
          sx={{
            bgcolor: "#8B07A7",
            ":hover": {
              bgcolor: "#8B07A7",
            },
          }}
          onClick={handleClose}
          disabled={!hasFilters}
        >
          Apply Filter
        </Button>
      </Popover>
    </>
  );
};

export default FilterPopOver;
