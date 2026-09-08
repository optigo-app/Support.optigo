import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CloseIcon from "@mui/icons-material/Close";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useCallLog } from "../../context/UseCallLog";
import { toggleFollowUpMode } from "../../rxjs/layoutStore";
import { useAddFollowUpModalStore, closeAddFollowUpModal } from "../../rxjs/tableUiStore";

const AddFollowUpModal = ({ showNotification = () => {} }) => {
  const { open, row } = useAddFollowUpModalStore();
  const { addFollowUpCall, editFollowUpCall, callLogMap, setCurrentCall } = useCallLog();

  const [addFuDescr, setAddFuDescr] = useState("");
  const [addFuDescrError, setAddFuDescrError] = useState(false);
  const [addFuSaving, setAddFuSaving] = useState(false);

  // Reset state when modal opens for a row
  useEffect(() => {
    if (open) {
      setAddFuDescr("");
      setAddFuDescrError(false);
      setAddFuSaving(false);
    }
  }, [open, row]);

  const handleConfirmAddFollowUp = useCallback(async () => {
    if (!addFuDescr.trim()) {
      setAddFuDescrError(true);
      return;
    }
    if (!row?.sr) return;

    setAddFuSaving(true);
    try {
      const targetSr = row.sr;

      // 1. Set current call to this row so FollowUpPanel and call state stay in sync
      if (callLogMap && callLogMap[targetSr]) {
        setCurrentCall(callLogMap[targetSr]);
      }

      // 2. Add follow-up call via API
      const result = await addFollowUpCall(targetSr);
      if (!result.success) {
        showNotification(result.error?.message || "Failed to add follow-up", "error");
        return;
      }

      // 3. Edit description for the newly added follow-up
      if (result.followUp?.followUpCallId) {
        await editFollowUpCall({
          callLogId: targetSr,
          followUpCallId: result.followUp.followUpCallId,
          descr: addFuDescr.trim(),
        });
      }

      showNotification("Follow-up call added", "success");

      // 4. Close dialog & open FollowUpPanel
      closeAddFollowUpModal();
      toggleFollowUpMode(true);
    } catch (err) {
      console.error("Error adding follow-up call:", err);
      showNotification("Error adding follow-up call", "error");
    } finally {
      setAddFuSaving(false);
    }
  }, [addFuDescr, row, callLogMap, setCurrentCall, addFollowUpCall, editFollowUpCall, showNotification]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={closeAddFollowUpModal}
      onClick={(e) => e.stopPropagation()}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(6px)",
          bgcolor: "rgba(15, 23, 42, 0.45)",
        },
      }}
      PaperProps={{
        sx: {
          width: 440,
          maxWidth: "92vw",
          borderRadius: "20px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "14px",
              bgcolor: "rgba(255, 152, 0, 0.1)",
              border: "1px solid rgba(255, 152, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF9800",
              flexShrink: 0,
            }}
          >
            <ReplayRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  lineHeight: 1.2,
                }}
              >
                Add Follow-Up Call
              </Typography>
              {row?.sr && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: "10px",
                    bgcolor: "rgba(255, 152, 0, 0.12)",
                    color: "#E65100",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                  }}
                >
                  #{row.sr}
                </Box>
              )}
            </Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#64748B",
                mt: 0.3,
                fontWeight: 500,
              }}
            >
              Create follow-up task for this call entry
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={closeAddFollowUpModal}
          disabled={addFuSaving}
          size="small"
          sx={{
            color: "#94A3B8",
            "&:hover": { bgcolor: "#F1F5F9", color: "#475569" },
            borderRadius: "10px",
            p: 0.8,
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* Body Content */}
      <DialogContent sx={{ p: 2.5, pt: "20px !important" }}>
        <Typography
          sx={{
            fontSize: "0.82rem",
            color: "#334155",
            fontWeight: 600,
            mb: 0.8,
          }}
        >
          Follow-Up Description <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
        </Typography>

        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          placeholder="e.g. Client requested callback to discuss billing issue or schedule a demo…"
          value={addFuDescr}
          onChange={(e) => {
            setAddFuDescr(e.target.value);
            if (e.target.value.trim()) setAddFuDescrError(false);
          }}
          error={addFuDescrError}
          helperText={
            addFuDescrError
              ? "Description is required before adding a follow-up call."
              : ""
          }
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              fontSize: "0.875rem",
              transition: "all 0.15s ease",
              "& fieldset": {
                borderColor: addFuDescrError ? "#EF4444" : "#E2E8F0",
              },
              "&:hover fieldset": {
                borderColor: addFuDescrError ? "#EF4444" : "#CBD5E1",
              },
              "&.Mui-focused": {
                bgcolor: "#FFFFFF",
                "& fieldset": {
                  borderColor: "#2563EB",
                  borderWidth: "2px",
                },
              },
            },
          }}
        />
      </DialogContent>

      {/* Actions Footer */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: "#F8FAFC",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.2,
        }}
      >
        <Button
          onClick={closeAddFollowUpModal}
          disabled={addFuSaving}
          size="medium"
          sx={{
            textTransform: "none",
            color: "#64748B",
            fontWeight: 600,
            fontSize: "0.85rem",
            px: 2.5,
            borderRadius: "10px",
            "&:hover": { bgcolor: "#E2E8F0", color: "#334155" },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleConfirmAddFollowUp}
          variant="contained"
          size="medium"
          disabled={addFuSaving}
          startIcon={
            addFuSaving ? null : <AddRoundedIcon sx={{ fontSize: "18px !important" }} />
          }
          sx={{
            textTransform: "none",
            background: "linear-gradient(135deg, #1A73E8 0%, #1557B0 100%)",
            boxShadow: "0 4px 12px rgba(26, 115, 232, 0.25)",
            ":hover": {
              background: "linear-gradient(135deg, #1557B0 0%, #0D47A1 100%)",
              boxShadow: "0 6px 16px rgba(26, 115, 232, 0.35)",
            },
            borderRadius: "10px",
            px: 3,
            py: 0.9,
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "#FFFFFF",
          }}
        >
          {addFuSaving ? "Adding Follow-Up…" : "Add Follow-Up"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFollowUpModal;
