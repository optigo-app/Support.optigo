import React from "react";
import {
  Chip,
  Rating,
  MenuItem,
  Menu,
  Tooltip,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
} from "@mui/material";
import optigocarelyIcon from "../../assets/grid/optigocarely.webp";
import helpdeskIcon from "../../assets/grid/help.optigo.svg";
import EscalationMenu from "./Escalation";
import { getStatusColor, getPriorityColor } from "../../libs/data";
import { LocalActivity } from "@mui/icons-material";
import CallDurationPopover from "./durationModal";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
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
import MoveToItask from "./Itask/MoveToItask";
import BentoRoundedIcon from "@mui/icons-material/BentoRounded";
import DescriptionColumn from "./Desc/DescriptionColumn";
import CallType from "./CallType";
import { separateFollowUpsAndForwarded } from "../../utils/callLogUtils";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CallIcon from "@mui/icons-material/Call";
import { openAddFollowUpModal } from "../../rxjs/tableUiStore";


// Localized Cell Components to prevent full-grid re-renders on menu toggle
const PriorityCell = React.memo(
  ({ row, value, PRIORITY_LIST, menuItemStyle, handlePrioritySelect }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (e) => {
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
    };

    const handleClose = (e) => {
      if (e) e.stopPropagation();
      setAnchorEl(null);
    };

    const handleSelect = (optionValue, e) => {
      e.stopPropagation();
      handlePrioritySelect(optionValue, row.id, e, row);
      handleClose();
    };

    const { label, color } = getPriorityColor(value);

    return (
      <>
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
            label={label ? label : "-"}
            color={color}
            size="small"
            sx={{ fontSize: "0.7rem", height: 20 }}
            onClick={handleClick}
          />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          sx={{ mt: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {PRIORITY_LIST?.map((option) => (
            <MenuItem
              selected={option?.label === row?.priority}
              key={option.value}
              sx={menuItemStyle}
              onClick={(e) => handleSelect(option.value, e)}
            >
              {option?.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  },
);

const StatusCell = React.memo(
  ({ row, value, STATUS_LIST, menuItemStyle, handleStatusSelect }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (e) => {
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
    };

    const handleClose = (e) => {
      if (e) e.stopPropagation();
      setAnchorEl(null);
    };

    const handleSelect = (optionValue, e) => {
      e.stopPropagation();
      handleStatusSelect(optionValue, row.id, e, row);
      handleClose();
    };

    const { label, color } = getStatusColor(value);
    const isCompleted = isCompletedStatus(value || row?.status);
    const modifiedDate = getRowModifiedDate(row);

    const chipElement = (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{ fontSize: "0.7rem", height: 20, cursor: "pointer" }}
        onClick={handleClick}
      />
    );

    return (
      <>
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
                  columnName="Status"
                />
              }
            >
              {chipElement}
            </PremiumStatusTooltip>
          ) : (
            chipElement
          )}
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          sx={{ mt: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {STATUS_LIST?.map((option) => (
            <MenuItem
              selected={option?.label === row?.status}
              key={option.value}
              sx={menuItemStyle}
              onClick={(e) => handleSelect(option?.value, e)}
            >
              {option?.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  },
);

const EstatusCell = React.memo(
  ({ row, value, ESTATUS_LIST, menuItemStyle, handleEstatusSelect }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (e) => {
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
    };

    const handleClose = (e) => {
      if (e) e.stopPropagation();
      setAnchorEl(null);
    };

    const handleSelect = (optionValue, e) => {
      e.stopPropagation();
      handleEstatusSelect(optionValue, row.id, e, row);
      handleClose();
    };

    const { label, color } = getStatusColor(value);
    const isCompleted = isCompletedStatus(value || row?.Estatus);
    const modifiedDate = getRowModifiedDate(row);

    const chipElement = (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{ fontSize: "0.7rem", height: 20, cursor: "pointer" }}
        onClick={handleClick}
      />
    );

    return (
      <>
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
                  columnName="Client Status"
                />
              }
            >
              {chipElement}
            </PremiumStatusTooltip>
          ) : (
            chipElement
          )}
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          sx={{ mt: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {ESTATUS_LIST?.map((option) => (
            <MenuItem
              selected={option?.label === row?.Estatus}
              key={option.value}
              sx={menuItemStyle}
              onClick={(e) => handleSelect(option.value, e)}
            >
              {option?.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  },
);

const ForwardCell = React.memo(({ row, value, showNotification }) => {
  const [forwardMenu, setForwardMenu] = React.useState({
    anchor: null,
    id: null,
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setForwardMenu({ anchor: e.currentTarget, id: row.id });
  };

  const handleClose = React.useCallback(() => {
    setForwardMenu({ anchor: null, id: null });
  }, []);

  const { forwardedFollowUps } = React.useMemo(() => {
    return separateFollowUpsAndForwarded(row?.FollowUpList);
  }, [row?.FollowUpList]);

  const forwardedCount = forwardedFollowUps?.length || 0;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            height: "100%",
            cursor: "pointer",
          }}
          onClick={handleClick}
        >
          {value}
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

      <EscalationMenu
        showNotification={showNotification}
        anchorEl={forwardMenu?.anchor}
        data={row}
        id={row.id}
        setAnchorEl={handleClose}
      />
    </>
  );
});

export const getCallColumns = ({
  STATUS_LIST,
  ESTATUS_LIST,
  PRIORITY_LIST,
  menuItemStyle,
  HandleFeedBack,
  HandleTicketUpgrade,
  HandlePreviewTicket,
  onEditCall,
  showNotification,
  handleStatusSelect,
  handleEstatusSelect,
  handlePrioritySelect,
  ToggleAnalysis,
  ToggleFollowUp,
  viewMode,
}) => {
  return [
    {
      field: "index",
      headerName: "Sr",
      width: 50,
      textAlign: "center",
      alignHeader: "center",
      renderCell: (params) => {
        const hasParent = Number(params?.row?.ParentCalllogId) > 0;
        return (
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
        );
      },
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
            {/* Date */}
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
                {date || "-"}
              </Typography>
            </Box>

            {/* Time */}
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
                title={formatCallTime(time) || "-"}
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
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
            }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                  type: "CLIENT",
                  value: topic,
                  client: true,
                }),
              );
              e.dataTransfer.effectAllowed = "move";
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
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
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
      width: 140,
      sortable: false,
      renderHeader: () => {
        return (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              ToggleFollowUp();
            }}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ReplayRoundedIcon sx={{ fontSize: 16, color: "#FF9800" }} />
            Follow-Up
          </Box>
        );
      },
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
          } catch (err) {
            console.error("FollowUpList parse error:", err);
            return [];
          }
        };

        const followUpList = safeParse(params?.row?.FollowUpList);

        const isValidDate = (d) =>
          typeof d === "string" && d && !d.startsWith("1900-01-01");

        const isPending = (fu) =>
          !isValidDate(fu?.CallClosed) &&
          (!fu?.CallDuration || fu?.CallDuration === "00:00:00");

        const isCompleted = (fu) =>
          isValidDate(fu?.CallClosed) ||
          (fu?.CallDuration && fu?.CallDuration !== "00:00:00");

        const pendingList = followUpList.filter(isPending);
        const completedList = followUpList.filter(isCompleted);

        const filteredList =
          viewMode === "followUp-Pending"
            ? pendingList
            : viewMode === "followUp-Completed"
              ? completedList
              : followUpList;

        const pendingCount = pendingList.length;
        const completedCount = completedList.length;

        return (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 0.5,
            }}
          >
            {followUpList.length > 0 ? (
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
                      minWidth: 240,
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
                          color: "#e65100",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        ↻ Follow-ups
                      </Typography>
                      <Box
                        sx={{
                          px: 0.8,
                          py: 0.1,
                          borderRadius: "10px",
                          bgcolor: "rgba(230, 81, 0, 0.1)",
                          color: "#e65100",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                        }}
                      >
                        {followUpList.length}
                      </Box>
                    </Box>

                    {filteredList?.map((fu, idx) => {
                      const isDone = isCompleted(fu);
                      return (
                        <Box
                          key={idx}
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
                              gap: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                color: "#334155",
                              }}
                            >
                              #{fu.Id} {fu.CreatedBy ? `· ${fu.CreatedBy}` : ""}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.68rem",
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
                          {(fu?.Description || fu?.Descr) && (
                            <Typography
                              sx={{
                                fontSize: "0.65rem",
                                color: "#64748b",
                                fontStyle: "italic",
                                whiteSpace: "pre-wrap",
                                bgcolor: "#ffffff",
                                p: 0.5,
                                borderRadius: "4px",
                                border: "1px solid #f1f5f9",
                                mt: 0.2,
                              }}
                            >
                              {fu.Description || fu.Descr}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                }
              >
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    ToggleFollowUp(params.row);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 1.2,
                    py: 0.1,
                    borderRadius: "20px",
                    bgcolor: "rgba(255, 152, 0, 0.05)",
                    border: "1px solid rgba(255, 152, 0, 0.15)",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "rgba(255, 152, 0, 0.12)",
                      border: "1px solid rgba(255, 152, 0, 0.3)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(255, 152, 0, 0.1)",
                    },
                  }}
                >
                  {viewMode !== "followUp-Completed" && pendingCount > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 800, color: "#d32f2f" }}
                      >
                        {pendingCount}
                      </Typography>
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          bgcolor: "#f44336",
                          animation: "pulse 1.5s infinite",
                          "@keyframes pulse": {
                            "0%": { transform: "scale(1)", opacity: 1 },
                            "50%": { transform: "scale(1.5)", opacity: 0.5 },
                            "100%": { transform: "scale(1)", opacity: 1 },
                          },
                        }}
                      />
                    </Box>
                  )}
                  {viewMode !== "followUp-Pending" &&
                    viewMode !== "followUp-Completed" &&
                    pendingCount > 0 &&
                    completedCount > 0 && (
                      <Typography
                        sx={{
                          color: "rgba(0,0,0,0.2)",
                          fontSize: 11,
                          fontWeight: 300,
                        }}
                      >
                        |
                      </Typography>
                    )}
                  {viewMode !== "followUp-Pending" && completedCount > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 800, color: "#2e7d32" }}
                      >
                        {completedCount}
                      </Typography>
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          bgcolor: "#4caf50",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </PremiumTooltip>
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mr: 0.5 }}
              >
                
              </Typography>
            )}

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openAddFollowUpModal(params.row);
              }}
              sx={{
                color: "#f8a71e",
                bgcolor: "rgba(255, 152, 0, 0.08)",
                border: "1px solid rgba(255, 152, 0, 0.2)",
                padding: "0px",
                "&:hover": {
                  bgcolor: "rgba(255, 152, 0, 0.2)",
                },
                transition: "all 0.15s ease",
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
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
        const INdex = params?.row?.index || "";
        const parts = receivedBy?.split(" ");
        const formatted =
          parts?.length > 1
            ? `${parts[0]} ${parts[1][0]?.toUpperCase()}.`
            : parts?.[0];
        return <AvatarPill val={receivedBy} key={INdex} title={formatted} />;
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => (
        <PriorityCell
          row={params.row}
          value={params.value}
          PRIORITY_LIST={PRIORITY_LIST}
          menuItemStyle={menuItemStyle}
          handlePrioritySelect={handlePrioritySelect}
        />
      ),
    },
    {
      field: "forward",
      headerName: "Forward",
      width: 150,
      renderCell: (params) => (
        <ForwardCell
          row={params.row}
          value={params.value}
          showNotification={showNotification}
        />
      ),
    },
    {
      field: "status",
      headerName: "Internal Status",
      width: 150,
      renderCell: (params) => (
        <StatusCell
          row={params.row}
          value={params.value}
          STATUS_LIST={STATUS_LIST}
          menuItemStyle={menuItemStyle}
          handleStatusSelect={handleStatusSelect}
        />
      ),
    },
    {
      field: "ticket",
      headerName: "Ticket",
      width: 160,
      renderCell: (params) => {
        const { row, value } = params;
        const isCallQueue = !row?.receivedBy;
        const isDone = value === "In Ticket";
        if (isCallQueue) {
          return <>-</>;
        }
        return (
          <Chip
            onClick={(e) => {
              e.stopPropagation();
              if (!isDone) {
                HandleTicketUpgrade(params?.row);
              } else {
                return;
              }
            }}
            icon={
              isDone ? (
                <BentoRoundedIcon size={14} color="primary" />
              ) : (
                <LocalActivity fontSize="small" />
              )
            }
            label={params.value}
            size="small"
            sx={{
              fontSize: "0.7rem",
              height: 22,
              ...(isDone
                ? {
                    background:
                      "linear-gradient(90deg, #E3F2FD 0%, #F1F8FF 100%)", // calm blue success
                    color: "#1565C0",
                    border: "1px solid #BBDEFB",
                    boxShadow: "0 1px 4px rgba(21,101,192,0.12)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #E0F0FC 0%, #EFF7FF 100%)",
                      boxShadow: "0 2px 6px rgba(21,101,192,0.18)",
                    },
                  }
                : {
                    background:
                      "linear-gradient(90deg, #F9FAFB 0%, #FDFEFE 100%)", // light warm gray
                    color: "#4A4A4A",
                    border: "1px solid #E0E0E0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #F6F8FA 0%, #FBFCFD 100%)",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                    },
                  }),
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
        <EstatusCell
          row={params.row}
          value={params.value}
          ESTATUS_LIST={ESTATUS_LIST}
          menuItemStyle={menuItemStyle}
          handleEstatusSelect={handleEstatusSelect}
        />
      ),
    },

    {
      field: "CallDuration",
      headerName: "Call Info",
      width: 130,
      renderCell: (params) => {
        return (
          <CallDurationPopover
            onEditCall={onEditCall}
            key={params?.id}
            value={params}
          />
        );
      },
      renderHeader: (params) => {
        return (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              ToggleAnalysis();
            }}
          >
            Call Info
          </Box>
        );
      },
    },

    {
      field: "CallType",
      headerName: "Call Type",
      width: 150,
      renderCell: (params) => {
        return <CallType params={params} />;
      },
    },
    {
      field: "TaskId",
      headerName: "Move to iTask",
      width: 170,
      sortable: false,
      align: "center",
      renderCell: (params) => {
        return <MoveToItask params={params} />;
      },
    },
    {
      field: "feedback",
      headerName: "Feedback",
      width: 120,
      renderCell: (params) => {
        const { row } = params;
        const hasRating = !!row?.rating;

        return (
          <>
            {hasRating ? (
              <Chip
                icon={
                  <Rating
                    icon={<StarRoundedIcon />}
                    emptyIcon={<StarOutlineRoundedIcon />}
                    value={row.rating}
                    readOnly
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#FFD966", // soft warm yellow
                      },
                      "& .MuiRating-iconEmpty": {
                        color: "#FFE8A0", // lighter empty star
                      },
                    }}
                  />
                }
                label=""
                color="primary"
                size="small"
                sx={{
                  bgcolor: "transparent",
                  fontSize: "0.7rem",
                  height: 20,
                  "& .MuiChip-icon": {
                    ml: "12px !important",
                  },
                  "&:hover": {
                    bgcolor: "transparent",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  HandleFeedBack(e.currentTarget, row);
                }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: "#94a3b8",
                  textAlign: "center",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                No Review
              </Typography>
            )}
          </>
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

        let label = "Csystem";
        let descriptionText = "This call was created internally by Csystem";
        let iconSrc = null;
        let backgroundColor = "#DBEAFE"; // soft blue
        let color = "#1D4ED8";

        if (source === "optigocarely") {
          label = "OptigoCarely";
          descriptionText = "This call was raised by OptigoCarely";
          iconSrc = optigocarelyIcon;
          backgroundColor = "#D1FAE5"; // soft green
          color = "#065F46";
        } else if (source === "helpdesk") {
          label = "help.optigoapps.com";
          descriptionText = "This call was raised by help.optigoapps.com";
          iconSrc = helpdeskIcon;
          backgroundColor = "#FEF3C7"; // soft amber/yellow
          color = "#92400E";
        }

        return (
          <Tooltip
            title={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Top Section: Icon Header */}
                <Box
                  sx={{
                    bgcolor: backgroundColor,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 1.5,
                    px: 3,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      p: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={label}
                        style={{
                          width: "28px",
                          height: "28px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <BusinessRoundedIcon
                        sx={{ fontSize: 28, color: color }}
                      />
                    )}
                  </Box>
                </Box>
                {/* Bottom Section: Text Details */}
                <Box sx={{ p: 1.2, textAlign: "left" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: "#fff",
                      fontSize: "0.8rem",
                      mb: 0.3,
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#D1D5DB",
                      fontSize: "0.7rem",
                      lineHeight: 1.2,
                      display: "block",
                    }}
                  >
                    {descriptionText}
                  </Typography>
                </Box>
              </Box>
            }
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  padding: 0,
                  bgcolor: "#111827",
                  boxShadow:
                    "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.15)",
                  maxWidth: 200,
                },
              },
            }}
          >
            <Chip
              size="small"
              label={label}
              sx={{
                fontSize: "0.7rem",
                height: 22,
                fontWeight: 500,
                backgroundColor: backgroundColor,
                color: color,
              }}
            />
          </Tooltip>
        );
      },
    },
  ];
};

