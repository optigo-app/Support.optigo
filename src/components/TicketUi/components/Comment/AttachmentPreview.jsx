import React from "react";
import { Modal, Box, Typography, IconButton, Divider, Grid, Card, CardContent, Avatar, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatBytes, getFileIcon } from "../../../../libs/helper";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "clamp(300px, 90vw, 1200px)",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "transparent",
  boxShadow: 0,
  p: 0,
};

const backdropSx = {
  backdropFilter: "blur(4px)",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const containerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};

const headerBoxSx = {
  position: "absolute",
  top: 0,
  zIndex: 1,
  backdropFilter: "blur(2px)",
  py: 1,
  px: 2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  top: 0,
  width: "100%",
  color: "#fff",
};

export const AttachmentPreview = ({ open, setOpen = () => { }, attachments = [], HandleRemoveAttachMent = () => { } }) => {
  const handleClose = () => setOpen(false);

  if (!attachments || !Array.isArray(attachments)) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          sx: backdropSx,
        },
      }}
    >
      <Box sx={[containerSx, { outline: "none" }]} onClick={handleClose}>
        <Box sx={headerBoxSx}>
          <Typography variant="h6" fontWeight="bold">
            View Attachments
          </Typography>
          <IconButton onClick={handleClose} size="small" aria-label="close modal" sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Modal Content Wrapper */}
        <Box sx={modalStyle} onClick={(e) => e.stopPropagation()}>
          {/* Content */}
          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 2, textAlign: "center" }}>
            {attachments.length === 0 ? (
              <Typography color="textSecondary" align="center">
                No attachments found.
              </Typography>
            ) : (
              <Grid container spacing={2} justifyContent="center">
                {attachments.map((file, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                    <Card

                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        p: 2,
                        transition: "transform 0.2s ease-in-out",
                        boxShadow: 2,
                        borderRadius: 2,
                        position: "relative",
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          HandleRemoveAttachMent(file?.id);
                        }}
                        size="small" sx={{ position: "absolute", top: 1, right: 1 }} >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mb: 1,
                          bgcolor: "transparent",
                        }}
                      >
                        {getFileIcon(file?.fileName)}
                      </Avatar>
                      <CardContent>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            maxWidth: 120,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "12px",
                            fontWeight: "bold",
                            breakWord: "break-all",
                          }}
                        >
                          {file.fileName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: "10px", fontWeight: "bold" }}>
                          {formatBytes(file?.size)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
