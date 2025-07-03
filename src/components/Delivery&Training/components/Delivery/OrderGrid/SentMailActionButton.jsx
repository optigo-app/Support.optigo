import React from "react";
import Chip from '@mui/material/Chip';
import EmailIcon from '@mui/icons-material/Email';
import { green } from '@mui/material/colors';

export default function SentMailActionButton({ params, showNotification = () => { }, SetOpenCompass }) {
  const [mailSent, setMailSent] = React.useState(false);

  const handleSendEmail = () => {
    if (!mailSent) {
      setMailSent(true);
      // showNotification("The invoice has been delivered to the customer via email.", "success");
      showNotification("Invoice delivery via email is not yet functional. This feature is still under development. Avoid using it for now.", "warning");
      SetOpenCompass(params?.row);
       setTimeout(() => {
        setMailSent(false);
       }, 800)
    }
  };

  return (
    <SendEmailChip
      onClick={handleSendEmail}
      label={mailSent ? "Mail Sent" : "Send Mail"}
      sent={mailSent}
    />
  );
}

const SendEmailChip = ({ onClick = () => { }, label = "Send Mail", sent = false }) => {
  return (
    <Chip
      icon={<EmailIcon sx={{ color: sent ? green[700] : "#999" }} />}
      label={label}
      size="small"
      onClick={onClick}
      disabled={sent}
      sx={{
        borderRadius: 5,
        backgroundColor: sent ? "#e0f2f1" : "#f0f0f0",
        color: sent ? "#004d40" : "#555",
        fontWeight: 500,
        cursor: sent ? "default" : "pointer",
        "&:hover": {
          backgroundColor: sent ? "#b2dfdb" : "#e0e0e0",
        },
      }}
    />
  );
};
