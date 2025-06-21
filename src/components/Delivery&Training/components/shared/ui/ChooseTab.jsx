import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function App() {
    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Link
                href="/delivery"
                underline="none"
                sx={{
                    flex: 1,
                    bgcolor: '#007BFF',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: '#0056b3',
                        transform: 'scale(1.02)',
                        boxShadow: 3,
                    },
                    '&:active': {
                        transform: 'scale(0.98)',
                    },
                }}
            >
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Delivery Dashboard
                </Typography>
                <Typography variant="h6">Click to go to Home</Typography>
            </Link>
            <Link
                href="/training"
                underline="none"
                sx={{
                    flex: 1,
                    bgcolor: '#28A745',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: '#1e7e34',
                        transform: 'scale(1.02)',
                        boxShadow: 3,
                    },
                    '&:active': {
                        transform: 'scale(0.98)',
                    },
                }}
            >
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Training Dashboard
                </Typography>
                <Typography variant="h6">Click to go to Training Page</Typography>
            </Link>
        </Box>
    );
}

export default App;