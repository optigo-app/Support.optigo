import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";
import CallLogDetailsSidebar from "../CallLogger/DetailSideBar";
import { useCallLog } from "../../context/UseCallLog";
import { useLocation, useNavigate } from "react-router-dom";
import CallLogApi from "../../apis/CallLogApiController";
import debounce from "lodash/debounce";
import { useAuth } from "../../context/UseAuth";
import withNotification from "../../hoc/withNotification";
import Spinner from "../_ui/Spinner";
import { DataGrid } from "@mui/x-data-grid";
import { getArchivedCallColumns } from "./ArchivedColumnConfig";
import { rowClassSx } from "../CallLogger/rowClassUtils";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import SearchBar from "../CallLogger/SearchBar";
import DualDatePicker from "../CallLogger/DatePicker";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import SettingsPhoneRoundedIcon from "@mui/icons-material/SettingsPhoneRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Checkbox } from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { MainLayoutheight } from "../_ui/HeaderWrapper";


  const contentHeight = MainLayoutheight;


const CustomCheckbox = React.forwardRef((props, ref) => {
  return (
    <Checkbox
      ref={ref}
      {...props}
      icon={<RadioButtonUncheckedIcon />}
      checkedIcon={<CheckCircleRoundedIcon />}
    />
  );
});

// ─── Row normalizer (same as CallTable) ───────────────────────────────────────
const normalizeRowData = (rows) =>
  rows?.map((row, i) => ({
    ...row,
    id: row.sr ?? i,
    sr: row.sr ?? "-",
    index: i + 1,
    date: row.date ? new Date(row.date).toLocaleDateString("en-GB") : "-",
    dateRaw: row.date ?? null,
    forward:
      row?.DeptName && row?.AssignedEmpName
        ? `${row.AssignedEmpName} (${row.DeptName})`
        : "-",
    rating: row.rating ?? 0,
    callAnalysis:
      row.callAnalysis && Object.keys(row.callAnalysis)?.length > 0
        ? "Analysis"
        : "Pending",
    feedback: row?.feedback,
    ticket:
      row?.ticket && row?.Ticket_CreatedDate
        ? "In Ticket"
        : "Upgrade to Ticket",
    ...Object.fromEntries(
      [
        "company",
        "callBy",
        "appname",
        "description",
        "receivedBy",
        "time",
        "status",
        "Estatus",
        "topicRaisedBy",
        "priority",
        "callStart",
        "callDetails",
        "CallDuration",
        "callClosed",
        "FollowUpList",
      ].map((key) => [key, row[key] ?? ""]),
    ),
  })) ?? [];

// ─── Archive Table with checkbox selection ────────────────────────────────────
const ArchivedCallTable = ({
  callLogs,
  viewMode,
  onViewDetails,
  selectedIds,
  onSelectionChange,
}) => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const columns = useMemo(
    () => getArchivedCallColumns({ viewMode, onViewDetails }),
    [viewMode, onViewDetails],
  );

  const normalizedRows = useMemo(() => normalizeRowData(callLogs), [callLogs]);

  return (
    <DataGrid
      slots={{
        baseCheckbox: CustomCheckbox,
      }}
      rows={normalizedRows}
      columns={columns.map((col) => ({ ...col }))}
      checkboxSelection
      disableMultipleRowSelection={false}
      rowSelectionModel={selectedIds}
      onRowSelectionModelChange={onSelectionChange}
      keepNonExistentRowsSelected={false}
      rowHeight={52}
      paginationMode="client"
      rowBuffer={10}
      columnBuffer={8}
      resizeThrottleMs={100}
      pagination
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[15, 25, 35, 55, 100]}
      slotProps={{
        pagination: {
          labelRowsPerPage: "Rows:",
          showFirstButton: true,
          showLastButton: true,
        },
      }}
      density="standard"
      sx={{
        "& .MuiDataGrid-footerContainer": {
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
          padding: "8px 16px",
        },
        "& .MuiTablePagination-root": { fontSize: "0.85rem" },
        "& .MuiTablePagination-toolbar": {
          minHeight: "auto",
          padding: 0,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        },
        "& .MuiTablePagination-spacer": { display: "none" },
        "& .MuiTablePagination-selectLabel": {
          margin: "0 8px 0 0",
          fontSize: "0.8rem",
        },
        "& .MuiTablePagination-select": {
          fontSize: "0.8rem",
          padding: "2px 8px",
        },
        "& .MuiTablePagination-displayedRows": {
          fontSize: "0.8rem",
          margin: "0 8px",
        },
        "& .MuiTablePagination-actions .MuiIconButton-root": {
          padding: "6px",
          color: "#555",
        },
        "& .MuiTablePagination-actions .Mui-disabled": { opacity: 0.3 },
        "& .MuiSvgIcon-root": { fontSize: "20px" },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#f5f5f5",
          fontSize: "0.85rem",
          fontWeight: "600",
        },
        "& .MuiDataGrid-cell": { fontSize: "0.8rem" },
        "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
          backgroundColor: "#bdbdbd",
          borderRadius: "4px",
        },
        "& .MuiDataGrid-row:hover": { backgroundColor: "#f5f5f5" },
        "& .Mui-selected": { backgroundColor: "#ede9fe !important" },
        "& .Mui-selected:hover": { backgroundColor: "#ddd6fe !important" },
        ...rowClassSx,
        minHeight: 300,
        height: "calc(100vh - 108px)",
        width: "100%",
        "&.MuiDataGrid-root": {
          bgcolor: "white",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
        transition: "all 0.3s ease-in-out",
      }}
    />
  );
};