// OptigoCarely

// const columns = [
//     { field: "index", headerName: "Sr", width: 70 },
//     { field: "date", headerName: "Date", width: 130 },
//     { field: "company", headerName: "Company", width: 150 },
//     { field: "callBy", headerName: "Call By", width: 150 },
//     { field: "appname", headerName: "AppName", width: 150 },
//     { field: "description", headerName: "Description", width: 150 },
//     { field: "receivedBy", headerName: "Received By", width: 150 },
//     { field: "time", headerName: "Time", width: 150 },
//     {
//       field: "forward",
//       headerName: "Forward [L1 ,L2 ,L3]",
//       width: 300,
//       renderCell: (params) => {
//         return (
//           <>
//             <Tooltip placement="top" title={params?.value}>
//               <Chip
//                 label={params?.value}
//                 size="small"
//                 sx={{ fontSize: "0.7rem", height: 20, borderRadius: "2px" }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setForwardMenu({
//                     anchor: e.currentTarget,
//                     id: params?.row?.id,
//                   });
//                 }}
//               />
//             </Tooltip>
//             <EscalationMenu showNotification={showNotification} anchorEl={ForwardMenu?.anchor} data={params?.row} id={ForwardMenu?.id} setAnchorEl={setForwardMenu} />
//           </>
//         );
//       },
//     },
//     {
//       field: "status",
//       headerName: "Internal Status",
//       width: 150,
//       renderCell: (params) => {
//         const { label, color } = getStatusColor(params?.value);
//         return (
//           <>
//             <Chip label={label} color={color} size="small" sx={{ fontSize: "0.7rem", height: 20 }} onClick={(e) => handleStatusChipClick(e, params.row.id)} />
//             <Menu anchorEl={statusAnchorEl} open={statusMenuOpen && selectedStatusRowId === params.row.id} onClose={() => setStatusMenuOpen(false)} sx={{ mt: 1 }}>
//               {STATUS_LIST?.map((option) => (
//                 <MenuItem selected={option?.label === params?.row?.status} key={option.value} sx={menuItemStyle} onClick={(e) => handleStatusSelect(option?.value, params.row.id, e, params?.row)}>
//                   {option?.label}
//                 </MenuItem>
//               ))}
//             </Menu>
//           </>
//         );
//       },
//     },
//     {
//       field: "Estatus",
//       headerName: "External Status",
//       width: 150,
//       renderCell: (params) => {
//         const { label, color } = getStatusColor(params?.value);
//         return (
//           <>
//             <Chip label={label} color={color} size="small" sx={{ fontSize: "0.7rem", height: 20 }} onClick={(e) => handleEstatusChipClick(e, params.row.id)} />
//             <Menu anchorEl={estatusAnchorEl} open={estatusMenuOpen && selectedEstatusRowId === params.row.id} onClose={() => setEstatusMenuOpen(false)} sx={{ mt: 1 }}>
//               {ESTATUS_LIST?.map((option) => (
//                 <MenuItem selected={option?.label === params?.row?.Estatus} key={option.value} sx={menuItemStyle} onClick={(e) => handleEstatusSelect(option.value, params.row.id, e, params?.row)}>
//                   {option?.label}
//                 </MenuItem>
//               ))}
//             </Menu>
//           </>
//         );
//       },
//     },
//     {
//       field: "feedback",
//       headerName: "Feedback",
//       width: 150,
//       renderCell: (params) => {
//         const isRating = !!params?.row?.rating ? "Done" : "Send";
//         return (
//           // Tooltip placement="top" title={"This feature will be available soon !!"}
//           <>
//             <Chip
//               onClick={(e) => {
//                 e.stopPropagation();
//                 if (isRating == "Done") {
//                   HandleFeedBack(e.currentTarget, params?.row);
//                 }
//               }}
//               icon={isRating !== "Send" ? <PendingActionsRoundedIcon fontSize="small" /> : <WandSparkles size={10} />}
//               label={isRating}
//               color={isRating !== "Send" ? "success" : "secondary"}
//               size="small"
//               sx={{ fontSize: "0.7rem", height: 20 }}
//             />
//           </>
//         );
//       },
//     },
//     {
//       field: "rating",
//       headerName: "Rating",
//       width: 150,
//       renderCell: (params) => <Rating value={params.value} readOnly size="small" />,
//     },
//     {
//       field: "topicRaisedBy",
//       headerName: "Source",
//       width: 150,
//       renderCell: (params) => {
//         const source = params?.row?.topicRaisedBy?.toLowerCase();
//         const isClient = source === "client";

