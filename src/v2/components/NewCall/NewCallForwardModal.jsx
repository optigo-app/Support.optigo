'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  X,
  ShareNetwork,
  UsersThree,
  Question,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '../../context/UseAuth';
import { useCallLog } from '../../context/UseCallLog';
import {
  forwardCallModal$,
  closeForwardCallModal,
  useNewCallSubject,
} from './rxjs/newCallEvents';
import { callStreamService } from './services/callStreamService';

export default function NewCallForwardModal() {
  const modalState = useNewCallSubject(forwardCallModal$);
  const { user } = useAuth();
  const {
    ForwardCall,
    departmentsNames = {},
    CALLFORWARD_REASON_MASTER = [],
    EMPLOYEE_LIST = [],
    triggerRefresh,
  } = useCallLog();

  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetCall = modalState.call;

  const departmentKeys = useMemo(() => {
    return Object.keys(departmentsNames || {});
  }, [departmentsNames]);

  const filteredEmployees = useMemo(() => {
    if (!selectedDept) return EMPLOYEE_LIST || [];
    return (departmentsNames[selectedDept] || []).filter(Boolean);
  }, [selectedDept, departmentsNames, EMPLOYEE_LIST]);

  useEffect(() => {
    if (modalState.open) {
      setSelectedDept(null);
      setSelectedEmp(null);
      setSelectedReason(
        CALLFORWARD_REASON_MASTER.length > 0 ? CALLFORWARD_REASON_MASTER[0] : null
      );
      setIsSubmitting(false);
    }
  }, [modalState.open, CALLFORWARD_REASON_MASTER]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedEmp) {
      toast.error('Please select an employee to forward this call to');
      return;
    }
    const callId = targetCall?.sr || targetCall?.id;
    if (!callId) {
      toast.error('No target call selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const designationId =
        selectedEmp?.DesignaitonId ||
        (selectedDept ? departmentsNames[selectedDept]?.[0]?.DesignaitonId : null) ||
        null;

      const empId =
        selectedEmp?.userid ||
        selectedEmp?.userId ||
        selectedEmp?.EmpId ||
        (String(selectedEmp?.id || '').includes(',')
          ? selectedEmp.id.split(',')[1]
          : selectedEmp?.id);

      const reasonId =
        selectedReason?.value ?? selectedReason?.Id ?? selectedReason?.id ?? 6;

      const payload = {
        deptId: designationId ? Number(designationId) : undefined,
        empId: empId ? Number(empId) : undefined,
        createdBy: user?.id,
        ResonId: Number(reasonId),
      };

      const result = await ForwardCall(callId, payload);

      if (result && !result.success && result.msg?.stat === 0) {
        toast.error(result.msg?.stat_msg || 'Failed to forward call');
        return;
      }

      const empName =
        typeof selectedEmp === 'string'
          ? selectedEmp
          : selectedEmp?.user ||
            selectedEmp?.person ||
            selectedEmp?.EmpName ||
            selectedEmp?.name ||
            `${selectedEmp?.firstname || ''} ${selectedEmp?.lastname || ''}`.trim() ||
            'Support Team Member';

      // Optimistically patch primary call in callStreamService
      callStreamService.patchPrimaryCall(callId, {
        ForwardedEmp: empName,
        status: 'Forwarded',
        Estatus: 'Forwarded',
        InternalStatus: 'Forwarded',
        CallType: 'Forwarded',
      });

      toast.success(`Call #${callId} forwarded to ${empName}`);

      if (triggerRefresh) triggerRefresh();
      closeForwardCallModal();
    } catch (err) {
      console.error('Error forwarding call:', err);
      toast.error('Failed to forward call');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!modalState.open) return null;

  return (
    <Dialog
      open={modalState.open}
      onClose={closeForwardCallModal}
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
          <ShareNetwork size={16} weight="bold" color="#FFFFFF" />
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Forward Call #{targetCall?.sr || targetCall?.id} • {targetCall?.company || 'Company'}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={closeForwardCallModal}
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
            gap: 2.5,
          }}
        >
          {/* SECTION 1: Department & Recipient */}
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
                    icon={<UsersThree size={13} weight="bold" color="#6900C6" />}
                    label="Employee Routing"
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
                    Select Department & Recipient
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1.2fr' }, gap: 1.8 }}>
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Department / Designation (Optional)
                    </Typography>
                    <Autocomplete
                      options={departmentKeys}
                      value={selectedDept}
                      onChange={(_, newVal) => {
                        setSelectedDept(newVal);
                        setSelectedEmp(null);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Filter by department"
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

                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#475569', mb: 0.5 }}>
                      Forward To Employee *
                    </Typography>
                    <Autocomplete
                      options={filteredEmployees}
                      getOptionLabel={(opt) => {
                        if (!opt) return '';
                        if (typeof opt === 'string') return opt;
                        return (
                          opt.user ||
                          opt.person ||
                          opt.EmpName ||
                          opt.name ||
                          opt.empname ||
                          opt.userName ||
                          opt.username ||
                          (opt.firstname ? `${opt.firstname} ${opt.lastname || ''}`.trim() : '') ||
                          'Employee'
                        );
                      }}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        if (typeof option === 'string' && typeof value === 'string') return option === value;
                        const optId = option?.userid || option?.userId || option?.EmpId || option?.id;
                        const valId = value?.userid || value?.userId || value?.EmpId || value?.id;
                        if (optId && valId) return String(optId) === String(valId);
                        const optName = typeof option === 'string' ? option : (option?.user || option?.person || option?.EmpName);
                        const valName = typeof value === 'string' ? value : (value?.user || value?.person || value?.EmpName);
                        return optName === valName;
                      }}
                      renderOption={(props, option) => {
                        const name =
                          typeof option === 'string'
                            ? option
                            : option?.user ||
                              option?.person ||
                              option?.EmpName ||
                              option?.name ||
                              option?.empname ||
                              option?.userName ||
                              option?.username ||
                              (option?.firstname ? `${option.firstname} ${option.lastname || ''}`.trim() : '') ||
                              'Employee';
                        const designation = (typeof option === 'object' ? option?.designation : '') || selectedDept;
                        return (
                          <li {...props} key={typeof option === 'object' ? (option?.userid || option?.userId || option?.EmpId || option?.id || name) : option}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', py: 0.2 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                                {name}
                              </Typography>
                              {designation && (
                                <Typography sx={{ fontSize: 11, color: '#64748B', bgcolor: '#F1F5F9', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                                  {designation}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        );
                      }}
                      value={selectedEmp}
                      onChange={(_, newVal) => setSelectedEmp(newVal)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select recipient"
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
              </CardContent>
            </Card>
          </Box>

          {/* SECTION 2: Reason for Forwarding */}
          {CALLFORWARD_REASON_MASTER.length > 0 && (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8 }}>
                    <Chip
                      icon={<Question size={13} weight="bold" color="#6900C6" />}
                      label="Context & Reason"
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
                      Reason for Forwarding
                    </Typography>
                  </Box>

                  <Autocomplete
                    options={CALLFORWARD_REASON_MASTER}
                    getOptionLabel={(opt) => opt?.label || opt?.Reason || String(opt)}
                    value={selectedReason}
                    onChange={(_, newVal) => setSelectedReason(newVal)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select reason"
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
                </CardContent>
              </Card>
            </Box>
          )}
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
            onClick={closeForwardCallModal}
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
            disabled={isSubmitting || !selectedEmp}
            startIcon={<ShareNetwork size={15} weight="bold" />}
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
            {isSubmitting ? 'Forwarding...' : 'Forward Call'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
