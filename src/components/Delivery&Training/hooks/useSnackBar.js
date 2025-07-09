import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

// Snackbar context
const SnackbarContext = createContext({
	showSnackbar: (msg, severity) => {},
});

// Custom hook to use the Snackbar
export const useSnackbar = () => useContext(SnackbarContext);

// Slide transition for the Snackbar
function SlideTransition(props) {
	return <Slide {...props} direction="down" />;
}

// Define custom colors for each severity
const customColors = {
	success: "#4caf50", // Green for success
	error: "#f44336", // Red for error
	info: "#2196f3", // Blue for info
	warning: "#ff9800", // Orange for warning
};

export const SnackbarProvider = ({ children }) => {
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "info", // 'success' | 'error' | 'warning' | 'info'
	});

	// Function to show Snackbar
	const showSnackbar = useCallback((message, severity = "info") => {
		setSnackbar({ open: true, message, severity });
	}, []);

	// Close Snackbar handler
	const handleClose = (_, reason) => {
		if (reason === "clickaway") return;
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	return (
		<SnackbarContext.Provider value={{ showSnackbar }}>
			{children}

			{/* Snackbar */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleClose}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				TransitionComponent={SlideTransition} // Slide transition for smooth animation
			>
				<Alert
					elevation={4} // Elevated shadow for depth
					variant="filled" // Filled variant for a solid background
					onClose={handleClose}
					severity={snackbar.severity}
					sx={{
						width: "100%",
						borderRadius: 50, // Rounded corners
						fontSize: "0.95rem", // Slightly smaller font for elegance
						boxShadow: 3, // Slight shadow to give depth
						minWidth: "300px", // Minimum width for better appearance
						backgroundColor: customColors[snackbar.severity], // Custom color based on severity
					}}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</SnackbarContext.Provider>
	);
};
