import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Stack,
  CircularProgress,
  Button,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Search } from 'lucide-react';
import debounce from 'lodash.debounce';
import {
  InfoCard,
  CommentCard,
  NavigationBox,
  formatDate,
} from './style';

const useInfiniteScroll = (callback) => {
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      });
      if (node) observer.current.observe(node);
    },
    [callback]
  );
  return lastElementRef;
};

// Formats date nicely for cards (e.g. 12/10/2026)
const formatCardDate = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-GB');
};

const formatDetailDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ─────────────────────────────────────────────────────────────
   TASK DETAIL SIDEBAR (Detail View for a Selected Task)
   ───────────────────────────────────────────────────────────── */
const TaskDetailSidebar = ({
  taskData,
  allTasks = [],
  open,
  onClose,
  currentIndex = 0,
  onNavigate,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  const COMMENTS_PER_PAGE = 10;

  useEffect(() => {
    setComments([]);
    setCommentsPage(1);
    setHasMoreComments(true);
    setLoadingComments(false);

    if (!taskData) return;

    try {
      const parsed = JSON.parse(taskData?.CommentsArray || '[]');
      const initialComments = parsed.slice(0, COMMENTS_PER_PAGE);
      setComments(initialComments);
      setHasMoreComments(parsed.length > COMMENTS_PER_PAGE);
    } catch (e) {
      console.error('Failed to parse comments', e);
    }
  }, [taskData]);

  const loadMoreComments = useCallback(() => {
    if (!taskData?.CommentsArray || loadingComments || !hasMoreComments) return;

    setLoadingComments(true);
    setTimeout(() => {
      try {
        const allComments = JSON.parse(taskData?.CommentsArray || '[]');
        const nextPage = commentsPage + 1;
        const startIdx = 0;
        const endIdx = nextPage * COMMENTS_PER_PAGE;
        const newComments = allComments.slice(startIdx, endIdx);

        setComments(newComments);
        setCommentsPage(nextPage);
        setHasMoreComments(endIdx < allComments.length);
      } catch (e) {
        console.error('Failed to load more comments', e);
      }
      setLoadingComments(false);
    }, 400);
  }, [taskData, commentsPage, loadingComments, hasMoreComments]);

  const lastCommentRef = useInfiniteScroll(loadMoreComments);

  if (!taskData) return null;

  const totalTasks = allTasks?.length || 1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalTasks - 1;

  const statusLower = (taskData?.status || '').toLowerCase();
  const priorityLower = (taskData?.priority || '').toLowerCase();
  const isSolved = statusLower === 'solved' || statusLower === 'completed';
  const isPending = statusLower === 'pending';
  const isRunning = statusLower === 'running' || statusLower === 'in progress';
  const statusBg = isSolved ? '#DCFCE7' : isPending ? '#FEF3C7' : isRunning ? '#DBEAFE' : '#F1F5F9';
  const statusColor = isSolved ? '#15803D' : isPending ? '#B45309' : isRunning ? '#1D4ED8' : '#475569';

  const isHigh = priorityLower === 'high' || priorityLower === 'urgent';
  const isLow = priorityLower === 'low';
  const priorityBg = isHigh ? '#FEE2E2' : isLow ? '#ECFDF5' : '#F1F5F9';
  const priorityColor = isHigh ? '#B91C1C' : isLow ? '#047857' : '#475569';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          margin: 2,
          height: 'calc(100% - 32px)', // Floating offset effect matching ForwardedCallDrawer
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
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', zIndex: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}
            >
              <ArrowBackIcon fontSize="small" sx={{ color: '#64748B' }} />
            </IconButton>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{
                  fontSize: '1rem',
                  fontWeight: 750,
                  color: '#0F172A',
                  lineHeight: 1.3,
                }}
              >
                {taskData?.taskname}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, mt: 0.2 }}>
                Task ID: #{taskData?.taskid} • {currentIndex + 1} of {totalTasks}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' }, ml: 1 }}
          >
            <CloseIcon fontSize="small" sx={{ color: '#64748B' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(e, val) => setTabIndex(val)}
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#64748B',
          },
          '& .Mui-selected': { color: '#0052CC !important' },
          '& .MuiTabs-indicator': { bgcolor: '#0052CC', height: 3 },
        }}
      >
        <Tab icon={<FlagOutlinedIcon fontSize="small" />} iconPosition="start" label="Details" />
        <Tab
          icon={<ChatBubbleOutlineIcon fontSize="small" />}
          iconPosition="start"
          label={`Comments (${comments?.length || 0})`}
        />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#FAFAFB' }}>
        {tabIndex === 0 && (
          <Stack spacing={2}>
            {/* Status & Priority Chips */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {taskData?.status && (
                <Chip
                  label={taskData.status}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    bgcolor: statusBg,
                    color: statusColor,
                    borderRadius: '6px',
                  }}
                />
              )}
              {taskData?.priority && (
                <Chip
                  label={taskData.priority}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    bgcolor: priorityBg,
                    color: priorityColor,
                    borderRadius: '6px',
                  }}
                />
              )}
              {taskData?.workcategory && (
                <Chip
                  label={taskData.workcategory}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 24,
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    borderRadius: '6px',
                  }}
                />
              )}
            </Box>

            {/* Description Card */}
            {taskData?.descr && (
              <InfoCard>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.8,
                  }}
                >
                  Description
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
                  {taskData.descr}
                </Typography>
              </InfoCard>
            )}

            {/* Dates Grid */}
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <InfoCard>
                  <Stack direction="row" spacing={0.8} alignItems="center" mb={0.6}>
                    <CalendarTodayIcon sx={{ fontSize: 14, color: '#64748B' }} />
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Start Date
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    {formatDate(taskData?.StartDate)}
                  </Typography>
                </InfoCard>
              </Grid>

              <Grid item xs={6}>
                <InfoCard>
                  <Stack direction="row" spacing={0.8} alignItems="center" mb={0.6}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: '#64748B' }} />
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      End Date
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    {formatDate(taskData?.EndDate)}
                  </Typography>
                </InfoCard>
              </Grid>

              <Grid item xs={12}>
                <InfoCard>
                  <Stack direction="row" spacing={0.8} alignItems="center" mb={0.6}>
                    <FlagOutlinedIcon sx={{ fontSize: 14, color: '#DC2626' }} />
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>
                      Deadline
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    {formatDate(taskData?.DeadLineDate)}
                  </Typography>
                </InfoCard>
              </Grid>

              <Grid item xs={12}>
                <InfoCard>
                  <Stack direction="row" spacing={0.8} alignItems="center" mb={0.6}>
                    <PersonOutlineIcon sx={{ fontSize: 14, color: '#64748B' }} />
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Created By
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    User: {taskData?.createdbyid || 'Unknown'}
                  </Typography>
                </InfoCard>
              </Grid>
            </Grid>
          </Stack>
        )}

        {tabIndex === 1 && (
          <Box>
            {loadingComments && comments?.length === 0 ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={22} sx={{ color: '#0052CC' }} />
              </Box>
            ) : comments?.length ? (
              <>
                {comments.map((comment, idx) => {
                  const isLast = idx === comments.length - 1;
                  const author = comment?.userid || comment?.user || 'Unknown';
                  return (
                    <CommentCard key={idx} ref={isLast ? lastCommentRef : null} elevation={0}>
                      <Stack direction="row" spacing={1.5}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: '#EEF2FF',
                            color: '#4F46E5',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                          }}
                        >
                          {author.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.4}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                              {author}
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                              {formatDetailDate(comment?.created_at || comment?.date)}
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                            {comment.comment}
                          </Typography>
                        </Box>
                      </Stack>
                    </CommentCard>
                  );
                })}

                {loadingComments && (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={20} sx={{ color: '#0052CC' }} />
                  </Box>
                )}

                {!hasMoreComments && comments.length > 0 && (
                  <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', py: 2 }}>
                    No more comments
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>
                  No comments yet
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Navigation Footer */}
      <NavigationBox>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => onNavigate && onNavigate(currentIndex - 1)}
          disabled={!hasPrevious}
          variant="outlined"
          size="small"
          sx={{
            textTransform: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '8px',
            borderColor: '#CBD5E1',
            color: '#334155',
          }}
        >
          Previous
        </Button>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
          {currentIndex + 1} / {totalTasks}
        </Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => onNavigate && onNavigate(currentIndex + 1)}
          disabled={!hasNext}
          variant="outlined"
          size="small"
          sx={{
            textTransform: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '8px',
            borderColor: '#CBD5E1',
            color: '#334155',
          }}
        >
          Next
        </Button>
      </NavigationBox>
    </Drawer>
  );
};

