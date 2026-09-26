import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * @typedef {'suggest' | 'close' | 'delete'} ConfirmModalType
 */

/**
 * @typedef {Object} ReusableConfirmModalProps
 * @property {boolean} open - Whether the modal is open
 * @property {boolean} isLoading - Whether the modal is open
 * @property {function} onClose - Function to close the modal
 * @property {function} onConfirm - Function to confirm the action
 * @property {ConfirmModalType} type - Type of modal config to show
 * @property {Object} deleteMsg - Object containing title and message for delete modal
 */

/**
 * Reusable confirmation modal for actions like suggesting, closing, or deleting.
 * Automatically loads config based on type.
 *
 * @param {ReusableConfirmModalProps} props
 */
const ReusableConfirmModal = ({ open, onClose, onConfirm, type, deleteMsg, isLoading = false }) => {
	const modalConfigs = {
		suggest: {
			title: "Mark as Suggested Ticket",
			icon: <LightbulbIcon color="warning" />,
			message: "Are you sure you want to mark this ticket as a suggestion? It may be shown to other users as a recommended reference.",
			confirmText: "Confirm",
			cancelText: "Cancel",
			confirmColor: "primary",
			cancelColor: "inherit",
		},
		close: {
			title: "Close Ticket",
			icon: <HighlightOffIcon color="error" />,
			message: "Are you sure you want to close this ticket? Once closed, no further actions can be taken unless it is reopened by an authorized user.",
			confirmText: "Close Ticket",
			cancelText: "Cancel",
			confirmColor: "error",
			cancelColor: "inherit",
		},
		delete: {
			title: deleteMsg?.title || "Delete Training Entry",
			icon: <DeleteIcon color="error" />,
			message: deleteMsg?.message || "Are you sure you want to permanently delete this training entry? This action cannot be undone.",
			confirmText: "Delete",
			cancelText: "Cancel",
			confirmColor: "error",
			cancelColor: "inherit",
		},
	};

	const config = modalConfigs[type];

	if (!config) return null;

	const { title, icon, message, confirmText, cancelText, confirmColor, cancelColor } = config;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="confirm-modal-title">
			<DialogTitle id="confirm-modal-title" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{icon}
				{title}
			</DialogTitle>

			<DialogContent>
				<Typography variant="body2" sx={{ color: "#4B5563" }}>
					{message}
				</Typography>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} color={cancelColor}>
					{cancelText}
				</Button>
				<Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={isLoading} sx={{ position: "relative" }}>
					{isLoading ? <CircularProgress size={20} color="error" /> : confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ReusableConfirmModal;
