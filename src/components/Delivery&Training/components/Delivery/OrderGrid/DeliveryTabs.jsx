import { Box, Button, styled } from "@mui/material";
import TollRoundedIcon from "@mui/icons-material/TollRounded";
import { useNavigate, useViewTransitionState } from "react-router-dom";

export const ToggleWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: "#f0f0f0",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  padding: "3px",
  height: "38px",
  width: "100%",
  boxSizing: "border-box",
}));

export const ToggleButton = styled(Box)(({ selected }) => ({
  flex: 1,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "32px",
  fontSize: "13px",
  fontWeight: selected ? 600 : 500,
  backgroundColor: selected ? "#ffffff" : "transparent",
  color: selected ? "#0f172a" : "#64748b",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  userSelect: "none",
  boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
}));

const PointButton = styled(Button)(({ theme }) => ({
  padding: "7px 12px",
  fontSize: "14px",
  position: "relative",
  marginLeft: "10px",
  background: "rgb(253, 203, 110)",
  "&:hover": {
    background: "rgb(253, 203, 110)",
  },
}));

export default function CustomToggleTabs({ filters, setFilters }) {
  const active = filters.Tabs;
  const navigate = useNavigate();

  const HandlePageRoute = () => {
    navigate("/orderRequest");
  };

  const handleSelect = (value) => {
    if (active !== value) {
      setFilters((prev) => ({
        ...prev,
        Tabs: value,
      }));
    }
  };

  return (
    <>
      <ToggleWrapper>
        <ToggleButton selected={active === 0} onClick={() => handleSelect(0)}>
          Delivered
        </ToggleButton>
        <ToggleButton selected={active === 1} onClick={() => handleSelect(1)}>
          Upcoming
        </ToggleButton>
      </ToggleWrapper>
      {/* <PointButton onClick={HandlePageRoute} fullWidth variant="contained" size="small" startIcon={<TollRoundedIcon />}>
        Order Request
      </PointButton> */}
    </>
  );
}
