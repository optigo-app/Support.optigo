'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Autocomplete,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  X,
  PencilSimpleLine,
  CheckCircle,
  Buildings,
  ChatCircleText,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';
import { editCallModal$, closeEditCallModal, useNewCallSubject } from './rxjs/newCallEvents';
import { callStreamService } from '../../services/callStreamService';

export default function NewCallEditModal() {
  const modalState = useNewCallSubject(editCallModal$);
  const { open, call } = modalState || {};

  const {
    companyOptions = [],
    APPNAME_LIST = [],
    forwardOption = [],
    STATUS_LIST = [],
    ESTATUS_LIST = [],
    PRIORITY_LIST = [],
    editCall,
    triggerRefresh,
  } = useCallLog();

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    company: null,
    customerName: '',
    description: '',
    appname: null,
    receivedBy: null,
    forwardTo: null,
    status: null,
    estatus: null,
    priority: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && call) {
      const raw = call.rawRecord || call;

      const compMatch = companyOptions.find(
        (c) =>
          c.label?.toLowerCase() === (call.company || raw.company || '').toLowerCase() ||
          c.value === raw.projectID ||
          c.value === raw.CompanyCode
      );

      const appMatch = APPNAME_LIST.find(
        (a) => a.AppName === (call.appname || raw.appname) || a.AppId === (call.appname || raw.appname)
      );

      const statusMatch = STATUS_LIST.find(
        (s) =>
          String(s.value) === String(raw.StatusID || raw.statusId) ||
          s.label?.toLowerCase() === (call.status || raw.status || '').toLowerCase()
      );

      const estatusMatch = ESTATUS_LIST.find(
        (e) =>
          String(e.value) === String(raw.EStatusId || raw.estatusId) ||
          e.label?.toLowerCase() === (call.estatus || raw.Estatus || '').toLowerCase()
      );

      const priorityMatch = PRIORITY_LIST.find(
        (p) =>
          String(p.value) === String(raw.PriorityId || raw.priorityId) ||
          p.label?.toLowerCase() === (call.priority || raw.priority || '').toLowerCase()
      );

      const fwdMatch = forwardOption.find(
        (f) =>
          f.id === raw.forward ||
          f.id === `${raw.DeptId},${raw.EmpId}` ||
          f.person?.toLowerCase() === (raw.AssignedEmpName || raw.ForwardedEmp || '').toLowerCase()
      );

      setFormData({
        company: compMatch || (call.company ? { label: call.company, value: raw.projectID || call.company } : null),
        customerName: call.callBy || raw.callBy || raw.customerName || '',
        description: call.lastMessage || raw.description || raw.Descr || '',
        appname: appMatch || null,
        receivedBy: raw.receivedBy ? { label: raw.receivedBy, value: raw.receivedBy } : null,
        forwardTo: fwdMatch || null,
        status: statusMatch || null,
        estatus: estatusMatch || null,
        priority: priorityMatch || null,
      });
    }
  }, [open, call, companyOptions, APPNAME_LIST, STATUS_LIST, ESTATUS_LIST, PRIORITY_LIST, forwardOption]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!call?.sr) {
      toast.error('Missing call log reference');
      return;
    }

    if (!formData.customerName.trim()) {
      toast.error('Caller Name is required');
      return;
    }

    setLoading(true);
    try {
      const raw = call.rawRecord || call;

      const payload = {
        CreatedBy: user?.id,
        CustomerName: formData.customerName.trim(),
        PriorityId: formData.priority?.value || raw.PriorityId || '',
        ParentId: raw.ParentCalllogId || '',
        Descr: formData.description || '',
        EmpId: formData.forwardTo?.id?.split(',')?.[1] || raw.EmpId || '',
        DeptId: formData.forwardTo?.id?.split(',')?.[0] || raw.DeptId || '',
        StatusId: formData.status?.value || raw.StatusID || '',
        Estatus: formData.estatus?.value || raw.EStatusId || '',
        calldetails: formData.description || '',
        EntryDate: raw.date || raw.callStart || '',
        appID: formData.appname?.AppId || raw.appname || '',
      };

      if (editCall) {
        const result = await editCall(call.sr, payload);
        if (result && !result.success) {
          const errorMsg =
            result?.msg?.stat_msg ||
            result?.error?.message ||
            'You do not have permission to edit this call.';
          toast.error(errorMsg);
          return;
        }
      }

      // Optimistic update only on success
      callStreamService.updateCallStatus(call.id, {
        callBy: formData.customerName.trim(),
        description: formData.description,
        lastMessage: formData.description,
        priority: formData.priority?.label || call.priority,
        status: formData.estatus?.label || call.status,
        estatus: formData.status?.label || call.estatus,
      });

      toast.success('Call log updated successfully');
      if (triggerRefresh) triggerRefresh();
      closeEditCallModal();
    } catch (err) {
      toast.error(err?.message || 'Failed to update call log');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={closeEditCallModal}
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
          <PencilSimpleLine size={16} weight="bold" color="#FFFFFF" />
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Edit Call Log #{call?.sr} • {formData.company?.label || call?.company || 'Call Details'}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={closeEditCallModal}
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
        onSubmit={handleSave}
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Scrollable Form Content */}
        <Box
          sx={{
            maxHeight: '75vh',
            overflowY: 'auto',
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* SECTION 1: Company & Caller Information */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8 }}>
                  <Chip
                    icon={<Buildings size={13} weight="bold" color="#6900C6" />}
                    label="Core Identity"
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
                    Company & Caller Information
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1.2fr 1fr' }, gap: 1.8 }}>
                  {/* Company Name is locked after call creation matching old Call Log */}
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Company / Client (Locked)
                    </Typography>
                    <Autocomplete
                      disabled
                      options={companyOptions}
                      getOptionLabel={(opt) => opt?.label || opt?.name || ''}
                      value={formData.company}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Company"
                          size="small"
                          disabled
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#F8FAFC',
                              borderRadius: 2,
                              fontSize: 13,
                              color: '#64748B',
                              '& fieldset': { borderColor: '#E2E8F0' },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Caller Name *
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="e.g. Ramesh Soni"
                      required
                      fullWidth
                      value={formData.customerName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#FFFFFF',
                          borderRadius: 2,
                          fontSize: 13,
                          fontWeight: 600,
                          '& fieldset': { borderColor: '#CBD5E1' },
                          '&:hover fieldset': { borderColor: '#94A3B8' },
                          '&.Mui-focused fieldset': { borderColor: '#6900C6', borderWidth: 1.5 },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Application / Module
                    </Typography>
                    <Autocomplete
                      options={APPNAME_LIST}
                      getOptionLabel={(opt) => opt?.AppName || opt?.label || ''}
                      value={formData.appname}
                      onChange={(_, val) => setFormData((prev) => ({ ...prev, appname: val }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Module"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#F8FAFC',
                              borderRadius: 2,
                              fontSize: 13,
                              '& fieldset': { borderColor: '#E2E8F0' },
                              '&:hover fieldset': { borderColor: '#CBD5E1' },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* SECTION 2: Description / Notes */}
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
              2
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
                    label="Call Details"
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
                    Call Description & Issue Notes
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={2.5}
                  placeholder="Enter details, issues, or instructions discussed during this call..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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

          {/* SECTION 3: Workflow, Status & Assignment */}
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
              3
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8 }}>
                  <Chip
                    icon={<SlidersHorizontal size={13} weight="bold" color="#6900C6" />}
                    label="Status & Routing"
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
                    Status, Priority & Routing
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.8, mb: 1.8 }}>
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Internal Status
                    </Typography>
                    <Autocomplete
                      options={STATUS_LIST}
                      getOptionLabel={(opt) => opt?.label || opt?.Name || ''}
                      value={formData.status}
                      onChange={(_, val) => setFormData((prev) => ({ ...prev, status: val }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select internal status"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#FFFFFF',
                              borderRadius: 2,
                              fontSize: 13,
                              '& fieldset': { borderColor: '#CBD5E1' },
                              '&:hover fieldset': { borderColor: '#94A3B8' },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      External Status
                    </Typography>
                    <Autocomplete
                      options={ESTATUS_LIST}
                      getOptionLabel={(opt) => opt?.label || opt?.Name || ''}
                      value={formData.estatus}
                      onChange={(_, val) => setFormData((prev) => ({ ...prev, estatus: val }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select external status"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#FFFFFF',
                              borderRadius: 2,
                              fontSize: 13,
                              '& fieldset': { borderColor: '#CBD5E1' },
                              '&:hover fieldset': { borderColor: '#94A3B8' },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.8 }}>
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Priority
                    </Typography>
                    <Autocomplete
                      options={PRIORITY_LIST}
                      getOptionLabel={(opt) => opt?.label || opt?.PriorityName || ''}
                      value={formData.priority}
                      onChange={(_, val) => setFormData((prev) => ({ ...prev, priority: val }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select priority"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#FFFFFF',
                              borderRadius: 2,
                              fontSize: 13,
                              '& fieldset': { borderColor: '#CBD5E1' },
                              '&:hover fieldset': { borderColor: '#94A3B8' },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Assign / Forward To
                    </Typography>
                    <Autocomplete
                      options={forwardOption}
                      getOptionLabel={(opt) =>
                        opt?.person || opt?.user || opt?.EmpName || opt?.label || ''
                      }
                      value={formData.forwardTo}
                      onChange={(_, val) => setFormData((prev) => ({ ...prev, forwardTo: val }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select assignee"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#FFFFFF',
                              borderRadius: 2,
                              fontSize: 13,
                              '& fieldset': { borderColor: '#CBD5E1' },
                              '&:hover fieldset': { borderColor: '#94A3B8' },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
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
            onClick={closeEditCallModal}
            color="inherit"
            size="small"
            disabled={loading}
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
            disabled={loading}
            size="small"
            startIcon={<CheckCircle size={15} weight="bold" />}
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
