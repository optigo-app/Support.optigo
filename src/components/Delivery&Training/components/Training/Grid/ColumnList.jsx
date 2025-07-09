import { Chip, Button, IconButton, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { extractRecordingLink } from "../../../utils/deliveryUtils";
import StatusAction from "./StatusAction";
import { getColorByStatus } from "../../../libs/data";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import DeleteTrainingAction from "./DeleteTrainingAction";

export const getDeliveryColumns = (setDetailModal, HandleEditMode, showNotification, isAdmin = false) => {
	// Non admin columns
	if (!isAdmin)
		return [
			{
				field: "SessionID",
				headerName: "ID",
				renderHeader: () => <strong>ID</strong>,
				flex: 0.3,
			},
			{
				field: "TicketNo",
				headerName: "Ticket No",
				renderHeader: () => <strong>Ticket No</strong>,
				flex: 1,
			},
			{
				field: "TrainingDate",
				headerName: "Date",
				renderHeader: () => <strong>Date</strong>,
				flex: 1,
			},
			{
				field: "Projectcode",
				headerName: "Company",
				renderHeader: () => <strong>Company</strong>,
			},
			{
				field: "TrainingType",
				headerName: "Training Type",
				renderHeader: () => <strong>Training Type</strong>,
				flex: 1,
			},
			{
				field: "TrainingMode",
				headerName: "Mode",
				renderHeader: () => <strong>Mode</strong>,
				flex: 1,
			},
			{
				field: "TrainingBy",
				headerName: "Trainer",
				renderHeader: () => <strong>Trainer</strong>,
				flex: 1,
			},
			{
				field: "Attendees",
				headerName: "Attendees",
				renderHeader: () => <strong>Attendees</strong>,
				flex: 1.5,
			},
			{
				field: "DurationTime",
				headerName: "Duration (hrs)",
				type: "number",
				renderHeader: () => <strong>Duration</strong>,
				renderCell: (params) => <Typography variant="body2">{params?.value?.toFixed(2)} hrs</Typography>,
			},
			{
				field: "training",
				headerName: "Training",
				renderHeader: () => <strong>Training</strong>,
				flex: 1,
				renderCell: (params) => {
					const hasTraining = params.row?.Details && extractRecordingLink(params.row?.Details || "");
					return hasTraining ? (
						<Chip icon={<CheckCircleOutlineIcon fontSize="small" />} label="Recorded" sx={{ backgroundColor: getColorByStatus("Completed") }} size="small" />
					) : (
						<Chip icon={<TimerRoundedIcon fontSize="small" color="action" />} label="Pending" color="warning" size="small" sx={{ backgroundColor: getColorByStatus("Pending") }} />
					);
				},
			},
			{
				field: "Status",
				headerName: "Status",
				renderHeader: () => <strong>Status</strong>,
				flex: 1,
				renderCell: (params) => (
					<Chip
						label={params?.value}
						size="small"
						sx={{
							cursor: "pointer",
							pointerEvents: "auto",
							opacity: 1,
							bgcolor: getColorByStatus(params.value),
							"&.Mui-disabled": {
								opacity: 1,
								pointerEvents: "auto",
								cursor: "default",
							},
							":hover": {
								bgcolor: getColorByStatus(params.value),
							},
						}}
					/>
				),
			},
			{
				field: "Remark",
				headerName: "Remarks",
				renderHeader: () => <strong>Remarks</strong>,
				flex: 1,
			},
			{
				field: "Details",
				headerName: "Details",
				renderHeader: () => <strong>Details</strong>,
				sortable: false,
				flex: 1,
				renderCell: (params) => (
					<Button size="small" color="primary" onClick={() => setDetailModal(params.row)} sx={{ textTransform: "none" }}>
						<DescriptionRoundedIcon /> View Details
					</Button>
				),
			},
		];
	//  Admin columns
	return [
		{
			field: "SessionID",
			headerName: "ID",
			renderHeader: () => <strong>ID</strong>,
			flex: 0.3,
			renderCell: (params) => {
				return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
			},
		},
		{
			field: "TicketNo",
			headerName: "Ticket No",
			renderHeader: () => <strong>Ticket No</strong>,
			flex: 1,
		},
		{
			field: "TrainingDate",
			headerName: "Date",
			renderHeader: () => <strong>Date</strong>,
			flex: 1,
		},
		{
			field: "Projectcode",
			headerName: "Company",
			renderHeader: () => <strong>Company</strong>,
		},
		{
			field: "CutomerType",
			headerName: "Customer Type",
			renderHeader: () => <strong>Customer Type</strong>,
			flex: 1,
		},
		{
			field: "CutomerPackage",
			headerName: "Package Info",
			renderHeader: () => <strong>Package Info</strong>,
			flex: 1,
			renderCell: (params) => {
				const packageInfo = params?.value;
				return (
					<Typography variant="body2" color={packageInfo ? "textPrimary" : "textSecondary"} sx={{ fontStyle: packageInfo ? "normal" : "italic" }}>
						{packageInfo ? packageInfo : "No Package"}
					</Typography>
				);
			},
		},
		{
			field: "TrainingType",
			headerName: "Training Type",
			renderHeader: () => <strong>Training Type</strong>,
			flex: 1,
		},
		{
			field: "TrainingMode",
			headerName: "Mode",
			renderHeader: () => <strong>Mode</strong>,
			flex: 1,
		},
		{
			field: "TrainingBy",
			headerName: "Trainer",
			renderHeader: () => <strong>Trainer</strong>,
			flex: 1,
		},
		{
			field: "Attendees",
			headerName: "Attendees",
			renderHeader: () => <strong>Attendees</strong>,
			flex: 1.5,
		},
		{
			field: "DurationTime",
			headerName: "Duration (hrs)",
			type: "number",
			renderHeader: () => <strong>Duration</strong>,
			renderCell: (params) => <Typography variant="body2">{params?.value?.toFixed(2)} hrs</Typography>,
		},
		{
			field: "training",
			headerName: "Training",
			renderHeader: () => <strong>Training</strong>,
			flex: 1,
			renderCell: (params) => {
				const hasTraining = params.row?.Details && extractRecordingLink(params.row?.Details || "");
				return hasTraining ? (
					<Chip icon={<CheckCircleOutlineIcon fontSize="small" />} label="Recorded" sx={{ backgroundColor: getColorByStatus("Completed") }} size="small" />
				) : (
					<Chip icon={<TimerRoundedIcon fontSize="small" color="action" />} label="Pending" color="warning" size="small" sx={{ backgroundColor: getColorByStatus("Pending") }} />
				);
			},
		},
		{
			field: "Status",
			headerName: "Status",
			renderHeader: () => <strong>Status</strong>,
			flex: 1,
			renderCell: (params) => <StatusAction showNotification={showNotification} params={params} />,
		},
		{
			field: "Remark",
			headerName: "Remarks",
			renderHeader: () => <strong>Remarks</strong>,
			flex: 1,
		},
		{
			field: "Details",
			headerName: "Details",
			renderHeader: () => <strong>Details</strong>,
			sortable: false,
			flex: 1,
			renderCell: (params) => (
				<Button size="small" color="primary" onClick={() => setDetailModal(params.row)} sx={{ textTransform: "none" }}>
					<DescriptionRoundedIcon /> View Details
				</Button>
			),
		},
		{
			field: "Edit",
			headerName: "Edit",
			sortable: false,
			renderHeader: () => <strong>Edit</strong>,
			renderCell: (params) => (
				<IconButton size="small" color="primary" onClick={() => HandleEditMode(params?.row)} sx={{ textTransform: "none" }} title="Edit">
					<EditRoundedIcon />
				</IconButton>
			),
		},
		{
			field: "Delete",
			headerName: "Delete",
			sortable: false,
			renderHeader: () => <strong>Delete</strong>,
			renderCell: (params) => <DeleteTrainingAction showNotification={showNotification} params={params} />,
		},
	];
};
