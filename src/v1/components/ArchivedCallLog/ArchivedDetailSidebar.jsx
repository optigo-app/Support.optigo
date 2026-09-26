import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Avatar,
  Paper,
  Stack,
} from "@mui/material";
import {
  X,
  Clock8,
  Globe,
  Contact,
  FileText,
  User,
  Building2,
  Calendar1,
  Tag,
  Ticket,
  Timer,
  Activity,
  Paperclip,
} from "lucide-react";
import CompactMediaPreview from "../NewCall/CompactMediaPreview";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name) =>
  name
    ?.split(" ")
    ?.map((w) => w[0])
    ?.join("")
    ?.toUpperCase() || "?";

const safeDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB");
};

// ─── Small info row ────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "110px 1fr",
      alignItems: "start",
      gap: 1,
      mb: 1,
    }}
  >
    <Typography
      sx={{
        fontSize: "0.74rem",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        pt: 0.1,
      }}
    >
      {icon} {label}
    </Typography>
    <Typography
      sx={{
        fontSize: "0.82rem",
        color: "#0f172a",
        fontWeight: 500,
        wordBreak: "break-word",
      }}
    >
      {value || "-"}
    </Typography>
  </Box>
);

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function ArchivedDetailSidebar({ open, onClose, callLogData }) {
  const d = callLogData;

  if (!d) return null;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 620,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          pt: 2,
          pb: 2,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: "#ede9fe",
              color: "#6d28d9",
            }}
          >
            <FileText size={16} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "1rem",
                lineHeight: 1.2,
              }}
            >
              Archived Call Detail
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              Read-only · No edits available
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "#64748b", "&:hover": { bgcolor: "#f1f5f9" } }}
        >
          <X size={20} />
        </IconButton>
      </Box>

      {/* ── Hero – Date + Time + Status ── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {/* Calendar block */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
            minWidth: 52,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              bgcolor: "#f1f5f9",
              width: "100%",
              textAlign: "center",
              py: 0.4,
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            {d?.date && !isNaN(new Date(d.dateRaw ?? d.date))
              ? new Date(d.dateRaw ?? d.date).toLocaleDateString("en-US", {
                  month: "short",
                })
              : "MON"}
          </Box>
          <Box
            sx={{
              py: 0.5,
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {d?.date && !isNaN(new Date(d.dateRaw ?? d.date))
              ? new Date(d.dateRaw ?? d.date).getDate()
              : "—"}
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
          >
            <Typography
              sx={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}
            >
              {d?.time || "—"}
            </Typography>
            <Chip
              label={d?.status || "-"}
              size="small"
              sx={{
                bgcolor: "#ede9fe",
                color: "#6d28d9",
                fontWeight: 600,
                borderRadius: 1,
                height: 22,
                fontSize: "0.72rem",
              }}
            />
            {d?.priority && (
              <Chip
                label={d.priority}
                size="small"
                sx={{
                  bgcolor: "#fef9c3",
                  color: "#92400e",
                  fontWeight: 600,
                  borderRadius: 1,
                  height: 22,
                  fontSize: "0.72rem",
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: "#64748b",
              fontSize: "0.82rem",
            }}
          >
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
            >
              <span style={{ color: "#94a3b8" }}>ID:</span> #{d?.sr}
            </Typography>
            <Typography sx={{ color: "#cbd5e1" }}>|</Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
            >
              <Globe size={13} /> GMT+5:30
            </Typography>
            {d?.CallDuration && (
              <>
                <Typography sx={{ color: "#cbd5e1" }}>|</Typography>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                >
                  <Clock8 size={13} /> {d.CallDuration}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Scrollable content ── */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 3, py: 2 }}>
        {/* Section: Caller & Company */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Contact size={15} color="#64748b" />
            <Typography
              sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}
            >
              Caller & Company Info
            </Typography>
          </Box>
          <Paper
            variant="outlined"
            sx={{ p: 1.5, borderRadius: 2, borderColor: "#e2e8f0" }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: "#1A73E8",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {getInitials(d?.callBy)}
              </Avatar>
              <Box>
                <Typography
                  sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}
                >
                  {d?.callBy || "Unknown Caller"}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {d?.topicRaisedBy
                    ? `Source: ${d.topicRaisedBy}`
                    : "No source info"}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                p: 1,
                borderLeft: "3px solid #6d28d9",
                borderRadius: 1,
                bgcolor: "#f8fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 0.25,
                }}
              >
                {d?.company || "No Company"}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                App: {d?.appname || "-"} &nbsp;·&nbsp; Date:{" "}
                {safeDate(d?.dateRaw ?? d?.date)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Section: Call Information */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <FileText size={15} color="#64748b" />
            <Typography
              sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}
            >
              Call Information
            </Typography>
          </Box>
          <Box sx={{ ml: 1 }}>
            <InfoRow
              icon={<User size={13} />}
              label="Received By"
              value={d?.receivedBy}
            />
            {d?.AssignedEmpName && (
              <InfoRow
                icon={<User size={13} />}
                label="Forwarded To"
                value={`${d.AssignedEmpName}${d.DeptName ? ` (${d.DeptName})` : ""}`}
              />
            )}
            <InfoRow
              icon={<Activity size={13} />}
              label="Ext. Status"
              value={d?.Estatus}
            />
            <InfoRow
              icon={<Timer size={13} />}
              label="Duration"
              value={d?.CallDuration}
            />
            <InfoRow
              icon={<Tag size={13} />}
              label="Topic By"
              value={d?.topicRaisedBy}
            />
            {d?.ticket && (
              <InfoRow
                icon={<Ticket size={13} />}
                label="Ticket"
                value={d.ticket}
              />
            )}
          </Box>
        </Box>

        {/* Section: Description / Notes */}
        {(d?.description || d?.callDetails) && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <FileText size={15} color="#64748b" />
              <Typography
                sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}
              >
                Notes
              </Typography>
            </Box>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                borderColor: "#e2e8f0",
                bgcolor: "#fafafa",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: "#334155",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {d?.description || d?.callDetails}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Section: Attachments */}
        {(() => {
          // Parse comma-separated URLs from filePath or imgUrl
          const rawPaths = d?.filePath || d?.imgUrl || d?.FilePath || d?.ImgUrl || '';
          const urls = rawPaths
            .split(',')
            .map((u) => u.trim())
            .filter(Boolean);

          if (urls.length === 0) return null;

          return (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Paperclip size={15} color="#64748b" />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  Attachments ({urls.length})
                </Typography>
              </Box>
              <Paper
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2, borderColor: '#e2e8f0', bgcolor: '#fafafa' }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {urls.map((url, idx) => {
                    const parts = url.split('/');
                    const fname = parts[parts.length - 1] || `file-${idx + 1}`;
                    return (
                      <CompactMediaPreview
                        key={idx}
                        imgUrl={url}
                        filename={fname}
                      />
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          );
        })()}

        {/* Archived badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "#f1f5f9",
            border: "1px dashed #cbd5e1",
          }}
        >
          <Typography
            sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}
          >
            🗃️ This call log is archived · Use the table to restore it
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
