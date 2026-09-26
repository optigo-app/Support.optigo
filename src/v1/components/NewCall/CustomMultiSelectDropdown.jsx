'use client';
import React, { useState, useMemo } from 'react';
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

export default function CustomMultiSelectDropdown({
  title = 'Select',
  options = [], // Array of string labels or { id, label } objects
  selectedValues = [], // Array of selected string values
  onChange,
  triggerStyle = {},
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normalizedOptions, searchQuery]);

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

  const handleToggleItem = (id) => {
    if (tempSelected.includes(id)) {
      setTempSelected(tempSelected.filter((v) => v !== id));
    } else {
      setTempSelected([...tempSelected, id]);
    }
  };

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

  return (
    <>
      {/* Clean Light Mode Trigger Button */}
      <Button
        onClick={handleOpen}
        endIcon={<CaretDown size={13} color="#475569" weight="bold" />}
        sx={{
          height: 32,
          px: 1.4,
          bgcolor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '5px',
          color: '#1E293B',
          fontSize: '0.78rem',
          fontWeight: 650,
          textTransform: 'none',
          minWidth: 95,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease-in-out',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          '&:hover': {
            bgcolor: '#F8FAFC',
            borderColor: '#94A3B8',
          },
          ...triggerStyle,
        }}
      >
        {triggerLabel}
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
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.08)',
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
                  fontWeight: 700,
                  color: '#2563EB',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
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
                borderColor: '#2563EB',
                bgcolor: '#FFFFFF',
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
              },
            }}
          >
            <MagnifyingGlass size={15} color="#2563EB" weight="bold" style={{ flexShrink: 0 }} />
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
              bgcolor: allSelected ? '#EFF6FF' : '#F8FAFC',
              border: allSelected ? '1px solid #BFDBFE' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { bgcolor: allSelected ? '#DBEAFE' : '#F1F5F9' },
            }}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={isIndeterminate}
              onChange={handleToggleAll}
              size="small"
              sx={{
                p: 0,
                color: '#CBD5E1',
                '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
              }}
            />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '0.84rem',
                color: '#2563EB',
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
                  fontWeight: 800,
                  bgcolor: '#2563EB',
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
            filteredOptions.map((opt) => {
              const isChecked = tempSelected.includes(opt.id);

              return (
                <Box
                  key={opt.id}
                  onClick={() => handleToggleItem(opt.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    px: 1.2,
                    py: 0.65,
                    borderRadius: '6px',
                    bgcolor: isChecked ? '#EFF6FF' : 'transparent',
                    border: isChecked ? '1px solid #BFDBFE' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    userSelect: 'none',
                    '&:hover': {
                      bgcolor: isChecked ? '#DBEAFE' : '#F8FAFC',
                    },
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleToggleItem(opt.id)}
                    size="small"
                    sx={{
                      p: 0,
                      color: '#CBD5E1',
                      '&.Mui-checked': { color: '#2563EB' },
                    }}
                  />

                  {/* Option Label */}
                  <Typography
                    sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#0F172A' : '#334155',
                      fontWeight: isChecked ? 700 : 500,
                      flex: 1,
                      noWrap: true,
                    }}
                  >
                    {opt.label}
                  </Typography>

                  {isChecked && <Check size={14} color="#2563EB" weight="bold" style={{ flexShrink: 0 }} />}
                </Box>
              );
            })
          )}
        </Box>

        {/* Modern Vibrant Action Footer Banner */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            p: 1.2,
            px: 1.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mt: 0.8,
          }}
        >
          <Typography
            noWrap
            sx={{
              color: '#FFFFFF',
              fontSize: '0.76rem',
              fontWeight: 650,
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
            variant="contained"
            size="small"
            startIcon={<Check size={14} weight="bold" />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#1D4ED8',
              fontWeight: 800,
              fontSize: '0.78rem',
              textTransform: 'none',
              px: 1.8,
              py: 0.45,
              minWidth: 72,
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#F8FAFC',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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
