import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Box, Button, Collapse, IconButton, Typography, List, Chip, MenuItem, Menu, Tooltip, Avatar, Paper, Card, CardContent, Grid, Divider, Popover } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { formatTime } from "../../../libs/formatTime";
import { BriefcaseBusiness, X } from "lucide-react";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import { useCallLog } from "../../../context/UseCallLog";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
import CallIcon from "@mui/icons-material/Call";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BusinessIcon from "@mui/icons-material/Business";
import ListItemIcon from "@mui/material/ListItemIcon";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PostCallFeedbackForm from "../CallFaq";
import { useNavigate } from "react-router-dom";
import { PremiumTooltip } from "../../_ui/CustomUI";
import { truncateByWords, truncateByChars } from "../../../libs/data";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import { findCompanyAndClosestOwner } from "../../../libs/helper";

const MuiProps = {
    sx: {
        margin: "0px 4px !important",
        borderRadius: "4px !important",
        fontSize: "16px",
        "&:hover": {
            backgroundColor: "#f0f0f0 !important",
            borderRadius: "4px !important",
        },
    },
};

const CHIP_COLORS = {
    Details: { bg: "#EDE7F6", color: "#5E35B1", hoverBg: "#D1C4E9", activeBg: "#7E57C2", activeColor: "#fff" },
    Customer: { bg: "#E3F2FD", color: "#1565C0", hoverBg: "#BBDEFB", activeBg: "#1976D2", activeColor: "#fff" },
    Edit: { bg: "#E8F5E9", color: "#2E7D32", hoverBg: "#C8E6C9", activeBg: "#43A047", activeColor: "#fff" },
    Add: { bg: "#FFF3E0", color: "#E65100", hoverBg: "#FFE0B2", activeBg: "#EF6C00", activeColor: "#fff" },
    More: { bg: "#FCE4EC", color: "#C2185B", hoverBg: "#F8BBD0", activeBg: "#E91E63", activeColor: "#fff" },
};

