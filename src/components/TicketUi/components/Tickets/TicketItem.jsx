import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  ListItem,
  Checkbox,
  Chip,
  Tooltip,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { FormatTime } from "../../../../libs/formatTime";
import { useTicket } from "../../../../context/useTicket";
import {
  DataParser,
  GetTicketStatusStyle,
} from "../../../../utils/ticketUtils";
import { useAuth } from "../../../../context/UseAuth";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { LiaComment } from "react-icons/lia";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumberRounded";
import CallRounded from "@mui/icons-material/CallRounded";
import { CheckCircleIcon } from "lucide-react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { PremiumTooltip } from "../../../_ui/CustomUI";
import dayjs from "dayjs";

const PriorityChip = styled(Box)(({ color }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  borderRadius: "50%",
  backgroundColor: color,
}));

const CommentPreviewTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} arrow />
))(({ theme }) => ({
  "& .MuiTooltip-tooltip": {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    backdropFilter: "blur(20px)",
    color: "#0F172A",
    fontSize: 12.5,
    borderRadius: 14,
    boxShadow:
      "0 20px 40px -8px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    padding: 0,
    maxWidth: 340,
    border: "1px solid rgba(0, 0, 0, 0.08)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  },
  "& .MuiTooltip-arrow": {
    color: "rgba(255, 255, 255, 0.96)",
    "&::before": {
      border: "1px solid rgba(0, 0, 0, 0.08)",
      boxSizing: "border-box",
    },
  },
}));

const TicketItem = ({ selectedTicket, onTicketSelect, ticket }) => {
  const [Star, setStar] = useState(
    ticket?.star === true || ticket?.star === "true",
  );
  const { updateTicket } = useTicket();
  const { user } = useAuth();

  //   "OrderId": 31,
  // "Order_CreatedDate": "2025-10-10 16:30:29",

  const { bgColor, textColor } = GetTicketStatusStyle(ticket?.Status);

  const handleStarChange = (data, id) => {
    const isStarred = data === true || data === "true";
    setStar(isStarred);
    updateTicket(id, { Star: isStarred });
  };

  useEffect(() => {
    setStar(ticket?.star === true || ticket?.star === "true");
  }, [ticket]);

  const CommentCount = DataParser(ticket?.comments).length;

  const parsedComments = DataParser(ticket?.comments || "").data || [];
  const sortedComments = [...parsedComments].sort(
    (a, b) => new Date(b?.time) - new Date(a?.time),
  );
  // Find the latest comment that has a non-empty message, defaulting to the newest if none found
  const latestComment =
    sortedComments.find((c) => c?.message && c.message.trim() !== "") ||
    sortedComments[0] ||
    null;

  const formatCommenterName = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
    }
    return name;
  };

  const renderTooltipContent = () => {
    if (!latestComment) {
      return (
        <Box sx={{ p: 1.75, display: "flex", alignItems: "center", gap: 1.25 }}>
          <LiaComment style={{ fontSize: 18, color: "#94A3B8" }} />
          <Typography
            sx={{
              color: "#64748B",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            No comments on this ticket yet
          </Typography>
        </Box>
      );
    }

    const commenterName = formatCommenterName(latestComment.Name) || "User";
    const initials = (commenterName[0] || "U").toUpperCase();
    const isClient = latestComment?.Role === "Client";

    return (
      <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {/* Header: Avatar, Name, Role Badge, Time */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 26,
                height: 26,
                fontSize: "11px",
                fontWeight: 700,
                bgcolor: isClient ? "#4F46E5" : "#0EA5E9",
                color: "#FFFFFF",
                borderRadius: "50%",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 650,
                    color: "#0F172A",
                    fontSize: 12.5,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {commenterName}
                </Typography>
                <Chip
                  label={latestComment.Role || "Comment"}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: "9.5px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    bgcolor: isClient ? "rgba(79, 70, 229, 0.08)" : "rgba(14, 165, 233, 0.08)",
                    color: isClient ? "#4338CA" : "#0369A1",
                    borderRadius: "4px",
                    px: 0.2,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Typography
            sx={{
              color: "#94A3B8",
              fontSize: 10.5,
              fontWeight: 500,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {FormatTime(latestComment.time, "datetime")}
          </Typography>
        </Box>

        {/* Message Bubble (Apple style) */}
        <Box
          sx={{
            bgcolor: isClient ? "rgba(99, 102, 241, 0.05)" : "rgba(241, 245, 249, 0.8)",
            border: `1px solid ${isClient ? "rgba(99, 102, 241, 0.12)" : "rgba(0, 0, 0, 0.05)"}`,
            borderRadius: "10px",
            p: 1.25,
          }}
        >
          <Typography
            sx={{
              color: "#1E293B",
              fontSize: 12,
              lineHeight: 1.45,
              whiteSpace: "pre-line",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {latestComment.message}
          </Typography>
        </Box>

        {/* Footer: Thread summary */}
        {CommentCount > 1 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 0.5,
              borderTop: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.5,
                color: "#64748B",
                fontWeight: 500,
              }}
            >
              💬 {CommentCount} comments in conversation
            </Typography>
            <Typography
              sx={{
                fontSize: 10.5,
                color: "#4F46E5",
                fontWeight: 600,
              }}
            >
              Click to view
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <CommentPreviewTooltip
      title={renderTooltipContent()}
      placement="right"
      interactive
      enterDelay={750}
      leaveDelay={200}
    >
      <ListItem
        disablePadding
        sx={{
          display: "flex",
          alignItems: "stretch", // make children stretch vertically
          backgroundImage:
            selectedTicket?.TicketNo === ticket?.TicketNo
              ? "linear-gradient(135deg, rgba(178,6,155,0.1), rgba(57,9,194,0.1))"
              : "none",
          borderRight:
            selectedTicket?.TicketNo === ticket?.TicketNo
              ? "4px solid #7808AE"
              : "4px solid transparent",
          "&:hover": {
            backgroundImage:
              selectedTicket?.TicketNo === ticket?.TicketNo
                ? "linear-gradient(135deg, rgba(178,6,155,0.1), rgba(57,9,194,0.1))"
                : "linear-gradient(135deg, rgba(178,6,155,0.05), rgba(57,9,194,0.05))",
          },
          cursor: "pointer",
          transition: "all .2s ease-in-out",
        }}
        onClick={() => onTicketSelect(ticket)}
      >
        {ticket?.Status === "Closed" && (
          <Box
            sx={{
              width: 30,
              background:
                "linear-gradient(95deg, #FFDFDC 0%,rgb(255, 125, 125) 100%)", // soft premium red gradient
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              height: "auto",
              gap: 1,
            }}
          >
            <ConfirmationNumberIcon
              fontSize="small"
              sx={{
                transform: "rotate(90deg)",
                rotate: "90deg",
              }}
            />
            CLOSED
          </Box>
        )}

        <Box sx={{ flex: 1, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "medium",
                color: "#172B4D",
                flex: 1,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                whiteSpace: "normal",
              }}
              fontSize={14}
            >
              {ticket?.MainSubject || ticket?.subject}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "#6B778C",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {FormatTime(ticket?.CreatedOn, "shortDate")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* <Tooltip title={`Only Admin can Star Tickets`}> */}
            <Checkbox
              onClick={(e) => e.stopPropagation()}
              // disabled={user?.designation !== "Admin"}
              onChange={(e) =>
                handleStarChange(e.target.checked, ticket?.TicketNo)
              }
              size="small"
              icon={<StarBorderRoundedIcon fontSize="medium" />}
              checkedIcon={<StarRoundedIcon fontSize="medium" />}
              sx={{ p: 0, mr: 1 }}
              checked={Star}
            />
            {/* </Tooltip> */}
            <Typography
              fontSize={13}
              variant="body2"
              sx={{ color: "#6B778C", mr: 1 }}
            >
              {ticket?.TicketNo}
            </Typography>

            <Typography
              fontSize={13}
              variant="body2"
              sx={{ color: "#6B778C", mr: 1 }}
            >
              <Chip
                icon={<BusinessRoundedIcon fontSize="small" />}
                label={ticket?.companyname}
                variant="filled"
                color="default"
                sx={{
                  fontSize: "12px",
                  height: 24,
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#56565614",
                }}
              />
            </Typography>

            <Box
              sx={{ display: "flex", alignItems: "center", ml: "auto", gap: 1 }}
            >
              {/* Priority Chips with Tooltips */}
              {ticket?.Priority === "High" && (
                <Tooltip title="High Priority" arrow>
                  <Box>
                    <PriorityChip color="#FF5630">
                      <PriorityHighIcon sx={{ color: "white", fontSize: 15 }} />
                    </PriorityChip>
                  </Box>
                </Tooltip>
              )}

              {ticket?.Priority === "Medium" && (
                <Tooltip title="Medium Priority" arrow>
                  <Box>
                    <PriorityChip color="#FFAB00">
                      <ErrorOutlineIcon sx={{ color: "white", fontSize: 15 }} />
                    </PriorityChip>
                  </Box>
                </Tooltip>
              )}

              {/* Comment Count Chip with Tooltip */}
              {CommentCount > 0 && (
                <Tooltip title={`${CommentCount} Comments`} arrow>
                  <Chip
                    label={`${CommentCount}`}
                    color="primary"
                    icon={<LiaComment fontSize={"18px"} />}
                    sx={{
                      border: "none",
                      height: 23,
                    }}
                  />
                </Tooltip>
              )}
              {!!ticket?.CallId && (
                <Tooltip
                  title={` This ticket was upgraded from Call Log #${ticket.CallId}`}
                  arrow
                  placement="top"
                >
                  <Chip
                    icon={
                      <CallRounded
                        fontSize="small"
                        sx={{
                          fontSize: "16px",
                        }}
                      />
                    }
                    variant="filled"
                    sx={{
                      height: 24,
                      width: 24,
                      borderRadius: 25,
                      bgcolor: "#16C47F",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "#12B370",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      },
                      "& .MuiChip-icon": {
                        color: "#fff",
                        m: 0,
                      },
                      "& .MuiChip-label": { display: "none" },
                      px: 0,
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.9,
              mt: 0.5,
            }}
          >
            {ticket?.Status && (
              <Chip
                label={`Status: ${ticket?.Status}`}
                size="small"
                sx={{
                  backgroundColor: bgColor,
                  color: textColor,
                  fontWeight: 500,
                  fontSize: "11px",
                  height: 22,
                }}
              />
            )}
            {ticket?.OrderId ? (
              <PremiumTooltip
                title={
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}
                  >
                    <Typography
                      sx={{ fontSize: 12, fontWeight: 700, color: "#1b5e20" }}
                    >
                      Moved to Order Request
                    </Typography>

                    {/* <Typography sx={{ fontSize: 11 }}>
                      Order ID: <b>#{ticket.OrderId}</b>
                    </Typography> */}

                    {ticket?.Order_CreatedDate && (
                      <Typography sx={{ fontSize: 11, color: "#6b7280" }}>
                        {`Moved on ${dayjs(ticket.Order_CreatedDate).format("DD MMM YYYY, hh:mm A")}`}
                      </Typography>
                    )}
                  </Box>
                }
              >
                <Chip
                  label={"Moved to Order Request."}
                  // #${ticket.OrderId}
                  size="small"
                  icon={
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 12 }}
                      color="success"
                    />
                  }
                  sx={{
                    background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
                    color: "#1b5e20",
                    fontWeight: 600,
                    fontSize: "11px",
                    height: 22,
                    borderRadius: "12px",
                    border: "1px solid #a5d6a7",
                    "& .MuiChip-icon": {
                      marginLeft: "2px", // 👈 your style here
                    },
                    "&:hover": {
                      background: "linear-gradient(135deg, #dcedc8, #a5d6a7)",
                    },
                  }}
                />
              </PremiumTooltip>
            ) : null}

            {/* {ticket?.instruction &&
              ticket?.instruction?.split(/[/|,]+/)?.map((person, index) => (
                <Chip
                  key={index}
                  label={`${person}`}
                  size="small"
                  sx={{
                    backgroundColor: "#E3F2FD",
                    color: "#1E88E5",
                    fontSize: "11px",
                    fontWeight: 500,
                    height: 20,
                  }}
                />
              ))} */}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              mt: 0.5,
            }}
          >
            {ticket?.instruction && (
              <Typography
                variant="body2"
                fontSize={13}
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",

                  // ✅ these fix long unbroken strings
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  whiteSpace: "normal",
                }}
              >
                {ticket.instruction}
              </Typography>
            )}
          </Box>
        </Box>
      </ListItem>
    </CommentPreviewTooltip>
  );
};

export default React.memo(TicketItem);