//         const label = isClient ? "Client" : "Optigo";
//         const tooltipText = isClient ? "This call was raised by the client" : "This call was created internally by Optigo";

//         return (
//           <Tooltip title={tooltipText} placement="top">
//             <Chip
//               size="small"
//               icon={isClient ? <PersonRoundedIcon sx={{ fontSize: 14 }} /> : <BusinessRoundedIcon sx={{ fontSize: 14 }} />}
//               label={label}
//               sx={{
//                 fontSize: "0.7rem",
//                 height: 22,
//                 fontWeight: 500,
//                 backgroundColor: isClient ? "#EDE9FE" : "#DBEAFE", // modern soft purple/blue
//                 color: isClient ? "#6D28D9" : "#1D4ED8", // deep accent text
//                 "& .MuiChip-icon": {
//                   color: isClient ? "#6D28D9" : "#1D4ED8",
//                   marginLeft: "4px",
//                 },
//               }}
//             />
//           </Tooltip>
//         );
//       },
//     },
//     {
//       field: "priority",
//       headerName: "Priority",
//       width: 150,
//       renderCell: (params) => {
//         const { label, color } = getPriorityColor(params.value);
//         return (
//           <>
//             <Chip label={label ? label : "-"} color={color} size="small" sx={{ fontSize: "0.7rem", height: 20 }} onClick={(e) => handlePriorityChipClick(e, params.row.id)} />
//             <Menu anchorEl={priorityAnchorEl} open={priorityMenuOpen && selectedPriorityRowId === params.row.id} onClose={() => setPriorityMenuOpen(false)} sx={{ mt: 1 }}>
//               {PRIORITY_LIST?.map((option) => (
//                 <MenuItem key={option?.value} sx={menuItemStyle} selected={option?.label === params?.row?.priority} onClick={(e) => handlePrioritySelect(option?.value, params.row.id, e, params?.row)}>
//                   {option?.label}
//                 </MenuItem>
//               ))}
//             </Menu>
//           </>
//         );
//       },
//     },
//     {
//       field: "callStart",
//       headerName: "Call Start",
//       width: 150,
//       renderCell: (params) => {
//         return params.value ? (
//           params.value
//         ) : (
//           <IconButton
//             onClick={(e) => {
//               e.stopPropagation();
//               onEditCall(params.row.id);
//             }}
//             color="success"
//           >
//             <PhoneCall />
//           </IconButton>
//         );
//       },
//     },
//     { field: "callClosed", headerName: "Call Closed", width: 150 },
//     {
//       field: "CallDuration",
//       headerName: "Call Duration",
//       width: 150,

