import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "70%", md: "50%" },
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const EmailTemplateModal = ({ open, setOpen, ticket }) => {
  const { TicketNo = "", Topic = "", Description = "", ClientCode = "", CommunicationWith = "", NoPrints = "", TopicType = "", price = "1200000" } = ticket;

  const emailTemplate = `Dear ${ClientCode},

I hope this message finds you well.

Please find the details of your request below:

Ticket No: ${TicketNo}
Type: ${TopicType}
Number of Prints: ${NoPrints}
Subject/Topic: ${Topic}
Description: ${Description}
Communication With: ${CommunicationWith}
Price: N / A

Let me know if you need any further assistance.

Best regards,
[Your Name]`;
  return (
    <Modal open={open} onClose={() => setOpen(false)} aria-labelledby="email-template-modal" aria-describedby="email-template-description">
      <Box sx={style}>
        <Typography id="email-template-modal" variant="h6" component="h2" gutterBottom>
          Email Template
        </Typography>

        {/* Email Content */}
        <Box
          component="pre"
          sx={{
            backgroundColor: "#f5f5f5",
            padding: 2,
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.875rem",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            maxHeight: "50vh",
            overflowY: "auto",
            border: "1px solid #e0e0e0",
            mb: 3,
          }}
        >
          {emailTemplate}
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button onClick={() => setOpen(false)} color="secondary" variant="outlined">
            Close
          </Button>
          <Button onClick={() => setOpen(false)} color="primary" variant="contained">
            Okay
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EmailTemplateModal;
