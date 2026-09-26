import React, { useState } from "react";
import { Box, Chip, CircularProgress, Menu, MenuItem } from "@mui/material";
import { useCallLog } from "../../../context/UseCallLog";

const menuItemStyle = {
    margin: "0px 4px",
    borderRadius: "8px",
    fontSize: "13px",
    "&:hover": { backgroundColor: "#f0f0f0", borderRadius: "8px" },
};

const CallType = ({ params }) => {
    const { CALL_TYPE_MASTER, UpdateCall } = useCallLog();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const currentType = CALL_TYPE_MASTER?.find((o) => o.label === params?.value);
    const [loading, setLoading] = useState(false);

    const handleOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = async (value) => {
        setLoading(true);
        const res = await UpdateCall(params.row.id, { callType: value });
        if (res?.success) {
            handleClose();
        }
        setLoading(false);
    };

    return (
        <>
            <Chip label={
                loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={12} thickness={5} />
                        Saving…
                    </Box>
                ) : (
                    currentType?.label || "")}

                onClick={handleOpen} size="small" sx={{ fontSize: "0.7rem", height: 20 }} />

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} sx={{ mt: 1 }}>
                {CALL_TYPE_MASTER?.map((option) => (
                    <MenuItem key={option.value} selected={option.value === params.row?.CallType} sx={menuItemStyle} onClick={() => handleSelect(option.value)}>
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default CallType;