//       renderCell: (params) => {
//         return <CallDurationPopover key={params?.id} value={params} />;
//       },
//     },
//     { field: "callDetails", headerName: "Call Details", width: 150 },
//     // {
//     //   field: "callAnalysis",
//     //   headerName: "Call Analysis",
//     //   width: 100,

//     //   renderCell: (params) => {
//     //     const { label, color } = getStatusColor(params.value);
//     //     return (
//     //       <Tooltip placement="top" title={"This feature will be available soon !!"}>
//     //         <Chip
//     //           onClick={(e) => {
//     //             e.stopPropagation();
//     //             onCallAnalysis({ ...params.row });
//     //           }}
//     //           icon={label === "Pending" ? <PendingActionsRoundedIcon fontSize="small" /> : <WandSparkles size={10} />}
//     //           label={label}
//     //           color={color}
//     //           size="small"
//     //           sx={{ fontSize: "0.7rem", height: 20 }}
//     //         />
//     //       </Tooltip>
//     //     );
//     //   },
//     // },
//     {
//       field: "ticket",
//       headerName: "Ticket",
//       width: 160,
//       // valueGetter: (params) => (params.row?.ticket !== "" ? "Done" : "Upgrade to Ticket"),
//       renderCell: (params) => {
//         const isDone = params.value === "Done";
//         return (
//           <Tooltip placement="top" title={"This feature will be available soon !!"}>
//             <Chip
//               onClick={(e) => {
//                 e.stopPropagation();
//                 if (!isDone) {
//                   HandleTicketUpgrade(params?.row);
//                 } else {
//                   HandlePreviewTicket(params?.row?.id);
//                 }
//               }}
//               icon={isDone ? <CheckCircle size={14} style={{ color: "#4caf50" }} /> : <LocalActivity fontSize="small" />}
//               label={params.value}
//               color={isDone ? "success" : "default"}
//               size="small"
//               sx={{ fontSize: "0.7rem", height: 22 }}
//             />
//           </Tooltip>
//         );
//       },
//     },
//   ];
