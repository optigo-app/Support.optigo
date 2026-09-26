import { Box, Card, Tab, Tabs, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100vh",
  boxSizing: "border-box",
  width: "100%",
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  overflow: "hidden",
}));

const ProjectContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "#ffffff",
}));

const RightPanel = styled(Box)(({ theme }) => ({
  width: "330px",
  backgroundColor: "#ffffff",
  overflowY: "auto",
}));

const TaskCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  marginBottom: "12px",
  border: "1px solid #e0e4e7",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
}));

const SegmentedTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 37,
  height: 37,
  backgroundColor: "#f1f5f9",
  borderRadius: 8,
  padding: 4,
  display: "inline-flex",
  marginBottom: 16,
  "& .MuiTabs-indicator": {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    height: "100%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  },
}));

const SegmentedTab = styled(Tab)(({ theme }) => ({
  minHeight: 24,
  height: 24,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.75rem",
  color: "#64748b",
  borderRadius: 6,
  zIndex: 1,
  padding: "4px 12px",
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: "#0f172a",
  },
}));

// Mockup-inspired Action Buttons
const PrimaryActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 8,
  padding: "8px 20px",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
}));

const SecondaryActionButton = styled(Button)(({ theme }) => ({
  border: "1px solid #cbd5e1",
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 8,
  padding: "8px 20px",
}));

export {
  MainContainer,
  MainContent,
  ContentArea,
  ProjectContent,
  RightPanel,
  TaskCard,
  SegmentedTabs,
  SegmentedTab,
  PrimaryActionButton,
  SecondaryActionButton,
};
