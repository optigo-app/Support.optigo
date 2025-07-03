import React from "react";
import { Typography, Box, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Drawer, IconButton, Paper } from "@mui/material";
import { X } from "lucide-react";
import { formatDate, getApprovalStatus, getPaymentStatus, calculateTotalHours, parseEstimate, formatDateFun } from "../../../utils/helpers";
import PaymentMethodModal from "./PaymentModal";
import { useAuth } from "../../../context/AuthProvider";

const DetailPanel = ({ open, setOpen ,isClient }) => {
  const [openModal, setOpenModal] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(null)}
      PaperProps={{
        sx: {
          width: {
            xs: "90vw",
            sm: "60vw",
            md: "34vw",
          },
          borderRadius: 0,
        },
      }}
    >
      <TicketDetailsContent isClient={isClient} ticketData={open} closeDrawer={toggleDrawer(null)} onToggle={() => setOpenModal(true)} IsClient={isClient} />
      <PaymentMethodModal onClose={() => setOpenModal(false)} open={openModal} ticketData={open} />
    </Drawer>
  );
};

// === Main Content Component ===
const TicketDetailsContent = ({ closeDrawer, ticketData, onToggle = () => { }, IsClient = false }) => {
  const approvalStatus = getApprovalStatus(ticketData?.ApprovedStatus ?? false);
  console.log("🚀 ~ TicketDetailsContent ~ ticketData:", ticketData)
  const paymentStatus = getPaymentStatus(ticketData?.PaymentStatus ?? "");

  const dateFields = {
    ticketDate: formatDateFun(ticketData?.TicketDate),
    requestDate: formatDateFun(ticketData?.RequestDate),
    confirmationDate: formatDateFun(ticketData?.ConfirmationDate),
    lastUpdated: formatDateFun(ticketData?.UpdatedAt),
    createdAt: formatDateFun(ticketData?.Date),
  };

  return (
    <>
      {/* Sticky Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography variant="h6">Delivery Details</Typography>
          <IconButton onClick={closeDrawer}>
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ height: "calc(100% - 64px)", overflowY: "auto", overflowX: "hidden" }}>
        <HeaderBanner dateFields={dateFields} ticketData={ticketData} approvalStatus={approvalStatus} paymentStatus={paymentStatus} />
        <DescriptionSection ticketData={ticketData} />
        {IsClient && <CompletionProgress ticketData={ticketData} />}
        {IsClient && <TimeEstimateSection ticketData={ticketData} />}
        {IsClient && <AssignmentTable ticketData={ticketData} />}
        {/* <TrainingSection ticketData={ticketData} /> */}
        {IsClient && <PaymentInfo ticketData={ticketData} onToggle={onToggle} />}
      </Box>
    </>
  );
};

export default DetailPanel;

// === Section Components ===

