import { Dialog, DialogContent, DialogActions, TextField, Button, Typography, Slide, Box, IconButton } from "@mui/material";
import { forwardRef, useState } from "react";
import { BadgePlus, X } from "lucide-react";
import { usePointToDiscuss } from "../../../../PointToBeDiscuss/context/usePointToDiscuss";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddMasterStatusDialog({ open, onClose }) {
  const [statusName, setStatusName] = useState("");
  const { CreatePointMaster } = usePointToDiscuss();

  const handleAdd = async () => {
    if (!statusName.trim()) return;
    await CreatePointMaster({ Status: statusName?.trim() });
    setStatusName("");
    onClose();
  };

  const handleCancel = () => {
    setStatusName("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 4,
          px: 3,
          py: 2,
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Header with icon + close */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <BadgePlus size={20} color="#4f46e5" />
          <Typography variant="h6" fontWeight={600}>
            New Master Status
          </Typography>
        </Box>
        <IconButton onClick={handleCancel} size="small">
          <X size={18} />
        </IconButton>
      </Box>
      <DialogContent sx={{ px: 0 }}>
        <TextField
          label="Status name"
          variant="outlined"
          placeholder="e.g. Quote Sent"
          value={statusName}
          onChange={(e) => setStatusName(e.target.value)}
          fullWidth
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "white",
              transition: "all 0.2s",
            },
          }}
        />
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 0, mt: 3 }}>
        <Button
          onClick={handleCancel}
          variant="text"
          sx={{
            textTransform: "none",
            fontWeight: 500,
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!statusName.trim()}
          sx={{
            borderRadius: 2,
            color: "#fff",
            bgcolor: "rgb(0, 110, 245)",
            "&:hover": {
              bgcolor: "rgb(1, 103, 228)",
            },
          }}
        >
          Add Status
        </Button>
      </DialogActions>
    </Dialog>
  );
}
