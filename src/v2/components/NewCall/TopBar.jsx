'use client';
import React from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  MagnifyingGlass,
  Question,
  X,
  Plus,
  Export,
} from '@phosphor-icons/react';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SettingsPhoneRoundedIcon from '@mui/icons-material/SettingsPhoneRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AirbnbDateRangePicker from './AirbnbDateRangePicker';
import CustomMultiSelectDropdown from './CustomMultiSelectDropdown';
import { useCallLog } from '../../context/UseCallLog';

export default function TopBar({
  searchQuery = '',
  setSearchQuery,
  selectedCompany = 'all',
  setSelectedCompany,
  companies = [],
  filterBy = 'all',
  setFilterBy,
  statusFilter = 'all',
  setStatusFilter,
  dateRangeObj,
  setDateRangeObj,
  viewMode = 'team',
  setViewMode,
  onAddClick,
  onExportClick,
}) {
  const { STATUS_LIST = [], ESTATUS_LIST = [], companyOptions = [], COMPANY_LIST = [] } = useCallLog();

  const allCompanyOptions = React.useMemo(() => {
    const validCompList = (COMPANY_LIST && COMPANY_LIST.length > 0)
      ? COMPANY_LIST.filter((item) => item.type === 'COMPANYNAME' || item.ProjectID)
      : [];

    if (validCompList.length > 0) {
      return validCompList.map((c) => ({
        id: c.ProjectID,
        label: c.ProjectCode || c.label || `Company #${c.ProjectID}`,
      }));
    }

    if (companyOptions && companyOptions.length > 0) {
      return companyOptions
        .filter((c) => c?.label)
        .map((c) => ({
          id: Number(c.value) || c.value,
          label: c.label,
        }));
    }

    if (companies && companies.length > 0) {
      return companies.map((c) => ({ id: c.id || c.name, label: c.name }));
    }

    return [];
  }, [COMPANY_LIST, companyOptions, companies]);

  const allStatusOptions = React.useMemo(() => {
    const combined = [...STATUS_LIST, ...ESTATUS_LIST];
    if (combined.length > 0) {
      return combined.map((s) => ({
        id: s.value !== undefined ? s.value : s.label,
        label: s.label || s.Name || String(s.value),
      }));
    }
  }, [STATUS_LIST, ESTATUS_LIST]);

  return (
    <Box
      sx={{
        height: 48,
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        zIndex: 1200,
        color: '#FFFFFF',
        gap: 1.5,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        borderBottom:'1px solid',
        borderColor:'divider'
      }}
    >

      {/* Center-Left: Global Search Bar + Inline Calls Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          py: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* 1. Global ADD Button */}
        <Button
          variant="contained"
          size="small"
          onClick={onAddClick}
          startIcon={<Plus size={14} weight="bold" />}
          sx={{
            background: 'linear-gradient(135deg, #FFB800 0%, #F59E0B 100%)',
            color: '#000000',
            fontWeight: 800,
            fontSize: '0.8125rem',
            textTransform: 'none',
            borderRadius: '6px',
            px: 1.8,
            height: 32,
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.25)',
            flexShrink: 0,
            '&:hover': {
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 3px 6px rgba(245, 158, 11, 0.35)',
            },
          }}
        >
          ADD
        </Button>

        {/* 2. Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            px: 1.2,
            height: 32,
            width: { xs: 150, sm: 200, md: 240 },
            flexShrink: 0,
            transition: 'border-color 0.15s ease',
            '&:focus-within': {
              borderColor: '#6900C6',
              boxShadow: '0 0 0 2px rgba(105, 0, 198, 0.12)',
            },
          }}
        >
          <MagnifyingGlass size={15} color="#94A3B8" />
          <InputBase
            placeholder="Search calls, client, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            sx={{
              ml: 1,
              flex: 1,
              fontSize: '0.8125rem',
              color: '#1E293B',
              '& input::placeholder': { color: '#94A3B8', opacity: 1 },
            }}
          />
          {searchQuery && (
            <X
              size={13}
              color="#64748B"
              style={{ cursor: 'pointer' }}
              onClick={() => setSearchQuery && setSearchQuery('')}
            />
          )}
        </Box>

        {/* 3. View Mode Toggle Icons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            p: 0.25,
            height: 32,
            flexShrink: 0,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            gap: 0.25,
          }}
        >
          <Tooltip title="User View (My Calls)" arrow>
            <IconButton
              size="small"
              onClick={() => setViewMode && setViewMode('normal')}
              sx={{
                p: 0.45,
                borderRadius: '4px',
                color: viewMode === 'normal' ? '#6900C6' : '#64748B',
                bgcolor: viewMode === 'normal' ? '#EDE9FE' : 'transparent',
                border: viewMode === 'normal' ? '1px solid #DDD6FE' : '1px solid transparent',
                '&:hover': { bgcolor: viewMode === 'normal' ? '#DDD6FE' : '#F8FAFC' },
              }}
            >
              <PersonRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Team View (All Calls)" arrow>
            <IconButton
              size="small"
              onClick={() => setViewMode && setViewMode('team')}
              sx={{
                p: 0.45,
                borderRadius: '4px',
                color: viewMode === 'team' ? '#6900C6' : '#64748B',
                bgcolor: viewMode === 'team' ? '#EDE9FE' : 'transparent',
                border: viewMode === 'team' ? '1px solid #DDD6FE' : '1px solid transparent',
                '&:hover': { bgcolor: viewMode === 'team' ? '#DDD6FE' : '#F8FAFC' },
              }}
            >
              <GroupsRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Pending Follow Up Calls" arrow>
            <IconButton
              size="small"
              onClick={() => setViewMode && setViewMode('followUp-Pending')}
              sx={{
                p: 0.45,
                borderRadius: '4px',
                color: viewMode === 'followUp-Pending' ? '#D97706' : '#64748B',
                bgcolor: viewMode === 'followUp-Pending' ? '#FEF3C7' : 'transparent',
                border: viewMode === 'followUp-Pending' ? '1px solid #FDE68A' : '1px solid transparent',
                '&:hover': { bgcolor: viewMode === 'followUp-Pending' ? '#FDE68A' : '#F8FAFC' },
              }}
            >
              <SettingsPhoneRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Completed Follow Up Calls" arrow>
            <IconButton
              size="small"
              onClick={() => setViewMode && setViewMode('followUp-Completed')}
              sx={{
                p: 0.45,
                borderRadius: '4px',
                color: viewMode === 'followUp-Completed' ? '#16A34A' : '#64748B',
                bgcolor: viewMode === 'followUp-Completed' ? '#DCFCE7' : 'transparent',
                border: viewMode === 'followUp-Completed' ? '1px solid #86EFAC' : '1px solid transparent',
                '&:hover': { bgcolor: viewMode === 'followUp-Completed' ? '#BBF7D0' : '#F8FAFC' },
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 4. EXPORT Button */}
        <Button
          variant="contained"
          onClick={onExportClick}
          startIcon={<Export size={14} weight="bold" />}
          sx={{
            bgcolor: '#16A34A',
            color: '#FFFFFF',
            fontWeight: 750,
            fontSize: '0.74rem',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            px: 1.2,
            height: 32,
            minWidth: 80,
            flexShrink: 0,
            boxShadow: 'none',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: '#15803D',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            },
          }}
        >
          EXPORT
        </Button>

        {/* 5. Custom Multi-Select Company Filter */}
        <CustomMultiSelectDropdown
          title="Company"
          options={allCompanyOptions}
          selectedValues={Array.isArray(selectedCompany) ? selectedCompany : (selectedCompany === 'all' ? [] : [selectedCompany])}
          onChange={(newVal) => {
            if (setSelectedCompany) setSelectedCompany(newVal);
          }}
        />

        {/* 6. Custom Multi-Select Filter By */}
        <CustomMultiSelectDropdown
          title="Filter By"
          options={[
            { id: 'date', label: 'Date' },
            { id: 'callStart', label: 'Call Start' },
            { id: 'callClosed', label: 'Call Closed' },
          ]}
          selectedValues={Array.isArray(filterBy) ? filterBy : (filterBy === 'all' || !filterBy ? [] : [filterBy])}
          onChange={(newVal) => {
            if (setFilterBy) {
              const selected = Array.isArray(newVal) ? (newVal.length > 0 ? newVal[newVal.length - 1] : '') : (newVal || '');
              setFilterBy(selected);
            }
          }}
        />

        {/* 7. Lead CRM Airbnb-Inspired Date Range Picker */}
        <Box sx={{ flexShrink: 0, height: 32, display: 'flex', alignItems: 'center' }}>
          <AirbnbDateRangePicker
            startDate={dateRangeObj?.start || null}
            endDate={dateRangeObj?.end || null}
            onChange={({ start, end }) => {
              if (setDateRangeObj) setDateRangeObj({ start, end });
            }}
          />
        </Box>

        {/* 8. Custom Multi-Select Status Dropdown */}
        <CustomMultiSelectDropdown
          title="Status"
          options={allStatusOptions}
          selectedValues={Array.isArray(statusFilter) ? statusFilter : (statusFilter === 'all' || !statusFilter ? [] : [statusFilter])}
          onChange={(newVal) => {
            if (setStatusFilter) setStatusFilter(newVal);
          }}
        />
      </Box>

      {/* Right: Help Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, justifyContent: 'flex-end' }}>
        <Tooltip title="Help & Info">
          <IconButton
            size="small"
            sx={{ color: '#64748B', p: 0.4, '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' } }}
          >
            <Question size={18} weight="bold" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
