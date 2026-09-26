import { Avatar, AvatarGroup, Box, Grid, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Chip, Stack, IconButton, Divider, Paper, Fade, Zoom } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareText, Plus, X, Send, Users } from "lucide-react";
import { usePointToDiscuss } from "../../../../PointToBeDiscuss/context/usePointToDiscuss";
import { DataParser } from "./../../../../../utils/ticketUtils";
import { useAuth } from "../../../../../context/UseAuth";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
export default function GroupAvatarsWithRemarks({ params }) {
  const [open, setOpen] = useState(false);
  const [remarkInput, setRemarkInput] = useState("");
  const [remarks, setRemarks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { AddRemarkToTopic } = usePointToDiscuss();
  const { user } = useAuth();

  useEffect(() => {
    if (params?.value) {
      const parsedData = DataParser(params.value);
      const avatars = parsedData?.data || [];
      setRemarks(Array.isArray(avatars) ? avatars : []);
    }
  }, [params]);

  const currentUser = {
    id: user?.id || "",
    name: user?.fullName || "Unknown User",
    avatar: user?.avatar || user?.fullName || "U",
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setRemarkInput("");
  };

  const handleSubmit = async () => {
    const trimmedRemark = remarkInput.trim();
    if (!trimmedRemark || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const newRemark = {
        id: Date.now().toString(), // Temporary ID
        PointId: params?.id,
        UserId: currentUser.name,
        UserAvatar: currentUser.avatar,
        Remark: trimmedRemark,
        EntryDate: new Date().toISOString(),
      };

      await AddRemarkToTopic({
        PointId: params.id,
        Remark: trimmedRemark,
      });

      setRemarks((prev) => [newRemark, ...prev]);
      setRemarkInput("");
    } catch (error) {
      console.error("Error adding remark:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarColorMap = useMemo(() => new Map(), []);

  const getAvatarColor = useCallback(
    (userId = "") => {
      if (avatarColorMap.has(userId)) return avatarColorMap.get(userId);

      const warmPalette = ["#FF6B6B", "#FF8C42", "#FFB627", "#F78DA7", "#FF5E3A", "#D97C2B", "#D84F57", "#C04C93", "#E14D2A", "#FA7D09"];

      const charSum = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const index = charSum % warmPalette.length;

      const color = warmPalette[index];
      avatarColorMap.set(userId, color);
      return color;
    },
    [avatarColorMap]
  );

  return (
    <Grid item xs="auto">
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {remarks.length === 0 ? (
          <Chip
            icon={<Plus size={16} />}
            size="small"
            label="Add Remark"
            onClick={handleOpen}
            clickable
            sx={{
              borderRadius: "20px",
              fontWeight: 500,
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              color: "primary.main",
              border: "1px solid rgba(25, 118, 210, 0.2)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.12)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
              },
              "& .MuiChip-icon": {
                color: "primary.main",
              },
            }}
          />
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AvatarGroup
              max={4}
              sx={{
                cursor: "pointer",
                "& .MuiAvatar-root": {
                  width: 26,
                  height: 26,
                  fontSize: 14,
                  borderWidth: 2,
                  fontWeight: 600,
                  borderColor: "background.paper",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.1)",
                    zIndex: 1,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                },
                "& .MuiAvatarGroup-avatar": {
                  backgroundColor: getAvatarColor(remarks[0]?.UserId),
                  color: "white",
                  fontSize: 10,
                  fontWeight: 600,
                },
              }}
              onClick={handleOpen}
            >
              <Avatar sx={{ bgcolor: "#1976d2 !important", color: "#fff" }}>
                <AddRoundedIcon />
              </Avatar>
              {remarks.map((remark, index) => (
                <Tooltip
                  arrow
                  PopperProps={{
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 8], // Tighter offset
                        },
                      },
                    ],
                  }}
                  componentsProps={{
                    tooltip: {
                      style: {
                        backgroundColor: "#fff",
                        padding: 0,
                        borderRadius: 12,
                        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0, 0, 0, 0.05)",
                        maxWidth: 260,
                        border: "1px solid #e0e0e0",
                      },
                    },
                    arrow: {
                      style: {
                        color: "lightgray",
                      },
                    },
                  }}
                  title={
                    <Box px={2} py={1.5} display="flex" flexDirection="column" onClick={(e) => e.stopPropagation()}>
                      <Box display="flex">
                        <Avatar
                          src={remark?.UserAvatar}
                          alt={remark?.UserId}
                          sx={{
                            width: 26,
                            height: 26,
                            fontSize: 14,
                            mr: 1.5,
                            bgcolor: getAvatarColor(remark?.UserId),
                            color: "#fff",
                            mt: 0.55,
                          }}
                        >
                          {getInitials(remark?.UserId)}
                        </Avatar>

                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} color="text.primary" noWrap>
                            @{remark?.UserId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            {remark?.Remark}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic", pl: "60px", fontSize: 12 }}>
                        {remark?.EntryDate &&
                          formatDistanceToNow(new Date(remark.EntryDate), {
                            addSuffix: true,
                          })}
                      </Typography>
                    </Box>
                  }
                >
                  <Avatar
                    alt={remark?.UserId || "Unknown"}
                    src={remark?.UserAvatar}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 12,
                      bgcolor: getAvatarColor(),
                      color: "#fff",
                      fontWeight: 600,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    {getInitials(remark?.UserId)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}
      </Box>

      <RemarkModal currentUser={currentUser} remarkInput={remarkInput} setRemarkInput={setRemarkInput} handleClose={handleClose} handleSubmit={handleSubmit} handleKeyPress={handleKeyPress} open={open} remarks={remarks} isSubmitting={isSubmitting} getInitials={getInitials} getAvatarColor={getAvatarColor} />
    </Grid>
  );
}

const RemarkModal = ({ open, handleClose, remarks, handleSubmit, handleKeyPress, currentUser, remarkInput, setRemarkInput, isSubmitting, getInitials, getAvatarColor }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: 20,
          m: 0,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          position: "relative",
        }}
      >
        <Box
          sx={{
            p: 1,
            borderRadius: 15,
            backgroundColor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageSquareText size={24} />
        </Box>
        <Box>
          <Typography variant="h6" component="span" fontWeight={600}>
            Discussion
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{}}>
            {remarks.length} remark{remarks.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            backgroundColor: "action.hover",
            "&:hover": {
              backgroundColor: "action.selected",
            },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: 500,
          overflowY: "auto",
          px: 3,
          py: 2,
        }}
        dividers
      >
        {/* Remark Input */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "grey.50",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.name}
              sx={{
                backgroundColor: getAvatarColor(currentUser?.name),
                color: "white",
                fontWeight: 600,
                width: 40,
                height: 40,
              }}
            >
              {getInitials(currentUser?.name)}
            </Avatar>
            <Box flexGrow={1}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                placeholder="Share your thoughts..."
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                    "& fieldset": {
                      borderColor: "divider",
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
              />
              <Box mt={1.5} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Press Enter to post, Shift+Enter for new line
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!remarkInput.trim() || isSubmitting}
                  startIcon={isSubmitting ? null : <Send size={16} />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 0.5,
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(25, 118, 210, 0.35)",
                    },
                    "&:disabled": {
                      backgroundColor: "action.disabledBackground",
                      color: "action.disabled",
                    },
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </Box>
            </Box>
          </Stack>
        </Paper>

        {/* Remarks Thread */}
        {remarks.length > 0 ? (
          <Stack spacing={2}>
            {remarks
              ?.sort((a, b) => (new Date(b?.EntryDate || 0) || Infinity) - (new Date(a?.EntryDate || 0) || Infinity))
              ?.map((remark, index) => (
                <Zoom key={remark?.id || index} in timeout={200 + index * 50}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.light",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        src={remark?.UserAvatar}
                        alt={remark?.UserId}
                        sx={{
                          backgroundColor: getAvatarColor(remark?.UserId),
                          color: "white",
                          fontWeight: 600,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getInitials(remark?.UserId)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                            {remark?.UserId || "Unknown User"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {remark?.EntryDate &&
                              formatDistanceToNow(new Date(remark.EntryDate), {
                                addSuffix: true,
                              })}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                          {remark?.Remark}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Zoom>
              ))}
          </Stack>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "text.secondary",
            }}
          >
            <Users size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              No remarks yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share your thoughts!
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
