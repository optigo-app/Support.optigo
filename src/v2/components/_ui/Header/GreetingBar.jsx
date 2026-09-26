import React from 'react'
import { Box, Avatar, Typography, useTheme } from '@mui/material'

const GreetingBar = ({ user, greeting, username }) => {
    const theme = useTheme();
    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
                <Avatar
                    sx={{
                        bgcolor: "#2177EA",
                        color: "white",
                        width: 40,
                        height: 40,
                        fontWeight: 600,
                        fontSize: "1.25rem",
                        textTransform: "uppercase",
                    }}
                >
                    {user?.firstname?.charAt(0) || "G"}
                </Avatar>
                <Box>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontSize: "0.75rem",
                        }}
                    >
                        {greeting},
                    </Typography>
                    <Typography
                        variant="h5"
                        component="h1"
                        fontWeight={600}
                        sx={{
                            fontSize: "1.2rem",
                            [theme.breakpoints.down("sm")]: { fontSize: "1.1rem" },
                            textTransform: "capitalize",
                        }}
                    >
                        {username}
                    </Typography>
                </Box>
            </Box>
        </>
    )
}

export default GreetingBar