import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Badge,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ForwardToInboxRoundedIcon from '@mui/icons-material/ForwardToInboxRounded';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckIcon from '@mui/icons-material/Check';

export default function ForwardedCallDrawer({ open, onClose, forwardedCalls = [], onCallClick }) {

  const [tabValue, setTabValue] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 1. Process and format real data
  const formattedCalls = (forwardedCalls || []).map((call) => {
    const isFwdFollowUp = call.isForwardedFollowUp && call.followUpData;
    const fwdData = isFwdFollowUp ? call.followUpData : call;

    const senderName = isFwdFollowUp
      ? fwdData.CreatedBy
      : (call.forwardedBy || call.receivedBy || call.CreatedBy || "Team Member");

    const recipientName = isFwdFollowUp
      ? fwdData.ForwardedEmp
      : (call.forwardedTo || call.AssignedEmpName || "You");

    const topic = isFwdFollowUp
      ? fwdData.Description
      : (call.description || call.topicRaisedBy || call.CallDetails || "No Topic");

    const tag = `#${call.sr || call.ticket || "CALL"}`;
    const priority = call.priority || "Normal";
    const company = call.company || "";

    // Parse Date for Grouping
    const rawDateString = isFwdFollowUp ? fwdData.CreatedDate : (call.date || call.callStart || call.time);
    let dateGroup = "UNKNOWN DATE";
    let timeDisplay = "";

    if (rawDateString) {
      const callDate = new Date(rawDateString);
      if (!isNaN(callDate.getTime())) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (callDate.toDateString() === today.toDateString()) dateGroup = "TODAY";
        else if (callDate.toDateString() === yesterday.toDateString()) dateGroup = "YESTERDAY";
        else dateGroup = callDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

        // Time logic: if it's not a follow-up, 'call.time' might hold a raw string like "17:01"
        if (isFwdFollowUp) {
          timeDisplay = callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          if (call.time && call.time.includes(':')) {
            const parts = call.time.split(':');
            if (parts.length >= 2 && !isNaN(parts[0])) {
              const d = new Date();
              d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);
              timeDisplay = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
              timeDisplay = call.time;
            }
          } else {
            timeDisplay = callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      } else {
        // Fallback if Date is literally invalid
        timeDisplay = isFwdFollowUp ? fwdData.CreatedDate : (call.time || "");
      }
    } else {
      timeDisplay = call.time || "";
    }

    return {
      id: call.sr || call.id || Math.random(),
      rawCall: call,
      creator: senderName,
      forwardedTo: recipientName,
      topic: topic,
      priority: priority,
      tag: tag,
      company: company,
      time: timeDisplay,
      dateGroup: dateGroup,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=F3F4F6&color=475569`,
      action: senderName.toLowerCase() === recipientName.toLowerCase() ? 'updated the call for' : 'forwarded a call to',
      isRead: false,
    };
  });

  // 2. Apply Filters
  const filteredCalls = formattedCalls.filter(call => {
    if (priorityFilter !== 'All' && call.priority?.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    if (dateFilter === 'Today' && call.dateGroup !== 'TODAY') return false;
    if (dateFilter === 'Yesterday' && call.dateGroup !== 'YESTERDAY') return false;
    return true;
  });

  // 3. Group logic for the UI
  const groupedCalls = filteredCalls.reduce((acc, call) => {
    if (!acc[call.dateGroup]) acc[call.dateGroup] = [];
    acc[call.dateGroup].push(call);
    return acc;
  }, {});

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          margin: 2,
          height: 'calc(100% - 32px)', // Floating effect
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid #E2E8F0',
          bgcolor: '#FAFAFB',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.15)', // Light backdrop for floating feel
            backdropFilter: 'blur(2px)',
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1, bgcolor: '#FFFFFF', zIndex: 2, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.25rem' }}>
            Forwarded Calls
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}
          >
            <CloseIcon fontSize="small" sx={{ color: '#64748B' }} />
          </IconButton>
        </Box>

        {/* Tabs and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minWidth: 'auto',
                mr: 3,
                px: 0,
                color: '#64748B'
              },
              '& .Mui-selected': { color: '#0052CC !important' },
              '& .MuiTabs-indicator': { bgcolor: '#0052CC', height: 3 }
            }}
          >
            <Tab label="Direct" />
            <Tab label="Overall" />
          </Tabs>
          <Button
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#0052CC' }}
          >
            Mark all as read
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ p: 1.5, px: 2, display: 'flex', gap: 1, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Date</InputLabel>
          <Select
            value={dateFilter}
            label="Date"
            onChange={(e) => setDateFilter(e.target.value)}
            sx={{ height: 32, fontSize: '0.75rem', borderRadius: 2 }}
          >
            <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Dates</MenuItem>
            <MenuItem value="Today" sx={{ fontSize: '0.75rem' }}>Today</MenuItem>
            <MenuItem value="Yesterday" sx={{ fontSize: '0.75rem' }}>Yesterday</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ height: 32, fontSize: '0.75rem', borderRadius: 2 }}
          >
            <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Priority</MenuItem>
            <MenuItem value="Urgent" sx={{ fontSize: '0.75rem' }}>Urgent</MenuItem>
            <MenuItem value="High" sx={{ fontSize: '0.75rem' }}>High</MenuItem>
            <MenuItem value="Normal" sx={{ fontSize: '0.75rem' }}>Normal</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
        {Object.keys(groupedCalls).map((dateGroup, index) => (
          <Box key={index}>
            {/* Group Header */}
            <Typography
              sx={{
                px: 2,
                py: 1,
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.5px'
              }}
            >
              {dateGroup}
            </Typography>

            {/* List Items */}
            {groupedCalls[dateGroup].map((call) => (
              <Box
                key={call.id}
                onClick={() => onCallClick && onCallClick(call.rawCall)}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  position: 'relative',
                  borderBottom: '1px solid #F1F5F9',
                  bgcolor: call.isRead ? 'transparent' : alpha('#0052CC', 0.03),
                  '&:hover': { bgcolor: '#F8FAFC' },
                  cursor: 'pointer'
                }}
              >
                {/* Unread Dot */}
                {!call.isRead && (
                  <Box sx={{
                    position: 'absolute', left: 8, top: '50%', mt: -0.5,
                    width: 6, height: 6, borderRadius: '50%', bgcolor: '#0052CC'
                  }} />
                )}

                {/* Avatar with Badge */}
                <Box sx={{ position: 'relative', pl: call.isRead ? 0 : 1 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box sx={{
                        bgcolor: call.priority === 'Urgent' ? '#EF4444' : '#0052CC',
                        borderRadius: '50%',
                        p: 0.3,
                        border: '2px solid #FFF',
                        display: 'flex'
                      }}>
                        {call.priority === 'Urgent' ? (
                          <CloseIcon sx={{ fontSize: 10, color: '#FFF' }} />
                        ) : (
                          <ForwardToInboxRoundedIcon sx={{ fontSize: 10, color: '#FFF' }} />
                        )}
                      </Box>
                    }
                  >
                    <Avatar src={call.avatar} sx={{ width: 36, height: 36 }} />
                  </Badge>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#1E293B', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600 }}>{call.creator}</span> {call.action}{' '}
                    <span style={{ fontWeight: 600, color: '#0052CC' }}>{call.forwardedTo}</span>
                    {': '} {call.topic}
                  </Typography>

                  {call.company && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.2 }}>
                      Company: <span style={{ fontWeight: 600, color: '#334155' }}>{call.company}</span>
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={call.tag}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: '#F1F5F9',
                        color: '#475569',
                        borderRadius: 1
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {call.time}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
