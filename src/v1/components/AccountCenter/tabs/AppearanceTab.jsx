import React from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Slider,
  Tooltip,
} from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import SettingsBrightnessRoundedIcon from "@mui/icons-material/SettingsBrightnessRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import { useAppTheme } from "../../../context/ThemeContext";

const ACCENT_COLORS = [
  { label: "Purple", value: "#7808AE" },
  { label: "Blue", value: "#1565c0" },
  { label: "Teal", value: "#00897b" },
  { label: "Orange", value: "#e65100" },
  { label: "Rose", value: "#c62828" },
];

const FONT_SIZES = [
  { value: 1, label: "S" },
  { value: 2, label: "M" },
  { value: 3, label: "L" },
];

const SectionHeader = ({ icon, title, description }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        bgcolor: "action.hover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" fontWeight={600}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  </Box>
);

export default function AppearanceTab() {
  const { mode, setMode, accentColor, setAccentColor, fontSize, setFontSize } =
    useAppTheme();

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={0.5}>
        Appearance
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Customize the look and feel of the app
      </Typography>

      {/* Theme Mode */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: 3,
          mb: 3,
        }}
      >
        <SectionHeader
          icon={<SettingsBrightnessRoundedIcon fontSize="small" />}
          title="Theme"
          description="Choose how the app looks to you"
        />
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, val) => val && setMode(val)}
          sx={{ gap: 1 }}
        >
          <ToggleButton
            value="light"
            sx={{
              borderRadius: "10px !important",
              px: 2.5,
              py: 1,
              border: "1px solid",
              borderColor: "divider",
              textTransform: "none",
              gap: 1,
              fontSize: 13,
            }}
          >
            <LightModeRoundedIcon fontSize="small" />
            Light
          </ToggleButton>
          <ToggleButton
            value="system"
            sx={{
              borderRadius: "10px !important",
              px: 2.5,
              py: 1,
              border: "1px solid",
              borderColor: "divider",
              textTransform: "none",
              gap: 1,
              fontSize: 13,
            }}
          >
            <SettingsBrightnessRoundedIcon fontSize="small" />
            System
          </ToggleButton>
          <ToggleButton
            value="dark"
            sx={{
              borderRadius: "10px !important",
              px: 2.5,
              py: 1,
              border: "1px solid",
              borderColor: "divider",
              textTransform: "none",
              gap: 1,
              fontSize: 13,
            }}
          >
            <DarkModeRoundedIcon fontSize="small" />
            Dark
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Accent Color */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: 3,
          mb: 3,
        }}
      >
        <SectionHeader
          icon={<PaletteRoundedIcon fontSize="small" />}
          title="Accent Color"
          description="Primary color used across the app"
        />
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {ACCENT_COLORS.map((color) => (
            <Tooltip key={color.value} title={color.label} arrow placement="top">
              <Box
                onClick={() => setAccentColor(color.value)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: color.value,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  boxShadow:
                    accentColor === color.value
                      ? `0 0 0 3px white, 0 0 0 5px ${color.value}`
                      : "none",
                  transform: accentColor === color.value ? "scale(1.1)" : "scale(1)",
                  "&:hover": { transform: "scale(1.12)" },
                }}
              >
                {accentColor === color.value && (
                  <CheckRoundedIcon sx={{ color: "white", fontSize: 18 }} />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Paper>

      {/* Font Size */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: 3,
        }}
      >
        <SectionHeader
          icon={<TextFieldsRoundedIcon fontSize="small" />}
          title="Font Size"
          description="Adjust text size across the interface"
        />
        <Box sx={{ px: 1 }}>
          <Slider
            value={fontSize}
            min={1}
            max={3}
            step={1}
            marks={FONT_SIZES.map((f) => ({ value: f.value, label: f.label }))}
            onChange={(_, val) => setFontSize(val)}
            sx={{
              "& .MuiSlider-markLabel": { fontSize: 12, fontWeight: 500 },
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          Current:{" "}
          <b>
            {FONT_SIZES.find((f) => f.value === fontSize)?.label === "S"
              ? "Small"
              : FONT_SIZES.find((f) => f.value === fontSize)?.label === "M"
                ? "Medium"
                : "Large"}
          </b>
        </Typography>
      </Paper>
    </Box>
  );
}
