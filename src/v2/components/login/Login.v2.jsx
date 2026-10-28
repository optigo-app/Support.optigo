import React from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    Avatar,
    Link,
    ThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material';
import {
    MagnifyingGlass,
    Plus,
    Phone,
    ChatCircle,
    CaretDown,
    CaretLeft,
    CaretRight,
    Clock,
    Paperclip,
    Voicemail,
    PhoneCall,
    PhoneTransfer,
    Tray,
    FileText,
    Users,
    Record,
    CheckSquareOffset,
    Buildings,
    SquaresFour,
    User,
    Check,
    CalendarBlank,
    Lightning,
    ArrowCounterClockwise,
    ShareNetwork,
    PencilSimple,
    SidebarSimple,
    Globe,
    Tag,
    Ticket,
    CheckSquare,
    TextB,
    TextItalic,
    TextStrikethrough,
    At,
    PaperPlaneRight,
    Bell,
} from '@phosphor-icons/react';

const theme = createTheme({
    typography: {
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        button: {
            textTransform: 'none',
        },
    },
});

// Custom Vector Logo for "Optigo"
const OptigoLogo = ({ height = 28 }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Box
            sx={{
                width: height,
                height: height,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
            }}
        >
            <PhoneCall size={height * 0.56} weight="fill" color="#FFFFFF" />
        </Box>
        <Typography
            sx={{
                fontSize: height * 0.78,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#18181B',
            }}
        >
            Optigo
        </Typography>
    </Stack>
);

