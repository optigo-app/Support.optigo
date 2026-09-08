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
      toast.error('Please enter a follow-up description');
      return;
    }
    if (!targetCall?.sr) {
      toast.error('No target call selected');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Add follow-up call
      const res = await addFollowUpCall(targetCall.sr);
      if (!res?.success) {
        toast.error(res?.error?.message || 'Failed to create follow-up');
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

      toast.success('Follow-up recorded successfully');

      if (triggerRefresh) triggerRefresh();
      closeAddFollowUpModal();
    } catch (err) {
      console.error('Error saving follow-up:', err);
      toast.error('An error occurred while saving follow-up');
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
        sx: {
          borderRadius: '20px',
          bgcolor: '#565A61', // Dark slate header layer
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 1px 1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          pt: '2px',
          m: 2,
        },
      }}
    >
      {/* Layer 1: Top Bar */}
      <Box
        sx={{
          height: 42,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArrowsClockwise size={16} weight="bold" color="#FFFFFF" />
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Add Follow-Up Call #{targetCall?.sr} • {targetCall?.company || 'Company'}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={closeAddFollowUpModal}
          sx={{
            color: 'rgba(255, 255, 255, 0.85)',
            p: 0.35,
            '&:hover': {
              color: '#FFFFFF',
              bgcolor: 'rgba(255, 255, 255, 0.12)',
            },
          }}
        >
          <X size={16} weight="bold" />
        </IconButton>
      </Box>

      {/* Layer 2: Inner White Form Card */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Form Content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* SECTION 1: Follow-Up Details */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1.5,
                bgcolor: '#6900C6',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                mt: 0.6,
                flexShrink: 0,
                boxShadow: '0 2px 5px rgba(105, 0, 198, 0.2)',
              }}
            >
              1
            </Box>

            <Card
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 2.5,
                borderColor: '#E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                bgcolor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Chip
                    icon={<ChatCircleText size={13} weight="bold" color="#6900C6" />}
                    label="Follow-Up Scope"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: '#F3E8FF',
                      color: '#6900C6',
                      borderRadius: 1,
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: '#0F172A' }}>
                    Follow-Up Description & Notes
                  </Typography>
                </Box>

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
                      bgcolor: '#F8FAFC',
                      borderRadius: 2,
                      fontSize: 13,
                      lineHeight: 1.5,
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#6900C6', borderWidth: 1.5 },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Footer Action Bar */}
        <Box
          sx={{
            px: 3,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            borderTop: '1px solid #F1F5F9',
            bgcolor: '#FFFFFF',
          }}
        >
          <Button
            onClick={closeAddFollowUpModal}
            color="inherit"
            size="small"
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              fontSize: 13,
              color: '#475569',
              px: 2,
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={isSubmitting || !description.trim()}
            startIcon={<Plus size={15} weight="bold" />}
            sx={{
              bgcolor: '#6900C6',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.8,
              py: 0.7,
              boxShadow: '0 2px 8px rgba(105, 0, 198, 0.25)',
              '&:hover': {
                bgcolor: '#5800A8',
                boxShadow: '0 4px 12px rgba(105, 0, 198, 0.35)',
              },
            }}
          >
            {isSubmitting ? 'Recording...' : 'Add Follow-Up'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
