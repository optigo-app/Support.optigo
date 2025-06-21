import { Box, Paper } from "@mui/material";
import DataGridTable from "./OrderGrid/DataGridTable";
import TrainingForm from "./OrderGrid/TrainingForm";
import DetailPanel from "./OrderGrid/DetailPanel";
import BottomDrawer from "./Form/FormDrawer";
import { useDelivery } from "../../context/DeliveryProvider";
import { useOrderGrid } from "../../hooks/useOrderGrid";
import { getDeliveryColumns } from "./OrderGrid/deliveryColumns";
import { roleFieldsMap } from "../../constants/constants";
import { useAuth } from "../../context/AuthProvider";
import Dashboard from "./OrderGrid/Analytics/AnalyticsBar";
import { useGreeting } from "./../../hooks/useGreeting";
import { useMemo, useState } from "react";
import { filterDeliveryData } from "../../utils/deliveryUtils";
import ReusableConfirmModal from "./../shared/ui/ReuseableModal";
import WithNotificationDT from "../../../../hoc/withNotificationDT";
import GmailCompose from "./OrderGrid/MailModal";

const DeliveryDashboard = ({ showNotification, isAdminLog, isAdminOptigo }) => {
  const { deliveryData, editData, deleteTraining } = useDelivery();
  const { pageSize, setPageSize, ShowTrainingForm, setShowTrainingForm, ShowDetails, setShowDetails, IsFormOpen, setIsFormOpen, sortModel, setSortModel, dashboardData } = useOrderGrid(deliveryData);
  const { LoggedUser } = useAuth();
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
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [OpenCompass, SetOpenCompass] = useState(false);
  const [TempEditMode, setTempEditMode] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  const handleDelete = async () => {
    setisLoading(true);
    await deleteTraining(showDeleteModal);
    showNotification("Training deleted successfully!", "success");
    setisLoading(false);
    setShowDeleteModal(false);
  };

  const HandleEditMode = (data) => {
    setTempEditMode(data);
    setIsFormOpen(true);
  };

  const HandleFormSave = (...args) => {
    editData(...args);
    showNotification("Edited successfully", "success");
  };

  const ClearEdit = () => {
    setTempEditMode(null);
    setIsFormOpen(false);
  };

  const FiltererdData = useMemo(() => {
    return filterDeliveryData(deliveryData, filters);
  }, [deliveryData, filters]);

  let role, isClient, isAdminDasboard;

  if (isAdminOptigo === true) {
    role = "optigoAdmin";
    isClient = false;
    isAdminDasboard = true;
  } else if (isAdminLog === true) {
    role = "admin";
    isClient = false;
    isAdminDasboard = true;
  } else {
    role = "client";
    isClient = true;
    isAdminDasboard = false;
  }

  const allowedFields = roleFieldsMap[role] || roleFieldsMap?.client;

  const allColumns = getDeliveryColumns(HandleFormSave, setShowTrainingForm, setShowDetails, showNotification, isClient, HandleEditMode, setShowDeleteModal ,SetOpenCompass);
  const filteredColumns = allColumns
    .filter((col) => allowedFields.includes(col.field))
    .map((col, i) => ({
      ...col,
      ...(role === "client" ? { flex: 1 } : {}),
    }));

  return (
    <Box sx={{ width: "100%", height: "100vh", bgcolor: "#fff !important", overflow: "hidden", position: "relative", py: 2, px: 4 }}>
      <DetailPanel setOpen={setShowDetails} open={ShowDetails} />
      <BottomDrawer key={IsFormOpen} ClearEdit={ClearEdit} editValue={TempEditMode} isOpen={IsFormOpen} setIsOpen={setIsFormOpen} />
      <TrainingForm open={ShowTrainingForm} setOpen={setShowTrainingForm} onSave={HandleFormSave} />
      <Dashboard isAdmin={isAdminDasboard} dashboardData={dashboardData} filters={filters} setFilters={setFilters} onformToggle={() => setIsFormOpen(!IsFormOpen)} greeting={greeting} LoggedUser={LoggedUser} />
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
      {OpenCompass && <GmailCompose orderdata={OpenCompass}  onClose={() => SetOpenCompass(null)} />}
      <Paper
        elevation={3}
        sx={{
          height: `calc(100vh - ${isAdminDasboard ? 480 : 390}px)`,
          width: "100%",
          borderRadius: 2,
          transition: "all ease-in-out 50ms",
        }}
      >
        <DataGridTable columns={filteredColumns} getRowId={(row) => row?.SrNo} deliveryData={FiltererdData} pageSize={pageSize} setPageSize={setPageSize} sortModel={sortModel} setSortModel={setSortModel} />
      </Paper>
    </Box>
  );
};

export default WithNotificationDT(DeliveryDashboard);
