import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import Dashboard from "./Dashboard";
import FilterBar from "./FilterBar";
import { useGreeting } from "./../../../hooks/useGreeting";
import { useAuth } from "../../../context/AuthProvider";
const HeroHeader = ({ filtercount, onToggle = () => { }, Traininglist = [], filters = {}, initialFilters = {}, setFilters = () => { }, isAdmin = false }) => {
	const { user } = useAuth();
	const { greeting } = useGreeting();
	const username = user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "Guest";

	return (
		<Box>
			<Dashboard filters={filters} Data={Traininglist} />
			<FilterBar filtercount={filtercount} isAdmin={isAdmin} onToggle={onToggle} filters={filters} initialFilters={initialFilters} setFilters={setFilters} />
		</Box>
	);
};

export default HeroHeader;
