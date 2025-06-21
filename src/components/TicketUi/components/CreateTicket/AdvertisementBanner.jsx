import { Box } from "@mui/material";
import React from "react";

const AdvertisementBanner = ({ src }) => {
  return (
    <Box
      sx={{
        width: 200,
        flexGrow: 1,
        height: "100%",
        borderLeft: "1px solid #dfe1e6",
        bgcolor: "#ffffff",
      }}
    >
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Box>
  );
};

export default AdvertisementBanner;
