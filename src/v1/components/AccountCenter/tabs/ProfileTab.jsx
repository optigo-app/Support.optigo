import React from "react";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import { useAuth } from "../../../context/UseAuth";

const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      py: 1.8,
      px: 3,
      transition: "background-color 0.2s",
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
      <Box
        sx={{
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.primary" fontWeight={500}>
          {value || "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default function ProfileTab() {
  const { user, CompanyInfo } = useAuth();
  console.log(user, "user");

  const initials =
    [user?.firstname?.[0], user?.lastname?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const fullName =
    user?.fullName ||
    `${user?.firstname || ""} ${user?.lastname || ""}`.trim() ||
    "Unknown";

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
        Personal info
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Basic info about you and your role in the system
      </Typography>
      {/* Box 2: Profile Details */}
      <Box
        sx={{
          borderRadius: 6,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <InfoRow
          icon={<PersonRoundedIcon fontSize="small" />}
          label="Full name"
          value={fullName}
        />
        <Divider sx={{ borderColor: "divider" }} />
        <InfoRow
          icon={<MailRoundedIcon fontSize="small" />}
          label="Email address"
          value={user?.email || user?.userid || "-"}
        />
        <Divider sx={{ borderColor: "divider" }} />
        <InfoRow
          icon={<BadgeRoundedIcon fontSize="small" />}
          label="Designation"
          value={user?.designation}
        />
        <Divider sx={{ borderColor: "divider" }} />
        <InfoRow
          icon={<BusinessRoundedIcon fontSize="small" />}
          label="Company"
          value={
            CompanyInfo?.companyname ||
            user?.companyname ||
            CompanyInfo?.companycode
          }
        />
      </Box>
    </Box>
  );
}
