'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { X, ArrowsClockwise, Plus, ChatCircleText } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '../../context/UseAuth';
import { useCallLog } from '../../context/UseCallLog';
import {
  addFollowUpModal$,
  closeAddFollowUpModal,
  useNewCallSubject,
} from './rxjs/newCallEvents';
import { callStreamService } from './services/callStreamService';

export default function NewCallFollowUpModal() {
  const modalState = useNewCallSubject(addFollowUpModal$);
  const { user } = useAuth();
  const { addFollowUpCall, editFollowUpCall, triggerRefresh } = useCallLog();

  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetCall = modalState.call;

  useEffect(() => {
    if (modalState.open) {
      setDescription('');
      setIsSubmitting(false);
    }
  }, [modalState.open]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!description.trim()) {
      // toast.error('Please enter a follow-up description');
      return;
    }
    if (!targetCall?.sr) {
      // toast.error('No target call selected');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Add follow-up call
      const res = await addFollowUpCall(targetCall.sr);
      if (!res?.success) {
        // toast.error(res?.error?.message || 'Failed to create follow-up');
        return;
      }

      // 2. Update description for the newly added follow-up with correct object payload
      const fuId = res?.followUp?.followUpCallId;
      if (fuId && editFollowUpCall) {
        await editFollowUpCall({
          callLogId: targetCall.sr,
          followUpCallId: fuId,
          descr: description.trim(),
        });
      }

      // 3. Immediately patch stream with the new follow-up & description without duplicate customMessage
      const userName = user?.firstname
        ? `${user.firstname} ${user.lastname || ''}`.trim()
        : user?.name || 'Support Desk';

      if (fuId && targetCall.sr) {
        callStreamService.patchFollowUpCall(targetCall.sr, fuId, {
          Id: fuId,
          Description: description.trim(),
          Descr: description.trim(),
          CreatedBy: userName,
          ReceivedBy: userName,
          CallStart: '',
          CallClosed: '1900-01-01T00:00:00',
          CallDuration: '00:00:00',
          InternalStatus: 'Pending',
          InternalStatusId: 0,
        });
      }

      // toast.success('Follow-up recorded successfully');

      if (triggerRefresh) triggerRefresh();
      closeAddFollowUpModal();
    } catch (err) {
      console.error('Error saving follow-up:', err);
      // toast.error('An error occurred while saving follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!modalState.open) return null;

  return (
    <Dialog
      open={modalState.open}
      onClose={closeAddFollowUpModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          maxWidth: '540px !important',
          width: '100%',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #e6e9ef',
          boxShadow:
            '0 1px 2px rgba(31,41,75,0.06), 0 8px 24px rgba(31,41,75,0.10)',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfd 100%)',
          m: 2,
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IconButton
          size="small"
          onClick={closeAddFollowUpModal}
          aria-label="Close dialog"
          sx={{
            color: '#4a556e',
            p: 0.5,
            borderRadius: '6px',
            '&:hover': { bgcolor: '#f3f4f7' },
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10,
          }}
        >
          <X size={17} weight="bold" />
        </IconButton>

        <Box sx={{ px: 3.75, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ArrowsClockwise size={20} weight="bold" color="#2f3a54" />
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2f3a54' }}>
              Add Follow-Up Call #{targetCall?.sr}
            </Typography>
          </Box>
        </Box>
        {/* Form Content */}
        <Box
          sx={{
            px: 3.75,
            py: 3,
            bgcolor: '#f9fafc',
            borderTop: '1px solid #dde1e9',
          }}
        >
          <TextField
            fullWidth
            multiline
            rows={4}
            required
            placeholder="Enter reason or discussion notes for this follow-up call..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                borderRadius: '6px',
                fontSize: 14.5,
                color: '#2f3a54',
                '& fieldset': { borderColor: '#dde1e9' },
                '&:hover fieldset': { borderColor: '#c3c9d6' },
                '&.Mui-focused fieldset': { borderColor: '#5b80d6', borderWidth: 1 },
              },
            }}
          />
        </Box>

        {/* Footer Action Bar */}
        <Box
          sx={{
            px: 3.75,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            bgcolor: '#eceef2',
            borderTop: '1px solid #dde1e9',
          }}
        >
          <Button
            onClick={closeAddFollowUpModal}
            color="inherit"
            size="small"
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              color: '#4a556e',
              px: 2,
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isSubmitting || !description.trim()}
            sx={{
              bgcolor: '#e6e9ef',
              color: '#a3abbd',
              fontWeight: 600,
              fontSize: 14.5,
              textTransform: 'none',
              borderRadius: '6px',
              px: 3,
              py: 0.8,
              '&:hover': {
                bgcolor: '#d5d9e2',
              },
              ...(description.trim() && {
                bgcolor: '#1942b0',
                color: '#fff',
                '&:hover': { bgcolor: '#123184' },
              }),
            }}
          >
            {isSubmitting ? 'Recording...' : 'Add Follow-Up'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
