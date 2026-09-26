'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  InputBase,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Plus,
  MagnifyingGlass,
  User,
  Users,
  Phone,
  CheckCircle,
  Export,
  CalendarBlank,
  CaretDown,
  X,
} from '@phosphor-icons/react';

export default function QueryHeaderBar({
  searchQuery = '',
  setSearchQuery,
  selectedCompany = 'all',
  setSelectedCompany,
  companies = [],
  filterBy = 'all',
  setFilterBy,
  statusFilter = 'all',
  setStatusFilter,
  dateRange = 'Aug 14, 2026 - Aug 21, 2026',
  setDateRange,
  onAddClick,
  onExportClick,
}) {
  // Dropdown states
  const [companyAnchor, setCompanyAnchor] = useState(null);
  const [filterByAnchor, setFilterByAnchor] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [viewMode, setViewMode] = useState('group'); // 'single' | 'group' | 'phone' | 'completed'

  const handleCompanySelect = (comp) => {
    if (setSelectedCompany) setSelectedCompany(comp);
    setCompanyAnchor(null);
  };

  const handleFilterBySelect = (val) => {
    if (setFilterBy) setFilterBy(val);
    setFilterByAnchor(null);
  };

  const handleStatusSelect = (val) => {
    if (setStatusFilter) setStatusFilter(val);
    setStatusAnchor(null);
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        minHeight: 52,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 2 },
      }}
    >
      {/* 1. + ADD Action Button */}
      <Button
        variant="contained"
        onClick={onAddClick}
        startIcon={<Plus size={16} weight="bold" />}
        sx={{
          bgcolor: '#FAEA2B',
          color: '#000000',
          fontWeight: 800,
          fontSize: '0.82rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          px: 2,
          py: 0.75,
          minWidth: 105,
          height: 36,
          boxShadow: 'none',
          borderRadius: '5px',
          border: '1px solid #E2D700',
          '&:hover': {
            bgcolor: '#F3E214',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          },
        }}
      >
        ADD
      </Button>

      {/* 2. Search Queries Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '5px',
          px: 1.2,
          height: 36,
          minWidth: 220,
          flex: '1 1 240px',
          maxWidth: 360,
          transition: 'all 0.15s ease-in-out',
          '&:focus-within': {
            borderColor: '#6900C6',
            boxShadow: '0 0 0 2px rgba(105,0,198,0.15)',
          },
        }}
      >
        <MagnifyingGlass size={16} color="#64748B" />
        <InputBase
          value={searchQuery}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          placeholder="Search Queries"
          sx={{
            ml: 1,
            fontSize: '0.85rem',
            flex: 1,
            color: '#1E293B',
            fontWeight: 500,
            '& input::placeholder': { color: '#94A3B8', opacity: 1 },
          }}
        />
        {searchQuery && (
          <IconButton size="small" onClick={() => setSearchQuery && setSearchQuery('')} sx={{ p: 0.2 }}>
            <X size={14} color="#64748B" />
          </IconButton>
        )}
      </Box>

      {/* 3. View Mode Toggles */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '5px',
          p: 0.3,
          height: 36,
        }}
      >
        <Tooltip title="Single Caller View">
          <IconButton
            size="small"
            onClick={() => setViewMode('single')}
            sx={{
              p: 0.6,
              borderRadius: '4px',
              bgcolor: viewMode === 'single' ? '#EEF2FF' : 'transparent',
              color: viewMode === 'single' ? '#4F46E5' : '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <User size={17} weight={viewMode === 'single' ? 'bold' : 'regular'} />
          </IconButton>
        </Tooltip>

        <Tooltip title="All Calls & Group View">
          <IconButton
            size="small"
            onClick={() => setViewMode('group')}
            sx={{
              p: 0.6,
              borderRadius: '4px',
              bgcolor: viewMode === 'group' ? '#EEF2FF' : 'transparent',
              color: viewMode === 'group' ? '#4F46E5' : '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <Users size={17} weight={viewMode === 'group' ? 'bold' : 'regular'} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Voice Calls Only">
          <IconButton
            size="small"
            onClick={() => setViewMode('phone')}
            sx={{
              p: 0.6,
              borderRadius: '4px',
              bgcolor: viewMode === 'phone' ? '#EEF2FF' : 'transparent',
              color: viewMode === 'phone' ? '#4F46E5' : '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <Phone size={17} weight={viewMode === 'phone' ? 'bold' : 'regular'} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Completed Queries">
          <IconButton
            size="small"
            onClick={() => setViewMode('completed')}
            sx={{
              p: 0.6,
              borderRadius: '4px',
              bgcolor: viewMode === 'completed' ? '#ECFDF5' : 'transparent',
              color: viewMode === 'completed' ? '#059669' : '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <CheckCircle size={17} weight={viewMode === 'completed' ? 'bold' : 'regular'} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 4. EXPORT Button */}
      <Button
        variant="contained"
        onClick={onExportClick}
        startIcon={<Export size={16} weight="bold" />}
        sx={{
          bgcolor: '#1e7e34',
          color: '#FFFFFF',
          fontWeight: 750,
          fontSize: '0.8rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          px: 1.8,
          height: 36,
          boxShadow: 'none',
          borderRadius: '5px',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: '#156524',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          },
        }}
      >
        EXPORT
      </Button>

      {/* 5. Company Dropdown Filter */}
      <Button
        onClick={(e) => setCompanyAnchor(e.currentTarget)}
        endIcon={<CaretDown size={14} color="#64748B" />}
        sx={{
          height: 36,
          px: 1.5,
          bgcolor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '5px',
          color: '#334155',
          fontSize: '0.82rem',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 120,
          justify: 'space-between',
          '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
        }}
      >
        {selectedCompany === 'all'
          ? 'Company'
          : selectedCompany.charAt(0).toUpperCase() + selectedCompany.slice(1)}
      </Button>
      <Menu
        anchorEl={companyAnchor}
        open={Boolean(companyAnchor)}
        onClose={() => setCompanyAnchor(null)}
        PaperProps={{ sx: { maxHeight: 300, width: 180, mt: 0.5 } }}
      >
        <MenuItem selected={selectedCompany === 'all'} onClick={() => handleCompanySelect('all')}>
          All Companies
        </MenuItem>

        {companies.map((c) => (
          <MenuItem
            key={c.name}
            selected={selectedCompany === c.name}
            onClick={() => handleCompanySelect(c.name)}
          >
            {c.name}
          </MenuItem>
        ))}
      </Menu>

      {/* 6. Filter By Dropdown */}
      <Button
        onClick={(e) => setFilterByAnchor(e.currentTarget)}
        endIcon={<CaretDown size={14} color="#64748B" />}
        sx={{
          height: 36,
          px: 1.5,
          bgcolor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '5px',
          color: '#334155',
          fontSize: '0.82rem',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 110,
          '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
        }}
      >
        {filterBy === 'all' ? 'Filter By' : filterBy}
      </Button>
      <Menu
        anchorEl={filterByAnchor}
        open={Boolean(filterByAnchor)}
        onClose={() => setFilterByAnchor(null)}
        PaperProps={{ sx: { width: 160, mt: 0.5 } }}
      >
        <MenuItem selected={!filterBy || filterBy === 'all'} onClick={() => handleFilterBySelect('all')}>
          All (None)
        </MenuItem>
        <MenuItem selected={filterBy === 'date'} onClick={() => handleFilterBySelect('date')}>
          Date
        </MenuItem>
        <MenuItem selected={filterBy === 'callStart'} onClick={() => handleFilterBySelect('callStart')}>
          Call Start
        </MenuItem>
        <MenuItem selected={filterBy === 'callClosed'} onClick={() => handleFilterBySelect('callClosed')}>
          Call Closed
        </MenuItem>
      </Menu>

      {/* 7. Date Range Picker Control */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '5px',
          px: 1.2,
          height: 36,
          minWidth: 180,
          cursor: 'pointer',
          '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
        }}
      >
        <CalendarBlank size={16} color="#64748B" style={{ marginRight: 6 }} />
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500, flex: 1, whiteSpace: 'nowrap' }}>
          {dateRange || 'Date Range'}
        </Typography>
        {dateRange && (
          <IconButton size="small" onClick={() => setDateRange && setDateRange('')} sx={{ p: 0.2 }}>
            <X size={14} color="#94A3B8" />
          </IconButton>
        )}
      </Box>

      {/* 8. Status Dropdown */}
      <Button
        onClick={(e) => setStatusAnchor(e.currentTarget)}
        endIcon={<CaretDown size={14} color="#64748B" />}
        sx={{
          height: 36,
          px: 1.5,
          bgcolor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '5px',
          color: '#334155',
          fontSize: '0.82rem',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 105,
          '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
        }}
      >
        {statusFilter === 'all' ? 'Status' : statusFilter}
      </Button>
      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        PaperProps={{ sx: { width: 150, mt: 0.5 } }}
      >
        <MenuItem selected={statusFilter === 'all'} onClick={() => handleStatusSelect('all')}>
          All Statuses
        </MenuItem>
        <MenuItem selected={statusFilter === 'Solved'} onClick={() => handleStatusSelect('Solved')}>
          Solved
        </MenuItem>
        <MenuItem selected={statusFilter === 'Completed'} onClick={() => handleStatusSelect('Completed')}>
          Completed
        </MenuItem>
        <MenuItem selected={statusFilter === 'Pending'} onClick={() => handleStatusSelect('Pending')}>
          Pending
        </MenuItem>
      </Menu>
    </Box>
  );
}