export default function OptigoOnboardingMUI() {
    const companiesList = [
        { name: 'ABHISHEKS', color: '#4F46E5', letter: 'A' },
        { name: 'AG', color: '#EA580C', letter: 'A' },
        { name: 'ambikesh', color: '#DC2626', letter: 'A' },
        { name: 'anjum', color: '#9333EA', letter: 'A' },
        { name: 'ArjunMahajan', color: '#4F46E5', letter: 'A' },
        { name: 'Dee', color: '#334155', letter: 'D' },
        { name: 'deep1', color: '#475569', letter: 'D' },
        { name: 'goku', color: '#D97706', letter: 'G' },
        { name: 'John_Dev', color: '#4F46E5', letter: 'J' },
        { name: 'mili', color: '#4338CA', letter: 'M' },
        { name: 'OM00000', color: '#15803D', letter: 'O' },
        { name: 'optigocarely', color: '#0F766E', letter: 'O' },
    ];

    const callsList = [
        {
            title: 'AI jewellery design recommendation e...',
            user: 'Luke Skywalker',
            company: 'ABHISHEKS',
            time: '11:41',
            color: '#7C3AED',
        },
        {
            title: 'Scheduled automated Monday email ...',
            user: 'Monkey D. Luffy',
            company: 'Scott',
            time: '10:25',
            color: '#DC2626',
        },
        {
            title: 'Complete workshop on managing ou...',
            user: 'Diana Prince',
            company: 'viraj',
            time: '09:09',
            color: '#16A34A',
        },
        {
            title: 'Discrepancy in outside karigar wastag...',
            user: 'Clark Kent',
            company: 'goku',
            time: '17:02',
            color: '#D97706',
            active: true,
        },
        {
            title: 'Inquiry on locking tablet app into singl...',
            user: 'Maximus Decimus',
            company: 'ThGems',
            time: '10:34',
            color: '#DB2777',
        },
        {
            title: 'Report calculation query regarding av...',
            user: 'Kakashi Hatake',
            company: 'mili',
            time: '09:18',
            color: '#4F46E5',
        },
        {
            title: 'Retail store footfall vs conversion ratio ...',
            user: 'Sasuke Uchiha',
            company: 'John_Dev',
            time: '17:11',
            color: '#7C3AED',
        },
    ];

    const authButtonSx = {
        width: '100%',
        height: 38,
        bgcolor: '#FFFFFF',
        border: '1px solid #E4E4E7',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '13.5px',
        fontWeight: 500,
        color: '#18181B',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        '&:hover': {
            bgcolor: '#F9FAFB',
            borderColor: '#E4E4E7',
        },
        '&:active': {
            bgcolor: '#F3F4F6',
        },
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#FFFFFF',
                    userSelect: 'none',
                    overflow: 'hidden',
                }}
            >
                {/* Main Split Content Area */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* ================= LEFT PANEL (Sign-up Form) ================= */}
                    <Box
                        sx={{
                            width: { xs: '100%', lg: '39.65%' },
                            bgcolor: '#FFFFFF',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: { xs: 4, sm: 5 },
                            position: 'relative',
                            zIndex: 10,
                        }}
                    >
                        {/* Top-left Brand Logo */}
                        <Box>
                            <OptigoLogo height={28} />
                        </Box>

                        {/* Center Form Block */}
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 304,
                                mx: 'auto',
                                my: 'auto',
                                pt: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: '32px',
                                    lineHeight: 1.18,
                                    fontWeight: 600,
                                    color: '#18181B',
                                    textAlign: 'center',
                                    letterSpacing: '-0.025em',
                                }}
                            >
                                Welcome to
                                <br />
                                Optigo!
                            </Typography>

                            <Typography
                                sx={{
                                    mt: '10px',
                                    fontSize: '14px',
                                    color: '#52525B',
                                    textAlign: 'center',
                                    fontWeight: 400,
                                }}
                            >
                                Create an account to start your free trial
                            </Typography>

                            {/* Auth Buttons */}
                            <Stack spacing="11px" sx={{ width: '100%', mt: 3 }}>
                                {/* Google */}
                                <Button disableRipple sx={authButtonSx}>
                                    <Box component="svg" sx={{ width: 15, height: 15 }} viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                                        />
                                    </Box>
                                    <span>Continue with Google</span>
                                </Button>

                                {/* Apple */}
                                <Button disableRipple sx={authButtonSx}>
                                    <Box
                                        component="svg"
                                        sx={{ width: 15, height: 15, fill: '#000000', mt: '-2px' }}
                                        viewBox="0 0 170 170"
                                    >
                                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.13-1.9-14.34-6.08-3.69-3.03-7.61-7.82-11.77-14.37-5.93-9.15-10.72-19.74-14.38-31.77-3.66-12.03-5.49-23.22-5.49-33.56 0-12.75 3.19-23.16 9.56-31.22 6.37-8.06 14.36-12.21 23.98-12.44 4.7 0 9.87 1.37 15.51 4.11 5.64 2.74 9.28 4.17 10.9 4.28 1.23 0 5.14-1.64 11.74-4.92 6.6-3.28 12.19-4.72 16.77-4.33 12.63 1.01 22.14 5.93 28.51 14.76-11.29 6.82-16.83 16.38-16.6 28.68.22 9.62 3.8 17.64 10.73 24.07 4.81 4.47 10.45 7.21 16.94 8.22-1.36 4.19-3.14 8.46-5.34 12.83zM119.22 31.02c0 7.51-2.74 14.51-8.21 21-6.6 7.71-14.59 12.18-23.29 11.49-.11-.9-.17-1.85-.17-2.86 0-7.21 3.03-14.92 8.46-21.18 2.7-3.12 6.13-5.72 10.29-7.8 4.15-2.07 8.09-3.22 11.82-3.44.11 1.01.1 1.94.1 2.79z" />
                                    </Box>
                                    <span>Continue with Apple</span>
                                </Button>

                                {/* Email */}
                                <Button disableRipple sx={authButtonSx}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 16,
                                            height: 15,
                                        }}
                                    >
                                        <Box
                                            component="svg"
                                            viewBox="0 0 20 18"
                                            sx={{ width: 16, height: 16, fill: '#9333EA' }}
                                        >
                                            <path d="M2 3a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2H2zm0 2l8 5 8-5v2l-8 5-8-5V5z" />
                                        </Box>
                                        <Box
                                            component="span"
                                            sx={{
                                                position: 'absolute',
                                                top: -2,
                                                right: -2,
                                                width: 6,
                                                height: 6,
                                                bgcolor: '#EF4444',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 0 1.5px #FFFFFF',
                                            }}
                                        />
                                    </Box>
                                    <span>Continue with email</span>
                                </Button>
                            </Stack>

                            {/* Already have an account */}
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '13px', color: '#52525B' }}>
                                    Already have an account?
                                </Typography>
                                <Link
                                    href="#login"
                                    underline="hover"
                                    sx={{
                                        display: 'inline-block',
                                        mt: '4px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: '#2563EB',
                                    }}
                                >
                                    Log back in
                                </Link>
                            </Box>

                            {/* Terms & Privacy */}
                            <Typography
                                sx={{
                                    mt: '76px',
                                    fontSize: '11px',
                                    lineHeight: 1.45,
                                    color: '#71717A',
                                    textAlign: 'center',
                                    maxWidth: 260,
                                }}
                            >
                                By continuing, you acknowledge and accept our{' '}
                                <Link
                                    href="#terms"
                                    underline="always"
                                    sx={{ color: '#3F3F46', '&:hover': { color: '#000' } }}
                                >
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href="#privacy"
                                    underline="always"
                                    sx={{ color: '#3F3F46', '&:hover': { color: '#000' } }}
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </Typography>
                        </Box>

                        <Box sx={{ height: 24 }} />
                    </Box>

                    {/* ================= RIGHT PANEL (Optigo Product Showcase) ================= */}
                    <Box
                        sx={{
                            display: { xs: 'none', lg: 'block' },
                            width: '60.35%',
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'linear-gradient(150deg, #4B9EFF 0%, #6BB2FF 45%, #8EC5FF 100%)',
                        }}
                    >
                        {/* Optigo Desktop Web App Container */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 56,
                                left: 58,
                                right: -140,
                                bottom: -40,
                                borderTopLeftRadius: '14px',
                                borderTop: '1px solid rgba(255,255,255,0.75)',
                                borderLeft: '1px solid rgba(255,255,255,0.75)',
                                bgcolor: 'rgba(248, 250, 252, 0.92)',
                                backdropFilter: 'blur(14px)',
                                boxShadow: '-12px 24px 60px rgba(15, 52, 110, 0.22)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                        >
                            {/* --- ROW 1: TOP GLOBAL BAR (Good Afternoon, Ryumen Sukuna + New Call Search) --- */}
                            <Box
                                sx={{
                                    height: 44,
                                    px: 2,
                                    bgcolor: '#FFFFFF',
                                    borderBottom: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {/* Left Greeting Pill */}
                                <Stack
                                    direction="row"
                                    spacing={1.2}
                                    alignItems="center"
                                    sx={{ filter: 'blur(1.8px)', opacity: 0.9 }}
                                >
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '6px',
                                            border: '1px solid #CBD5E1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <SidebarSimple size={14} color="#475569" />
                                    </Box>
                                    <Typography sx={{ color: '#CBD5E1', fontSize: '14px' }}>/</Typography>
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: '3px',
                                            borderRadius: '999px',
                                            border: '1px solid #E2E8F0',
                                            bgcolor: '#F8FAFC',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: '50%',
                                                bgcolor: '#F59E0B',
                                                boxShadow: '0 0 6px #F59E0B',
                                            }}
                                        />
                                        <Typography sx={{ fontSize: '11.5px', color: '#475569' }}>
                                            Good Afternoon,{' '}
                                            <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                                Ryumen Sukuna
                                            </Box>
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Center Search Bar with "New Call x" Chip */}
                                <Box
                                    sx={{
                                        width: 290,
                                        height: 30,
                                        borderRadius: '999px',
                                        bgcolor: '#F1F5F9',
                                        px: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <MagnifyingGlass size={13} color="#64748B" />
                                    <Box
                                        sx={{
                                            px: 1,
                                            py: '2px',
                                            borderRadius: '999px',
                                            bgcolor: '#EDE9FE',
                                            border: '1px solid #DDD6FE',
                                            color: '#6D28D9',
                                            fontSize: '10.5px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        <PhoneCall size={11} weight="fill" /> New Call ×
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                        Search in New Call...
                                    </Typography>
                                </Box>

                                {/* Right Call Queue & User */}
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mr: '140px' }}>
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: '3px',
                                            borderRadius: '999px',
                                            border: '1px solid #E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.8,
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                        }}
                                    >
                                        <PhoneCall size={13} color="#EF4444" weight="fill" />
                                        Call Queue
                                    </Box>
                                    <Bell size={15} color="#64748B" />
                                </Stack>
                            </Box>

                            {/* --- ROW 2: FILTER BAR (+ ADD, Search, Export, Company, Filter By, Date, Status) --- */}
                            <Box
                                sx={{
                                    height: 44,
                                    px: 1.5,
                                    bgcolor: '#FFFFFF',
                                    borderBottom: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                {/* Left Blurred Part of Filter Bar */}
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{ filter: 'blur(1.8px)', opacity: 0.9 }}
                                >
                                    <Box
                                        sx={{
                                            px: 1.2,
                                            py: '4px',
                                            borderRadius: '999px',
                                            bgcolor: '#E2E8F0',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        <Plus size={12} weight="bold" /> ADD
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 155,
                                            height: 28,
                                            borderRadius: '999px',
                                            border: '1px solid #CBD5E1',
                                            px: 1.2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.8,
                                        }}
                                    >
                                        <MagnifyingGlass size={12} color="#94A3B8" />
                                        <Typography noWrap sx={{ fontSize: '10.5px', color: '#94A3B8' }}>
                                            Search calls, client...
                                        </Typography>
                                    </Box>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{
                                            px: 1.2,
                                            py: '4px',
                                            borderRadius: '999px',
                                            bgcolor: '#F1F5F9',
                                            border: '1px solid #E2E8F0',
                                        }}
                                    >
                                        <User size={12} weight="fill" color="#1E293B" />
                                        <Users size={12} color="#64748B" />
                                        <PhoneCall size={12} color="#64748B" />
                                        <Check size={12} weight="bold" color="#1E293B" />
                                    </Stack>
                                    <Box
                                        sx={{
                                            px: 1.2,
                                            py: '4px',
                                            borderRadius: '999px',
                                            bgcolor: '#E2E8F0',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '2px',
                                                bgcolor: '#16A34A',
                                                color: '#FFF',
                                                fontSize: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                            }}
                                        >
                                            X
                                        </Box>
                                        Export
                                    </Box>
                                </Stack>

                                {/* Crisp Right Part of Filter Bar */}
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box
                                        sx={{
                                            px: 1.2,
                                            py: '4px',
                                            borderRadius: '999px',
                                            bgcolor: '#E2E8F0',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        Company <CaretDown size={11} />
                                    </Box>
                                    <Box
                                        sx={{
                                            px: 1.2,
                                            py: '4px',
                                            borderRadius: '999px',
                                            bgcolor: '#E2E8F0',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        Filter By <CaretDown size={11} />
                                    </Box>
                                    <Box
                                        sx={{
                                            px: 1.2,
                                            py: '4px',
                                            borderRadius: '999px',
                                            bgcolor: '#E2E8F0',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.8,
                                        }}
                                    >
                                        <CaretLeft size={10} />
                                        <CalendarBlank size={12} />
                                        Select Date Range
                                        <CaretDown size={11} />
                                        <CaretRight size={10} />
                                    </Box>
                                    <Box
                                        sx={{
                                            px: 1.2,
                                            py: '4px',
                                            borderRadius: '999px',
                                            bgcolor: '#E2E8F0',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        Status <CaretDown size={11} />
                                    </Box>
                                </Stack>
                            </Box>

                            {/* --- ROW 3: MAIN 4-COLUMN WORKSPACE --- */}
                            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                {/* === BLURRED LEFT COLUMNS (Icon Rail + Companies + All Calls 600) === */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        height: '100%',
                                        filter: 'blur(2.1px)',
                                        opacity: 0.94,
                                        pointerEvents: 'none',
                                    }}
                                >
                                    {/* Col 1: Narrow Left Icon Rail */}
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: '100%',
                                            bgcolor: '#FFFFFF',
                                            borderRight: '1px solid #E2E8F0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            pt: 1.5,
                                            gap: 2,
                                        }}
                                    >
                                        <Phone size={16} weight="fill" color="#1E293B" />
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '8px',
                                                bgcolor: '#7C3AED',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <PhoneTransfer size={15} weight="bold" color="#FFFFFF" />
                                        </Box>
                                        <Tray size={16} color="#475569" />
                                        <FileText size={16} color="#475569" />
                                        <Users size={16} color="#475569" />
                                        <Record size={16} color="#475569" />
                                        <CheckSquareOffset size={16} color="#475569" />
                                    </Box>

                                    {/* Col 2: Companies List */}
                                    <Box
                                        sx={{
                                            width: 132,
                                            height: '100%',
                                            bgcolor: '#FFFFFF',
                                            borderRight: '1px solid #E2E8F0',
                                            p: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 1,
                                                px: 0.5,
                                            }}
                                        >
                                            <Stack direction="row" spacing={0.6} alignItems="center">
                                                <Buildings size={13} color="#7C3AED" weight="bold" />
                                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#1E293B' }}>
                                                    Companies
                                                </Typography>
                                            </Stack>
                                            <CaretLeft size={11} color="#64748B" />
                                        </Box>

                                        {/* All Company Active Pill */}
                                        <Box
                                            sx={{
                                                px: 1,
                                                py: '5px',
                                                borderRadius: '6px',
                                                bgcolor: '#F1F5F9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 0.8,
                                            }}
                                        >
                                            <Stack direction="row" spacing={0.6} alignItems="center">
                                                <SquaresFour size={12} weight="fill" color="#0F172A" />
                                                <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: '#0F172A' }}>
                                                    All Company
                                                </Typography>
                                            </Stack>
                                            <Box
                                                sx={{
                                                    px: 0.7,
                                                    py: '1px',
                                                    borderRadius: '999px',
                                                    bgcolor: '#0F172A',
                                                    color: '#FFFFFF',
                                                    fontSize: '9px',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                600
                                            </Box>
                                        </Box>

                                        {/* Company Items */}
                                        <Stack spacing="5px">
                                            {companiesList.map((comp, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        px: 0.6,
                                                        py: '3px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
                                                        <Box
                                                            sx={{
                                                                width: 15,
                                                                height: 15,
                                                                borderRadius: '50%',
                                                                bgcolor: comp.color,
                                                                color: '#FFF',
                                                                fontSize: '8.5px',
                                                                fontWeight: 700,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {comp.letter}
                                                        </Box>
                                                        <Typography
                                                            noWrap
                                                            sx={{ fontSize: '10px', color: '#475569', fontWeight: 500 }}
                                                        >
                                                            {comp.name}
                                                        </Typography>
                                                    </Stack>
                                                    <Box
                                                        sx={{
                                                            px: 0.6,
                                                            borderRadius: '6px',
                                                            bgcolor: '#F1F5F9',
                                                            color: '#475569',
                                                            fontSize: '8.5px',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        30
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>

                                    {/* Col 3: All Calls 600 List */}
                                    <Box
                                        sx={{
                                            width: 245,
                                            height: '100%',
                                            bgcolor: '#FFFFFF',
                                            borderRight: '1px solid #E2E8F0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: 36,
                                                px: 1.5,
                                                borderBottom: '1px solid #F1F5F9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Stack direction="row" spacing={0.8} alignItems="center">
                                                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                                                    All Calls
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        px: 0.8,
                                                        py: '1px',
                                                        borderRadius: '999px',
                                                        bgcolor: '#E2E8F0',
                                                        color: '#334155',
                                                        fontSize: '9.5px',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    600
                                                </Box>
                                            </Stack>
                                            <CaretLeft size={12} color="#64748B" />
                                        </Box>

                                        <Stack spacing={0.4} sx={{ p: 1 }}>
                                            {callsList.map((call, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        p: 1,
                                                        borderRadius: '10px',
                                                        bgcolor: call.active ? '#FEF9C3' : 'transparent',
                                                        border: call.active
                                                            ? '1px solid #FEF08A'
                                                            : '1px solid transparent',
                                                        display: 'flex',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            bgcolor: call.color,
                                                            color: '#FFF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            mt: 0.3,
                                                        }}
                                                    >
                                                        <User size={14} weight="fill" />
                                                    </Box>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography
                                                                noWrap
                                                                sx={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}
                                                            >
                                                                {call.title}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '9px', color: '#64748B', ml: 0.5 }}>
                                                                {call.time}
                                                            </Typography>
                                                        </Box>
                                                        <Stack
                                                            direction="row"
                                                            spacing={0.5}
                                                            alignItems="center"
                                                            sx={{ my: '2px' }}
                                                        >
                                                            <Typography
                                                                noWrap
                                                                sx={{ fontSize: '9.5px', color: '#334155', fontWeight: 500 }}
                                                            >
                                                                {call.user}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    px: 0.5,
                                                                    borderRadius: '4px',
                                                                    bgcolor: '#F1F5F9',
                                                                    fontSize: '8.5px',
                                                                    color: '#475569',
                                                                }}
                                                            >
                                                                {call.company}
                                                            </Box>
                                                            <Box
                                                                sx={{
                                                                    px: 0.6,
                                                                    borderRadius: '4px',
                                                                    bgcolor: '#DBEAFE',
                                                                    color: '#2563EB',
                                                                    fontSize: '8.5px',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                Support
                                                            </Box>
                                                        </Stack>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Typography noWrap sx={{ fontSize: '9.5px', color: '#64748B' }}>
                                                                {call.title}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    px: 0.7,
                                                                    py: '1px',
                                                                    borderRadius: '999px',
                                                                    border: '1px solid #CBD5E1',
                                                                    bgcolor: '#FFFFFF',
                                                                    fontSize: '8.5px',
                                                                    fontWeight: 600,
                                                                    color: '#1E293B',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.4,
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 4,
                                                                        height: 4,
                                                                        borderRadius: '50%',
                                                                        bgcolor: '#F59E0B',
                                                                    }}
                                                                />
                                                                Pending
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Box>

                                {/* === CRISP RIGHT COLUMN: ACTIVE CALL TICKET ("Clark Kent" / "Discrepancy...") === */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        height: '100%',
                                        bgcolor: '#FFFFFF',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Ticket Header Bar */}
                                    <Box
                                        sx={{
                                            height: 52,
                                            px: 2,
                                            borderBottom: '1px solid #E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: '8px',
                                                    bgcolor: '#EDE9FE',
                                                    color: '#7C3AED',
                                                    fontWeight: 700,
                                                    fontSize: '13px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                C
                                            </Box>
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: '12.5px',
                                                        fontWeight: 700,
                                                        color: '#0F172A',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    Discre
                                                </Typography>
                                                <Typography sx={{ fontSize: '10.5px', color: '#64748B' }}>
                                                    Caller:{' '}
                                                    <Box component="span" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                                        Clark Kent
                                                    </Box>
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {/* Action Pills */}
                                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mr: '130px' }}>
                                            {/* Grouped Pending Pills */}
                                            <Box
                                                sx={{
                                                    px: 1.2,
                                                    py: '4px',
                                                    borderRadius: '999px',
                                                    bgcolor: '#E2E8F0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    fontSize: '10.5px',
                                                    fontWeight: 600,
                                                    color: '#1E293B',
                                                }}
                                            >
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Box
                                                        sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#64748B' }}
                                                    />
                                                    <span>Pending</span>
                                                    <CaretDown size={10} />
                                                </Stack>
                                                <Typography sx={{ color: '#94A3B8' }}>|</Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Box
                                                        sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#64748B' }}
                                                    />
                                                    <span>Pending</span>
                                                    <CaretDown size={10} />
                                                </Stack>
                                                <Typography sx={{ color: '#94A3B8' }}>|</Typography>
                                                <Lightning size={11} weight="fill" color="#475569" />
                                            </Box>

                                            <Box
                                                sx={{
                                                    px: 1.2,
                                                    py: '4px',
                                                    borderRadius: '999px',
                                                    bgcolor: '#F1F5F9',
                                                    color: '#94A3B8',
                                                    fontSize: '10.5px',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                }}
                                            >
                                                <ArrowCounterClockwise size={11} /> Follow-Up
                                            </Box>

                                            <Box
                                                sx={{
                                                    px: 1.2,
                                                    py: '4px',
                                                    borderRadius: '999px',
                                                    bgcolor: '#E2E8F0',
                                                    color: '#1E293B',
                                                    fontSize: '10.5px',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                }}
                                            >
                                                <ShareNetwork size={11} /> Forward
                                            </Box>

                                            <Box
                                                sx={{
                                                    px: 1.2,
                                                    py: '4px',
                                                    borderRadius: '999px',
                                                    bgcolor: '#E2E8F0',
                                                    color: '#1E293B',
                                                    fontSize: '10.5px',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                }}
                                            >
                                                <PencilSimple size={11} /> Edit
                                            </Box>

                                            <Box
                                                sx={{
                                                    px: 1.4,
                                                    py: '5px',
                                                    borderRadius: '999px',
                                                    bgcolor: '#16A34A',
                                                    color: '#FFFFFF',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.6,
                                                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                                                }}
                                            >
                                                <PhoneCall size={12} weight="fill" /> Start Call
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Ticket Activity Stream */}
                                    <Box sx={{ flex: 1, px: 3, py: 2, display: 'flex', flexDirection: 'column' }}>
                                        {/* Date Divider Pill */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                my: 1,
                                                pr: '120px',
                                            }}
                                        >
                                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#F1F5F9' }} />
                                            <Box
                                                sx={{
                                                    px: 1.5,
                                                    py: '3px',
                                                    borderRadius: '999px',
                                                    border: '1px solid #E2E8F0',
                                                    bgcolor: '#FFFFFF',
                                                    fontSize: '10.5px',
                                                    fontWeight: 500,
                                                    color: '#475569',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    mx: 1.5,
                                                }}
                                            >
                                                Tuesday, October 27 <CaretDown size={10} />
                                            </Box>
                                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#F1F5F9' }} />
                                        </Box>

                                        {/* Agent Call Card (Clark Kent) */}
                                        <Box sx={{ alignSelf: 'flex-end', mr: '135px', mt: 2 }}>
                                            <Stack
                                                direction="row"
                                                spacing={0.8}
                                                alignItems="center"
                                                justifyContent="flex-end"
                                                sx={{ mb: 0.8 }}
                                            >
                                                <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>
                                                    ryumen sukuna
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        px: 0.8,
                                                        py: '1px',
                                                        borderRadius: '6px',
                                                        bgcolor: '#DCFCE7',
                                                        color: '#15803D',
                                                        fontSize: '9.5px',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Support
                                                </Box>
                                                <Typography sx={{ fontSize: '10px', color: '#94A3B8' }}>5:02 PM</Typography>
                                            </Stack>

                                            <Stack direction="row" spacing={1.2} alignItems="flex-start">
                                                {/* Grey Call Card */}
                                                <Box
                                                    sx={{
                                                        width: 280,
                                                        p: 1.8,
                                                        borderRadius: '14px',
                                                        bgcolor: '#F1F5F9',
                                                        border: '1px solid #CBD5E1',
                                                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                                            <Box
                                                                sx={{
                                                                    width: 34,
                                                                    height: 34,
                                                                    borderRadius: '50%',
                                                                    bgcolor: '#94A3B8',
                                                                    color: '#FFFFFF',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <PhoneCall size={17} weight="fill" />
                                                            </Box>
                                                            <Typography
                                                                sx={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}
                                                            >
                                                                Clark Kent
                                                            </Typography>
                                                        </Stack>

                                                        <Box
                                                            sx={{
                                                                px: 1,
                                                                py: '2px',
                                                                borderRadius: '999px',
                                                                bgcolor: '#FFFFFF',
                                                                border: '1px solid #E2E8F0',
                                                                fontSize: '10px',
                                                                fontWeight: 600,
                                                                color: '#334155',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                            }}
                                                        >
                                                            <ChatCircle size={11} weight="fill" /> Support
                                                        </Box>
                                                    </Box>

                                                    <Stack
                                                        direction="row"
                                                        spacing={0.8}
                                                        alignItems="center"
                                                        sx={{ mt: 1.5, pl: 5.5 }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                px: 1,
                                                                py: '2px',
                                                                borderRadius: '6px',
                                                                bgcolor: '#FEF3C7',
                                                                color: '#B45309',
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            Pending
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                px: 0.8,
                                                                py: '2px',
                                                                borderRadius: '6px',
                                                                bgcolor: '#FFFFFF',
                                                                border: '1px solid #E2E8F0',
                                                                fontSize: '10px',
                                                                color: '#475569',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.4,
                                                            }}
                                                        >
                                                            <Clock size={11} /> 00:00
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                px: 0.8,
                                                                py: '2px',
                                                                borderRadius: '6px',
                                                                bgcolor: '#FFFFFF',
                                                                border: '1px solid #E2E8F0',
                                                                fontSize: '10px',
                                                                fontWeight: 600,
                                                                color: '#334155',
                                                            }}
                                                        >
                                                            Clark
                                                        </Box>
                                                        <Typography sx={{ fontSize: '10px', color: '#94A3B8' }}>→</Typography>
                                                        <Box
                                                            sx={{
                                                                px: 0.8,
                                                                py: '2px',
                                                                borderRadius: '6px',
                                                                bgcolor: '#FFFFFF',
                                                                border: '1px solid #E2E8F0',
                                                                fontSize: '10px',
                                                                fontWeight: 600,
                                                                color: '#334155',
                                                            }}
                                                        >
                                                            ryumen
                                                        </Box>
                                                    </Stack>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: '50%',
                                                        bgcolor: '#DCFCE7',
                                                        color: '#15803D',
                                                        fontWeight: 700,
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    R
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Box>

                                    {/* Bottom Reply Composer Box */}
                                    <Box sx={{ px: 2.5, pb: '52px', pr: '140px' }}>
                                        <Box
                                            sx={{
                                                borderRadius: '14px',
                                                bgcolor: '#F1F5F9',
                                                border: '1px solid #E2E8F0',
                                                p: 1.2,
                                            }}
                                        >
                                            {/* Top Action Chips inside Composer */}
                                            <Stack
                                                direction="row"
                                                spacing={0.8}
                                                justifyContent="flex-end"
                                                sx={{ mb: 1 }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: 1,
                                                        py: '3px',
                                                        borderRadius: '999px',
                                                        bgcolor: '#FFFFFF',
                                                        border: '1px solid #CBD5E1',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.4,
                                                    }}
                                                >
                                                    <Globe size={11} /> Support
                                                </Box>
                                                <Box
                                                    sx={{
                                                        px: 1,
                                                        py: '3px',
                                                        borderRadius: '999px',
                                                        bgcolor: '#FFFFFF',
                                                        border: '1px solid #CBD5E1',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.4,
                                                    }}
                                                >
                                                    <Tag size={11} /> Queary <CaretDown size={9} />
                                                </Box>
                                                <Box
                                                    sx={{
                                                        px: 1,
                                                        py: '3px',
                                                        borderRadius: '999px',
                                                        bgcolor: '#FFFFFF',
                                                        border: '1px solid #CBD5E1',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.4,
                                                    }}
                                                >
                                                    <Ticket size={11} /> Upgrade to Ticket
                                                </Box>
                                                <Box
                                                    sx={{
                                                        px: 1,
                                                        py: '3px',
                                                        borderRadius: '999px',
                                                        bgcolor: '#FFFFFF',
                                                        border: '1px solid #CBD5E1',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.4,
                                                    }}
                                                >
                                                    <CheckSquare size={11} /> Create In Tecopms
                                                </Box>
                                            </Stack>

                                            {/* White Input Box */}
                                            <Box
                                                sx={{
                                                    height: 68,
                                                    borderRadius: '10px',
                                                    bgcolor: '#FFFFFF',
                                                    border: '1px solid #E2E8F0',
                                                    p: 1.2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
                                                    Reply to Clark Kent...
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        color: '#64748B',
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                                        <TextB size={14} />
                                                        <TextItalic size={14} />
                                                        <TextStrikethrough size={14} />
                                                        <At size={14} />
                                                        <Paperclip size={14} />
                                                    </Stack>
                                                    <PaperPlaneRight size={14} weight="fill" color="#94A3B8" />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* ================= FOREGROUND OVERLAPPING IPHONE (Optigo Calling...) ================= */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -18,
                                left: 195,
                                width: 308,
                                height: 492,
                                borderTopLeftRadius: '46px',
                                borderTopRightRadius: '46px',
                                bgcolor: '#0B0F15',
                                p: '7px',
                                pb: 0,
                                boxShadow: '0 25px 70px rgba(0,0,0,0.45)',
                                borderTop: '1px solid rgba(255,255,255,0.15)',
                                borderLeft: '1px solid rgba(255,255,255,0.15)',
                                borderRight: '1px solid rgba(255,255,255,0.15)',
                                zIndex: 20,
                            }}
                        >
                            {/* Inner iPhone Screen */}
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderTopLeftRadius: '39px',
                                    borderTopRightRadius: '39px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    px: 3,
                                    pt: '14px',
                                    pb: 4,
                                    color: '#FFFFFF',
                                    background:
                                        'radial-gradient(120% 90% at 50% 0%, #1E1B4B 0%, #0F3456 38%, #2E3F4F 72%, #4B5563 100%)',
                                }}
                            >
                                {/* Status Bar + Dynamic Island */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        px: 0.5,
                                    }}
                                >
                                    <Typography
                                        sx={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.02em' }}
                                    >
                                        9:41
                                    </Typography>

                                    {/* Dynamic Island */}
                                    <Box
                                        sx={{
                                            width: 88,
                                            height: 25,
                                            bgcolor: '#000000',
                                            borderRadius: '999px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            pr: '10px',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: '#131836',
                                                boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 4,
                                                    height: 4,
                                                    borderRadius: '50%',
                                                    bgcolor: 'rgba(96, 165, 250, 0.6)',
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Signal, Wifi, Battery */}
                                    <Stack direction="row" spacing="6px" alignItems="center">
                                        <Stack direction="row" spacing="1.5px" alignItems="flex-end" sx={{ height: 10 }}>
                                            <Box
                                                sx={{ width: 2.5, height: 4, bgcolor: '#FFFFFF', borderRadius: '2px' }}
                                            />
                                            <Box
                                                sx={{ width: 2.5, height: 6, bgcolor: '#FFFFFF', borderRadius: '2px' }}
                                            />
                                            <Box
                                                sx={{ width: 2.5, height: 8, bgcolor: '#FFFFFF', borderRadius: '2px' }}
                                            />
                                            <Box
                                                sx={{
                                                    width: 2.5,
                                                    height: 10,
                                                    bgcolor: 'rgba(255,255,255,0.4)',
                                                    borderRadius: '2px',
                                                }}
                                            />
                                        </Stack>

                                        <Box
                                            component="svg"
                                            sx={{ width: 14, height: 14, fill: '#FFFFFF' }}
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 16.4 10.6 16 12 16s2.6.4 3.5 1.1l1.4-1.4C15.6 14.6 13.9 14 12 14s-3.6.6-4.9 1.7zm-2.8-2.8l1.4 1.4C7.3 13 9.5 12 12 12s4.7 1 6.3 2.3l1.4-1.4C17.7 11.1 15 10 12 10s-5.7 1.1-7.7 2.9z" />
                                        </Box>

                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 10,
                                                borderRadius: '3px',
                                                border: '1px solid rgba(255,255,255,0.5)',
                                                p: '1px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    bgcolor: '#FFFFFF',
                                                    borderRadius: '1.5px',
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                </Box>

                                {/* Caller Info: Clark Kent + Optigo Calling... */}
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Typography
                                        sx={{
                                            fontSize: '26px',
                                            fontWeight: 500,
                                            letterSpacing: '-0.015em',
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        Clark Kent
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        spacing="6px"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{ mt: '6px' }}
                                    >
                                        <Box
                                            sx={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '5px',
                                                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.4)',
                                            }}
                                        >
                                            <PhoneCall size={11} weight="fill" color="#FFFFFF" />
                                        </Box>
                                        <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                                            Optigo Calling...
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Box sx={{ flex: 1 }} />

                                {/* Bottom Call Action Buttons (Message & Voicemail) */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        px: 2,
                                        pb: 0.5,
                                    }}
                                >
                                    <Stack spacing="6px" alignItems="center">
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(255,255,255,0.15)',
                                                backdropFilter: 'blur(12px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <ChatCircle size={17} weight="fill" color="#FFFFFF" />
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>
                                            Message
                                        </Typography>
                                    </Stack>

                                    <Stack spacing="6px" alignItems="center">
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(255,255,255,0.15)',
                                                backdropFilter: 'blur(12px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Voicemail size={17} weight="bold" color="#FFFFFF" />
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>
                                            Voicemail
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ================= BOTTOM FOOTER BAR ================= */}
                <Box
                    component="footer"
                    sx={{
                        height: 56,
                        width: '100%',
                        bgcolor: '#1C1C1C',
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 30,
                        flexShrink: 0,
                    }}
                >
                    {/* Left: Optigo App Icon + Name */}
                    <Stack direction="row" spacing="10px" alignItems="center">
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '7px',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <PhoneCall size={15} weight="fill" color="#FFFFFF" />
                        </Box>
                        <Typography
                            sx={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: '#FFFFFF',
                                letterSpacing: '-0.015em',
                            }}
                        >
                            Optigo
                        </Typography>
                    </Stack>

                    {/* Right: curated by Mobbin */}
                    <Stack direction="row" spacing={1} alignItems="center" color="#FFFFFF">
                        <Typography sx={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.85)' }}>
                            curated by
                        </Typography>
                        <Stack direction="row" spacing="6px" alignItems="center">
                            <Box
                                component="svg"
                                sx={{ height: 16, width: 'auto', fill: '#FFFFFF' }}
                                viewBox="0 0 38 22"
                            >
                                <path d="M0 22V7.5L7.8 0H14.5V7.2L22.2 0H29V22H21.2V10.5L14.5 17V22H7.5V10.5L0 18V22Z" />
                                <rect x="31.5" y="14" width="6.5" height="8" rx="1" />
                            </Box>
                            <Typography sx={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                Mobbin
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Box>
        </ThemeProvider>
    );
}