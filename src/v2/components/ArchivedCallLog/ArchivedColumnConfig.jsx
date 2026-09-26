import React from "react";
import { Chip, Box, Typography, Rating, Tooltip, Avatar } from "@mui/material";
import optigocarelyIcon from "../../assets/grid/optigocarely.webp";
import helpdeskIcon from "../../assets/grid/help.optigo.svg";
import { getStatusColor, getPriorityColor } from "../../libs/data";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatCallTime } from "../../libs/formatTime";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import {
  PremiumTooltip,
  AvatarPill,
  PremiumStatusTooltip,
  CompletedStatusTooltipContent,
  isCompletedStatus,
  getRowModifiedDate,
} from "../_ui/CustomUI";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import DescriptionColumn from "../CallLogger/Desc/DescriptionColumn";
import BentoRoundedIcon from "@mui/icons-material/BentoRounded";
import { LocalActivity } from "@mui/icons-material";
import { separateFollowUpsAndForwarded } from "../../utils/callLogUtils";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

// ─── Read-only Status chip (no dropdown) ─────────────────────────────────────
const ReadOnlyStatusCell = React.memo(({ value, row, columnName = "Client Status" }) => {
  const { label, color } = getStatusColor(value);
  const isCompleted = isCompletedStatus(value || row?.Estatus || row?.status);
  const modifiedDate = getRowModifiedDate(row);

  const chipElement = (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{
        fontSize: "0.7rem",
        height: 20,
        cursor: "default",
      }}
    />
  );

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      {isCompleted ? (
        <PremiumStatusTooltip
          title={
            <CompletedStatusTooltipContent
              modifiedDate={modifiedDate}
              statusLabel={label}
              columnName={columnName}
            />
          }
        >
          {chipElement}
        </PremiumStatusTooltip>
      ) : (
        chipElement
      )}
    </Box>
  );
});

