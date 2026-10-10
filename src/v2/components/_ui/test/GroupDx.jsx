import React, { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";

const options = [
    { value: "left", label: "Align left", icon: <FormatAlignLeftIcon /> },
    { value: "center", label: "Align center", icon: <FormatAlignCenterIcon /> },
    { value: "right", label: "Align right", icon: <FormatAlignRightIcon /> },
    { value: "justify", label: "Justify", icon: <FormatAlignJustifyIcon /> },
];

export default function GroupDx() {
    const [align, setAlign] = useState("left");

    return (
        <Box sx={{ bgcolor: "#E3E3E3", display: "inline-block" }}>
            <ToggleButtonGroup
                exclusive
                value={align}
                onChange={(_, v) => v && setAlign(v)}
                aria-label="Text alignment"
                sx={{
                    bgcolor: "#D6D6D8",
                    borderRadius: "12px",
                    p: "4px",
                    gap: 0,
                    width: 460,
                    "& .MuiToggleButtonGroup-grouped": {
                        flex: 1,
                        border: 0,
                        borderRadius: "10px",
                        color: "#000",
                        position: "relative",
                        transition: "background-color .15s, box-shadow .15s",
                        "&:not(:first-of-type)": { ml: 0, borderLeft: 0, borderRadius: "10px" },
                        "&:first-of-type": { borderRadius: "10px" },
                        "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        "&.Mui-focusVisible": { outline: "2px solid #000", outlineOffset: -2 },
                        // divider between unselected neighbours
                        "&:not(:first-of-type)::before": {
                            content: '""',
                            position: "absolute",
                            left: -1,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: 22,
                            width: "1px",
                            bgcolor: "#BDBDC0",
                        },
                        "&.Mui-selected": {
                            bgcolor: "#fff",
                            color: "#000",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)",
                            zIndex: 1,
                            "&:hover": { bgcolor: "#fff" },
                        },
                        // hide dividers touching the selected item
                        "&.Mui-selected::before, &.Mui-selected + .MuiToggleButtonGroup-grouped::before": {
                            display: "none",
                        },
                    },
                    "& .MuiSvgIcon-root": { fontSize: 24 },
                }}
            >
                {options.map((o) => (
                    <ToggleButton key={o.value} value={o.value} aria-label={o.label} disableRipple>
                        {o.icon}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
}