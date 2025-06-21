import React, { useState } from "react";
import { Box, Typography, Divider, Grid, Chip, Tabs, Tab, Paper, Rating, Avatar, Button, Stack, TextField, ListItemAvatar, Badge, IconButton, Tooltip } from "@mui/material";
import { Calendar1, Clock8, Building2, Ticket } from "lucide-react";
import { Send as SendIcon, AttachFile as AttachFileIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { useCallLog } from "../../context/UseCallLog";
import { FormatTime, generateActivities } from "../../libs/formatTime";
import ListItem from "@mui/material/ListItem";
import EditIcon from "@mui/icons-material/Edit";
import { DetailgetPriorityColor, DetailgetStatusColor } from "../../libs/data";
import { useAuth } from "../../context/UseAuth";

const getInitials = (name) => {
  return name
    ?.split(" ")
    ?.map((word) => word[0])
    ?.join("")
    ?.toUpperCase();
};

const EllipsisCell = ({ value, icon }) => (
  <Tooltip title={value} placement="top">
    <Typography
      variant="body2"
      sx={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "block",
        maxWidth: "50%",
      }}
      title={value}
    >
      {icon
        && icon} {value}
    </Typography>
  </Tooltip>
);

export default function CallLogDetailView({ data: defaultCallLogData, toggle }) {
  const [tabValue, setTabValue] = useState(0);
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const { addComment } = useCallLog();
  const activities = generateActivities(defaultCallLogData);
  const commentdata = defaultCallLogData?.comment?.trim() ? JSON.parse(defaultCallLogData.comment) : [];
  const { user } = useAuth();
  const [Comments, SetComments] = useState(commentdata);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      addComment(defaultCallLogData?.sr, comment, previewURL, user?.id);
      SetComments([...Comments, { id: defaultCallLogData?.sr + 1, text: comment, date: new Date(), attachment: previewURL }]);
      setComment("");
      setPreviewURL(null);
      setAttachment([]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setAttachment(files);
      setPreviewURL(url);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1, p: 0 }}>
        <Paper
          elevation={0}
          sx={{
            mx: "auto",
            overflow: "hidden",
          }}
        >
          {/* Title */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="500" mb={2}>
              #{defaultCallLogData?.sr} {defaultCallLogData?.company} {defaultCallLogData?.appname ? `- ${defaultCallLogData?.appname}` : ""}
            </Typography>
            <Tooltip title="Edit" placement="top">
              <IconButton onClick={toggle} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Details */}
          <Box sx={{ px: 1, py: 0 }}>
            {/* Date & Time */}
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 90, whiteSpace: "nowrap" }}>
                    Date
                  </Typography>
                  <Chip icon={<Calendar1 size={15} />} label={new Date(defaultCallLogData?.date)?.toLocaleDateString("en-GB")} color="default" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px", bgcolor: "transparent" }} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 90, whiteSpace: "nowrap" }}>
                    Time
                  </Typography>
                  <Chip icon={<Clock8 size={15} />} label={defaultCallLogData?.time} color="default" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />
                </Box>
              </Grid>
            </Grid>

            {/* Company & Topic */}
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                    Company
                  </Typography>
                  {/* <Chip icon={<Building2 size={15} />} label={defaultCallLogData?.company} color="default" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} /> */}
                  <EllipsisCell icon={<Building2 size={15} />} value={defaultCallLogData?.company} />
                </Box>
              </Grid>
              {defaultCallLogData?.appname && <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                    AppName
                  </Typography>
                  <Chip label={defaultCallLogData?.appname} color="info" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />
                </Box>
              </Grid>}
            </Grid>

            {/* Customer & Received By */}
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                    Customer
                  </Typography>
                  <EllipsisCell value={defaultCallLogData?.callBy} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                    Received By
                  </Typography>
                  <EllipsisCell value={defaultCallLogData?.receivedBy || "Not Assigned"} />
                </Box>
              </Grid>
            </Grid>
            {/* Status & Forward */}
            <Grid container spacing={1}>
              {defaultCallLogData?.status && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                      Status
                    </Typography>
                    <EllipsisCell value={<Chip label={defaultCallLogData?.status} color={DetailgetStatusColor(defaultCallLogData?.status)} size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />} />
                  </Box>
                </Grid>
              )}
              {defaultCallLogData?.DeptName && defaultCallLogData?.AssignedEmpName && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                      ForwardTo
                    </Typography>
                    <EllipsisCell value={defaultCallLogData?.AssignedEmpName || "Not Assigned"} />
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Feedback & Priority */}
            {defaultCallLogData?.feedback ||
              (defaultCallLogData?.priority && (
                <Grid container spacing={1}>
                  {defaultCallLogData?.feedback && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                          Feedback
                        </Typography>
                        <Chip label={defaultCallLogData?.feedback} color="success" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />
                      </Box>
                    </Grid>
                  )}
                  {defaultCallLogData?.priority && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                          Priority
                        </Typography>
                        <Chip label={defaultCallLogData?.priority} color={DetailgetPriorityColor(defaultCallLogData?.priority)} size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              ))}
            {/* Rating & ParentId */}
            {defaultCallLogData?.rating ||
              (defaultCallLogData?.parentId && (
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                        Rating
                      </Typography>
                      <Rating value={defaultCallLogData?.rating} size="small" />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                        ParentId
                      </Typography>
                      <Chip label={defaultCallLogData?.parentId} color="default" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />
                    </Box>
                  </Grid>
                </Grid>
              ))}
            {/* Call Start & Call End */}
            {defaultCallLogData?.callStart && (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                      Call Start
                    </Typography>
                    <Typography variant="body2">{format(parseISO(defaultCallLogData?.callStart), "MMMM dd, yyyy hh:mm a")}</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
            {defaultCallLogData?.callClosed && (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                      Call End
                    </Typography>
                    <Typography variant="body2">{format(parseISO(defaultCallLogData?.callClosed), "MMMM dd, yyyy hh:mm a")}</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
            {/* Call Start & topicRaisedBy */}
            {/* {defaultCallLogData?.callClosed && <Grid container spacing={1}>
                            <Grid item xs={12} >
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                                        Call Closed
                                    </Typography>
                                    <Chip label={format(parseISO(defaultCallLogData?.callClosed), "MMMM dd, yyyy hh:mm a")} color="error" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />
                                </Box>
                            </Grid>
                        </Grid>} */}

            {/* Call Raised By */}
            {defaultCallLogData?.topicRaisedBy && (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                      Source
                    </Typography>
                    <Typography variant="body2">{defaultCallLogData?.topicRaisedBy}</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
            {/* Ticket */}
            {defaultCallLogData?.ticket && (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                      {" "}
                      Ticket
                    </Typography>
                    <Chip icon={<Ticket size={18} />} label={defaultCallLogData?.ticket} color="default" size="medium" sx={{ fontSize: "0.8rem", height: 20, borderRadius: "2px" }} />
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Call Details */}
            {defaultCallLogData?.callDetails && (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Call Details
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.85rem", bgcolor: "#f5f5f5", p: 1 }}>
                      {defaultCallLogData?.callDetails}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Call Analysis */}
            {defaultCallLogData?.callAnalysis && (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Call Analysis
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.85rem", bgcolor: "#f5f5f5", p: 1 }}>
                      {defaultCallLogData?.callAnalysis}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
          <Divider />

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="call log tabs">
              <Tab label="Comments" />
              <Tab label="Activities" />
            </Tabs>
          </Box>
          <Box sx={{ px: 0.5, py: 3 }}>
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="subtitle2">Comments</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Comments?.length || 0}
                  </Typography>
                </Box>

                {/* Display Comments */}
                <Box
                  sx={{
                    height: "18vh",
                    overflowY: "auto",
                    px: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {Array?.isArray(Comments) && Comments?.length > 0 ? (
                    Comments?.sort((a, b) => new Date(b?.time) - new Date(a?.time)).map((c) => (
                      <Box
                        key={c?.id}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 1.5,
                        }}
                      >
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, mr: 1 }}>{getInitials(c?.Name)}</Avatar>

                        <Box
                          sx={{
                            bgcolor: user?.firstname + ' ' + user?.lastname === c?.Name ? "#e3f2fd" : "#f5f5f5",
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            boxShadow: 0.1,
                            flex: 1,
                            width: "100%",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, justifyContent: "space-between" }}>
                            <Typography variant="subtitle2" fontWeight="medium" sx={{ fontSize: 13, mr: 1 }}>
                              {c?.Name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                              {FormatTime(c?.time, "datetime")}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
                            {c?.text}
                          </Typography>
                          {c?.img && (
                            <Box mt={1}>
                              <Tooltip
                                title={
                                  <img
                                    src={c?.img}
                                    alt="Preview"
                                    style={{
                                      maxWidth: 200,
                                      borderRadius: 5,
                                      objectFit: "contain",
                                    }}
                                  />
                                }
                                arrow
                              >
                                <Avatar variant="rounded" src={c?.img} alt="attachment" sx={{ width: 60, height: 60, mt: 0.5 }} />
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                      No comments yet.
                    </Typography>
                  )}
                </Box>

                {/* Comment Input */}
                <Box sx={{ display: "flex", alignItems: "flex-start", mt: 3 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 12, mr: 1 }}>{getInitials(user?.firstname + " " + user?.lastname)}</Avatar>
                  <Box sx={{ flexGrow: 1, position: "relative" }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Add a comment..."
                      variant="outlined"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                      <input type="file" multiple style={{ display: "none" }} id="file-upload" onChange={handleFileChange} />
                      <label htmlFor="file-upload">
                        <Tooltip
                          sx={{
                            p: "4px 4px",
                          }}
                          title={previewURL ? <img src={previewURL} alt="Preview" width={100} height={100} style={{ borderRadius: "5px" }} /> : <small>Please Select Image</small>}
                          arrow
                          placement="top"
                        >
                          <IconButton component="span">
                            <Badge badgeContent={attachment?.length} color="error">
                              <AttachFileIcon />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      </label>
                      <Button variant="contained" endIcon={<SendIcon />} disabled={!comment.trim()} size="small" onClick={handleAddComment}>
                        Post
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Activities
                </Typography>
                <Stack spacing={2}>
                  {activities.map((activity, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          mr: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: activity.bgColor,
                        }}
                      >
                        {activity.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2">{activity.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
