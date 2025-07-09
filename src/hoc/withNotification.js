// src/hoc/withNotification.js
import React, { useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const withNotification = (WrappedComponent) => {
	const WithNotification = (props) => {
		const [open, setOpen] = useState(false);
		const [config, setConfig] = useState({
			message: "",
			severity: "info",
		});

		const showNotification = useCallback((message, severity = "info") => {
			setConfig({ message, severity });
			setOpen(true);
		}, []);

		const handleClose = (_, reason) => {
			if (reason === "clickaway") return;
			setOpen(false);
		};

		return (
			<>
				<WrappedComponent {...props} showNotification={showNotification} />
				<Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
					<Alert onClose={handleClose} severity={config.severity}>
						{config.message}
					</Alert>
				</Snackbar>
			</>
		);
	};

	return WithNotification;
};

export default withNotification;
