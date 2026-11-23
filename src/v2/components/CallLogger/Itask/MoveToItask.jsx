import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Chip,
  CircularProgress,
  Fade,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TaskDetailSidebar from "./TaskDetailSidebar";
import { useCallLog } from "../../../context/UseCallLog";
import { useAuth } from "../../../context/UseAuth";
import { formatDate } from "./style";

const SoftChip = styled(Chip)(({ theme }) => ({
  fontSize: "0.75rem",
  height: 22,
  fontWeight: 500,
  letterSpacing: 0.2,
  color: "#333",
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(8px)",
  transition: "all 0.25s ease",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  "& .MuiChip-icon": {
    color: "rgba(0,0,0,0.6)",
    ml: 0.3,
  },
  "& .MuiChip-label": {
    display: "flex",
    alignItems: "center",
  },
  "&:hover": {
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  "&:active": {
    transform: "scale(0.97)",
  },
}));

// Session-level cache (taskId -> Promise<task[]>) so repeated hovers
// never refetch and concurrent hovers share one in-flight request.
const taskDetailCache = new Map();

const fetchTaskList = (taskId, getTaskList) => {
  if (taskDetailCache.has(taskId)) return taskDetailCache.get(taskId);
  const request = getTaskList(taskId)
    .then((res) => (res?.success ? res?.data?.rd || [] : []))
    .catch(() => {
      taskDetailCache.delete(taskId);
      return [];
    });
  taskDetailCache.set(taskId, request);
  return request;
};

const HoverRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={0.8} alignItems="center">
    {icon}
    <Typography
      sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", width: 62 }}
    >
      {label}
    </Typography>
    <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#0F172A", flex: 1 }}>
      {value || "N/A"}
    </Typography>
  </Stack>
);

const TaskHoverCard = ({ task, loading }) => {
  if (loading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1.5 }}>
        <CircularProgress size={14} thickness={5} sx={{ color: "#0052CC" }} />
        <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>Loading task details…</Typography>
      </Stack>
    );
  }

  if (!task) {
    return (
      <Typography sx={{ p: 1.5, fontSize: "0.78rem", color: "#64748B" }}>
        No task details found
      </Typography>
    );
  }

  const statusLower = (task?.status || "").toLowerCase();
  const isSolved = statusLower === "solved" || statusLower === "completed";
  const isPending = statusLower === "pending";
  const isRunning = statusLower === "running" || statusLower === "in progress";
  const statusBg = isSolved ? "#DCFCE7" : isPending ? "#FEF3C7" : isRunning ? "#DBEAFE" : "#F1F5F9";
  const statusColor = isSolved ? "#15803D" : isPending ? "#B45309" : isRunning ? "#1D4ED8" : "#475569";

  const priorityLower = (task?.priority || "").toLowerCase();
  const isHigh = priorityLower === "high" || priorityLower === "urgent";
  const isLow = priorityLower === "low";
  const priorityBg = isHigh ? "#FEE2E2" : isLow ? "#ECFDF5" : "#F1F5F9";
  const priorityColor = isHigh ? "#B91C1C" : isLow ? "#047857" : "#475569";

  return (
    <Box sx={{ p: 1.5, width: 270 }}>
      <Typography
        sx={{ fontSize: "0.84rem", fontWeight: 750, color: "#0F172A", lineHeight: 1.3, mb: 0.2 }}
      >
        {task?.taskname || "Untitled Task"}
      </Typography>
      <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 500, mb: 1 }}>
        Task ID: #{task?.taskid}
      </Typography>

      <Stack direction="row" spacing={0.75} sx={{ mb: 1.2, flexWrap: "wrap" }}>
        {task?.status && (
          <Chip
            label={task.status}
            size="small"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: statusBg, color: statusColor }}
          />
        )}
        {task?.priority && (
          <Chip
            label={task.priority}
            size="small"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: priorityBg, color: priorityColor }}
          />
        )}
        {task?.workcategory && (
          <Chip
            label={task.workcategory}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600, borderColor: "#CBD5E1", color: "#475569" }}
          />
        )}
      </Stack>

      {task?.descr && (
        <Typography
          sx={{
            fontSize: "0.76rem",
            color: "#475569",
            lineHeight: 1.5,
            mb: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.descr}
        </Typography>
      )}

      <Stack spacing={0.6}>
        <HoverRow
          icon={<CalendarTodayIcon sx={{ fontSize: 13, color: "#64748B" }} />}
          label="Start"
          value={formatDate(task?.StartDate)}
        />
        <HoverRow
          icon={<AccessTimeIcon sx={{ fontSize: 13, color: "#64748B" }} />}
          label="End"
          value={formatDate(task?.EndDate)}
        />
        <HoverRow
          icon={<FlagOutlinedIcon sx={{ fontSize: 13, color: "#DC2626" }} />}
          label="Deadline"
          value={formatDate(task?.DeadLineDate)}
        />
        <HoverRow
          icon={<PersonOutlineIcon sx={{ fontSize: 13, color: "#64748B" }} />}
          label="By"
          value={`${task?.firstname || ""} ${task?.lastname || ""}`.trim()}
        />
      </Stack>
    </Box>
  );
};

