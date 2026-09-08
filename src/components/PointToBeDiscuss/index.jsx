import { memo, useEffect, useMemo, useState } from "react";
import DataGridTable from "./components/PointGrid/DataGridTable";
import { Box, Paper, Typography, Button, Slide } from "@mui/material";
import FilterOptions from "./components/Header/FilterBar";
import { usePointToDiscuss } from "./context/usePointToDiscuss";
import { useOrderGrid } from "../Delivery&Training/hooks/useOrderGrid";
import { filterDeliveryData } from "../Delivery&Training/utils/deliveryUtils";
import NoAccess from "../Delivery&Training/components/Delivery/OrderGrid/NoAccess";
import { useRoleAccess } from "../Delivery&Training/utils/useRoleAccess";
import DetailPanel from "../Delivery&Training/components/Delivery/OrderGrid/DetailPanel";
import BottomDrawer from "../Delivery&Training/components/Delivery/Form/FormDrawer";
import ReusableConfirmModal from "../Delivery&Training/components/shared/ui/ReuseableModal";
import GmailCompose from "../Delivery&Training/components/Delivery/OrderGrid/MailModal";
import { usePointGridColumns } from "../Delivery&Training/utils/useFilteredColumns";
import { fakeAdminUser } from "../Delivery&Training/constants/TestUser";
import { useLocation } from "react-router-dom";
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CircularProgress from '@mui/material/CircularProgress';
import { HeaderHeight } from "../_ui/HeaderWrapper";

const Index = ({ showNotification }) => {
  const { PointTBData, editData, deleteTopic, MoveToDeliveryBulk } = usePointToDiscuss();
  const { pageSize, setPageSize, setShowTrainingForm, ShowDetails, setShowDetails, IsFormOpen, setIsFormOpen, sortModel, setSortModel, IsMoveModal, setIsMoveModal } = useOrderGrid(PointTBData);

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
      startDate: null,
      endDate: null,
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
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const handleBulkMove = async () => {
    if (rowSelectionModel.length === 0) return;
    setIsBulkMoving(true);
    const success = await MoveToDeliveryBulk(rowSelectionModel.join(","));
    setIsBulkMoving(false);
    if (success) {
      setRowSelectionModel([]);
    }
  };

  const { statusList } = usePointToDiscuss();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("TicketId") ? atob(queryParams.get("TicketId")) : null;
  const idx = queryParams.get("idx") ? atob(queryParams.get("idx")) : null;


  useEffect(() => {
    if (id && idx === "req") {
      setIsFormOpen(true);
    }
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get("search") || params.get("searchQuery");
    if (searchVal !== null && searchVal !== undefined) {
      setFilters((prev) => ({ ...prev, search: searchVal }));
    }
  }, [location.search]);


  const { role, isClient } = useRoleAccess(fakeAdminUser);

  const FiltererdData = useMemo(() => {
    return filterDeliveryData(PointTBData, filters);
  }, [PointTBData, filters]);

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
    // showNotification("Topic updated successfully", "success");
  };

  const handleDelete = async () => {
    setisLoading(true);
    await deleteTopic(showDeleteModal);
    // showNotification("Topic deleted successfully!", "success");
    setisLoading(false);
    setShowDeleteModal(false);
  };

  const HandleEditMode = (data) => {
    setTempEditMode(data);
    setIsFormOpen(true);
  };

  const HandleMoveOrder = (data) => {
    setTempEditMode(data);
    setIsMoveModal(true);
  };

  const ClearEdit = () => {
    setTempEditMode(null);
    setIsFormOpen(false);
  };

  const columns = usePointGridColumns({
    role,
    isClient,
    callbacks: [HandleFormSave, setShowTrainingForm, setShowDetails, showNotification, isClient, HandleEditMode, setShowDeleteModal, SetOpenCompass, HandleMoveOrder],
  });

  console.log("rowSelectionModel", rowSelectionModel)

  if (role === "guest") {
    return <NoAccess />;
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          bgcolor: "#fff !important",
          overflow: "hidden",
          position: "relative",
          py: 2,
          px: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <DetailPanel isClient={true} setOpen={setShowDetails} open={ShowDetails} />
        <BottomDrawer
          title={"Topic"}
          key={IsFormOpen}
          isOpen={IsFormOpen}
          setIsOpen={setIsFormOpen}
          validateForm={false} // or false
          ClearEdit={ClearEdit}
          setTempEditMode={setTempEditMode}
          editValue={TempEditMode}
        />
        <BottomDrawer
          title={"Move To Order"}
          key={IsMoveModal}
          isOpen={IsMoveModal}
          setIsOpen={setIsMoveModal}
          validateForm={false} // or false
          ClearEdit={ClearEdit}
          setTempEditMode={setTempEditMode}
          editValue={TempEditMode}
        />
        <ReusableConfirmModal
          deleteMsg={{
            title: "Delete This Order",
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
          elevation={0}
          sx={{
            width: "100%",
            borderRadius: "0 !important",
            transition: "all ease-in-out 50ms",
            width: "100%",
            bgcolor: "transparent",
            border: "none",
            boxShadow: "none",
            outline: "none",
          }}
        >
          <FilterOptions showAdvanceFilter={true} role={"admin"} isAdmin={true} onformToggle={() => setIsFormOpen(!IsFormOpen)} filters={filters} setFilters={setFilters} />
        </Paper>
        <Paper
          elevation={3}
          sx={{
            height: `calc(100vh - ${100 + HeaderHeight}px)`,
            width: "100%",
            borderRadius: 2,
            transition: "all ease-in-out 50ms",
            width: "100%",
          }}
        >
          <DataGridTable
            setShowDetails={setShowDetails}
            key={"pointtb_grid_table"}
            columns={columns}
            data={FiltererdData}
            getRowId={(row) => row?.SrNo}
            pageSize={pageSize}
            setPageSize={setPageSize}
            sortModel={sortModel}
            setSortModel={setSortModel}
            rowSelectionModel={rowSelectionModel}
            setRowSelectionModel={setRowSelectionModel}
          />
        </Paper>


      </Box>
      <Slide direction="up" in={rowSelectionModel.length > 0} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            bgcolor: "primary.main",
            color: "#ffffff",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0px 10px 30px rgba(37, 99, 235, 0.3)",
          }}
        >
          {/* Close Button */}
          <Box
            component="button"
            onClick={() => setRowSelectionModel([])}
            sx={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </Box>

          <Box sx={{ width: "1px", height: "24px", bgcolor: "rgba(255, 255, 255, 0.3)" }} />

          {/* Text */}
          <Typography sx={{ fontSize: 13, fontWeight: 500, px: 2, letterSpacing: "0.3px", opacity: 0.9 }}>
            Selected: {rowSelectionModel.length}
          </Typography>

          <Box sx={{ width: "1px", height: "24px", bgcolor: "rgba(255, 255, 255, 0.3)" }} />

          {/* Move Action */}
          <Box
            component="button"
            onClick={handleBulkMove}
            disabled={isBulkMoving}
            sx={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: isBulkMoving ? "default" : "pointer",
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              transition: "background 0.2s",
              "&:hover": { bgcolor: isBulkMoving ? "transparent" : "rgba(255, 255, 255, 0.15)" },
              opacity: isBulkMoving ? 0.7 : 1,
            }}
          >
            {isBulkMoving ? <CircularProgress size={16} color="inherit" /> : <ShoppingCartRoundedIcon fontSize="small" />}
            Move to Orders
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default memo(Index);
