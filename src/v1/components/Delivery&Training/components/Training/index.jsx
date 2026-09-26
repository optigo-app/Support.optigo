import { Box, Paper } from "@mui/material";
import TrainingForm from "./Form/TrainingForm";
import { useTrainingForm } from "../../hooks/useTrainingForm";
import TrainGrid from "./Grid/TrainGrid";
import { getDeliveryColumns } from "./Grid/ColumnList";
import HeroHeader from "./Header";
import TrainingDetailPanel from "./DetailPanel";
import { useTraining } from "../../context/TrainingProvider";
import { useMemo } from "react";
import { filterTrainingData } from "./../../utils/TrainingUtils";
import { useUrlSyncedFilters } from "../../hooks/useUrlSyncedFilters";
import { useAuth } from "../../context/AuthProvider";
import WithNotificationDT from "../../../../hoc/withNotificationDT";
import { useRoleAccess } from "../../utils/useRoleAccess";
import { useTrainingFormStore, openTrainingForm, closeTrainingForm } from "../../../../rxjs/tableUiStore";
import { HeaderHeight } from "../../../_ui/HeaderWrapper";

const initialFilters = {
	search: "",
	dateRange: {
		startDate: "",
		endDate: "",
	},
	trainingType: "All",
	trainingMode: "All",
	status: "All",
	company: [],
};
const TrainingDashboard = ({ showNotification }) => {
	const { Traininglist } = useTraining();
	const { pageSize, setPageSize, DetailModal, setDetailModal, setSortModel, sortModel, handleClose } = useTrainingForm();
	const { user } = useAuth();
	const { isAdminDashboard } = useRoleAccess(user);

	// RxJS-driven form state — no useState, no remount
	const { open: ShowTrainingForm, editValue: TempEditMode } = useTrainingFormStore();

	const HandleEditMode = (data) => {
		openTrainingForm(data);
	};

	const handleCloseWrapper = () => {
		closeTrainingForm();
		handleClose();
	};

	const isAdmin = isAdminDashboard || false;
	const columns = getDeliveryColumns(setDetailModal, HandleEditMode, showNotification, isAdmin);

	const { filters, setFilters } = useUrlSyncedFilters(initialFilters);

	const filteredData = useMemo(() => {
		return filterTrainingData(filters, Traininglist);
	}, [filters, Traininglist]);

	const HandleResetFilter = () => {
		setFilters(initialFilters);
	};

	return (
		<>
			{/* No key prop — form stays mounted, Drawer simply animates open/close instantly */}
			<TrainingForm onNotification={showNotification} onReset={HandleResetFilter} editValue={TempEditMode} open={ShowTrainingForm} onClose={handleCloseWrapper} />
			<TrainingDetailPanel isAdmin={isAdmin} open={DetailModal} onClose={() => setDetailModal(null)} />
			<Box
				sx={{
					width: "100%",
					p: 2,
					bgcolor: "#fff !important",
				}}
			>
				<HeroHeader filtercount={filteredData.length || 0} isAdmin={isAdmin} filters={filters} initialFilters={initialFilters} setFilters={setFilters} Traininglist={filteredData} onToggle={() => openTrainingForm(null)} />
				<Paper
					elevation={3}
					sx={{
						height: `calc(100vh - ${246 + HeaderHeight + 2}px)`,
						width: "100%",
						borderRadius: 2,
					}}
				>
					<TrainGrid deliveryData={filteredData} setPageSize={setPageSize} pageSize={pageSize} columns={columns} setSortModel={setSortModel} sortModel={sortModel} />
				</Paper>
			</Box>
		</>
	);
};

export default WithNotificationDT(TrainingDashboard);

