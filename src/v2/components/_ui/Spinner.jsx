import { Box, Paper } from "@mui/material";
import React from "react";
import { RotatingLines } from "react-loader-spinner";

const Spinner = () => {
    return (
        <Box
            sx={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <RotatingLines visible={true} height="30" width="30" color="#888888ff" strokeWidth="5" animationDuration="0.75" ariaLabel="loading-spinner" />
        </Box>
    );
};

export default Spinner;