const MoveToItask = ({ params }) => {
  const [loading, setLoading] = useState(false);
  const [moved, setMoved] = useState(!!params?.value);
  const [open, setOpen] = useState(false);
  const [taskList, setTaskList] = useState(undefined); // undefined = not fetched yet
  const [taskLoading, setTaskLoading] = useState(false);
  const { saveCallLogTask, getTaskList } = useCallLog();
  const { user, CompanyInfo } = useAuth();
  const isCallEnded =
    Boolean(params?.row?.callClosed) &&
    Boolean(params?.row?.callStart) &&
    Boolean(params?.row?.CallDuration);


  useEffect(() => {
    setMoved(!!params?.value);
  }, [params]);


  const handleMove = async (e) => {
    e.stopPropagation();
    if (loading || moved) return;

    setLoading(true);
    try {
      const result = await saveCallLogTask({
        taskname: params?.row?.description || "",
        descr: "",
        assigneids: user?.id,
        customername: CompanyInfo?.companycode,
        taskid: params?.row?.id,
      });

      if (result.success) {
        setMoved(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lazily when the tooltip actually opens (post enterDelay),
  // so casual mouse-overs never hit the API; results are cached per task.
  const handleTooltipOpen = async () => {
    const taskId = params?.row?.TaskId;
    if (!taskId || taskList !== undefined) return;
    setTaskLoading(true);
    const tasks = await fetchTaskList(taskId, getTaskList);
    setTaskList(tasks);
    setTaskLoading(false);
  };

  // Click still opens the task list drawer; reuses the cached hover fetch
  // so it doesn't hit the API again if the tooltip already loaded it.
  const handleView = async (e) => {
    e.stopPropagation();
    const taskId = params?.row?.TaskId;
    if (!taskId) {
      console.warn("No TaskId provided. Skipping API call.");
      return;
    }
    setOpen(true);
    if (taskList === undefined) {
      const tasks = await fetchTaskList(taskId, getTaskList);
      setTaskList(tasks);
    }
  };

  return (
    <>
      <Fade in timeout={250}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        {loading ? (
          <CircularProgress size={18} thickness={5} sx={{ mt: "1px", color: "rgba(150,150,150,0.5)" }} />
        ) : moved ? (
          <Tooltip
            title={<TaskHoverCard task={taskList?.[0]} loading={taskLoading || taskList === undefined} />}
            placement="right"
            arrow
            enterDelay={350}
            leaveDelay={120}
            onOpen={handleTooltipOpen}
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: "#FFFFFF",
                  color: "#0F172A",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
                  borderRadius: "10px",
                  p: 0,
                  maxWidth: "none",
                  "& .MuiTooltip-arrow": { color: "#FFFFFF" },
                },
              },
            }}
          >
            <SoftChip
              label="View"
              icon={<VisibilityRoundedIcon fontSize="small" />}
              onClick={handleView}
              size="small"
              sx={{
                background: "linear-gradient(90deg, #E8F5E9 0%, #F0FAF1 100%)",
                color: "#2E7D32",
                border: "1px solid #C8E6C9",
                boxShadow: "0 1px 4px rgba(46,125,50,0.12)",
                "& .MuiChip-icon": { color: "#2E7D32" },
                "&:hover": {
                  background: "linear-gradient(90deg, #E4F3E7 0%, #ECF9EE 100%)",
                },
              }}
            />
          </Tooltip>
        ) : (
          <SoftChip
            label="Create to iTask"
            icon={<ArrowOutwardRoundedIcon fontSize="small" />}
            onClick={handleMove}
            disabled={!isCallEnded}
            size="small"
            sx={{
              background: "linear-gradient(90deg, #FDF8F3 0%, #FBF9F7 100%)",
              color: "#5D4B3F",
              border: "1px solid #E8E2DC",
              boxShadow: "0 1px 4px rgba(93,75,63,0.08)",
              "& .MuiChip-icon": { color: "#5D4B3F" },
              "&:hover": {
                background: "linear-gradient(90deg, #FAF4EF 0%, #FBF8F6 100%)",
                boxShadow: "0 2px 6px rgba(93,75,63,0.12)",
              },
              cursor: isCallEnded ? "pointer" : "not-allowed",
              pointerEvents: isCallEnded ? "auto" : "none",
            }}
          />
        )}
      </div>
      </Fade>

      <TaskDetailSidebar taskData={taskList || []} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MoveToItask;