const HeaderBanner = ({ dateFields, ticketData, approvalStatus, paymentStatus }) => (
  <Box
    sx={{
      color: "black",
      p: 3,
      bgcolor: "#f3f3f396",
    }}
  >
    <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="start">
      <div style={{ marginBottom: "1rem" }}>
        <Typography variant="h6" noWrap>
          {ticketData?.TicketNo || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {ticketData?.ClientCode || "—"} • #{ticketData?.OrderNo || "—"}
        </Typography>
      </div>
      <Box display="flex" gap={1} flexWrap="wrap">
        <Chip
          label={`Approval Status: ` + approvalStatus?.label}
          size="small"
          sx={{
            backgroundColor: approvalStatus.bgColor,
            color: approvalStatus.textColor,
          }}
        />
        <Chip
          label={`Payment Status: ` + paymentStatus?.label}
          size="small"
          sx={{
            backgroundColor: paymentStatus.bgColor,
            color: paymentStatus.textColor,
          }}
        />
      </Box>
    </Box>

    <Box mt={2} display="flex" justifyContent="space-between" flexWrap="wrap">
      <Box mb={1}>
        <Typography variant="caption">Created: {dateFields?.createdAt}</Typography>
        <br />
        <Typography variant="caption">Requested: {dateFields?.requestDate}</Typography>
      </Box>
      <Box textAlign="right">
        <Typography variant="caption">Type: {ticketData?.TopicType || "—"}</Typography>
        <br />
        <Typography variant="caption">Service Type {ticketData?.ServiceType || "—"}</Typography>
      </Box>
    </Box>
  </Box>
);

const DescriptionSection = ({ ticketData }) => (
  <Box mt={3} px={2}>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Description
    </Typography>
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#f3f3f396",
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        p: 2,
        wordBreak: "break-word",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {ticketData?.Description || "No description available."}
      </Typography>
    </Paper>
  </Box>
);

const CompletionProgress = ({ ticketData }) => {
  const totalHours = calculateTotalHours(parseEstimate(ticketData?.documentEstimate)) + calculateTotalHours(parseEstimate(ticketData?.developerEstimate)) + calculateTotalHours(parseEstimate(ticketData?.uiEstimate)) + calculateTotalHours(parseEstimate(ticketData?.testingEstimate));
  return (
    <Box mt={3} px={2}>
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} sm={4} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
          <Typography variant="caption" color="text.secondary">
            Total Hours
          </Typography>
          <Typography fontWeight="bold">{totalHours > 0 ? totalHours.toFixed(1) : "0.0"}</Typography>
        </Grid>

        <Grid item xs={12} sm={4} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
          <Typography variant="caption" color="text.secondary">
            On Demand
          </Typography>
          <Typography fontWeight="bold" sx={{ textTransform: "capitalize" }}>
            {ticketData?.OnDemand || "—"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
          <Typography variant="caption" color="text.secondary">
            No Of Prints
          </Typography>
          <Typography fontWeight="bold">{ticketData?.NoPrints || "0"}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

const TimeEstimateSection = ({ ticketData }) => {
  const documentEstimates = parseEstimate(ticketData?.documentEstimate);
  const developerEstimates = parseEstimate(ticketData?.developerEstimate);
  const uiEstimates = parseEstimate(ticketData?.uiEstimate);
  const testingEstimates = parseEstimate(ticketData?.testingEstimate);

  const documentTotal = calculateTotalHours(documentEstimates);
  const developerTotal = calculateTotalHours(developerEstimates);
  const uiTotal = calculateTotalHours(uiEstimates);
  const testingTotal = calculateTotalHours(testingEstimates);

  if (documentTotal === 0 && developerTotal === 0 && uiTotal === 0 && testingTotal === 0) {
    return null;
  }
  return (
    <Box mt={3} px={2}>
      <Typography variant="subtitle1" fontWeight="medium" mb={2}>
        Time Estimates
      </Typography>
      <Grid container spacing={2}>
        {/* Document Estimate */}
        {documentTotal > 0 && Array.isArray(documentEstimates) && (
          <Grid item xs={12}>
            <Box sx={{ bgcolor: "#eff6ff", borderLeft: "3px solid #3b82f6", width: "100%" }}>
              <Box p={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="#1e40af" noWrap>
                    Document
                  </Typography>
                  <Typography fontWeight="bold" color="#2563eb">
                    {documentTotal.toFixed(1)}h
                  </Typography>
                </Box>
                {documentEstimates?.map((item, index) => (
                  <Typography key={index} variant="body2" color="#1e3a8a" mt={0.5} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.user || "Unknown"} ({item?.EstimatedHours?.toFixed(1) || "0.0"}h)
                  </Typography>
                ))}
              </Box>
            </Box>
          </Grid>
        )}

        {/* Developer Estimate */}
        {developerTotal > 0 && Array.isArray(developerEstimates) && (
          <Grid item xs={12}>
            <Box sx={{ bgcolor: "#ecfdf5", borderLeft: "3px solid #10b981", width: "100%" }}>
              <Box p={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="#065f46" noWrap>
                    Developer
                  </Typography>
                  <Typography fontWeight="bold" color="#10b981">
                    {developerTotal.toFixed(1)}h
                  </Typography>
                </Box>
                {developerEstimates?.map((item, index) => (
                  <Typography key={index} variant="body2" color="#065f46" mt={0.5} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.user || "Unknown"} ({item?.EstimatedHours?.toFixed(1) || "0.0"}h)
                  </Typography>
                ))}
              </Box>
            </Box>
          </Grid>
        )}

        {/* UI Estimate */}
        {uiTotal > 0 && Array.isArray(uiEstimates) && (
          <Grid item xs={12}>
            <Box sx={{ bgcolor: "#fdf2f8", borderLeft: "3px solid #ec4899", width: "100%" }}>
              <Box p={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="#9d174d" noWrap>
                    UI
                  </Typography>
                  <Typography fontWeight="bold" color="#ec4899">
                    {uiTotal.toFixed(1)}h
                  </Typography>
                </Box>
                {uiEstimates?.map((item, index) => (
                  <Typography key={index} variant="body2" color="#9d174d" mt={0.5} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.user || "Unknown"} ({item?.EstimatedHours?.toFixed(1) || "0.0"}h)
                  </Typography>
                ))}
              </Box>
            </Box>
          </Grid>
        )}

        {/* Testing Estimate */}
        {testingTotal > 0 && Array.isArray(testingEstimates) && (
          <Grid item xs={12}>
            <Box sx={{ bgcolor: "#eef2ff", borderLeft: "3px solid #6366f1", width: "100%" }}>
              <Box p={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="#4338ca" noWrap>
                    Testing
                  </Typography>
                  <Typography fontWeight="bold" color="#6366f1">
                    {testingTotal.toFixed(1)}h
                  </Typography>
                </Box>
                {testingEstimates?.map((item, index) => (
                  <Typography key={index} variant="body2" color="#4338ca" mt={0.5} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.user || "Unknown"} ({item?.EstimatedHours?.toFixed(1) || "0.0"}h)
                  </Typography>
                ))}
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

const AssignmentTable = ({ ticketData }) => {
  const Assignments = parseEstimate(ticketData?.Assignments);

  return (
    <Box mt={3} px={2}>
      <Typography variant="subtitle1" fontWeight="medium" mb={2}>
        Assignments
      </Typography>
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
            <TableRow>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Name</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Department</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(Assignments) && Assignments?.length > 0 ? (
              Assignments?.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell>{assignment?.user || "—"}</TableCell>
                  <TableCell>{assignment?.Department || "—"}</TableCell>
                  <TableCell>{(assignment?.EstimatedHours || 0).toFixed(1)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No assignments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const TrainingSection = ({ ticketData }) => {
  if (!ticketData?.training || !Array.isArray(ticketData.training) || ticketData.training.length === 0) {
    return null;
  }

  return (
    <Box mt={3} px={2}>
      <Typography variant="subtitle1" fontWeight="medium" mb={2}>
        Training
      </Typography>
      <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
        {ticketData.training.map((session, index) => {
          const { attendees, trainingBy, trainingType, trainingMode, projectCode, ticketNo, details, startTime, endTime, schedule = {} } = session;

          return (
            <Box key={index} mb={2} borderBottom={index < ticketData.training.length - 1 ? "1px solid #e0e0e0" : 0} pb={2}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Attendees
                  </Typography>
                  <Typography variant="body2">{attendees || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Trainer
                  </Typography>
                  <Typography variant="body2">{trainingBy || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2">{trainingType || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Mode
                  </Typography>
                  <Typography variant="body2">{trainingMode || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Project Code
                  </Typography>
                  <Typography variant="body2">{projectCode || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Ticket No
                  </Typography>
                  <Typography variant="body2">{ticketNo || "—"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Details
                  </Typography>
                  <Typography variant="body2">{details || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body2">{formatDate(startTime)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    End Time
                  </Typography>
                  <Typography variant="body2">{formatDate(endTime)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Scheduled On
                  </Typography>
                  <Typography variant="body2">{formatDate(schedule.dateTime)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Training Recording Link
                  </Typography>
                  <Typography variant="body2">
                    {schedule.zoomLink ? (
                      <a href={schedule.zoomLink} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                        Join Meeting
                      </a>
                    ) : (
                      "—"
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};

const PaymentInfo = ({ ticketData, onToggle }) => {
  function isValidPaymentMethod(method) {
    if (!method) return false;
    const trimmed = method.trim();
    return trimmed !== "" && trimmed !== "-";
  }
  return <Box mt={3} px={2} mb={3}>
    <Paper elevation={0} variant="outlined" sx={{ p: 2, bgcolor: "#f3f3f396" }}>
      {isValidPaymentMethod(ticketData?.PaymentMethod) ? (
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" gap={2}>
          <div>
            <Typography fontWeight="medium">Payment Information</Typography>
            <Typography variant="caption">
              {ticketData?.PaymentMethod || "No Payment Method Set"} • {ticketData?.SentMail === 1 ? "Mail Sent" : ticketData?.SentMail === 0 ? "Mail Not Sent" : "—"}
            </Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            sx={{
              minWidth: "150px",
              width: { xs: "100%", sm: "auto" },
              maxWidth: "200px",
            }}
          >
            View Payment Details
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box>
            <Typography fontWeight="medium" color="error">
              Payment Required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No payment method has been set for this request.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            sx={{
              mt: 1,
              minWidth: "150px",
              width: { xs: "100%", sm: "auto" },
              maxWidth: "200px",
            }}
            onClick={onToggle}
          >
            Add Payment Method
          </Button>
        </Box>
      )}
    </Paper>
  </Box>
}
