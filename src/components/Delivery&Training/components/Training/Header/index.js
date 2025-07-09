import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import Dashboard from "./Dashboard";
import FilterBar from "./FilterBar";
import { useGreeting } from "./../../../hooks/useGreeting";
import { useAuth } from "../../../context/AuthProvider";
const HeroHeader = ({ onToggle = () => {}, Traininglist = [], filters = {}, initialFilters = {}, setFilters = () => {}, isAdmin = false }) => {
	const { user } = useAuth();
	const { greeting } = useGreeting();
	const username = user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "Guest";

	return (
		<Box>
			{/* Welcome Section */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Box sx={{ display: "flex" }}>
					{isAdmin && (
						<IconButton onClick={onToggle}>
							{" "}
							<ControlPointRoundedIcon fontSize="large" color="info" />{" "}
						</IconButton>
					)}
					<Box>
						<Typography variant="h5" sx={{ fontWeight: "bold", textTransform: "capitalize" }}>
							{greeting}, {username}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Training Dashboard - Optigoapps
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Stats Cards */}
			<Dashboard filters={filters} Data={Traininglist} />
			<FilterBar filters={filters} initialFilters={initialFilters} setFilters={setFilters} />
		</Box>
	);
};

export default HeroHeader;
