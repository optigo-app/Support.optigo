'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  X,
  Buildings,
  PhoneCall,
  FileImage,
  TrendUp,
  Star,
  PencilSimpleLine,
  CalendarBlank,
  Clock,
  User,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import AttachmentPill from './AttachmentPill';
import SimpleBar from './SimpleBar';
import { openEditCallModal, openDurationModal } from './rxjs/newCallEvents';
import { formatCallDateTime } from './utils/dateUtils';

// Apple-inspired semantic status styling
function getAppleStatusStyle(statusName = '') {
  const s = String(statusName).toLowerCase();
  if (s.includes('solved') || s.includes('complete') || s.includes('success')) {
    return { bg: '#EBF9F1', text: '#0E7043', border: '#A7F3D0', dot: '#10B981' };
  }
  if (s.includes('run') || s.includes('prog') || s.includes('active')) {
    return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' };
  }
  if (s.includes('pend') || s.includes('open') || s.includes('hold') || s.includes('wait')) {
    return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' };
  }
  if (s.includes('cancel') || s.includes('fail') || s.includes('error') || s.includes('reject')) {
    return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444' };
  }
  return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', dot: '#64748B' };
}

function AppleStatusPill({ prefix, statusName }) {
  const st = getAppleStatusStyle(statusName);
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        px: '9px',
        py: '3.5px',
        borderRadius: '7px',
        bgcolor: st.bg,
        border: `1px solid ${st.border}`,
        fontSize: '11px',
        fontWeight: 650,
        color: st.text,
        lineHeight: 1.2,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: st.dot,
          flexShrink: 0,
        }}
      />
      <span>
        {prefix ? `${prefix}: ` : ''}
        {statusName}
      </span>
    </Box>
  );
}

