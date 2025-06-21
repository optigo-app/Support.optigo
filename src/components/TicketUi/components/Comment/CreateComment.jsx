import { Box, Typography, Avatar, TextField, IconButton, Chip, Checkbox, FormControlLabel, Tooltip, Button, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Send } from "lucide-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const CreateComment = ({ user, data, setOpen, Message, setMessage, OfficeUse, setOfficeUse, handleAttachmentChange, fileName, attachment, HandleCommentEdit, PreviewImage, setOpenPreview }) => {
  return (
    <Box sx={{ p: 2 }}>
      {/* To Field */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            To:
          </Typography>
          <Chip
            avatar={<Avatar sx={{ bgcolor: user?.role !== "user" ? "#0052CC" : "#FF8B00", color: "white !important" }}>{user?.name?.charAt(0).toUpperCase()}</Avatar>}
            label={user?.firstname + " " + user?.lastname}
            onDelete={() => { }}
            sx={{
              borderRadius: "4px",
              backgroundColor: "#F4F5F7",
              "& .MuiChip-label": {
                color: "#172B4D",
              },
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: "auto",
          }}
        >
          {!data?.isSuggested && data?.Status !== "Closed" && data?.createdby === "Client" && (
            <Button
              sx={{
                fontSize: "0.8rem",
                height: 32,
                textTransform: "none",
                px: 1.5,
                minWidth: "unset",
                mr: 1,
              }}
              variant="contained"
              color="info"
              onClick={() => setOpen("suggest")}
            >
              Move To Suggestion
            </Button>
          )}
          {data?.Status !== "Closed" && (
            <Button
              sx={{
                fontSize: "0.8rem",
                height: 32,
                textTransform: "none",
                px: 1.5,
                minWidth: "unset",
                mr: 1,
              }}
              variant="contained"
              color="error"
              onClick={() => setOpen("close")}
            >
              Close Ticket
            </Button>
          )}
        </Box>
      </Box>

      {/* Enhanced Accordion UI */}
      <Accordion
        key={data?.TicketId}
        disableGutters
        elevation={0}
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "2px !important",
          overflow: "hidden",
          "&:before": {
            display: "none",
          },
          "& .MuiAccordionSummary-root": {
            minHeight: "40px",
            backgroundColor: "rgba(0, 0, 0, 0.03)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            padding: "0 16px",
            "&.Mui-expanded": {
              minHeight: "48px",
            },
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            "&.Mui-expanded": {
              margin: "12px 0",
            },
          },
          "& .MuiAccordionDetails-root": {
            padding: "14px",
          },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel-content" id="panel-header">
          <Typography variant="body2" fontWeight={500}>
            Add a Comment
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <TextField
            fullWidth
            placeholder="Add a reply..."
            multiline
            rows={4}
            value={Message}
            onChange={(e) => setMessage(e.target.value)}
            name="message"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
              },
            }}
          />

          {/* Office Use Only */}
          <Box sx={{ mt: 1 }}>
            <FormControlLabel checked={OfficeUse} onChange={(e) => setOfficeUse(e.target.checked)} control={<Checkbox size="small" />} label="Office Use Only" sx={{ "& .MuiTypography-root": { fontSize: "14px" } }} />
          </Box>

          {/* Attachment Upload and Send */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 1, ml: -1 }}>
            <Tooltip title="Attach file">
              <IconButton component="label" size="small">
                <AttachFileIcon fontSize="small" />
                <input type="file" hidden
                  multiple onChange={handleAttachmentChange} />
              </IconButton>
            </Tooltip>

            {fileName && attachment && (
              <Chip
                label={fileName}
                color="default"
                size="small"
                onClick={() => setOpenPreview(true)}
                sx={{
                  fontSize: "0.8rem",
                  height: 24,
                  ml: 1,
                  maxWidth: "200px",
                  textOverflow: "ellipsis",
                }}
              />
              //     <Tooltip title={<PreviewImage src={attachment} alt="Preview" />} placement="top" arrow>
              // </Tooltip>
            )}

            <Box sx={{ ml: "auto" }}>
              <Button
                onClick={HandleCommentEdit}
                startIcon={<Send size={16} />}
                variant="contained"
                sx={{
                  fontSize: "0.8rem",
                  height: 32,
                  textTransform: "none",
                  px: 1.5,
                  background: (theme) => theme.palette.gradient.main,
                  color: "#fff",
                  "&:hover": {
                    background: (theme) => theme.custom.gradients.lightPurpleHover,
                  },
                }}
              >
                Comment
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CreateComment;
