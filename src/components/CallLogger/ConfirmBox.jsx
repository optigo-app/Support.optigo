import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
const ConfirmBox = ({ isDialogOpen, handleCancel, handleConfirmStartCall }) => {
	return (
		<>
			<Dialog open={isDialogOpen} onClose={handleCancel} aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
				<DialogTitle id="confirm-dialog-title">Confirm Start Call</DialogTitle>
				<DialogContent>
					<DialogContentText id="confirm-dialog-description">Are you sure you want to start the call recording? This action cannot be undone.</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancel} color="secondary">
						Cancel
					</Button>
					<Button onClick={handleConfirmStartCall} color="primary" autoFocus>
						Yes, Start Call
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ConfirmBox;