// ─── Read-only Priority chip (no dropdown) ────────────────────────────────────
const ReadOnlyPriorityCell = React.memo(({ value }) => {
  const { label, color } = getPriorityColor(value);
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Chip
        label={label || "-"}
        color={color}
        size="small"
        sx={{
          fontSize: "0.7rem",
          height: 20,
          cursor: "default",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
});
// ─── Modern Read-only Forward Cell ──────────────────────────────────────────────
const ReadOnlyForwardCell = React.memo(({ row }) => {
  const name = (row?.AssignedEmpName || "").trim();
  const dept = (row?.DeptName || "").trim();

  const { forwardedFollowUps } = React.useMemo(() => {
    return separateFollowUpsAndForwarded(row?.FollowUpList);
  }, [row?.FollowUpList]);

  const forwardedCount = forwardedFollowUps?.length || 0;

  if (!name && forwardedCount === 0) {
    return (
      <Typography
        sx={{
          fontSize: "0.82rem",
          color: "text.secondary",
          textAlign: "center",
          width: "100%",
        }}
      >
        —
      </Typography>
    );
  }

  const formattedName = (() => {
    if (!name) return "";
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
  })();

  const initials = name
    ? name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("")
    : "?";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {name && (
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: "0.72rem",
              fontWeight: 600,
              bgcolor: "#EEF2FF",
              color: "#4F46E5",
            }}
          >
            {initials}
          </Avatar>
        )}

        {name && (
          <Box
            sx={{
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <Typography
              noWrap
              sx={{
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "#111827",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {formattedName}
            </Typography>

            <Typography
              noWrap
              sx={{
                fontSize: "0.64rem",
                color: "#6B7280",
                lineHeight: 1.25,
              }}
            >
              {dept || "No Department"}
            </Typography>
          </Box>
        )}
      </Box>

      {forwardedCount > 0 && (
        <PremiumTooltip
          placement="left"
          PopperProps={{
            modifiers: [
              {
                name: "preventOverflow",
                options: {
                  boundary: "viewport",
                },
              },
            ],
          }}
          title={
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 250,
                maxWidth: 290,
                maxHeight: 260,
                overflowY: "auto",
                pr: 0.5,
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#cbd5e1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
              }}
            >
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  bgcolor: "background.paper",
                  pb: 0.8,
                  mb: 0.6,
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  ↗ Forwarded Calls
                </Typography>
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.1,
                    borderRadius: "10px",
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                    color: "#2563eb",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                  }}
                >
                  {forwardedCount}
                </Box>
              </Box>

              {forwardedFollowUps.map((fu, idx) => {
                const isValidDate = (d) =>
                  typeof d === "string" && d && !d.startsWith("1900-01-01");
                const isDone =
                  isValidDate(fu?.CallClosed) ||
                  (fu?.CallDuration && fu?.CallDuration !== "00:00:00");
                return (
                  <Box
                    key={fu.Id || idx}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.3,
                      p: 0.8,
                      mb: 0.5,
                      borderRadius: "6px",
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: "#f1f5f9",
                        borderColor: "#cbd5e1",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        #{fu.Id}{" "}
                        {fu.ForwardedEmp
                          ? `➡ ${fu.ForwardedEmp}`
                          : fu.CreatedBy
                          ? `· ${fu.CreatedBy}`
                          : ""}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.66rem",
                          fontWeight: 700,
                          px: 0.8,
                          py: 0.1,
                          borderRadius: "10px",
                          bgcolor: isDone
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                          color: isDone ? "#059669" : "#dc2626",
                        }}
                      >
                        {isDone ? fu.CallDuration || "Done" : "Pending"}
                      </Typography>
                    </Box>
                    {fu.CreatedBy && fu.ForwardedEmp && (
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "#64748b",
                        }}
                      >
                        Forwarded by: {fu.CreatedBy}
                      </Typography>
                    )}
                    {(fu?.Description || fu?.Descr || fu?.Reason) && (
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "#475569",
                          fontStyle: "italic",
                          whiteSpace: "pre-wrap",
                          bgcolor: "#ffffff",
                          p: 0.5,
                          borderRadius: "4px",
                          border: "1px solid #f1f5f9",
                          mt: 0.2,
                        }}
                      >
                        "{fu.Description || fu.Descr || fu.Reason}"
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          }
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 0.8,
              py: 0.15,
              borderRadius: "12px",
              bgcolor: "rgba(37, 99, 235, 0.08)",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              color: "#2563eb",
              cursor: "pointer",
              transition: "all 0.2s ease",
              ml: 0.5,
              "&:hover": {
                bgcolor: "rgba(37, 99, 235, 0.18)",
                borderColor: "#2563eb",
                transform: "scale(1.05)",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {forwardedCount}
            </Typography>
          </Box>
        </PremiumTooltip>
      )}
    </Box>
  );
});
// ─── Column definitions — same as original, chips are read-only ───────────────
export const getArchivedCallColumns = ({ viewMode, onViewDetails }) => [
  {
    field: "index",
    headerName: "Sr",
    width: 50,
    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          height: "100%",
          alignItems: "center",
          gap: 1,
        }}
      >
        {params?.value}
      </Box>
    ),
  },
  {
    field: "viewDetails",
    headerName: "Details",
    width: 110,
    sortable: false,
    renderCell: (params) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Chip
          label="Details"
          clickable
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(params.row);
          }}
          sx={{
            height: 22,
            px: 0.3,
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            bgcolor: "#ffffff",
            color: "#374151",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            cursor: "pointer",
            transition: "all 0.18s ease",

            "& .MuiChip-label": {
              px: 1.25,
            },

            "&:hover": {
              bgcolor: "#F9FAFB",
              borderColor: "#D1D5DB",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            },

            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        />
      </Box>
    ),
  },
  {
    field: "datetime",
    headerName: "Date & Time",
    width: 120,
    renderCell: (params) => {
      const date = params?.row?.date || "-";
      const time = params?.row?.time || "-";
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.3 }}>
            <CalendarMonthIcon
              sx={{
                width: 12,
                height: 12,
                mr: 0.5,
                color: "rgb(180 180 180 / 80%)",
              }}
            />
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                fontWeight: 600,
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {date}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccessTimeIcon
              sx={{
                width: 12,
                height: 12,
                mr: 0.5,
                color: "rgb(180 180 180 / 80%)",
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={formatCallTime(time)}
            >
              {formatCallTime(time) || "-"}
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: "company",
    headerName: "Client",
    width: 150,
    renderCell: (params) => {
      const description = params?.value || "";
      const topic = params?.row?.callBy || "";
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
          }}
        >
          <PremiumTooltip title={topic}>
            <Typography
              color="text.primary"
              variant="subtitle2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
              fontWeight={500}
            >
              {topic}
            </Typography>
          </PremiumTooltip>
          <PremiumTooltip title={description}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <ApartmentRoundedIcon
                sx={{
                  width: 14,
                  height: 14,
                  mr: 0.5,
                  color: "rgb(180 180 180 / 80%)",
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  fontWeight: 500,
                  maxWidth: "calc(100% - 16px)",
                }}
                title={description}
              >
                {description || "-"}
              </Typography>
            </Box>
          </PremiumTooltip>
        </Box>
      );
    },
  },
  {
    field: "description",
    headerName: "AppName / Description",
    width: 260,
    renderCell: (params) => <DescriptionColumn params={params} />,
  },
  {
    field: "FollowUpList",
    headerName: "Follow-Up",
    width: 130,
    sortable: false,
    renderHeader: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <ReplayRoundedIcon sx={{ fontSize: 16, color: "#FF9800" }} />
        Follow-Up
      </Box>
    ),
    renderCell: (params) => {
      const safeParse = (data) => {
        try {
          if (!data) return [];
          if (Array.isArray(data)) return data;
          if (typeof data === "string") {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
          }
          return [];
        } catch {
          return [];
        }
      };
      const followUpList = safeParse(params?.row?.FollowUpList);
      if (followUpList.length === 0)
        return (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ width: "100%", textAlign: "center" }}
          >
            -
          </Typography>
        );

      const isValidDate = (d) =>
        typeof d === "string" && d && !d.startsWith("1900-01-01");
      const isCompleted = (fu) =>
        isValidDate(fu?.CallClosed) ||
        (fu?.CallDuration && fu?.CallDuration !== "00:00:00");
      const isPending = (fu) =>
        !isValidDate(fu?.CallClosed) &&
        (!fu?.CallDuration || fu?.CallDuration === "00:00:00");
      const pendingCount = followUpList.filter(isPending).length;
      const completedCount = followUpList.filter(isCompleted).length;

      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.2,
              py: 0.1,
              borderRadius: "20px",
              bgcolor: "rgba(255,152,0,0.05)",
              border: "1px solid rgba(255,152,0,0.15)",
            }}
          >
            {pendingCount > 0 && (
              <Typography
                sx={{ fontSize: 12, fontWeight: 800, color: "#d32f2f" }}
              >
                {pendingCount}
              </Typography>
            )}
            {pendingCount > 0 && completedCount > 0 && (
              <Typography sx={{ color: "rgba(0,0,0,0.2)", fontSize: 11 }}>
                |
              </Typography>
            )}
            {completedCount > 0 && (
              <Typography
                sx={{ fontSize: 12, fontWeight: 800, color: "#2e7d32" }}
              >
                {completedCount}
              </Typography>
            )}
          </Box>
        </Box>
      );
    },
  },
  {
    field: "receivedBy",
    headerName: "Received By",
    width: 130,
    renderCell: (params) => {
      const receivedBy = params?.value || "";
      const parts = receivedBy?.split(" ");
      const formatted =
        parts?.length > 1
          ? `${parts[0]} ${parts[1][0]?.toUpperCase()}.`
          : parts?.[0];
      return (
        <AvatarPill
          val={receivedBy}
          key={params?.row?.index}
          title={formatted}
        />
      );
    },
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 100,
    renderCell: (params) => <ReadOnlyPriorityCell value={params.value} />,
  },
  {
    field: "forward",
    headerName: "Forward",
    width: 150,
    renderCell: (params) => <ReadOnlyForwardCell row={params.row} />,
  },
  {
    field: "status",
    headerName: "Internal Status",
    width: 150,
    renderCell: (params) => (
      <ReadOnlyStatusCell
        value={params.value}
        row={params.row}
        columnName="Internal Status"
      />
    ),
  },
  {
    field: "ticket",
    headerName: "Ticket",
    width: 160,
    renderCell: (params) => {
      const { row, value } = params;
      if (!row?.receivedBy) return <>-</>;
      const isDone = value === "In Ticket";
      return (
        <Chip
          icon={
            isDone ? (
              <BentoRoundedIcon size={14} color="primary" />
            ) : (
              <LocalActivity fontSize="small" />
            )
          }
          label={value}
          size="small"
          sx={{
            fontSize: "0.7rem",
            height: 22,
            ...(isDone
              ? {
                  background: "linear-gradient(90deg,#E3F2FD 0%,#F1F8FF 100%)",
                  color: "#1565C0",
                  border: "1px solid #BBDEFB",
                }
              : {
                  background: "linear-gradient(90deg,#F9FAFB 0%,#FDFEFE 100%)",
                  color: "#4A4A4A",
                  border: "1px solid #E0E0E0",
                }),
            pointerEvents: "none",
          }}
        />
      );
    },
  },
  {
    field: "Estatus",
    headerName: "Client Status",
    width: 150,
    renderCell: (params) => (
      <ReadOnlyStatusCell
        value={params.value}
        row={params.row}
        columnName="Client Status"
      />
    ),
  },
  {
    field: "CallDuration",
    headerName: "Call Info",
    width: 130,
    renderCell: (params) => {
      const d = params?.row?.CallDuration;
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            gap: 0.2,
          }}
        >
          {d && d !== "00:00:00" ? (
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}
            >
              {d}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>-</Typography>
          )}
        </Box>
      );
    },
  },
  {
    field: "topicRaisedBy",
    headerName: "Source",
    width: 120,
    renderCell: (params) => {
      const sourceVal = params?.row?.topicRaisedBy || "";
      const source = sourceVal.trim().toLowerCase();
      let label = "Csystem",
        backgroundColor = "#DBEAFE",
        color = "#1D4ED8",
        iconSrc = null;
      if (source === "optigocarely") {
        label = "OptigoCarely";
        backgroundColor = "#D1FAE5";
        color = "#065F46";
        iconSrc = optigocarelyIcon;
      } else if (source === "helpdesk") {
        label = "help.optigoapps.com";
        backgroundColor = "#FEF3C7";
        color = "#92400E";
        iconSrc = helpdeskIcon;
      }
      return (
        <Tooltip title={label}>
          <Chip
            label={label}
            size="small"
            avatar={
              iconSrc ? (
                <img
                  src={iconSrc}
                  alt={label}
                  style={{ width: 14, height: 14, borderRadius: "50%" }}
                />
              ) : undefined
            }
            sx={{
              fontSize: "0.65rem",
              height: 20,
              bgcolor: backgroundColor,
              color,
              border: "none",
              pointerEvents: "none",
            }}
          />
        </Tooltip>
      );
    },
  },
  {
    field: "feedback",
    headerName: "Feedback",
    width: 120,
    renderCell: (params) => {
      const { row } = params;
      return row?.rating ? (
        <Rating
          icon={<StarRoundedIcon />}
          emptyIcon={<StarOutlineRoundedIcon />}
          value={row.rating}
          readOnly
          size="small"
          sx={{ "& .MuiRating-iconFilled": { color: "#FFD966" } }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 500,
            color: "#94a3b8",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No Review
        </Typography>
      );
    },
  },
];
