import { Box, Button, useTheme } from "@mui/material";
import React from "react";

const ActionButton = ({ handleSubmit, isSubmitting }) => {
	const theme = useTheme();
	return (
		<Box sx={{ pt: 2, display: "flex", gap: 2 ,position: "sticky", bottom: 0 ,zIndex: 1 ,backgroundColor: "#fff !important" ,width: "100%" }}>
			<Button
				disabled={Boolean(isSubmitting)}
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
					handleSubmit({ saveAndAddNew: false });
				}}
			>
				{isSubmitting ? "Saving..." : "Save & Go to List"}
			</Button>

			<Button
				disabled={Boolean(isSubmitting)}
				fullWidth
				variant="outlined"
				sx={{
					py: 1.5,
					borderRadius: 1,
					textTransform: "none",
					fontWeight: 600,
					bgcolor: "#fff !important"
				}}
				onClick={() => {
					handleSubmit({ saveAndAddNew: true });
				}}
			>
				{isSubmitting ? "Saving..." : "Save & Add New"}
			</Button>
		</Box>
	);
};

export default ActionButton;
