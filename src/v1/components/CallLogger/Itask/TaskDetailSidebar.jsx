import React, { useState, useCallback, useRef, useMemo } from "react";
import { Box, IconButton, Typography, Tab, Grid, Avatar, Stack, CircularProgress, Container, Button, InputAdornment } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { StyledDrawer, HeaderBox, TabsContainer, ContentBox, InfoCard, CommentCard, TaskCard, StyledChip, NavigationBox, formatDate } from "./style";
import debounce from "lodash.debounce";
import TextField from "@mui/material/TextField";
import { Search } from "lucide-react";

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

const TaskDetailSidebar = ({ taskData, allTasks, open, onClose, currentIndex, onNavigate }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  const COMMENTS_PER_PAGE = 10;

  React.useEffect(() => {
    setComments([]);
    setCommentsPage(1);
    setHasMoreComments(true);
    setLoadingComments(false);

    if (!taskData) return;

    try {
      const parsed = JSON.parse(taskData?.CommentsArray || "[]");
      const initialComments = parsed.slice(0, COMMENTS_PER_PAGE);
      setComments(initialComments);
      setHasMoreComments(parsed.length > COMMENTS_PER_PAGE);
    } catch (e) {
      console.error("Failed to parse comments", e);
    }
  }, [taskData?.taskid]);

  const loadMoreComments = useCallback(() => {
    if (!taskData?.CommentsArray || loadingComments || !hasMoreComments) return;

    setLoadingComments(true);

    setTimeout(() => {
      try {
        const allComments = JSON.parse(taskData?.CommentsArray);
        const nextPage = commentsPage + 1;
        const startIdx = 0;
        const endIdx = nextPage * COMMENTS_PER_PAGE;
        const newComments = allComments.slice(startIdx, endIdx);

        setComments(newComments);
        setCommentsPage(nextPage);
        setHasMoreComments(endIdx < allComments.length);
      } catch (e) {
        console.error("Failed to load more comments", e);
      }
      setLoadingComments(false);
    }, 500);
  }, [taskData, commentsPage, loadingComments, hasMoreComments]);

  const lastCommentRef = useInfiniteScroll(loadMoreComments);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const statusMap = {
      completed: "success",
      "in progress": "info",
      pending: "warning",
      blocked: "error",
    };
    return statusMap[status?.toLowerCase()] || "default";
  };

  const getPriorityColor = (priority) => {
    if (!priority) return "default";
    const priorityMap = {
      high: "error",
      medium: "warning",
      low: "success",
    };
    return priorityMap[priority?.toLowerCase()] || "default";
  };

  if (!taskData) return null;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allTasks.length - 1;

  return (
    <StyledDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          sx: { backgroundColor: "rgba(0,0,0,0.2)" },
        },
      }}
    >
      {/* Header */}
      <HeaderBox>
        <Box
          flex={1}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <IconButton onClick={onClose}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {taskData?.taskname}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Task ID: #{taskData?.taskid} • {currentIndex + 1} of {allTasks.length}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </HeaderBox>

      {/* Tabs */}
      <TabsContainer value={tabIndex} onChange={(e, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
        <Tab icon={<FlagOutlinedIcon fontSize="small" />} iconPosition="start" label="Details" />
        <Tab icon={<ChatBubbleOutlineIcon fontSize="small" />} iconPosition="start" label="Comments" />
      </TabsContainer>

      {/* Tab Content */}
      <ContentBox>
        {tabIndex === 0 && (
          <Stack spacing={2}>
            {/* Status Chips */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {taskData?.status && <StyledChip label={taskData?.status || "No Status"} color={getStatusColor(taskData?.status)} size="small" />}
              {taskData?.priority && <StyledChip label={taskData?.priority || "No Priority"} color={getPriorityColor(taskData?.priority)} size="small" />}
              {taskData?.workcategory && <StyledChip label={taskData?.workcategory} variant="outlined" size="small" />}
            </Box>

            {/* Dates Grid */}
            <Grid container spacing={1}>
              {taskData?.descr && (
                <Grid item xs={11.6}>
                  <InfoCard>
                    <Typography
                      variant="overline"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.7 }}>
                      {taskData?.descr}
                    </Typography>
                  </InfoCard>
                </Grid>
              )}
              <Grid item xs={5.8}>
                <InfoCard>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <CalendarTodayIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Start Date
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(taskData?.StartDate)}
                  </Typography>
                </InfoCard>
              </Grid>

              <Grid item xs={5.8}>
                <InfoCard>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <AccessTimeIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      End Date
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(taskData?.EndDate)}
                  </Typography>
                </InfoCard>
              </Grid>

              <Grid item xs={11.6}>
                <InfoCard>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <FlagOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Deadline
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(taskData?.DeadLineDate)}
                  </Typography>
                </InfoCard>
              </Grid>

              <Grid item xs={11.6}>
                <InfoCard>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <PersonOutlineIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Created By
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    User: {taskData?.createdbyid}
                  </Typography>
                </InfoCard>
              </Grid>
            </Grid>
          </Stack>
        )}

        {tabIndex === 1 && (
          <Box>
            {loadingComments && comments?.length === 0 ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : comments?.length ? (
              <>
                {comments.map((comment, idx) => {
                  const isLast = idx === comments.length - 1;
                  return (
                    <CommentCard key={idx} ref={isLast ? lastCommentRef : null} elevation={0}>
                      <Stack direction="row" spacing={2}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "primary.main",
                            fontSize: "0.7rem",
                          }}
                        >
                          {(comment?.userid || comment?.user || "#").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {comment?.userid || comment?.user || "Unknown"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Just now
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {comment.comment}
                          </Typography>
                        </Box>
                      </Stack>
                    </CommentCard>
                  );
                })}

                {loadingComments && (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {!hasMoreComments && comments.length > 0 && (
                  <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ py: 2 }}>
                    No more comments
                  </Typography>
                )}
              </>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No comments yet
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </ContentBox>

      {/* Navigation Footer */}
      <NavigationBox>
        <Button startIcon={<ArrowBackIcon />} onClick={() => onNavigate(currentIndex - 1)} disabled={!hasPrevious} variant="outlined" size="small" sx={{ textTransform: "none" }}>
          Previous
        </Button>
        <Typography variant="caption" color="text.secondary">
          {currentIndex + 1} / {allTasks.length}
        </Typography>
        <Button endIcon={<ArrowForwardIcon />} onClick={() => onNavigate(currentIndex + 1)} disabled={!hasNext} variant="outlined" size="small" sx={{ textTransform: "none" }}>
          Next
        </Button>
      </NavigationBox>
    </StyledDrawer>
  );
};

const TaskListView = ({ taskData, open, onClose }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const TASKS_PER_PAGE = 15;

  React.useEffect(() => {
    if (taskData && taskData?.length > 0) {
      setFilteredTasks(taskData);
      setDisplayedTasks(taskData?.slice(0, TASKS_PER_PAGE));
      setHasMore(taskData?.length > TASKS_PER_PAGE);
    }
  }, [taskData]);

  const handleSearch = useMemo(
    () =>
      debounce((query) => {
        if (!query.trim()) {
          setFilteredTasks(taskData);
          setDisplayedTasks(taskData.slice(0, TASKS_PER_PAGE));
          setPage(1);
          setHasMore(taskData.length > TASKS_PER_PAGE);
          return;
        }

        const lower = query.toLowerCase();
        const results = taskData.filter((t) => t.taskname?.toLowerCase().includes(lower) || t.descr?.toLowerCase().includes(lower) || t.status?.toLowerCase().includes(lower));

        setFilteredTasks(results);
        setDisplayedTasks(results.slice(0, TASKS_PER_PAGE));
        setPage(1);
        setHasMore(results.length > TASKS_PER_PAGE);
      }, 300),
    [taskData]
  );

  const onSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    handleSearch(val);
  };

  const loadMoreTasks = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIdx = 0;
      const endIdx = nextPage * TASKS_PER_PAGE;
      const newTasks = taskData?.slice(startIdx, endIdx);

      setDisplayedTasks(newTasks);
      setPage(nextPage);
      setHasMore(endIdx < taskData?.length);
      setLoading(false);
    }, 300);
  }, [taskData, page, loading, hasMore]);

  const lastTaskRef = useInfiniteScroll(loadMoreTasks);

  const handleTaskClick = (task, index) => {
    setSelectedTask(task);
    setCurrentTaskIndex(index);
    setSidebarOpen(true);
  };

  const handleNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < taskData?.length) {
      setSelectedTask(taskData[newIndex]);
      setCurrentTaskIndex(newIndex);
    }
  };

  return (
    <StyledDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          sx: { backgroundColor: "rgba(0,0,0,0.2)" },
        },
      }}
    >
      <Box sx={{ height: "100vh", backgroundColor: "#f8f9fa", overflow: "auto" }}>
        <Box
          mb={4}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "white",
            padding: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {taskData?.length} total tasks
            </Typography>
          </Box>

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
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>
        <Container maxWidth="lg">
          <Box>
            {displayedTasks.map((task, index) => {
              const isLast = index === displayedTasks.length - 1;
              const commentCount = task.CommentsArray ? JSON.parse(task.CommentsArray).length : 0;
              const firstComment = task.CommentsArray ? JSON.parse(task.CommentsArray)[0] : null;
              return (
                <TaskCard key={task.taskid} ref={isLast ? lastTaskRef : null} onClick={() => handleTaskClick(task, index)}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <AssignmentIcon fontSize="small" sx={{ color: "primary.main" }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {task.taskname}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Task ID: #{task.taskid}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Description */}
                    {task.descr && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.6,
                        }}
                      >
                        {task.descr}
                      </Typography>
                    )}

                    {/* Footer */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {task.status && <StyledChip label={task.status} size="small" />}
                        {task.priority && <StyledChip label={task.priority} color="error" size="small" />}
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <ChatBubbleOutlineIcon fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
                          <Typography variant="caption" color="text.secondary">
                            {commentCount}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Due: {formatDate(task.DeadLineDate)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  {firstComment && (
                    <Stack mt={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          bgcolor: "rgba(148, 163, 184, 0.06)",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: 1.5,
                          p: 1.2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "primary.main",
                            fontSize: "0.7rem",
                          }}
                        >
                          {(firstComment?.userid || firstComment?.user || "?").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1} sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              color: "text.primary",
                              lineHeight: 1.3,
                              mb: 0.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {firstComment?.userid || firstComment?.user || "Unknown"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.4,
                            }}
                          >
                            {firstComment?.comment}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  )}
                </TaskCard>
              );
            })}
            {loading && (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={22} />
              </Box>
            )}

            {!hasMore && displayedTasks.length > 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No more tasks to load
              </Typography>
            )}

            {/* Loading */}
            {loading && (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Container>

        {/* Task Detail Sidebar */}
        <TaskDetailSidebar taskData={selectedTask} allTasks={taskData} open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentIndex={currentTaskIndex} onNavigate={handleNavigate} />
      </Box>
    </StyledDrawer>
  );
};

export default TaskListView;
