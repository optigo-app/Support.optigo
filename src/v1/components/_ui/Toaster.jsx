import React, { useState } from "react";
import { Box, Paper, Typography, Button, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import PermPhoneMsgRoundedIcon from "@mui/icons-material/PermPhoneMsgRounded";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import { motion, AnimatePresence } from "framer-motion";
import { toast as sonnerToast } from "sonner";
import { useCallLog } from "../../context/UseCallLog";
import { useTicket } from "../../context/useTicket";
import { useNavigate } from "react-router-dom";
import { appChannel } from "../../utils/broadcast";
import IncomingCallModal from "../CallLogger/Runinng/IncomingCallDialog";

export function toast({ title, description, data }) {
    return sonnerToast.custom((id) => <NotificationToast id={id} title={title} description={description} data={data} />, {
    });
}

export function NotificationToast({ id, title, description, data }) {
    const { setCurrentCall } = useCallLog();
    const { setSelectedTicket } = useTicket();
    const navigate = useNavigate();
    const [open, setOpen] = useState(null);

    const isCall = data?.group === "CALL";
    const isTicket = data?.group === "TICKET";

    const handleDismiss = () => sonnerToast.dismiss(id);

    const handleOpen = () => {
        if (data?.topicRaisedBy === "client") {
            setOpen(data);
        }
        if (isTicket) {
            setSelectedTicket(data);
            navigate("/ticket");
            handleDismiss();
        }
    };

    return (
        <>
            <IncomingCallModal open={open} setOpen={setOpen} handleDismiss={handleDismiss} />
            <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.92 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                    <Paper
                        elevation={4}
                        sx={{
                            width: 330,
                            borderRadius: 4,
                            p: 2,
                            bgcolor: "#fff",
                            overflow: "hidden",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)",
                        }}
                    >
                        {/* HEADER */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 1.4,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "12px",
                                        bgcolor: isCall ? "rgba(56, 180, 90, 0.12)" : "rgba(160, 32, 240, 0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {isCall ? <PermPhoneMsgRoundedIcon sx={{ color: "#3dbb63" }} /> : <LocalActivityRoundedIcon sx={{ color: "#a020f0" }} />}
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            color: "#111",
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {title}
                                    </Typography>

                                    {/* Metadata subtitle
                                <Typography
                                    sx={{
                                        fontSize: "0.78rem",
                                        mt: 0.2,
                                        color: "#6b6b6b",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {data?.company || ""}
                                </Typography> */}
                                </Box>
                            </Box>

                            <IconButton onClick={handleDismiss} size="small" sx={{ color: "#888", p: 0.5 }}>
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* BODY TEXT */}
                        <Typography
                            sx={{
                                color: "#555",
                                fontSize: "0.92rem",
                                lineHeight: 1.35,
                                mb: 2.2,
                                whiteSpace: "pre-line",
                            }}
                        >
                            {description}
                        </Typography>

                        {/* CTA BUTTONS */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleOpen}
                                size="small"
                                sx={{
                                    flex: 1,
                                    textTransform: "none",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    py: 0.8,
                                    bgcolor: "#1a73e8",
                                    boxShadow: "0 2px 5px rgba(26,115,232,0.25)",
                                    transition: "0.18s",
                                    "&:hover": {
                                        bgcolor: "#1766cc",
                                    },
                                    color: "white",
                                }}
                            >
                                Open
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={handleDismiss}
                                size="small"
                                sx={{
                                    flex: 1,
                                    textTransform: "none",
                                    fontSize: "0.76rem",
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    py: 0.75,
                                    color: "#444",
                                    borderColor: "#d0d0d0",
                                    background: "linear-gradient(180deg,#fff,#f8f8f8)",
                                    transition: "0.18s",
                                    "&:hover": {
                                        background: "#f2f2f2",
                                        borderColor: "#c2c2c2",
                                    },
                                }}
                            >
                                Hide
                            </Button>
                        </Box>
                    </Paper>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