const CallRecorderScreen = ({ callStatusValue, onEditToggle, setPostReview, onDetailsToggle, onEditCall, onAddConCurrentCall, onStartCall, isRecordingExpanded, recordingTime, onEndCall, CurrentCall, onCloseRecord, onPause, onResume, isPaused, activeFollowUp, onStartFollowUp }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [FaqModal, setFaqModal] = useState(false);
    const Navigate = useNavigate();
    const [customerAnchorEl, setCustomerAnchorEl] = useState(null);
    const { COMPANY_INFO_MASTER } = useCallLog();
    const collapsibleRef = useRef(null);
    const customerChipRef = useRef(null);
    const moreChipRef = useRef(null);
    const [isManuallyClosed, setIsManuallyClosed] = useState(false);
    const [activeTab, setActiveTab] = useState("Details");
    const [isMinimized, setIsMinimized] = useState(false);

    // FIX: Drive isPanelOpen directly from the prop — no useEffect→setState delay
    // which could miss rapid changes and cause the "stuck" / "not opening" bug.
    // isManuallyClosed lets the X button collapse the panel without touching global state.
    useEffect(() => {
        if (isRecordingExpanded) setIsManuallyClosed(false);
    }, [isRecordingExpanded]);

    const isPanelOpen = isRecordingExpanded && !isManuallyClosed;

    const CompanyInfo = useMemo(() => {
        if (!CurrentCall || !CurrentCall?.company) {
            return null;
        }
        return findCompanyAndClosestOwner(CurrentCall, COMPANY_INFO_MASTER);
    }, [CurrentCall]);

    // Use the stable ref (not event.currentTarget) so Popover/Menu
    // calculates position correctly even inside fixed+pointerEvents:none containers
    const handleClick = () => {
        setAnchorEl(moreChipRef.current);
        setActiveTab("More");
    };

    const handleClose = () => {
        setAnchorEl(null);
        setActiveTab("Details");
    };

    const handleCustomerClick = () => {
        if (customerAnchorEl) {
            setCustomerAnchorEl(null);
            setActiveTab("Details");
        } else {
            setCustomerAnchorEl(customerChipRef.current);
            setActiveTab("Customer");
        }
    };

    const HandleEndCall = () => {
        onEndCall();
        // Do NOT close the panel here per your request!
    };

    const handleFAQ = () => {
        setFaqModal(true);
        setAnchorEl(false);
    };

    const handlePostCallReview = () => {
        setAnchorEl(false);
        setPostReview(true);
    };

    const hasAnalysis = !!CurrentCall?.callAnalysis && Object.keys(CurrentCall.callAnalysis).length > 0;

    const followUpList = useMemo(() => {
        try {
            if (CurrentCall?.FollowUpList) {
                return JSON.parse(CurrentCall.FollowUpList);
            }
        } catch (e) {
            console.error("Error parsing FollowUpList:", e);
        }
        return [];
    }, [CurrentCall?.FollowUpList]);

    const selectedFollowUp = activeFollowUp ? followUpList.find((f) => f.Id === activeFollowUp.followUpCallId) : null;
    const isTimerRunning = recordingTime > 0;
    const isValidDate = (d) => d && typeof d === "string" && !d.startsWith("1900-01-01");
    const isFollowUpCompleted = selectedFollowUp ? isValidDate(selectedFollowUp.CallClosed) || (selectedFollowUp.CallDuration && selectedFollowUp.CallDuration !== "00:00:00") || (isValidDate(selectedFollowUp.CallStart) && !isTimerRunning) : false;

    const isFollowUpActive = !!activeFollowUp && activeFollowUp.callLogId === CurrentCall?.sr && !isFollowUpCompleted;

    const disableCloseBtn = (!CurrentCall?.callStart || (CurrentCall?.callStart && !CurrentCall?.CallDuration) || (CurrentCall?.callClosed && CurrentCall?.CallDuration));

    // ── UI CHANGE 2026-05-07: Replaced tall vertical card with flat horizontal pill bar ──
    // Old: 440px wide column card, 52px avatar, description box, 50px icon buttons with text labels
    // New: ~60px tall pill, inline avatar+info on left, compact 36px icon buttons on right with Tooltips
    // Revert: swap this return block back with the one saved in CHANGELOG.md
    return (
        <>
            {/* TWO-ROW FLAT CARD - fixed bottom center */}
            <Box sx={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 150, pointerEvents: "none", pt: "16px" /* space above for floating chip */ }}>

                {/* ── Minimized pill ── */}
                <Slide direction="up" in={isMinimized && CurrentCall && Object?.keys(CurrentCall).length > 0} mountOnEnter unmountOnExit>
                    <Box
                        onClick={() => setIsMinimized(false)}
                        sx={{
                            pointerEvents: "auto",
                            display: "inline-flex", alignItems: "center", gap: 1.25,
                            bgcolor: "#fff",
                            borderRadius: "100px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.07)",
                            border: "1px solid #e9eef4",
                            px: 2, py: 0.9,
                            cursor: "pointer",
                            minWidth: 180,
                            transition: "box-shadow 0.2s ease",
                            "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.18)" },
                        }}
                    >
                        {/* Status dot */}
                        <Box sx={{
                            width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                            bgcolor: (CurrentCall?.callClosed && !isFollowUpActive) ? "#4caf50" : isPaused ? "#ff9800" : isFollowUpActive ? "#ff9800" : "#ef4444",
                            animation: (!(CurrentCall?.callClosed && !isFollowUpActive) && !isPaused) || (isFollowUpActive && recordingTime > 0 && !isPaused) ? "pulse 1.5s infinite" : "none",
                        }} />
                        {/* Client name */}
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                            {CurrentCall?.callBy}
                        </Typography>
                        {/* Separator dot */}
                        <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#cbd5e1", flexShrink: 0 }} />
                        {/* Timer */}
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: (CurrentCall?.callClosed && !isFollowUpActive) ? "#4caf50" : isPaused ? "#ff9800" : isFollowUpActive ? "#ff9800" : "#334155", whiteSpace: "nowrap" }}>
                            {isFollowUpActive
                                ? (recordingTime > 0 ? formatTime(recordingTime) : "Follow-Up")
                                : (CurrentCall?.callClosed ? "Done" : recordingTime > 0 ? formatTime(recordingTime) : "Ready")
                            }
                        </Typography>
                    </Box>
                </Slide>

                {/* ── Full Card ── */}
                <Slide direction="up" in={isPanelOpen && !isMinimized} mountOnEnter unmountOnExit>
                    <Box ref={customerChipRef} sx={{
                        pointerEvents: "auto",
                        bgcolor: "#fff",
                        borderRadius: "10px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.13), 0 1px 6px rgba(0,0,0,0.07)",
                        border: "1px solid #e9eef4",
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 420,
                        maxWidth: 680,
                        overflow: "visible",
                        position: "relative",
                    }}>
                        {!CurrentCall || Object?.keys(CurrentCall).length === 0 ? (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 2.25, px: 3, gap: 0.75 }}>
                                {/* Icon circle */}
                                <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <CallEndRoundedIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                                </Box>
                                {/* Heading */}
                                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", lineHeight: 1.2 }}>
                                    No active call
                                </Typography>
                                {/* Subtitle */}
                                <Typography sx={{ fontSize: "0.72rem", color: "#cbd5e1", lineHeight: 1 }}>
                                    Waiting for a call to start…
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {/* ── Floating status chip — shows only timer / call status ── */}
                                <Box sx={{
                                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                                    zIndex: 10, display: "inline-flex", alignItems: "center", gap: 0.6,
                                    bgcolor: "#fff", border: "1px solid #e2e8f0",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
                                    borderRadius: "100px", px: 1.25, height: 26, whiteSpace: "nowrap",
                                }}>
                                    <Box sx={{
                                        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                                        bgcolor: (CurrentCall?.callClosed && !isFollowUpActive) ? "#4caf50" : isPaused ? "#ff9800" : isFollowUpActive ? "#ff9800" : "#ef4444",
                                        animation: (!(CurrentCall?.callClosed && !isFollowUpActive) && !isPaused) || (isFollowUpActive && recordingTime > 0 && !isPaused) ? "pulse 1.5s infinite" : "none",
                                    }} />
                                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: (CurrentCall?.callClosed && !isFollowUpActive) ? "#4caf50" : isPaused ? "#ff9800" : isFollowUpActive ? "#ff9800" : "#334155", lineHeight: 1 }}>
                                        {isFollowUpActive
                                            ? (recordingTime > 0 ? formatTime(recordingTime) : "Start Follow-Up")
                                            : (CurrentCall?.callClosed ? "Completed" : recordingTime > 0 ? formatTime(recordingTime) : "Ready to start")
                                        }
                                    </Typography>

                                    {
                                        CurrentCall.CallDuration && !(isFollowUpActive && recordingTime > 0) && (
                                            <>
                                                <Box sx={{
                                                    width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                                                    bgcolor: "gray",
                                                }} />
                                                <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, lineHeight: 1 }}>
                                                    {CurrentCall.CallDuration}
                                                </Typography>

                                            </>
                                        )
                                    }
                                </Box>

                                {/* ── ROW 1: Details ── */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.75, pt: 2.5, pb: 1, pr: 4 }}>
                                    {/* Avatar */}
                                    <Avatar variant="square" sx={{ bgcolor: "#1976d2", width: 45, height: 45, flexShrink: 0, boxShadow: "0 2px 8px rgba(25,118,210,0.22)", borderRadius: 2 }}>
                                        <PersonRoundedIcon sx={{ fontSize: 22 }} />
                                    </Avatar>
                                    {/* Info */}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        {/* Name + Company chip — line 1 */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "nowrap" }}>
                                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                                                {CurrentCall?.callBy}
                                            </Typography>
                                            {CurrentCall?.company && (
                                                <Chip
                                                    icon={<BusinessIcon sx={{ fontSize: "15px !important" }} />}
                                                    label={CurrentCall.company}
                                                    size="small"
                                                    sx={{ bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: 600, fontSize: "0.75rem", height: 21, maxWidth: "150", "& .MuiChip-label": { px: 0.6 } }}
                                                />
                                            )}
                                        </Box>
                                        {/* Description — line 2 (below name+company) */}
                                        {CurrentCall?.description && (
                                            <Typography sx={{
                                                fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.4, mt: 0.4,
                                                overflow: "hidden", display: "-webkit-box",
                                                WebkitBoxOrient: "vertical", WebkitLineClamp: 2,
                                                maxWidth: '350px'
                                            }}>
                                                {CurrentCall.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* ── Thin divider between rows ── */}
                                <Box sx={{ height: "1px", bgcolor: "#f1f5f9", mx: 1.75 }} />

                                {/* ── ROW 2: Action Buttons ── */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 1.25, py: 0.9, gap: 0.5 }}>

                                    {/* Start Call */}
                                    {!CurrentCall?.callStart && !CurrentCall?.callClosed && !isFollowUpActive && (
                                        <Tooltip title="Start Call" placement="top">
                                            <IconButton onClick={() => onStartCall(CurrentCall?.sr)} sx={{ bgcolor: "#2e7d32", color: "#fff", width: 45, height: 45, "&:hover": { bgcolor: "#1b5e20" }, boxShadow: "0 2px 6px rgba(46,125,50,0.32)" }}>
                                                <CallIcon sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {/* Start Follow-Up */}
                                    {isFollowUpActive && recordingTime <= 0 && (
                                        <Tooltip title="Start Follow-Up" placement="top">
                                            <IconButton onClick={() => onStartFollowUp()} sx={{ bgcolor: "#ef6c00", color: "#fff", width: 45, height: 45, "&:hover": { bgcolor: "#e65100" } }}>
                                                <CallIcon sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {/* Pause / Resume */}
                                    {((CurrentCall?.callStart && !CurrentCall?.callClosed) || (isFollowUpActive && recordingTime > 0)) && (
                                        <Tooltip title={isPaused ? "Resume" : "Pause"} placement="top">
                                            <IconButton onClick={isPaused ? onResume : onPause} size="medium" sx={{ bgcolor: "#f1f5f9", color: "#475569", width: 45, height: 45, "&:hover": { bgcolor: "#e2e8f0", color: "#1e293b" } }}>
                                                {isPaused ? <PlayArrowRoundedIcon sx={{ fontSize: 24 }} /> : <PauseRoundedIcon sx={{ fontSize: 24 }} />}
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {/* Edit */}
                                    <Tooltip title="Edit" placement="top">
                                        <IconButton onClick={() => { setActiveTab("Edit"); onEditToggle(); }} size="medium" sx={{ bgcolor: "#f1f5f9", color: "#475569", width: 45, height: 45, "&:hover": { bgcolor: "#e2e8f0", color: "#1e293b" } }}>
                                            <EditRoundedIcon sx={{ fontSize: 24 }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Details */}
                                    <Tooltip title="Details" placement="top">
                                        <IconButton onClick={() => { setActiveTab("Details"); onDetailsToggle(); }} size="medium" sx={{ bgcolor: "#f1f5f9", color: "#475569", width: 45, height: 45, "&:hover": { bgcolor: "#e2e8f0", color: "#1e293b" } }}>
                                            <ArticleRoundedIcon sx={{ fontSize: 24 }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Customer Info button */}
                                    <Tooltip title="Customer Info" placement="top">
                                        <Box component="span" sx={{ display: "inline-flex" }}>
                                            <IconButton onClick={handleCustomerClick} size="medium" sx={{ bgcolor: activeTab === "Customer" ? "#1565c0" : "#f1f5f9", color: activeTab === "Customer" ? "#fff" : "#475569", width: 45, height: 45, "&:hover": { bgcolor: "#e3f2fd", color: "#1976d2" } }}>
                                                <PersonRoundedIcon sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>

                                    {/* More — ref-anchored for Menu */}
                                    <Tooltip title="More" placement="top">
                                        <Box ref={moreChipRef} component="span" sx={{ display: "inline-flex" }}>
                                            <IconButton onClick={handleClick} size="medium" sx={{ bgcolor: "#f1f5f9", color: "#475569", width: 45, height: 45, "&:hover": { bgcolor: "#e2e8f0", color: "#1e293b" } }}>
                                                <MoreVertIcon sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>

                                    {/* End / Done */}
                                    {(CurrentCall?.callClosed && !isFollowUpActive) ? (
                                        <Tooltip title="Call Completed" placement="top">
                                            <IconButton size="medium" sx={{ bgcolor: "#dcfce7", color: "#16a34a", width: 45, height: 45 }}>
                                                <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Tooltip>
                                    ) : ((CurrentCall?.callStart && !CurrentCall?.callClosed) || (isFollowUpActive && recordingTime > 0)) && (
                                        <Tooltip title={isFollowUpActive ? "End Follow-Up" : "End Call"} placement="top">
                                            <IconButton onClick={HandleEndCall} size="medium" sx={{ bgcolor: "#ef4444", color: "#fff", width: 45, height: 45, boxShadow: "0 2px 8px rgba(239,68,68,0.32)", "&:hover": { bgcolor: "#dc2626" } }}>
                                                <CallEndRoundedIcon sx={{ fontSize: 24 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>


                            </>
                        )}

                        {CurrentCall && Object?.keys(CurrentCall)?.length > 0 && (
                            <Tooltip title="Minimize" placement="top">
                                <IconButton
                                    onClick={() => setIsMinimized(true)}
                                    size="medium"
                                    sx={{
                                        position: "absolute", top: 7, right: 34,
                                        color: "#94a3b8",
                                        "&:hover": { color: "#1976d2", bgcolor: "#e3f2fd" },
                                        mr: 1
                                    }}
                                >
                                    <RemoveRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        )}

                        {disableCloseBtn && <IconButton
                            onClick={() => { setIsManuallyClosed(true); onCloseRecord(); }}
                            size="medium"
                            sx={{
                                position: "absolute", top: 6, right: 6,
                                color: "#94a3b8",
                                "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" },
                                pointerEvents: (callStatusValue?.isRunning && !isPaused) ? "none" : "auto",
                                opacity: (callStatusValue?.isRunning && !isPaused) ? 0.4 : 1,
                            }}
                        >
                            <CloseRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>}
                    </Box>
                </Slide>
            </Box>

            <Popover
                open={Boolean(customerAnchorEl)}
                anchorEl={customerAnchorEl}
                onClose={() => {
                    setCustomerAnchorEl(null);
                    setActiveTab("Details");
                }}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "bottom", horizontal: "center" }}
                sx={{ zIndex: 1400 }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                            width: 500,
                            maxHeight: "70vh",
                            overflow: "hidden",
                            transform: "translateY(-20px) !important", // ← negative = moves popover UP (more gap). e.g. -32px for bigger gap
                        },
                    },
                }}
            >
                <CustomerInfoCard
                    data={CompanyInfo}
                    onClose={() => {
                        setCustomerAnchorEl(null);
                        setActiveTab("Details");
                    }}
                />
            </Popover>

            <Menu id="more-menu" anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} transformOrigin={{ vertical: "bottom", horizontal: "center" }} sx={{ zIndex: 1400 }}>
                <Tooltip title={"Coming Soon!"} placement="top">
                    <MenuItem onClick={handleFAQ} {...MuiProps}>
                        <ListItemIcon>
                            <CallIcon fontSize="small" />
                        </ListItemIcon>
                        Call FAQ
                    </MenuItem>
                </Tooltip>
                <MenuItem onClick={handlePostCallReview} {...MuiProps}>
                    <ListItemIcon>
                        <RateReviewIcon fontSize="small" />
                    </ListItemIcon>
                    Post-Call Review
                </MenuItem>
            </Menu>

            <PostCallFeedbackForm open={FaqModal} setOpen={setFaqModal} />

            <style>
                {`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
                `}
            </style>
        </>
    );
};

