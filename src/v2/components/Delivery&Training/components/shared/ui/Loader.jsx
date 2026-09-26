import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

export default function CenteredCircularLoader({ size = 60, color = "primary" }) {
	return (
		<Box display="flex" justifyContent="center" alignItems="center" bgcolor={"#fff !important"} height="100vh" position={"fixed"} top={0} right={0} left={0} bottom={0}>
			<CustomCircularLoader />
		</Box>
	);
}

const LoaderContainer = styled(Box)(({ theme }) => ({
	width: "4.25em",
	transformOrigin: "center",
	animation: "rotate4 2s linear infinite",
	"@keyframes rotate4": {
		"100%": {
			transform: "rotate(360deg)",
		},
	},
}));

const StyledCircle = styled("circle")({
	fill: "none",
	stroke: "#106ee8",
	strokeWidth: 8,
	strokeDasharray: "2, 200",
	strokeDashoffset: 0,
	strokeLinecap: "round",
	animation: "dash4 1.5s ease-in-out infinite",
	"@keyframes dash4": {
		"0%": {
			strokeDasharray: "1, 200",
			strokeDashoffset: 0,
		},
		"50%": {
			strokeDasharray: "90, 200",
			strokeDashoffset: "-35px",
		},
		"100%": {
			strokeDashoffset: "-125px",
		},
	},
});

// Main loader component
function CustomCircularLoader() {
	return (
		<LoaderContainer component="svg" viewBox="25 25 50 50">
			<StyledCircle cx="50" cy="50" r="20" />
		</LoaderContainer>
	);
}
