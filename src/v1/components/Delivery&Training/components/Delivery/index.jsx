import { memo, useEffect, useMemo, useState } from "react";
import { Box, Paper } from "@mui/material";
import DataGridTable from "./OrderGrid/DataGridTable";
import TrainingForm from "./OrderGrid/TrainingForm";
import DetailPanel from "./OrderGrid/DetailPanel";
import BottomDrawer from "./Form/FormDrawer";
import { useDelivery } from "../../context/DeliveryProvider";
import { useOrderGrid } from "../../hooks/useOrderGrid";
import { useAuth } from "../../context/AuthProvider";
import Dashboard from "./OrderGrid/Analytics/AnalyticsBar";
import { useGreeting } from "./../../hooks/useGreeting";
import { filterDeliveryData } from "../../utils/deliveryUtils";
import ReusableConfirmModal from "./../shared/ui/ReuseableModal";
import { useFilteredColumns } from "../../utils/useFilteredColumns";
import { fakeClientUser } from "../../constants/TestUser";
import { useRoleAccess } from "../../utils/useRoleAccess";
import DeliveredModal from "./OrderGrid/DeliveredModal";
import DynamicAnalytics from "../../utils/analytics";
import GmailCompose from "./OrderGrid/MailModal";
import NoAccess from "./OrderGrid/NoAccess";
import { useFullscreenToggle } from "../../../../hooks/useFullscreenToggle";
import { useLocation } from "react-router-dom";
import { HeaderHeight } from "../../../_ui/HeaderWrapper";

const DeliveryDashboard = ({ showNotification }) => {
	const { deliveryData, editData, deleteTraining } = useDelivery();
	const { pageSize, setPageSize, ShowTrainingForm, setShowTrainingForm, ShowDetails, setShowDetails, IsFormOpen, setIsFormOpen, sortModel, setSortModel } = useOrderGrid(deliveryData);
	const { LoggedUser, user } = useAuth();
	const { greeting } = useGreeting();

	const [filters, setFilters] = useState({
		search: "",
		approval: "",
		projectCode: null,
		topicType: "",
		serviceType: [],
		onDemandOption: "",
		paymentMethod: [],
		paymentStatus: [],
		isFavorite: false,
		date: {
			startDate: "",
			endDate: "",
			status: "",
		},
		Tabs: -1,
		deliveryStatus: "",
		currentStatus: "",
	});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [OpenCompass, SetOpenCompass] = useState(false);
	const [TempEditMode, setTempEditMode] = useState(null);
	const [isLoading, setisLoading] = useState(false);
	const { isFullscreen, toggleFullscreen } = useFullscreenToggle();
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const searchVal = params.get("search") || "";
		if (searchVal !== filters.search) {
			setFilters((prev) => ({ ...prev, search: searchVal }));
		}
	}, [location.search]);

	const { role, isClient, isAdminDashboard } = useRoleAccess(user);

	const FiltererdData = useMemo(() => {
		return filterDeliveryData(deliveryData, filters);
	}, [deliveryData, filters]);

	const dashboardData = new DynamicAnalytics(FiltererdData)?.generateAnalytics();

	const handleDelete = async () => {
		setisLoading(true);
		await deleteTraining(showDeleteModal);
		setisLoading(false);
		setShowDeleteModal(false);
	};

	const HandleEditMode = (data) => {
		setTempEditMode(data);
		setIsFormOpen(true);
	};

	const transformFields = (fields) => {
		const result = { ...fields };
		if ("OnDemand" in result) {
			result.OnDemand = result.OnDemand === "Client" ? "yes" : "no";
		}
		if ("Mode" in result) {
			result.DeliveryMode = result.Mode;
			delete result.Mode;
		}
		return result;
	};


	const HandleFormSave = (...args) => {
		const [rowId, updatedFields] = args;
		editData(rowId, transformFields(updatedFields));
	};


	const ClearEdit = () => {
		setTempEditMode(null);
		setIsFormOpen(false);
	};

	const columns = useFilteredColumns({
		role,
		isClient,
		callbacks: [HandleFormSave, setShowTrainingForm, setShowDetails, showNotification, isClient, HandleEditMode, setShowDeleteModal, SetOpenCompass],
	});

	if (role === "guest") {
		return <NoAccess />;
	}

	return (
		<Box
			sx={{
				width: "100%",
				bgcolor: "#fff !important",
				overflow: "hidden",
				position: "relative",
				py: 2,
				px: 2,
			}}
		>
			<DetailPanel isClient={isAdminDashboard} setOpen={setShowDetails} open={ShowDetails} />
			<BottomDrawer key={IsFormOpen} ClearEdit={ClearEdit} setTempEditMode={setTempEditMode} editValue={TempEditMode} isOpen={IsFormOpen} setIsOpen={setIsFormOpen} />
			{/* <TrainingForm open={ShowTrainingForm} setOpen={setShowTrainingForm} onSave={HandleFormSave} /> */}
			<Dashboard isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} role={role} isAdmin={isAdminDashboard} dashboardData={dashboardData} filters={filters} setFilters={setFilters} onformToggle={() => setIsFormOpen(!IsFormOpen)} greeting={greeting} LoggedUser={LoggedUser} />
			<ReusableConfirmModal
				deleteMsg={{
					title: "Delete Order",
					message: "Are you sure you want to permanently delete this order? This action cannot be undone.",
				}}
				open={showDeleteModal}
				onClose={() => setShowDeleteModal(null)}
				onConfirm={handleDelete}
				type="delete"
				isLoading={isLoading}
			/>
			{OpenCompass && <GmailCompose orderdata={OpenCompass} onClose={() => SetOpenCompass(null)} />}
			<Paper
				elevation={3}
				sx={{
					height: `calc(100vh - ${isFullscreen ? 90+HeaderHeight : isAdminDashboard ? 280+ HeaderHeight : 390 + HeaderHeight}px)`,
					width: "100%",
					borderRadius: 2,
					transition: "ease-in-out 50ms",
				}}
			>
				<DataGridTable setShowDetails={setShowDetails} key={`grid-table-945`} columns={columns} getRowId={(row) => row?.SrNo} deliveryData={FiltererdData} pageSize={pageSize} setPageSize={setPageSize} sortModel={sortModel} setSortModel={setSortModel} />
			</Paper>
		</Box>
	);
};

export default memo(DeliveryDashboard);