export default CallRecorderScreen;

const CallQueueUI = ({ onEditCall }) => {
    const { queue } = useCallLog();
    window.__queue = queue;
    const handleCall = (id) => {
        onEditCall(id);
    };
    return (
        <>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", width: "100%", px: 1.5, gap: 1, paddingBottom: "0 !important", paddingTop: "10px" }}>
                <PhoneCallbackRoundedIcon color="success" /> Queue
            </Typography>
            <List sx={{ width: "100%", maxHeight: "41.8vh", overflowY: "auto", paddingInline: "7px", borderBottomRightRadius: "20px", borderBottomLeftRadius: "20px" }}>
                {queue?.map((call) => (
                    <div key={call?.id}>
                        <UserRequestCard appname={call?.appname} company={call?.company} department={call?.department} description={call?.description} name={call?.callBy} date={call?.date} time={call?.time} onAccept={() => handleCall(call?.sr)} />
                    </div>
                ))}
            </List>
        </>
    );
};

const stringToColor = (string) => {
    if (!string) return "#1A73E8";
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
};

const UserRequestCard = ({ name, appname, company, description, date, time, onAccept }) => {
    const truncatedDesc = description?.length > 15 ? `${description?.substring(0, 15)}...` : description;
    const truncatedAppName = appname?.length > 12 ? `${appname?.substring(0, 12)}...` : appname;
    const truncatedCompany = company?.length > 12 ? `${company?.substring(0, 12)}...` : company;

    const displayTime = time ? time : "";
    const displayDate = date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "";
    const fullTimeText = `${displayDate} ${displayTime}`.trim();

    const titleText = (
        <Box sx={{ p: 0.5 }}>
            {company && (
                <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                    <strong>Company:</strong> {company}
                </Typography>
            )}
            {appname && (
                <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                    <strong>App:</strong> {appname}
                </Typography>
            )}
            {description && (
                <Typography sx={{ fontSize: 12 }}>
                    <strong>Description:</strong> {description}
                </Typography>
            )}
        </Box>
    );

    return (
        <PremiumTooltip title={titleText} placement="right" arrow>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, mb: 0.5, borderRadius: 2, transition: "background-color 0.15s ease", cursor: "pointer", backgroundColor: "#fff", overflow: "hidden", "&:hover": { backgroundColor: "#F1F3F4" } }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: stringToColor(name), fontSize: 14, flexShrink: 0 }}>{name ? name.charAt(0).toUpperCase() : "U"}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#202124", lineHeight: 1.2, mb: 0.3 }}>
                        {name || "Unknown"} {company && <Chip sx={{ fontSize: "0.7rem", height: 20 }} title={company} label={truncatedCompany} size="small" />}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: 11, color: "#5F6368", lineHeight: 1.1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {truncatedAppName ? truncatedAppName : company ? truncatedCompany : "No App"} {truncatedDesc ? ` • ${truncatedDesc}` : ""}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ flexShrink: 0, ml: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                    {fullTimeText && <Typography sx={{ fontSize: "0.65rem", color: "#80868b", fontWeight: 500, lineHeight: 1 }}>{fullTimeText}</Typography>}
                    <Button variant="contained" size="small" color="success" onClick={onAccept} sx={{ borderRadius: 1.5, textTransform: "none", minWidth: "auto", px: 1.2, height: "26px", fontWeight: 600, fontSize: "0.7rem", boxShadow: "none" }}>
                        Accept
                    </Button>
                </Box>
            </Box>
        </PremiumTooltip>
    );
};

