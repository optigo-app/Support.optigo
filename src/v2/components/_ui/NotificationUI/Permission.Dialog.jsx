import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Typography,
    Button,
    IconButton,
    Box,
    Stack,
    Collapse,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// App Logo Icon
const AppLogo = () => (
    <Box
        sx={{
            width: 28,
            height: 28,
            borderRadius: '7px',
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        }}
    >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2V22M2 12H22M4.93 4.93L19.07 19.07M4.93 19.07L19.07 4.93"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
        </svg>
    </Box>
);

export default function AestheticNotificationModal({
    open = true,
    onClose,
    onEnable,
    appName = "Optigo",
}) {
    const [guideOpen, setGuideOpen] = useState(false);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: '360px', // Sleek compact width
                    borderRadius: '22px',
                    boxShadow: '0 20px 40px -12px rgba(16, 24, 40, 0.14), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(242, 244, 247, 0.9)',
                    overflow: 'hidden',
                    p: 2.25,
                    position: 'relative',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                },
            }}
        >
            {/* Subtle Close Button */}
            <IconButton
                onClick={onClose}
                size="small"
                sx={{
                    position: 'absolute',
                    right: 14,
                    top: 14,
                    color: '#98A2B3',
                    p: 0.5,
                    '&:hover': { color: '#344054', backgroundColor: '#F8F9FA' },
                }}
            >
                <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                <Typography
                    align="center"
                    sx={{
                        fontWeight: 650,
                        fontSize: '1.05rem',
                        color: '#101828',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        mb: 0.75,
                    }}
                >
                    Enable notifications
                </Typography>

                {/* Description */}
                <Typography
                    align="center"
                    sx={{
                        color: '#667085',
                        fontSize: '0.8125rem',
                        lineHeight: 1.45,
                        px: 1,
                        mb: 2.25,
                    }}
                >
                    Stay in the loop with instant updates by clicking “Allow” in your system prompt.
                </Typography>

                {/* Sleek Preview Showcase */}
                <Box
                    sx={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #F1F5F9',
                        borderRadius: '16px',
                        py: 2.5,
                        px: 1.75,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.75,
                    }}
                >
                    {/* Active Top Notification (Glass style) */}
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 290,
                            // backgroundColor: 'rgba(55, 60, 68, 0.9)',
                            background: `linear-gradient(135deg, #b534ffe3 0%, #6a00c6e1 60%, #9d00ffad 70%, #f200ff00 100%)`,
                            backdropFilter: 'blur(10px)',
                            borderRadius: '13px',
                            p: '9px 12px',
                            color: '#FFFFFF',
                            boxShadow: '0 6px 14px rgba(0, 0, 0, 0.14)',
                            zIndex: 3,
                            position: 'relative',
                        }}
                    >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <AppLogo />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#FFF' }}>
                                        Allow notifications
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.675rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                        Now
                                    </Typography>
                                </Stack>
                                <Typography
                                    sx={{
                                        fontSize: '0.71rem',
                                        color: 'rgba(255, 255, 255, 0.82)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        mt: 0.15,
                                    }}
                                >
                                    “{appName}” wants to send you updates
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* 2nd Stacked Card */}
                    <Box
                        sx={{
                            width: '92%',
                            maxWidth: 270,
                            // backgroundColor: '#7A808A',
                            background: `linear-gradient(262deg, #b434ff -4%, #6900c6 23%, #9e00ff 65%, #f200ff00 108%)`,
                            borderRadius: '0 0 13px 13px',
                            px: 1.5,
                            py: 0.55,
                            mt: '-6px',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '-12px -20px 14px rgba(0, 0, 0, 0.14)',
                        }}
                    >
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#FFF' }}>
                            New message from Neha
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                            16m
                        </Typography>
                    </Box>

                    {/* 3rd Stacked Pill */}
                    <Box
                        sx={{
                            width: '84%',
                            maxWidth: 245,
                            // backgroundColor: '#A2A7B0',
                            background: `linear-gradient(
232deg, #b434ff 6%, #6900c6 48%, #9e00ff 52%, #f200ff00 108%)`,
                            borderRadius: '0 0 11px 11px',
                            py: 0.4,
                            textAlign: 'center',
                            mt: '-3px',
                            zIndex: 1,
                            boxShadow: '0 6px 14px rgba(0, 0, 0, 0.14)',
                        }}
                    >
                        <Typography sx={{ fontSize: '0.635rem', fontWeight: 600, color: '#FFFFFF' }}>
                            +3 from Sonal, Namrata, and Jenn.
                        </Typography>
                    </Box>
                </Box>

                {/* Minimal Accordion Dropdown */}
                <Box
                    sx={{
                        border: '1px solid #EAECF0',
                        borderRadius: '11px',
                        backgroundColor: '#FFFFFF',
                        mb: 2,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        onClick={() => setGuideOpen(!guideOpen)}
                        sx={{
                            px: 1.5,
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            '&:hover': { backgroundColor: '#F9FAFB' },
                        }}
                    >
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#344054' }}>
                            Step-by-step guide
                        </Typography>
                        <KeyboardArrowDownIcon
                            sx={{
                                color: '#667085',
                                fontSize: 18,
                                transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    </Box>

                    <Collapse in={guideOpen}>
                        <Box sx={{ px: 1.5, pb: 1.25, pt: 0.25 }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#667085', lineHeight: 1.45 }}>
                                1. Look for the prompt in your browser bar.<br />
                                2. Tap <strong>Allow</strong> to grant permission.
                            </Typography>
                        </Box>
                    </Collapse>
                </Box>

                {/* Compact Action Buttons */}
                <Stack direction="row" spacing={1.25}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{
                            flex: 1,
                            height: 38,
                            borderRadius: '9px',
                            borderColor: '#D0D5DD',
                            color: '#344054',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            textTransform: 'none',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
                            '&:hover': {
                                borderColor: '#98A2B3',
                                backgroundColor: '#F9FAFB',
                            },
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={onEnable}
                        sx={{
                            flex: 1,
                            height: 38,
                            borderRadius: '9px',
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            textTransform: 'none',
                            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                            '&:hover': {
                                backgroundColor: '#1E293B',
                            },
                        }}
                    >
                        Enable
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
const CameraBadge = () => (
    <Box
        sx={{
            width: 60,
            height: 60,
            borderRadius: '20px',
            background: 'linear-gradient(180deg, #F9FAFB 0%, #E4E7EC 100%)',
            boxShadow: `
        0px 1px 2px rgba(16, 24, 40, 0.05),
        0px 12px 24px -4px rgba(16, 24, 40, 0.12),
        inset 0px 1px 1px #FFFFFF
      `,
            border: '1px solid #D0D5DD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            mx: 'auto',
            mb: 2.5,
        }}
    >
        {/* Lens Outer Metallic Rim */}
        <Box
            sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #CBD5E1 0%, #64748B 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Lens Inner Glass */}
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #334155 0%, #0F172A 70%, #020617 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #1E293B',
                }}
            >
                {/* Optical Reflection Glare */}
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #38BDF8 0%, rgba(56, 189, 248, 0) 70%)',
                        position: 'absolute',
                        top: 7,
                        left: 7,
                        opacity: 0.8,
                    }}
                />
                <Box
                    sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#090D16',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
                    }}
                />
            </Box>
        </Box>
    </Box>
);


