import { Drawer, Box, Chip, Tabs, Paper, styled } from "@mui/material";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = dayjs(dateString, [
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY/MM/DD",
    "DD-MM-YYYY",
    "MM-DD-YYYY",
    "YYYY.MM.DD",
    "DD.MM.YYYY",
    "MM.DD.YYYY",
    "YYYY-MM-DDTHH:mm:ssZ",
  ]);

  return date.isValid() ? date.format("DD/MM/YYYY") : "Invalid Date";
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  ".MuiDrawer-paper": {
    width: 480,
    maxWidth: "95vw",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 20px 60px rgba(0,0,0,0.12)",
    transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  backgroundColor: "#fafafa",
}));

const TabsContainer = styled(Tabs)(({ theme }) => ({
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  backgroundColor: "#ffffff",
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    minHeight: 48,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.02)",
    },
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowY: "auto",
  height: "calc(100vh - 220px)",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(0,0,0,0.1)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(0,0,0,0.15)",
    },
  },
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  border: "1px solid rgba(0,0,0,0.06)",
  backgroundColor: "#fafafa",
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#f5f5f5",
  },
}));

const CommentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  border: "1px solid rgba(0,0,0,0.06)",
  backgroundColor: "#fafafa",
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "rgba(0,0,0,0.1)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
}));

const TaskCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: "1px solid rgba(0,0,0,0.08)",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  "&:hover": {
    borderColor: "rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.75rem",
  height: 26,
  borderRadius: theme.spacing(0.75),
}));

const NavigationBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: "1px solid rgba(0,0,0,0.06)",
  backgroundColor: "#fafafa",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));


export {
    StyledDrawer,
    HeaderBox,
    TabsContainer,
    ContentBox,
    InfoCard,
    CommentCard,
    TaskCard,
    StyledChip,
    NavigationBox,
    formatDate
}