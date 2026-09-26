import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Divider,
  Box,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CloseRounded } from "@mui/icons-material";
import TextareaAutosize from "@mui/material/TextareaAutosize";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    background: theme.palette.mode === "dark" ? "#1A1A1C" : "#fafafa",
    color: theme.palette.text.primary,
    borderRadius: 0,
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 24px 16px 24px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: "sticky",
  top: 0,
  background: theme.palette.mode === "dark" ? "#1A1A1C" : "#fafafa",
  zIndex: 1,
}));

const Content = styled(DialogContent)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: "24px",
  background: theme.palette.mode === "dark" ? "#1A1A1C" : "#ffffff",
}));

const Footer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: "16px 24px",
  background: theme.palette.mode === "dark" ? "#1A1A1C" : "#fafafa",
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  position: "sticky",
  bottom: 0,
}));

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: "100%",
  fontSize: 16,
  lineHeight: 1.6,
  borderRadius: 8,
  padding: "14px 16px",
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === "dark" ? "#222225" : "#fdfdfd",
  color: theme.palette.text.primary,
  resize: "none",
  transition: "border-color 0.2s ease, background 0.2s ease",
  fontFamily: "Inter, sans-serif",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
    background: theme.palette.mode === "dark" ? "#1F1F22" : "#fff",
  },
}));

export default function InstructionDialog({
  instructionModalOpen,
  handleCloseInstructionModal,
  form,
  handleChange,
}) {
  return (
    <StyledDialog fullScreen open={instructionModalOpen} onClose={handleCloseInstructionModal}>
      <Header>
        <Typography variant="h6" fontWeight={600}>
          Enter Special Instruction
        </Typography>
        <IconButton onClick={handleCloseInstructionModal} size="small">
          <CloseRounded />
        </IconButton>
      </Header>

      <Content>
        <StyledTextarea
          autoFocus
          minRows={20}
          value={form.instruction}
          onChange={(e) => handleChange("instruction", e.target.value)}
          placeholder="Type your instruction here..."
        />
      </Content>

      <Footer>
        <Button variant="outlined" onClick={handleCloseInstructionModal}>
          Cancel
        </Button>
        <Button variant="contained" disableElevation onClick={handleCloseInstructionModal}>
          Save
        </Button>
      </Footer>
    </StyledDialog>
  );
}