export function CameraPermissionModal({ open = true, onClose }) {
    const [accordionExpanded, setAccordionExpanded] = useState(false);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    boxShadow: '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
                    overflow: 'hidden',
                    p: { xs: 2, sm: 2.5 },
                    position: 'relative',
                    maxWidth: '420px',
                },
            }}
        >
            {/* Close Button (X) */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: 20,
                    color: '#98A2B3',
                    '&:hover': { color: '#475467', backgroundColor: '#F2F4F7' },
                    p: 0.75,
                }}
            >
                <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                {/* 3D Camera Icon */}
                <CameraBadge />

                {/* Title */}
                <Typography
                    variant="h6"
                    align="center"
                    sx={{
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        color: '#101828',
                        letterSpacing: '-0.02em',
                        mb: 1,
                    }}
                >
                    Camera permission required
                </Typography>

                {/* Subtitle / Description */}
                <Typography
                    variant="body2"
                    align="center"
                    sx={{
                        color: '#475467',
                        fontSize: '0.875rem',
                        lineHeight: 1.45,
                        px: 1.5,
                        mb: 3,
                    }}
                >
                    To make video calls, please turn on the camera permission in your app by clicking the notification.
                </Typography>

                {/* Notifications Mockup Container */}
                <Box
                    sx={{
                        backgroundColor: '#F8F9FA',
                        borderRadius: '20px',
                        p: 3,
                        pb: 3.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        minHeight: '148px',
                    }}
                >
                    {/* Active Top Notification Card */}
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 340,
                            backgroundColor: '#5F6368',
                            borderRadius: '16px',
                            p: '12px 14px',
                            color: '#FFFFFF',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
                            zIndex: 3,
                            position: 'relative',
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <AppLogo />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#FFF' }}>
                                        Allow camera access
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                                        2m ago
                                    </Typography>
                                </Stack>
                                <Typography
                                    sx={{
                                        fontSize: '0.75rem',
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        mt: 0.25,
                                    }}
                                >
                                    “Untitled” would like to access the camera.
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* 2nd Stacked Card Behind */}
                    <Box
                        sx={{
                            width: '92%',
                            maxWidth: 320,
                            backgroundColor: '#7A7E84',
                            borderRadius: '0 0 16px 16px',
                            px: 2,
                            py: 0.75,
                            mt: '-8px',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#FFF' }}>
                            New message from Olivia
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>
                            16m ago
                        </Typography>
                    </Box>

                    {/* 3rd Stacked Pill Count */}
                    <Box
                        sx={{
                            width: '84%',
                            maxWidth: 290,
                            backgroundColor: '#A6AAB1',
                            borderRadius: '0 0 14px 14px',
                            py: 0.6,
                            textAlign: 'center',
                            mt: '-4px',
                            zIndex: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#FFFFFF' }}>
                            +3 from Linear, X, and Figma
                        </Typography>
                    </Box>
                </Box>

                {/* Step-by-Step Guide Accordion */}
                <Accordion
                    expanded={accordionExpanded}
                    onChange={() => setAccordionExpanded(!accordionExpanded)}
                    disableGutters
                    elevation={0}
                    sx={{
                        border: '1px solid #EAECF0',
                        borderRadius: '12px !important',
                        mb: 2.5,
                        '&:before': { display: 'none' },
                        backgroundColor: '#FFFFFF',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<KeyboardArrowDownIcon sx={{ color: '#101828', fontSize: 20 }} />}
                        sx={{
                            px: 2,
                            minHeight: '44px',
                            '& .MuiAccordionSummary-content': { my: 1 },
                        }}
                    >
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#101828' }}>
                            Step-by-step guide
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#475467', lineHeight: 1.5 }}>
                            1. Open your system notifications tray.<br />
                            2. Click on the <strong>Allow camera access</strong> banner.<br />
                            3. Check "Allow" in the permissions dialog.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                {/* Actions Footer */}
                <Stack direction="row" spacing={1.5}>
                    {/* Cancel Button */}
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        fullWidth
                        sx={{
                            py: 0.9,
                            borderRadius: '10px',
                            borderColor: '#D0D5DD',
                            color: '#344054',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                            '&:hover': {
                                borderColor: '#98A2B3',
                                backgroundColor: '#F9FAFB',
                            },
                        }}
                    >
                        Cancel
                    </Button>

                    {/* Didn't get notification? Button */}
                    <Button
                        variant="contained"
                        onClick={() => setAccordionExpanded(true)}
                        fullWidth
                        sx={{
                            py: 0.9,
                            borderRadius: '10px',
                            backgroundColor: '#0C111D',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                            '&:hover': {
                                backgroundColor: '#1D2939',
                            },
                        }}
                    >
                        Show instructions
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}