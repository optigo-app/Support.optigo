import { Chip } from "@mui/material";
import React from "react";
import MenuList from "../Header/MenuList";
import { getColorByStatus } from "../../../libs/data";
import { useTraining } from "../../../context/TrainingProvider";
import { Modal, Box, Typography, Button, Grid, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FormatAlignLeftRoundedIcon from "@mui/icons-material/FormatAlignLeftRounded";

const StatusAction = ({ params, showNotification }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const { editTraining } = useTraining();
  const HandleStatusChange = (status) => {
    editTraining(params.row.SessionID, { status });
    if (status === "Cancelled") setOpen(true);
    showNotification("Status updated successfully!", "success");
    setAnchorEl(null);
  };

  const HandleRemarkChange = (value) => {
    editTraining(params.row.SessionID, { remarks: value });
    showNotification("Remark updated successfully!", "success");
  };

  return (
    <>
      <Chip
        label={params.value}
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          cursor: "pointer",
          pointerEvents: "auto",
          opacity: 1,
          bgcolor: getColorByStatus(params.value),
          "&.Mui-disabled": {
            opacity: 1,
            pointerEvents: "auto",
            cursor: "default",
          },
          ":hover": {
            bgcolor: getColorByStatus(params.value),
          },
        }}
      />
      <MenuList
        options={["Cancelled", "Completed", "Pending"].map((key) => ({
          label: key,
          value: key,
        }))}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        handleClose={() => setAnchorEl(null)}
        handleSelect={HandleStatusChange}
        selectedValue={params.value}
      />
      <NewCollectionModal Initialremark={params.row.Remark} status={params.value} open={open} onClose={() => setOpen(false)} onRemarkChange={HandleRemarkChange} />
    </>
  );
};

export default StatusAction;

const NewCollectionModal = ({ open, onClose, status, Initialremark, onRemarkChange }) => {
  const [remark, setRemark] = React.useState(Initialremark || "");

  const handleRemark = () => {
    const trimmedRemark = remark.trim();
    onRemarkChange(trimmedRemark);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="new-collection-modal-title"
      aria-describedby="new-collection-modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "500px",
          bgcolor: "background.paper",
          borderRadius: "8px",
          boxShadow: 24,
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            id="new-collection-modal-title"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FormatAlignLeftRoundedIcon fontSize="small" /> Remark
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={10}>
              <Typography variant="subtitle1">Status</Typography>
              <Typography variant="body2" color="textSecondary">
                <Chip
                  label={status}
                  size="small"
                  sx={{
                    cursor: "pointer",
                    pointerEvents: "auto",
                    opacity: 1,
                    bgcolor: getColorByStatus(status),
                    "&.Mui-disabled": {
                      opacity: 1,
                      pointerEvents: "auto",
                      cursor: "default",
                    },
                    ":hover": {
                      bgcolor: getColorByStatus(status),
                    },
                  }}
                />
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField label="Add Remark" placeholder="Write any additional notes or instructions here..." multiline rows={4} fullWidth value={remark} onChange={(e) => setRemark(e.target.value)} variant="outlined" />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onClose} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleRemark}
            variant="contained"
            sx={{
              bgcolor: "#e3f2fd",
              "&:hover": {
                bgcolor: "#bbdefb",
              },
            }}
          >
            Add Remark
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
