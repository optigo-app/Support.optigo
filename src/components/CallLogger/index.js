import React from "react";
import CallLogManagementApp from "./CallLogger";
import MetaWrapper from "../../meta/MetaWrapper";
import { Box } from "@mui/material";
import ActiveCallOverlay from "./New/CallPop";

const CallLogDashBoard = () => {
	return (
		<Box sx={{
			width: '100%'
		}}>
			<MetaWrapper page="CallLog" />
			<CallLogManagementApp />
			
		</Box>
	);
};

export default CallLogDashBoard;
