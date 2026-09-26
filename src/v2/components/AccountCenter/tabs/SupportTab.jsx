import React from "react";
import { Box, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import versionData from "./version.json";

const APP_VERSION = versionData.version || "v4.0.0";

export default function SupportTab() {
  return (
    <Box sx={{ mb: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
        Support & Help
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Get assistance, report issues, or read FAQs
      </Typography>

      {/* Box 1: Version Details Card */}
      <Box
        sx={{
          borderRadius: 6,
          border: "1px solid",
          borderColor: "divider",
          p: 3,
          mb: 2,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <InfoOutlinedIcon color="primary" />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              App Version
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Optigo Call Logger & Support System
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.secondary"
          sx={{ mr: 1 }}
        >
          {APP_VERSION}
        </Typography>
      </Box>
    </Box>
  );
}