// ─── Helper sub-components (same as inside GridHeader) ───────────────────────
const LogToggle = ({ viewMode, setViewMode }) => (
  <ToggleButtonGroup
    value={viewMode}
    exclusive
    size="small"
    color="primary"
    sx={{ borderRadius: 4 }}
  >
    <Tooltip title="User View" arrow>
      <ToggleButton onClick={() => setViewMode("normal")} value="normal">
        <PersonIcon fontSize="medium" />
      </ToggleButton>
    </Tooltip>
    <Tooltip title="Team View" arrow>
      <ToggleButton onClick={() => setViewMode("team")} value="team">
        <GroupIcon fontSize="medium" />
      </ToggleButton>
    </Tooltip>
    <Tooltip title="Pending Follow Up Calls" arrow>
      <ToggleButton
        onClick={() => setViewMode("followUp-Pending")}
        value="followUp-Pending"
      >
        <SettingsPhoneRoundedIcon fontSize="medium" />
      </ToggleButton>
    </Tooltip>
    <Tooltip title="Completed Follow Up Calls" arrow>
      <ToggleButton
        onClick={() => setViewMode("followUp-Completed")}
        value="followUp-Completed"
      >
        <CheckCircleRoundedIcon fontSize="medium" />
      </ToggleButton>
    </Tooltip>
  </ToggleButtonGroup>
);

