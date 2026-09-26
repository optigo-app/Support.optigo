import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, IconButton, InputBase, ButtonBase, Popover, Divider, CircularProgress } from "@mui/material";
import { InsertDriveFileOutlined as FileIcon, AttachFile as AttachIcon, Close as CloseIcon } from "@mui/icons-material";
import { getFileMetaData, getFileNameWithoutExtension } from "../../../../libs/helper";
import { useTicket } from "../../../../context/useTicket";
import { useAuth } from "../../../../context/UseAuth"; // Import useAuth for upload credentials
import { filesUploadApi } from "../../../../apis/UploadFille";

const EditCommentPopover = ({ open, anchorEl, onClose, EditDetail }) => {
  const [Message, setMessage] = useState("");
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const { selectedTicket, EditComment, handleRefresh, showNotify } = useTicket();
  const { CompanyInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && EditDetail) {
      setMessage(EditDetail?.message || "");
      const currentFiles = EditDetail?.attachment && EditDetail?.attachment !== "" ? EditDetail.attachment.split(",") : [];
      setExistingAttachments(currentFiles);
      setNewAttachments([]);
    }
  }, [EditDetail, open]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const maxSizeInBytes = 15 * 1024 * 1024; // 15 MB
    const validFiles = [];

    files.forEach((file) => {
      if (file.size <= maxSizeInBytes) {
        const fileNameParts = file.name.split(".");
        const extension = fileNameParts.pop().toLowerCase();

        validFiles.push({
          file,
          name: fileNameParts.join("."),
          fileName: file.name,
          extension,
          size: file.size,
          type: file.type,
          id: Math.random().toString(),
          previewUrl: URL.createObjectURL(file),
        });
      } else {
        alert(`File ${file.name} is too large (Max 15MB)`);
      }
    });

    setNewAttachments((prev) => [...prev, ...validFiles]);
    event.target.value = null; // Reset input
  };

  // --- 2. REMOVE HANDLERS ---
  const removeExistingFile = (indexToRemove) => {
    setExistingAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeNewFile = (idToRemove) => {
    setNewAttachments((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const HandleEditComment = async () => {
    setLoading(true);
    try {
      let finalAttachmentList = [...existingAttachments];

      if (newAttachments.length > 0) {
        const uploadRes = await filesUploadApi({
          ukey: CompanyInfo?.ukey,
          folderName: "Ticket",
          uniqueNo: selectedTicket?.TicketNo,
          attachments: newAttachments.map((item) => item.file),
        });

        if (uploadRes?.files) {
          const newUrls = uploadRes.files.map((f) => f.url);
          finalAttachmentList = [...finalAttachmentList, ...newUrls] || "";
        }
      }

      const res = await EditComment(Message, EditDetail?.id, finalAttachmentList?.map((file) => file)?.join(","), EditDetail?.isOfficeUseOnly, selectedTicket?.TicketNo);

      if (res === "Comment update successfully") {
        handleRefresh();
        onClose();
        showNotify("Comment update successfully", "success");
      } else if (res === "You Are Not Allow Edit Comment") {
        showNotify("You Are Not Allow Edit Comment", "error");
        onClose();
      } else if (res === "Comment can only be edited within 24 hours") {
        showNotify("Comment can only be edited within 24 hours", "error");
        onClose();
      }
    } catch (error) {
      showNotify(error?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "flip",
              enabled: true,
              options: {
                fallbackPlacements: ["left", "bottom", "top"],
                padding: 12,
              },
            },
            {
              name: "preventOverflow",
              enabled: true,
              options: {
                boundary: "viewport",
                padding: 12,
              },
            },
            {
              name: "offset",
              options: {
                offset: [0, 10],
              },
            },
          ],
        },
        paper: {
          sx: {
            mr: 2,
            width: 650,
            borderRadius: 6,
            border: "1px solid #E5E7EB",
            boxShadow: "0px 12px 24px -6px rgba(0,0,0,0.15)",
            maxWidth: "calc(100vw - 24px)",
          },
        },
      }}
    >
      {/* Hidden Input for Files */}
      <input type="file" multiple ref={fileInputRef} style={{ display: "none" }} onChange={handleFileSelect} />

      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          color: "#9CA3AF",
          bgcolor: "#F9FAFB",
          border: "1px solid #F3F4F6",
          "&:hover": { bgcolor: "#F3F4F6", color: "#EF4444" },
          position: "absolute",
          right: 10,
          top: 10,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* HEADER */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>Edit Comment</Typography>
      </Box>
      <Divider sx={{ opacity: 0.5 }} />

      {/* BODY */}
      <Box sx={{ p: 2.5 }}>
        <InputBase
          fullWidth
          placeholder="Write a comment..."
          multiline
          value={Message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={3}
          maxRows={8}
          autoFocus
          sx={{
            fontSize: "15px",
            color: "#374151",
            fontWeight: 400,
            lineHeight: 1.6,
            mb: 2,
          }}
        />

        {/* ATTACHMENT LIST CONTAINER */}
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "flex-start", flexWrap: "wrap" }}>
          {existingAttachments.map((link, i) => {
            const meta = getFileMetaData(link, "small");
            return <AttachmentChip key={`old-${i}`} icon={meta.icon} fileName={getFileNameWithoutExtension(link)} extension={meta.extension} onDelete={() => removeExistingFile(i)} />;
          })}
          {newAttachments.map((item) => {
            return (
              <AttachmentChip
                key={item.id}
                icon={<FileIcon sx={{ width: 20, height: 20 }} />} // Or dynamic icon
                fileName={item.name}
                extension={item.extension}
                onDelete={() => removeNewFile(item.id)}
                isNew={true}
              />
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2.5, pb: 2.5, pt: 0.5 }}>
        <IconButton onClick={() => fileInputRef.current.click()} sx={{ color: "#6B7280", "&:hover": { color: "#8B3DFF", bgcolor: "#F3E8FF" } }}>
          <AttachIcon />
        </IconButton>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <ButtonBase
            onClick={onClose}
            disabled={loading}
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#6B7280",
              py: 1,
              px: 4,
              borderRadius: 5,
              "&:hover": { bgcolor: "#F9FAFB", color: "#374151" },
            }}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            onClick={HandleEditComment}
            disabled={loading}
            sx={{
              fontSize: "13px",
              bgcolor: "#8B3DFF",
              color: "white",
              py: 1,
              px: 4,
              borderRadius: 5,
              boxShadow: "0 2px 4px rgba(139, 61, 255, 0.3)",
              opacity: loading ? 0.7 : 1,
              "&:hover": { bgcolor: "#7C3AED" },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </ButtonBase>
        </Box>
      </Box>
    </Popover>
  );
};

// Sub-component to render the file chip (Cleaner code)
const AttachmentChip = ({ icon, fileName, extension, onDelete, isNew }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 0.5,
      py: 0.4,
      bgcolor: isNew ? "#F0FDFA" : "#F9FAFB", // Slight green tint for new files
      borderRadius: 10,
      border: "1px solid #E5E7EB",
      transition: "all 0.2s ease",
      maxWidth: 200,
    }}
  >
    <Box
      sx={{
        width: 30,
        height: 30,
        minWidth: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        bgcolor: "#F3E8FF",
        color: "#8B3DFF",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: "#1F2937",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {fileName}
      </Typography>
      <Typography sx={{ fontSize: 8, color: "#6B7280", textTransform: "uppercase" }}>
        {extension || "FILE"} {isNew && "(New)"}
      </Typography>
    </Box>
    <IconButton
      size="small"
      onClick={onDelete}
      sx={{
        color: "#9CA3AF",
        "&:hover": { color: "#EF4444", bgcolor: "#FEE2E2" },
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
);

export default EditCommentPopover;

// import React, { useEffect, useState } from "react";
// import { Box, Typography, IconButton, InputBase, ButtonBase, Popover, Divider, Fade, Chip } from "@mui/material";
// import { InsertDriveFileOutlined as FileIcon, SentimentSatisfiedAlt as EmojiIcon, AttachFile as AttachIcon, ArrowUpward as ArrowUpIcon, Close as CloseIcon, MoreHoriz as MoreIcon } from "@mui/icons-material";
// import { getFileMetaData, getFileNameWithoutExtension } from "../../../../libs/helper";
// import { useTicket } from "../../../../context/useTicket";
// import { filesUploadApi } from "../../../../apis/UploadFille";

// const EditCommentPopover = ({ open, anchorEl, onClose, EditDetail }) => {
//     const [Message, setMessage] = useState(EditDetail?.message);
//     const [attachment, setAttachment] = useState(EditDetail?.attachment?.split(","));
//     const { selectedTicket, EditComment, handleRefresh } = useTicket();
//     const [loading, setLoading] = useState(false)

//     const HandleEditComment = async () => {
//         setLoading(true)
//         try {
//             const res = await EditComment(
//                 Message,
//                 EditDetail?.id,
//                 attachment,
//                 EditDetail?.isOfficeUseOnly,
//                 selectedTicket?.TicketNo
//             )
//             if(res === "Comment update successfully"){
//                 console.log("🚀 ~ HandleEditComment ~ res:", res)
//                 handleRefresh();
//                 onClose()
//             }else if(res){

//             }
//         } catch (error) {
//             console.log("🚀 ~ HandleEditComment ~ error:", error)
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => {
//         setMessage(EditDetail?.message);
//         setAttachment(EditDetail?.attachment?.split(","));
//     }, [EditDetail]);

//     return (
//         <Popover
//             open={open}
//             anchorEl={anchorEl}
//             onClose={onClose}
//             disablePortal // ✅ REQUIRED
//             anchorOrigin={{
//                 vertical: "center",
//                 horizontal: "left",
//             }}
//             transformOrigin={{
//                 vertical: "center",
//                 horizontal: "right",
//             }}
//             slotProps={{
//                 paper: {
//                     sx: {
//                         mr: 2,
//                         width: 650,
//                         borderRadius: 6,
//                         border: "1px solid #E5E7EB",
//                         boxShadow: "0px 12px 24px -6px rgba(0,0,0,0.15), 0px 4px 8px -4px rgba(0,0,0,0.1)",
//                     },
//                 },
//             }}
//         >
//             <IconButton
//                 size="small"
//                 onClick={onClose}
//                 sx={{
//                     color: "#9CA3AF",
//                     bgcolor: "#F9FAFB",
//                     border: "1px solid #F3F4F6",
//                     "&:hover": { bgcolor: "#F3F4F6", color: "#EF4444" },
//                     position: "absolute",
//                     right: 10,
//                     top: 10,
//                 }}
//             >
//                 <CloseIcon fontSize="small" />
//             </IconButton>
//             {/* --- 1. HEADER --- */}
//             <Box
//                 sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     px: 2.5,
//                     pt: 2,
//                     pb: 1,
//                 }}
//             >
//                 <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>Edit Comment</Typography>
//             </Box>

//             <Divider sx={{ opacity: 0.5 }} />

//             {/* --- 2. EDITOR BODY --- */}
//             <Box sx={{ p: 2.5 }}>
//                 <InputBase
//                     fullWidth
//                     placeholder="Write a comment..."
//                     multiline
//                     value={Message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     minRows={3}
//                     maxRows={8}
//                     autoFocus
//                     defaultValue="Attached the latest spec file for context."
//                     sx={{
//                         fontSize: "15px",
//                         color: "#374151",
//                         fontWeight: 400,
//                         lineHeight: 1.6,
//                         mb: 2,
//                         "& .MuiInputBase-input": {
//                             padding: 0,
//                         },
//                     }}
//                 />

//                 {/* --- 3. FILE ATTACHMENT CARD --- */}
//                 <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: 'flex-start' }}>
//                     {attachment?.length > 0 &&
//                         attachment.map((link, i) => {
//                             const meta = getFileMetaData(link);

//                             return (
//                                 <>
//                                     <Box
//                                         key={i}
//                                         sx={{
//     display: "flex",
//     alignItems: "center",
//     gap: 1.5,
//     px: 0.6,
//     py: 0.5,
//     bgcolor: "#F9FAFB",
//     borderRadius: 10,
//     border: "1px solid #E5E7EB",
//     transition: "all 0.2s ease",
//     "&:hover": {
//         bgcolor: "#F3F4F6",
//     },
// }}
//                                     >
//                                         {/* Left Icon */}
//                                         <Box
//                                             sx={{
//                                                 width: 35,
//                                                 height: 35,
//                                                 minWidth: 35,
//                                                 display: "flex",
//                                                 alignItems: "center",
//                                                 justifyContent: "center",
//                                                 borderRadius: 6,
//                                                 bgcolor: "#F3E8FF",
//                                                 color: "#8B3DFF",
//                                             }}
//                                         >
//                                             {meta.icon}
//                                         </Box>

//                                         {/* Title + Extension */}
//                                         <Box sx={{ flex: 1, minWidth: 0 }}>
//                                             <Typography
//                                                 sx={{
//                                                     fontSize: 12,
//                                                     fontWeight: 600,
//                                                     color: "#1F2937",
//                                                     whiteSpace: "nowrap",
//                                                     overflow: "hidden",
//                                                     textOverflow: "ellipsis",
//                                                 }}
//                                             >
//                                                 {getFileNameWithoutExtension(link)}
//                                             </Typography>

//                                             <Typography
//                                                 sx={{
//                                                     fontSize: 8,
//                                                     color: "#6B7280",
//                                                     textTransform: "uppercase",
//                                                 }}
//                                             >
//                                                 {meta.extension || "FILE"}
//                                             </Typography>
//                                         </Box>

//                                         {/* Delete Action */}
//                                         <IconButton
//                                             size="small"
//                                             sx={{
//                                                 color: "#9CA3AF",
//                                                 "&:hover": {
//                                                     color: "#EF4444",
//                                                     bgcolor: "#FEE2E2",
//                                                 },
//                                             }}
//                                         >
//                                             <CloseIcon fontSize="small" />
//                                         </IconButton>
//                                     </Box>
//                                 </>
//                             );
//                         })}
//                 </Box>

//             </Box>

//             {/* --- 4. FOOTER / TOOLBAR --- */}
//             <Box
//                 sx={{
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     alignItems: "center",
//                     px: 2.5,
//                     pb: 2.5,
//                     pt: 0.5,
//                 }}
//             >
//                 {/* Action Buttons */}
//                 <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
//                     <ButtonBase
//                         onClick={onClose}
//                         sx={{
//                             fontSize: "13px",
//                             fontWeight: 600,
//                             color: "#6B7280",
//                             py: 1,
//                             px: 4,
//                             borderRadius: 5,
//                             "&:hover": { bgcolor: "#F9FAFB", color: "#374151" },
//                         }}
//                     >
//                         Cancel
//                     </ButtonBase>
//                     <ButtonBase
//                         onClick={HandleEditComment}
//                         sx={{
//                             fontSize: "13px",
//                             bgcolor: "#8B3DFF",
//                             color: "white",
//                             py: 1,
//                             px: 4,
//                             borderRadius: 5,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             boxShadow: "0 2px 4px rgba(139, 61, 255, 0.3)",
//                             transition: "all 0.2s",
//                         }}
//                     >
//                         Save
//                     </ButtonBase>
//                 </Box>
//             </Box>
//         </Popover>
//     );
// };

// export default EditCommentPopover;
