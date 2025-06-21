import React from "react";
import { Box, Typography, InputBase, Divider, List, IconButton, Button, Popover, MenuItem, FormControl, Select, InputLabel, TextField, Chip, Autocomplete, Badge } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import TicketItem from "./TicketItem";
import { Search as SearchIcon, Sheet } from "lucide-react";
import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import { useUrlFilters } from "../../../../hooks/useFilters";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExcelReportDowload from "../../../../utils/ExcelReportDowload";
import { useTicket } from "../../../../context/useTicket";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    border: "1px solid #DFE1E6",
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#42526E",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "#172B4D",
    width: "100%",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
    },
}));

const TicketList = ({ tickets, selectedTicket, onTicketSelect }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const { filters, updateFilters, clearFilters, hasFilters, filterCount } = useUrlFilters();
    const { APPNAME_LIST, COMPANY_LIST, CATEGORY_LIST, STATUS_LIST, PRIORITY_LIST } = useTicket();

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setIsFilterActive(false);
    };

    const HandleDownloadExcel = () => {
        ExcelReportDowload(tickets);
    };

    return (
        <Box
            sx={{
                width: "31%",
                borderRight: "1px solid #DFE1E6",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fff",
                flexGrow: 1,
                minWidth: "480px",
            }}
        >
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #DFE1E6",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#172B4D" }}>
                    Tickets
                </Typography>
                <IconButton
                    onClick={(event) => {
                        handleClick(event);
                        setIsFilterActive((prev) => !prev);
                    }}
                    size="small"
                    sx={{ ml: 1 }}
                >
                    <Badge badgeContent={filterCount} color="primary">
                        {isFilterActive ? <FilterAltOffRoundedIcon fontSize="medium" sx={{ color: "#8B07A7" }} /> : <FilterAltRoundedIcon fontSize="medium" sx={{ color: "#8B07A7" }} />}
                    </Badge>
                </IconButton>
            </Box>
            <Box sx={{ p: 2 }}>
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase value={filters.searchQuery} onChange={(e) => updateFilters({ searchQuery: e.target.value })} disableUnderline placeholder="Search tickets ..." inputProps={{ "aria-label": "search tickets" }} />
                </Search>
            </Box>
            <List
                sx={{
                    p: 0,
                    overflow: "auto",
                    flexGrow: 1,
                borderTop: "1px solid #DFE1E6",
                }}
            >
                {tickets?.length === 0 ? (
                    <Box sx={{ textAlign: "center", p: 3, color: "text.secondary", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                        <InfoOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="h6" gutterBottom>
                            No Tickets Found
                        </Typography>
                        <Typography variant="body2">Try adjusting your filters or check back later.</Typography>
                    </Box>
                ) : (
                    tickets?.map((ticket, idx) => (
                        <React.Fragment key={idx || ticket?.TicketNo}>
                            <TicketItem ticket={ticket} selectedTicket={selectedTicket} onTicketSelect={onTicketSelect} />
                            <Divider />
                        </React.Fragment>
                    ))
                )}
            </List>

            {/* Filters Menu */}
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
                {/* <Autocomplete
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
                /> */}
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
                {/* <FormControl fullWidth size="small" sx={{ mb: 2 }} variant="outlined">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select labelId="category-label" value={filters?.category} onChange={(e) => updateFilters({ category: e.target.value })} label="Category" defaultValue="">
                        <MenuItem value="">All</MenuItem>
                        {CATEGORY_LIST?.map(({ label }) => (
                            <MenuItem key={label} value={label}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl> */}
                {/* followup */}
                {/* <FormControl fullWidth size="small" sx={{ mb: 2 }} variant="outlined">
                    <InputLabel id="followup-label">Follow Up</InputLabel>
                    <Select labelId="followup-label" value={filters.followup} onChange={(e) => updateFilters({ followup: e.target.value })} label="Follow Up" defaultValue="">
                        <MenuItem value="Follow Up 1">Follow Up 1</MenuItem>
                        <MenuItem value="Follow Up 2">Follow Up 2</MenuItem>
                    </Select>
                </FormControl> */}

                {/* <FormControl fullWidth size="small" sx={{ mb: 2 }} variant="outlined">
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
                </FormControl> */}
    
                {/* <Button fullWidth variant="outlined" startIcon={<Sheet color="green" />} sx={{ textTransform: "none", fontWeight: 500, mb: 2 }} onClick={HandleDownloadExcel}>
                    Download Excel
                </Button> */}
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
        </Box>
    );
};

export default TicketList;
