import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Chip, IconButton, Rating, MenuItem, Menu, Tooltip } from "@mui/material";
import { PhoneCall, WandSparkles } from "lucide-react";
import { useCallLog } from "../../context/UseCallLog";
import EscalationMenu from "./Escalation";
import { getStatusColor, getPriorityColor } from "../../libs/data";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import { CheckCircle, LocalActivity } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "../../context/UseAuth";

const CallTable = ({ callStatusValue, RecordMode, callLogs, onRowClick, onEditCall, onCallAnalysis, setFeedBackModal }) => {
	const { UpdateStatusAndPriority, STATUS_LIST, ESTATUS_LIST, PRIORITY_LIST, INTERNAL_STATUS_LIST, INTERNAL_ESTATUS_LIST } = useCallLog();
	const Navigate = useNavigate();
	const { user } = useAuth();

	// State for menus
	const [selectedStatusRowId, setSelectedStatusRowId] = React.useState(null);
	const [statusAnchorEl, setStatusAnchorEl] = React.useState(null);
	const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);

	const [selectedEstatusRowId, setSelectedEstatusRowId] = React.useState(null);
	const [estatusAnchorEl, setEstatusAnchorEl] = React.useState(null);
	const [estatusMenuOpen, setEstatusMenuOpen] = React.useState(false);

	const [selectedPriorityRowId, setSelectedPriorityRowId] = React.useState(null);
	const [priorityAnchorEl, setPriorityAnchorEl] = React.useState(null);
	const [priorityMenuOpen, setPriorityMenuOpen] = React.useState(false);
	const [paginationModel, setPaginationModel] = React.useState({
		pageSize: 15,
		page: 0,
	});
	const [ForwardMenu, setForwardMenu] = React.useState({
		anchor: null,
		id: null,
	});

	// Shared menu item styling
	const menuItemStyle = {
		margin: "0px 4px",
		borderRadius: "8px",
		fontSize: "13px",
		"&:hover": { backgroundColor: "#f0f0f0", borderRadius: "8px" },
	};

	// Status handlers
	const handleStatusChipClick = (event, rowId) => {
		event.stopPropagation();
		setSelectedStatusRowId(rowId);
		setStatusAnchorEl(event.currentTarget);
		setStatusMenuOpen(true);
	};

	const handleStatusSelect = (newStatus, rowId, e, rowData) => {
		e.preventDefault();
		UpdateStatusAndPriority(
			rowId,
			{
				statusId: newStatus,
				createdBy: user?.id,
			},
			INTERNAL_STATUS_LIST,
		);
		setStatusMenuOpen(false);
	};

	// Estatus handlers
	const handleEstatusChipClick = (event, rowId) => {
		event.stopPropagation();
		setSelectedEstatusRowId(rowId);
		setEstatusAnchorEl(event.currentTarget);
		setEstatusMenuOpen(true);
	};

	const handleEstatusSelect = (newEstatus, rowId, e, rowData) => {
		e.preventDefault();
		UpdateStatusAndPriority(rowId, { statusId: newEstatus, createdBy: user?.id }, INTERNAL_ESTATUS_LIST);
		setEstatusMenuOpen(false);
	};

	// Priority handlers
	const handlePriorityChipClick = (event, rowId) => {
		event.stopPropagation();
		setSelectedPriorityRowId(rowId);
		setPriorityAnchorEl(event.currentTarget);
		setPriorityMenuOpen(true);
	};

	const handlePrioritySelect = (newPriority, rowId, e, rowData) => {
		e.preventDefault();
		UpdateStatusAndPriority(rowId, { priorityId: newPriority, createdBy: user?.id }, INTERNAL_ESTATUS_LIST);
		setPriorityMenuOpen(false);
	};

	const HandleFeedBack = (id) => {
		setFeedBackModal(id);
	};

	const HandleTicketUpgrade = (data) => {
		console.log("🚀 ~ HandleTicketUpgrade ~ data:", data);
		const encodedId = btoa(data?.id);
		const encodedApp = btoa(data?.appname);
		Navigate(`/ticket?TicketId=${encodedId}&Appname=${encodedApp}`, {
			state: data,
		});
	};
	const HandlePreviewTicket = (id) => {
		const encodedId = btoa(id);
		Navigate(`/ticket?TicketPreviewId=${encodedId}`);
	};

	const columns = [
		{ field: "index", headerName: "Sr", width: 70 },
		{ field: "date", headerName: "Date", width: 130 },
		{ field: "company", headerName: "Company", width: 150 },
		{ field: "callBy", headerName: "Call By", width: 150 },
		{ field: "appname", headerName: "AppName", width: 150 },
		{ field: "description", headerName: "Description", width: 150 },
		{ field: "receivedBy", headerName: "Received By", width: 150 },
		{ field: "time", headerName: "Time", width: 150 },
		{
			field: "forward",
			headerName: "Forward [L1 ,L2 ,L3]",
			width: 300,
			renderCell: (params) => {
				return (
					<>
						<Tooltip placement="top" title={params?.value}>
							<Chip
								label={params?.value}
								size="small"
								sx={{ fontSize: "0.7rem", height: 20, borderRadius: "2px" }}
								onClick={(e) => {
									e.stopPropagation();
									setForwardMenu({
										anchor: e.currentTarget,
										id: params?.row?.id,
									});
								}}
							/>
						</Tooltip>
						<EscalationMenu anchorEl={ForwardMenu?.anchor} data={params?.row} id={ForwardMenu?.id} setAnchorEl={setForwardMenu} />
					</>
				);
			},
		},
		{
			field: "status",
			headerName: "Internal Status",
			width: 150,
			renderCell: (params) => {
				const { label, color } = getStatusColor(params?.value);
				return (
					<>
						<Chip label={label} color={color} size="small" sx={{ fontSize: "0.7rem", height: 20 }} onClick={(e) => handleStatusChipClick(e, params.row.id)} />
						<Menu anchorEl={statusAnchorEl} open={statusMenuOpen && selectedStatusRowId === params.row.id} onClose={() => setStatusMenuOpen(false)} sx={{ mt: 1 }}>
							{STATUS_LIST?.map((option) => (
								<MenuItem selected={option?.label === params?.row?.status} key={option.value} sx={menuItemStyle} onClick={(e) => handleStatusSelect(option?.value, params.row.id, e, params?.row)}>
									{option?.label}
								</MenuItem>
							))}
						</Menu>
					</>
				);
			},
		},
		{
			field: "Estatus",
			headerName: "External Status",
			width: 150,
			renderCell: (params) => {
				const { label, color } = getStatusColor(params?.value);
				return (
					<>
						<Chip label={label} color={color} size="small" sx={{ fontSize: "0.7rem", height: 20 }} onClick={(e) => handleEstatusChipClick(e, params.row.id)} />
						<Menu anchorEl={estatusAnchorEl} open={estatusMenuOpen && selectedEstatusRowId === params.row.id} onClose={() => setEstatusMenuOpen(false)} sx={{ mt: 1 }}>
							{ESTATUS_LIST?.map((option) => (
								<MenuItem selected={option?.label === params?.row?.Estatus} key={option.value} sx={menuItemStyle} onClick={(e) => handleEstatusSelect(option.value, params.row.id, e, params?.row)}>
									{option?.label}
								</MenuItem>
							))}
						</Menu>
					</>
				);
			},
		},
		{
			field: "feedback",
			headerName: "Feedback",
			width: 150,
			renderCell: (params) => {
				return (
					<Tooltip placement="top" title={"This feature will be available soon !!"}>
						<Chip
							onClick={(e) => {
								e.stopPropagation();
								// if (params?.value == "Send") {
								//   HandleFeedBack(params?.row?.id);
								// }
							}}
							icon={params?.value !== "Send" ? <PendingActionsRoundedIcon fontSize="small" /> : <WandSparkles size={10} />}
							label={params?.value}
							color={params?.value !== "Send" ? "success" : "secondary"}
							size="small"
							sx={{ fontSize: "0.7rem", height: 20 }}
						/>
					</Tooltip>
				);
			},
		},
		{
			field: "rating",
			headerName: "Rating",
			width: 150,
			renderCell: (params) => <Rating value={params.value} readOnly size="small" />,
		},
		{ field: "topicRaisedBy", headerName: "Source", width: 150 },
		{
			field: "priority",
			headerName: "Priority",
			width: 150,
			renderCell: (params) => {
				const { label, color } = getPriorityColor(params.value);
				return (
					<>
						<Chip label={label ? label : "-"} color={color} size="small" sx={{ fontSize: "0.7rem", height: 20 }} onClick={(e) => handlePriorityChipClick(e, params.row.id)} />
						<Menu anchorEl={priorityAnchorEl} open={priorityMenuOpen && selectedPriorityRowId === params.row.id} onClose={() => setPriorityMenuOpen(false)} sx={{ mt: 1 }}>
							{PRIORITY_LIST?.map((option) => (
								<MenuItem key={option?.value} sx={menuItemStyle} selected={option?.label === params?.row?.priority} onClick={(e) => handlePrioritySelect(option?.value, params.row.id, e, params?.row)}>
									{option?.label}
								</MenuItem>
							))}
						</Menu>
					</>
				);
			},
		},
		{
			field: "callStart",
			headerName: "Call Start",
			width: 150,
			renderCell: (params) => {
				return params.value ? (
					params.value
				) : (
					<IconButton
						onClick={(e) => {
							e.stopPropagation();
							onEditCall(params.row.id);
						}}
						color="success"
					>
						<PhoneCall />
					</IconButton>
				);
			},
		},
		{ field: "callClosed", headerName: "Call Closed", width: 150 },
		{ field: "CallDuration", headerName: "Call Duration", width: 150 },
		{ field: "callDetails", headerName: "Call Details", width: 150 },
		// {
		//   field: "callAnalysis",
		//   headerName: "Call Analysis",
		//   width: 100,

		//   renderCell: (params) => {
		//     const { label, color } = getStatusColor(params.value);
		//     return (
		//       <Tooltip placement="top" title={"This feature will be available soon !!"}>
		//         <Chip
		//           onClick={(e) => {
		//             e.stopPropagation();
		//             onCallAnalysis({ ...params.row });
		//           }}
		//           icon={label === "Pending" ? <PendingActionsRoundedIcon fontSize="small" /> : <WandSparkles size={10} />}
		//           label={label}
		//           color={color}
		//           size="small"
		//           sx={{ fontSize: "0.7rem", height: 20 }}
		//         />
		//       </Tooltip>
		//     );
		//   },
		// },
		{
			field: "ticket",
			headerName: "Ticket",
			width: 160,
			// valueGetter: (params) => (params.row?.ticket !== "" ? "Done" : "Upgrade to Ticket"),
			renderCell: (params) => {
				const isDone = params.value === "Done";
				return (
					<Tooltip placement="top" title={"This feature will be available soon !!"}>
						<Chip
							onClick={(e) => {
								e.stopPropagation();
								// if (!isDone) {
								//   HandleTicketUpgrade(params?.row);
								// } else {
								//   HandlePreviewTicket(params?.row?.id);
								// }
							}}
							icon={isDone ? <CheckCircle size={14} style={{ color: "#4caf50" }} /> : <LocalActivity fontSize="small" />}
							label={params.value}
							color={isDone ? "success" : "default"}
							size="small"
							sx={{ fontSize: "0.7rem", height: 22 }}
						/>
					</Tooltip>
				);
			},
		},
	];

	const normalizeRowData = (rows) =>
		rows?.map((row, i) => ({
			...row,
			id: row.sr ?? "-",
			sr: row.sr ?? "-",
			index: i + 1,
			date: row.date ? new Date(row.date).toLocaleDateString("en-GB") : "-",
			forward:
				row?.DeptName && row?.AssignedEmpName ? (
					<>
						<span>{row.DeptName}</span>
						<ChevronRightIcon sx={{ fontSize: "14px", margin: "-2px 5px" }} />
						<span>{row.AssignedEmpName}</span>
					</>
				) : (
					"-"
				),
			rating: row.rating ?? 0,
			callAnalysis: row.callAnalysis && Object.keys(row.callAnalysis)?.length > 0 ? "Analysis" : "Pending",
			feedback: row?.rating ? "Done" : "Send",
			ticket: row?.ticket ? "Done" : "Upgrade to Ticket",
			...Object.fromEntries(["company", "callBy", "appname", "description", "receivedBy", "time", "status", "Estatus", "topicRaisedBy", "priority", "callStart", "callDetails", "CallDuration", "callClosed"].map((key) => [key, row[key] ?? ""])),
		}));

	const normalizedCallLogs = normalizeRowData(callLogs);

	return (
		<DataGrid
			rows={normalizedCallLogs}
			columns={columns.map((col) => ({ ...col, flex: 1 }))}
			// columns={columns.map((col) => ({ ...col }))}
			onRowClick={(params) => onRowClick && onRowClick(params.row)}
			// autoPageSize
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
					overflowX: "hidden",
					"&::-webkit-scrollbar-thumb": {
						backgroundColor: "#bdbdbd",
						borderRadius: "4px",
					},
				},
				"& .MuiDataGrid-row:hover": {
					backgroundColor: "#f5f5f5",
				},
				minHeight: 200,
				height: `calc(100vh - ${RecordMode ? "70vh" : 0})`,
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
