'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Tabs,
  Tab,
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
} from '@phosphor-icons/react';
import AttachmentPill from './AttachmentPill';
import SimpleBar from './SimpleBar';
import { openEditCallModal, openDurationModal } from './rxjs/newCallEvents';
import { formatCallDateTime } from './utils/dateUtils';
import { getStatusColor } from '../../libs/data';

function getStatusStyle(statusName) {
  const { color } = getStatusColor(statusName);
  switch (color) {
    case 'success':
      return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
    case 'error':
      return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
    case 'info':
    case 'primary':
      return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
    case 'secondary':
      return { bg: '#FAF5FF', text: '#6900C6', border: '#DDD6FE' };
    case 'warning':
    default:
      return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
  }
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
      ? (selectedCompany.length > 1 ? selectedCompany.join(', ') : (selectedCompany[0] || 'Company'))
      : String(selectedCompany || 'Company');
    const compDisplayName = Array.isArray(selectedCompany) ? (selectedCompany[0] || 'Company') : String(selectedCompany || 'Company');
    const companyMeta = companies.find((c) => (c.name || '').toLowerCase() === String(compDisplayName || '').toLowerCase());
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

  // Event delegation click handler for fast item switching
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
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10,
      }}
    >
      {/* 1. Slack-Style Top Header Bar */}
      <Box
        sx={{
          height: 48,
          minHeight: 48,
          px: 2.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isCompanyView ? (
            <Buildings size={18} weight="bold" color="#6900C6" />
          ) : (
            <PhoneCall size={18} weight="bold" color="#0284C7" />
          )}
          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            {isCompanyView ? 'Company Profile' : 'Ticket Inspector'}
          </Typography>
        </Box>

        <Tooltip title="Close (Esc)">
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              p: 0.5,
              color: '#64748B',
              borderRadius: '6px',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            <X size={17} weight="bold" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 1.5, bgcolor: '#FAFAFA' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'none',
              py: 0.6,
              color: '#64748B',
              '&.Mui-selected': { color: '#6900C6' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#6900C6', height: 2 },
          }}
        >
          <Tab label="Overview" value="overview" />
          <Tab
            label={`Files (${isCompanyView ? companyData?.attachments.length || 0 : callAttachments.length})`}
            value="files"
          />
          {isCompanyView && <Tab label="Calls Feed" value="history" />}
        </Tabs>
      </Box>

      {/* 2. Scrollable Body Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <SimpleBar style={{ height: '100%', maxHeight: '100%' }}>
          {/* ============================================================== */}
          {/* A. COMPANY VIEW MODE                                           */}
          {/* ============================================================== */}
          {isCompanyView && companyData ? (
            <Box sx={{ p: 2.2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {activeTab === 'overview' && (
                <>
                  {/* Hero Company Card */}
                  <Box
                    sx={{
                      p: 2.2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
                      border: '1px solid #DDD6FE',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 1.2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 58,
                        height: 58,
                        bgcolor: companyData.avatarColor,
                        fontSize: 22,
                        fontWeight: 800,
                        color: '#FFFFFF',
                        boxShadow: '0 4px 14px rgba(105, 0, 198, 0.25)',
                        border: '2px solid #FFFFFF',
                      }}
                    >
                      {String(companyData?.name || 'C').charAt(0).toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography sx={{ fontSize: 17, fontWeight: 850, color: '#0F172A', lineHeight: 1.2 }}>
                        {String(companyData?.name || 'Company')}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 11.5, color: '#6B21A8', fontWeight: 650, mt: 0.3, display: 'block' }}>
                        Enterprise Client Account
                      </Typography>
                    </Box>

                    <Chip
                      label={`${companyData.totalCalls} Calls Recorded`}
                      size="small"
                      sx={{
                        bgcolor: '#6900C6',
                        color: '#FFFFFF',
                        fontWeight: 750,
                        fontSize: 11,
                        height: 22,
                        boxShadow: '0 2px 6px rgba(105, 0, 198, 0.2)',
                      }}
                    />
                  </Box>

                  {/* Resolution Performance Card */}
                  <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <TrendUp size={16} weight="bold" color="#16A34A" />
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                          Resolution Rate
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 850, color: '#16A34A' }}>
                        {companyData.resolutionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={companyData.resolutionRate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': { bgcolor: '#16A34A', borderRadius: 3 },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.2, fontSize: 11 }}>
                      <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                        ✓ {companyData.solvedCount} Solved
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 700 }}>
                        ⏳ {companyData.runningCount + companyData.pendingCount} Active
                      </Typography>
                    </Box>
                  </Box>

                  {/* Frequent Callers Breakdown */}
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Frequent Callers ({companyData.callers.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {companyData.callers.slice(0, 6).map(([callerName, count], idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            px: 1.2,
                            bgcolor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar sx={{ width: 26, height: 26, fontSize: 10.5, bgcolor: '#EDE9FE', color: '#6900C6', fontWeight: 800 }}>
                              {callerName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B' }}>
                              {callerName}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${count} calls`}
                            size="small"
                            sx={{ height: 18, fontSize: 9.5, fontWeight: 750, bgcolor: '#F1F5F9', color: '#475569' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Assigned Support Leads */}
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Assigned Support Desk
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {companyData.agents.slice(0, 4).map(([agentName, count], idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            px: 1.2,
                            bgcolor: '#F8FAFC',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar sx={{ width: 26, height: 26, fontSize: 10.5, bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 800 }}>
                              {agentName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B' }}>
                              {agentName}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                            {count} tickets
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
                    <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                      <FileImage size={36} weight="duotone" />
                      <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 1 }}>No files found</Typography>
                      <Typography variant="caption">Attachments from calls appear here</Typography>
                    </Box>
                  ) : (
                    companyData.attachments.map((att, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.2,
                          bgcolor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        <AttachmentPill attachment={att} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.6, px: 0.4 }}>
                          <Typography variant="caption" sx={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                            Call #{att.callSr}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: 10, color: '#94A3B8' }}>
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
                <Box onClick={handleTimelineClick} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {companyData.calls.map((c) => {
                    const isSelected = c.id === activeThread?.id;

                    return (
                      <Box
                        key={c.id}
                        data-call-id={c.id}
                        sx={{
                          p: 1.2,
                          px: 1.4,
                          bgcolor: isSelected ? '#EDE9FE' : '#FFFFFF',
                          border: isSelected ? '1px solid #C4B5FD' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&:hover': { bgcolor: isSelected ? '#EDE9FE' : '#F8FAFC' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 750, color: '#0F172A' }}>
                            Call #{c.sr} • {c.callBy || c.name}
                          </Typography>
                          <Typography sx={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
                            {c.timestamp}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11.5, color: '#475569', mt: 0.4 }} noWrap>
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
            /* B. INDIVIDUAL CALL TICKET VIEW MODE                            */
            /* ============================================================== */
            <Box sx={{ p: 2.2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {activeTab === 'overview' && (
                <>
                  {/* Call Ticket Header Card */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                      border: '1px solid #BBF7D0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 10.5, color: '#166534', fontWeight: 750, letterSpacing: '0.04em' }}>
                            VOICE TICKET #{rec.sr || '22861'}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => openEditCallModal(activeThread)}
                            startIcon={<PencilSimpleLine size={12} weight="bold" />}
                            sx={{
                              p: '1px 6px',
                              minWidth: 0,
                              fontSize: 10,
                              fontWeight: 750,
                              color: '#166534',
                              bgcolor: 'rgba(22, 101, 52, 0.1)',
                              borderRadius: '4px',
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(22, 101, 52, 0.2)' },
                            }}
                          >
                            Edit
                          </Button>
                        </Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 850, color: '#0F172A', mt: 0.2 }}>
                          {rec.company || 'Client Account'}
                        </Typography>
                      </Box>

                      {/* Dual Status Chips */}
                      {(() => {
                        const extName = rec.Estatus || activeThread?.estatus || 'Completed';
                        const intName = rec.status || activeThread?.status || 'Solved';
                        const extSt = getStatusStyle(extName);
                        const intSt = getStatusStyle(intName);
                        return (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'flex-end' }}>
                            <Chip
                              label={`Ext: ${extName}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 750,
                                bgcolor: extSt.bg,
                                color: extSt.text,
                                border: `1px solid ${extSt.border}`,
                              }}
                            />
                            <Chip
                              label={`Int: ${intName}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 750,
                                bgcolor: intSt.bg,
                                color: intSt.text,
                                border: `1px solid ${intSt.border}`,
                              }}
                            />
                          </Box>
                        );
                      })()}
                    </Box>

                    {/* Escalation or Rating Bar */}
                    {(rec.CallType === 'Forwarded' || rec.ForwardedEmp || rec.rating > 0) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.8, borderTop: '1px dashed #BBF7D0' }}>
                        {rec.rating > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#D97706', fontSize: 11, fontWeight: 750 }}>
                            <Star size={13} weight="fill" />
                            <span>{rec.rating}.0 Customer Rating</span>
                          </Box>
                        ) : <Box />}

                        {(rec.CallType === 'Forwarded' || rec.ForwardedEmp) && (
                          <Chip
                            label={`↗ Forwarded: ${rec.ForwardedEmp || 'Specialist'}`}
                            size="small"
                            sx={{ height: 18, fontSize: 9.5, fontWeight: 750, bgcolor: '#F3E8FF', color: '#6900C6' }}
                          />
                        )}
                      </Box>
                    )}

                    <Typography sx={{ fontSize: 12.5, fontWeight: 650, color: '#1E293B', mt: 0.2 }}>
                      {rec.description || 'Voice Support Session'}
                    </Typography>
                  </Box>

                  {/* Persons In This Call */}
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Persons In This Call
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Client Caller */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#EDE9FE', color: '#6900C6', fontWeight: 800, fontSize: 12 }}>
                          {(rec.callBy || 'C').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#0F172A' }}>
                            {rec.callBy || activeThread?.name || 'Client Caller'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: 10.5, color: '#64748B' }}>
                            Client • {rec.company || 'Company Rep'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Handling Support Executive */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 800, fontSize: 12 }}>
                          {(rec.receivedBy || 'A').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#0F172A' }}>
                            {rec.receivedBy || rec.AssignedEmpName || 'Support Agent'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: 10.5, color: '#64748B' }}>
                            Assigned Agent • {rec.DeptName || 'Support Team'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Call Timing & Telemetry */}
                  <Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Call Telemetry
                    </Typography>
                    <Box sx={{ p: 1.4, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>Call Start:</Typography>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A' }}>
                          {formatCallDateTime(rec.callStart || rec.CallStart)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>Call Closed:</Typography>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A' }}>
                          {formatCallDateTime(rec.callClosed || rec.CallClosed)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>Duration:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#6900C6' }}>
                            {rec.CallDuration || rec.callDuration || '—'}
                          </Typography>
                          {Boolean(
                            (rec.callStart || rec.CallStart) &&
                            (rec.callStart || rec.CallStart) !== '1900-01-01T00:00:00' &&
                            (rec.callClosed || rec.CallClosed) &&
                            (rec.callClosed || rec.CallClosed) !== '1900-01-01T00:00:00'
                          ) && (
                            <Tooltip title="Edit Call Duration">
                              <IconButton
                                size="small"
                                onClick={() => openDurationModal(rec)}
                                sx={{ p: 0.3, color: '#64748B', '&:hover': { color: '#0284C7', bgcolor: '#E0F2FE' } }}
                              >
                                <PencilSimpleLine size={13} weight="bold" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>Channel:</Typography>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A' }}>
                          {rec.callSourceLabel || 'VoIP Entry'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Follow-Up Calls in this Ticket */}
                  {followupsList.length > 0 && (
                    <Box>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#475569', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Follow-Up Calls ({followupsList.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        {followupsList.map((fu, idx) => {
                          const startStr = formatCallDateTime(fu.CallStart || fu.callStart);
                          const endStr = formatCallDateTime(fu.CallClosed || fu.callClosed);
                          const durationStr = fu.CallDuration || fu.callDuration || '';
                          const descr = (fu.Description || fu.description || fu.Descr || fu.descr || '').trim();

                          return (
                            <Box key={idx} sx={{ p: 1.2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 750, color: '#6900C6' }}>
                                  Follow-up #{fu.Id || idx + 1}
                                </Typography>
                                <Typography sx={{ fontSize: 10.5, color: '#64748B' }}>
                                  {fu.CreatedBy || fu.ReceivedBy || 'Agent'}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, fontSize: 10.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography sx={{ fontSize: 10.5, color: '#64748B' }}>Start:</Typography>
                                  <Typography sx={{ fontSize: 10.5, fontWeight: 650, color: '#1E293B' }}>{startStr}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography sx={{ fontSize: 10.5, color: '#64748B' }}>End:</Typography>
                                  <Typography sx={{ fontSize: 10.5, fontWeight: 650, color: '#1E293B' }}>{endStr}</Typography>
                                </Box>
                                {durationStr && durationStr !== '00:00:00' && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: 10.5, color: '#64748B' }}>Duration:</Typography>
                                    <Typography sx={{ fontSize: 10.5, fontWeight: 750, color: '#0F172A' }}>{durationStr}</Typography>
                                  </Box>
                                )}
                              </Box>

                              {descr && (
                                <Typography sx={{ fontSize: 11, color: '#334155', mt: 0.5, bgcolor: '#FFFFFF', p: 0.6, borderRadius: '4px', border: '1px solid #F1F5F9' }}>
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
              )}

              {/* Files Tab in Call Mode */}
              {activeTab === 'files' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {callAttachments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                      <FileImage size={36} weight="duotone" />
                      <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 1 }}>No attachments</Typography>
                      <Typography variant="caption">Screenshots or files in this ticket appear here</Typography>
                    </Box>
                  ) : (
                    callAttachments.map((att, idx) => (
                      <Box key={idx} sx={{ p: 1.2, bgcolor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <AttachmentPill attachment={att} />
                        <Typography variant="caption" sx={{ fontSize: 10.5, color: '#64748B', display: 'block', mt: 0.6, px: 0.4 }}>
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
