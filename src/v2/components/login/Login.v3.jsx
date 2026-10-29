import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    Divider,
    IconButton,
    InputAdornment,
    Stack,
} from '@mui/material';
import {
    VisibilityOutlined,
    VisibilityOffOutlined,
    KeyboardArrowDown,
} from '@mui/icons-material';
import svg1 from "../../assets/logos/Black_Optigo_R_Logo.svg";

// --- Custom Brand & Logo SVGs ---

const DoodleLogo = () => (
    <Box
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            userSelect: 'none',
            mb: '28px',
            mt: '16px',
        }}
    >
        <Box component="img" src={svg1} alt="Logo" sx={{ height: 45 }} />
    </Box>
);

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
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
    </svg>
);

const AppleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path
            fill="#1877F2"
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
    </svg>
);

const MicrosoftIcon = () => (
    <svg width="19" height="19" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
);

// --- Reusable Social Button ---

const SocialButton = ({ icon, label }) => (
    <Button
        fullWidth
        variant="outlined"
        sx={{
            borderRadius: '999px',
            borderColor: '#4a4a4a',
            color: '#111827',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            height: '40px',
            position: 'relative',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            fontFamily: 'inherit',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
                backgroundColor: '#d4d4d4', // Matches the grey hover state in screenshot 1
                borderColor: '#d4d4d4',
            },
        }}
    >
        <Box
            sx={{
                position: 'absolute',
                left: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {icon}
        </Box>
        {label}
    </Button>
);

// --- Main Login Component ---

export default function DoodleLoginV3() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 3,
                px: 2,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
        >
            {/* Top & Center Wrapper */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                {/* Doodle Header Logo */}
                <DoodleLogo />

                {/* Main Card */}
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: '714px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        pt: '46px',
                        pb: '44px',
                        px: { xs: 3, sm: '110px' },
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Card Headings */}
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            fontWeight: 500,
                            fontSize: '28px',
                            color: '#111827',
                            mb: '10px',
                            letterSpacing: '-0.3px',
                        }}
                    >
                        Nice to see you again
                    </Typography>

                    <Typography
                        align="center"
                        sx={{
                            color: '#525965',
                            fontSize: '15.5px',
                            mb: '26px',
                        }}
                    >
                        Log in to access your Dashboard and track your calls.
                    </Typography>

                    {/* Form Section */}
                    <Box component="form" noValidate>
                        {/* Company Code Input */}
                        <Box sx={{ mb: '22px' }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    color: '#111827',
                                    mb: '8px',
                                }}
                            >
                                Company Code
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="company"
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        backgroundColor: '#ffffff',
                                        fontSize: '17px',
                                        height: '48px',
                                        '& fieldset': {
                                            borderColor: '#d1d5db',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#9ca3af',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#0052cc',
                                            borderWidth: '1.5px',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input::placeholder': {
                                        color: '#6b7280',
                                        opacity: 1,
                                    },
                                }}
                            />
                        </Box>
                        {/* Work Email Input */}
                        <Box sx={{ mb: '22px' }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    color: '#111827',
                                    mb: '8px',
                                }}
                            >
                                Work email
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="you@example.com"
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        backgroundColor: '#ffffff',
                                        fontSize: '17px',
                                        height: '48px',
                                        '& fieldset': {
                                            borderColor: '#d1d5db',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#9ca3af',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#0052cc',
                                            borderWidth: '1.5px',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input::placeholder': {
                                        color: '#6b7280',
                                        opacity: 1,
                                    },
                                }}
                            />
                        </Box>

                        {/* Password Input */}
                        <Box sx={{ mb: '14px' }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    color: '#111827',
                                    mb: '8px',
                                }}
                            >
                                Your password
                            </Typography>
                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: '#2c333a', mr: '2px' }}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOutlined sx={{ fontSize: '24px' }} />
                                                ) : (
                                                    <VisibilityOffOutlined sx={{ fontSize: '24px' }} />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        backgroundColor: '#ffffff',
                                        fontSize: '17px',
                                        height: '48px',
                                        '& fieldset': {
                                            borderColor: '#d1d5db',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#9ca3af',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#0052cc',
                                            borderWidth: '1.5px',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input::placeholder': {
                                        color: '#6b7280',
                                        opacity: 1,
                                    },
                                }}
                            />
                        </Box>



                        <Box sx={{ mb: '22px' }}>

                        </Box>

                        {/* Primary Log In Button */}
                        <Button
                            fullWidth
                            variant="contained"
                            disableElevation
                            sx={{
                                backgroundColor: '#0f0f0f',
                                color: '#ffffff',
                                borderRadius: '999px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '17px',
                                height: '48px',
                                mb: '22px',
                                '&:hover': {
                                    backgroundColor: '#262626',
                                },
                            }}
                        >
                            Log in
                        </Button>

                        {/* "or" Divider */}
                        <Divider
                            sx={{
                                mb: '22px',
                                color: '#374151',
                                fontSize: '13.5px',
                                '&::before, &::after': {
                                    borderColor: '#e5e7eb',
                                },
                            }}
                        >
                            or
                        </Divider>

                        {/* Social Log In Buttons */}
                        <Stack spacing="14px" sx={{ mb: '20px' }}>
                            <SocialButton icon={<GoogleIcon />} label="Continue with Google" />
                            <SocialButton icon={<AppleIcon />} label="Continue with Apple" />
                            <SocialButton
                                icon={<FacebookIcon />}
                                label="Continue with Facebook"
                            />
                            <SocialButton
                                icon={<MicrosoftIcon />}
                                label="Continue with Microsoft"
                            />
                        </Stack>

                        {/* reCAPTCHA Legal Disclaimer */}
                        <Typography
                            align="center"
                            sx={{
                                fontSize: '12px',
                                color: '#6b7280',
                                lineHeight: 1.6,
                                px: 1,
                            }}
                        >
                            This site is protected by Optigo and the Google{' '}
                            <Link
                                href="#privacy"
                                underline="none"
                                sx={{
                                    color: '#374151',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Privacy Policy
                            </Link>{' '}
                            and{' '}
                            <Link
                                href="#terms"
                                underline="none"
                                sx={{
                                    color: '#374151',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Terms of Service
                            </Link>{' '}
                            apply
                        </Typography>
                    </Box>
                </Paper>
            </Box >

            {/* Bottom Footer Links */}
            < Stack
                direction="row"
                spacing="18px"
                alignItems="center"
                justifyContent="center"
                sx={{ mt: '38px', mb: '8px' }
                }
            >
                <Link
                    href="#help"
                    underline="none"
                    sx={{
                        fontSize: '12.5px',
                        color: '#4b5563',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    Help
                </Link>
                <Link
                    href="#legal"
                    underline="none"
                    sx={{
                        fontSize: '12.5px',
                        color: '#4b5563',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    Legal Notice
                </Link>
                <Link
                    href="#privacy-settings"
                    underline="none"
                    sx={{
                        fontSize: '12.5px',
                        color: '#4b5563',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    Privacy Settings
                </Link>
                <Box
                    component="span"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '12.5px',
                        color: '#4b5563',
                        cursor: 'pointer',
                        '&:hover': { color: '#111827' },
                    }}
                >
                    English
                    <KeyboardArrowDown sx={{ fontSize: '16px', ml: '2px' }} />
                </Box>
            </Stack >
        </Box >
    );
}