'use client';
import React, { useState, useMemo, useDeferredValue, useCallback } from 'react';
import {
  Box,
  Button,
  Popover,
  Typography,
  Checkbox,
  InputBase,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CaretDown,
  MagnifyingGlass,
  Check,
  X,
} from '@phosphor-icons/react';

const OptionItem = React.memo(({ opt, isChecked, onToggle }) => (
  <Box
    onClick={() => onToggle(opt.id)}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.2,
      px: 1.2,
      py: 0.65,
      borderRadius: '6px',
      bgcolor: isChecked ? '#F1F5F9' : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.12s ease',
      userSelect: 'none',
      '&:hover': {
        bgcolor: isChecked ? '#E2E8F0' : '#F8FAFC',
      },
    }}
  >
    <Checkbox
      checked={isChecked}
      size="small"
      tabIndex={-1}
      disableRipple
      sx={{
        p: 0,
        pointerEvents: 'none',
        flexShrink: 0,
        color: '#CBD5E1',
        '&.Mui-checked': { color: '#0F172A' },
      }}
    />
    <Typography
      sx={{
        fontSize: '0.84rem',
        color: isChecked ? '#0F172A' : '#334155',
        fontWeight: isChecked ? 600 : 500,
        flex: 1,
        noWrap: true,
      }}
    >
      {opt.label}
    </Typography>
    {isChecked && <Check size={14} color="#0F172A" weight="bold" style={{ flexShrink: 0 }} />}
  </Box>
));

