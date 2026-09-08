import { Box, Typography, Avatar, AvatarGroup, TextField, IconButton, Chip, Checkbox, FormControlLabel, Tooltip, Button, Accordion, AccordionSummary, AccordionDetails, styled } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Send } from "lucide-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HexagonRoundedIcon from "@mui/icons-material/HexagonRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AttachMentGroup from "./AttachMentGroup";

const MoveToOrderButton = styled(Button)(({ theme }) => ({
  fontSize: "0.8rem",
  height: 32,
  textTransform: "none",
  paddingInline: theme.spacing(1.5),
  minWidth: "unset",
  marginRight: theme.spacing(1),
  borderRadius: 15,
  fontWeight: 500,
  letterSpacing: 0.3,
  color: theme.palette.common.white,
  background: `linear-gradient(135deg, #7F56D9 0%, #6941C6 100%)`,
  boxShadow: "0 2px 6px rgba(127, 86, 217, 0.35)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  backdropFilter: "blur(4px)",
  // text overflow
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  "& .MuiButton-label": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  "&:hover": {
    background: `linear-gradient(135deg, #6941C6 0%, #7F56D9 100%)`,
    boxShadow: "0 4px 12px rgba(127, 86, 217, 0.45)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 2px 6px rgba(127, 86, 217, 0.25)",
  },
  "& .MuiButton-startIcon": {
    marginRight: 6,
    display: "flex",
    alignItems: "center",
  },
}));

const MoveToSuggestionButton = styled(Button)(({ theme }) => ({
  fontSize: "0.8rem",
  height: 32,
  textTransform: "none",
  paddingInline: theme.spacing(1.5),
  minWidth: "unset",
  marginRight: theme.spacing(1),
  borderRadius: 15,
  fontWeight: 500,
  letterSpacing: 0.3,
  color: theme.palette.common.white,
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 2px 6px ${theme.palette.primary.main}33`, // 33 = ~20% opacity
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  backdropFilter: "blur(4px)",

  // text overflow
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  "& .MuiButton-label": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },


  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
    boxShadow: `0 4px 12px ${theme.palette.primary.main}55`,
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "translateY(0)",
    boxShadow: `0 2px 6px ${theme.palette.primary.main}22`,
  },

  "& .MuiButton-startIcon": {
    marginRight: 6,
    display: "flex",
    alignItems: "center",
  },
}));

const CommentButton = styled(Button)(({ theme }) => ({
  fontSize: "0.8rem",
  height: 32,
  textTransform: "none",
  paddingInline: theme.spacing(1.5),
  minWidth: "unset",
  borderRadius: 15,
  fontWeight: 500,
  letterSpacing: 0.3,
  color: theme.palette.common.white,
  // text overflow
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  "& .MuiButton-label": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  // 🔥 Premium Gradient from your theme
  background: `linear-gradient(135deg, #ec14d0ff 0%, #532ebe 100%)`,
  boxShadow: "0 2px 6px rgba(83, 46, 190, 0.35)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  backdropFilter: "blur(4px)",

  "&:hover": {
    background: `linear-gradient(135deg, #532ebe 0%, #b2069b 100%)`,
    boxShadow: "0 4px 12px rgba(83, 46, 190, 0.45)",
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 2px 6px rgba(83, 46, 190, 0.25)",
  },

  "& .MuiButton-startIcon": {
    marginRight: 6,
    display: "flex",
    alignItems: "center",
  },
}));





const ClosedButton = styled(Button)(({ theme }) => ({
  fontSize: "0.8rem",
  height: 32,
  textTransform: "none",
  paddingInline: theme.spacing(1.5),
  minWidth: "unset",
  marginRight: theme.spacing(1),
  borderRadius: 15,
  fontWeight: 500,
  letterSpacing: 0.3,
  color: theme.palette.common.white,
  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
  boxShadow: "0 2px 6px rgba(255, 77, 79, 0.35)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  backdropFilter: "blur(4px)",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
    boxShadow: "0 4px 10px rgba(255, 77, 79, 0.45)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 2px 6px rgba(255, 77, 79, 0.25)",
  },
  "& .MuiButton-startIcon": {
    marginRight: 6,
    display: "flex",
    alignItems: "center",
  },
  // text overflow
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  "& .MuiButton-label": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));


const CreateComment = ({ user, data, setOpen, Message, setMessage, OfficeUse, setOfficeUse, handleAttachmentChange, fileName, attachment, HandleCommentEdit, attachmentsList, setOpenPreview, HandleMoveToOrder, isSubmittingOrder }) => {
  const isSuggested = Boolean(data?.isSuggested);
  const status = String(data?.Status || "")
    ?.trim()
    ?.toLowerCase();
  const isClient = String(data?.IsClient) === "1";
  const isAlredayMovedToOrder = !data?.OrderId && !data?.Order_CreatedDate;

  return (
    <Box sx={{ p: 2 }}>
      {/* To Field & Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Typography variant="body2" sx={{ mr: 1, fontWeight: 500, color: "#5E6C84" }}>
            To:
          </Typography>
          <Chip
            avatar={
              <Avatar
                sx={{
                  bgcolor: user?.role !== "user" ? "#0052CC" : "#FF8B00",
                  color: "white !important",
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            }
            label={user?.firstname + " " + user?.lastname}
            onDelete={() => { }}
            sx={{
              borderRadius: "4px",
              backgroundColor: "#F4F5F7",
              "& .MuiChip-label": {
                color: "#172B4D",
                fontWeight: 500,
              },
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            ml: "auto",
          }}
        >
          {!isSuggested && status !== "closed" && isClient && (
            <MoveToSuggestionButton variant="contained" color="info" onClick={() => setOpen("suggest")} startIcon={<TipsAndUpdatesRoundedIcon fontSize="small" />} sx={{ mr: 0 }}>
              Move To Suggestion
            </MoveToSuggestionButton>
          )}
          {status !== "closed" && (
            <ClosedButton variant="contained" color="error" onClick={() => setOpen("close")} startIcon={<CancelRoundedIcon fontSize="small" />} sx={{ mr: 0 }}>
              Close Ticket
            </ClosedButton>
          )}
          {isAlredayMovedToOrder && (
            <MoveToOrderButton
              variant="contained"
              startIcon={<HexagonRoundedIcon fontSize="small" />}
              onClick={HandleMoveToOrder}
              disabled={isSubmittingOrder}
              sx={{ mr: 0 }}
            >
              {isSubmittingOrder ? "Submitting..." : "Move To Order Request"}
            </MoveToOrderButton>
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
          borderRadius: "18px !important",
          overflow: "hidden",
          "&:before": {
            display: "none",
          },
          "& .MuiAccordionSummary-root": {
            minHeight: "40px",
            backgroundColor: "rgba(0, 0, 0, 0.03)",
            padding: "0 16px",
            "&.Mui-expanded": {
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
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
            minRows={4}
            value={Message}
            onChange={(e) => setMessage(e.target.value)}
            name="message"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
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
                <input type="file" hidden multiple onChange={handleAttachmentChange} />
              </IconButton>
            </Tooltip>

            <AttachMentGroup attachmentsList={attachmentsList} setOpenPreview={setOpenPreview} />

            {/* <Box sx={{ ml: "auto" }}>
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
            </Box> */}
            <Box sx={{ ml: "auto" }}>
              <CommentButton
                startIcon={<Send size={16} />}
                onClick={HandleCommentEdit}
              >
                Comment
              </CommentButton>
            </Box>

          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CreateComment;
