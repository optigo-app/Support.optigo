import { styled } from "@mui/material/styles";
import { Box, Card, TextField, Button, Typography } from "@mui/material";

export const RootContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f9f9f9 0%, #f1f1f1 100%)",
  padding: "16px",
});

export const MainCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 450,
  borderRadius: "10px",
  padding: theme.spacing(4),
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

export const LogoContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "8px",
});

export const LogoIcon = styled("img")({
  height: 36,
  objectFit: "contain",
});

export const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.4rem",
  fontWeight: 600,
  textAlign: "center",
  color: "#111",
}));

export const WelcomeSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  textAlign: "center",
  color: "#666",
  marginBottom: theme.spacing(2),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    fontSize: "0.9rem",
  },
}));

export const SignUpButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 12,
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1.2),
  fontSize: "0.95rem",
}));

// import { Box, Typography, TextField, Button, Link, Card, Avatar, IconButton, Grid } from "@mui/material";
// import { styled } from "@mui/material/styles";

// const CarouselCard = styled(Card)(({ theme }) => ({
//   padding: theme.spacing(3),
//   backgroundColor: "#ffffff",
//   color: "#1a1a1a",
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "flex-start",
//   boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
// }));

// const RootContainer = styled(Box)(({ theme }) => ({
//   height: "100vh",
//   backgroundColor: "#f5f5f5",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   padding: theme.spacing(2),
//   fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
// }));

// const MainCard = styled(Card)(({ theme }) => ({
//   display: "flex",
//   maxWidth: "100%",
//   width: "100%",
//   borderRadius: 24,
//   overflow: "hidden",
//   [theme.breakpoints.down("md")]: {
//     flexDirection: "column",
//   },
//   height: "100% !important",
// }));

// const LeftPanel = styled(Box)(({ theme }) => ({
//   flex: 0.6,
//   padding: theme.spacing(14),
//   [theme.breakpoints.down("lg")]: {
//     padding: theme.spacing(10),
//   },
//   [theme.breakpoints.down("md")]: {
//     padding: theme.spacing(6),
//   },
//   [theme.breakpoints.down("sm")]: {
//     padding: theme.spacing(4),
//   },
//   backgroundColor: "#ffffff",
//   display: "flex",
//   flexDirection: "column",
//   [theme.breakpoints.down("md")]: {
//     padding: theme.spacing(4),
//   },
//   height: "100% ",
//   backgroundColor: "white",
// }));

// const RightPanel = styled(Box)(({ theme }) => ({
//   flex: 1,
//   height: "100% ",
//   backgroundColor: "transparent",
// }));

// const LogoContainer = styled(Box)(({ theme }) => ({
//   width: 80,
//   height: 80,
//   borderRadius: 12,
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   marginBottom: theme.spacing(3),
// }));

// const LogoIcon = styled(`img`)({
//   width: "100%",
//   height: "100%",
// });

// const WelcomeTitle = styled(Typography)(({ theme }) => ({
//   fontSize: "28px",
//   fontWeight: 600,
//   color: "#1a1a1a",
//   marginBottom: theme.spacing(1),
// }));

// const WelcomeSubtitle = styled(Typography)(({ theme }) => ({
//   fontSize: "14px",
//   color: "#666666",
//   marginBottom: theme.spacing(4),
// }));

// const StyledTextField = styled(TextField)(({ theme }) => ({
//   marginBottom: theme.spacing(2),
//   "& .MuiOutlinedInput-root": {
//     backgroundColor: "#ffffff",
//     "& fieldset": {
//       borderColor: "#e0e0e0",
//     },
//     "&:hover fieldset": {
//       borderColor: "#1a4d3a",
//     },
//     "&.Mui-focused fieldset": {
//       borderColor: "#1a4d3a",
//     },
//   },
// }));

// const SignUpButton = styled(Button)(({ theme }) => ({
//   background: "linear-gradient(135deg, #FFDD57, #F5C22A)", // softer yellow gradient
//   color: "#1a1a1a", // better contrast on yellow
//   borderRadius: 8,
//   padding: theme.spacing(1.5),
//   fontSize: "16px",
//   fontWeight: 600,
//   textTransform: "none",
//   marginTop: theme.spacing(2),
//   marginBottom: theme.spacing(3),
//   boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // subtle depth
//   backgroundSize: "200% 200%",
//   transition: "all 0.4s ease",
//   "&:hover": {
//     backgroundPosition: "right center",
//     filter: "brightness(1.05)",
//     boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
//   },
// }));

// export { CarouselCard, RootContainer, MainCard, LeftPanel, RightPanel, LogoContainer, LogoIcon, WelcomeTitle, WelcomeSubtitle, StyledTextField, SignUpButton };
