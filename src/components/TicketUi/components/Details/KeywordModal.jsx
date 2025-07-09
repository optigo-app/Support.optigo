import { Box, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const KeywordModal = ({ tagModalOpen, setTagModalOpen, tempTags, tagInput, setTagInput, tagError, setTagError, handleAddTempTag, handleRemoveTempTag, handleSaveTags, handleTagKeyDown }) => {
	return (
		<>
			<Dialog open={tagModalOpen} onClose={() => setTagModalOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Add Keywords</DialogTitle>
				<DialogContent>
					<Box display="flex" alignItems="center" gap={1} mb={2}>
						<TextField
							label="New Keywords"
							variant="outlined"
							size="small"
							value={tagInput}
							onChange={(e) => {
								setTagInput(e.target.value);
								setTagError("");
							}}
							onKeyDown={handleTagKeyDown}
							fullWidth
							helperText={tagError}
							error={Boolean(tagError)}
							InputLabelProps={{
								shrink: Boolean(tagInput),
							}}
							sx={{
								mt: 0.7,
							}}
						/>
						<IconButton onClick={handleAddTempTag} color="primary">
							<AddIcon />
						</IconButton>
					</Box>
					<Box display="flex" flexWrap="wrap" gap={1}>
						{tempTags.map((tag) => (
							<Chip key={tag} label={tag} onDelete={() => handleRemoveTempTag(tag)} />
						))}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTagModalOpen(false)}>Cancel</Button>
					<Button onClick={handleSaveTags} variant="contained">
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default KeywordModal;
