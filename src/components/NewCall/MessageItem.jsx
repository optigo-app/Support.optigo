'use client';
import React, { useState } from 'react';
import { Box, Typography, Avatar, Paper, Chip, Button } from '@mui/material';
import {
  Ticket,
  CheckSquare,
  ArrowSquareOut,
  Building,
  Calendar,
  User,
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import CallLogCard from './CallLogCard';
import FollowUpCallCard from './FollowUpCallCard';
import AttachmentPill from './AttachmentPill';
import TaskDetailSidebar from '../CallLogger/Itask/TaskDetailSidebar';
import { useCallLog } from '../../context/UseCallLog';

export default function MessageItem({ message }) {
  const navigate = useNavigate();
  const { getTaskList } = useCallLog();
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [taskData, setTaskData] = useState([]);

  if (!message) return null;

  // 1. Right-side speech bubble for user-composed outgoing messages
  if (message.isOutgoing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          gap: 1.2,
          px: 3,
          py: 0.8,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '75%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
            <Typography sx={{ fontSize: 10.5, color: '#94A3B8' }}>{message.time}</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 750, color: '#0F172A' }}>
              {message.sender || 'You (Support)'}
            </Typography>
          </Box>

          {message.content && (
            <Paper
              elevation={0}
              sx={{
                p: 1.4,
                px: 1.8,
                bgcolor: '#6900C6',
                color: '#FFFFFF',
                borderRadius: '12px 12px 2px 12px',
                fontSize: 13,
                lineHeight: 1.45,
                wordBreak: 'break-word',
                boxShadow: '0 2px 8px rgba(105, 0, 198, 0.2)',
              }}
            >
              {renderFormattedMessage(message.content)}
            </Paper>
          )}

          {message.attachment && (
            <Box sx={{ mt: 0.5, alignSelf: 'flex-end' }}>
              <AttachmentPill attachment={message.attachment} />
            </Box>
          )}
        </Box>

        <Avatar
          sx={{ width: 30, height: 30, borderRadius: '50px', bgcolor: '#6900C6', color: '#FFFFFF', fontSize: 12, fontWeight: 800 }}
        >
          {(message.sender || 'Y').charAt(0).toUpperCase()}
        </Avatar>
      </Box>
    );
  }

  // 2. Helpdesk Ticket Entry Card
  if (message.isTicketCard && message.ticketData) {
    const tData = message.ticketData;
    const handleOpenTicket = () => {
      const encodedId = btoa(tData.ticketId || tData.sr || '');
      navigate(`/ticket?TicketPreviewId=${encodedId}`);
    };

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.4,
          px: 3,
          py: 0.8,
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: '#F8FAFC' },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
            mt: 0.3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1.5px solid #BAE6FD',
          }}
        >
          <Ticket size={18} weight="bold" />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header line: Sender + Ticket Chip + Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mb: 0.35 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#0F172A' }}>
              {message.sender || 'Support Team'}
            </Typography>
            <Chip
              label={`Helpdesk Ticket • #${tData.ticketId || ''}`}
              size="small"
              sx={{
                height: 19,
                fontSize: 9.5,
                fontWeight: 750,
                bgcolor: '#E0F2FE',
                color: '#0284C7',
                border: '1px solid #BAE6FD',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
            <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, ml: 'auto' }}>
              {message.time}
            </Typography>
          </Box>

          {/* Ticket Card Content */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '8px',
              border: '1px solid #BAE6FD',
              bgcolor: '#F0F9FF',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxWidth: 580,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Ticket size={16} color="#0284C7" weight="bold" />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 750, color: '#0369A1' }}>
                  Upgraded to Helpdesk Ticket
                </Typography>
              </Box>
              <Chip
                label="In Ticket"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                }}
              />
            </Box>

            <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 550 }}>
              {tData.ticketTitle || 'Call converted to support ticket'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', pt: 0.3 }}>
              {tData.company && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Building size={12} color="#64748B" />
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    {tData.company}
                  </Typography>
                </Box>
              )}
              {tData.createdBy && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <User size={12} color="#64748B" />
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    By: {tData.createdBy}
                  </Typography>
                </Box>
              )}
              {tData.ticketCreatedDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Calendar size={12} color="#64748B" />
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    {tData.ticketCreatedDate}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenTicket}
                endIcon={<ArrowSquareOut size={13} weight="bold" />}
                sx={{
                  height: 26,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: '#0284C7',
                  color: '#0284C7',
                  '&:hover': {
                    bgcolor: '#E0F2FE',
                    borderColor: '#0369A1',
                  },
                }}
              >
                Open Ticket Preview
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  // 3. iTask Entry Card
  if (message.isiTaskCard && message.itaskData) {
    const task = message.itaskData;
    const handleOpenTaskSidebar = async () => {
      setTaskDetailOpen(true);
      try {
        const result = await getTaskList(task.taskId);
        if (result?.success) {
          setTaskData(result?.data?.rd || []);
        }
      } catch (err) {
        console.error('Error fetching task details:', err);
      }
    };

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.4,
          px: 3,
          py: 0.8,
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: '#F8FAFC' },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#DCFCE7',
            color: '#15803D',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
            mt: 0.3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1.5px solid #BBF7D0',
          }}
        >
          <CheckSquare size={18} weight="bold" />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header line: Sender + Task Chip + Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mb: 0.35 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#0F172A' }}>
              {message.sender || 'Support Team'}
            </Typography>
            <Chip
              label={`iTask • #${task.taskId || ''}`}
              size="small"
              sx={{
                height: 19,
                fontSize: 9.5,
                fontWeight: 750,
                bgcolor: '#DCFCE7',
                color: '#15803D',
                border: '1px solid #BBF7D0',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
            <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, ml: 'auto' }}>
              {message.time}
            </Typography>
          </Box>

          {/* Task Card Content */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '8px',
              border: '1px solid #BBF7D0',
              bgcolor: '#F0FDF4',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxWidth: 580,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <CheckSquare size={16} color="#15803D" weight="bold" />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 750, color: '#15803D' }}>
                  Task Created in iTask
                </Typography>
              </Box>
              <Chip
                label="Linked"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: '#15803D',
                  color: '#FFFFFF',
                }}
              />
            </Box>

            <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 550 }}>
              {task.taskName || 'Call converted to iTask task'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', pt: 0.3 }}>
              {task.customerName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Building size={12} color="#64748B" />
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    {task.customerName}
                  </Typography>
                </Box>
              )}
              {task.assignedTo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <User size={12} color="#64748B" />
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    Assigned: {task.assignedTo}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenTaskSidebar}
                endIcon={<ArrowSquareOut size={13} weight="bold" />}
                sx={{
                  height: 26,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: '#15803D',
                  color: '#15803D',
                  '&:hover': {
                    bgcolor: '#DCFCE7',
                    borderColor: '#166534',
                  },
                }}
              >
                View Task Details
              </Button>
            </Box>
          </Paper>

          {/* Task Details Sidebar Modal */}
          <TaskDetailSidebar
            taskData={taskData}
            open={taskDetailOpen}
            onClose={() => setTaskDetailOpen(false)}
          />
        </Box>
      </Box>
    );
  }

  // 4. Follow-Up Call or Forwarded Call Record Card (Indigo / Purple Theme)
  const fuData = message.followup || message.followUpData;
  if (
    (message.isFollowUpCard || message.isFollowUp || fuData) &&
    fuData &&
    (fuData.Id || fuData.id || fuData.followUpCallId)
  ) {
    const isForward =
      message.isForwarded ||
      fuData.isForwarded ||
      Boolean(fuData.forwardedEmp || fuData.ForwardedEmp);
    const fuId = fuData.Id || fuData.id || fuData.followUpCallId;
    const senderName =
      fuData.forwardedEmp ||
      fuData.ForwardedEmp ||
      fuData.CreatedBy ||
      message.company ||
      message.sender ||
      'Support Team';

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.4,
          px: 3,
          py: 0.7,
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: '#F8FAFC' },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: isForward ? '#EDE9FE' : '#EEF2FF',
            color: isForward ? '#6900C6' : '#4F46E5',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
            mt: 0.3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: isForward ? '1.5px solid #DDD6FE' : '1.5px solid #C7D2FE',
          }}
        >
          {senderName.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header line: Sender Name + Call Type Chip + Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mb: 0.35 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#0F172A' }}>
              {senderName}
            </Typography>
            <Chip
              label={isForward ? `Forwarded Call • #${fuId}` : `Follow-Up Call • #${fuId}`}
              size="small"
              sx={{
                height: 19,
                fontSize: 9.5,
                fontWeight: 750,
                bgcolor: isForward ? '#EDE9FE' : '#FEF3C7',
                color: isForward ? '#6900C6' : '#B45309',
                border: isForward ? '1px solid #DDD6FE' : '1px solid #FDE68A',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
            <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, ml: 'auto' }}>
              {message.time}
            </Typography>
          </Box>

          <FollowUpCallCard followup={fuData} callerName={fuData.callerName || message.record?.callerName} />
        </Box>
      </Box>
    );
  }

  // 5. Primary Voice Support Call Log Card Entry (Green/Emerald Theme)
  if (message.isCallRecord || message.record) {
    const callerOrAgent =
      message.record?.receivedBy ||
      message.record?.AssignedEmpName ||
      message.record?.CreatedBy ||
      message.record?.callBy ||
      (message.record?.sr ? `Primary Call #${message.record.sr}` : 'Primary Call');

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.4,
          px: 3,
          py: 0.7,
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: '#F8FAFC' },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#DCFCE7',
            color: '#15803D',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
            mt: 0.3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1.5px solid #BBF7D0',
          }}
        >
          {callerOrAgent.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header line: Name + Primary Call Chip + Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mb: 0.35 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 750, color: '#0F172A' }}>
              {callerOrAgent}
            </Typography>
            <Chip
              label={
                message.record?.topicRaisedBy &&
                message.record?.topicRaisedBy.toLowerCase() !== (message.record?.company || '').toLowerCase()
                  ? `${message.record.topicRaisedBy} • #${message.record?.sr || ''}`
                  : `Primary Voice Call • #${message.record?.sr || ''}`
              }
              size="small"
              sx={{
                height: 19,
                fontSize: 9.5,
                fontWeight: 750,
                bgcolor: '#DCFCE7',
                color: '#15803D',
                border: '1px solid #BBF7D0',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
            <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, ml: 'auto' }}>
              {message.time || message.record?.time}
            </Typography>
          </Box>

          <CallLogCard record={message.record} />
        </Box>
      </Box>
    );
  }

  // 6. Comments & Remarks Entry (With distinct Comment Chip & Attachment Pill)
  if (message.isComment) {
    const initials = message.sender
      ? message.sender.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : 'RP';

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          px: 3,
          py: 1,
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: '#F8FAFC' },
        }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: '#0284C7',
            color: '#FFFFFF',
            fontSize: 11.5,
            fontWeight: 800,
            flexShrink: 0,
            mt: 0.2,
          }}
        >
          {initials}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
              {message.sender}
            </Typography>
            <Chip
              label="Comment"
              size="small"
              sx={{
                height: 18,
                fontSize: 9.5,
                fontWeight: 750,
                bgcolor: '#F3E8FF',
                color: '#6900C6',
                border: '1px solid #DDD6FE',
              }}
            />
            <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, ml: 'auto' }}>
              {message.time}
            </Typography>
          </Box>

          <Typography
            component="div"
            sx={{
              fontSize: 13,
              color: '#334155',
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {renderFormattedMessage(message.content)}
          </Typography>

          {message.attachment && (
            <AttachmentPill attachment={message.attachment} />
          )}
        </Box>
      </Box>
    );
  }

  // 7. Standard Chat Message
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 3,
        py: 1,
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: '#F8FAFC',
        },
      }}
    >
      <Avatar
        src={message.avatar}
        sx={{
          width: 36,
          height: 36,
          borderRadius: '6px',
          bgcolor: '#EDE9FE',
          color: '#6900C6',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.2,
        }}
      >
        {message.sender?.charAt(0) || 'A'}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
            {message.sender}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, ml: 'auto' }}>
            {message.time}
          </Typography>
        </Box>

        <Typography
          component="div"
          sx={{
            fontSize: 13.5,
            color: '#1E293B',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {renderFormattedMessage(message.content)}
        </Typography>

        {message.attachment && (
          <AttachmentPill attachment={message.attachment} />
        )}
      </Box>
    </Box>
  );
}

function renderFormattedMessage(text) {
  if (!text) return '';

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    const tokens = line.split(/(https?:\/\/[^\s]+|@\w+(?:\s+\w+)?)/g);

    return (
      <Box key={lineIdx} component="span" sx={{ display: 'block' }}>
        {tokens.map((token, tokenIdx) => {
          if (token.match(/^https?:\/\//)) {
            return (
              <Box
                key={tokenIdx}
                component="a"
                href={token}
                target="_blank"
                rel="noreferrer"
                sx={{
                  color: '#0284C7',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {token}
              </Box>
            );
          }

          if (token.startsWith('@')) {
            return (
              <Box
                key={tokenIdx}
                component="span"
                sx={{
                  bgcolor: '#EDE9FE',
                  color: '#6900C6',
                  fontWeight: 700,
                  px: 0.5,
                  py: 0.1,
                  borderRadius: '3px',
                }}
              >
                {token}
              </Box>
            );
          }

          return token;
        })}
      </Box>
    );
  });
}
