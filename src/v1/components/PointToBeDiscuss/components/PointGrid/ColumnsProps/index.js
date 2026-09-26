import AssignmentTooltip from "./../../../../Delivery&Training/components/Delivery/OrderGrid/AssignmentTooltip";
import DescriptionButton from "./../../../../Delivery&Training/components/Delivery/OrderGrid/DescriptionButton";
import SentMailActionButton from "./../../../../Delivery&Training/components/Delivery/OrderGrid/SentMailActionButton";
import ActionButton from "./../../../../Delivery&Training/components/Delivery/OrderGrid/ActionButton";
import { ApprovalStatusChip, CurrentStatusChip, DeliveryStatusChip, PackageModeChip, PaymentStatusChip, ServiceTypeChip } from "./../../../../Delivery&Training/components/Delivery/OrderGrid/CustomChips";
import { Box, Chip, Typography } from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import PaymentAction from "./../../../../Delivery&Training/components/Delivery/OrderGrid/PaymentAction";
import { isUpcoming } from "./../../../../Delivery&Training/utils/helpers";
import DateTooltip from "./../../../../Delivery&Training/components/Delivery/OrderGrid/DateTooltip";
import GroupAvatars from "../../../../Delivery&Training/components/Delivery/OrderGrid/RemarkActionGroup";
import WarmOrderChip from "../../../../Delivery&Training/components/Delivery/OrderGrid/MoveToOrder";

export const getPointGridColumns = (HandleFormSave, setShowTrainingForm, setShowDetails, showNotification, isClient, HandleEditMode, setShowDeleteModal, SetOpenCompass, HandleMoveOrder) => {
  return [

    {
      field: "index",
      headerName: "ID",
      width: 70,
      sortable: false,
      renderHeader: () => <strong>Sr.No</strong>,
      filterable: false,

      renderCell: (params) => {
        const page = params.api.state.pagination?.paginationModel?.page ?? 0;
        const pageSize = params.api.state.pagination?.paginationModel?.pageSize ?? 100;
        return page * pageSize + params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
      },
    },

    {
      field: "ClientCode",
      headerName: "Client",
      width: 170,
      renderHeader: () => <strong>Client</strong>,
    },
    {
      field: "Mode",
      headerName: "Package Mode",
      width: 150,
      renderHeader: () => <strong>Package Mode</strong>,
      renderCell: (params) => <PackageModeChip isClient={isClient} onSelect={HandleFormSave} rowData={params} status={params.value?.trim()} />,
    },
    {
      field: "OrderNo",
      headerName: "OrderNo",
      width: 150,
      renderHeader: () => <strong>Topic No</strong>,
      renderCell: (params) => {
        const isShowing = !isClient && isUpcoming(params?.row?.Status, params?.row?.Date);
        return (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "start",
              flexDirection: "column",
              maxWidth: "100px",
              minWidth: "100px",
            }}
          >
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
      field: "Date",
      headerName: " Request Date",
      width: 150,
      renderHeader: () => <strong>Date</strong>,
      renderCell: (params) => <DateTooltip isClient={isClient} params={params} />,
    },
    {
      field: "Description",
      headerName: "description",
      width: 370,
      renderHeader: () => <strong>Topic & Description</strong>,
      renderCell: (params) => {
        const description = params?.value || "";
        const topic = params?.row?.Topic || "";

        return (
          <>
            <>
              <Box
                sx={{
                  maxWidth: "280px",
                  minWidth: "280px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <Typography
                  color="text.primary" // Strong, dark text
                  variant="subtitle2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                  }}
                  fontWeight={600}
                >
                  {topic}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                  title={description}
                  fontSize={`13px`}
                >
                  {description}
                </Typography>
              </Box>
              <DescriptionButton isClient={isClient} onEdit={HandleFormSave} params={params} />
            </>
          </>
        );
      },
    },
    {
      field: "TopicType",
      headerName: "Topic Type",
      width: 130,
      renderHeader: () => <strong>Topic Type</strong>,
      renderCell: (params) => {
        const topic = params?.value;
        const noPrints = params?.row?.NoPrints;
        return (
          <Box display="flex" flexDirection="column">
            <Typography variant="body2" fontWeight={500}>
              {topic || "--"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {noPrints != null ? `No of Quantity: ${noPrints}` : "No print data"}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "TicketNo",
      headerName: "Ticket No",
      width: 150,
      renderHeader: () => <strong>Ticket No</strong>,
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
      renderCell: (params) => (
        <Typography textAlign={"center"} textTransform={"capitalize"} variant="body2">
          {params?.value?.trim() === "yes" ? "Client" : "Optigo"}
        </Typography>
      ),
    },
    // {
    //   field: "NoPrints",
    //   headerName: "No of Quantity",
    //   width: 110,
    //   renderHeader: () => <strong>No of Quantity</strong>,
    //   renderCell: (params) => (
    //     <Typography textAlign={"center"} variant="body2">
    //       {params?.value ? params?.value : "-"}
    //     </Typography>
    //   ),
    // },
    {
      field: "Assignments",
      headerName: "Assigned To",
      width: 150,
      renderHeader: () => <strong>Estimate</strong>,
      valueFormatter: (params) => params?.value?.join(", "),
      renderCell: (params) => <AssignmentTooltip params={params} isPoint={true} />,
    },
    // {
    //   field: "SentMail",
    //   headerName: "Sent Mail",
    //   width: 120,
    //   renderHeader: () => <strong>Sent Mail</strong>,
    //   renderCell: (params) => <SentMailActionButton SetOpenCompass={SetOpenCompass} showNotification={showNotification} params={params} />,
    // },
    // {
    //     field: "PaymentMethod",
    //     headerName: "Payment Method",
    //     width: 140,
    //     renderHeader: () => <strong>Payment Method</strong>,
    //     renderCell: (params) => <PaymentAction isClient={isClient} params={params} />,
    // },
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
      field: "CurrentStatus",
      headerName: "CurrentStatus",
      width: 170,
      renderHeader: () => <strong>Current Status</strong>,
      renderCell: (params) => <CurrentStatusChip isClient={isClient} rowData={params || ""} onSelect={HandleFormSave} status={params.value?.trim()} />,
    },
    // {
    //   field: "Status",
    //   headerName: "Delivery Status",
    //   width: 140,
    //   renderHeader: () => <strong>Delivery Status</strong>,
    //   renderCell: (params) => <DeliveryStatusChip DontOpen={true} isClient={isClient} onSelect={HandleFormSave} rowData={params} status={params.value?.trim()} />,
    // },
    {
      field: "Remark",
      headerName: "Remarks",
      width: 130,
      renderHeader: () => <strong>Remarks</strong>,
      renderCell: (params) => <GroupAvatars params={params} />,
    },
    {
      field: "MoveToOrder",
      headerName: "Move To Order",
      width: 140,
      renderHeader: () => <strong>Move To Order</strong>,
      renderCell: (params) => <WarmOrderChip HandleMoveToOrder={() => HandleMoveOrder(params?.row)} />,
    },
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
