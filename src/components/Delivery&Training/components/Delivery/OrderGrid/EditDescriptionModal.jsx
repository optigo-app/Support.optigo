// EditDescriptionModal.js
import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const EditDescriptionModal = ({ open, onClose, onSave, initialDescription ,showNotification }) => {
  const [description, setDescription] = useState(initialDescription);

  const handleSave = () => {
    if(!description) {
      showNotification("Please enter a description.", 'warning');
      return;
    }
    onSave(description);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={600}>
          Edit Description
        </Typography>
        <IconButton onClick={onClose} aria-label="close" size="small" color="inherit">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pb: 1 }}>
        <TextField
          autoFocus
          margin="dense"
          type="text"
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} color="error" variant="contained" size="medium" sx={{ borderRadius: 1.5 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} color="secondary" variant="contained" size="medium"  sx={{ borderRadius: 1.5 }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDescriptionModal;
