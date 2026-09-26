import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useCallLog } from "../../context/UseCallLog";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "../../context/UseAuth";
import { handleStatusNotification } from "../../utils/callLogUtils";
import { getCallColumns } from "./ColumnConfig";
import { Avatar, Box, Typography, Skeleton } from "@mui/material";
import { useSocketEvent } from "../../hooks/useSocketListener";
import { getCallRowClassName, rowClassSx } from "./rowClassUtils";
import { feedbackPopover$ } from "../../rxjs/tableUiStore";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { IconButton } from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

const TableSkeletonOverlay = () => (
  <Box sx={{ width: "100%", p: 1, bgcolor: "white" }}>
    {Array.from({ length: 25 }).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          gap: 2,
          py: 1.5,
          px: 2,
          borderBottom: "1px solid #f0f0f0",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text" width="4%" height={24} />
        <Skeleton variant="text" width="12%" height={24} />
        <Skeleton variant="rectangular" width="12%" height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width="22%" height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="rectangular" width="10%" height={24} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rectangular" width="8%" height={24} sx={{ borderRadius: 4 }} />
        <Skeleton variant="text" width="8%" height={24} />
        <Skeleton variant="text" width="6%" height={24} />
                <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="rectangular" width="10%" height={24} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rectangular" width="8%" height={24} sx={{ borderRadius: 4 }} />
        <Skeleton variant="text" width="8%" height={24} />
        <Skeleton variant="text" width="6%" height={24} />
        
      </Box>
    ))}
  </Box>
);