const CustomerInfoCard = ({ data = null, onClose = () => { } }) => {
    const safeData = data || {};
    const { CompanyName, SignUp = "", Flow = "", owner = "", Package, BusinessType = "", description = "", subscription = {}, advancedFeatures = [], specialFlow = "", integrations = [] } = safeData;

    const Field = ({ label, value }) => {
        const isEmpty = !value || (typeof value === "string" && value.trim() === "");
        return (
            <Box>
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.25 }}>{label}</Typography>
                {isEmpty ? <Typography sx={{ fontSize: "0.78rem", color: "#bdbdbd", fontStyle: "italic" }}>—</Typography> : <Typography sx={{ fontSize: "0.82rem", color: "#1e293b", fontWeight: 500, textTransform: "capitalize", lineHeight: 1.4 }}>{value}</Typography>}
            </Box>
        );
    };

    const SectionDivider = ({ label }) => (
        <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#1976d2", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{label}</Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e3f2fd" }} />
        </Box>
    );

    return (
        <Box sx={{ bgcolor: "#ffffff", borderRadius: 2, overflow: "hidden", width: "100%" }}>
            {/* Header */}
            <Box
                sx={{
                    px: 2,
                    py: 1,
                    bgcolor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <BusinessIcon sx={{ fontSize: 14, color: "#1976d2" }} />
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>{CompanyName || "Customer Profile"}</Typography>
                    {Package && <Chip label={Package} size="small" sx={{ height: 17, fontSize: "0.58rem", fontWeight: 700, bgcolor: "#e3f2fd", color: "#1976d2" }} />}
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" } }}>
                    <CloseRoundedIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Box>

            {/* Body - 2-column compact grid */}
            <Box sx={{ px: 2, py: 1.5, overflowY: "auto", maxHeight: "52vh" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                    <SectionDivider label="Company" />
                    <Field label="Company Name" value={CompanyName} />
                    <Field label="Owner" value={owner} />
                    <Field label="Business Type" value={BusinessType} />
                    <Field label="Signed Up" value={SignUp} />

                    {description && (
                        <Box sx={{ gridColumn: "1 / -1", bgcolor: "#f8fafc", borderRadius: 1.5, px: 1.5, py: 1, border: "1px solid #e2e8f0" }}>
                            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.4 }}>Description</Typography>
                            <Typography sx={{ fontSize: "0.8rem", color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{description}</Typography>
                        </Box>
                    )}

                    <SectionDivider label="Subscription" />
                    <Field label="Subscription Date" value={subscription.subscriptionDate} />
                    <Field label="Last Upgraded" value={subscription.lastUpgradation} />

                    {advancedFeatures.length > 0 && (
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <SectionDivider label="Advanced Features" />
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                                {advancedFeatures.slice(0, 50).map((f, i) => (
                                    <Chip key={i} label={f} size="small" sx={{ height: 20, fontSize: "0.66rem", bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {specialFlow && (
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <SectionDivider label="Special Flow" />
                            <Typography sx={{ fontSize: "0.8rem", color: "#334155", mt: 0.75, lineHeight: 1.5 }}>{specialFlow}</Typography>
                        </Box>
                    )}

                    {Flow && (
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <SectionDivider label="Flow" />
                            <Typography sx={{ fontSize: "0.76rem", color: "#64748b", mt: 0.75, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{truncateByChars(Flow, 600)}</Typography>
                        </Box>
                    )}

                    {integrations.length > 0 && (
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <SectionDivider label="3rd Party Integrations" />
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                                {integrations.slice(0, 50).map((intg, i) => (
                                    <Chip key={i} label={intg} size="small" sx={{ height: 20, fontSize: "0.66rem", bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};















































// import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
// import { Box, Button, Collapse, IconButton, Typography, List, Chip, MenuItem, Menu, Tooltip, Avatar, Paper, Card, CardContent, Grid, Divider, Popover } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import { formatTime } from "../../../libs/formatTime";
// import { BriefcaseBusiness, X } from "lucide-react";
// import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
// import { useCallLog } from "../../../context/UseCallLog";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import EditRoundedIcon from "@mui/icons-material/EditRounded";
// import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
// import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
// import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
// import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
// import CallIcon from "@mui/icons-material/Call";
// import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
// import BusinessIcon from "@mui/icons-material/Business";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import RateReviewIcon from "@mui/icons-material/RateReview";
// import PostCallFeedbackForm from "../CallFaq";
// import { useNavigate } from "react-router-dom";
// import { PremiumTooltip } from "../../_ui/CustomUI";
// import { truncateByWords, truncateByChars } from "../../../libs/data";
// import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
// import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
// import Slide from "@mui/material/Slide";
// import Stack from "@mui/material/Stack";
// import { findCompanyAndClosestOwner } from "../../../libs/helper";

// const MuiProps = {
//     sx: {
//         margin: "0px 4px !important",
//         borderRadius: "4px !important",
//         fontSize: "16px",
//         "&:hover": {
//             backgroundColor: "#f0f0f0 !important",
//             borderRadius: "4px !important",
//         },
//     },
// };

// const CHIP_COLORS = {
//     Details: { bg: "#EDE7F6", color: "#5E35B1", hoverBg: "#D1C4E9", activeBg: "#7E57C2", activeColor: "#fff" },
//     Customer: { bg: "#E3F2FD", color: "#1565C0", hoverBg: "#BBDEFB", activeBg: "#1976D2", activeColor: "#fff" },
//     Edit: { bg: "#E8F5E9", color: "#2E7D32", hoverBg: "#C8E6C9", activeBg: "#43A047", activeColor: "#fff" },
//     Add: { bg: "#FFF3E0", color: "#E65100", hoverBg: "#FFE0B2", activeBg: "#EF6C00", activeColor: "#fff" },
//     More: { bg: "#FCE4EC", color: "#C2185B", hoverBg: "#F8BBD0", activeBg: "#E91E63", activeColor: "#fff" },
// };

// const ActionChip = ({ label, isActive, onClick, disabled, colorKey }) => {
//     const c = CHIP_COLORS[colorKey || label] || CHIP_COLORS.Details;
//     return (
//         <Chip
//             label={label}
//             clickable={!disabled}
//             onClick={onClick}
//             sx={{
//                 height: 32,
//                 fontSize: "0.78rem",
//                 fontWeight: isActive ? 700 : 600,
//                 borderRadius: "100px",
//                 bgcolor: disabled ? "#f0f0f0" : isActive ? c.activeBg : c.bg,
//                 color: disabled ? "#bdbdbd" : isActive ? c.activeColor : c.color,
//                 border: disabled ? "1px solid #e0e0e0" : `1px solid ${isActive ? c.activeBg : c.color}33`,
//                 boxShadow: isActive ? "0 3px 10px rgba(0,0,0,0.22)" : "0 1px 4px rgba(0,0,0,0.1)",
//                 transition: "all 0.18s ease",
//                 "&:hover": { bgcolor: disabled ? "#f0f0f0" : isActive ? c.activeBg : c.hoverBg, transform: "translateY(-1px)" },
//                 opacity: disabled ? 0.55 : 1,
//                 px: 1,
//                 letterSpacing: "0.01em",
//             }}
//         />
//     );
// };
// // ─────────────────────────────────────────────────────────────────────────────

// const CallRecorderScreen = ({ callStatusValue, onEditToggle, setPostReview, onDetailsToggle, onEditCall, onAddConCurrentCall, onStartCall, isRecordingExpanded, recordingTime, onEndCall, CurrentCall, onCloseRecord, onPause, onResume, isPaused, activeFollowUp, onStartFollowUp }) => {
//     const [anchorEl, setAnchorEl] = useState(null);
//     const open = Boolean(anchorEl);
//     const [FaqModal, setFaqModal] = useState(false);
//     const Navigate = useNavigate();
//     const [customerAnchorEl, setCustomerAnchorEl] = useState(null);
//     const { COMPANY_INFO_MASTER } = useCallLog();
//     const collapsibleRef = useRef(null);
//     const customerChipRef = useRef(null);
//     const moreChipRef = useRef(null);
//     const [isManuallyClosed, setIsManuallyClosed] = useState(false);
//     const [activeTab, setActiveTab] = useState("Details");

//     // FIX: Drive isPanelOpen directly from the prop — no useEffect→setState delay
//     // which could miss rapid changes and cause the "stuck" / "not opening" bug.
//     // isManuallyClosed lets the X button collapse the panel without touching global state.
//     useEffect(() => {
//         if (isRecordingExpanded) setIsManuallyClosed(false);
//     }, [isRecordingExpanded]);

//     const isPanelOpen = isRecordingExpanded && !isManuallyClosed;

//     const CompanyInfo = useMemo(() => {
//         if (!CurrentCall || !CurrentCall?.company) {
//             return null;
//         }
//         return findCompanyAndClosestOwner(CurrentCall, COMPANY_INFO_MASTER);
//     }, [CurrentCall]);

//     // Use the stable ref (not event.currentTarget) so Popover/Menu
//     // calculates position correctly even inside fixed+pointerEvents:none containers
//     const handleClick = () => {
//         setAnchorEl(moreChipRef.current);
//         setActiveTab("More");
//     };

//     const handleClose = () => {
//         setAnchorEl(null);
//         setActiveTab("Details");
//     };

//     const handleCustomerClick = () => {
//         if (customerAnchorEl) {
//             setCustomerAnchorEl(null);
//             setActiveTab("Details");
//         } else {
//             setCustomerAnchorEl(customerChipRef.current);
//             setActiveTab("Customer");
//         }
//     };

//     const HandleEndCall = () => {
//         onEndCall();
//         // Do NOT close the panel here per your request!
//     };

//     const handleFAQ = () => {
//         setFaqModal(true);
//         setAnchorEl(false);
//     };

//     const handlePostCallReview = () => {
//         setAnchorEl(false);
//         setPostReview(true);
//     };

//     const hasAnalysis = !!CurrentCall?.callAnalysis && Object.keys(CurrentCall.callAnalysis).length > 0;

//     const followUpList = useMemo(() => {
//         try {
//             if (CurrentCall?.FollowUpList) {
//                 return JSON.parse(CurrentCall.FollowUpList);
//             }
//         } catch (e) {
//             console.error("Error parsing FollowUpList:", e);
//         }
//         return [];
//     }, [CurrentCall?.FollowUpList]);

//     const selectedFollowUp = activeFollowUp ? followUpList.find((f) => f.Id === activeFollowUp.followUpCallId) : null;
//     const isTimerRunning = recordingTime > 0;
//     const isValidDate = (d) => d && typeof d === "string" && !d.startsWith("1900-01-01");
//     const isFollowUpCompleted = selectedFollowUp ? isValidDate(selectedFollowUp.CallClosed) || (selectedFollowUp.CallDuration && selectedFollowUp.CallDuration !== "00:00:00") || (isValidDate(selectedFollowUp.CallStart) && !isTimerRunning) : false;

//     const isFollowUpActive = !!activeFollowUp && activeFollowUp.callLogId === CurrentCall?.sr && !isFollowUpCompleted;

//     const disableCloseBtn = (!CurrentCall?.callStart || (CurrentCall?.callStart && !CurrentCall?.CallDuration) || (CurrentCall?.callClosed && CurrentCall?.CallDuration));

//     return (
//         <>
//             {/* FLOATING PANEL - fixed bottom center, centered card style */}
//             <Box sx={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 150, pointerEvents: "none" }}>
//                 <Slide direction="up" in={isPanelOpen} mountOnEnter unmountOnExit>
//                     <Box sx={{ pointerEvents: "auto", bgcolor: "#fff", borderRadius: 4, boxShadow: "0 8px 40px rgba(0,0,0,0.16), 0 2px 12px rgba(0,0,0,0.08)", p: "24px 28px 20px", width: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, position: "relative", border: "1px solid rgba(0,0,0,0.06)" }}>
//                         {/* Close X */}
//                         {disableCloseBtn && <IconButton onClick={() => { setIsManuallyClosed(true); onCloseRecord(); }} size="small" sx={{
//                             position: "absolute", top: 10, right: 10, color: "#9e9e9e", "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" },
//                             pointerEvents: callStatusValue?.isRunning ? "none" : "auto",
//                             cursor: callStatusValue?.isRunning ? "no-drop" : "default",
//                             opacity: callStatusValue?.isRunning ? 0.6 : 1,
//                         }}>
//                             <CloseRoundedIcon sx={{ fontSize: 18 }} />
//                         </IconButton>}

//                         {!CurrentCall || Object?.keys(CurrentCall).length === 0 ? (
//                             <Typography fontWeight={500} color="text.secondary">No active call at the moment</Typography>
//                         ) : (
//                             <>
//                                 {/* Company chip */}
//                                 {CurrentCall?.company && (
//                                     <Chip icon={<BusinessIcon sx={{ fontSize: "14px !important" }} />} label={CurrentCall.company} size="small" sx={{ bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: 600, fontSize: "0.72rem", height: 24 }} />
//                                 )}

//                                 {/* Avatar + Name */}
//                                 <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
//                                     <Avatar sx={{ bgcolor: "#1976d2", width: 52, height: 52, boxShadow: "0 2px 12px rgba(25,118,210,0.3)" }}>
//                                         <PersonRoundedIcon sx={{ fontSize: 30 }} />
//                                     </Avatar>
//                                     <Typography variant="h6" fontWeight={700} color="#1e293b" sx={{ lineHeight: 1.2, textAlign: "center" }}>
//                                         {CurrentCall?.callBy}
//                                     </Typography>
//                                 </Box>

//                                 {/* Description */}
//                                 {CurrentCall?.description && (
//                                     <Box sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2, px: 2, py: 0.75, width: "100%", textAlign: "center" }}>
//                                         <Typography variant="body2" color="#64748b" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                             {CurrentCall.description}
//                                         </Typography>
//                                     </Box>
//                                 )}

//                                 {/* Status */}
//                                 <Box display="flex" alignItems="center" gap={1}>
//                                     <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: CurrentCall?.callClosed ? "#4caf50" : isPaused ? "#ff9800" : "#ef4444", animation: !CurrentCall?.callClosed && !isPaused ? "pulse 1.5s infinite" : "none" }} />
//                                     <Typography variant="body2" fontWeight={600} color={CurrentCall?.callClosed ? "#4caf50" : isPaused ? "#ff9800" : "#94a3b8"}>
//                                         {CurrentCall?.callClosed ? "Completed" : recordingTime > 0 ? formatTime(recordingTime) : "Start A Call"}
//                                     </Typography>
//                                 </Box>

//                                 {/* Circular icon buttons */}
//                                 <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 0.5 }}>
//                                     {/* Start Call */}
//                                     {!CurrentCall?.callStart && !CurrentCall?.callClosed && !isFollowUpActive && (
//                                         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                             <IconButton onClick={() => onStartCall(CurrentCall?.sr)} sx={{ bgcolor: "#2e7d32", color: "#fff", width: 50, height: 50, "&:hover": { bgcolor: "#1b5e20" }, boxShadow: "0 2px 8px rgba(46,125,50,0.4)" }}><CallIcon /></IconButton>
//                                             <Typography variant="caption" color="text.secondary" fontWeight={500}>Start</Typography>
//                                         </Box>
//                                     )}
//                                     {/* Start Follow-Up */}
//                                     {isFollowUpActive && recordingTime <= 0 && (
//                                         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                             <IconButton onClick={() => onStartFollowUp()} sx={{ bgcolor: "#ef6c00", color: "#fff", width: 50, height: 50, "&:hover": { bgcolor: "#e65100" } }}><CallIcon /></IconButton>
//                                             <Typography variant="caption" color="text.secondary" fontWeight={500}>Start</Typography>
//                                         </Box>
//                                     )}
//                                     {/* Pause / Resume */}
//                                     {((CurrentCall?.callStart && !CurrentCall?.callClosed) || (isFollowUpActive && recordingTime > 0)) && (
//                                         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                             <IconButton onClick={isPaused ? onResume : onPause} sx={{ bgcolor: "#424242", color: "#fff", width: 50, height: 50, "&:hover": { bgcolor: "#212121" } }}>
//                                                 {isPaused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
//                                             </IconButton>
//                                             <Typography variant="caption" color="text.secondary" fontWeight={500}>{isPaused ? "Resume" : "Pause"}</Typography>
//                                         </Box>
//                                     )}
//                                     {/* Edit */}
//                                     <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                         <IconButton onClick={() => { setActiveTab("Edit"); onEditToggle(); }} sx={{ bgcolor: "#424242", color: "#fff", width: 50, height: 50, "&:hover": { bgcolor: "#212121" } }}><EditRoundedIcon /></IconButton>
//                                         <Typography variant="caption" color="text.secondary" fontWeight={500}>Edit</Typography>
//                                     </Box>
//                                     {/* Details */}
//                                     <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                         <IconButton onClick={() => { setActiveTab("Details"); onDetailsToggle(); }} sx={{ bgcolor: "#424242", color: "#fff", width: 50, height: 50, "&:hover": { bgcolor: "#212121" } }}><ArticleRoundedIcon /></IconButton>
//                                         <Typography variant="caption" color="text.secondary" fontWeight={500}>Details</Typography>
//                                     </Box>
//                                     {/* Customer — ref-anchored for Popover */}
//                                     <Box ref={customerChipRef} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                         <IconButton onClick={handleCustomerClick} sx={{ bgcolor: activeTab === "Customer" ? "#1565c0" : "#1976d2", color: "#fff", width: 50, height: 50, "&:hover": { bgcolor: "#1565c0" }, boxShadow: "0 2px 8px rgba(25,118,210,0.3)" }}><PersonRoundedIcon /></IconButton>
//                                         <Typography variant="caption" color="text.secondary" fontWeight={500}>Customer</Typography>
//                                     </Box>
//                                     {/* More — ref-anchored for Menu */}
//                                     <Box ref={moreChipRef} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                         <IconButton onClick={handleClick} sx={{ bgcolor: "#424242", color: "#fff", width: 50, height: 50, "&:hover": { bgcolor: "#212121" } }}><MoreVertIcon /></IconButton>
//                                         <Typography variant="caption" color="text.secondary" fontWeight={500}>More</Typography>
//                                     </Box>
//                                     {/* End / Done */}
//                                     {CurrentCall?.callClosed ? (
//                                         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                             <IconButton sx={{ bgcolor: "#4caf50", color: "#fff", width: 50, height: 50 }}><CheckCircleRoundedIcon /></IconButton>
//                                             <Typography variant="caption" color="text.secondary" fontWeight={500}>Done</Typography>
//                                         </Box>
//                                     ) : CurrentCall?.callStart && (
//                                         <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
//                                             <IconButton onClick={HandleEndCall} sx={{ bgcolor: "#ef4444", color: "#fff", width: 50, height: 50, boxShadow: "0 2px 8px rgba(239,68,68,0.4)", "&:hover": { bgcolor: "#dc2626" } }}><CallEndRoundedIcon /></IconButton>
//                                             <Typography variant="caption" color="text.secondary" fontWeight={500}>End</Typography>
//                                         </Box>
//                                     )}
//                                 </Stack>
//                             </>
//                         )}
//                     </Box>

//                 </Slide>
//             </Box>

//             {/* Customer Info — Popover anchored above Customer chip, no layout shift */}
//             <Popover
//                 open={Boolean(customerAnchorEl)}
//                 anchorEl={customerAnchorEl}
//                 onClose={() => {
//                     setCustomerAnchorEl(null);
//                     setActiveTab("Details");
//                 }}
//                 anchorOrigin={{ vertical: "top", horizontal: "center" }}
//                 transformOrigin={{ vertical: "bottom", horizontal: "center" }}
//                 sx={{ zIndex: 1400 }}
//                 slotProps={{
//                     paper: {
//                         sx: {
//                             borderRadius: 3,
//                             boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
//                             width: 500,
//                             maxHeight: "70vh",
//                             overflow: "hidden",
//                             mb: 1,
//                         },
//                     },
//                 }}
//             >
//                 <CustomerInfoCard
//                     data={CompanyInfo}
//                     onClose={() => {
//                         setCustomerAnchorEl(null);
//                         setActiveTab("Details");
//                     }}
//                 />
//             </Popover>

//             {/* More Menu — opens ABOVE the More chip */}
//             <Menu id="more-menu" anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} transformOrigin={{ vertical: "bottom", horizontal: "center" }} sx={{ zIndex: 1400 }}>
//                 <Tooltip title={"Coming Soon!"} placement="top">
//                     <MenuItem onClick={handleFAQ} {...MuiProps}>
//                         <ListItemIcon>
//                             <CallIcon fontSize="small" />
//                         </ListItemIcon>
//                         Call FAQ
//                     </MenuItem>
//                 </Tooltip>
//                 <MenuItem onClick={handlePostCallReview} {...MuiProps}>
//                     <ListItemIcon>
//                         <RateReviewIcon fontSize="small" />
//                     </ListItemIcon>
//                     Post-Call Review
//                 </MenuItem>
//             </Menu>

//             <PostCallFeedbackForm open={FaqModal} setOpen={setFaqModal} />

//             <style>
//                 {`
//                 @keyframes pulse {
//                     0% { transform: scale(0.95); opacity: 0.8; }
//                     50% { transform: scale(1.2); opacity: 1; }
//                     100% { transform: scale(0.95); opacity: 0.8; }
//                 }
//                 `}
//             </style>
//         </>
//     );
// };

// export default CallRecorderScreen;

// // -------------------------------------------------------------
// // The rest of your components (CallQueueUI, UserRequestCard, CustomerInfoCard)
// // remain EXACTLY the same below this line to ensure everything still works perfectly.
// // -------------------------------------------------------------

// const CallQueueUI = ({ onEditCall }) => {
//     const { queue } = useCallLog();
//     window.__queue = queue;
//     const handleCall = (id) => {
//         onEditCall(id);
//     };
//     return (
//         <>
//             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", width: "100%", px: 1.5, gap: 1, paddingBottom: "0 !important", paddingTop: "10px" }}>
//                 <PhoneCallbackRoundedIcon color="success" /> Queue
//             </Typography>
//             <List sx={{ width: "100%", maxHeight: "41.8vh", overflowY: "auto", paddingInline: "7px", borderBottomRightRadius: "20px", borderBottomLeftRadius: "20px" }}>
//                 {queue?.map((call) => (
//                     <div key={call?.id}>
//                         <UserRequestCard appname={call?.appname} company={call?.company} department={call?.department} description={call?.description} name={call?.callBy} date={call?.date} time={call?.time} onAccept={() => handleCall(call?.sr)} />
//                     </div>
//                 ))}
//             </List>
//         </>
//     );
// };

// const stringToColor = (string) => {
//     if (!string) return "#1A73E8";
//     let hash = 0;
//     for (let i = 0; i < string.length; i += 1) {
//         hash = string.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     let color = "#";
//     for (let i = 0; i < 3; i += 1) {
//         const value = (hash >> (i * 8)) & 0xff;
//         color += `00${value.toString(16)}`.slice(-2);
//     }
//     return color;
// };

// const UserRequestCard = ({ name, appname, company, description, date, time, onAccept }) => {
//     const truncatedDesc = description?.length > 15 ? `${description?.substring(0, 15)}...` : description;
//     const truncatedAppName = appname?.length > 12 ? `${appname?.substring(0, 12)}...` : appname;
//     const truncatedCompany = company?.length > 12 ? `${company?.substring(0, 12)}...` : company;

//     const displayTime = time ? time : "";
//     const displayDate = date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "";
//     const fullTimeText = `${displayDate} ${displayTime}`.trim();

//     const titleText = (
//         <Box sx={{ p: 0.5 }}>
//             {company && (
//                 <Typography sx={{ fontSize: 12, mb: 0.5 }}>
//                     <strong>Company:</strong> {company}
//                 </Typography>
//             )}
//             {appname && (
//                 <Typography sx={{ fontSize: 12, mb: 0.5 }}>
//                     <strong>App:</strong> {appname}
//                 </Typography>
//             )}
//             {description && (
//                 <Typography sx={{ fontSize: 12 }}>
//                     <strong>Description:</strong> {description}
//                 </Typography>
//             )}
//         </Box>
//     );

//     return (
//         <PremiumTooltip title={titleText} placement="right" arrow>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, mb: 0.5, borderRadius: 2, transition: "background-color 0.15s ease", cursor: "pointer", backgroundColor: "#fff", overflow: "hidden", "&:hover": { backgroundColor: "#F1F3F4" } }}>
//                 <Avatar sx={{ width: 32, height: 32, bgcolor: stringToColor(name), fontSize: 14, flexShrink: 0 }}>{name ? name.charAt(0).toUpperCase() : "U"}</Avatar>
//                 <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
//                     <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#202124", lineHeight: 1.2, mb: 0.3 }}>
//                         {name || "Unknown"} {company && <Chip sx={{ fontSize: "0.7rem", height: 20 }} title={company} label={truncatedCompany} size="small" />}
//                     </Typography>
//                     <Box sx={{ display: "flex", flexDirection: "column" }}>
//                         <Typography sx={{ fontSize: 11, color: "#5F6368", lineHeight: 1.1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
//                             {truncatedAppName ? truncatedAppName : company ? truncatedCompany : "No App"} {truncatedDesc ? ` • ${truncatedDesc}` : ""}
//                         </Typography>
//                     </Box>
//                 </Box>
//                 <Box sx={{ flexShrink: 0, ml: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
//                     {fullTimeText && <Typography sx={{ fontSize: "0.65rem", color: "#80868b", fontWeight: 500, lineHeight: 1 }}>{fullTimeText}</Typography>}
//                     <Button variant="contained" size="small" color="success" onClick={onAccept} sx={{ borderRadius: 1.5, textTransform: "none", minWidth: "auto", px: 1.2, height: "26px", fontWeight: 600, fontSize: "0.7rem", boxShadow: "none" }}>
//                         Accept
//                     </Button>
//                 </Box>
//             </Box>
//         </PremiumTooltip>
//     );
// };

// const CustomerInfoCard = ({ data = null, onClose = () => { } }) => {
//     const safeData = data || {};
//     const { CompanyName, SignUp = "", Flow = "", owner = "", Package, BusinessType = "", description = "", subscription = {}, advancedFeatures = [], specialFlow = "", integrations = [] } = safeData;

//     const Field = ({ label, value }) => {
//         const isEmpty = !value || (typeof value === "string" && value.trim() === "");
//         return (
//             <Box>
//                 <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.25 }}>{label}</Typography>
//                 {isEmpty ? <Typography sx={{ fontSize: "0.78rem", color: "#bdbdbd", fontStyle: "italic" }}>—</Typography> : <Typography sx={{ fontSize: "0.82rem", color: "#1e293b", fontWeight: 500, textTransform: "capitalize", lineHeight: 1.4 }}>{value}</Typography>}
//             </Box>
//         );
//     };

//     const SectionDivider = ({ label }) => (
//         <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
//             <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#1976d2", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{label}</Typography>
//             <Box sx={{ flex: 1, height: "1px", bgcolor: "#e3f2fd" }} />
//         </Box>
//     );

//     return (
//         <Box sx={{ bgcolor: "#ffffff", borderRadius: 2, overflow: "hidden", width: "100%" }}>
//             {/* Header */}
//             <Box
//                 sx={{
//                     px: 2,
//                     py: 1,
//                     bgcolor: "#f8fafc",
//                     borderBottom: "1px solid #e2e8f0",
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                 }}
//             >
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
//                     <BusinessIcon sx={{ fontSize: 14, color: "#1976d2" }} />
//                     <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>{CompanyName || "Customer Profile"}</Typography>
//                     {Package && <Chip label={Package} size="small" sx={{ height: 17, fontSize: "0.58rem", fontWeight: 700, bgcolor: "#e3f2fd", color: "#1976d2" }} />}
//                 </Box>
//                 <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" } }}>
//                     <CloseRoundedIcon sx={{ fontSize: 13 }} />
//                 </IconButton>
//             </Box>

//             {/* Body - 2-column compact grid */}
//             <Box sx={{ px: 2, py: 1.5, overflowY: "auto", maxHeight: "52vh" }}>
//                 <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
//                     <SectionDivider label="Company" />
//                     <Field label="Company Name" value={CompanyName} />
//                     <Field label="Owner" value={owner} />
//                     <Field label="Business Type" value={BusinessType} />
//                     <Field label="Signed Up" value={SignUp} />

//                     {description && (
//                         <Box sx={{ gridColumn: "1 / -1", bgcolor: "#f8fafc", borderRadius: 1.5, px: 1.5, py: 1, border: "1px solid #e2e8f0" }}>
//                             <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.4 }}>Description</Typography>
//                             <Typography sx={{ fontSize: "0.8rem", color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{description}</Typography>
//                         </Box>
//                     )}

//                     <SectionDivider label="Subscription" />
//                     <Field label="Subscription Date" value={subscription.subscriptionDate} />
//                     <Field label="Last Upgraded" value={subscription.lastUpgradation} />

//                     {advancedFeatures.length > 0 && (
//                         <Box sx={{ gridColumn: "1 / -1" }}>
//                             <SectionDivider label="Advanced Features" />
//                             <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
//                                 {advancedFeatures.slice(0, 50).map((f, i) => (
//                                     <Chip key={i} label={f} size="small" sx={{ height: 20, fontSize: "0.66rem", bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} />
//                                 ))}
//                             </Box>
//                         </Box>
//                     )}

//                     {specialFlow && (
//                         <Box sx={{ gridColumn: "1 / -1" }}>
//                             <SectionDivider label="Special Flow" />
//                             <Typography sx={{ fontSize: "0.8rem", color: "#334155", mt: 0.75, lineHeight: 1.5 }}>{specialFlow}</Typography>
//                         </Box>
//                     )}

//                     {Flow && (
//                         <Box sx={{ gridColumn: "1 / -1" }}>
//                             <SectionDivider label="Flow" />
//                             <Typography sx={{ fontSize: "0.76rem", color: "#64748b", mt: 0.75, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{truncateByChars(Flow, 600)}</Typography>
//                         </Box>
//                     )}

//                     {integrations.length > 0 && (
//                         <Box sx={{ gridColumn: "1 / -1" }}>
//                             <SectionDivider label="3rd Party Integrations" />
//                             <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
//                                 {integrations.slice(0, 50).map((intg, i) => (
//                                     <Chip key={i} label={intg} size="small" sx={{ height: 20, fontSize: "0.66rem", bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} />
//                                 ))}
//                             </Box>
//                         </Box>
//                     )}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };
// // import React, { useState } from 'react';
// // import {
// //     Box,
// //     Paper,
// //     Slide,
// //     Typography,
// //     Avatar,
// //     IconButton,
// //     Chip,
// //     Stack,
// //     Button
// // } from '@mui/material';

// // // Import necessary rounded icons
// // import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
// // import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
// // import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
// // import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
// // import PauseRoundedIcon from '@mui/icons-material/PauseRounded'; // Added as an extra common call option

// // export default function ActiveCallOverlay({ callStatusValue, onEditToggle, setPostReview, onDetailsToggle, onEditCall, onAddConCurrentCall, onStartCall, isRecordingExpanded, recordingTime, onEndCall, CurrentCall, onCloseRecord, onPause, onResume, isPaused, activeFollowUp, onStartFollowUp }) {
// //     const [isOpen, setIsOpen] = useState(isRecordingExpanded);
// //     const [activeTab, setActiveTab] = useState('Details');

// //     // Your exact 5 tab options
// //     const tabOptions = ['Details', 'Customer', 'History', 'Notes', 'More'];

// //     return (
// //         <>
// //             {/* --- TEST BUTTON --- */}
// //             <Button
// //                 variant="contained"
// //                 onClick={() => setIsOpen(!isOpen)}
// //                 sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
// //             >
// //                 {isOpen ? 'HIDE CALL PANEL' : 'SHOW CALL PANEL'}
// //             </Button>
// //             {/* ------------------- */}

// //             {/* Centering Wrapper */}
// //             <Box
// //                 sx={{
// //                     position: 'fixed',
// //                     bottom: 30, // Hovering slightly higher from bottom
// //                     left: 0,
// //                     width: '100vw',
// //                     display: 'flex',
// //                     justifyContent: 'center',
// //                     zIndex: 1300,
// //                     pointerEvents: 'none',
// //                 }}
// //             >
// //                 <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>

// //                     <Box sx={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>

// //                         {/* SECTION 1: Floating Independent Chips */}
// //                         <Box sx={{ display: 'inline-flex' }}>
// //                             <Stack direction="row" spacing={1.5}>
// //                                 {tabOptions.map((tab) => {
// //                                     const isActive = activeTab === tab;
// //                                     return (
// //                                         <Chip
// //                                             key={tab}
// //                                             label={tab}
// //                                             clickable
// //                                             onClick={() => setActiveTab(tab)}
// //                                             sx={{
// //                                                 px: 1,
// //                                                 py: 2.5, // Makes chips slightly taller/click-friendly
// //                                                 borderRadius: '100px', // Perfectly rounded chips
// //                                                 fontWeight: isActive ? 600 : 500,
// //                                                 bgcolor: isActive ? '#1976d2' : '#ffffff', // MUI Blue or Pure White
// //                                                 color: isActive ? '#ffffff' : '#424242',
// //                                                 boxShadow: isActive ? '0px 4px 10px rgba(25, 118, 210, 0.3)' : '0px 2px 6px rgba(0,0,0,0.08)', // Soft shadow so white chips don't blend into the background
// //                                                 border: 'none',
// //                                                 transition: 'all 0.2s ease',
// //                                                 '&:hover': {
// //                                                     bgcolor: isActive ? '#1565c0' : '#f5f5f5',
// //                                                 }
// //                                             }}
// //                                         />
// //                                     )
// //                                 })}
// //                             </Stack>
// //                         </Box>

// //                         {/* SECTION 2: The Sleek Horizontal Call Pill */}
// //                         <Paper
// //                             elevation={8} // Stronger shadow for the main floating bar
// //                             sx={{
// //                                 borderRadius: '100px', // Perfect pill shape
// //                                 display: 'flex',
// //                                 alignItems: 'center',
// //                                 justifyContent: 'space-between',
// //                                 width: '100%',
// //                                 minWidth: 450,
// //                                 maxWidth: 600,
// //                                 px: 3, // Horizontal padding
// //                                 py: 1.5, // Vertical padding (Keeps it sleek, not boxy)
// //                                 bgcolor: '#ffffff'
// //                             }}
// //                         >
// //                             {/* Left: User Info */}
// //                             <Box display="flex" alignItems="center" gap={2}>
// //                                 <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.2)' }}>
// //                                     <PersonRoundedIcon sx={{ fontSize: 30 }} />
// //                                 </Avatar>
// //                                 <Box>
// //                                     <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2} color="#1e293b">
// //                                         optigo carely
// //                                     </Typography>

// //                                     {/* Timer & Red Dot Alignment */}
// //                                     <Box display="flex" alignItems="center" gap={1} mt={0.3}>
// //                                         <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
// //                                         <Typography variant="body2" color="text.secondary" fontWeight="600">
// //                                             04:12
// //                                         </Typography>
// //                                     </Box>
// //                                 </Box>
// //                             </Box>

// //                             {/* Right: Rounded Action Buttons */}
// //                             <Stack direction="row" spacing={1.5}>
// //                                 {/* Mute Button */}
// //                                 <IconButton
// //                                     sx={{
// //                                         bgcolor: '#f1f5f9',
// //                                         color: '#64748b',
// //                                         width: 44, height: 44,
// //                                         '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' }
// //                                     }}
// //                                 >
// //                                     <MicOffRoundedIcon fontSize="small" />
// //                                 </IconButton>

// //                                 {/* Hold/Pause Button (Optional, common in these UIs) */}
// //                                 <IconButton
// //                                     sx={{
// //                                         bgcolor: '#f1f5f9',
// //                                         color: '#64748b',
// //                                         width: 44, height: 44,
// //                                         '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' }
// //                                     }}
// //                                 >
// //                                     <PauseRoundedIcon fontSize="small" />
// //                                 </IconButton>

// //                                 {/* End Call Button (Prominent Red) */}
// //                                 <IconButton
// //                                     onClick={() => setIsOpen(false)}
// //                                     sx={{
// //                                         bgcolor: '#ef4444', // Bright Red
// //                                         color: '#ffffff',
// //                                         width: 44, height: 44,
// //                                         boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)', // Red glow
// //                                         '&:hover': { bgcolor: '#dc2626' }
// //                                     }}
// //                                 >
// //                                     <CallEndRoundedIcon fontSize="small" />
// //                                 </IconButton>
// //                             </Stack>

// //                         </Paper>
// //                     </Box>
// //                 </Slide>
// //             </Box>

// //             {/* Optional CSS for the pulsing red dot */}
// //             <style>
// //                 {`
// //                 @keyframes pulse {
// //                     0% { transform: scale(0.95); opacity: 0.8; }
// //                     50% { transform: scale(1.2); opacity: 1; }
// //                     100% { transform: scale(0.95); opacity: 0.8; }
// //                 }
// //                 `}
// //             </style>
// //         </>
// //     );
// // }