/* ─────────────────────────────────────────────────────────────
   TASK LIST VIEW (Main Floating Offset Drawer matching Forwarded Calls)
   ───────────────────────────────────────────────────────────── */
const TaskListView = ({ taskData = [], open, onClose }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Pending, 2: Solved
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const TASKS_PER_PAGE = 15;

  // Filter computation logic
  const applyFilters = useCallback(
    (query, tab, priority, dateF) => {
      if (!taskData || !Array.isArray(taskData)) {
        setFilteredTasks([]);
        setDisplayedTasks([]);
        return;
      }

      let result = [...taskData];

      // Tab (Status) filter
      if (tab === 1) {
        result = result.filter(
          (t) => (t.status || '').toLowerCase() === 'pending'
        );
      } else if (tab === 2) {
        result = result.filter((t) => {
          const s = (t.status || '').toLowerCase();
          return s === 'solved' || s === 'completed';
        });
      }

      // Priority filter
      if (priority !== 'All') {
        result = result.filter(
          (t) => (t.priority || '').toLowerCase() === priority.toLowerCase()
        );
      }

      // Date filter
      if (dateF !== 'All') {
        const todayStr = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        result = result.filter((t) => {
          const d = t.DeadLineDate || t.EndDate || t.StartDate;
          if (!d) return false;
          const taskDate = new Date(d);
          if (isNaN(taskDate.getTime())) return false;
          if (dateF === 'Today') return taskDate.toDateString() === todayStr;
          if (dateF === 'Yesterday') return taskDate.toDateString() === yesterdayStr;
          return true;
        });
      }

      // Search Query
      if (query && query.trim()) {
        const lower = query.toLowerCase().trim();
        result = result.filter(
          (t) =>
            (t.taskname || '').toLowerCase().includes(lower) ||
            (t.descr || '').toLowerCase().includes(lower) ||
            (t.status || '').toLowerCase().includes(lower) ||
            String(t.taskid || '').includes(lower)
        );
      }

      setFilteredTasks(result);
      setDisplayedTasks(result.slice(0, TASKS_PER_PAGE));
      setPage(1);
      setHasMore(result.length > TASKS_PER_PAGE);
    },
    [taskData]
  );

  useEffect(() => {
    applyFilters(searchQuery, tabValue, priorityFilter, dateFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskData]);

  const debouncedSearch = useMemo(
    () =>
      debounce((query, tab, priority, dateF) => {
        applyFilters(query, tab, priority, dateF);
      }, 250),
    [applyFilters]
  );

  const onSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    debouncedSearch(val, tabValue, priorityFilter, dateFilter);
  };

  const loadMoreTasks = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const endIdx = nextPage * TASKS_PER_PAGE;
      const newTasks = filteredTasks.slice(0, endIdx);

      setDisplayedTasks(newTasks);
      setPage(nextPage);
      setHasMore(endIdx < filteredTasks.length);
      setLoading(false);
    }, 250);
  }, [filteredTasks, page, loading, hasMore]);

  const lastTaskRef = useInfiniteScroll(loadMoreTasks);

  const handleTaskClick = (task, index) => {
    setSelectedTask(task);
    setCurrentTaskIndex(index);
    setSidebarOpen(true);
  };

  const handleNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < filteredTasks.length) {
      setSelectedTask(filteredTasks[newIndex]);
      setCurrentTaskIndex(newIndex);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          margin: 2,
          height: 'calc(100% - 32px)', // Floating offset effect matching ForwardedCallDrawer
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
          },
        },
      }}
    >
      {/* ── Header (Title, Count Pill, Close Button) ── */}
      <Box sx={{ p: 2, pb: 1, bgcolor: '#FFFFFF', zIndex: 2, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.25rem' }}>
              Tasks
            </Typography>
            <Chip
              label={`${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: '#F1F5F9',
                color: '#64748B',
                borderRadius: '999px',
              }}
            />
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}
          >
            <CloseIcon fontSize="small" sx={{ color: '#64748B' }} />
          </IconButton>
        </Box>

        {/* ── Status Tabs (All / Pending / Solved) matching ForwardedCallDrawer ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => {
              setTabValue(val);
              applyFilters(searchQuery, val, priorityFilter, dateFilter);
            }}
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
                color: '#64748B',
              },
              '& .Mui-selected': { color: '#0052CC !important' },
              '& .MuiTabs-indicator': { bgcolor: '#0052CC', height: 3 },
            }}
          >
            <Tab label="All" />
            <Tab label="Pending" />
            <Tab label="Solved" />
          </Tabs>
        </Box>
      </Box>

      {/* ── Filters & Search Row matching ForwardedCallDrawer ── */}
      <Box sx={{ p: 1.5, px: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        {/* Search Input */}
        <TextField
          variant="outlined"
          placeholder="Search tasks..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={15} color="#94A3B8" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery('');
                    applyFilters('', tabValue, priorityFilter, dateFilter);
                  }}
                >
                  <CloseIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 34,
              fontSize: '0.8rem',
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              '& fieldset': { border: 'none' },
              '&:hover': { bgcolor: '#F1F5F9' },
              '&.Mui-focused': { bgcolor: '#FFFFFF', boxShadow: '0 0 0 1.5px #0052CC' },
            },
          }}
        />

        {/* Priority & Date Dropdown Filters */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => {
                const val = e.target.value;
                setPriorityFilter(val);
                applyFilters(searchQuery, tabValue, val, dateFilter);
              }}
              sx={{ height: 32, fontSize: '0.75rem', borderRadius: 2 }}
            >
              <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Priority</MenuItem>
              <MenuItem value="Urgent" sx={{ fontSize: '0.75rem' }}>Urgent</MenuItem>
              <MenuItem value="High" sx={{ fontSize: '0.75rem' }}>High</MenuItem>
              <MenuItem value="Normal" sx={{ fontSize: '0.75rem' }}>Normal</MenuItem>
              <MenuItem value="Low" sx={{ fontSize: '0.75rem' }}>Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Date</InputLabel>
            <Select
              value={dateFilter}
              label="Date"
              onChange={(e) => {
                const val = e.target.value;
                setDateFilter(val);
                applyFilters(searchQuery, tabValue, priorityFilter, val);
              }}
              sx={{ height: 32, fontSize: '0.75rem', borderRadius: 2 }}
            >
              <MenuItem value="All" sx={{ fontSize: '0.75rem' }}>All Dates</MenuItem>
              <MenuItem value="Today" sx={{ fontSize: '0.75rem' }}>Today</MenuItem>
              <MenuItem value="Yesterday" sx={{ fontSize: '0.75rem' }}>Yesterday</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* ── Modern Tasks List Cards ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1.5,
          pb: 2,
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
        }}
      >
        {displayedTasks.map((task, index) => {
          const isLast = index === displayedTasks.length - 1;
          const comments = task.CommentsArray ? JSON.parse(task.CommentsArray || '[]') : [];
          const commentCount = comments.length;
          const firstComment = comments[0];

          const statusLower = (task.status || '').toLowerCase();
          const priorityLower = (task.priority || '').toLowerCase();

          // Status theme
          const isSolved = statusLower === 'solved' || statusLower === 'completed';
          const isPending = statusLower === 'pending';
          const isRunning = statusLower === 'running' || statusLower === 'in progress';
          const statusBg = isSolved ? '#DCFCE7' : isPending ? '#FEF3C7' : isRunning ? '#DBEAFE' : '#F1F5F9';
          const statusColor = isSolved ? '#15803D' : isPending ? '#B45309' : isRunning ? '#1D4ED8' : '#475569';

          // Priority theme
          const isHigh = priorityLower === 'high' || priorityLower === 'urgent';
          const isLow = priorityLower === 'low';
          const priorityBg = isHigh ? '#FEE2E2' : isLow ? '#ECFDF5' : '#F1F5F9';
          const priorityColor = isHigh ? '#B91C1C' : isLow ? '#047857' : '#475569';

          return (
            <Box
              key={task.taskid || index}
              ref={isLast ? lastTaskRef : null}
              onClick={() => handleTaskClick(task, index)}
              sx={{
                display: 'flex',
                gap: 1.5,
                p: 1.6,
                mb: 1.2,
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: '#CBD5E1',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              {/* Left Icon Badge with Priority Accent */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: isHigh ? '#FEF2F2' : '#F5F3FF',
                    color: isHigh ? '#DC2626' : '#6900C6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${isHigh ? '#FEE2E2' : '#EDE9FE'}`,
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 19 }} />
                </Box>
              </Box>

              {/* Card Body */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Header: Title and Task ID */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      lineHeight: 1.3,
                      flex: 1,
                    }}
                  >
                    {task.taskname}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      color: '#64748B',
                      fontWeight: 600,
                      bgcolor: '#F8FAFC',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    #{task.taskid}
                  </Typography>
                </Box>

                {/* Description Snippet */}
                {task.descr && (
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      color: '#64748B',
                      lineHeight: 1.45,
                      mt: 0.5,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {task.descr}
                  </Typography>
                )}

                {/* Meta row: Status chip, Priority chip, Comments count, Due date */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.8, mt: task.descr ? 0 : 0.8 }}>
                  {task.status && (
                    <Chip
                      label={task.status}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: statusBg,
                        color: statusColor,
                        borderRadius: '6px',
                      }}
                    />
                  )}
                  {task.priority && (
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: priorityBg,
                        color: priorityColor,
                        borderRadius: '6px',
                      }}
                    />
                  )}
                  {commentCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#64748B', fontSize: '0.72rem' }}>
                      <ChatBubbleOutlineIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                      <span>{commentCount}</span>
                    </Box>
                  )}
                  {(task.DeadLineDate || task.EndDate) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#64748B', fontSize: '0.72rem', ml: 'auto' }}>
                      <CalendarTodayIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                      <span>Due: {formatCardDate(task.DeadLineDate || task.EndDate)}</span>
                    </Box>
                  )}
                </Box>

                {/* First Comment Preview (if available) */}
                {firstComment && (
                  <Box
                    sx={{
                      mt: 1,
                      pt: 0.8,
                      borderTop: '1px dashed #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 18,
                        height: 18,
                        fontSize: '0.6rem',
                        bgcolor: '#6900C6',
                        fontWeight: 700,
                      }}
                    >
                      {(firstComment.userid || firstComment.user || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '0.72rem',
                        color: '#64748B',
                        flex: 1,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {firstComment.userid || firstComment.user}:
                      </span>{' '}
                      {firstComment.comment}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}

        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={22} sx={{ color: '#0052CC' }} />
          </Box>
        )}

        {!hasMore && displayedTasks.length > 0 && (
          <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', py: 2 }}>
            No more tasks to load
          </Typography>
        )}

        {displayedTasks.length === 0 && !loading && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 38, color: '#CBD5E1', mb: 1 }} />
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748B' }}>
              No tasks found
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Sub-Drawer for Task Details (Matching Floating Offset) ── */}
      <TaskDetailSidebar
        taskData={selectedTask}
        allTasks={filteredTasks}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentIndex={currentTaskIndex}
        onNavigate={handleNavigate}
      />
    </Drawer>
  );
};

export default TaskListView;
