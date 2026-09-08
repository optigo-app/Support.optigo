import React, { useState } from "react";
import { Typography, Avatar, Card, CardMedia, CardActionArea, Collapse, ListItem, ListItemAvatar, ListItemText, IconButton, Box, Badge, Chip, Paper, Divider, Stack, Tooltip } from "@mui/material";
import DownloadForOfflineRoundedIcon from "@mui/icons-material/DownloadForOfflineRounded";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getFileMetaData, ValidateAttachment, ValidFile } from "../../../../libs/helper";
import Previewer from "../Previewer";

const AttachmentCard = ({ comment, openAttachmentId, handleToggleCollapse }) => {
  const [open, setOpen] = useState(false);
  if (!comment?.attachment) return null;
  const { isMultiple, attachments } = ValidateAttachment(comment);

  return (
    <>
      <Box sx={{ mb: 1.5 }}>
        {isMultiple ? (
          <MultipleAttachmentCard 
            HandleOpen={() => setOpen(true)} 
            attachments={attachments} 
            comment={comment} 
            openAttachmentId={openAttachmentId} 
            handleToggleCollapse={handleToggleCollapse} 
          />
        ) : (
          <SingleAttachmentCard 
            HandleOpen={() => setOpen(true)} 
            attachment={attachments[0]} 
            comment={comment} 
            openAttachmentId={openAttachmentId} 
            handleToggleCollapse={handleToggleCollapse} 
          />
        )}
      </Box>
      <Previewer open={open} setOpen={setOpen} attachments={attachments} />
    </>
  );
};

// --- Robust download utility ---
const handleDownload = async (fileUrl, e) => {
  // Stop event propagation if event exists
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  try {
    // Fetch the file as a blob
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Extract filename from URL
    const fileName = fileUrl.split("/").pop() || "download";
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after a short delay
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
  } catch (err) {
    console.error('Download error:', err);
    // Fallback: open in new tab if blob download fails
    window.open(fileUrl, '_blank');
  }
};

// --- Open file in new tab utility ---
const handleOpenFile = (fileUrl, e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  window.open(fileUrl, "_blank", "noopener,noreferrer");
};

