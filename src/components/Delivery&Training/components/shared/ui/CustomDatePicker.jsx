import React, { useState, useEffect } from "react";
import {
    TextField,
    Box,
    Popover,
    InputAdornment,
    Button,
    Stack,
    IconButton,
    ThemeProvider,
    Chip,
} from "@mui/material";
import { DateRangePicker } from "mui-daterange-picker";
import ClearIcon from "@mui/icons-material/Clear";
import { DATE_FIELDS, Datetheme } from "./../../../libs/data";
import MenuList from './../../Training/Header/MenuList';

const formatDate = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
    return d instanceof Date && !isNaN(d)
        ? d.toLocaleDateString("en-GB")
        : "";
};

const CustomDualDatePicker = ({ value = {}, onChange = () => { } }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElStatus, setAnchorElStatus] = useState(null);
    const open = Boolean(anchorEl);

    const [tempRange, setTempRange] = useState({
        startDate: value.startDate || "",
        endDate: value.endDate || "",
        status: value.status || "",
    });

    useEffect(() => {
        setTempRange({
            startDate: value.startDate || "",
            endDate: value.endDate || "",
            status: value.status || "",
        });
    }, [value]);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleDateChange = (range) => {
        setTempRange((prev) => ({
            ...prev,
            startDate: range.startDate || "",
            endDate: range.endDate || "",
        }));
    };

    const handleApply = () => {
        onChange(tempRange); // Send updated range + status
        handleClose();
    };

    const handleClear = (e) => {
        e.stopPropagation();
        const cleared = { startDate: "", endDate: "", status: "" };
        setTempRange(cleared);
        onChange(cleared);
        handleClose();
    };

    const handleStatusSelect = (selectedStatus) => {
        const updated = { ...tempRange, status: selectedStatus };
        setTempRange(updated);
        onChange(updated);
        setAnchorElStatus(null);
    };

    const displayValue =
        tempRange?.startDate && tempRange?.endDate
            ? `${formatDate(tempRange.startDate)} - ${formatDate(tempRange.endDate)}`
            : "";

    return (
        <ThemeProvider theme={Datetheme}>
            <Box display="flex" alignItems="center"
                sx={{ zIndex: 999 }}
            >
                <TextField
                    label="Date Range"
                    value={displayValue}
                    onClick={handleOpen}
                    size="small"
                    sx={{
                        "& .MuiInputBase-input": {
                            padding: "8.5px 12px",
                        },
                    }}
                    readOnly
                    InputProps={{
                        startAdornment: (
                            <>
                                <Chip
                                    label={tempRange.status || "Select Status"}
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAnchorElStatus(e.currentTarget);
                                    }}
                                    sx={{
                                        cursor: "pointer",
                                        pointerEvents: "auto",
                                        opacity: 1,
                                        borderRadius: "14px",
                                        bgcolor: '#fffad'
                                    }}
                                />
                                <MenuList
                                    options={DATE_FIELDS}
                                    anchorEl={anchorElStatus}
                                    open={Boolean(anchorElStatus)}
                                    handleClose={() => setAnchorElStatus(null)}
                                    handleSelect={handleStatusSelect}
                                    selectedValue={tempRange?.status || "All"}
                                />
                            </>
                        ),
                        endAdornment: displayValue && (
                            <InputAdornment position="end">
                                <IconButton aria-label="ClearIcon" onClick={handleClear} color="default" size="small">
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                    <Box p={2}>
                        <DateRangePicker
                            open
                            toggle={handleClose}
                            onChange={handleDateChange}
                            initialDateRange={{
                                startDate: tempRange.startDate,
                                endDate: tempRange.endDate,
                            }}
                        />
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

export default CustomDualDatePicker;