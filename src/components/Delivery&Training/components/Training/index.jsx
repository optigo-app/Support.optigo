import { Box, Paper } from "@mui/material";
import TrainingForm from "./Form/TrainingForm";
import { useTrainingForm } from "../../hooks/useTrainingForm";
import TrainGrid from "./Grid/TrainGrid";
import { getDeliveryColumns } from "./Grid/ColumnList";
import HeroHeader from "./Header";
import TrainingDetailPanel from "./DetailPanel";
import { useTraining } from "../../context/TrainingProvider";
import { useMemo, useState } from "react";
import { filterTrainingData } from "./../../utils/TrainingUtils";
import { useUrlSyncedFilters } from "../../hooks/useUrlSyncedFilters";
import { useAuth } from "../../context/AuthProvider";
import WithNotificationDT from "../../../../hoc/withNotificationDT";
import { useRoleAccess } from "../../utils/useRoleAccess";

const initialFilters = {
    search: "",
    dateRange: {
        startDate: "",
        endDate: "",
    },
    trainingType: "All",
    trainingMode: "All",
    status: "All",
};
const TrainingDashboard = ({ showNotification }) => {
    const [TempEditMode, setTempEditMode] = useState(null);
    const { Traininglist } = useTraining();
    const { ShowTrainingForm, setShowTrainingForm, pageSize, setPageSize, DetailModal, setDetailModal, setSortModel, sortModel, handleClose } = useTrainingForm();
    const { user } = useAuth();
    const { isAdminDashboard } = useRoleAccess(user)
    const HandleEditMode = (data) => {
        setTempEditMode(data)
        setShowTrainingForm(true);
    };
    const handleCloseWrapper = () => {
        setShowTrainingForm(false);
        setTempEditMode(null);
        handleClose();
    }

    const isAdmin = isAdminDashboard || false;
    const columns = getDeliveryColumns(setDetailModal, HandleEditMode, showNotification, isAdmin);

    const { filters, setFilters } = useUrlSyncedFilters(initialFilters);

    const filteredData = useMemo(() => {
        return filterTrainingData(filters, Traininglist);
    }, [filters, Traininglist]);

    const HandleResetFilter = () => {
        setFilters(initialFilters);
    }

    const HEIGHT_CALCULATION = process.env.NODE_ENV === 'development' ? '340px' : '390px';

    return (
        <>
            <TrainingForm onNotification={showNotification} onReset={HandleResetFilter} key={ShowTrainingForm} editValue={TempEditMode} open={ShowTrainingForm} onClose={handleCloseWrapper} />
            <TrainingDetailPanel isAdmin={isAdmin} open={DetailModal} onClose={() => setDetailModal(null)} />
            <Box sx={{ width: "100%", height: "100vh", p: 4, bgcolor: "#fff !important" }}>
                <HeroHeader isAdmin={isAdmin} filters={filters} initialFilters={initialFilters} setFilters={setFilters} Traininglist={filteredData} onToggle={() => setShowTrainingForm(true)} />
                <Paper
                    elevation={3}
                    sx={{
                        height: `calc(100vh - 340px)`,
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
