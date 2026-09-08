import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Chip, CircularProgress, Fade } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import TaskDetailSidebar from "./TaskDetailSidebar";
import { useCallLog } from "../../../context/UseCallLog";
import { useAuth } from "../../../context/UseAuth";

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

const MoveToItask = ({ params }) => {
  const [loading, setLoading] = useState(false);
  const [moved, setMoved] = useState(!!params?.value);
  const [open, setOpen] = useState(false);
  const { saveCallLogTask, getTaskList } = useCallLog();
  const { user, CompanyInfo } = useAuth();
  const [taskData, setTaskData] = useState([]);
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

  const handleView = async (e) => {
    e.stopPropagation();
    const taskId = params?.row?.TaskId;
    if (!taskId) {
      console.warn("No TaskId provided. Skipping API call.");
      return;
    }
    setOpen(true);
    try {
      const result = await getTaskList(taskId);
      if (result.success) {
        setTaskData(result?.data?.rd || []);
      }
    } catch (error) {
      console.error("Error fetching task data:", error);
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

      <TaskDetailSidebar taskData={taskData} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MoveToItask;
