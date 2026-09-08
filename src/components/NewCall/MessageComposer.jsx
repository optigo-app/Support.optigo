'use client';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  Link,
  ListNumbers,
  ListBullets,
  Quotes,
  Code,
  ImageSquare,
  TextAa,
  Smiley,
  At,
  VideoCamera,
  Microphone,
  Article,
  PaperPlaneRight,
  X,
  FileText,
  FilePdf,
  FileZip,
  Paperclip,
  Ticket,
  CheckSquare,
  Eye,
  CaretDown,
  Globe,
  Tag,
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCallLog } from '../../context/UseCallLog';
import { useAuth } from '../../context/UseAuth';
import { callStreamService } from './services/callStreamService';
import TaskDetailSidebar from '../CallLogger/Itask/TaskDetailSidebar';

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(fileName = '', mimeType = '') {
  const lower = fileName.toLowerCase();
  if (mimeType.startsWith('image/') || lower.match(/\.(png|jpe?g|gif|webp|svg)$/)) {
    return <ImageSquare size={20} weight="duotone" color="#6900C6" />;
  }
  if (lower.endsWith('.pdf')) {
    return <FilePdf size={20} weight="duotone" color="#DC2626" />;
  }
  if (lower.match(/\.(zip|rar|7z|tar|gz)$/)) {
    return <FileZip size={20} weight="duotone" color="#D97706" />;
  }
  return <FileText size={20} weight="duotone" color="#0284C7" />;
}

