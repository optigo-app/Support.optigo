import { Box, Typography, Button, useTheme } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const NoAccess = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fafafa",
                textAlign: "center",
                px: 3,
            }}
        >
            <LockOutlinedIcon
                sx={{
                    fontSize: 80,
                    color: theme.palette.primary.main,
                    mb: 2,
                    opacity: 0.8,
                }}
            />
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600, color: "#333" }}
            >
                Access Denied
            </Typography>
            <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mb: 3, maxWidth: 500 }}
            >
                You don't have permission to access this page. Please contact your
                administrator if you believe this is an error.
            </Typography>
            <Button
                variant="contained"
                onClick={() => window.location.href = "/"}
                sx={{
                    mt: 2,
                    bgcolor: '#007BFF',
                    color: 'white',
                    '&:hover': {
                        bgcolor: '#0059B2'
                    }

                }}
            >
                Go Back
            </Button>
        </Box>
    );
};

export default NoAccess;