// --- SINGLE ATTACHMENT CARD ---
const SingleAttachmentCard = ({ HandleOpen, attachment, comment, openAttachmentId, handleToggleCollapse }) => {
  const meta = getFileMetaData(attachment);
  const isImage = meta.type === "Image";
  const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].includes(meta.extension);
  const isExpanded = openAttachmentId === comment?.time;

  if (!isImage && !isVideo) {
    return (
      <FileCard 
        meta={meta} 
        fileSrc={attachment} 
        handlePreview={HandleOpen}
        handleDownload={(e) => handleDownload(attachment, e)}
      />
    );
  }

  return (
    <Card
      sx={{
        maxWidth: 380,
        minWidth: 260,
        boxShadow: 1,
        bgcolor: "#fff",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.light",
        },
      }}
    >
      {/* Header */}
      <Box
        onClick={() => handleToggleCollapse(comment?.time)}
        sx={{
          p: 1.5,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          "&:hover": { bgcolor: "grey.50" },
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.light",
            color: "primary.contrastText",
          }}
        >
          {meta.icon}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {ValidFile(attachment)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {`${meta.type} • ${meta.extension?.toUpperCase()}`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Preview">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                HandleOpen();
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(attachment, e);
              }}
            >
              <DownloadForOfflineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Stack>
      </Box>

      {/* Preview */}
      <Collapse in={isExpanded} timeout={200}>
        <Divider />
        <Box sx={{ p: 1.5, pt: 1 }}>
          {isImage && (
            <CardActionArea 
              onClick={(e) => {
                e.stopPropagation();
                HandleOpen();
              }} 
              sx={{ borderRadius: 1 }}
            >
              <CardMedia
                component="img"
                height="180"
                image={attachment}
                alt={ValidFile(attachment)}
                sx={{
                  objectFit: "contain",
                  width: "100%",
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              />
            </CardActionArea>
          )}
          {isVideo && (
            <CardMedia
              component="video"
              controls
              height="180"
              src={attachment}
              sx={{
                objectFit: "contain",
                width: "100%",
                borderRadius: 1,
                bgcolor: "grey.50",
              }}
            />
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

// --- MULTIPLE ATTACHMENT CARD ---
const MultipleAttachmentCard = ({ HandleOpen, attachments, comment, openAttachmentId, handleToggleCollapse }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isExpanded = openAttachmentId === comment?.time;

  const selectedAttachment = attachments[selectedIndex];

  return (
    <Card
      sx={{
        maxWidth: 420,
        minWidth: 300,
        boxShadow: 1,
        bgcolor: "#fff",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.light",
        },
      }}
    >
      <Box
        onClick={() => handleToggleCollapse(comment?.time)}
        sx={{
          p: 1.5,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          "&:hover": { bgcolor: "grey.50" },
        }}
      >
        <Badge badgeContent={attachments.length} color="primary">
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <AttachFileIcon fontSize="small" />
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            Multiple Attachments
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {attachments.length} files
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Preview">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                HandleOpen();
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download current file">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedAttachment, e);
              }}
            >
              <DownloadForOfflineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Stack>
      </Box>

      <Collapse in={isExpanded} timeout={200}>
        <Divider />
        <Box sx={{ p: 1.5, pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
            {attachments.map((attachment, index) => {
              const meta = getFileMetaData(attachment);
              const isSelected = selectedIndex === index;

              return (
                <Chip
                  key={index}
                  label={`${meta.type} ${index + 1}`}
                  variant={isSelected ? "filled" : "outlined"}
                  color={isSelected ? "info" : "default"}
                  size="small"
                  icon={meta.icon}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  sx={{ cursor: "pointer" }}
                />
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <AttachmentPreview
            attachment={selectedAttachment}
            onOpen={HandleOpen}
          />
        </Box>
      </Collapse>
    </Card>
  );
};

const AttachmentPreview = ({ attachment, onOpen }) => {
  const meta = getFileMetaData(attachment);
  const isImage = meta.type === "Image";
  const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].includes(meta.extension);

  if (isImage) {
    return (
      <CardActionArea onClick={onOpen} sx={{ borderRadius: 1 }}>
        <CardMedia
          sx={{
            objectFit: "contain",
            width: "100%",
            borderRadius: 1,
            backgroundColor: "grey.50",
            cursor: "pointer",
          }}
          component="img"
          height="180"
          image={attachment}
          alt={ValidFile(attachment)}
        />
      </CardActionArea>
    );
  }

  if (isVideo) {
    return (
      <CardMedia
        component="video"
        controls
        height="180"
        src={attachment}
        sx={{
          objectFit: "contain",
          width: "100%",
          borderRadius: 1,
          backgroundColor: "grey.50",
        }}
      />
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        textAlign: "center",
        backgroundColor: "grey.50",
        cursor: "pointer",
        borderRadius: 1,
        border: "1px dashed",
        borderColor: "grey.300",
        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: "grey.100",
          borderColor: "primary.light",
        },
      }}
      onClick={onOpen}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          mx: "auto",
          mb: 1,
        }}
      >
        {meta.icon}
      </Avatar>
      <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
        {ValidFile(attachment)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {`${meta.type} • ${meta.extension?.split("/")[0]?.toUpperCase()}`}
      </Typography>
    </Paper>
  );
};

const FileCard = ({ meta, fileSrc, handlePreview, handleDownload }) => {
  return (
    <Card
      sx={{
        maxWidth: 380,
        minWidth: 260,
        boxShadow: 1,
        backgroundColor: "#fff",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.light",
        },
      }}
    >
      <ListItem alignItems="center">
        <ListItemAvatar>
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#ddd",
              cursor: "pointer",
            }}
            onClick={handlePreview}
          >
            {meta.icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          onClick={handlePreview}
          sx={{ mr: 1, cursor: "pointer" }}
          primary={
            <Typography
              variant="body2"
              fontWeight="medium"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {ValidFile(fileSrc)}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="text.secondary">
              {`${meta.type} • ${meta.extension?.split("/")[0]?.toUpperCase()}`}
            </Typography>
          }
        />
        <Tooltip title="Preview">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handlePreview();
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton
            size="small"
            onClick={handleDownload}
          >
            <DownloadForOfflineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ListItem>
    </Card>
  );
};

export default AttachmentCard;



// import React, { useState } from "react";
// import { Typography, Avatar, Card, CardMedia, CardActionArea, Collapse, ListItem, ListItemAvatar, ListItemText, IconButton, Box, Badge, Chip, Paper, Divider, Stack, Tooltip } from "@mui/material";
// import DownloadForOfflineRoundedIcon from "@mui/icons-material/DownloadForOfflineRounded";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import { getFileMetaData, ValidateAttachment, ValidFile } from "../../../../libs/helper";
// import Previewer from "../Previewer";

// const AttachmentCard = ({ comment, openAttachmentId, handleToggleCollapse }) => {
//   const [open, setOpen] = useState(false);
//   if (!comment?.attachment) return null;
//   const { isMultiple, attachments } = ValidateAttachment(comment);

//   return (
//     <>
//       <Box sx={{ mb: 1.5 }}>{isMultiple ? <MultipleAttachmentCard HandleOpen={() => setOpen(true)} attachments={attachments} comment={comment} openAttachmentId={openAttachmentId} handleToggleCollapse={handleToggleCollapse} /> : <SingleAttachmentCard HandleOpen={() => setOpen(true)} attachment={attachments[0]} comment={comment} openAttachmentId={openAttachmentId} handleToggleCollapse={handleToggleCollapse} />}</Box>
//       <Previewer open={open} setOpen={setOpen} attachments={attachments} />
//     </>
//   );
// };

// // --- Utility for download
// const handleDownload = (fileUrl) => {
//   const link = document.createElement("a");
//   link.href = fileUrl;
//   link.download = fileUrl.split("/").pop();
//   link.click();
// };

// // --- SINGLE ATTACHMENT CARD ---
// const SingleAttachmentCard = ({ HandleOpen, attachment, comment, openAttachmentId, handleToggleCollapse }) => {
//   const meta = getFileMetaData(attachment);
//   const isImage = meta.type === "Image";
//   const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].includes(meta.extension);
//   const isExpanded = openAttachmentId === comment?.time;

//   const handleOpenFile = (e) => {
//     e.stopPropagation();
//     window.open(attachment, "_blank");
//   };

//   if (!isImage && !isVideo) {
//     return <FileCard meta={meta} fileSrc={attachment} handleOpenFile={handleOpenFile} handlePreview={HandleOpen} />;
//   }

//   return (
//     <Card
//       sx={{
//         maxWidth: 380,
//         minWidth: 260,
//         boxShadow: 1,
//         bgcolor: "#fff",
//         borderRadius: 2,
//         border: "1px solid",
//         borderColor: "divider",
//         transition: "all 0.2s ease-in-out",
//         "&:hover": {
//           boxShadow: 3,
//           borderColor: "primary.light",
//         },
//       }}
//     >
//       {/* Header */}
//       <Box
//         onClick={() => handleToggleCollapse(comment?.time)}
//         sx={{
//           p: 1.5,
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           gap: 1.5,
//           "&:hover": { bgcolor: "grey.50" },
//         }}
//       >
//         <Avatar
//           variant="rounded"
//           sx={{
//             width: 36,
//             height: 36,
//             bgcolor: "primary.light",
//             color: "primary.contrastText",
//           }}
//         >
//           {meta.icon}
//         </Avatar>

//         <Box sx={{ flex: 1, minWidth: 0 }}>
//           <Typography variant="body2" fontWeight="medium" noWrap>
//             {ValidFile(attachment)}
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             {`${meta.type} • ${meta.extension?.toUpperCase()}`}
//           </Typography>
//         </Box>

//         <Stack direction="row" spacing={0.5} alignItems="center">
//           <Tooltip title="Preview">
//             <IconButton
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 HandleOpen();
//               }}
//             >
//               <OpenInNewIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Download">
//             <IconButton
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDownload(attachment);
//               }}
//             >
//               <DownloadForOfflineRoundedIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
//         </Stack>
//       </Box>

//       {/* Preview */}
//       <Collapse in={isExpanded} timeout={200}>
//         <Divider />
//         <Box sx={{ p: 1.5, pt: 1 }}>
//           {isImage && (
//             <CardActionArea onClick={handleOpenFile} sx={{ borderRadius: 1 }}>
//               <CardMedia
//                 component="img"
//                 height="180"
//                 image={attachment}
//                 alt={ValidFile(attachment)}
//                 sx={{
//                   objectFit: "contain",
//                   width: "100%",
//                   bgcolor: "grey.50",
//                   borderRadius: 1,
//                 }}
//               />
//             </CardActionArea>
//           )}
//           {isVideo && (
//             <CardMedia
//               component="video"
//               controls
//               height="180"
//               src={attachment}
//               sx={{
//                 objectFit: "contain",
//                 width: "100%",
//                 borderRadius: 1,
//                 bgcolor: "grey.50",
//               }}
//             />
//           )}
//         </Box>
//       </Collapse>
//     </Card>
//   );
// };

// // --- MULTIPLE ATTACHMENT CARD ---
// const MultipleAttachmentCard = ({ HandleOpen, attachments, comment, openAttachmentId, handleToggleCollapse }) => {
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const isExpanded = openAttachmentId === comment?.time;

//   const selectedAttachment = attachments[selectedIndex];

//   return (
//     <Card
//       sx={{
//         maxWidth: 420,
//         minWidth: 300,
//         boxShadow: 1,
//         bgcolor: "#fff",
//         borderRadius: 2,
//         border: "1px solid",
//         borderColor: "divider",
//         transition: "all 0.2s ease-in-out",
//         "&:hover": {
//           boxShadow: 3,
//           borderColor: "primary.light",
//         },
//       }}
//     >
//       <Box
//         onClick={() => handleToggleCollapse(comment?.time)}
//         sx={{
//           p: 1.5,
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           gap: 1.5,
//           "&:hover": { bgcolor: "grey.50" },
//         }}
//       >
//         <Badge badgeContent={attachments.length} color="primary">
//           <Avatar
//             variant="rounded"
//             sx={{
//               width: 36,
//               height: 36,
//               bgcolor: "primary.light",
//               color: "primary.contrastText",
//             }}
//           >
//             <AttachFileIcon fontSize="small" />
//           </Avatar>
//         </Badge>

//         <Box sx={{ flex: 1 }}>
//           <Typography variant="body2" fontWeight="medium">
//             Multiple Attachments
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             {attachments.length} files
//           </Typography>
//         </Box>

//         <Stack direction="row" spacing={0.5} alignItems="center">
//           <Tooltip title="Preview">
//             <IconButton
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 HandleOpen();
//               }}
//             >
//               <OpenInNewIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Download current file">
//             <IconButton
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleDownload(selectedAttachment);
//               }}
//             >
//               <DownloadForOfflineRoundedIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <IconButton size="small">{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
//         </Stack>
//       </Box>

//       <Collapse in={isExpanded} timeout={200}>
//         <Divider />
//         <Box sx={{ p: 1.5, pb: 1 }}>
//           <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
//             {attachments.map((attachment, index) => {
//               const meta = getFileMetaData(attachment);
//               const isSelected = selectedIndex === index;

//               return <Chip key={index} label={`${meta.type} ${index + 1}`} variant={isSelected ? "filled" : "outlined"} color={isSelected ? "info" : "default"} size="small" icon={meta.icon} onClick={() => setSelectedIndex(index)} sx={{ cursor: "pointer" }} />;
//             })}
//           </Stack>
//         </Box>

//         <Box sx={{ px: 1.5, pb: 1.5 }}>
//           <AttachmentPreview
//             attachment={selectedAttachment}
//             onOpen={(e) => {
//               e.stopPropagation();
//               window.open(selectedAttachment, "_blank");
//             }}
//           />
//         </Box>
//       </Collapse>
//     </Card>
//   );
// };

// const AttachmentPreview = ({ attachment, onOpen }) => {
//   const meta = getFileMetaData(attachment);
//   const isImage = meta.type === "Image";
//   const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].includes(meta.extension);

//   if (isImage) {
//     return (
//       <CardActionArea onClick={onOpen} sx={{ borderRadius: 1 }}>
//         <CardMedia
//           sx={{
//             objectFit: "contain",
//             width: "100%",
//             borderRadius: 1,
//             backgroundColor: "grey.50",
//           }}
//           component="img"
//           height="180"
//           image={attachment}
//           alt={ValidFile(attachment)}
//         />
//       </CardActionArea>
//     );
//   }

//   if (isVideo) {
//     return (
//       <CardMedia
//         component="video"
//         controls
//         height="180"
//         src={attachment}
//         sx={{
//           objectFit: "contain",
//           width: "100%",
//           borderRadius: 1,
//           backgroundColor: "grey.50",
//         }}
//       />
//     );
//   }

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: 3,
//         textAlign: "center",
//         backgroundColor: "grey.50",
//         cursor: "pointer",
//         borderRadius: 1,
//         border: "1px dashed",
//         borderColor: "grey.300",
//         transition: "all 0.2s",
//         "&:hover": {
//           backgroundColor: "grey.100",
//           borderColor: "primary.light",
//         },
//       }}
//       onClick={onOpen}
//     >
//       <Avatar
//         sx={{
//           width: 40,
//           height: 40,
//           mx: "auto",
//           mb: 1,
//         }}
//       >
//         {meta.icon}
//       </Avatar>
//       <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
//         {ValidFile(attachment)}
//       </Typography>
//       <Typography variant="caption" color="text.secondary">
//         {`${meta.type} • ${meta.extension?.split("/")[0]?.toUpperCase()}`}
//       </Typography>
//     </Paper>
//   );
// };

// const FileCard = ({ meta, fileSrc, handleOpenFile, handlePreview }) => {
//   return (
//     <Card
//       sx={{
//         maxWidth: 380,
//         minWidth: 260,
//         boxShadow: 1,
//         backgroundColor: "#fff",
//         borderRadius: 2,
//         cursor: "pointer",
//         border: "1px solid",
//         borderColor: "divider",
//         transition: "all 0.2s ease-in-out",
//         "&:hover": {
//           boxShadow: 3,
//           borderColor: "primary.light",
//         },
//       }}
//     >
//       <ListItem alignItems="center">
//         <ListItemAvatar>
//           <Avatar
//             variant="rounded"
//             sx={{
//               width: 36,
//               height: 36,
//               bgcolor: "#ddd",
//             }}
//           >
//             {meta.icon}
//           </Avatar>
//         </ListItemAvatar>
//         <ListItemText
//           primary={
//             <Typography
//               variant="body2"
//               fontWeight="medium"
//               sx={{
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {ValidFile(fileSrc)}
//             </Typography>
//           }
//           secondary={
//             <Typography variant="caption" color="text.secondary">
//               {`${meta.type} • ${meta.extension?.split("/")[0]?.toUpperCase()}`}
//             </Typography>
//           }
//           sx={{ mr: 1 }}
//         />
//         <Tooltip title="Preview">
//           <IconButton
//             size="small"
//             onClick={(e) => {
//               e.stopPropagation();
//               handlePreview();
//             }}
//           >
//             <OpenInNewIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Download">
//           <IconButton
//             size="small"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleOpenFile();
//             }}
//           >
//             <DownloadForOfflineRoundedIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//       </ListItem>
//     </Card>
//   );
// };

// export default AttachmentCard;
