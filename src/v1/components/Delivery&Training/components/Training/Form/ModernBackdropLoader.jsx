"use client";
import React from "react";
import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

const ModernBackdropLoader = ({ open = false, text = "Loading..." }) => {
  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 2000,
        backdropFilter: "blur(2px)",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
      }}
      open={open}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            p: 4,
            borderRadius: 3,
          }}
        >
          <CircularProgress
            size={20}
            thickness={4}
            sx={{
              color: "#1976d2",
              animation: "spin 1.5s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              letterSpacing: "0.5px",
              color: "#333",
            }}
          >
            {text}
          </Typography>
        </Box>
      </motion.div>
    </Backdrop>
  );
};

export default ModernBackdropLoader;
