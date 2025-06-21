import React, { useState } from 'react';
import { Tabs, Tab, Box, styled } from '@mui/material';

const StyledTabs = styled(Tabs)(({ theme }) => ({
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    minHeight: '35px',
    padding: '4px',
    '& .MuiTabs-indicator': {
        display: 'none',
    },
    '& .MuiTabs-flexContainer': {
        height: '35px',
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    backgroundColor: 'transparent',
    color: 'black',
    fontWeight: 500,
    fontSize: '14px',
    textTransform: 'none',
    minHeight: '30px',
    borderRadius: '6px',
    margin: '0 2px',
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
        backgroundColor: '#ffffff',
        color: 'black',
        fontWeight: 600,
    },
}));

export default function CustomTabs({ filters, setFilters, }) {
    const handleChange = (event, newValue) => {
        setFilters((prev) => ({
            ...prev,
            'Tabs': newValue,
        }));
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 400, }}>
            <StyledTabs
                value={filters?.Tabs}
                onChange={handleChange}
                aria-label="delivery status tabs"
                variant="fullWidth"
            >
                <StyledTab label="Delivered" />
                <StyledTab label="Upcoming" />
            </StyledTabs>
        </Box>
    );
}