const StatusSelect = ({ Status, SetStatus, STATUS_LIST }) => (
  <FormControl sx={{ minWidth: 160 }} size="small">
    <InputLabel id="arch-status-label">Status</InputLabel>
    <Select
      labelId="arch-status-label"
      label="Status"
      value={Status || ""}
      onChange={(e) => SetStatus(e.target.value)}
      MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
      renderValue={(selected) => {
        const item = STATUS_LIST.find((i) => i?.value === Number(selected));
        return item ? item.label : "Select Status";
      }}
    >
      <MenuItem key="all" value="">
        <ListItemText primary="All" />
      </MenuItem>
      {STATUS_LIST?.map((item) => (
        <MenuItem key={item.value} value={item.value}>
          <ListItemText primary={item.label} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const CompanyCodeSelect = ({
  CompanyStatus,
  SetCompanyStatus,
  COMPANY_LIST,
}) => {
  const companyOptions =
    COMPANY_LIST?.filter((item) => item.type === "COMPANYNAME") || [];
  const selectedCompany =
    companyOptions.find((item) => item?.ProjectID === Number(CompanyStatus)) ||
    null;
  return (
    <Autocomplete
      size="small"
      options={companyOptions}
      getOptionLabel={(o) => o.ProjectCode || ""}
      value={selectedCompany}
      onChange={(_, newVal) => SetCompanyStatus(newVal ? newVal.ProjectID : "")}
      isOptionEqualToValue={(o, v) => o?.ProjectID === v?.ProjectID}
      renderInput={(params) => (
        <TextField {...params} label="Company" variant="outlined" />
      )}
      sx={{ minWidth: 180 }}
    />
  );
};

// ─── Archive Header — same layout as GridHeader with "Restore" instead of "Add"
const ArchiveHeader = ({
  selectedIds,
  onRestore,
  restoring,
  filterCount,
  onClearAll,
  searchQuery,
  setsearchQuery,
  Status,
  SetStatus,
  filterState,
  setFilterState,
  viewMode,
  setViewMode,
  CompanyStatus,
  SetCompanyStatus,
}) => {
  const { COMPANY_LIST, STATUS_LIST, ESTATUS_LIST } = useCallLog();
  const [tempDateRange, setTempDateRange] = useState({
    startDate: filterState?.dateRange?.startDate,
    endDate: filterState?.dateRange?.endDate,
  });

  useEffect(() => {
    setTempDateRange({
      startDate: filterState?.dateRange?.startDate
        ? new Date(filterState?.dateRange?.startDate)
        : null,
      endDate: filterState?.dateRange?.endDate
        ? new Date(filterState?.dateRange?.endDate)
        : null,
    });
  }, [filterState?.dateRange]);

  const StatusList = [...STATUS_LIST, ...ESTATUS_LIST];

  const handleClearDateRange = () => {
    const cleared = { startDate: "", endDate: "" };
    setTempDateRange(cleared);
    setFilterState((prev) => ({
      ...prev,
      dateRange: cleared,
      filterTargetField: "",
    }));
    onClearAll();
  };

  const hasActiveFilter =
    searchQuery ||
    CompanyStatus ||
    (Status && Status !== "all") ||
    filterState?.filterTargetField ||
    filterState?.dateRange?.startDate ||
    filterState?.dateRange?.endDate;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "nowrap",
        gap: 1.5,
        overflowX: "auto",
        width: "100%",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        pt: 1,
        pb: 0.4,
      }}
    >
      {/* Left side */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}
      >
        {/* Restore replaces Add */}
        <Button
          variant="contained"
          color="success"
          disabled={!selectedIds?.length || restoring}
          onClick={onRestore}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            width: "150px",
            minWidth: "150px",
            maxWidth: "150px",
            borderRadius: "20px",
            flexShrink: 0,
          }}
        >
          {restoring ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <>
              <UnarchiveIcon sx={{ mr: 1, fontSize: "18px" }} />
              {selectedIds?.length
                ? `Restore (${selectedIds.length})`
                : "Restore"}
            </>
          )}
        </Button>
        <SearchBar
          filterCount={filterCount}
          searchQuery={searchQuery}
          setsearchQuery={setsearchQuery}
        />
        <LogToggle setViewMode={setViewMode} viewMode={viewMode} />
      </Box>

      {/* Right side */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
          flexWrap: "nowrap",
        }}
      >
        {hasActiveFilter && (
          <Tooltip title="Clear All Filters">
            <IconButton
              onClick={handleClearDateRange}
              color="primary"
              sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
              size="medium"
            >
              <FilterAltOffIcon />
            </IconButton>
          </Tooltip>
        )}
        <CompanyCodeSelect
          COMPANY_LIST={COMPANY_LIST}
          CompanyStatus={CompanyStatus}
          SetCompanyStatus={SetCompanyStatus}
        />
        <DualDatePicker
          setTempDateRange={setTempDateRange}
          tempDateRange={tempDateRange}
          filterState={filterState}
          setFilterState={setFilterState}
        />
        <StatusSelect
          STATUS_LIST={StatusList}
          Status={Status}
          SetStatus={SetStatus}
        />
      </Box>
    </Box>
  );
};