export default function CustomMultiSelectDropdown({
  title = 'Select',
  options = [], // Array of string labels or { id, label } objects
  selectedValues = [], // Array of selected string values
  onChange,
  triggerStyle = {},
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [tempSelected, setTempSelected] = useState(selectedValues);

  const open = Boolean(anchorEl);

  // Helper to format string labels cleanly
  const formatLabel = (str) => {
    if (!str) return '';
    const trimmed = String(str).trim();
    if (trimmed.toLowerCase() === 'dcj') return 'DCJ';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // Normalize options to objects { id, label }
  const normalizedOptions = useMemo(() => {
    return options
      .filter((opt) => opt !== null && opt !== undefined && opt !== '')
      .map((opt) => {
        if (typeof opt === 'object') {
          const id = String(opt.id ?? opt.value ?? opt.label ?? opt.name ?? '');
          const label = String(opt.label ?? opt.name ?? opt.id ?? opt.value ?? '');
          if (!id || id === 'undefined' || id === 'null' || !label || label === 'undefined') return null;
          return {
            id,
            label: formatLabel(label),
            raw: label,
          };
        }
        const raw = String(opt);
        if (!raw || raw === 'undefined' || raw === 'null') return null;
        return { id: raw, label: formatLabel(raw), raw };
      })
      .filter(Boolean);
  }, [options]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setTempSelected(Array.isArray(selectedValues) ? selectedValues : []);
    setSearchQuery('');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDone = () => {
    if (onChange) onChange(tempSelected);
    handleClose();
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  // Filtered options based on internal search query
  const filteredOptions = useMemo(() => {
    let result = [...normalizedOptions];
    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.toLowerCase().trim();
      result = result.filter((opt) => opt.label.toLowerCase().includes(q));
    }
    // Sort so selected items appear at the top
    return result.sort((a, b) => {
      const aSelected = tempSelected.includes(a.id);
      const bSelected = tempSelected.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [normalizedOptions, deferredSearchQuery, tempSelected]);

  // Check state calculations
  const allSelected =
    normalizedOptions.length > 0 && tempSelected.length === normalizedOptions.length;
  const isIndeterminate =
    tempSelected.length > 0 && tempSelected.length < normalizedOptions.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setTempSelected([]);
    } else {
      setTempSelected(normalizedOptions.map((o) => o.id));
    }
  };

  const handleToggleItem = useCallback((id) => {
    setTempSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // Trigger button label display
  const triggerLabel = useMemo(() => {
    const activeArr = Array.isArray(selectedValues) ? selectedValues : [];
    if (activeArr.length === 0) return title;
    if (normalizedOptions.length > 0 && activeArr.length === normalizedOptions.length) {
      return `${title} (All)`;
    }
    if (activeArr.length === 1) {
      const found = normalizedOptions.find((o) => o.id === activeArr[0]);
      return found ? found.label : title;
    }
    return `${title} (${activeArr.length})`;
  }, [selectedValues, normalizedOptions, title]);

  const hasSelected = Array.isArray(selectedValues) && selectedValues.length > 0;

  return (
    <>
      {/* Clean Light Mode Trigger Button */}
      <Button
        onClick={handleOpen}
        endIcon={<CaretDown size={13} color={hasSelected ? '#2563EB' : '#475569'} weight="bold" />}
        sx={{
          height: 32,
          px: 1.4,
          bgcolor: hasSelected ? '#EFF6FF' : '#FFFFFF',
          border: '1px solid',
          borderColor: hasSelected ? '#93C5FD' : '#CBD5E1',
          borderRadius: '5px',
          color: hasSelected ? '#1D4ED8' : '#1E293B',
          fontSize: '0.78rem',
          fontWeight: 650,
          textTransform: 'none',
          minWidth: 95,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease-in-out',
          boxShadow: hasSelected ? '0 1px 3px rgba(37, 99, 235, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
          '&:hover': {
            bgcolor: hasSelected ? '#DBEAFE' : '#F8FAFC',
            borderColor: hasSelected ? '#60A5FA' : '#94A3B8',
          },
          ...triggerStyle,
        }}
      >
        <span>{triggerLabel}</span>
        {hasSelected && (
          <Box
            component="span"
            title="Clear this filter"
            onClick={(e) => {
              e.stopPropagation();
              setTempSelected([]);
              if (onChange) onChange([]);
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 0.7,
              p: 0.25,
              borderRadius: '50%',
              color: '#2563EB',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              '&:hover': {
                bgcolor: '#BFDBFE',
                color: '#1E40AF',
              },
            }}
          >
            <X size={11} weight="bold" />
          </Box>
        )}
      </Button>

      {/* Production Grade Aesthetic Popover Menu */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 0.8,
            width: 280,
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        {/* Header Title & Actions */}
        <Box sx={{ px: 2, pt: 1.6, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', letterSpacing: '-0.01em' }}
            >
              {title}
            </Typography>

            {tempSelected.length > 0 && (
              <Typography
                onClick={handleClear}
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  color: '#64748B',
                  cursor: 'pointer',
                  '&:hover': { color: '#0F172A', textDecoration: 'underline' },
                }}
              >
                Clear all
              </Typography>
            )}
          </Box>

          {/* Search Box inside Popover */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              px: 1.2,
              height: 34,
              transition: 'all 0.15s ease',
              '&:focus-within': {
                borderColor: '#94A3B8',
                bgcolor: '#FFFFFF',
              },
            }}
          >
            <MagnifyingGlass size={15} color="#94A3B8" weight="bold" style={{ flexShrink: 0 }} />
            <InputBase
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              sx={{
                ml: 1,
                fontSize: '0.82rem',
                flex: 1,
                color: '#0F172A',
                fontWeight: 500,
                '& input::placeholder': { color: '#94A3B8', opacity: 1 },
              }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.2 }}>
                <X size={13} color="#64748B" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Select All Option Row */}
        <Box sx={{ px: 1.5, py: 0.4 }}>
          <Box
            onClick={handleToggleAll}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.2,
              py: 0.7,
              borderRadius: '6px',
              bgcolor: allSelected ? '#F1F5F9' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={isIndeterminate}
              size="small"
              tabIndex={-1}
              disableRipple
              sx={{
                p: 0,
                pointerEvents: 'none',
                flexShrink: 0,
                color: '#CBD5E1',
                '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#0F172A' },
              }}
            />
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.84rem',
                color: allSelected ? '#0F172A' : '#334155',
                userSelect: 'none',
              }}
            >
              Select All
            </Typography>

            {allSelected && (
              <Chip
                label="ALL"
                size="small"
                sx={{
                  ml: 'auto',
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ borderBottom: '1px solid #F1F5F9', my: 0.5 }} />

        {/* Scrollable Items List */}
        <Box
          sx={{
            maxHeight: 220,
            overflowY: 'auto',
            px: 1.5,
            py: 0.4,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.3,
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 3 },
          }}
        >
          {filteredOptions.length === 0 ? (
            <Typography
              variant="caption"
              sx={{ color: '#94A3B8', py: 2, textAlign: 'center', display: 'block', fontWeight: 500 }}
            >
              No matching options found
            </Typography>
          ) : (
            filteredOptions.map((opt) => (
              <OptionItem
                key={opt.id}
                opt={opt}
                isChecked={tempSelected.includes(opt.id)}
                onToggle={handleToggleItem}
              />
            ))
          )}
        </Box>

        {/* Minimalist Action Footer */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
            p: 1.2,
            px: 1.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mt: 0,
          }}
        >
          <Typography
            noWrap
            sx={{
              color: '#64748B',
              fontSize: '0.76rem',
              fontWeight: 500,
              flex: 1,
              minWidth: 0,
            }}
          >
            {tempSelected.length === 0
              ? 'None selected'
              : tempSelected.length === normalizedOptions.length
              ? 'All selected'
              : `${tempSelected.length} selected`}
          </Typography>

          <Button
            onClick={handleDone}
            disableElevation
            variant="contained"
            size="small"
            startIcon={<Check size={14} weight="bold" />}
            sx={{
              bgcolor: '#0F172A',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.78rem',
              textTransform: 'none',
              px: 1.8,
              py: 0.45,
              minWidth: 72,
              borderRadius: '6px',
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#334155',
              },
            }}
          >
            Done
          </Button>
        </Box>
      </Popover>
    </>
  );
}
