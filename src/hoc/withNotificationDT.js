import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

const WithNotificationDT = (Component) => {
  return function WrappedComponent(props) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("info");
    const showNotification = (msg, level = "info") => {
      setMessage(msg);
      setSeverity(level);
      setOpen(true);
    };


    const handleClose = (_, reason) => {
      if (reason === "clickaway") return;
      setOpen(false);
    };

    return (
      <NotificationContext.Provider value={{ showNotification }}>
        <Component {...props} showNotification={showNotification} />
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" ,borderRadius:"55px" }}>
            {message}
          </Alert>
        </Snackbar>
      </NotificationContext.Provider>
    );
  };
};

export default WithNotificationDT;
