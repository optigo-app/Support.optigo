import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

const AcceptCallModal = ({ isDialogOpen, handleCancel, handleConfirmStartCall, loading }) => {
	return (
		<Dialog open={isDialogOpen} onClose={loading ? undefined : handleCancel} aria-labelledby="accept-call-dialog-title" aria-describedby="accept-call-dialog-description">
			<DialogTitle id="accept-call-dialog-title">Accept Call from Queue</DialogTitle>
			<DialogContent>
				<DialogContentText id="accept-call-dialog-description">
					This call is currently in the support queue and unassigned. By accepting this call, it will be assigned to you and removed from the queue for others.
					<br />
					<br />
					Are you sure you want to accept this call?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleCancel} color="secondary" disabled={loading}>
					Cancel
				</Button>
				<Button onClick={handleConfirmStartCall} color="primary" autoFocus disabled={loading}>
					{loading ? "Accepting..." : "Accept Call"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AcceptCallModal;
