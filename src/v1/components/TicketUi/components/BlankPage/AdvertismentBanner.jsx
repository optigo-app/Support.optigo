import React from 'react'
import imag2 from "../../../../assets/2.svg";
import { Box } from "@mui/material";


const AdvertismentBanner = () => {
    return (
        <Box
            sx={{
                width: 200,
                flexGrow: 1,
                height: "100%",
                borderLeft: "1px solid #dfe1e6",
                bgcolor: "#ffffff",
                overflowY: "auto",
                position: "relative",
                height: "100%",
            }}
        >
            <img src={imag2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", padding: "0", margin: "0" }} />
        </Box>
    )
}

export default AdvertismentBanner