// ─── Main Archived Call Log App ───────────────────────────────────────────────
const ArchivedCallLogApp = ({ showNotification = () => {} }) => {
  const [callLog, setCallLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Filters
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || params.get("searchQuery") || "";
  });
  const [viewMode, setViewMode] = useState("team");
  const [companyStatus, setCompanyStatus] = useState("");
  const [status, setStatus] = useState("");
  const [filterState, setFilterState] = useState({
    dateRange: { startDate: "", endDate: "" },
    filterTargetField: "",
  });

  // Sync search from URL (e.g. from Global Search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || params.get("searchQuery") || "";
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [location.search]);

  // ── Fetch archived list ──────────────────────────────────────────────────
  const fetchArchived = useCallback(
    debounce(async (filters = {}) => {
      try {
        setIsLoading(true);
        const data = await CallLogApi.getArchivedCallLogList({
          endDate: filters.endDate || "",
          startDate: filters.startDate || "",
          statusId: filters.statusId || "",
          projectId: filters.projectId || "",
          filter: filters.filter || "",
          searchTerm: filters.searchTerm || "",
        });
        setCallLog(data?.rd ?? data?.data ?? (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error(error);
        showNotification("Failed to load archived calls", "error");
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [],
  );

  // Reload on filter changes
  useEffect(() => {
    const filters = {
      endDate: filterState?.dateRange?.endDate || "",
      startDate: filterState?.dateRange?.startDate || "",
      statusId: status || "",
      projectId: companyStatus || "",
      filter: filterState?.filterTargetField || "",
      searchTerm: searchQuery || "",
    };
    fetchArchived(filters);
    return () => fetchArchived.cancel();
  }, [searchQuery, companyStatus, status, filterState, fetchArchived]);

  // ── Clear filters ────────────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setViewMode("team");
    setCompanyStatus("");
    setStatus("");
    navigate({ pathname: location.pathname }, { replace: true });
    fetchArchived({});
    setFilterState({
      dateRange: { startDate: "", endDate: "" },
      filterTargetField: "",
    });
  }, [navigate, location.pathname, fetchArchived]);

  // ── Client-side view-mode filter (same logic as original) ────────────────
  const filteredCallLog = useMemo(() => {
    if (!callLog) return [];
    let filtered = [...callLog];
    const isValidDateString = (d) =>
      d && typeof d === "string" && !d.startsWith("1900-01-01");

    if (viewMode === "normal" && user) {
      const loggedUser = `${user.firstname} ${user.lastname}`.toLowerCase();
      filtered = filtered.filter(
        (call) =>
          (call.receivedBy && call.receivedBy.toLowerCase() === loggedUser) ||
          (call.AssignedEmpName &&
            call.AssignedEmpName.toLowerCase() === loggedUser),
      );
    } else if (viewMode === "followUp-Pending") {
      filtered = filtered.filter((call) => {
        if (!call.FollowUpList) return false;
        try {
          const fus = JSON.parse(call.FollowUpList);
          if (!Array.isArray(fus)) return false;
          return fus.some(
            (fu) =>
              !isValidDateString(fu.CallClosed) &&
              (!fu.CallDuration || fu.CallDuration === "00:00:00"),
          );
        } catch {
          return false;
        }
      });
    } else if (viewMode === "followUp-Completed") {
      filtered = filtered.filter((call) => {
        if (!call.FollowUpList) return false;
        try {
          const fus = JSON.parse(call.FollowUpList);
          if (!Array.isArray(fus)) return false;
          return fus.some(
            (fu) =>
              isValidDateString(fu.CallClosed) ||
              (fu.CallDuration && fu.CallDuration !== "00:00:00"),
          );
        } catch {
          return false;
        }
      });
    }
    return filtered;
  }, [viewMode, callLog, user]);

  // ── Row click → open detail sidebar ─────────────────────────────────────
  const onRowClick = useCallback(
    (rowData) => {
      if (!rowData?.sr) return;
      const raw = callLog.find((c) => c.sr === rowData.sr) || rowData;
      setDetailData(raw);
      setDetailOpen(true);
    },
    [callLog],
  );

  // ── Restore selected ─────────────────────────────────────────────────────
  const handleRestore = useCallback(async () => {
    if (!selectedIds.length) return;
    setRestoring(true);
    try {
      await CallLogApi.restoreArchivedCallLogs({ restoreIds: selectedIds });
      showNotification(
        `${selectedIds.length} call log(s) restored successfully.`,
        "success",
      );
      setSelectedIds([]);
      fetchArchived({
        endDate: filterState?.dateRange?.endDate || "",
        startDate: filterState?.dateRange?.startDate || "",
        statusId: status || "",
        projectId: companyStatus || "",
        filter: filterState?.filterTargetField || "",
        searchTerm: searchQuery || "",
      });
    } catch (err) {
      showNotification(err?.message || "Failed to restore call logs.", "error");
    } finally {
      setRestoring(false);
    }
  }, [
    selectedIds,
    fetchArchived,
    filterState,
    status,
    companyStatus,
    searchQuery,
    showNotification,
  ]);

  const filterProps = {
    searchQuery,
    setsearchQuery: setSearchQuery,
    Status: status,
    SetStatus: setStatus,
    viewMode,
    setViewMode,
    filterState,
    setFilterState,
    CompanyStatus: companyStatus,
    SetCompanyStatus: setCompanyStatus,
  };

  const isFilterData = filteredCallLog?.length > 0;

  if (isLoading && !callLog?.length) return <Spinner />;

  return (
    <Box
      sx={{
        height: contentHeight,
        display: "flex",
        flexDirection: "column",
        px: 1,
        bgcolor: "white",
        pt: 0,
        pb: 1,
      }}
    >
      <Box sx={{ transition: "0.3s ease-in-out" }}>
        <ArchiveHeader
          selectedIds={selectedIds}
          onRestore={handleRestore}
          restoring={restoring}
          filterCount={filteredCallLog?.length || 0}
          isFilterData={isFilterData}
          onClearAll={clearFilters}
          {...filterProps}
        />
      </Box>

      <Box sx={{ flex: 1, overflowX: "auto", width: "100%", pt: 0.3 }}>
        <ArchivedCallTable
          callLogs={filteredCallLog}
          viewMode={viewMode}
          onViewDetails={onRowClick}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </Box>

      <CallLogDetailsSidebar
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        callLogData={detailData}
        onEditToggle={() => {}} // No edit in archive view
      />
    </Box>
  );
};

export default withNotification(ArchivedCallLogApp);
