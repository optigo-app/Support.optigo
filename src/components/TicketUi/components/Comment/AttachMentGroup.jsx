import { Box, Typography, Avatar, AvatarGroup, Tooltip } from "@mui/material";



const AttachMentGroup = ({ attachmentsList, setOpenPreview }) => {
    if (!attachmentsList?.length) return null;
    return (
        <>
            <AvatarGroup
                onClick={() => setOpenPreview(true)}
                total={attachmentsList.length}
                max={4}
                sx={{
                    "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        backdropFilter: "blur(8px)",
                        background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.25), inset 0 0 0.5px rgba(255,255,255,0.1)",
                        transition: "all 0.25s ease",
                        cursor: "pointer",
                        img: {
                            objectFit: "contain",
                            padding: "4px",
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        },
                        "&:hover": {
                            transform: "translateY(-2px) scale(1.05)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.35), inset 0 0 0.5px rgba(255,255,255,0.15)",
                            borderColor: "rgba(255,255,255,0.15)",
                        },
                        "&:active": {
                            transform: "scale(0.98)",
                            opacity: 0.9,
                        },
                    },
                    "& .MuiAvatarGroup-avatar": {
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "black",
                        bgcolor: "rgba(255,255,255,0.06)",
                    },
                }}
            >
                {attachmentsList?.map((file) => {
                    const isImage = file?.type?.startsWith("image/");
                    const sizeKB = (file?.size / 1024).toFixed(1);
                    return (
                        <Tooltip
                            key={file?.id}
                            arrow
                            placement="top"
                            slotProps={{
                                tooltip: {
                                    sx: {
                                        bgcolor: "rgba(18,18,18,0.9)",
                                        color: "#fff",
                                        borderRadius: "8px",
                                        backdropFilter: "blur(6px)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                                        p: 1,
                                    },
                                },
                                arrow: {
                                    sx: {
                                        color: "rgba(18,18,18,0.9)",
                                    },
                                },
                            }}
                            title={
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.5,
                                        p: 0.5,
                                        minWidth: 160,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontSize="0.8rem"
                                        fontWeight={600}
                                        sx={{
                                            lineHeight: 1.3,
                                            wordBreak: "break-word",
                                            maxWidth: 180,
                                        }}
                                    >
                                        {file?.fileName}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            bgcolor: "action.hover",
                                            borderRadius: 1,
                                            px: 0.75,
                                            py: 0.25,
                                            width: "fit-content",
                                            fontSize: "0.7rem",
                                            fontWeight: 500,
                                            letterSpacing: 0.2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                bgcolor: "primary.main",
                                                borderRadius: "4px",
                                                color: "#fff",
                                                px: 0.5,
                                                py: 0.1,
                                                fontSize: "0.65rem",
                                                fontWeight: 600,
                                                mr: 0.6,
                                            }}
                                        >
                                            {file?.extension?.toUpperCase()}
                                        </Box>
                                        {`${sizeKB} KB`}
                                    </Box>
                                </Box>
                            }
                        >
                            <Avatar src={isImage ? URL.createObjectURL(file?.file) : undefined}>{!isImage && file?.extension?.slice(0, 3).toUpperCase()}</Avatar>
                        </Tooltip>
                    );
                })}
            </AvatarGroup>
        </>
    );
};

export default AttachMentGroup;