const CallTable = ({
  callStatusValue,
  RecordMode,
  callLogs,
  viewMode,
  onRowClick,
  onEditCall,
  onCallAnalysis,
  setFeedBackModal,
  showNotification = () => {},
  ToggleAnalysis = () => {},
  ToggleFollowUp = () => {},
  loading = false,
}) => {
  const {
    UpdateStatusAndPriority,
    STATUS_LIST,
    ESTATUS_LIST,
    PRIORITY_LIST,
    INTERNAL_STATUS_LIST,
    INTERNAL_ESTATUS_LIST,
  } = useCallLog();
  const Navigate = useNavigate();
  const { user } = useAuth();
  // const [rows, setRows] = React.useState(() => normalizeArray(initialData));
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 25,
    page: 0,
  });

  const menuItemStyle = {
    margin: "0px 4px",
    borderRadius: "8px",
    fontSize: "13px",
    "&:hover": { backgroundColor: "#f0f0f0", borderRadius: "8px" },
  };

  const handleStatusSelect = async (newStatus, rowId, e, rowData) => {
    try {
      e.preventDefault();
      const { msg } = await UpdateStatusAndPriority(
        rowId,
        {
          statusId: newStatus,
          createdBy: user?.id,
        },
        INTERNAL_STATUS_LIST,
      );
      handleStatusNotification(msg, showNotification);
    } catch (error) {
      showNotification(error?.message, "error");
    }
  };

  const handleEstatusSelect = async (newEstatus, rowId, e, rowData) => {
    try {
      e.preventDefault();
      const { msg } = await UpdateStatusAndPriority(
        rowId,
        { statusId: newEstatus, createdBy: user?.id },
        INTERNAL_ESTATUS_LIST,
      );
      handleStatusNotification(
        msg,
        showNotification,
        "The External status is updated.",
      );
    } catch (error) {
      showNotification(error?.message, "error");
    }
  };

  const handlePrioritySelect = async (newPriority, rowId, e, rowData) => {
    try {
      e.preventDefault();
      const { msg } = await UpdateStatusAndPriority(
        rowId,
        { priorityId: newPriority, createdBy: user?.id },
        INTERNAL_ESTATUS_LIST,
      );
      handleStatusNotification(
        msg,
        showNotification,
        "The Priority is updated.",
        "You do not have permission to change the Priority.",
      );
    } catch (error) {
      showNotification(error?.message, "error");
    }
  };

  const HandleFeedBack = (anchorEl, rowData) => {
    feedbackPopover$.next({ data: rowData, anchorEl });
  };

  const HandleTicketUpgrade = (data) => {
    const encodedId = btoa(data?.id);
    const encodedApp = btoa(data?.appname);
    const { forward, ...safeData } = data;
    Navigate(`/ticket?TicketId=${encodedId}&Appname=${encodedApp}`, {
      state: safeData,
    });
  };
  const HandlePreviewTicket = (id) => {
    const encodedId = btoa(id);
    Navigate(`/ticket?TicketPreviewId=${encodedId}`);
  };

  const columns = React.useMemo(
    () =>
      getCallColumns({
        showNotification,
        handleStatusSelect,
        handleEstatusSelect,
        handlePrioritySelect,
        STATUS_LIST,
        ESTATUS_LIST,
        PRIORITY_LIST,
        menuItemStyle,
        HandleFeedBack,
        HandleTicketUpgrade,
        HandlePreviewTicket,
        onEditCall,
        ToggleAnalysis,
        ToggleFollowUp,
        viewMode,
      }),
    [
      ToggleAnalysis,
      ToggleFollowUp,
      showNotification,
      handleStatusSelect,
      handleEstatusSelect,
      handlePrioritySelect,
      STATUS_LIST,
      ESTATUS_LIST,
      PRIORITY_LIST,
      HandleFeedBack,
      HandleTicketUpgrade,
      HandlePreviewTicket,
      onEditCall,
      viewMode,
    ],
  );

  // useSocketEvent("AddCall", (data) => {
  //   // Normalize the single new object
  //   const newRow = normalizeSingleRow(data, 1);

  //   setRows((prevRows) => {
  //      // Optional: Re-calculate indexes if necessary, or just prepend
  //      const updated = [newRow, ...prevRows];
  //      // Fix indexes if your UI depends on them
  //      return updated.map((r, i) => ({...r, index: i + 1}));
  //   });
  // });

  //   useSocketEvent("AcceptCall", (data) => {
  //     setRows((prev) => prev.map((c) => (c.sr === data.sr ? normalizeSingleRow({ ...c, ...data }, c.index) : c)));
  //   });

  //   useSocketEvent("ForwardedCall", (data) => {
  //      setRows((prev) => {
  //         const exists = prev.some((c) => c.sr === data.sr);
  //         if (exists) {
  //             return prev.map((c) => (c.sr === data.sr ? normalizeSingleRow({ ...c, ...data }, c.index) : c));
  //         }
  //         return [normalizeSingleRow(data, 1), ...prev].map((r, i) => ({...r, index: i + 1}));
  //      });
  //   });

  const normalizeRowData = (rows) =>
    rows?.map((row, i) => ({
      ...row,
      id: row.sr ?? "-",
      sr: row.sr ?? "-",
      index: i + 1,
      date: row.date ? new Date(row.date).toLocaleDateString("en-GB") : "-",
      dateRaw: row.date ?? null,
      forward:
        row?.DeptName && row?.AssignedEmpName ? (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
              }}
            >
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: "#E8F0FE",
                  color: "#1D4ED8",
                }}
              >
                {row?.AssignedEmpName?.split(" ")
                  ?.slice(0, 2)
                  ?.map((x) => x[0])
                  ?.join("")
                  ?.toUpperCase() || "?"}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#111827",
                    lineHeight: 1.15,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {(() => {
                    const name = (row?.AssignedEmpName || "").trim();
                    if (!name) return " ";

                    const parts = name.split(/\s+/);

                    if (parts.length === 1) {
                      return parts[0];
                    }

                    if (parts.length === 2) {
                      return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
                    }

                    return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
                  })()}

                  {/* <InfoRoundedIcon
                    fontSize="small"
                    sx={{ color: "#f811bea4", width: "16px", height: "16px" }}
                  /> */}
                </Typography>

                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.68rem",
                    color: "#6B7280",
                    letterSpacing: ".4px",
                    textTransform: "uppercase",
                  }}
                >
                  {row?.DeptName || "—"}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <IconButton
                size="small"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  transition: "all .2s ease",
                  bgcolor: "#dfdfdfd0",
                }}
              >
                <AddRoundedIcon fontSize="small" sx={{ color: "black" }} />
              </IconButton>
            </Box>
          </>
        ),
      rating: row.rating ?? 0,
      callAnalysis:
        row.callAnalysis && Object.keys(row.callAnalysis)?.length > 0
          ? "Analysis"
          : "Pending",
      // feedback: row?.rating ? "Done" : "Send",
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
        ].map((key) => [key, row[key] ?? ""]),
      ),
    }));

  const normalizedCallLogs = React.useMemo(
    () => normalizeRowData(callLogs),
    [callLogs],
  );

  return (
    <DataGrid
      rows={normalizedCallLogs}
      columns={columns.map((col) => ({ ...col }))}
      loading={loading}
      slots={{
        loadingOverlay: TableSkeletonOverlay,
        noRowsOverlay: loading ? TableSkeletonOverlay : undefined,
      }}
      onRowClick={(params) => onRowClick && onRowClick(params.row)}
      getRowClassName={getCallRowClassName}
      disableMultipleRowSelection
      disableSelectionOnClick
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
        pointerEvents: callStatusValue?.isRunning ? "none" : "auto",
        cursor: callStatusValue?.isRunning ? "not-allowed" : "default",
        opacity: callStatusValue?.isRunning ? 0.6 : 1,
        "& .MuiDataGrid-footerContainer": {
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
          padding: "8px 16px",
        },
        "& .MuiTablePagination-root": {
          fontSize: "0.85rem",
          textAlign: "center",
        },
        "& .MuiTablePagination-toolbar": {
          minHeight: "auto",
          padding: 0,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        },
        "& .MuiTablePagination-spacer": {
          display: "none",
        },
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
        "& .MuiTablePagination-actions": {
          "& .MuiIconButton-root": {
            padding: "6px",
            color: "#555",
          },
          "& .Mui-disabled": {
            opacity: 0.3,
          },
        },
        "& .MuiSvgIcon-root": {
          fontSize: "20px",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#f5f5f5",
          fontSize: "0.85rem",
          fontWeight: "600",
        },
        "& .MuiDataGrid-cell": {
          fontSize: "0.8rem",
        },
        "& .MuiTablePagination-root": {
          fontSize: "0.85rem",
          textAlign: "center", // Add this line
        },
        "& .MuiDataGrid-virtualScroller": {
          // overflowX: "hidden",
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdbdbd",
            borderRadius: "4px",
          },
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "#f5f5f5",
        },
        // Row highlight classes — see rowClassUtils.js to add/modify rules
        ...rowClassSx,
        minHeight: 300,
        height: `calc(100vh - ${RecordMode ? "61vh" : 0})`,
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

export default CallTable;

// 	SelectProps: {
// 	MenuProps: {
// 		PaperProps: {
// 			sx: {
// 				bgcolor :'red',
// 				border: '2px solid #1976d2',
// 				borderRadius: '8px',
// 				marginTop: '-45px',
// 				boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
// 				'& .MuiMenuItem-root': {
// 					padding: '8px 16px',
// 					fontSize: '0.85rem',
// 					borderBottom: '1px solid #f0f0f0',
// 					transition: 'background-color 0.2s ease',
// 					'&:hover': {
// 						backgroundColor: '#e3f2fd',
// 						color: '#1976d2',
// 					},
// 					'&:last-child': {
// 						borderBottom: 'none',
// 					},
// 					'&.Mui-selected': {
// 						backgroundColor: '#1976d2',
// 						color: 'white',
// 						'&:hover': {
// 							backgroundColor: '#1565c0',
// 						},
// 					},
// 				},
// 			},
// 		},
// 	},

// },
