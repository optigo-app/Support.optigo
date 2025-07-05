import { Box, Button, Menu, MenuItem, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useState } from "react";
import CommentCard from "./CommentCard";
import { useAuth } from "../../../../context/UseAuth"
import { AnimatePresence, motion } from "framer-motion";

const MotionBox = motion(Box);


const CommentList = ({ data }) => {
  const [openAttachmentId, setOpenAttachmentId] = useState(null);
  const [showAttachments, setShowAttachments] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");
  const { user } = useAuth();
  
  const handleToggleAttachments = () => {
    setShowAttachments((prev) => !prev);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const handleToggleCollapse = (attachmentId) => {
    setOpenAttachmentId((prevId) => (prevId === attachmentId ? null : attachmentId));
  };

  if (!data || data.length === 0) {
    return null;
  }

  const sortedData = [...data].sort((a, b) => {
    const timeA = new Date(a?.time);
    const timeB = new Date(b?.time);
    if (sortOrder === "newest") {
      return timeB - timeA;
    } else {
      return timeA - timeB;
    }
  });

  const filteredData = sortedData.map((comment) => {
    if (!showAttachments) {
      const { attachment, ...rest } = comment;
      return rest;
    }
    return comment;
  });

  return (
    <AnimatePresence>
      <MotionBox sx={{ mt: 2, p: 2 }} initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            right: 0,
            backgroundColor: "#fff",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBlock: 2,
          }}
        >
          <Typography variant="body2" sx={{ marginRight: 2 }}>
            Sort by:
          </Typography>
          <Button variant="contained" size="small" onClick={() => handleSortChange(sortOrder === "newest" ? "oldest" : "newest")}>
            {sortOrder === "newest" ? "Oldest First" : "Newest First"}
          </Button>
          <Button variant="contained" size="small" sx={{ ml: 2 }} onClick={handleToggleAttachments}>
            {showAttachments ? "Hide Attachments" : "Show Attachments"}
          </Button>
        </Box>

        {filteredData?.map((comment, index) => (
          <CommentCard user={user} comment={comment} handleToggleCollapse={handleToggleCollapse} index={index} openAttachmentId={openAttachmentId} key={comment.id} />
        ))}
      </MotionBox>
    </AnimatePresence>
  );
};

export default CommentList;
