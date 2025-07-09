import React from "react";
import { Box, styled } from "@mui/material";

const ToggleWrapper = styled(Box)(({ theme }) => ({
	backgroundColor: "#f0f0f0",
	borderRadius: "8px",
	display: "flex",
	padding: "4px",
	width: "100%",
	maxWidth: 400,
}));

const ToggleButton = styled(Box)(({ selected }) => ({
	flex: 1,
	textAlign: "center",
	padding: "6px 12px",
	fontSize: "14px",
	fontWeight: selected ? 600 : 500,
	backgroundColor: selected ? "#ffffff" : "transparent",
	color: "black",
	borderRadius: "6px",
	cursor: "pointer",
	transition: "all 0.2s ease",
	userSelect: "none",
}));

export default function CustomToggleTabs({ filters, setFilters }) {
	const active = filters.Tabs;

	const handleSelect = (value) => {
		if (active !== value) {
			setFilters((prev) => ({
				...prev,
				Tabs: value,
			}));
		}
	};

	return (
		<ToggleWrapper>
			<ToggleButton selected={active === 0} onClick={() => handleSelect(0)}>
				Delivered
			</ToggleButton>
			<ToggleButton selected={active === 1} onClick={() => handleSelect(1)}>
				Upcoming
			</ToggleButton>
		</ToggleWrapper>
	);
}
