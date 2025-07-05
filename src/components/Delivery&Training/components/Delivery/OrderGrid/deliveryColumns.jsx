import AssignmentTooltip from "./AssignmentTooltip";
import DescriptionButton from "./DescriptionButton";
import TrainingActionButton from "./TrainingActionButton";
import SentMailActionButton from "./SentMailActionButton";
import ActionButton from "./ActionButton";
import { ApprovalStatusChip, DeliveryStatusChip, PaymentStatusChip, ServiceTypeChip } from "./CustomChips";
import { Box, Chip, Typography } from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import PaymentAction from "./PaymentAction";
import { FormatDateIST, isUpcoming } from "../../../utils/helpers";
import DateTooltip from './DateTooltip';

export const getDeliveryColumns = (HandleFormSave, setShowTrainingForm, setShowDetails, showNotification, isClient, HandleEditMode, setShowDeleteModal, SetOpenCompass) => {
  return [
    {
      field: "index",
      headerName: "ID",
      width: 70,
      sortable: false,
      renderHeader: () => <strong>Sr.No</strong>,
      filterable: false,

      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
      },
    },
    {
      field: "ClientCode",
      headerName: "Client",
      width: 170,
      renderHeader: () => <strong>Client</strong>,
    },
    {
      field: "OrderNo",
      headerName: "OrderNo",
      width: 150,
      renderHeader: () => <strong>Order No</strong>,
      renderCell: (params) => {
        const isShowing = !isClient && isUpcoming(params?.row?.Status, params?.row?.Date);
        return (
          <Box sx={{ position: "relative", display: "flex", alignItems: "start", flexDirection: "column", maxWidth: '100px', minWidth: '100px' }}>
            {isShowing && (
              <Chip
                label="Upcoming"
                sx={{
                  position: "absolute",
                  top: -13,
                  right: -25,
                  height: 18,
                  fontSize: "0.70rem",
                  px: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  bgcolor: "#fdf0ec",
                  color: "#cc5c00",
                  zIndex: 1,
                  textTransform: "uppercase",
                  "& .MuiChip-label": {
                    paddingLeft: "7px",
                    paddingRight: "7px",
                    overflow: "unset",
                    textOverflow: "unset",
                    whiteSpace: "unset",
                  },
                }}
              />
            )}

            <Typography variant="body2" fontSize="0.875rem" mt={0.5}>
              {params?.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "Topic",
      headerName: "Topic",
      width: 200,
      renderHeader: () => <strong>Topic</strong>,
    },
    {
      field: "TopicType",
      headerName: "Topic Type",
      width: 130,
      renderHeader: () => <strong>Topic Type</strong>,
    },
    {
      field: "TicketNo",
      headerName: "Ticket No",
      width: 150,
      renderHeader: () => <strong>Ticket No</strong>,
    },
    // Date
    {
      field: "Date",
      headerName: " Request Date",
      width: 120,
      renderHeader: () => <strong>Request Date</strong>,
      renderCell: (params) => <DateTooltip isClient={isClient} params={params} />,
    },
    // Ticket Number

    // Client Code

    // {
    //   field: "TicketDate",
    //   headerName: "Ticket Date",
    //   width: 130,
    //   type: "date",
    //   valueFormatter: (params) => {
    //     return params?.value?.toLocaleDateString("en-GB");
    //   },
    //   renderHeader: () => <strong>Ticket Date</strong>,
    //   renderCell: (params) => <Typography variant="body2">{FormatDateIST(params?.value)}</Typography>,
    // },
    // {
    //   field: "RequestDate",
    //   headerName: "Request Date",
    //   width: 150,
    //   renderHeader: () => <strong>Request Date</strong>,
    //   renderCell: (params) => <Typography variant="body2">{FormatDateIST(params?.value)}</Typography>,
    // },
    // {
    //   field: "ConfirmationDate",
    //   headerName: "Confirmation Date",
    //   width: 150,
    //   renderHeader: () => <strong>Confirmation Date</strong>,
    //   renderCell: (params) => <Typography variant="body2">{FormatDateIST(params?.value)}</Typography>,
    // },
    {
      field: "Description",
      headerName: "description",
      width: 200,
      renderHeader: () => <strong>Description</strong>,
      renderCell: (params) => <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px',
              minWidth: '100px'
            }}
            title={params?.value}
          >
            {params?.value?.split(' ').slice(0, 5).join(' ') + (params?.value?.split(' ').length > 6 ? '...' : '')}
          </span>
          <DescriptionButton isClient={isClient} onEdit={HandleFormSave} params={params} />
        </div>
      </>,
    },

    {
      field: "CommunicationWith",
      headerName: "Communication With",
      width: 170,
      renderHeader: () => <strong>Communication With</strong>,
    },
    {
      field: "ServiceType",
      headerName: "Service",
      width: 150,
      renderHeader: () => <strong>Service</strong>,
      renderCell: (params) => <ServiceTypeChip onSelect={HandleFormSave} rowData={params} type={params?.value?.trim()} />,
    },
    {
      field: "OnDemand",
      headerName: "On Demand",
      width: 150,
      renderHeader: () => <strong>On Demand</strong>,
      renderCell: (params) => <Typography textAlign={"center"} textTransform={'capitalize'} variant="body2">{params?.value?.trim()}</Typography>,
    },
    {
      field: "NoPrints",
      headerName: "No of Prints",
      width: 110,
      renderHeader: () => <strong>{isClient ? "No of Topics" : "No of Prints"}</strong>,
      renderCell: (params) => <Typography textAlign={"center"} variant="body2">{params?.value ? params?.value : "-"}</Typography>,
    },
    {
      field: "Assignments", 
      headerName: "Assigned To",
      width: 150,
      renderHeader: () => <strong>Estimate</strong>,
      valueFormatter: (params) => params?.value?.join(", "),
      renderCell: (params) => <AssignmentTooltip params={params} />,
    },
    {
      field: "SentMail",
      headerName: "Sent Mail",
      width: 120,
      renderHeader: () => <strong>Sent Mail</strong>,
      renderCell: (params) => <SentMailActionButton SetOpenCompass={SetOpenCompass} showNotification={showNotification} params={params} />,
    },


    // {
    //   field: "copyDescription",
    //   headerName: "Copy Description",
    //   width: 150,
    //   renderHeader: () => <strong>Copy Description</strong>,
    //   renderCell: (params) => <DescriptionButton isClient={isClient} onEdit={HandleFormSave} params={params} />,
    // },

    // {
    //   field: "CodeUploadTime",
    //   headerName: "CodeUploadTime",
    //   width: 150,
    //   renderHeader: () => <strong>Code Upload Time</strong>,
    // },




    {
      field: "PaymentMethod",
      headerName: "Payment Method",
      width: 140,
      renderHeader: () => <strong>Payment Method</strong>,
      renderCell: (params) => <PaymentAction isClient={isClient} params={params} />,
    },
    {
      field: "PaymentStatus",
      headerName: "Payment Status",
      width: 140,
      renderHeader: () => <strong>Payment Status</strong>,
      renderCell: (params) => <PaymentStatusChip isClient={isClient} onSelect={HandleFormSave} rowData={params} status={params.value?.trim()} />,
    },
    {
      field: "ApprovedStatus",
      headerName: "Approval",
      width: 130,
      renderHeader: () => <strong>Approval</strong>,
      renderCell: (params) => <ApprovalStatusChip isClient={isClient} rowData={params || ""} onSelect={HandleFormSave} status={params.value?.trim()} />,
    },
    {
      field: "Status",
      headerName: "Delivery Status",
      width: 140,
      renderHeader: () => <strong>Delivery Status</strong>,
      renderCell: (params) => <DeliveryStatusChip isClient={isClient} onSelect={HandleFormSave} rowData={params} status={params.value?.trim()} />,
    },
    // {
    //     field: "training",
    //     headerName: "Training",
    //     width: 120,
    //     renderHeader: () => <strong>Training</strong>,
    //     renderCell: (params) => {
    //         const hasTraining = params && Array.isArray(params.value) && params.value.length > 0;
    //         return hasTraining ? (
    //             <Chip
    //                 icon={<CheckCircleOutline fontSize="small" />}
    //                 label="Added"
    //                 size="small"
    //                 sx={{
    //                     backgroundColor: '#fff3cd',
    //                     color: '#856404',
    //                     fontWeight: 500,
    //                     cursor: 'pointer',
    //                 }}
    //             />
    //         ) : (
    //             <Chip  
    //                 label="Required"
    //                 variant="outlined"
    //                 size="small"
    //                 onClick={() => setShowTrainingForm(params)}
    //                 sx={{
    //                     borderColor: '#f8d7da',
    //                     color: '#721c24',
    //                     fontWeight: 500,
    //                     backgroundColor: '#fef1f2',
    //                     cursor: 'pointer',
    //                     '&:hover': {
    //                         backgroundColor: '#f8d7da',
    //                     },
    //                 }}
    //             />
    //         );
    //     }
    // },
    // {
    //     field: "trainingTo",
    //     headerName: "Training To",
    //     width: 120,
    //     renderHeader: () => <strong>Training To</strong>,
    //     renderCell: (params) => {
    //         const value = 5;
    //         return value ? value : <Typography variant="body2" color="text.secondary">—</Typography>
    //     },
    // },
    // {
    //     field: "trainingBy",
    //     headerName: "Training By",
    //     width: 120,
    //     renderHeader: () => <strong>Training By</strong>,

    //     renderCell: (params) => {
    //         const value =  0;
    //         return value ? value : <Typography variant="body2" color="text.secondary">—</Typography>
    //     },
    // },
    // {
    //     field: "scheduleTraining",
    //     headerName: "Schedule",
    //     width: 150,
    //     renderHeader: () => <strong>Schedule Training</strong>,
    //     renderCell: (params) => <TrainingActionButton isClient={isClient} onSchedule={HandleFormSave} params={params} />,
    // },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderHeader: () => <strong>{isClient ? "View Details" : "Action"}</strong>,
      renderCell: (params) => <ActionButton onDeleteToggle={() => setShowDeleteModal(params?.row?.SrNo)} onEdit={() => HandleEditMode(params?.row)} isClient={isClient} onOpen={() => setShowDetails(params?.row)} />,
    },
  ];
};
