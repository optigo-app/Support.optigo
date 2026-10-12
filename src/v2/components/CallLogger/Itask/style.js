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
  "& .MuiDrawer-paper": {
    width: 380,
    maxWidth: "calc(100vw - 32px)",
    margin: 16,
    height: "calc(100% - 32px)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    border: "1px solid #E2E8F0",
    backgroundColor: "#FAFAFB",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(2px)",
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.8, 2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #F1F5F9",
  backgroundColor: "#FFFFFF",
}));

const TabsContainer = styled(Tabs)(({ theme }) => ({
  borderBottom: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  minHeight: 40,
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.85rem",
    minHeight: 40,
    color: "#64748B",
    transition: "all 0.15s ease",
    "&.Mui-selected": {
      color: "#0052CC !important",
    },
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "#0052CC",
    height: 3,
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowY: "auto",
  flex: 1,
  backgroundColor: "#FAFAFB",
  "&::-webkit-scrollbar": {
    width: "5px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#CBD5E1",
    borderRadius: "4px",
    "&:hover": {
      background: "#94A3B8",
    },
  },
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#CBD5E1",
  },
}));

const CommentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.6),
  marginBottom: theme.spacing(1.2),
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#CBD5E1",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
}));

const TaskCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.2),
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  cursor: "pointer",
  "&:hover": {
    borderColor: "#CBD5E1",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.72rem",
  height: 22,
  borderRadius: "6px",
}));

const NavigationBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderTop: "1px solid #F1F5F9",
  backgroundColor: "#FFFFFF",
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