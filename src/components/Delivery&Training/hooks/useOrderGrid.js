import { useState } from "react";
import DynamicAnalytics from "../utils/analytics";

export const useOrderGrid = (deliveryData) => {
	const [pageSize, setPageSize] = useState(25);
	const [ShowTrainingForm, setShowTrainingForm] = useState(false);
	const [ShowDetails, setShowDetails] = useState(false);
	const [IsFormOpen, setIsFormOpen] = useState(false);
	const [sortModel, setSortModel] = useState([{ field: "ticketDate", sort: "desc" }]);

	const analytics = new DynamicAnalytics(deliveryData);
	const dashboardData = analytics.generateAnalytics();

	return {
		pageSize,
		setPageSize,
		ShowTrainingForm,
		setShowTrainingForm,
		ShowDetails,
		setShowDetails,
		IsFormOpen,
		setIsFormOpen,
		sortModel,
		setSortModel,
		dashboardData,
	};
};
