import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Divider,
    InputBase,
    Button,
    Link,
    Collapse,
    IconButton,
} from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

export default function CreateServiceDialog() {
    const [open, setOpen] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const [graphqlEndpoint, setGraphqlEndpoint] = useState(
        'https://acme.corp.dev/graphql'
    );
    const [subdomain, setSubdomain] = useState('acme');

    return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            {/* Trigger Button if Dialog is closed */}
            {!open && (
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Open Dialog
                </Button>
            )}

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E5E7EB',
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogContent sx={{ p: 0 }}>
                    {/* Section 1: GraphQL Endpoint */}
                    <Box sx={{ p: 3.5, pb: 2.5 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: '#1e293b',
                                fontSize: '1.05rem',
                                mb: 1.5,
                            }}
                        >
                            Where is your GraphQL endpoint?
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                px: 2,
                                py: 1,
                                bgcolor: '#fff',
                                '&:focus-within': {
                                    borderColor: '#4361EE',
                                    boxShadow: '0 0 0 2px rgba(67, 97, 238, 0.15)',
                                },
                            }}
                        >
                            <InputBase
                                fullWidth
                                value={graphqlEndpoint}
                                onChange={(e) => setGraphqlEndpoint(e.target.value)}
                                sx={{
                                    fontSize: '0.95rem',
                                    color: '#1F2937',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: '#E5E7EB' }} />

                    {/* Section 2: Subdomain */}
                    <Box sx={{ p: 3.5, pt: 2.5, pb: 3.5 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: '#1e293b',
                                fontSize: '1.05rem',
                                mb: 1.5,
                            }}
                        >
                            Enter your Stellate Edge Cache subdomain
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'stretch',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                bgcolor: '#fff',
                                '&:focus-within': {
                                    borderColor: '#4361EE',
                                    boxShadow: '0 0 0 2px rgba(67, 97, 238, 0.15)',
                                },
                            }}
                        >
                            <InputBase
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value)}
                                sx={{
                                    flex: 1,
                                    px: 2,
                                    py: 1,
                                    fontSize: '0.95rem',
                                    color: '#1F2937',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <Box
                                sx={{
                                    bgcolor: '#F3F4F6',
                                    color: '#6B7280',
                                    px: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.95rem',
                                    borderLeft: '1px solid #E5E7EB',
                                    userSelect: 'none',
                                }}
                            >
                                .stellate.dev
                            </Box>
                        </Box>
                    </Box>

                    {/* Section 3: Collapsible Info Card */}
                    <Box
                        sx={{
                            bgcolor: '#F0F3F7',
                            p: 3,
                            borderRadius: '12px',
                            mx: 2,
                            mb: 1.5,
                        }}
                    >
                        {/* Collapsible Header */}
                        <Box
                            onClick={() => setExpanded(!expanded)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    fontSize: '0.95rem',
                                }}
                            >
                                Not ready to implement Stellate as proxy?
                            </Typography>
                            <IconButton size="small" sx={{ color: '#4B5563', p: 0.5 }}>
                                {expanded ? (
                                    <KeyboardArrowUpRoundedIcon />
                                ) : (
                                    <KeyboardArrowDownRoundedIcon />
                                )}
                            </IconButton>
                        </Box>

                        {/* Collapsible Body */}
                        <Collapse in={expanded}>
                            <Box sx={{ mt: 1.5 }}>
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        color: '#4B5563',
                                        lineHeight: 1.5,
                                        mb: 1.5,
                                    }}
                                >
                                    Get started and test-drive Stellate's Metrics API without
                                    routing traffic through Stellate proxy.
                                </Typography>

                                <Box
                                    component="ol"
                                    sx={{
                                        m: 0,
                                        pl: 2.5,
                                        fontSize: '0.875rem',
                                        color: '#4B5563',
                                        lineHeight: 1.6,
                                        '& li': {
                                            mb: 0.75,
                                        },
                                    }}
                                >
                                    <li>Create service here and grab Metrics API access token.</li>
                                    <li>
                                        Use Stellate’s{' '}
                                        <Link
                                            href="#"
                                            underline="none"
                                            sx={{ color: '#2563EB', fontWeight: 500 }}
                                        >
                                            Apollo
                                        </Link>{' '}
                                        or{' '}
                                        <Link
                                            href="#"
                                            underline="none"
                                            sx={{ color: '#2563EB', fontWeight: 500 }}
                                        >
                                            Yoga
                                        </Link>{' '}
                                        plugins, or directly integrate with the{' '}
                                        <Link
                                            href="#"
                                            underline="none"
                                            sx={{ color: '#2563EB', fontWeight: 500 }}
                                        >
                                            Stellate API
                                        </Link>
                                        , to configure your GraphQL client.
                                    </li>
                                    <li>
                                        That’s it, start monitoring and exploring your metrics via
                                        the Stellate dashboard.
                                    </li>
                                </Box>

                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        color: '#4B5563',
                                        mt: 2,
                                    }}
                                >
                                    For more details on each step check out the{' '}
                                    <Box
                                        component="span"
                                        sx={{ fontWeight: 600, color: '#1F2937' }}
                                    >
                                        Stellate Documentation
                                    </Box>
                                </Typography>
                            </Box>
                        </Collapse>
                    </Box>
                </DialogContent>

                {/* Bottom Actions */}
                <DialogActions sx={{ p: 2, pt: 1, pr: 2.5 }}>
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={() => setOpen(false)}
                        sx={{
                            bgcolor: '#4B73E6',
                            color: '#ffffff',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            borderRadius: '8px',
                            px: 2.5,
                            py: 1,
                            '&:hover': {
                                bgcolor: '#3B60D1',
                            },
                        }}
                    >
                        Create Service
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}