import React, { useEffect, useState, useCallback } from 'react';
import {
  Popover,
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Fade
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

export default function DescriptionEditPopover({
  open,
  anchorEl,
  initialValue = '',
  label = 'Description',
  maxLength = 500,
  loading = false,
  onSave,
  onClose,
}) {
  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(initialValue || '');
      setError('');
    }
  }, [open, initialValue]);

  const handleSave = useCallback(() => {
    setError('');
    if (onSave) {
      const result = onSave(value.trim());
      if (result?.error) {
        setError(result.error);
      }
    }
  }, [onSave, value]);

  const handleClose = useCallback(() => {
    if (!loading && onClose) onClose();
  }, [onClose, loading]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  const tooLong = maxLength ? value.length > maxLength : false;

  return (
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
        elevation: 6,
        sx: {
          position: 'relative',
          maxWidth: 420,
          borderRadius: 2.5,
          px: 2,
          pt: 1.5,
          pb: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          boxShadow:
            '0 20px 45px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.12)',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 12,
            height: 12,
            top: -6,
            left: 18,
            transform: 'rotate(45deg)',
            backgroundColor: 'background.paper',
            borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: 'inherit',
            zIndex: -1,
          },
        },
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoFixHighRoundedIcon sx={{ fontSize: 18, opacity: 0.7 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Edit {label}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={handleClose}
          disabled={loading}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* Error message */}
      <Fade in={Boolean(error)}>
        <Box
          sx={{
            mb: 1,
            px: 1,
            py: 0.7,
            borderRadius: 1.5,
            bgcolor: 'error.lighter',
            color: 'error.dark',
            fontSize: 12.5,
            display: error ? 'block' : 'none',
          }}
        >
          {error}
        </Box>
      </Fade>

      {/* Text Area */}
      <TextField
        autoFocus
        fullWidth
        disabled={loading}
        multiline
        minRows={3}
        maxRows={8}
        placeholder={`Add a clear, concise ${label.toLowerCase()}...`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          sx: {
            fontSize: 14,
            borderRadius: 1.5,
          },
        }}
      />

      {/* Footer */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mt={1.25}
      >
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {value.length}/{maxLength}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            onClick={handleClose}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={loading || !value.trim() || tooLong}
            sx={{
              textTransform: 'none',
              borderRadius: 999,
              px: 2.5,
              minWidth: 90,
              position: 'relative',
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              'Save'
            )}
          </Button>
        </Stack>
      </Stack>

      <Typography
        variant="caption"
        sx={{ mt: 0.5, display: 'block', opacity: 0.6 }}
      >
        Tip: Press <b>Ctrl/⌘ + Enter</b> to save, <b>Esc</b> to cancel.
      </Typography>
    </Popover>
  );
}