export default function RightDetailInspector({
  open = false,
  onClose,
  activeThread,
  selectedCompany = 'all',
  threads = [],
  companies = [],
  onSelectThread,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'files' | 'history'
  const [copied, setCopied] = useState(false);

  const isCompanyView =
    selectedCompany &&
    selectedCompany !== 'all' &&
    (!Array.isArray(selectedCompany) || selectedCompany.length > 0);

  // 1. Company Analytics Aggregator
  const companyData = useMemo(() => {
    if (!isCompanyView) return null;

    const compCalls = threads.filter((t) => {
      const tComp = (t.company || t.name || '').toLowerCase();
      if (Array.isArray(selectedCompany)) {
        return selectedCompany.some((c) => String(c).toLowerCase() === tComp);
      }
      return tComp === String(selectedCompany).toLowerCase();
    });

    const callersMap = new Map();
    const agentsMap = new Map();
    const attachmentsList = [];
    let solvedCount = 0;
    let pendingCount = 0;
    let runningCount = 0;

    for (let i = 0; i < compCalls.length; i++) {
      const call = compCalls[i];
      const caller = call.callBy || call.name || 'Client Caller';
      callersMap.set(caller, (callersMap.get(caller) || 0) + 1);

      const agent = call.receivedBy || call.rawRecord?.receivedBy || 'Support Team';
      agentsMap.set(agent, (agentsMap.get(agent) || 0) + 1);

      const st = (call.status || call.estatus || '').toLowerCase();
      if (st.includes('solved') || st.includes('completed')) solvedCount++;
      else if (st.includes('running')) runningCount++;
      else pendingCount++;

      const rawComm = call.rawRecord?.comment;
      if (rawComm && typeof rawComm === 'string' && rawComm.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(rawComm);
          if (Array.isArray(parsed)) {
            parsed.forEach((c) => {
              if (c.img) {
                const fn = c.img.split('/').pop() || `Attachment_${c.id || 'file'}`;
                attachmentsList.push({
                  id: c.id,
                  filename: fn,
                  text: c.text,
                  author: c.Name || agent,
                  time: c.time,
                  imgUrl: c.img,
                  callSr: call.sr,
                });
              }
            });
          }
        } catch (e) {}
      }
    }

    const targetCompName = Array.isArray(selectedCompany)
      ? selectedCompany.length > 1
        ? selectedCompany.join(', ')
        : selectedCompany[0] || 'Company'
      : String(selectedCompany || 'Company');
    const compDisplayName = Array.isArray(selectedCompany)
      ? selectedCompany[0] || 'Company'
      : String(selectedCompany || 'Company');
    const companyMeta = companies.find(
      (c) => (c.name || '').toLowerCase() === String(compDisplayName || '').toLowerCase()
    );
    const total = compCalls.length || 1;
    const resolutionRate = Math.round((solvedCount / total) * 100);

    return {
      name: String(targetCompName),
      avatarColor: companyMeta?.avatarColor || '#6900C6',
      totalCalls: compCalls.length,
      solvedCount,
      pendingCount,
      runningCount,
      resolutionRate,
      callers: Array.from(callersMap.entries()).sort((a, b) => b[1] - a[1]),
      agents: Array.from(agentsMap.entries()).sort((a, b) => b[1] - a[1]),
      attachments: attachmentsList,
      calls: compCalls.slice(0, 50),
    };
  }, [isCompanyView, selectedCompany, threads, companies]);

  // 2. Call-Specific Attachments & Follow-ups
  const callAttachments = useMemo(() => {
    if (!activeThread?.rawRecord) return [];
    const list = [];
    const rawComm = activeThread.rawRecord.comment;
    if (rawComm && typeof rawComm === 'string' && rawComm.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(rawComm);
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (c.img) {
              const fn = c.img.split('/').pop() || `Attachment_${c.id || 'file'}`;
              list.push({
                id: c.id,
                filename: fn,
                text: c.text,
                author: c.Name,
                time: c.time,
                imgUrl: c.img,
              });
            }
          });
        }
      } catch (e) {}
    }
    return list;
  }, [activeThread]);

  const followupsList = useMemo(() => {
    if (!activeThread?.rawRecord?.FollowUpList) return [];
    try {
      const raw = activeThread.rawRecord.FollowUpList;
      if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        return JSON.parse(raw);
      }
      if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
  }, [activeThread]);

  // Event delegation click handler for fast item switching in Calls Feed
  const handleTimelineClick = useCallback(
    (e) => {
      const row = e.target.closest('[data-call-id]');
      if (row && onSelectThread) {
        const callId = row.getAttribute('data-call-id');
        if (callId) onSelectThread(callId);
      }
    },
    [onSelectThread]
  );

  const rec = activeThread?.rawRecord || {};

  const handleCopyCallSummary = () => {
    const summary = `Call #${rec.sr || activeThread?.sr || ''} | ${rec.company || activeThread?.company || ''} | Caller: ${rec.callBy || activeThread?.name || ''} | Agent: ${rec.receivedBy || rec.AssignedEmpName || ''} | Status: ${rec.status || ''}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Call summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const hasValidDurationEdit = Boolean(
    (rec.callStart || rec.CallStart) &&
    (rec.callStart || rec.CallStart) !== '1900-01-01T00:00:00' &&
    (rec.callClosed || rec.CallClosed) &&
    (rec.callClosed || rec.CallClosed) !== '1900-01-01T00:00:00'
  );

  return (
    <Box
      sx={{
        width: open ? 380 : 0,
        minWidth: open ? 380 : 0,
        maxWidth: open ? 380 : 0,
        height: '100%',
        bgcolor: '#FFFFFF',
        borderLeft: open ? '1px solid #E5E7EB' : 'none',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. Apple-Style Clean Top Header Bar */}
      <Box
        sx={{
          height: 52,
          minHeight: 52,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              bgcolor: isCompanyView ? '#F3E8FF' : '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isCompanyView ? (
              <Buildings size={17} weight="bold" color="#6900C6" />
            ) : (
              <PhoneCall size={17} weight="bold" color="#0071E3" />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 750, color: '#1D1D1F', letterSpacing: '-0.015em' }}>
              {isCompanyView ? 'Company Profile' : 'Call Inspector'}
            </Typography>
            {!isCompanyView && (rec.sr || activeThread?.sr) && (
              <Typography sx={{ fontSize: 11, fontWeight: 650, color: '#86868B', fontVariantNumeric: 'tabular-nums' }}>
                #{rec.sr || activeThread?.sr}
              </Typography>
            )}
          </Box>
        </Box>

        <Tooltip title="Close inspector (Esc)">
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              width: 28,
              height: 28,
              color: '#86868B',
              borderRadius: '50%',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#F1F3F5', color: '#1D1D1F' },
            }}
          >
            <X size={15} weight="bold" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 2. Apple Segmented Control Navigation */}
      <Box sx={{ px: 2, pt: 1.2, pb: 1.2, borderBottom: '1px solid #F1F3F5', bgcolor: '#FFFFFF' }}>
        <Box
          sx={{
            display: 'flex',
            p: '3px',
            bgcolor: '#F1F3F5',
            borderRadius: '10px',
            border: '1px solid #E9ECEF',
            gap: '2px',
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => setActiveTab('overview')}
            sx={{
              flex: 1,
              py: '6px',
              px: 1,
              border: 'none',
              borderRadius: '7px',
              fontSize: '12px',
              fontWeight: activeTab === 'overview' ? 700 : 550,
              color: activeTab === 'overview' ? '#1D1D1F' : '#6E6E73',
              bgcolor: activeTab === 'overview' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.04)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              '&:hover': {
                color: '#1D1D1F',
              },
            }}
          >
            Overview
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => setActiveTab('files')}
            sx={{
              flex: 1,
              py: '6px',
              px: 1,
              border: 'none',
              borderRadius: '7px',
              fontSize: '12px',
              fontWeight: activeTab === 'files' ? 700 : 550,
              color: activeTab === 'files' ? '#1D1D1F' : '#6E6E73',
              bgcolor: activeTab === 'files' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'files' ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.04)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.6,
              outline: 'none',
              '&:hover': {
                color: '#1D1D1F',
              },
            }}
          >
            Files
            <Box
              component="span"
              sx={{
                fontSize: '10px',
                fontWeight: 700,
                px: '6px',
                py: '1px',
                borderRadius: '10px',
                bgcolor: activeTab === 'files' ? '#F1F3F5' : '#E5E7EB',
                color: activeTab === 'files' ? '#1D1D1F' : '#6E6E73',
                lineHeight: 1.3,
              }}
            >
              {isCompanyView ? companyData?.attachments?.length || 0 : callAttachments.length}
            </Box>
          </Box>

          {isCompanyView && (
            <Box
              component="button"
              type="button"
              onClick={() => setActiveTab('history')}
              sx={{
                flex: 1,
                py: '6px',
                px: 1,
                border: 'none',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: activeTab === 'history' ? 700 : 550,
                color: activeTab === 'history' ? '#1D1D1F' : '#6E6E73',
                bgcolor: activeTab === 'history' ? '#FFFFFF' : 'transparent',
                boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.04)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                '&:hover': {
                  color: '#1D1D1F',
                },
              }}
            >
              Calls Feed
            </Box>
          )}
        </Box>
      </Box>

      {/* 3. Scrollable Body Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <SimpleBar style={{ height: '100%', maxHeight: '100%' }}>
          {/* ============================================================== */}
          {/* A. COMPANY VIEW MODE                                           */}
          {/* ============================================================== */}
          {isCompanyView && companyData ? (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeTab === 'overview' && (
                <>
                  {/* Hero Company Card */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      background: 'linear-gradient(180deg, #FAF5FF 0%, #F5EEFD 100%)',
                      border: '1px solid #E9D5FF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 1.2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 54,
                        height: 54,
                        bgcolor: companyData.avatarColor,
                        fontSize: 20,
                        fontWeight: 750,
                        color: '#FFFFFF',
                        boxShadow: '0 4px 14px rgba(105, 0, 198, 0.22)',
                        border: '2px solid #FFFFFF',
                      }}
                    >
                      {String(companyData?.name || 'C').charAt(0).toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 750, color: '#1D1D1F', lineHeight: 1.25 }}>
                        {String(companyData?.name || 'Company')}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: '#6900C6', fontWeight: 600, mt: 0.3 }}>
                        Enterprise Client Account
                      </Typography>
                    </Box>

                    <Chip
                      label={`${companyData.totalCalls} Calls Recorded`}
                      size="small"
                      sx={{
                        bgcolor: '#6900C6',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 11,
                        height: 22,
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(105, 0, 198, 0.18)',
                      }}
                    />
                  </Box>

                  {/* Resolution Performance Card */}
                  <Box sx={{ p: 1.6, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <TrendUp size={16} weight="bold" color="#34C759" />
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1D1D1F' }}>
                          Resolution Rate
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#34C759' }}>
                        {companyData.resolutionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={companyData.resolutionRate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#F1F3F5',
                        '& .MuiLinearProgress-bar': { bgcolor: '#34C759', borderRadius: 3 },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.2 }}>
                      <Typography sx={{ fontSize: 11, color: '#0E7043', fontWeight: 650 }}>
                        ✓ {companyData.solvedCount} Solved
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#B91C1C', fontWeight: 650 }}>
                        ⏳ {companyData.runningCount + companyData.pendingCount} Active
                      </Typography>
                    </Box>
                  </Box>

                  {/* Frequent Callers Breakdown */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#86868B',
                        mb: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Frequent Callers ({companyData.callers.length})
                    </Typography>
                    <Box sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                      {companyData.callers.slice(0, 6).map(([callerName, count], idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.1,
                            px: 1.4,
                            borderBottom: idx < Math.min(companyData.callers.length, 6) - 1 ? '1px solid #F1F3F5' : 'none',
                            transition: 'background 0.15s ease',
                            '&:hover': { bgcolor: '#FBFBFD' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 11,
                                bgcolor: '#FAF5FF',
                                color: '#6900C6',
                                fontWeight: 750,
                                border: '1px solid #E9D5FF',
                              }}
                            >
                              {callerName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 650, color: '#1D1D1F' }}>
                              {callerName}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${count} calls`}
                            size="small"
                            sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: '#F1F3F5', color: '#6E6E73', borderRadius: '5px' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Assigned Support Leads */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#86868B',
                        mb: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Assigned Support Desk
                    </Typography>
                    <Box sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                      {companyData.agents.slice(0, 4).map(([agentName, count], idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.1,
                            px: 1.4,
                            borderBottom: idx < Math.min(companyData.agents.length, 4) - 1 ? '1px solid #F1F3F5' : 'none',
                            transition: 'background 0.15s ease',
                            '&:hover': { bgcolor: '#FBFBFD' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 11,
                                bgcolor: '#EFF6FF',
                                color: '#0071E3',
                                fontWeight: 750,
                                border: '1px solid #BFDBFE',
                              }}
                            >
                              {agentName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 650, color: '#1D1D1F' }}>
                              {agentName}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 11, color: '#86868B', fontWeight: 600 }}>
                            {count} calls
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              {/* Files / Attachments Tab in Company Mode */}
              {activeTab === 'files' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {companyData.attachments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5, color: '#86868B' }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: '#F1F3F5',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#86868B',
                          mb: 1.2,
                        }}
                      >
                        <FileImage size={24} weight="duotone" />
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 650, color: '#1D1D1F' }}>
                        No files found
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: '#86868B', mt: 0.3 }}>
                        Attachments shared across calls will appear here
                      </Typography>
                    </Box>
                  ) : (
                    companyData.attachments.map((att, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.2,
                          bgcolor: '#FFFFFF',
                          borderRadius: '10px',
                          border: '1px solid #E5E7EB',
                          transition: 'border-color 0.15s ease',
                          '&:hover': { borderColor: '#CBD5E1' },
                        }}
                      >
                        <AttachmentPill attachment={att} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.8, px: 0.4 }}>
                          <Typography sx={{ fontSize: 10.5, color: '#0071E3', fontWeight: 650 }}>
                            Call #{att.callSr}
                          </Typography>
                          <Typography sx={{ fontSize: 10.5, color: '#86868B' }}>
                            By {att.author}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              )}

              {/* Calls History Feed Tab */}
              {activeTab === 'history' && (
                <Box onClick={handleTimelineClick} sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  {companyData.calls.map((c) => {
                    const isSelected = c.id === activeThread?.id;

                    return (
                      <Box
                        key={c.id}
                        data-call-id={c.id}
                        sx={{
                          p: 1.3,
                          px: 1.4,
                          bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                          border: isSelected ? '1px solid #BFDBFE' : '1px solid #E5E7EB',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&:hover': { bgcolor: isSelected ? '#EFF6FF' : '#FBFBFD', borderColor: '#CBD5E1' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1D1D1F' }}>
                            Call #{c.sr} • {c.callBy || c.name}
                          </Typography>
                          <Typography sx={{ fontSize: 10.5, color: '#86868B', fontWeight: 550, fontVariantNumeric: 'tabular-nums' }}>
                            {c.timestamp}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11.5, color: '#6E6E73', mt: 0.4 }} noWrap>
                          {c.lastMessage}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          ) : (
            /* ============================================================== */
            /* B. INDIVIDUAL CALL VIEW MODE (CALL INSPECTOR)                  */
            /* ============================================================== */
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!activeThread ? (
                <Box sx={{ textAlign: 'center', py: 6, color: '#86868B' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      bgcolor: '#F1F3F5',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#86868B',
                      mb: 1.5,
                    }}
                  >
                    <PhoneCall size={26} weight="duotone" />
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>
                    No Call Selected
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#86868B', mt: 0.5, maxWidth: 220, mx: 'auto' }}>
                    Select a call conversation from the left to inspect call telemetry, participants, and files.
                  </Typography>
                </Box>
              ) : activeTab === 'overview' ? (
                <>
                  {/* Hero Call Card */}
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.4,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Top Row: Call ID Pill & Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: '8px',
                          py: '3px',
                          borderRadius: '6px',
                          bgcolor: '#EFF6FF',
                          color: '#0071E3',
                          border: '1px solid #BFDBFE',
                          fontSize: '11px',
                          fontWeight: 750,
                          letterSpacing: '0.02em',
                        }}
                      >
                        VOICE CALL #{rec.sr || activeThread?.sr || '22861'}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Tooltip title={copied ? 'Copied!' : 'Copy Summary'}>
                          <IconButton
                            size="small"
                            onClick={handleCopyCallSummary}
                            sx={{
                              width: 26,
                              height: 26,
                              color: copied ? '#10B981' : '#86868B',
                              bgcolor: copied ? '#EBF9F1' : 'transparent',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease',
                              '&:hover': { bgcolor: '#F1F3F5', color: '#1D1D1F' },
                            }}
                          >
                            {copied ? <Check size={13} weight="bold" /> : <Copy size={13} weight="bold" />}
                          </IconButton>
                        </Tooltip>

                        <Button
                          size="small"
                          onClick={() => openEditCallModal(activeThread)}
                          startIcon={<PencilSimpleLine size={13} weight="bold" />}
                          sx={{
                            p: '2px 8px',
                            minWidth: 0,
                            fontSize: 11,
                            fontWeight: 650,
                            color: '#0071E3',
                            bgcolor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            textTransform: 'none',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: '#DBEAFE' },
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>

                    {/* Company Account Name */}
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 750, color: '#1D1D1F', letterSpacing: '-0.015em', lineHeight: 1.25 }}>
                        {rec.company || activeThread?.company || 'Client Account'}
                      </Typography>
                    </Box>

                    {/* Dual Status Badges */}
                    {(() => {
                      const extName = rec.Estatus || activeThread?.estatus || 'Completed';
                      const intName = rec.status || activeThread?.status || 'Solved';
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
                          <AppleStatusPill prefix="Ext" statusName={extName} />
                          <AppleStatusPill prefix="Int" statusName={intName} />
                        </Box>
                      );
                    })()}

                    {/* Customer Rating or Forwarded Status */}
                    {(rec.CallType === 'Forwarded' || rec.ForwardedEmp || rec.rating > 0) && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          pt: 1,
                          borderTop: '1px solid #F1F3F5',
                        }}
                      >
                        {rec.rating > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#D97706', fontSize: 11.5, fontWeight: 700 }}>
                            <Star size={13} weight="fill" />
                            <span>{rec.rating}.0 Customer Rating</span>
                          </Box>
                        ) : <Box />}

                        {(rec.CallType === 'Forwarded' || rec.ForwardedEmp) && (
                          <Chip
                            label={`↗ Forwarded: ${rec.ForwardedEmp || 'Specialist'}`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 650,
                              bgcolor: '#FAF5FF',
                              color: '#6900C6',
                              border: '1px solid #E9D5FF',
                              borderRadius: '6px',
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Description Note */}
                    {(rec.description || activeThread?.description) && (
                      <Box
                        sx={{
                          p: 1.2,
                          bgcolor: '#F8FAFC',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Typography sx={{ fontSize: 12, color: '#334155', lineHeight: 1.45 }}>
                          {rec.description || activeThread?.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Participants Section */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#86868B',
                        mb: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Participants
                    </Typography>

                    <Box sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                      {/* Client Caller */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.2,
                          px: 1.4,
                          borderBottom: '1px solid #F1F3F5',
                          transition: 'background 0.15s ease',
                          '&:hover': { bgcolor: '#FBFBFD' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#FAF5FF',
                              color: '#6900C6',
                              fontWeight: 750,
                              fontSize: 12,
                              border: '1px solid #E9D5FF',
                            }}
                          >
                            {(rec.callBy || activeThread?.name || 'C').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', lineHeight: 1.2 }} noWrap>
                              {rec.callBy || activeThread?.name || 'Client Caller'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#86868B', mt: 0.2 }} noWrap>
                              Client Contact • {rec.company || 'Client'}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Caller"
                          size="small"
                          sx={{ height: 19, fontSize: 10, fontWeight: 650, bgcolor: '#F1F3F5', color: '#6E6E73', borderRadius: '5px', ml: 1 }}
                        />
                      </Box>

                      {/* Handling Support Specialist */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.2,
                          px: 1.4,
                          transition: 'background 0.15s ease',
                          '&:hover': { bgcolor: '#FBFBFD' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#EFF6FF',
                              color: '#0071E3',
                              fontWeight: 750,
                              fontSize: 12,
                              border: '1px solid #BFDBFE',
                            }}
                          >
                            {(rec.receivedBy || rec.AssignedEmpName || 'A').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1D1D1F', lineHeight: 1.2 }} noWrap>
                              {rec.receivedBy || rec.AssignedEmpName || 'Support Specialist'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#86868B', mt: 0.2 }} noWrap>
                              Assigned Agent • {rec.DeptName || 'Support Team'}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Assignee"
                          size="small"
                          sx={{ height: 19, fontSize: 10, fontWeight: 650, bgcolor: '#EFF6FF', color: '#0071E3', borderRadius: '5px', ml: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Call Telemetry Section */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#86868B',
                        mb: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Call Telemetry
                    </Typography>

                    <Box sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                      {/* Call Start */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.1, px: 1.4, borderBottom: '1px solid #F1F3F5' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#86868B' }}>
                          <CalendarBlank size={14} weight="bold" />
                          <Typography sx={{ fontSize: 11.5, color: '#6E6E73', fontWeight: 550 }}>
                            Call Start
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCallDateTime(rec.callStart || rec.CallStart)}
                        </Typography>
                      </Box>

                      {/* Call Closed */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.1, px: 1.4, borderBottom: '1px solid #F1F3F5' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#86868B' }}>
                          <CalendarBlank size={14} weight="bold" />
                          <Typography sx={{ fontSize: 11.5, color: '#6E6E73', fontWeight: 550 }}>
                            Call Closed
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCallDateTime(rec.callClosed || rec.CallClosed)}
                        </Typography>
                      </Box>

                      {/* Duration with Modal Trigger */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.1, px: 1.4, borderBottom: '1px solid #F1F3F5' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#86868B' }}>
                          <Clock size={14} weight="bold" />
                          <Typography sx={{ fontSize: 11.5, color: '#6E6E73', fontWeight: 550 }}>
                            Duration
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 750, color: '#0071E3', fontVariantNumeric: 'tabular-nums' }}>
                            {rec.CallDuration || rec.callDuration || '—'}
                          </Typography>
                          {hasValidDurationEdit && (
                            <Tooltip title="Edit Call Duration">
                              <IconButton
                                size="small"
                                onClick={() => openDurationModal(rec)}
                                sx={{
                                  width: 22,
                                  height: 22,
                                  p: 0,
                                  color: '#0071E3',
                                  bgcolor: '#EFF6FF',
                                  borderRadius: '5px',
                                  transition: 'all 0.15s ease',
                                  '&:hover': { bgcolor: '#DBEAFE' },
                                }}
                              >
                                <PencilSimpleLine size={12} weight="bold" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>

                      {/* Channel / Source */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.1, px: 1.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#86868B' }}>
                          <PhoneCall size={14} weight="bold" />
                          <Typography sx={{ fontSize: 11.5, color: '#6E6E73', fontWeight: 550 }}>
                            Channel
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 650, color: '#1D1D1F' }}>
                          {rec.callSourceLabel || 'VoIP Entry'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Follow-Up Calls in this Conversation */}
                  {followupsList.length > 0 && (
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#86868B',
                          mb: 0.8,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        Follow-Up Calls ({followupsList.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {followupsList.map((fu, idx) => {
                          const startStr = formatCallDateTime(fu.CallStart || fu.callStart);
                          const endStr = formatCallDateTime(fu.CallClosed || fu.callClosed);
                          const durationStr = fu.CallDuration || fu.callDuration || '';
                          const descr = (fu.Description || fu.description || fu.Descr || fu.descr || '').trim();

                          return (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.3,
                                bgcolor: '#FFFFFF',
                                borderRadius: '10px',
                                border: '1px solid #E5E7EB',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.6,
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 750, color: '#0071E3' }}>
                                  Follow-up #{fu.Id || idx + 1}
                                </Typography>
                                <Typography sx={{ fontSize: 10.5, color: '#86868B', fontWeight: 550 }}>
                                  {fu.CreatedBy || fu.ReceivedBy || 'Agent'}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, fontSize: 10.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography sx={{ fontSize: 11, color: '#86868B' }}>Start:</Typography>
                                  <Typography sx={{ fontSize: 11, fontWeight: 650, color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                                    {startStr}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography sx={{ fontSize: 11, color: '#86868B' }}>End:</Typography>
                                  <Typography sx={{ fontSize: 11, fontWeight: 650, color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                                    {endStr}
                                  </Typography>
                                </Box>
                                {durationStr && durationStr !== '00:00:00' && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: 11, color: '#86868B' }}>Duration:</Typography>
                                    <Typography sx={{ fontSize: 11, fontWeight: 750, color: '#0071E3', fontVariantNumeric: 'tabular-nums' }}>
                                      {durationStr}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>

                              {descr && (
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: '#334155',
                                    mt: 0.2,
                                    bgcolor: '#F8FAFC',
                                    p: 0.8,
                                    borderRadius: '6px',
                                    border: '1px solid #F1F5F9',
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {descr}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                /* Files Tab in Call Mode */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {callAttachments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5, color: '#86868B' }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: '#F1F3F5',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#86868B',
                          mb: 1.2,
                        }}
                      >
                        <FileImage size={24} weight="duotone" />
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 650, color: '#1D1D1F' }}>
                        No attachments
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: '#86868B', mt: 0.3 }}>
                        Screenshots and media uploaded during this call appear here
                      </Typography>
                    </Box>
                  ) : (
                    callAttachments.map((att, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.2,
                          bgcolor: '#FFFFFF',
                          borderRadius: '10px',
                          border: '1px solid #E5E7EB',
                          transition: 'border-color 0.15s ease',
                          '&:hover': { borderColor: '#CBD5E1' },
                        }}
                      >
                        <AttachmentPill attachment={att} />
                        <Typography sx={{ fontSize: 10.5, color: '#86868B', display: 'block', mt: 0.8, px: 0.4 }}>
                          Uploaded by {att.author || 'Agent'}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Box>
          )}
        </SimpleBar>
      </Box>
    </Box>
  );
}
