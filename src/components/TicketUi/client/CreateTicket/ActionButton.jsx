import { Box, Button, useTheme } from "@mui/material";
import React from "react";

const ActionButton = ({ handleSubmit }) => {
	const theme = useTheme();
	return (
		<Box sx={{ pt: 2, display: "flex", gap: 2 }}>
			<Button
				fullWidth
				variant="contained"
				sx={{
					py: 1.5,
					borderRadius: 1,
					background: theme.custom?.gradients?.lightPurpleHover,
					color: "#fff",
					fontWeight: 600,
					textTransform: "none",
					"&:hover": {
						background: theme.custom?.gradients?.lightPurpleHover,
					},
					boxShadow: `0`,
				}}
				onClick={() => {
					handleSubmit();
				}}
			>
				Save & Go to List
			</Button>

			<Button
				fullWidth
				variant="outlined"
				sx={{
					py: 1.5,
					borderRadius: 1,
					textTransform: "none",
					fontWeight: 600,
				}}
				onClick={() => {
					handleSubmit();
				}}
			>
				Save & Add New
			</Button>
		</Box>
	);
};

export default ActionButton;
