import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Avatar, Typography, Button, Box, Chip, IconButton } from "@mui/material";
import { Phone, PhoneDisabled, Close } from "@mui/icons-material";
import { appChannel } from "../../../utils/broadcast";
import { useCallLog } from "../../../context/UseCallLog";

export default function IncomingCallModal({ open, setOpen, handleDismiss }) {
  console.log("🚀 ~ IncomingCallModal ~ open:", open);

  const handleAccept = () => {
    setOpen(null);
  };

  return (
    <Dialog
      open={open}
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1a1a1a",
          color: "white",
          borderRadius: 3,
          p: 3,
          maxWidth: "420px",
        },
      }}
      sx={{
        zIndex: 999999999999,
      }}
      onClose={handleDismiss}
    >
      <DialogContent sx={{ textAlign: "center", p: 0 }}>
        <Chip
          label="Customer support"
          size="small"
          sx={{
            mb: 2,
            bgcolor: "rgba(255,255,255,0.1)",
            color: "white",
            fontSize: "0.75rem",
          }}
        />

        {open?.topicRaisedBy === "client" && (
          <Typography variant="caption" sx={{ display: "block", mb: 2, color: "rgba(255,255,255,0.7)" }}>
            Incoming call
          </Typography>
        )}

        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              textTransform: "capitalize",
            }}
          >
            {open?.callBy?.charAt(0)}
          </Avatar>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 500,
            mb: 0.5,
            textTransform: "capitalize",
          }}
        >
          {open?.callBy}
        </Typography>

        {/* <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}>
          is calling you
        </Typography> */}

        {/* <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            sx={{
              flex: 1,
              bgcolor: "#d32f2f",
              color: "white",
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
            onClick={handleDismiss}
          >
            Dismiss
          </Button>

          <Button
            variant="contained"
            startIcon={<Phone />}
            onClick={handleAccept}
            sx={{
              flex: 1,
              bgcolor: "#2e7d32",
              color: "white",
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "#1b5e20",
              },
            }}
          >
            Accept
          </Button>
        </Box> */}

        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            pt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
              Company
            </Typography>
            <Typography variant="body2" sx={{ color: "white" }}>
              {open?.company}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
              Related
            </Typography>
            <Typography variant="body2" sx={{ color: "white" }}>
              {open?.appname || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" textAlign={"left"} sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              Description
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "white",
                lineHeight: 1.45,
                wordBreak: "break-word",
                whiteSpace: "pre-line",
                mt: 1,
                display: "-webkit-box",
                WebkitLineClamp: 4, // 👈 number of lines
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              textAlign={"justify"}
            >
              {open?.description || "-"}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
