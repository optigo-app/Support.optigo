import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { useAuth } from "../../../context/UseAuth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const getInitials = (firstname, lastname) =>
  `${firstname?.[0] || ""}${lastname?.[0] || ""}`.toUpperCase() || "?";

const getAvatarColor = (str = "") => {
  const colors = [
    "#7808AE",
    "#1565c0",
    "#0277bd",
    "#00695c",
    "#2e7d32",
    "#c62828",
    "#4527a0",
    "#ad1457",
  ];
  let hash = 0;
  for (const ch of str) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function AccountsTab() {
  const { user, savedAccounts, switchAccount, removeSavedAccount } = useAuth();

  const activeEmail = user?.userid || user?.email || "";
  const activeCompany = user?.companycode || user?.companyname || "";

  const isActive = (acc) =>
    acc.email?.toLowerCase() === activeEmail?.toLowerCase() &&
    acc.companyCode?.toLowerCase() === activeCompany?.toLowerCase();

  const activeAccount = savedAccounts.find(isActive) || {
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: activeEmail,
    companyCode: activeCompany,
    designation: user?.designation || "",
  };

  const otherAccounts = savedAccounts
    .filter((acc) => !isActive(acc))
    .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

  const handleAddAccount = () => {
    window.open("/login?addAccount=1", "_blank");
  };

  const activeInitials = getInitials(
    activeAccount.firstname,
    activeAccount.lastname,
  );
  const activeName =
    `${activeAccount.firstname || ""} ${activeAccount.lastname || ""}`.trim() ||
    activeAccount.email;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
        Saved accounts
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Manage and switch between your logged-in company accounts
      </Typography>

      {/* Box 1: Current Active Account Card */}
      <Box
        sx={{
          borderRadius: 6,
          border: "1px solid",
          borderColor: "divider",
          py: 1.8,
          px: 3,
          mb: 2,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          gap: 2.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: getAvatarColor(activeAccount.email),
            width: 40,
            height: 40,
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {activeInitials}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              color="text.primary"
            >
              {activeName}
            </Typography>
            <Chip
              icon={
                <CheckCircleRoundedIcon sx={{ fontSize: "12px !important" }} />
              }
              label="Active"
              size="small"
              color="success"
              sx={{ height: 18, fontSize: 9, fontWeight: 600 }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            display="block"
          >
            {activeAccount.companyCode} ·{" "}
            {activeAccount.designation || activeAccount.email}
          </Typography>
        </Box>
      </Box>

      {/* Box 2: Other Saved Sessions and Add Account Card */}
      <Box
        sx={{
          borderRadius: 6,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {otherAccounts.map((acc, idx) => {
          const initials = getInitials(acc.firstname, acc.lastname);
          const bgColor = getAvatarColor(acc.email);
          const name =
            `${acc.firstname || ""} ${acc.lastname || ""}`.trim() || acc.email;

          return (
            <Box key={`${acc.companyCode}-${acc.email}`}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 3,
                  py: 1.8,
                  gap: 2,
                  transition: "background-color 0.25s",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor: bgColor,
                    width: 40,
                    height: 40,
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </Avatar>

                {/* Info */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    color="text.primary"
                  >
                    {name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    display="flex"
                    alignItems="center"
                    gap={0.4}
                  >
                    {acc.companyCode} · {acc.designation || acc.email}
                    {acc.lastActive && (
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        display="flex"
                        alignItems="center"
                        gap={0.4}
                        sx={{ fontSize: 10, mt: 0.2 }}
                      >
                        - Active {dayjs(acc.lastActive).fromNow()}
                      </Typography>
                    )}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Tooltip title="Switch to this account" arrow>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => switchAccount(acc.skey)}
                    >
                      <SwapHorizRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove session" arrow>
                    <IconButton
                      size="small"
                      onClick={() =>
                        removeSavedAccount(acc.companyCode, acc.email)
                      }
                      sx={{
                        color: "text.disabled",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Divider sx={{ borderColor: "divider" }} />
            </Box>
          );
        })}

        {/* Add Account row */}
        <Box
          onClick={handleAddAccount}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 3,
            py: 1.8,
            gap: 2,
            cursor: "pointer",
            transition: "background-color 0.25s",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Avatar
            sx={{
              bgcolor: "action.hover",
              color: "primary.main",
              width: 40,
              height: 40,
              flexShrink: 0,
            }}
          >
            <AddRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" color="primary.main" fontWeight={500}>
              Add another account
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sign in to another company workspace
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
