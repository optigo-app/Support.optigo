import React, { useState } from "react";
import { Box, Chip, CircularProgress, Menu, MenuItem } from "@mui/material";
import { toast } from "sonner";
import { useCallLog } from "../../../context/UseCallLog";

const menuItemStyle = {
    margin: "0px 4px",
    borderRadius: "8px",
    fontSize: "13px",
    "&:hover": { backgroundColor: "#f0f0f0", borderRadius: "8px" },
};

const getCallTypeValue = (value) =>
    value && typeof value === "object"
        ? value.value ?? value.Id ?? value.id ?? value.label ?? value.Name ?? value.name
        : value;

const CallType = ({ params }) => {
    const { CALL_TYPE_MASTER, UpdateCall } = useCallLog();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const rawType = params?.value ?? params?.row?.callType;
    const typeValue = getCallTypeValue(rawType);
    const rowTypeValue = getCallTypeValue(params?.row?.CallType ?? params?.row?.callType);
    const currentType = CALL_TYPE_MASTER?.find(
        (option) =>
            String(option?.value) === String(typeValue) ||
            String(option?.label ?? "").trim().toLowerCase() ===
                String(typeValue ?? "").trim().toLowerCase(),
    );
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
        } else {
            toast.error(res?.message || "Failed to update call type.");
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
                    currentType?.label ||
                    (typeof typeValue === "string" || typeof typeValue === "number"
                        ? String(typeValue)
                        : ""))}

                onClick={handleOpen} size="small" sx={{ fontSize: "0.7rem", height: 20 }} />

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} sx={{ mt: 1 }}>
                {CALL_TYPE_MASTER?.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={
                            String(option.value) === String(rowTypeValue) ||
                            String(option.label ?? "").trim().toLowerCase() ===
                                String(rowTypeValue ?? "").trim().toLowerCase()
                        }
                        sx={menuItemStyle}
                        onClick={() => handleSelect(option.value)}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default CallType;
