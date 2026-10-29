'use client';
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  ImageSquare,
  PaperPlaneRight,
  X,
  FileText,
  FilePdf,
  FileZip,
  VideoCamera,
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
import { hasRealTicket } from './utils/ticketStatusUtils';
import { getCallSourceDisplay } from './utils/callSource';
import { getEmployeesList, findEmployeeByName, buildMentionRegex } from './utils/mentionUtils';

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const SAFE_ATTACHMENT_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'avif', 'heic', 'heif',
  'mp4', 'm4v', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'ogv', '3gp',
  'mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'wma',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'rtf', 'json', 'ppt', 'pptx',
]);

function isAllowedAttachment(file) {
  const name = String(file?.name || '');
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  const mimeType = String(file?.type || '').toLowerCase();
  const blockedExtension = /\.(svg|html?|xhtml|js|mjs|cjs|jsx|ts|tsx|exe|dll|msi|bat|cmd|ps1|sh|vbs|vbe|scr|com|jar|app|apk|dmg|iso|lnk|url)$/i;
  const blockedMime = /^(application\/(x-msdownload|x-executable|x-dosexec|javascript|x-javascript)|text\/(html|javascript)|image\/svg\+xml)/i;

  if (!file || blockedExtension.test(name) || blockedMime.test(mimeType)) return false;
  if (/^(image|video|audio)\//.test(mimeType)) return true;
  if (mimeType && mimeType !== 'application/octet-stream' && mimeType !== 'application/zip') {
    const safeDocumentMime = /^(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|vnd\.ms-excel|vnd\.ms-powerpoint|rtf|json)|text\/(plain|csv|rtf))/;
    if (!safeDocumentMime.test(mimeType)) return false;
  }
  return SAFE_ATTACHMENT_EXTENSIONS.has(extension);
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
  if (mimeType.startsWith('video/') || lower.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/)) {
    return <VideoCamera size={20} weight="duotone" color="#10B981" />;
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
  const { CALL_TYPE_MASTER, UpdateCall, saveCallLogTask, getTaskList, EMPLOYEE_LIST } = useCallLog();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Mention & Editor State
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const [mentionedUsers, setMentionedUsers] = useState([]);

  const editorRef = useRef(null);
  const mentionTextNodeRef = useRef(null);
  const savedRangeRef = useRef(null);
  const mentionPopupRef = useRef(null);

  const allEmployees = useMemo(() => {
    if (Array.isArray(EMPLOYEE_LIST) && EMPLOYEE_LIST.length > 0) {
      return EMPLOYEE_LIST;
    }
    return getEmployeesList();
  }, [EMPLOYEE_LIST]);

  const filteredEmployees = useMemo(() => {
    if (!isMentionOpen) return [];
    const q = mentionQuery.trim().toLowerCase();
    if (!q) {
      return allEmployees.slice(0, 8);
    }
    return allEmployees
      .filter((emp) => {
        const name = (emp.user || emp.EmployeeName || emp.name || '').toLowerCase();
        const desig = (emp.designation || emp.role || '').toLowerCase();
        return name.includes(q) || desig.includes(q);
      })
      .slice(0, 8);
  }, [isMentionOpen, mentionQuery, allEmployees]);

  // Click outside to close mention popup
  useEffect(() => {
    if (!isMentionOpen) return;
    const handleClickOutside = (e) => {
      if (
        mentionPopupRef.current &&
        !mentionPopupRef.current.contains(e.target) &&
        editorRef.current &&
        !editorRef.current.contains(e.target)
      ) {
        setIsMentionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMentionOpen]);

  // iTask State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskData, setTaskData] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Call Type State
  const [callTypeAnchor, setCallTypeAnchor] = useState(null);
  const [isUpdatingCallType, setIsUpdatingCallType] = useState(false);

  const fileInputRef = useRef(null);

  const rawRecord = useMemo(() => activeThread?.rawRecord || activeThread || {}, [activeThread]);
  const isTicketDone = useMemo(() => {
    return hasRealTicket(rawRecord);
  }, [rawRecord]);
  const hasTaskId = Boolean(
    (rawRecord?.TaskId && Number(rawRecord?.TaskId) > 0) ||
    (rawRecord?.taskId && Number(rawRecord?.taskId) > 0)
  );

  // Resolve Call Type label
  const rawCallType = rawRecord?.CallType ?? rawRecord?.callType ?? '';
  const currentCallTypeVal = rawCallType && typeof rawCallType === 'object'
    ? rawCallType.value ?? rawCallType.Id ?? rawCallType.id ?? rawCallType.label ?? rawCallType.Name ?? rawCallType.name ?? ''
    : rawCallType;
  const currentCallTypeObj = useMemo(() => {
    return CALL_TYPE_MASTER?.find(
      (o) =>
        String(o.value) === String(currentCallTypeVal) ||
        String(o.label || '').trim().toLowerCase() === String(currentCallTypeVal).trim().toLowerCase()
    ) || null;
  }, [CALL_TYPE_MASTER, currentCallTypeVal]);

  // Resolve Source label and styles
  const sourceInfo = useMemo(() => {
    const { label, type } = getCallSourceDisplay(rawRecord, activeThread);
    if (type === 'optigo') {
      return { label, bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' };
    }
    if (type === 'helpdesk') {
      return { label, bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
    }
    return { label, bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' };
  }, [rawRecord, activeThread]);

  const handleSelectFiles = useCallback((filesArray) => {
    if (!filesArray || filesArray.length === 0) return;

    const allowedFiles = filesArray.filter(isAllowedAttachment);
    if (allowedFiles.length !== filesArray.length) {
      toast.error('Some files were not added. Choose media or a supported document type.');
    }
    if (allowedFiles.length === 0) return;

    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      for (const f of allowedFiles) {
        let url = null;
        if (f.type && (f.type.startsWith('image/') || f.type.startsWith('video/'))) {
          url = URL.createObjectURL(f);
        }
        newFiles.push({ file: f, previewUrl: url, id: Date.now() + Math.random() });
      }
      return newFiles;
    });
  }, []);

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleRemoveFile = (idToRemove) => {
    setSelectedFiles((prev) => {
      const fileObj = prev.find(f => f.id === idToRemove);
      if (fileObj && fileObj.previewUrl) {
        URL.revokeObjectURL(fileObj.previewUrl);
      }
      return prev.filter(f => f.id !== idToRemove);
    });
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setSelectedFiles([]);
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
      handleSelectFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Extract pure normal string for API
  const getPlainText = useCallback(() => {
    if (!editorRef.current) return '';
    let result = '';

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList && node.classList.contains('mention-pill')) {
          const name = node.getAttribute('data-mention-name') || node.textContent.replace(/^@/, '').trim();
          result += `@${name}`;
        } else if (node.tagName === 'BR') {
          result += '\n';
        } else {
          for (const child of node.childNodes) {
            walk(child);
          }
          if (node.tagName === 'DIV' || node.tagName === 'P') {
            result += '\n';
          }
        }
      }
    };

    walk(editorRef.current);
    return result.replace(/\u00A0/g, ' ').trim();
  }, []);

  // Update isEmpty and mentionedUsers list
  const updateEditorState = useCallback(() => {
    if (!editorRef.current) return;
    const plain = getPlainText();
    setIsEmpty(!plain && selectedFiles.length === 0);

    const pills = editorRef.current.querySelectorAll('.mention-pill');
    const names = [];
    pills.forEach((p) => {
      const n = p.getAttribute('data-mention-name');
      if (n && !names.includes(n)) {
        names.push(n);
      }
    });
    setMentionedUsers(names);
  }, [getPlainText, selectedFiles.length]);

  const createMentionPillElement = useCallback((emp) => {
    const empName = emp?.user || emp?.EmployeeName || emp?.name || 'User';
    const initial = empName.charAt(0).toUpperCase();

    const pill = document.createElement('span');
    pill.className = 'mention-pill';
    pill.contentEditable = 'false';
    pill.setAttribute('data-mention-name', empName);
    pill.setAttribute('data-mention-id', emp?.userid || emp?.EmployeeId || '');
    pill.setAttribute('spellcheck', 'false');
    pill.innerHTML = `<span class="mention-pill-avatar">${initial}</span><span>@${empName}</span>`;
    return pill;
  }, []);

  const insertMention = useCallback(
    (employee) => {
      const empName = employee?.user || employee?.EmployeeName || employee?.name || '';
      if (!empName || !editorRef.current) return;

      const pill = createMentionPillElement(employee);
      const space = document.createTextNode('\u00A0');

      const sel = window.getSelection();
      let inserted = false;

      if (sel && sel.rangeCount > 0) {
        if (mentionTextNodeRef.current && mentionTextNodeRef.current.parentNode) {
          const textNode = mentionTextNodeRef.current;
          const textVal = textNode.textContent || '';
          const atIdx = textVal.lastIndexOf('@');
          if (atIdx >= 0) {
            textNode.textContent = textVal.substring(0, atIdx);
            if (textNode.nextSibling) {
              textNode.parentNode.insertBefore(pill, textNode.nextSibling);
            } else {
              textNode.parentNode.appendChild(pill);
            }
            pill.parentNode.insertBefore(space, pill.nextSibling);

            const newRange = document.createRange();
            newRange.setStartAfter(space);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            inserted = true;
          }
        }

        if (!inserted) {
          const range = savedRangeRef.current || sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(pill);
          pill.parentNode.insertBefore(space, pill.nextSibling);

          const newRange = document.createRange();
          newRange.setStartAfter(space);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          inserted = true;
        }
      }

      if (!inserted) {
        editorRef.current.appendChild(pill);
        editorRef.current.appendChild(space);
      }

      setIsMentionOpen(false);
      setMentionQuery('');
      mentionTextNodeRef.current = null;
      savedRangeRef.current = null;

      updateEditorState();
      editorRef.current.focus();
    },
    [createMentionPillElement, updateEditorState]
  );

  const removeMentionPill = useCallback(
    (nameToRemove) => {
      if (!editorRef.current) return;
      const pills = editorRef.current.querySelectorAll('.mention-pill');
      pills.forEach((p) => {
        if (p.getAttribute('data-mention-name') === nameToRemove) {
          if (
            p.nextSibling &&
            p.nextSibling.nodeType === Node.TEXT_NODE &&
            p.nextSibling.textContent.startsWith('\u00A0')
          ) {
            p.nextSibling.textContent = p.nextSibling.textContent.slice(1);
          }
          p.remove();
        }
      });
      updateEditorState();
    },
    [updateEditorState]
  );

  const handleEditorInput = useCallback(() => {
    updateEditorState();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node && node.nodeType === Node.TEXT_NODE) {
      const textBeforeCaret = node.textContent.slice(0, offset);
      const match = textBeforeCaret.match(/(?:^|\s)@([a-zA-Z0-9._\s]*)$/);
      if (match) {
        const q = match[1];
        if (!q.includes('\n') && q.length <= 30) {
          setMentionQuery(q);
          mentionTextNodeRef.current = node;
          savedRangeRef.current = range.cloneRange();
          setIsMentionOpen(true);
          setActiveMentionIndex(0);
          return;
        }
      }
    }

    setIsMentionOpen(false);
  }, [updateEditorState]);

  const handleMentionButtonClick = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }

    setMentionQuery('');
    setIsMentionOpen(true);
    setActiveMentionIndex(0);
  }, []);

  const handleSend = async () => {
    const plainText = getPlainText();
    if ((!plainText && selectedFiles.length === 0) || isUploading) return;

    try {
      setIsUploading(true);
      if (onSendMessage) {
        if (selectedFiles.length > 0) {
          const filesArray = selectedFiles.map((f) => f.file);
          await onSendMessage(plainText, filesArray);
        } else {
          await onSendMessage(plainText, null);
        }
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setIsMentionOpen(false);
      clearAllFiles();
      updateEditorState();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditorKeyDown = (e) => {
    if (isMentionOpen && filteredEmployees.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveMentionIndex((prev) => (prev + 1) % filteredEmployees.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveMentionIndex((prev) => (prev - 1 + filteredEmployees.length) % filteredEmployees.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredEmployees[activeMentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMentionOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    if (e.key === 'Backspace') {
      setTimeout(updateEditorState, 10);
    }
  };

  const handleEditorPaste = (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleSelectFiles(Array.from(e.clipboardData.files));
      return;
    }

    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const regex = buildMentionRegex(allEmployees);
      const tokens = pastedText.split(regex);
      const fragment = document.createDocumentFragment();

      tokens.forEach((token) => {
        if (!token) return;
        if (token.startsWith('@')) {
          const empName = token.slice(1).trim();
          const emp = findEmployeeByName(empName, allEmployees);
          if (emp) {
            const pill = createMentionPillElement(emp);
            fragment.appendChild(pill);
            fragment.appendChild(document.createTextNode('\u00A0'));
            return;
          }
        }
        fragment.appendChild(document.createTextNode(token));
      });

      range.insertNode(fragment);
      range.collapse(false);
    }
    updateEditorState();
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
          // toast.success('Task successfully created in iTask');
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
        const typeLabel = CALL_TYPE_MASTER.find(
          (option) => String(option?.value) === String(typeVal),
        )?.label || String(typeVal);
        callStreamService.patchPrimaryCall(activeThread?.sr, {
          CallType: typeLabel,
          CallTypeId: typeVal,
          callType: typeLabel,
          callTypeId: typeVal,
        });
        // toast.success(`Call Type updated to ${typeVal}`);
      }
    } catch (err) {
      console.error('Error updating call type:', err);
    } finally {
      setIsUpdatingCallType(false);
    }
  };

  const isSendDisabled = (isEmpty && selectedFiles.length === 0) || isUploading;

  return (
    <Box
      sx={{ p: 2, pt: 1, bgcolor: '#fff' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.avif,.heic,.heif,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.json,.ppt,.pptx"
        style={{ display: 'none' }}
      />

      {/* 1. OUTER CONTAINER: Gradient Bordered Card */}
      <Box
        sx={{
          position: 'relative',
          background: '#F1F3F5',
          border: isDragging ? '1.5px dashed #475569' : '',
          borderRadius: '14px',
          p: '7px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          transition: 'all 0.15s ease',
          boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Mention Suggestions Autocomplete Popup */}
        {isMentionOpen && (
          <Box
            ref={mentionPopupRef}
            sx={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 8,
              width: 320,
              maxWidth: 'calc(100vw - 32px)',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.14), 0 4px 10px rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
              zIndex: 1500,
              display: 'flex',
              flexDirection: 'column',
              animation: 'mentionSlideUp 0.15s ease-out',
              '@keyframes mentionSlideUp': {
                from: { opacity: 0, transform: 'translateY(6px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 1.4,
                py: 0.8,
                bgcolor: '#F8FAFC',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#475569',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
              >
                @ Mention Team Member
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 500 }}>
                ↑↓ navigate • ↵ select
              </Typography>
            </Box>

            {/* List */}
            <Box
              sx={{
                overflowY: 'auto',
                maxHeight: 220,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
              }}
            >
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => {
                  const isSelected = index === activeMentionIndex;
                  const empName = emp.user || emp.EmployeeName || emp.name || 'Unknown';
                  const initial = empName.charAt(0).toUpperCase();
                  const designation = emp.designation || emp.role || '';

                  return (
                    <Box
                      key={emp.userid ?? index}
                      onClick={() => insertMention(emp)}
                      onMouseEnter={() => setActiveMentionIndex(index)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        px: 1.4,
                        py: 0.8,
                        cursor: 'pointer',
                        bgcolor: isSelected ? '#F1F3F5' : 'transparent',
                        borderLeft: isSelected ? '3.5px solid #475569' : '3.5px solid transparent',
                        transition: 'all 0.1s ease',
                        '&:hover': {
                          bgcolor: '#F1F3F5',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 26,
                          height: 26,
                          fontSize: 11,
                          fontWeight: 800,
                          bgcolor: isSelected ? '#475569' : '#E9ECEF',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {initial}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 800 : 700,
                            color: isSelected ? '#581C87' : '#0F172A',
                            lineHeight: 1.2,
                          }}
                        >
                          {empName}
                        </Typography>
                        {designation && (
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '0.7rem',
                              color: isSelected ? '#334155' : '#64748B',
                              fontWeight: 500,
                              mt: 0.2,
                            }}
                          >
                            {designation}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ p: 2, textAlign: 'center', color: '#94A3B8' }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
                    No team members found matching "@{mentionQuery}"
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Outer Top Bar: Action Chips (Source, Call Type, Upgrade to Ticket, iTask) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 0.6,
            px: 0.6,
            pt: 0.2,
            pb: 0.2,
          }}
        >
          {/* Left Metadata Chips */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            {/* Source Chip */}
            <Tooltip title={`Call Source: ${sourceInfo.label}`} arrow>
              <Chip
                icon={<Globe size={12} weight="bold" />}
                label={sourceInfo.label}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #D8DDE3',
                  borderRadius: '999px',
                  boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",

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
                  height: 24,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #D8DDE3',
                  borderRadius: '999px',
                  boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",

                  cursor: 'pointer',
                  '& .MuiChip-icon': { color: 'inherit' },
                  '& .MuiChip-deleteIcon': { color: 'inherit', margin: '0 4px 0 -4px' },
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              />
            </Tooltip>
          </Box>

          {/* Right Action Chips (Ticket & iTask) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            {/* Upgrade to Ticket / In Ticket Action Button */}
            <Tooltip title={isTicketDone ? 'View Linked Helpdesk Ticket' : 'Upgrade this call into a Helpdesk Ticket'} arrow>
              <Chip
                icon={<Ticket size={13} weight="bold" />}
                label={isTicketDone ? 'In Ticket' : 'Upgrade to Ticket'}
                onClick={handleTicketAction}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #D8DDE3',
                  borderRadius: '999px',
                  boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",

                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '& .MuiChip-icon': { color: 'inherit' },
                  '&:hover': {
                    bgcolor: '#F1F3F5',
                    borderColor: '#BFC6CE',
                    transform: 'translateY(-0.5px)',
                  },
                }}
              />
            </Tooltip>

            {/* Move to iTask / View iTask Action Button */}
            <Tooltip title={hasTaskId ? 'View Linked Task in Tecopms' : 'Create Task in Tecopms from this Call'} arrow>
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
                label={hasTaskId ? 'View In Tecopms' : 'Create In Tecopms'}
                onClick={handleTaskAction}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #D8DDE3',
                  borderRadius: '999px',
                  boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",

                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '& .MuiChip-icon': { color: 'inherit' },
                  '&:hover': {
                    bgcolor: '#F1F3F5',
                    borderColor: '#BFC6CE',
                    transform: 'translateY(-0.5px)',
                  },
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* 2. INNER CONTAINER: Pure White Composer Card */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E5E9',
            boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.15s ease',
            '&:focus-within': {
              boxShadow: '0 0 0 2px rgba(71, 85, 105, 0.14)',
            },
          }}
        >
          {/* Selected Attachments Preview */}
          {selectedFiles.length > 0 && (
            <Box
              sx={{
                borderBottom: '1px solid #F1F5F9',
                bgcolor: '#F8FAFC',
                px: 1.5,
                py: 0.8,
                borderRadius: '12px 12px 0 0',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.6,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 750, color: '#64748B' }}>
                  {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} attached
                </Typography>
                {selectedFiles.length > 1 && (
                  <Typography
                    onClick={clearAllFiles}
                    sx={{
                      fontSize: 11,
                      fontWeight: 750,
                      color: '#EF4444',
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Clear all
                  </Typography>
                )}
              </Box>

              {/* Horizontal Scroll Strip for Multiple Files/Images */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  overflowX: 'auto',
                  py: 0.2,
                  '&::-webkit-scrollbar': { height: '5px' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
                }}
              >
                {selectedFiles.map((fileObj) => (
                  <Box
                    key={fileObj.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 0.6,
                      px: 1,
                      borderRadius: '8px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      flexShrink: 0,
                    }}
                  >
                    {fileObj.previewUrl ? (
                      <Box
                        component="img"
                        src={fileObj.previewUrl}
                        alt={fileObj.file.name}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: '1px solid #CBD5E1',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          bgcolor: '#E9ECEF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getFileIcon(fileObj.file.name, fileObj.file.type)}
                      </Box>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 650,
                          color: '#0F172A',
                          maxWidth: 120,
                        }}
                      >
                        {fileObj.file.name}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>
                        {formatFileSize(fileObj.file.size)}
                      </Typography>
                    </Box>

                    <Tooltip title="Remove file">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(fileObj.id)}
                        sx={{
                          p: 0.2,
                          ml: 0.2,
                          color: '#94A3B8',
                          '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' },
                        }}
                      >
                        <X size={13} weight="bold" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Mentioned Team Members Banner */}
          {mentionedUsers.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.6,
                py: 0.6,
                bgcolor: '#F8F9FA',
                borderBottom: '1px solid #E5E7EB',
                flexWrap: 'wrap',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <AlternateEmailRoundedIcon sx={{ fontSize: 13, color: '#475569' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}>
                  Notifying:
                </Typography>
              </Box>
              {mentionedUsers.map((mName, idx) => (
                <Chip
                  key={idx}
                  size="small"
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: '#475569 !important',
                        color: '#FFFFFF !important',
                        fontSize: '9px !important',
                        width: '16px !important',
                        height: '16px !important',
                      }}
                    >
                      {mName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={`@${mName}`}
                  onDelete={() => removeMentionPill(mName)}
                  sx={{
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: '#F1F3F5',
                    color: '#334155',
                    borderRadius: '999px',
                    border: '1px solid #D8DDE3',
                    '& .MuiChip-deleteIcon': {
                      color: '#64748B',
                      fontSize: 13,
                      '&:hover': { color: '#EF4444' },
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Rich Mention ContentEditable Input Area */}
          <Box sx={{ px: 1.8, pt: 1.2, pb: 0.6, minHeight: 46, position: 'relative' }}>
            <Box
              ref={editorRef}
              contentEditable={!isUploading}
              suppressContentEditableWarning
              spellCheck={false}
              onInput={handleEditorInput}
              onKeyDown={handleEditorKeyDown}
              onPaste={handleEditorPaste}
              data-placeholder={
                selectedFiles.length > 0
                  ? 'Add a message or press Enter to send attachments...'
                  : (placeholder || 'Reply to optigo carefully...')
              }
              data-empty={isEmpty}
              sx={{
                width: '100%',
                minHeight: 42,
                maxHeight: 160,
                overflowY: 'auto',
                outline: 'none',
                fontSize: 13.5,
                lineHeight: 1.55,
                color: '#1F2937',
                fontWeight: isBold ? 700 : 450,
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isStrike ? 'line-through' : 'none',
                wordBreak: 'break-word',
                position: 'relative',
                '&[data-empty="true"]::before': {
                  content: 'attr(data-placeholder)',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  userSelect: 'none',
                },
                '& .mention-pill': {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  bgcolor: '#F1F3F5',
                  color: '#334155',
                  border: '1px solid #D8DDE3',
                  borderRadius: '6px',
                  px: '6px',
                  py: '1px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  mx: '2px',
                  my: '1px',
                  verticalAlign: 'baseline',
                  userSelect: 'all',
                  cursor: 'default',
                  transition: 'all 0.12s ease',
                  '&:hover': {
                    bgcolor: '#DDD6FE',
                  },
                },
                '& .mention-pill-avatar': {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: '#475569',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  flexShrink: 0,
                },
              }}
            />
          </Box>

          {/* Bottom Actions Row: Formatting Tools (B, I, S, @), Attachment (Clip), and Send Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1,
              py: 0.5,
            }}
          >
            {/* Left Tools: Formatting + Attachments */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Bold */}
              <Tooltip title="Bold (⌘B)">
                <IconButton
                  size="small"
                  onClick={() => {
                    document.execCommand('bold', false, null);
                    setIsBold(!isBold);
                  }}
                  sx={{
                    boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",

                    color: isBold ? '#111827' : '#64748B', p: 0.5, borderRadius: '6px', bgcolor: isBold ? '#E9ECEF' : 'transparent', '&:hover': { bgcolor: '#F1F3F5', color: '#111827' }
                  }}
                >
                  <TextB size={15} weight="bold" />
                </IconButton>
              </Tooltip>

              {/* Italic */}
              <Tooltip title="Italic (⌘I)">
                <IconButton
                  size="small"
                  onClick={() => {
                    document.execCommand('italic', false, null);
                    setIsItalic(!isItalic);
                  }}
                  sx={{
                    boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
                    color: isItalic ? '#111827' : '#64748B', p: 0.5, borderRadius: '6px', bgcolor: isItalic ? '#E9ECEF' : 'transparent', '&:hover': { bgcolor: '#F1F3F5', color: '#111827' }
                  }}
                >
                  <TextItalic size={15} weight="bold" />
                </IconButton>
              </Tooltip>

              {/* Strikethrough */}
              <Tooltip title="Strikethrough">
                <IconButton
                  size="small"
                  onClick={() => {
                    document.execCommand('strikeThrough', false, null);
                    setIsStrike(!isStrike);
                  }}
                  sx={{
                    boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
                    color: isStrike ? '#111827' : '#64748B', p: 0.5, borderRadius: '6px', bgcolor: isStrike ? '#E9ECEF' : 'transparent', '&:hover': { bgcolor: '#F1F3F5', color: '#111827' }
                  }}
                >
                  <TextStrikethrough size={15} weight="bold" />
                </IconButton>
              </Tooltip>

              {/* Mention */}
              <Tooltip title="Mention employee (@)">
                <IconButton
                  size="small"
                  onClick={handleMentionButtonClick}
                  sx={{
                    boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
                    color: isMentionOpen ? '#111827' : '#64748B',
                    p: 0.5,
                    borderRadius: '6px',
                    bgcolor: isMentionOpen ? '#E9ECEF' : 'transparent',
                    '&:hover': { bgcolor: '#F1F3F5', color: '#111827' },
                  }}
                >
                  <AlternateEmailRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {/* Attachment Clip */}
              <Tooltip title="Attach file, image, or video">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    boxShadow: " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
                    color: selectedFiles.length > 0 ? '#111827' : '#64748B',
                    p: 0.5,
                    borderRadius: '6px',
                    bgcolor: selectedFiles.length > 0 ? '#E9ECEF' : 'transparent',
                    '&:hover': { bgcolor: '#F1F3F5', color: '#111827' },
                  }}
                >
                  <Paperclip size={16} weight="bold" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Right Send Button (Circular button matching reference Image 2) */}
            <IconButton
              size="small"
              onClick={handleSend}
              disabled={isSendDisabled}
              sx={{
                // boxShadow: !isSendDisabled ? " 0 1px 3px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.04)",
                width: 32,
                height: 32,
                bgcolor: !isSendDisabled ? '#1F2937' : '#E5E7EB',
                color: !isSendDisabled ? '#FFFFFF' : '#9CA3AF',
                borderRadius: '50%',
                p: 0,
                boxShadow: !isSendDisabled ? '0 2px 5px rgba(15, 23, 42, 0.2)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: !isSendDisabled ? '#111827' : '#E5E7EB',
                  transform: !isSendDisabled ? 'scale(1.06)' : 'none',
                  boxShadow: !isSendDisabled ? '0 4px 10px rgba(15, 23, 42, 0.24)' : 'none',
                },
                '&:active': {
                  transform: !isSendDisabled ? 'scale(0.96)' : 'none',
                },
              }}
            >
              {isUploading ? (
                <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
              ) : (
                <PaperPlaneRight size={15} weight="fill" />
              )}
            </IconButton>
          </Box>
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
