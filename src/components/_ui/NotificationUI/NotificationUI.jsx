import React from "react";
import { Snackbar, Alert, Button } from "@mui/material";
import { useNotificationManager } from "../../../context/NotificationManager";

const NotificationUI = () => {
  const {
    promptOpen,
    enabledOpen,
    setPromptOpen,
    setEnabledOpen,
    requestPermission,
  } = useNotificationManager();

  return (
    <>
      {/* Prompt for enabling notifications */}
      <Snackbar
        open={promptOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setPromptOpen(false)}
      >
        <Alert
          severity="info"
          sx={{ display: "flex", alignItems: "center" }}
          action={
            <Button size="small" onClick={requestPermission}>
              Enable
            </Button>
          }
        >
          🔔 Enable notifications for real-time updates
        </Alert>
      </Snackbar>

      {/* Already enabled notification */}
      <Snackbar
        open={enabledOpen}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setEnabledOpen(false)}
      >
        <Alert severity="success">Notifications are already enabled.</Alert>
      </Snackbar>
    </>
  );
};

export default NotificationUI;
