import React from "react";
import { Box, Typography } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { useTheme } from "@mui/styles";
import imag1 from "../../../../assets/1.png";

export default function BlankPage({ handleCreateTicket }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                flexGrow: 1,
                display: "flex",
                overflow: "hidden",
                bgcolor: "#ffffff",
                width: "100%",
            }}
        >
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 4,
                    color: "text.secondary",
                    // border: "1px solid #ccc",
                    borderRadius: 0,
                    flexGrow: 1,
                    width: "50%",
                }}
            >
                <NoteAddIcon onClick={handleCreateTicket} sx={{ fontSize: 50, mb: 2, color: theme?.custom?.optigo?.color, cursor: "pointer" }} />
                <Typography variant="h6" gutterBottom>
                    No Ticket Selected
                </Typography>
                <Typography variant="body2">Please select an existing ticket from the list or create a new one.</Typography>
            </Box>
            <Box
                sx={{
                    width: 200,
                    flexGrow: 1,
                    height: "100%",
                    // borderLeft: "1px solid #dfe1e6",
                    bgcolor: "#ffffff",
                }}
            >
                <img src={imag1} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
        </Box>
    );
}
