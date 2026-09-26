import { styled } from "@mui/material/styles";
import { Button, Avatar, Box, Typography } from "@mui/material";

export const GlassLogoutButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: theme.spacing(1.5),
  borderRadius: 25,
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(12px) saturate(180%)",
  WebkitBackdropFilter: "blur(12px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.95rem",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",

  "&:hover": {
    background: "rgba(255, 255, 255, 0.18)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },

  "&:active": {
    background: "rgba(255, 255, 255, 0.22)",
    transform: "scale(0.98)",
  },
}));

export default function LogoutButton({handleLogout}) {
  return (
    <GlassLogoutButton size="small"
    onClick={handleLogout}
    >
      <Avatar src="log.svg" alt="User" sx={{ width: 28, height: 28 }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        Logout
      </Typography>
    </GlassLogoutButton>
  );
}
