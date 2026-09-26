'use client';
import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  X,
  CheckCircle,
  Buildings,
  UserPlus,
  ChatCircleText,
  PhoneCall,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';
import { addCallModal$, closeAddCallModal, useNewCallSubject } from './rxjs/newCallEvents';
import { callStreamService } from './services/callStreamService';
import { addCustomerName, searchCustomerNames } from '../../libs/db';

export default function NewCallAddModal() {
  const modalState = useNewCallSubject(addCallModal$);
  const { open } = modalState || {};

  const {
    companyOptions = [],
    APPNAME_LIST = [],
    forwardOption = [],
    CALL_TYPE_MASTER = [],
    addCall,
    triggerRefresh,
  } = useCallLog();

  const { user } = useAuth();
  const companyInputRef = useRef(null);

  const [formData, setFormData] = useState({
    company: null,
    customerName: '',
    description: '',
    appname: null,
    forwardTo: null,
    callType: null,
  });

  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize form state on open - ALWAYS start completely clean / empty
  useEffect(() => {
    if (open) {
      setFormData({
        company: null,
        customerName: '',
        description: '',
        appname: null,
        forwardTo: null,
        callType: null,
      });

      setLoading(false);

      // Fetch customer suggestions from IndexedDB
      searchCustomerNames('').then(setCustomerSuggestions).catch(() => {});

      // Auto-focus first input
      setTimeout(() => {
        if (companyInputRef.current) {
          const input = companyInputRef.current.querySelector('input');
          if (input) input.focus();
        }
      }, 100);
    }
  }, [open]);

  // Search customer names dynamically
  const handleCustomerNameChange = (newVal) => {
    setFormData((prev) => ({ ...prev, customerName: newVal }));
    if (typeof newVal === 'string' && newVal.trim()) {
      searchCustomerNames(newVal).then(setCustomerSuggestions).catch(() => {});
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.company) {
      toast.error('Please select or enter a Company / Client');
      return;
    }

    const callerName = (formData.customerName || '').trim();
    if (!callerName) {
      toast.error('Caller / Contact person is required');
      return;
    }

    const desc = (formData.description || '').trim();
    if (!desc) {
      toast.error('Please provide a Call Description / Purpose');
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      // Old working API requires EntryDate as 'YYYY-MM-DD'
      const entryDate = now.toISOString().split('T')[0];
      const pad = (n) => String(n).padStart(2, '0');
      const timeFormatted = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      // Resolve numeric/string ProjectID (e.g. "30") from companyOptions
      let resolvedProjectId = '';
      let resolvedCompanyName = '';

      if (formData.company) {
        if (typeof formData.company === 'object') {
          resolvedProjectId =
            formData.company?.value !== undefined
              ? String(formData.company.value)
              : formData.company?.ProjectID !== undefined
              ? String(formData.company.ProjectID)
              : formData.company?.id !== undefined
              ? String(formData.company.id)
              : '';
          resolvedCompanyName =
            formData.company?.label ||
            formData.company?.CompanyName ||
            formData.company?.name ||
            '';
        } else if (typeof formData.company === 'string') {
          const trimmed = formData.company.trim();
          const matched = companyOptions?.find(
            (opt) =>
              opt?.label?.toLowerCase() === trimmed.toLowerCase() ||
              String(opt?.value) === trimmed ||
              opt?.label?.split('/')?.[0]?.toLowerCase() === trimmed.toLowerCase()
          );
          resolvedProjectId = matched ? String(matched.value) : trimmed;
          resolvedCompanyName = matched ? matched.label : trimmed;
        }
      }

      // Fallback matching against companyOptions if ProjectID was not found
      if (!resolvedProjectId && formData.company) {
        const rawSearch = String(formData.company?.label || formData.company || '').toLowerCase().trim();
        const matched = companyOptions?.find(
          (opt) =>
            opt?.label?.toLowerCase().trim() === rawSearch ||
            String(opt?.value) === rawSearch ||
            opt?.label?.split('/')?.[0]?.toLowerCase().trim() === rawSearch
        );
        if (matched) {
          resolvedProjectId = String(matched.value);
          resolvedCompanyName = matched.label;
        }
      }

      // Resolve App ID (string or empty "")
      const resolvedAppId =
        formData.appname?.value !== undefined
          ? String(formData.appname.value)
          : formData.appname?.AppId !== undefined
          ? String(formData.appname.AppId)
          : formData.appname?.Id !== undefined
          ? String(formData.appname.Id)
          : '';
      const resolvedAppName =
        formData.appname?.AppName ||
        formData.appname?.label ||
        formData.appname?.name ||
        '';

      // Resolve Forward target (deptId,empId)
      const forwardTarget = formData.forwardTo?.id || '';

      // Call Type ID (string or empty "")
      const resolvedCallType =
        formData.callType?.value !== undefined
          ? String(formData.callType.value)
          : formData.callType?.CallTypeId !== undefined
          ? String(formData.callType.CallTypeId)
          : formData.callType?.id !== undefined
          ? String(formData.callType.id)
          : '';

      const callPayload = {
        appname: resolvedAppId,
        receivedBy: user?.id ? String(user.id) : '',
        callBy: callerName,
        forward: forwardTarget,
        description: desc,
        date: entryDate,
        time: timeFormatted,
        company: resolvedProjectId,
        callType: resolvedCallType,
      };

      // 1. Save customer name to IndexedDB suggestions cache
      if (callerName) {
        addCustomerName(callerName).catch(() => {});
      }

      // 2. Submit to API via context's exact addCall
      if (addCall) {
        await addCall(callPayload);
      }

      // 3. Construct fully populated local record and push to RxJS stream
      const assignedName = formData.forwardTo?.person || formData.forwardTo?.name || '';
      const createdThreadRecord = {
        sr: Date.now(),
        company: resolvedCompanyName || resolvedProjectId || 'Company',
        CompanyName: resolvedCompanyName || resolvedProjectId || 'Company',
        ProjectID: resolvedProjectId,
        projectId: resolvedProjectId,
        callBy: callerName,
        CustomerName: callerName,
        appname: resolvedAppName || resolvedAppId,
        description: desc,
        Descr: desc,
        lastMessage: desc,
        date: entryDate,
        time: timeFormatted,
        timestamp: timeFormatted ? timeFormatted.slice(0, 5) : '00:00',
        status: 'Solved',
        estatus: 'Completed',
        Estatus: 'Completed',
        receivedBy: user?.firstname
          ? `${user.firstname} ${user.lastname || ''}`.trim()
          : user?.name || 'Support Desk',
        AssignedEmpName: assignedName,
        DeptName: formData.forwardTo?.dept || '',
      };

      // Add to RxJS Reactive Call Stream and auto-select
      callStreamService.addNewCall(createdThreadRecord, true);

      // Select 'all' so new call is displayed in sidebar list
      callStreamService.selectCompany('all');

      toast.success(`Call logged successfully for ${resolvedCompanyName || resolvedProjectId}`);
      if (triggerRefresh) triggerRefresh();
      closeAddCallModal();
    } catch (err) {
      console.error('Error logging call:', err);
      toast.error(err?.message || 'An error occurred while logging the call');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={closeAddCallModal}
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
          <PhoneCall size={16} weight="bold" color="#FFFFFF" />
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            New Support Call
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={closeAddCallModal}
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
        {/* Scrollable Form Content */}
        <Box
          sx={{
            maxHeight: '75vh',
            overflowY: 'auto',
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* SECTION 1: Company & Caller Information */}
          <Card
            variant="outlined"
            sx={{
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

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1.2fr' }, gap: 1.8, mb: 1.8 }}>
                {/* Company Selection */}
                <Box ref={companyInputRef}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                    Company / Client *
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={companyOptions}
                    getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.label || opt?.name || '')}
                    value={formData.company}
                    onChange={(_, val) => {
                      if (typeof val === 'string') {
                        setFormData((prev) => ({ ...prev, company: { label: val, value: val } }));
                      } else {
                        setFormData((prev) => ({ ...prev, company: val }));
                      }
                    }}
                    onInputChange={(_, newVal) => {
                      if (!formData.company || formData.company.label !== newVal) {
                        setFormData((prev) => ({
                          ...prev,
                          company: prev.company?.value && prev.company?.label === newVal
                            ? prev.company
                            : { label: newVal, value: newVal }
                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select or type company name..."
                        size="small"
                        required
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFFFFF',
                            borderRadius: 2,
                            fontSize: 13,
                            '& fieldset': { borderColor: '#CBD5E1' },
                            '&:hover fieldset': { borderColor: '#94A3B8' },
                            '&.Mui-focused fieldset': { borderColor: '#6900C6', borderWidth: 1.5 },
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Caller Representative with Dexie suggestions */}
                <Box>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                    Caller / Contact Person *
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={customerSuggestions}
                    value={formData.customerName}
                    onInputChange={(_, newVal) => handleCustomerNameChange(newVal)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="e.g. Ramesh Soni / Support Admin"
                        size="small"
                        required
                        fullWidth
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
                    )}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1.2fr' }, gap: 1.8 }}>
                {/* Application / Module */}
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
                        placeholder="e.g. Diamond ERP, Carely, Web..."
                        size="small"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFFFFF',
                            borderRadius: 2,
                            fontSize: 13,
                            '& fieldset': { borderColor: '#CBD5E1' },
                            '&:hover fieldset': { borderColor: '#94A3B8' },
                            '&.Mui-focused fieldset': { borderColor: '#6900C6', borderWidth: 1.5 },
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Call Type */}
                <Box>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                    Call Type
                  </Typography>
                  <Autocomplete
                    options={CALL_TYPE_MASTER}
                    getOptionLabel={(opt) => opt?.label || opt?.Name || ''}
                    value={formData.callType}
                    onChange={(_, val) => setFormData((prev) => ({ ...prev, callType: val }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select call type..."
                        size="small"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFFFFF',
                            borderRadius: 2,
                            fontSize: 13,
                            '& fieldset': { borderColor: '#CBD5E1' },
                            '&:hover fieldset': { borderColor: '#94A3B8' },
                            '&.Mui-focused fieldset': { borderColor: '#6900C6', borderWidth: 1.5 },
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* SECTION 2: Assignment & Forwarding */}
          <Card
            variant="outlined"
            sx={{
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
                  icon={<UserPlus size={13} weight="bold" color="#0284C7" />}
                  label="Routing & Forward"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: '#E0F2FE',
                    color: '#0369A1',
                    borderRadius: 1,
                  }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: '#0F172A' }}>
                  Agent Assignment & Forwarding
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.8 }}>
                {/* Received By */}
                <Box>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                    Received By (Logged Agent)
                  </Typography>
                  <TextField
                    disabled
                    size="small"
                    fullWidth
                    value={
                      user?.firstname
                        ? `${user.firstname} ${user.lastname || ''}`.trim()
                        : user?.name || 'Current User'
                    }
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
                </Box>

                {/* Forward To */}
                <Box>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                    Forward To (Optional)
                  </Typography>
                  <Autocomplete
                    options={forwardOption}
                    getOptionLabel={(opt) =>
                      opt?.person ? `${opt.person} (${opt.dept || 'Staff'})` : opt?.label || ''
                    }
                    value={formData.forwardTo}
                    onChange={(_, val) => setFormData((prev) => ({ ...prev, forwardTo: val }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select employee / department..."
                        size="small"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFFFFF',
                            borderRadius: 2,
                            fontSize: 13,
                            '& fieldset': { borderColor: '#CBD5E1' },
                            '&:hover fieldset': { borderColor: '#94A3B8' },
                            '&.Mui-focused fieldset': { borderColor: '#0284C7', borderWidth: 1.5 },
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* SECTION 3: Description & Purpose */}
          <Card
            variant="outlined"
            sx={{
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
                  icon={<ChatCircleText size={13} weight="bold" color="#059669" />}
                  label="Call Purpose"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: '#D1FAE5',
                    color: '#047857',
                    borderRadius: 1,
                  }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: '#0F172A' }}>
                  Call Description & Purpose *
                </Typography>
              </Box>

              <TextField
                multiline
                rows={3}
                placeholder="Describe the issue, customer inquiry, technical problem, or remarks..."
                size="small"
                required
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    fontSize: 13,
                    lineHeight: 1.5,
                    '& fieldset': { borderColor: '#CBD5E1' },
                    '&:hover fieldset': { borderColor: '#94A3B8' },
                    '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 1.5 },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Layer 3: Sticky Bottom Action Bar */}
        <Box
          sx={{
            p: 2,
            px: 3,
            bgcolor: '#FAFAFA',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button
            type="button"
            variant="text"
            onClick={closeAddCallModal}
            disabled={loading}
            sx={{
              color: '#64748B',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'none',
              px: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: '#F1F5F9', color: '#334155' },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} weight="bold" />}
            sx={{
              background: 'linear-gradient(135deg, #6900C6 0%, #5B00B0 100%)',
              boxShadow: '0 4px 12px rgba(105, 0, 198, 0.25)',
              fontSize: 13,
              fontWeight: 750,
              textTransform: 'none',
              px: 3,
              py: 0.9,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #5B00B0 0%, #4C0093 100%)',
                boxShadow: '0 6px 16px rgba(105, 0, 198, 0.35)',
              },
            }}
          >
            {loading ? 'Logging Call...' : 'Log Call & Save'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
