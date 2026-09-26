import { Box, Typography, Avatar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormatTime } from "../../../../libs/formatTime";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import { Collapse, IconButton } from "@mui/material";
import { MessageSquareLock } from "lucide-react";
import { getFileMetaData, canEditWithinDays } from "./../../../../libs/helper";
import AttachmentCard from "./AttachmentCard";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import EditCommentPopover from "./EditCommentPopover";
import { useState } from "react";
import PersonPinRoundedIcon from "@mui/icons-material/PersonPinRounded";
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

const CommentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#fff",
  marginBottom: theme.spacing(2),
}));

const CommentCard = ({ index, comment, handleToggleCollapse, openAttachmentId, user }) => {
  console.log("🚀 ~ CommentCard ~ comment:", comment);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDetail, setEditDetail] = useState(null);
  const isEditable = canEditWithinDays(comment?.time, 1);

  const handleEdit = (e, comment) => {
    setEditDetail(comment);
    setAnchorEl(e.currentTarget);
  };

  const handleCloseEdit = () => {
    setAnchorEl(null);
    setEditDetail(null);
  };

  if (!comment) {
    return null;
  }

  // Role\":\"Client

  // Role
  // :
  // "Client"

  return (
    <>
      {comment?.Role === "Client" && (
        <Box
        id="client_bar"
          sx={{
            width: "100%",
            padding:"5px 14px",
            bgcolor: "#cbade424",
            borderRadius: "11px 11px 0 0",
            borderTop: "1px solid #cbade459",
            borderLeft: "1px solid #cbade459",
            borderRight: "1px solid #cbade459",
            boxShadow: "0 2px 6px rgba(203, 173, 228, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: 1,
             "&:hover": {
             bgcolor: "#cbade459",
            transition: "bgcolor 0.3s ease-in-out",
          },
          }}
        >
          <Tooltip title="Commented By Client">
            <AccountCircleRoundedIcon sx={{ fontSize: 16, color: "#7B6F9A" }} />
          </Tooltip>
          <Typography
            sx={{
              color: "#7B6F9A",
              fontWeight: 500,
              userSelect: "none",
              fontSize:'12.4px'
            }}
          >
            Comment added by Client
          </Typography>
        </Box>
      )}

      <CommentBox
        key={index}
        sx={{
          ...(comment?.Role === "Client" && {
            borderLeft: "1px solid #cbade459",
            borderRight: "1px solid #cbade459",
            borderBottom: "1px solid #cbade459",
          }),
          backgroundColor: comment?.isOfficeUseOnly
            ? "#ffe0b26e" // light orange
            : comment?.Name?.toLowerCase() === user?.fullName?.toLowerCase()
              ? "#E0F7FA" // light sky
              : "#F8F9F9", // light gray
          position: "relative",
          // borderLeft: comment?.isOfficeUseOnly ? "4px solid #686868" : "none",
          padding: "12px 16px",
          marginBottom: "12px",
          borderRadius: comment?.Role === "Client" ? "0 0 16px 16px" : 4,
          boxShadow:
            comment?.Role === "Client"
              ? "0px 4px 8px rgba(199, 199, 199, 0.33)" // example for Client
              : "0px 2px 4px rgba(199, 199, 199, 0.33)", // example for others
          "&:hover #edit_button": {
            display: "flex",
            transition: "display 0.3s ease-in-out",
          },
               "&:hover #client_bar": {
              bgcolor: "#cbade459",
            transition: "bgcolor 0.3s ease-in-out",
          },
        }}
      >
        {isEditable && (
          <IconButton
            id="edit_button"
            size="small"
            sx={{
              position: "absolute",
              right: -10,
              top: -2,
              zIndex: 100,
              bgcolor: "#f8f9f9ff",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              display: editDetail ? "flex" : "none",
              transition: "display 0.3s ease-in-out",
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              justifyContent: "center",
              alignItems: "center",
               "&:hover #client_bar": {
             bgcolor: "#cbade459",
            transition: "bgcolor 0.3s ease-in-out",
          },
            }}
            onClick={(e) => handleEdit(e, comment)}
          >
            <CreateRoundedIcon />
          </IconButton>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {/* Left side: Avatar, Name, Time */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                mr: 2,
                bgcolor: comment?.isOfficeUseOnly ? "#FF8B00" : comment?.Name?.toLowerCase() === user?.fullName?.toLowerCase() ? "#4FC3F7" : "#0052CC",
                textTransform: "uppercase",
                width: 34,
                height: 34,
                fontSize: 15,
              }}
            >
              {comment?.Name && comment?.Name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#172B4D", textTransform: "capitalize" }} fontSize={14}>
                {comment?.Name}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "#6B778C", mt: 0.3 }}>
                {FormatTime(comment?.time, "datetime")}
              </Typography>
            </Box>
          </Box>
          {/* Right side: Office Use Only Icon */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {comment?.isOfficeUseOnly && (
              <Tooltip title="Office Use Only">
                <IconButton aria-label="office-use-only">
                  <MessageSquareLock sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}

          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#172B4D",
            whiteSpace: "pre-line",
            mb: 2,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            maxWidth: "100%",
          }}
          fontSize={13.5}
        >
          {comment?.attachment && <AttachmentCard comment={comment} openAttachmentId={openAttachmentId} handleToggleCollapse={handleToggleCollapse} />}
          {comment?.message}
        </Typography>
      </CommentBox>
      <EditCommentPopover EditDetail={editDetail} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseEdit} />
    </>
  );
};

export default CommentCard;
