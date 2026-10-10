'use client';
import React from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Tooltip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  MagnifyingGlass,
  X,
  Plus,
  SidebarSimple,
} from '@phosphor-icons/react';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SettingsPhoneRoundedIcon from '@mui/icons-material/SettingsPhoneRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AirbnbDateRangePicker from './AirbnbDateRangePicker';
import CustomMultiSelectDropdown from './CustomMultiSelectDropdown';
import { useCallLog } from '../../context/UseCallLog';


const pillSx = {
  px: 1.75,
  borderRadius: "999px",
  bgcolor: "#D6D6D8",
  color: "#000",
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  letterSpacing: 0,
  boxShadow: "none",
  gap: 1,
  py: 0.5,
  whiteSpace: "nowrap",
  "&:hover": { bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)" },
  "&:active": { bgcolor: "#F8FAFC" },
  "&:focus-visible": { outline: "2px solid #000", outlineOffset: 2 },
};

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
  onClearAll,
  isRailCompanyFiltered = false,
  isSidebarsCollapsed = false,
  onToggleSidebars,
}) {
  const { STATUS_LIST = [], ESTATUS_LIST = [], companyOptions = [], COMPANY_LIST = [] } = useCallLog();

  const hasActiveFilters = React.useMemo(() => {
    const hasSearch = Boolean(searchQuery && String(searchQuery).trim() !== '');
    const hasCompany = Boolean(
      selectedCompany &&
      selectedCompany !== 'all' &&
      (!Array.isArray(selectedCompany) || selectedCompany.length > 0)
    );
    const hasFilterBy = Boolean(filterBy && filterBy !== 'all' && filterBy !== '');
    const hasStatus = Boolean(
      statusFilter &&
      statusFilter !== 'all' &&
      (!Array.isArray(statusFilter) || statusFilter.length > 0)
    );
    const hasDate = Boolean(dateRangeObj?.start || dateRangeObj?.end);
    const hasRailComp = Boolean(isRailCompanyFiltered);

    return hasSearch || hasCompany || hasFilterBy || hasStatus || hasDate || hasRailComp;
  }, [searchQuery, selectedCompany, filterBy, statusFilter, dateRangeObj, isRailCompanyFiltered]);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (searchQuery && String(searchQuery).trim() !== '') count++;
    if (selectedCompany && selectedCompany !== 'all' && (!Array.isArray(selectedCompany) || selectedCompany.length > 0)) count++;
    if (filterBy && filterBy !== 'all' && filterBy !== '') count++;
    if (statusFilter && statusFilter !== 'all' && (!Array.isArray(statusFilter) || statusFilter.length > 0)) count++;
    if (dateRangeObj?.start || dateRangeObj?.end) count++;
    if (isRailCompanyFiltered) count++;
    return count;
  }, [searchQuery, selectedCompany, filterBy, statusFilter, dateRangeObj, isRailCompanyFiltered]);

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

  const getFilterStyle = (isActive) => ({
    bgcolor: isActive ? '#fff' : 'transparent',
    border: 'none',
    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)' : 'none',
    borderRadius: '10px',
    color: '#000',
    height: 28,
    minHeight: 28,
    "&:hover": {
      bgcolor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)'
    },
  });

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
        borderBottom: '1px solid',
        borderColor: 'divider'
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
        {/* 0. Collapse / Expand Sidebars Button */}
        <Tooltip title={isSidebarsCollapsed ? 'Show Sidebars (Companies & Calls)' : 'Collapse Sidebars'} arrow>
          <IconButton
            disableRipple
            onClick={onToggleSidebars}
            aria-label="Toggle Sidebars"
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#D6D6D8",
              color: "#000",
              borderRadius: '50%',
              transition: 'all 0.15s ease',
              "&:hover": { bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)" },
              "&:active": { bgcolor: "#F8FAFC" },
            }}
          >
            <SidebarSimple size={18} weight={isSidebarsCollapsed ? 'fill' : 'bold'} />
          </IconButton>
        </Tooltip>

        {/* 1. Global ADD Button */}
        <Button
          disableElevation
          disableRipple
          onClick={onAddClick}
          sx={{
            ...pillSx,
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={16} weight="bold" />
          ADD
        </Button>

        {/* 2. Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#D6D6D8',
            borderRadius: '14px',
            p: '1px',
            px: '3px',
            height: 36,
            width: { xs: 150, sm: 200, md: 260 },
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
              px: 1.2,
              height: 30,
              width: '100%',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)',
              '&:focus-within': {
                boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 0 0 1.5px #000',
              },
            }}
          >
            <MagnifyingGlass size={15} color="#94A3B8" weight="bold" />
            <InputBase
              placeholder="Search calls, client, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              sx={{
                ml: 1,
                flex: 1,
                fontSize: '0.8125rem',
                color: '#1E293B',
                fontWeight: 500,
                '& input::placeholder': { color: '#94A3B8', opacity: 1 },
              }}
            />
            {searchQuery && (
              <X
                size={13}
                color="#64748B"
                weight="bold"
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchQuery && setSearchQuery('')}
              />
            )}
          </Box>
        </Box>

        {/* 3. View Mode Toggle Icons (GroupDx style) */}
        <Box sx={{ display: "inline-block" }}>
          <ToggleButtonGroup
            exclusive
            value={viewMode}
            onChange={(_, v) => {
              if (v && setViewMode) setViewMode(v);
            }}
            aria-label="View Mode"
            sx={{
              bgcolor: "#D6D6D8",
              borderRadius: "12px",
              p: "4px",
              gap: 0,
              "& .MuiToggleButtonGroup-grouped": {
                height: 28,
                border: 0,
                borderRadius: "10px",
                color: "#000",
                position: "relative",
                transition: "background-color .15s, box-shadow .15s",
                px: 1,
                "&:not(:first-of-type)": { ml: 0, borderLeft: 0, borderRadius: "10px" },
                "&:first-of-type": { borderRadius: "10px" },
                "&:hover": { bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)" },
                "&.Mui-focusVisible": { outline: "2px solid #000", outlineOffset: -2 },
                // divider between unselected neighbours
                "&:not(:first-of-type)::before": {
                  content: '""',
                  position: "absolute",
                  left: -1,
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: 18,
                  width: "1px",
                  bgcolor: "#BDBDC0",
                },
                "&.Mui-selected": {
                  bgcolor: "#fff",
                  color: "#000",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)",
                  zIndex: 1,
                  "&:hover": { bgcolor: "#fff" },
                },
                // hide dividers touching the selected item
                "&.Mui-selected::before, &.Mui-selected + .MuiToggleButtonGroup-grouped::before": {
                  display: "none",
                },
                "& .MuiSvgIcon-root": { fontSize: 18 },
              },
            }}
          >
            <ToggleButton value="normal" aria-label="User View (My Calls)" disableRipple title="User View (My Calls)">
              <PersonRoundedIcon />
            </ToggleButton>
            <ToggleButton value="team" aria-label="Team View (All Calls)" disableRipple title="Team View (All Calls)">
              <GroupsRoundedIcon />
            </ToggleButton>
            <ToggleButton value="followUp-Pending" aria-label="Pending Follow Up Calls" disableRipple title="Pending Follow Up Calls">
              <SettingsPhoneRoundedIcon />
            </ToggleButton>
            <ToggleButton value="followUp-Completed" aria-label="Completed Follow Up Calls" disableRipple title="Completed Follow Up Calls">
              <CheckCircleRoundedIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 4. EXPORT Button */}
        <Button
          disableElevation
          disableRipple
          onClick={onExportClick}
          sx={pillSx}
        >

          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
            <path d="M0 0h512v512H0z" fill="none" />
            <radialGradient id="SVGbwT1gbHR" cx="-736.418" cy="787.398" r="14.222" gradientTransform="rotate(46.451 44031.733 -21862.033)scale(-41.1236 31.9082)" gradientUnits="userSpaceOnUse">
              <stop offset=".065" stop-color="#379539" />
              <stop offset=".422" stop-color="#297c2d" />
              <stop offset=".703" stop-color="#15561c" />
            </radialGradient>
            <path fill="url(#SVGbwT1gbHR)" d="M78.2 163.6c0-35.3 28.7-64 64-64h362.7v369.8c0 23.6-19.1 42.7-42.7 42.7H163.6c-47.1 0-85.3-38.2-85.3-85.3V163.6z" />
            <radialGradient id="SVGGTMnrceI" cx="-762.747" cy="777.165" r="14.222" gradientTransform="rotate(44.03 18539.879 -10324.23)scale(-16.661 12.8906)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#073b10" />
              <stop offset=".992" stop-color="#084a13" stop-opacity="0" />
            </radialGradient>
            <path fill="url(#SVGGTMnrceI)" fill-opacity=".7" d="M78.2 163.6c0-35.3 28.7-64 64-64h362.7v369.8c0 23.6-19.1 42.7-42.7 42.7H163.6c-47.1 0-85.3-38.2-85.3-85.3V163.6z" />
            <linearGradient id="SVGXhLNYdaT" x1="78.222" x2="274.273" y1="215.335" y2="215.335" gradientTransform="matrix(1 0 0 -1 0 514)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#52d17c" />
              <stop offset=".329" stop-color="#4aa647" />
            </linearGradient>
            <path fill="url(#SVGXhLNYdaT)" d="M78.2 234.7c0-35.3 28.7-64 64-64h192c-23.6 0-42.7 19.1-42.7 42.7v85.3c0 23.6-19.1 42.7-42.7 42.7h-85.3c-47.1 0-85.3 38.2-85.3 85.3z" />
            <linearGradient id="SVGaHx2YdtF" x1="206.222" x2="206.222" y1="343.335" y2="165.517" gradientTransform="matrix(1 0 0 -1 0 514)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#29852f" />
              <stop offset=".5" stop-color="#4aa647" stop-opacity="0" />
            </linearGradient>
            <path fill="url(#SVGaHx2YdtF)" fill-opacity=".3" d="M78.2 234.7c0-35.3 28.7-64 64-64h192c-23.6 0-42.7 19.1-42.7 42.7v85.3c0 23.6-19.1 42.7-42.7 42.7h-85.3c-47.1 0-85.3 38.2-85.3 85.3z" />
            <linearGradient id="SVG0ARuJmyD" x1="89.567" x2="326.102" y1="304.297" y2="509.448" gradientTransform="matrix(1 0 0 -1 0 514)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#66d052" />
              <stop offset="1" stop-color="#85e972" />
            </linearGradient>
            <path fill="url(#SVG0ARuJmyD)" d="M78.2 85.3C78.2 38.2 116.4 0 163.6 0h170.7v170.7H163.6c-47.1 0-85.3 38.2-85.3 85.3V85.3z" />
            <radialGradient id="SVGkGBPOeNV" cx="-814.063" cy="816.814" r="14.222" gradientTransform="matrix(-9.0188 0 0 19.094 -7016.886 -15487.255)" gradientUnits="userSpaceOnUse">
              <stop offset=".292" stop-color="#4eb43b" />
              <stop offset="1" stop-color="#72cc61" stop-opacity="0" />
            </radialGradient>
            <path fill="url(#SVGkGBPOeNV)" d="M78.2 85.3C78.2 38.2 116.4 0 163.6 0h170.7v170.7H163.6c-47.1 0-85.3 38.2-85.3 85.3V85.3z" />
            <linearGradient id="SVGVUAjgb5K" x1="193.631" x2="78.222" y1="386" y2="386" gradientTransform="matrix(1 0 0 -1 0 514)" gradientUnits="userSpaceOnUse">
              <stop offset=".184" stop-color="#c0e075" stop-opacity="0" />
              <stop offset="1" stop-color="#d1eb95" />
            </linearGradient>
            <path fill="url(#SVGVUAjgb5K)" d="M78.2 85.3C78.2 38.2 116.4 0 163.6 0h170.7v170.7H163.6c-47.1 0-85.3 38.2-85.3 85.3V85.3z" />
            <radialGradient id="SVG86hIfcXx" cx="-758.923" cy="815.212" r="14.222" gradientTransform="rotate(218.97 -11081.4 5923.97)scale(21.751 21.6904)" gradientUnits="userSpaceOnUse">
              <stop offset=".44" stop-color="#79e96d" />
              <stop offset="1" stop-color="#d0eb76" />
            </radialGradient>
            <path fill="url(#SVG86hIfcXx)" d="M462.2 0h-128c-23.6 0-42.7 19.1-42.7 42.7V128c0 23.6 19.1 42.7 42.7 42.7h128c23.6 0 42.7-19.1 42.7-42.7V42.7c0-23.6-19.1-42.7-42.7-42.7" />
            <radialGradient id="SVGj4kBUbvE" cx="-665.253" cy="799.243" r="14.222" gradientTransform="matrix(16 16 45.5476 -45.5476 -25752.482 47289.465)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#20a85e" />
              <stop offset=".944" stop-color="#09442a" />
            </radialGradient>
            <path fill="url(#SVGj4kBUbvE)" d="M53.3 241.8h135.1c25.5 0 46.2 20.7 46.2 46.2v135.1c0 25.5-20.7 46.2-46.2 46.2H53.3c-25.5 0-46.2-20.7-46.2-46.2V288c0-25.5 20.7-46.2 46.2-46.2" />
            <radialGradient id="SVGnKh77dwp" cx="-646.865" cy="859.937" r="14.222" gradientTransform="matrix(0 11.2 12.9 0 -10972.3 7623.2)" gradientUnits="userSpaceOnUse">
              <stop offset=".58" stop-color="#33a662" stop-opacity="0" />
              <stop offset=".974" stop-color="#98f0b0" />
            </radialGradient>
            <path fill="url(#SVGnKh77dwp)" fill-opacity=".3" d="M53.3 241.8h135.1c25.5 0 46.2 20.7 46.2 46.2v135.1c0 25.5-20.7 46.2-46.2 46.2H53.3c-25.5 0-46.2-20.7-46.2-46.2V288c0-25.5 20.7-46.2 46.2-46.2" />
            <path fill="#fff" d="M180.7 420.6h-35.1l-22-41.4c-.8-1.5-1.4-2.6-1.8-3.4c-.4-.9-.8-1.9-1.2-3.1h-.4c-.5 1.5-1.1 2.6-1.5 3.5c-.5.9-1.1 2-1.7 3.4l-22.8 41.1H61.1l39.7-65.1l-37-64.9h34.6l19.6 37c.8 1.5 1.5 2.8 2 4q.9 1.65 1.8 3.9h.4c.8-1.8 1.5-3.1 2-4.2c.5-1 1.3-2.4 2.2-4.1l20.3-36.6h33l-37.5 63.9z" />
          </svg>

          Export
        </Button>

        {/* Filter Group Container (GroupDx style) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#D6D6D8',
            borderRadius: '12px',
            p: '4px',
            gap: 0,
            "& > .filter-divider": {
              width: '1px',
              height: 18,
              bgcolor: '#BDBDC0',
              mx: 0.5,
            }
          }}
        >
          {/* 5. Custom Multi-Select Company Filter */}
          <CustomMultiSelectDropdown
            title="Company"
            options={allCompanyOptions}
            selectedValues={Array.isArray(selectedCompany) ? selectedCompany : (selectedCompany === 'all' ? [] : [selectedCompany])}
            onChange={(newVal) => {
              if (setSelectedCompany) setSelectedCompany(newVal);
            }}
            triggerStyle={getFilterStyle(Array.isArray(selectedCompany) ? selectedCompany.length > 0 : (selectedCompany && selectedCompany !== 'all'))}
          />

          <Box className="filter-divider" />

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
            triggerStyle={getFilterStyle(Array.isArray(filterBy) ? filterBy.length > 0 : (filterBy && filterBy !== 'all'))}
          />

          <Box className="filter-divider" />

          {/* 7. Lead CRM Airbnb-Inspired Date Range Picker */}
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <AirbnbDateRangePicker
              startDate={dateRangeObj?.start || null}
              endDate={dateRangeObj?.end || null}
              onChange={({ start, end }) => {
                if (setDateRangeObj) setDateRangeObj({ start, end });
              }}
              triggerStyle={getFilterStyle(Boolean(dateRangeObj?.start || dateRangeObj?.end))}
            />
          </Box>

          <Box className="filter-divider" />

          {/* 8. Custom Multi-Select Status Dropdown */}
          <CustomMultiSelectDropdown
            title="Status"
            options={allStatusOptions}
            selectedValues={Array.isArray(statusFilter) ? statusFilter : (statusFilter === 'all' || !statusFilter ? [] : [statusFilter])}
            onChange={(newVal) => {
              if (setStatusFilter) setStatusFilter(newVal);
            }}
            triggerStyle={getFilterStyle(Array.isArray(statusFilter) ? statusFilter.length > 0 : (statusFilter && statusFilter !== 'all'))}
          />
        </Box>

        {/* 9. Clear All Filters / Reset Button */}
        {hasActiveFilters && (
          <Tooltip title="Clear all active filters" arrow>
            <Button
              disableElevation
              disableRipple
              onClick={onClearAll}
              startIcon={<X size={13} weight="bold" />}
              sx={{
                bgcolor: '#D6D6D8',
                color: '#000',
                height: 32,
                fontSize: '0.75rem',
                fontWeight: 650,
                textTransform: 'none',
                borderRadius: '10px',
                px: 1.5,
                transition: 'all 0.15s ease',
                "&:hover": { bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)' },
                "&:active": { bgcolor: '#F8FAFC' },
              }}
            >
              Clear{activeFilterCount > 1 ? ` (${activeFilterCount})` : ''}
            </Button>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
