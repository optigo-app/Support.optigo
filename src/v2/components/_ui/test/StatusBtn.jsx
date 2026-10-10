import React from "react";
import { Box, Button, IconButton, Stack } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const pillSx = {
    px: 1.75,
    borderRadius: "999px",
    bgcolor: "#EFEFEF",
    color: "#000",
    fontSize: 14,
    fontWeight: 500,
    textTransform: "none",
    letterSpacing: 0,
    boxShadow: "none",
    gap: 1,
    py: 0.5,
    whiteSpace: "nowrap",
    "&:hover": { bgcolor: "#E4E4E4", boxShadow: "none" },
    "&:active": { bgcolor: "#DADADA" },
    "&:focus-visible": { outline: "2px solid #000", outlineOffset: 2 },
};

export default function StatusButtons() {
    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2, bgcolor: "#fff" }}>
            <Button disableElevation disableRipple sx={pillSx}>
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                Prep 15 minutes
            </Button>

            <Button disableElevation disableRipple sx={pillSx}>
                <Box
                    component="span"
                    sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#7A7A7A" }}
                />
                Ordering off
            </Button>

            <IconButton
                aria-label="Settings"
                disableRipple
                sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#EFEFEF",
                    color: "#000",
                    "&:hover": { bgcolor: "#E4E4E4" },
                    "&:active": { bgcolor: "#DADADA" },
                    "&:focus-visible": { outline: "2px solid #000", outlineOffset: 2 },
                }}
            >
                <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
        </Stack>
    );
}


