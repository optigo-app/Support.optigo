import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Virtuoso } from "react-virtuoso";
import { format, parseISO, isValid } from "date-fns";

// --- HELPERS ---
const parseDurationString = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  return parts.length === 3 ? +parts[0] * 3600 + +parts[1] * 60 + +parts[2] : 0;
};

const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`.trim();
};

const CallItem = ({ call, isLast }) => {
  let displayDate = call.date ? format(parseISO(call.date), "MMM dd, yyyy") : "Unknown Date";
  
  const followUps = React.useMemo(() => {
    try {
      if (call.FollowUpList) {
        const parsed = JSON.parse(call.FollowUpList);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {}
    return [];
  }, [call.FollowUpList]);

  return (
    <Box sx={{ position: 'relative', pl: 6, pr: 2, pb: followUps.length > 0 ? 2 : 5 }}>
      {/* Dashed Timeline Line */}
      {(!isLast || followUps.length > 0) && (
        <Box 
          sx={{ 
            position: 'absolute', 
            left: 21, 
            top: 28, 
            bottom: 0, 
            borderLeft: '2px dashed #cbd5e1', 
          }} 
        />
      )}
      
      {/* Blue Circle Node */}
      <Box sx={{ 
        position: 'absolute', 
        left: 15, 
        top: 6, 
        width: 14, 
        height: 14, 
        borderRadius: '50%', 
        border: '3px solid #3b82f6', 
        bgcolor: '#fff', 
        zIndex: 1 
      }} />

      <Stack spacing={0.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: '1.1rem' }}>
            {call.company || call.client || "General Inquiry"}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            {displayDate}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
            {call.time} • {formatDuration(parseDurationString(call.CallDuration))}
          </Typography>
          {call.ticket && (
             <Box sx={{ bgcolor: '#eff6ff', px: 1, borderRadius: 0.5, border: '1px solid #dbeafe' }}>
                <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700 }}>#{call.ticket}</Typography>
             </Box>
          )}
        </Stack>

        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
          Handled by: <span style={{ color: '#0f172a', fontWeight: 600 }}>{call.receivedBy}</span>
        </Typography>

        {call.description && (
          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{call.description}"
            </Typography>
          </Box>
        )}

        {/* Nested Follow-ups & Forwarded Calls */}
        {followUps.length > 0 && (
          <Box sx={{ mt: 2, ml: -2 }}>
            {followUps.map((fu, idx) => {
              const isLastFu = idx === followUps.length - 1;
              const fuDate = fu.CallStart ? format(new Date(fu.CallStart), "MMM dd, yyyy") : "";
              const fuTime = fu.CallStart ? format(new Date(fu.CallStart), "HH:mm") : "";
              const isForwarded = fu && (
                fu.IsForwardFollowup === 1 ||
                fu.IsForwardFollowup === "1" ||
                fu.IsForwardFollowup === true ||
                (fu.ForwardedEmpId && Number(fu.ForwardedEmpId) > 0) ||
                (fu.ForwardedEmp && String(fu.ForwardedEmp).trim() !== "")
              );
              const fName = fu.ForwardedEmp || fu.AssignedEmpName || fu.EmpName;
              
              return (
                <Box key={fu.Id || idx} sx={{ position: 'relative', pl: 5, pb: isLastFu ? 3 : 3 }}>
                  {/* Visual Connection to parent line */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: 7, 
                      top: 0, 
                      bottom: isLastFu && isLast ? 'auto' : 0,
                      height: isLastFu && isLast ? '14px' : '100%',
                      borderLeft: '2px dashed #cbd5e1',
                    }} 
                  />
                  
                  {/* Horizontal tip to node */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: 7, 
                      top: 14, 
                      width: 10, 
                      borderTop: '2px dashed #cbd5e1',
                    }} 
                  />

                  {/* Node */}
                  <Box sx={{ 
                    position: 'absolute', 
                    left: 17, 
                    top: 8, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    border: isForwarded ? '2px solid #8b5cf6' : '2px solid #f97316', 
                    bgcolor: '#fff', 
                    zIndex: 1 
                  }} />

                  <Stack spacing={0.2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: '0.9rem' }}>
                        {isForwarded ? `Forwarded Call #${fu.Id}` : `Follow-up #${fu.Id}`}
                      </Typography>
                      {isForwarded && (
                        <Box sx={{ bgcolor: '#f3e8ff', px: 0.8, py: 0.1, borderRadius: 0.5, border: '1px solid #e9d5ff' }}>
                          <Typography variant="caption" sx={{ color: '#6b21a8', fontWeight: 700, fontSize: '0.65rem' }}>
                            FORWARDED
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                      {fuTime} • {formatDuration(parseDurationString(fu.CallDuration))}
                      {fuDate && ` • ${fuDate}`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Handled by: <span style={{ color: '#0f172a', fontWeight: 600 }}>{fu.CreatedBy || call.receivedBy}</span>
                      {isForwarded && fName && (
                        <span> → <span style={{ color: '#6b21a8', fontWeight: 600 }}>{fName}</span></span>
                      )}
                    </Typography>
                    {isForwarded && fu.Reason && (
                      <Typography variant="caption" sx={{ color: '#6b21a8', fontStyle: 'italic' }}>
                        Reason: {fu.Reason}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

const CallDetailModal = ({ open, onClose, calls, title }) => {
  // Calculate total duration for display including follow-ups and forwarded calls
  let totalFollowUps = 0;
  let totalForwarded = 0;
  const totalSeconds = calls.reduce((acc, call) => {
    let callSecs = parseDurationString(call.CallDuration);
    try {
      if (call.FollowUpList) {
        const followUps = JSON.parse(call.FollowUpList);
        if (Array.isArray(followUps)) {
          followUps.forEach(fu => {
            const fuDur = fu.CallDuration || "00:00:00";
            if (fuDur !== "00:00:00") {
              callSecs += parseDurationString(fuDur);
              const isForwarded = fu && (
                fu.IsForwardFollowup === 1 ||
                fu.IsForwardFollowup === "1" ||
                fu.IsForwardFollowup === true ||
                (fu.ForwardedEmpId && Number(fu.ForwardedEmpId) > 0) ||
                (fu.ForwardedEmp && String(fu.ForwardedEmp).trim() !== "")
              );
              if (isForwarded) {
                totalForwarded++;
              } else {
                totalFollowUps++;
              }
            }
          });
        }
      }
    } catch (e) {}
    return acc + callSecs;
  }, 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: { 
          borderRadius: 1,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0'
        }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            User Call History
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Top Summary Section */}
        <Box sx={{ px: 3, py: 2, mb: 3, borderBottom: '1px solid #f1f5f9' }}>
           <Stack direction="row" spacing={4}>
              <Box>
                 <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>TOTAL TALK TIME</Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a' }}>{formatDuration(totalSeconds)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f0fdf4', px: 0.8, py: 0.2, borderRadius: 0.5, border: '1px solid #dcfce7' }}>
                        <ArrowUpwardIcon sx={{ fontSize: 12, color: '#16a34a', mr: 0.2 }} />
                        <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 800 }}>{calls.length}</Typography>
                    </Box>
                    {totalFollowUps > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#FFF3E0', px: 0.8, py: 0.2, borderRadius: 0.5, border: '1px solid #FFB74D' }}>
                        <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 800 }}>+{totalFollowUps} follow-ups</Typography>
                      </Box>
                    )}
                    {totalForwarded > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F3E8FF', px: 0.8, py: 0.2, borderRadius: 0.5, border: '1px solid #E9D5FF' }}>
                        <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 800 }}>+{totalForwarded} forwarded</Typography>
                      </Box>
                    )}
                 </Box>
                 <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total calls logged (incl. follow-ups & forwarded)</Typography>
              </Box>
           </Stack>
        </Box>

        {/* Timeline List */}
        <Box sx={{ px: 1 }}>
          {calls.length === 0 ? (
            <Typography textAlign="center" sx={{ py: 6, color: '#94a3b8' }}>No records found.</Typography>
          ) : (
            <Virtuoso
              data={calls}
              style={{ height: "450px" }}
              itemContent={(index, call) => (
                <CallItem 
                    key={index} 
                    call={call} 
                    isLast={index === calls.length - 1} 
                />
              )}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CallDetailModal;