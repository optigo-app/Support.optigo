import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useNotificationManager } from "../../../context/NotificationManager";
import AestheticNotificationModal from "./Permission.Dialog";

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
      {/* Centered Aesthetic Notification Modal */}
      <AestheticNotificationModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onEnable={requestPermission}
      />

      {/* Already enabled notification */}
      <Snackbar
        open={enabledOpen}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setEnabledOpen(false)}
      >
        <Alert severity="success">Notifications are already enabled.</Alert>
      </Snackbar>
    </>
  );
};

export default NotificationUI;