const MessageComposer = React.memo(function MessageComposer({
  placeholder = 'Jot something down',
  onSendMessage,
  activeThread = null,
}) {
  const navigate = useNavigate();
  const { user, CompanyInfo } = useAuth();
  const { CALL_TYPE_MASTER, UpdateCall, saveCallLogTask, getTaskList } = useCallLog();

  const [text, setText] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // iTask State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskData, setTaskData] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Call Type State
  const [callTypeAnchor, setCallTypeAnchor] = useState(null);
  const [isUpdatingCallType, setIsUpdatingCallType] = useState(false);

  const fileInputRef = useRef(null);

  const rawRecord = useMemo(() => activeThread?.rawRecord || activeThread || {}, [activeThread]);
  const isTicketDone = Boolean(
    (rawRecord?.ticket && String(rawRecord?.ticket).trim() !== '' && String(rawRecord?.ticket).trim() !== 'Upgrade to Ticket') ||
    (rawRecord?.Ticket_CreatedDate && String(rawRecord?.Ticket_CreatedDate).trim() !== '') ||
    rawRecord?.Ticket_Id ||
    rawRecord?.ticketId
  );
  const hasTaskId = Boolean(
    (rawRecord?.TaskId && Number(rawRecord?.TaskId) > 0) ||
    (rawRecord?.taskId && Number(rawRecord?.taskId) > 0)
  );

  // Resolve Call Type label
  const currentCallTypeVal = rawRecord?.CallType || rawRecord?.callType || '';
  const currentCallTypeObj = useMemo(() => {
    return CALL_TYPE_MASTER?.find(
      (o) => o.value === currentCallTypeVal || o.label === currentCallTypeVal
    ) || null;
  }, [CALL_TYPE_MASTER, currentCallTypeVal]);

  // Resolve Source label and styles
  const sourceInfo = useMemo(() => {
    const rawSource = (rawRecord?.topicRaisedBy || activeThread?.topicRaisedBy || '').trim().toLowerCase();
    if (rawSource === 'optigocarely') {
      return { label: 'OptigoCarely', bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' };
    }
    if (rawSource === 'helpdesk') {
      return { label: 'help.optigoapps.com', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
    }
    return { label: 'Csystem', bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' };
  }, [rawRecord, activeThread]);

  const handleSelectFile = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleSelectFile(files[0]);
    }
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      handleSelectFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !selectedFile) || isUploading) return;

    try {
      setIsUploading(true);
      if (onSendMessage) {
        await onSendMessage(text, selectedFile);
      }
      setText('');
      handleRemoveFile();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 1. Upgrade to Ticket / In Ticket Handler
  const handleTicketAction = (e) => {
    e.stopPropagation();
    const callLogId = String(rawRecord?.sr || rawRecord?.id || activeThread?.sr || '').trim();
    if (isTicketDone) {
      const ticketId = rawRecord?.ticket && rawRecord?.ticket !== 'In Ticket' ? rawRecord.ticket : rawRecord?.Ticket_Id || rawRecord?.ticketId || callLogId;
      const encodedId = btoa(ticketId);
      navigate(`/ticket?TicketPreviewId=${encodedId}`);
    } else {
      const encodedId = btoa(callLogId);
      const encodedApp = btoa(rawRecord?.appname || rawRecord?.company || activeThread?.company || '');
      const { forward, ...safeData } = rawRecord;
      navigate(`/ticket?TicketId=${encodedId}&Appname=${encodedApp}`, {
        state: {
          ...safeData,
          id: callLogId,
          sr: callLogId,
          CallId: callLogId,
          company: safeData.company || activeThread?.company,
          description: safeData.description || activeThread?.lastMessage || '',
        },
      });
    }
  };

  // 2. Move to iTask / View iTask Handler
  const handleTaskAction = async (e) => {
    e.stopPropagation();
    const taskId = Number(rawRecord?.TaskId || rawRecord?.taskId) > 0 ? (rawRecord?.TaskId || rawRecord?.taskId) : null;
    const callLogId = Number(rawRecord?.sr || rawRecord?.id || activeThread?.sr) || rawRecord?.sr || activeThread?.sr;
    if (taskId) {
      setIsTaskModalOpen(true);
      try {
        const result = await getTaskList(taskId);
        if (result?.success) {
          setTaskData(result?.data?.rd || []);
        }
      } catch (err) {
        console.error('Error fetching task data:', err);
      }
    } else {
      setIsCreatingTask(true);
      try {
        const result = await saveCallLogTask({
          taskname: rawRecord?.description || activeThread?.lastMessage || 'Voice Support Call Task',
          descr: '',
          assigneids: user?.id,
          customername: CompanyInfo?.companycode || rawRecord?.company || activeThread?.company,
          taskid: callLogId,
        });
        if (result?.success) {
          const newTaskId = result?.data?.rd?.[0]?.TaskId || result?.data?.rd?.[0]?.id || result?.taskId || 1;
          callStreamService.patchPrimaryCall(callLogId, { TaskId: newTaskId, taskId: newTaskId });
          toast.success('Task successfully created in iTask');
        }
      } catch (err) {
        console.error('Error creating iTask:', err);
      } finally {
        setIsCreatingTask(false);
      }
    }
  };

  // 3. Call Type Selection Handler
  const handleCallTypeSelect = async (typeVal) => {
    setCallTypeAnchor(null);
    const callId = rawRecord?.id || activeThread?.sr;
    if (!callId) return;
    try {
      setIsUpdatingCallType(true);
      const res = await UpdateCall(callId, { callType: typeVal });
      if (res?.success) {
        callStreamService.patchPrimaryCall(activeThread?.sr, { CallType: typeVal, callType: typeVal });
        toast.success(`Call Type updated to ${typeVal}`);
      }
    } catch (err) {
      console.error('Error updating call type:', err);
    } finally {
      setIsUpdatingCallType(false);
    }
  };

  const isSendDisabled = (!text.trim() && !selectedFile) || isUploading;

  return (
    <Box
      sx={{ p: 2, pt: 1, bgcolor: '#FFFFFF' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.ppt,.pptx,.zip,.rar"
        style={{ display: 'none' }}
      />

      <Box
        sx={{
          border: isDragging ? '1.5px dashed #6900C6' : '1px solid #CBD5E1',
          borderRadius: '8px',
          bgcolor: isDragging ? '#FDF8FF' : '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.15s ease',
          '&:focus-within': {
            borderColor: '#6900C6',
            boxShadow: '0 0 0 1px rgba(105, 0, 198, 0.2)',
          },
        }}
      >
        {/* Top Formatting Toolbar & Actions Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.5,
            borderBottom: '1px solid #F1F5F9',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          {/* Left: Rich Text Formatting Tools */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Tooltip title="Bold (⌘B)">
              <IconButton
                size="small"
                onClick={() => setIsBold(!isBold)}
                sx={{ color: isBold ? '#6900C6' : '#64748B', p: 0.4, borderRadius: '4px', bgcolor: isBold ? '#EDE9FE' : 'transparent' }}
              >
                <TextB size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Italic (⌘I)">
              <IconButton
                size="small"
                onClick={() => setIsItalic(!isItalic)}
                sx={{ color: isItalic ? '#6900C6' : '#64748B', p: 0.4, borderRadius: '4px', bgcolor: isItalic ? '#EDE9FE' : 'transparent' }}
              >
                <TextItalic size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Strikethrough">
              <IconButton
                size="small"
                onClick={() => setIsStrike(!isStrike)}
                sx={{ color: isStrike ? '#6900C6' : '#64748B', p: 0.4, borderRadius: '4px', bgcolor: isStrike ? '#EDE9FE' : 'transparent' }}
              >
                <TextStrikethrough size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Box sx={{ width: '1px', height: 14, bgcolor: '#E2E8F0', mx: 0.4 }} />

            <Tooltip title="Link">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <Link size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Numbered list">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <ListNumbers size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Bulleted list">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <ListBullets size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Blockquote">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <Quotes size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Code snippet">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <Code size={15} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Embed image / file attachment">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{ color: selectedFile ? '#6900C6' : '#64748B', p: 0.4, borderRadius: '4px', bgcolor: selectedFile ? '#EDE9FE' : 'transparent' }}
              >
                <ImageSquare size={15} weight="bold" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Right: Integrated Action Chips (Ticket Upgrade, iTask, Call Type, Source) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            {/* Source Chip */}
            <Tooltip title={`Call Source: ${sourceInfo.label}`} arrow>
              <Chip
                icon={<Globe size={12} weight="bold" />}
                label={sourceInfo.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: sourceInfo.bg,
                  color: sourceInfo.color,
                  border: `1px solid ${sourceInfo.border}`,
                  borderRadius: '5px',
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
            </Tooltip>

            {/* Call Type Selector Chip */}
            <Tooltip title="Set Call Type" arrow>
              <Chip
                icon={isUpdatingCallType ? <CircularProgress size={10} thickness={5} /> : <Tag size={12} weight="bold" />}
                label={currentCallTypeObj?.label || currentCallTypeVal || 'Call Type'}
                onClick={(e) => setCallTypeAnchor(e.currentTarget)}
                deleteIcon={<CaretDown size={11} weight="bold" />}
                onDelete={(e) => setCallTypeAnchor(e.currentTarget)}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: currentCallTypeVal ? '#F3E8FF' : '#F8FAFC',
                  color: currentCallTypeVal ? '#6900C6' : '#475569',
                  border: `1px solid ${currentCallTypeVal ? '#DDD6FE' : '#E2E8F0'}`,
                  borderRadius: '5px',
                  cursor: 'pointer',
                  '& .MuiChip-icon': { color: 'inherit' },
                  '& .MuiChip-deleteIcon': { color: 'inherit', margin: '0 4px 0 -4px' },
                  '&:hover': { bgcolor: '#EDE9FE' },
                }}
              />
            </Tooltip>

            {/* Upgrade to Ticket / In Ticket Action Button */}
            <Tooltip title={isTicketDone ? 'View Linked Helpdesk Ticket' : 'Upgrade this call into a Helpdesk Ticket'} arrow>
              <Chip
                icon={<Ticket size={13} weight="bold" />}
                label={isTicketDone ? 'In Ticket' : 'Upgrade to Ticket'}
                onClick={handleTicketAction}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  bgcolor: isTicketDone ? '#E0F2FE' : '#F8FAFC',
                  color: isTicketDone ? '#0284C7' : '#334155',
                  border: `1px solid ${isTicketDone ? '#BAE6FD' : '#E2E8F0'}`,
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '& .MuiChip-icon': { color: 'inherit' },
                  '&:hover': {
                    bgcolor: isTicketDone ? '#BAE6FD' : '#F1F5F9',
                    borderColor: isTicketDone ? '#7DD3FC' : '#CBD5E1',
                    transform: 'translateY(-0.5px)',
                  },
                }}
              />
            </Tooltip>

            {/* Move to iTask / View iTask Action Button */}
            <Tooltip title={hasTaskId ? 'View Linked Task in iTask' : 'Create Task in iTask from this Call'} arrow>
              <Chip
                icon={
                  isCreatingTask ? (
                    <CircularProgress size={10} thickness={5} />
                  ) : hasTaskId ? (
                    <Eye size={13} weight="bold" />
                  ) : (
                    <CheckSquare size={13} weight="bold" />
                  )
                }
                label={hasTaskId ? 'View iTask' : 'Create to iTask'}
                onClick={handleTaskAction}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  bgcolor: hasTaskId ? '#DCFCE7' : '#F8FAFC',
                  color: hasTaskId ? '#15803D' : '#334155',
                  border: `1px solid ${hasTaskId ? '#BBF7D0' : '#E2E8F0'}`,
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '& .MuiChip-icon': { color: 'inherit' },
                  '&:hover': {
                    bgcolor: hasTaskId ? '#BBF7D0' : '#F1F5F9',
                    borderColor: hasTaskId ? '#86EFAC' : '#CBD5E1',
                    transform: 'translateY(-0.5px)',
                  },
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* Selected Attachment Preview Card */}
        {selectedFile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              m: 1,
              mb: 0.5,
              p: 1,
              px: 1.4,
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              maxWidth: 'fit-content',
            }}
          >
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt={selectedFile.name}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '6px',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid #CBD5E1',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '6px',
                  bgcolor: '#EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getFileIcon(selectedFile.name, selectedFile.type)}
              </Box>
            )}

            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontSize: 12.5,
                  fontWeight: 650,
                  color: '#0F172A',
                  maxWidth: 220,
                }}
              >
                {selectedFile.name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>

            <Tooltip title="Remove file">
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                sx={{
                  p: 0.4,
                  ml: 0.5,
                  color: '#94A3B8',
                  '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' },
                }}
              >
                <X size={14} weight="bold" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Text Input Area */}
        <Box sx={{ px: 1.5, py: 1, minHeight: 44 }}>
          <InputBase
            multiline
            minRows={1}
            maxRows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={selectedFile ? 'Add a message or press Enter to send attachment...' : placeholder}
            disabled={isUploading}
            sx={{
              width: '100%',
              fontSize: 13.5,
              fontWeight: isBold ? 700 : 450,
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isStrike ? 'line-through' : 'none',
              color: '#0F172A',
              '& input': { p: 0 },
            }}
          />
        </Box>

        {/* Bottom Actions Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.5,
          }}
        >
          {/* Left Shortcuts / Attachments */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Tooltip title="Attach files or image">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{ color: selectedFile ? '#6900C6' : '#64748B', p: 0.4, borderRadius: '4px', bgcolor: selectedFile ? '#EDE9FE' : 'transparent' }}
              >
                <Paperclip size={16} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Format toolbar">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <TextAa size={16} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add emoji">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <Smiley size={16} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Mention someone (@)">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <At size={16} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Record video clip">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <VideoCamera size={16} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Record audio clip">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <Microphone size={16} weight="bold" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Create canvas document">
              <IconButton size="small" sx={{ color: '#64748B', p: 0.4, borderRadius: '4px' }}>
                <Article size={16} weight="bold" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Right Send Button */}
          <IconButton
            size="small"
            onClick={handleSend}
            disabled={isSendDisabled}
            sx={{
              bgcolor: !isSendDisabled ? '#007A5A' : 'transparent',
              color: !isSendDisabled ? '#FFFFFF' : '#94A3B8',
              borderRadius: '6px',
              p: 0.6,
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: !isSendDisabled ? '#006046' : 'transparent',
              },
            }}
          >
            {isUploading ? (
              <CircularProgress size={16} sx={{ color: '#6900C6' }} />
            ) : (
              <PaperPlaneRight size={16} weight="fill" />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Call Type Dropdown Menu */}
      <Menu
        anchorEl={callTypeAnchor}
        open={Boolean(callTypeAnchor)}
        onClose={() => setCallTypeAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            minWidth: 160,
            p: 0.5,
          },
        }}
      >
        {CALL_TYPE_MASTER?.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentCallTypeVal || option.label === currentCallTypeVal}
            onClick={() => handleCallTypeSelect(option.value)}
            sx={{
              fontSize: '12.5px',
              fontWeight: option.value === currentCallTypeVal ? 750 : 500,
              borderRadius: '6px',
              my: 0.2,
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* iTask Task Detail Sidebar */}
      <TaskDetailSidebar
        taskData={taskData}
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </Box>
  );
});

export default MessageComposer;
