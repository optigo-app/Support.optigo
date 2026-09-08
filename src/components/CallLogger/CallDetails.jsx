import React, { useState } from "react";
import { filesUploadApi } from "../../apis/UploadFille";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  TextField,
  Badge,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Clock8,
  Ticket,
  User,
  Activity,
  Contact,
  FileText,
  Link,
  Calendar1,
  Paperclip,
  X,
} from "lucide-react";
import { AttachFile as AttachFileIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { useCallLog } from "../../context/UseCallLog";
import { FormatTime, generateActivities } from "../../libs/formatTime";
import { useAuth } from "../../context/UseAuth";
import { getFileMetaData } from "../../libs/helper";

// ─── Apple HIG Token System ───────────────────────────────────────────────────
const hig = {
  // Semantic backgrounds
  bg: {
    primary: "#FFFFFF",
    secondary: "#F2F2F7",   // systemGroupedBackground
    tertiary: "#FFFFFF",    // secondaryGroupedBackground (cards)
    grouped: "#F2F2F7",
  },
  // Semantic labels
  label: {
    primary: "#000000",
    secondary: "rgba(60,60,67,0.6)",
    tertiary: "rgba(60,60,67,0.3)",
  },
  // System fills
  fill: {
    primary: "rgba(120,120,128,0.20)",
    secondary: "rgba(120,120,128,0.16)",
    tertiary: "rgba(118,118,128,0.12)",
  },
  // System colors
  blue: "#007AFF",
  green: "#34C759",
  orange: "#FF9500",
  red: "#FF3B30",
  indigo: "#5856D6",
  gray: "#8E8E93",
  separator: "rgba(60,60,67,0.12)",
  // Corner radii (8pt grid multiples)
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
  // Typography (SF Pro scale)
  type: {
    largeTitle:  { fontSize: 34, fontWeight: 700, letterSpacing: 0.37 },
    title1:      { fontSize: 28, fontWeight: 700, letterSpacing: 0.36 },
    title2:      { fontSize: 22, fontWeight: 700, letterSpacing: 0.35 },
    title3:      { fontSize: 20, fontWeight: 600, letterSpacing: 0.38 },
    headline:    { fontSize: 17, fontWeight: 600, letterSpacing: -0.41 },
    body:        { fontSize: 17, fontWeight: 400, letterSpacing: -0.41 },
    callout:     { fontSize: 16, fontWeight: 400, letterSpacing: -0.32 },
    subheadline: { fontSize: 15, fontWeight: 400, letterSpacing: -0.24 },
    footnote:    { fontSize: 13, fontWeight: 400, letterSpacing: -0.08 },
    caption1:    { fontSize: 12, fontWeight: 400, letterSpacing: 0 },
    caption2:    { fontSize: 11, fontWeight: 400, letterSpacing: 0.07 },
  },
};

const getInitials = (name) =>
  name?.split(" ")?.map((w) => w[0])?.join("")?.toUpperCase() ?? "?";

// ─── Reusable: Section Header ─────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1, px: 0.5 }}>
    {Icon && <Icon size={13} color={hig.gray} />}
    <Typography
      sx={{
        ...hig.type.footnote,
        fontWeight: 600,
        color: hig.label.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ─── Reusable: Grouped Card ───────────────────────────────────────────────────
const GroupedCard = ({ children, sx = {} }) => (
  <Box
    sx={{
      bgcolor: hig.bg.tertiary,
      borderRadius: `${hig.radius.md}px`,
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Box>
);

// ─── Reusable: Row inside a grouped card ─────────────────────────────────────
const InfoRow = ({ label, value, icon: Icon, isLast = false }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      px: 2,
      py: 1.5,
      gap: 1,
      borderBottom: isLast ? "none" : `0.5px solid ${hig.separator}`,
    }}
  >
    <Typography
      sx={{
        ...hig.type.subheadline,
        color: hig.label.secondary,
        minWidth: 96,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        pt: "1px",
        flexShrink: 0,
      }}
    >
      {Icon && <Icon size={13} />}
      {label}
    </Typography>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {typeof value === "string" || typeof value === "number" ? (
        <Typography
          sx={{
            ...hig.type.subheadline,
            color: hig.label.primary,
            lineHeight: 1.45,
          }}
        >
          {value || "—"}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
);

// ─── Reusable: Attachment pill ────────────────────────────────────────────────
const AttachmentPill = ({ url }) => {
  const meta = getFileMetaData(url);
  const isImage = meta.type === "Image";
  const fileName = decodeURIComponent(url.split("/").pop() || "Attachment");

  return (
    <Box
      onClick={() => window.open(url, "_blank")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mt: 1,
        px: 1.5,
        py: 1,
        borderRadius: `${hig.radius.sm}px`,
        bgcolor: hig.fill.tertiary,
        cursor: "pointer",
        maxWidth: 240,
        transition: "background-color 0.15s ease",
        "&:hover": { bgcolor: hig.fill.secondary },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: `${hig.radius.sm - 2}px`,
          overflow: "hidden",
          bgcolor: "rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isImage ? (
          <img
            src={url}
            alt={fileName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          React.cloneElement(meta.icon, { sx: { fontSize: 20 } })
        )}
      </Box>

      {/* Labels */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            ...hig.type.footnote,
            fontWeight: 500,
            color: hig.label.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fileName}
        </Typography>
        <Typography sx={{ ...hig.type.caption2, color: hig.label.secondary }}>
          {meta.type}{meta.extension ? ` · ${meta.extension.toUpperCase()}` : ""}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CallLogDetailView({
  data: defaultCallLogData,
  toggle,
  forceTab,
}) {
  const [tabValue, setTabValue] = useState(
    forceTab !== undefined ? forceTab : 0,
  );
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment } = useCallLog();
  const activities = generateActivities(defaultCallLogData);
  const commentdata = defaultCallLogData?.comment?.trim()
    ? JSON.parse(defaultCallLogData.comment)
    : [];
  const { user } = useAuth();
  const [Comments, SetComments] = useState(commentdata);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      let uploadedUrl = null;
      if (selectedFile) {
        const uploadRes = await filesUploadApi({
          ukey: user?.ukey,
          folderName: "CallLog",
          uniqueNo: defaultCallLogData?.sr,
          attachments: [selectedFile],
        });
        uploadedUrl = uploadRes?.files?.[0]?.url ?? null;
      }
      addComment(defaultCallLogData?.sr, comment, uploadedUrl, user?.id);
      SetComments([
        ...Comments,
        {
          id: Date.now(),
          text: comment,
          time: new Date().toISOString(),
          Name: user?.firstname
            ? `${user.firstname} ${user.lastname}`
            : "Current User",
          img: uploadedUrl,
        },
      ]);
      setComment("");
      setPreviewURL(null);
      setSelectedFile(null);
      setAttachment([]);
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      setPreviewURL(URL.createObjectURL(file));
      setSelectedFile(file);
      setAttachment(files);
    }
  };

  const safeFormat = (dateStr, fmt) => {
    try { return format(parseISO(dateStr), fmt); }
    catch { return dateStr || "—"; }
  };

  // ── Details tab ─────────────────────────────────────────────────────────────
  if (forceTab === undefined) {
    return (
      <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>

        {/* ── Caller & Company ── */}
        <Box>
          <SectionHeader icon={Contact} label="Caller & Company" />
          <GroupedCard>
            {/* Caller row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1.75,
                borderBottom: `0.5px solid ${hig.separator}`,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: hig.blue,
                  fontSize: hig.type.callout.fontSize,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {getInitials(defaultCallLogData?.callBy)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    ...hig.type.headline,
                    color: hig.label.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {defaultCallLogData?.callBy || "Unknown Caller"}
                </Typography>
                <Typography
                  sx={{
                    ...hig.type.footnote,
                    color: hig.label.secondary,
                    mt: 0.25,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <span>#{defaultCallLogData?.sr}</span>
                  <span style={{ color: hig.separator }}>·</span>
                  <span style={{ color: hig.blue }}>{defaultCallLogData?.topicRaisedBy || "No Source"}</span>
                  <span style={{ color: hig.separator }}>·</span>
                  <span style={{ color: hig.green }}>{defaultCallLogData?.priority || "Normal"} Priority</span>
                </Typography>
              </Box>
            </Box>

            {/* Company row */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ ...hig.type.callout, fontWeight: 600, color: hig.label.primary, mb: 0.5 }}>
                {defaultCallLogData?.company || "No Company"}
              </Typography>
              <Typography
                sx={{
                  ...hig.type.footnote,
                  color: hig.label.secondary,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <span>{defaultCallLogData?.appname || "—"}</span>
                <span style={{ color: hig.separator }}>·</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Activity size={11} /> {defaultCallLogData?.status || "—"}
                </span>
                <span style={{ color: hig.separator }}>·</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Calendar1 size={11} />
                  {defaultCallLogData?.date
                    ? new Date(defaultCallLogData.date).toLocaleDateString("en-GB")
                    : "—"}
                </span>
              </Typography>
            </Box>
          </GroupedCard>
        </Box>

        {/* ── Call Information ── */}
        <Box>
          <SectionHeader icon={FileText} label="Call Information" />
          <GroupedCard>
            {/* Participants */}
            <InfoRow
              icon={User}
              label="Received By"
              value={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 22, height: 22, bgcolor: hig.green, fontSize: 9, fontWeight: 700 }}>
                      {getInitials(defaultCallLogData?.receivedBy)}
                    </Avatar>
                    <Typography sx={{ ...hig.type.subheadline, color: hig.label.primary, fontWeight: 500 }}>
                      {defaultCallLogData?.receivedBy || "Not Assigned"}
                    </Typography>
                  </Box>
                  {defaultCallLogData?.AssignedEmpName && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 22, height: 22, bgcolor: hig.orange, fontSize: 9, fontWeight: 700 }}>
                        {getInitials(defaultCallLogData.AssignedEmpName)}
                      </Avatar>
                      <Typography sx={{ ...hig.type.subheadline, color: hig.label.primary, fontWeight: 500 }}>
                        {defaultCallLogData.AssignedEmpName}
                        <Typography component="span" sx={{ ...hig.type.footnote, color: hig.label.secondary, ml: 0.5 }}>
                          Forwarded
                        </Typography>
                      </Typography>
                    </Box>
                  )}
                </Box>
              }
            />

            {/* Ticket */}
            <InfoRow
              icon={Ticket}
              label="Ticket"
              value={
                <Typography
                  sx={{
                    ...hig.type.subheadline,
                    color: defaultCallLogData?.ticket ? hig.blue : hig.label.tertiary,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {defaultCallLogData?.ticket || "None attached"}
                  {defaultCallLogData?.ticket && <Link size={11} />}
                </Typography>
              }
            />

            {/* Note */}
            <InfoRow
              icon={FileText}
              label="Note"
              isLast
              value={
                <Typography
                  sx={{
                    ...hig.type.subheadline,
                    color: defaultCallLogData?.description || defaultCallLogData?.callDetails
                      ? hig.label.primary
                      : hig.label.tertiary,
                    lineHeight: 1.5,
                  }}
                >
                  {defaultCallLogData?.description ||
                    defaultCallLogData?.callDetails ||
                    "No notes for this call."}
                </Typography>
              }
            />
          </GroupedCard>
        </Box>
      </Box>
    );
  }

  // ── Comments tab (forceTab === 0) ────────────────────────────────────────────
  if (forceTab === 0) {
    return (
      <Box sx={{ px: 2, pb: 2 }}>
        {/* Composer */}
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            mb: 2,
            mt: 1.5,
            alignItems: "flex-start",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: hig.type.caption2.fontSize,
              fontWeight: 700,
              bgcolor: hig.blue,
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            {getInitials(`${user?.firstname} ${user?.lastname}`)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="Add a comment…"
              variant="outlined"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: `${hig.radius.md}px`,
                  fontSize: hig.type.callout.fontSize,
                  bgcolor: hig.bg.secondary,
                  fontFamily: "inherit",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: hig.fill.primary },
                  "&.Mui-focused": { bgcolor: hig.bg.primary },
                  "&.Mui-focused fieldset": {
                    borderColor: hig.blue,
                    borderWidth: "1.5px",
                  },
                },
              }}
            />

            {/* Selected file chip */}
            {selectedFile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mt: 0.75,
                  px: 1.25,
                  py: 0.6,
                  borderRadius: "20px",
                  bgcolor: hig.fill.tertiary,
                  width: "fit-content",
                  maxWidth: "100%",
                }}
              >
                {(() => {
                  const meta = getFileMetaData(selectedFile.name);
                  const isImage = meta.type === "Image";
                  return isImage ? (
                    <img
                      src={previewURL}
                      alt=""
                      style={{ width: 16, height: 16, borderRadius: 3, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    React.cloneElement(meta.icon, { sx: { fontSize: 14, flexShrink: 0 } })
                  );
                })()}
                <Typography
                  sx={{
                    ...hig.type.caption1,
                    color: hig.label.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 180,
                  }}
                >
                  {selectedFile.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => { setSelectedFile(null); setPreviewURL(null); setAttachment([]); }}
                  sx={{ p: 0, ml: 0.25, color: hig.gray }}
                >
                  <X size={12} />
                </IconButton>
              </Box>
            )}

            {/* Actions row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              {/* Attach */}
              <Box>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.ppt,.pptx,.zip,.rar"
                  style={{ display: "none" }}
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Tooltip
                    title={selectedFile ? `Replace: ${selectedFile.name}` : "Attach file"}
                    placement="top"
                    arrow
                  >
                    <IconButton
                      component="span"
                      size="small"
                      sx={{
                        color: selectedFile ? hig.blue : hig.gray,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        "&:hover": { bgcolor: hig.fill.tertiary },
                        transition: "color 0.2s",
                      }}
                    >
                      <AttachFileIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </label>
              </Box>

              {/* Post button */}
              <Button
                variant="contained"
                size="small"
                disabled={!comment.trim() || isSubmitting}
                onClick={handleAddComment}
                sx={{
                  textTransform: "none",
                  borderRadius: "20px",
                  fontSize: hig.type.footnote.fontSize,
                  fontWeight: 600,
                  boxShadow: "none",
                  px: 2,
                  height: 32,
                  bgcolor: hig.blue,
                  fontFamily: "inherit",
                  letterSpacing: -0.2,
                  "&:hover": { bgcolor: "#0062CC", boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: hig.fill.primary, color: hig.label.tertiary },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={12} sx={{ color: "#fff" }} />
                ) : (
                  "Post"
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Separator */}
        <Box sx={{ height: "0.5px", bgcolor: hig.separator, mx: -2, mb: 0 }} />

        {/* Comments list */}
        <Box
          sx={{
            maxHeight: "52vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            mt: 0,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: hig.fill.primary, borderRadius: 8 },
          }}
        >
          {Array.isArray(Comments) && Comments.length > 0 ? (
            [...Comments]
              .sort((a, b) => new Date(b?.time) - new Date(a?.time))
              .map((c, idx) => {
                const isMe = `${user?.firstname} ${user?.lastname}` === c?.Name;
                return (
                  <Box
                    key={c?.id || idx}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.25,
                      py: 1.5,
                      borderBottom: `0.5px solid ${hig.separator}`,
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: hig.type.caption2.fontSize,
                        fontWeight: 700,
                        flexShrink: 0,
                        bgcolor: isMe ? hig.blue : hig.fill.primary,
                        color: isMe ? "#fff" : hig.label.primary,
                        mt: 0.25,
                      }}
                    >
                      {getInitials(c?.Name)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Name + time */}
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.35 }}>
                        <Typography
                          sx={{
                            ...hig.type.footnote,
                            fontWeight: 600,
                            color: hig.label.primary,
                          }}
                        >
                          {c?.Name}
                        </Typography>
                        <Typography sx={{ ...hig.type.caption2, color: hig.label.secondary }}>
                          {FormatTime(c?.time, "datetime")}
                        </Typography>
                      </Box>

                      {/* Comment text */}
                      <Typography
                        sx={{
                          ...hig.type.callout,
                          color: hig.label.primary,
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.45,
                        }}
                      >
                        {c?.text}
                      </Typography>

                      {/* Attachment */}
                      {c?.img && <AttachmentPill url={c.img} />}
                    </Box>
                  </Box>
                );
              })
          ) : (
            <Box
              sx={{
                py: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: hig.fill.tertiary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Paperclip size={20} color={hig.gray} />
              </Box>
              <Typography sx={{ ...hig.type.footnote, color: hig.label.secondary }}>
                No comments yet
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // ── Timeline tab (forceTab === 1) ────────────────────────────────────────────
  if (forceTab === 1) {
    return (
      <Box sx={{ px: 2, pb: 2, mt: 1.5, position: "relative" }}>
        {/* Vertical track */}
        <Box
          sx={{
            position: "absolute",
            left: 31,
            top: 20,
            bottom: 20,
            width: "1.5px",
            bgcolor: hig.separator,
          }}
        />

        <Stack spacing={0}>
          {activities.map((activity, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                position: "relative",
                py: 1,
              }}
            >
              {/* Node */}
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  bgcolor: activity.bgColor || hig.fill.secondary,
                  border: `2px solid ${hig.bg.primary}`,
                  boxShadow: `0 0 0 1.5px ${hig.separator}`,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: activity.color || hig.gray,
                  zIndex: 1,
                  "& svg": { width: 11, height: 11 },
                }}
              >
                {activity.icon}
              </Box>

              {/* Content */}
              <Box sx={{ pt: 0.25, flex: 1 }}>
                <Typography
                  sx={{
                    ...hig.type.footnote,
                    fontWeight: 500,
                    color: hig.label.primary,
                    lineHeight: 1.4,
                  }}
                >
                  {activity.text}
                </Typography>
                <Typography
                  sx={{
                    ...hig.type.caption2,
                    color: hig.label.secondary,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                    mt: 0.2,
                  }}
                >
                  <Clock8 size={9} />
                  {activity.timestamp}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  return null;
}
