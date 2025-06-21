import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Rating, Typography, TextField, Checkbox, Button, Box, IconButton, FormControlLabel } from "@mui/material";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded"; // Empty star icon
import StarRoundedIcon from "@mui/icons-material/StarRounded"; // Filled star icon
import CloseIcon from "@mui/icons-material/Close";
import { useCallLog } from "../../context/UseCallLog";

const FeedbackModal = ({ setFeedBackModal, id }) => {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [contactMe, setContactMe] = useState(false);
  const [IsRating, setIsRating] = useState(false);
  const { editCall } = useCallLog();

  const handleSubmit = () => {
    if (!id) return;
    editCall(id, { rating });
    setFeedBackModal(null);
    setRating(null);
    setComment("");
    setContactMe(false);
    setIsRating(false)
  };

  return (
    <Dialog open={Boolean(id)} onClose={() => setFeedBackModal(null)} maxWidth="xs" fullWidth
    sx={{
      zIndex: 131100,
    }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "16px",
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Rate your experience
        <IconButton onClick={() => setFeedBackModal(null)} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          How’s your overall experience today?
        </Typography>

        <Box sx={{ textAlign: "center", mb: 4, mt: 4 }}>
          {/* Bigger Star in the Center */}
          <Rating
            name="feedback-rating"
            value={rating}
            onChange={(e, newValue) => {
              setRating(newValue);
              setIsRating(true);
            }}
            size="large"
            sx={{ color: "#f5a623", fontSize: "60px" }}
            icon={<StarRoundedIcon fontSize="60px" />}
            emptyIcon={<StarBorderRoundedIcon fontSize="60px" />}
          />
        </Box>

        {IsRating && rating < 4 && (
          <>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Describe your issue
            </Typography>

            <TextField fullWidth placeholder="We’d love to hear your suggestions" multiline rows={3} value={comment} onChange={(e) => setComment(e.target.value)} variant="outlined" size="small" />

            <FormControlLabel
              sx={{
                mb: -3,
              }}
              control={<Checkbox checked={contactMe} onChange={(e) => setContactMe(e.target.checked)} size="small" />}
              label={<Typography variant="body2">I would like to be contacted about my issue.</Typography>}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#f5a623",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#f1a21d",
            },
            "&:active": {
              backgroundColor: "#e18c16",
            },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
