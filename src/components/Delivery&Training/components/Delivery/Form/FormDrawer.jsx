import React, { useState, useCallback, useEffect } from "react";
import { Box, Typography, MenuItem, InputLabel, Select, Paper, Grid, SwipeableDrawer, Button, IconButton, Tooltip, FormHelperText, Divider,  FormControl } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SaveIcon from "@mui/icons-material/Save";
import { Autocomplete, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DrawerFooter, FormContainer, FormSection, SectionTitle, StyledFormControl, StyledTextField } from "../../shared/styles/MuiStyle";
import {  mockTopicTypes, mockServiceTypes, mockPaymentStatuses } from "../../../constants/constants";
import { useOrderForm } from "../../../hooks/useOrderForm";
import { useAuth } from "../../../context/AuthProvider";
import { EditIcon } from "lucide-react";
import { useDelivery } from "../../../context/DeliveryProvider";
import { formatToDateInput, parseAssignments } from "../../../utils/deliveryUtils";

const BottomDrawer = ({ isOpen, setIsOpen, ClearEdit, editValue }) => {
  const isEditMode = Boolean(editValue) || !!editValue;

  const toggleDrawer = useCallback(
    (open) => (event) => {
      if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
        return;
      }
      setIsOpen(open);
      ClearEdit();
    },
    [setIsOpen]
  );

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
      disableSwipeToOpen={false}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          height: "92vh",
          borderRadius: "0px",
          border: "0px solid",
        },
      }}
      sx={{
        borderRadius: "0px !important",
        border: "0px solid",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderColor: "divider",
            bgcolor: "#eeeeee",
            color: "#333333",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEditMode ? "Edit Service Request" : "New Service Request"}
          </Typography>
          <IconButton
            onClick={toggleDrawer(false)}
            aria-label="close drawer"
            sx={{
              textTransform: "none",
              backgroundColor: "lightgray",
              color: "#3a3a3a",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <FormDrawerContent editValue={editValue} isEditMode={isEditMode} onClose={() => setIsOpen(false)} />
      </Box>
    </SwipeableDrawer>
  );
};

export default BottomDrawer;

const FormDrawerContent = ({ onClose, editValue, isEditMode }) => {
  const { formData, setFormData, errors, updateField, addAssignment, removeAssignment, handleSave, updateAssignment } = useOrderForm();
  const { editData } = useDelivery();
  const { LoggedUser } = useAuth();
  const { COMPANY_MASTER_LIST: CompanyMaster, EMPLOYEE_GROUP_BY_DESIGNATION } = useDelivery();

  useEffect(() => {
    if (editValue) {
      const companyMatch = CompanyMaster?.find((c) => c?.label?.toLowerCase() === editValue?.ClientCode?.toLowerCase())?.label || editValue?.ClientCode;
      const parsedAssignments = parseAssignments(editValue?.Assignments);
      setFormData({
        // ...editValue,
        clientCode: companyMatch,
        assignments: parsedAssignments,
        // approvedStatus: editValue?.ApprovedStatus,
        paymentStatus: editValue?.PaymentStatus,
        codeUploadTime: editValue?.CodeUploadTime,
        communicationWith: editValue?.CommunicationWith,
        confirmationDate: formatToDateInput(editValue?.ConfirmationDate),
        createdBy: editValue?.CreatedBy,
        date: formatToDateInput(editValue?.Date),
        description: editValue?.Description,
        NoPrints: editValue?.NoPrints,
        topic: editValue?.Topic,
        topicType: editValue?.TopicType,
        // paymentMethod: editValue?.PaymentMethod,
        requestDate: formatToDateInput(editValue?.RequestDate),
        serviceType: editValue?.ServiceType,
        ticketDate: formatToDateInput(editValue?.TicketDate),
        ticketNo: editValue?.TicketNo,
        onDemand: editValue?.OnDemand,

      });
    } else {
    }
  }, [isEditMode]);

  const handleInputChange = (field) => (e) => {
    updateField(field, e.target.value);
  };

  const handleAutocompleteChange = (field) => (event, newValue) => {
    updateField(field, newValue?.label || "");
  };

  useEffect(() => {
    if (LoggedUser) {
      setFormData((prev) => ({ ...prev, createdBy: LoggedUser }));
    }
  }, [LoggedUser]);

  const handleFormSave = async () => {
    if (isEditMode) {
      await editData(editValue?.SrNo, formData);
      onClose();
      console.log(formData, "formData edit");

    } else {
      const success = await handleSave();
      if (success) {
        onClose();
      } else {
        console.warn("Form not saved, keeping dialog open.");
      }
    }
  };


  return (
    <>
      <FormContainer>
        {/* Basic Information Section */}
        <Grid container spacing={2}>
          {/* 2 */}
          <Grid item xs={12} md={6}>
            <FormSection>
              <SectionTitle>
                <EventNoteIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={500} color="primary.dark">
                  Basic Information
                </Typography>
              </SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Select the current date or the date of request creation" arrow placement="top-start">
                    <StyledTextField disabled inputProps={{ readOnly: true }} fullWidth size="small" label="Date" type="date" value={formData.date} onChange={handleInputChange("date")} InputLabelProps={{ shrink: true }} required helperText="Request creation date" />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Enter the unique client identification code" arrow placement="top-start">
                    <Autocomplete disablePortal value={CompanyMaster.find((option) => option.label === formData.clientCode) || null} onChange={handleAutocompleteChange("clientCode")} getOptionLabel={(option) => option?.label || ""} isOptionEqualToValue={(option, value) => option?.value === value?.value} size="small" options={CompanyMaster} renderInput={(params) => <StyledTextField {...params} fullWidth size="small" label="Client Code" placeholder="e.g., CL-12345" required helperText="Client's unique identifier" />} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Your name or user ID" arrow placement="top-start">
                    <StyledTextField disabled fullWidth size="small" label="Created By" value={formData.createdBy} onChange={handleInputChange("createdBy")} placeholder="Your name" required helperText="Person creating this request" />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Who are you communicating with?" arrow placement="top-start">
                    <StyledTextField fullWidth size="small" label="Communication With" value={formData?.communicationWith} onChange={handleInputChange("communicationWith")} placeholder="Name of the person" required helperText="Person you're coordinating with for this request" />
                  </Tooltip>
                </Grid>
              </Grid>
              <FormSection sx={{ mt: 4 }}>
                <SectionTitle>
                  <ReceiptIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={500} color="primary.dark">
                    Service Details
                  </Typography>
                </SectionTitle>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Tooltip title="Select the type of service required" arrow placement="top-start">
                      <StyledFormControl fullWidth required size="small" error={!!errors.serviceType}>
                        <InputLabel>Service Type</InputLabel>
                        <Select
                          value={formData.serviceType}
                          onChange={handleInputChange("serviceType")}
                          label="Service Type"
                        >
                          {mockServiceTypes.map((type) => (
                            <MenuItem key={type.label} value={type.label}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {errors.serviceType || "Level of service required"}
                        </FormHelperText>
                      </StyledFormControl>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Tooltip title="Current payment status for this request" arrow placement="top-start">
                      <StyledFormControl fullWidth required size="small">
                        <InputLabel>Payment Status</InputLabel>
                        <Select value={formData.paymentStatus} onChange={handleInputChange("paymentStatus")} label="Payment Status">
                          {mockPaymentStatuses.map((status) => (
                            <MenuItem key={status.label} value={status.label}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Current payment state</FormHelperText>
                      </StyledFormControl>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Tooltip title="Are we providing the service (Yes) or receiving it on demand (No)?" arrow placement="top-start">
                      <FormControl fullWidth size="small">
                        <InputLabel id="service-type-label">onDemand</InputLabel>
                        <Select labelId="service-type-label" value={formData.onDemand} onChange={handleInputChange("onDemand")} label="on Demand" required>
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Tooltip title="Time when the code was uploaded" arrow placement="top-start">
                      <StyledTextField
                        fullWidth
                        size="small"
                        label="Code Upload Time"
                        value={formData.codeUploadTime || ""}
                        onChange={handleInputChange("codeUploadTime")}
                        placeholder="Enter time (e.g. 1 hour)"
                        helperText="Time when the code was uploaded"
                        type="number"
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </FormSection>
            </FormSection>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormSection>
              <SectionTitle>
                <AssignmentIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={500} color="primary.dark">
                  Request Details
                </Typography>
              </SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Tooltip title="Enter the ticket reference number" arrow placement="top-start">
                    <StyledTextField fullWidth size="small" label="Ticket Number" value={formData.ticketNo} onChange={handleInputChange("ticketNo")} placeholder="TKT-0000" helperText="Internal ticket reference" />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Tooltip title="Date when the ticket was created in the system" arrow placement="top-start">
                    <StyledTextField fullWidth size="small" label="Ticket Date" type="date" value={formData.ticketDate} onChange={handleInputChange("ticketDate")} InputLabelProps={{ shrink: true }} helperText="When ticket was created" />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Tooltip title="Date when the client requested this service" arrow placement="top-start">
                    <StyledTextField fullWidth size="small" label="Request Date" type="date" value={formData.requestDate} onChange={handleInputChange("requestDate")} InputLabelProps={{ shrink: true }} required helperText="When client made the request" />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Date when the request was confirmed" arrow placement="top-start">
                    <StyledTextField fullWidth size="small" label="Confirmation Date" type="date" value={formData.confirmationDate} onChange={handleInputChange("confirmationDate")} InputLabelProps={{ shrink: true }} required helperText="When the request was confirmed" />
                  </Tooltip>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Tooltip title="Enter the main topic for this request" arrow placement="top-start">
                    <StyledTextField fullWidth size="small" required label="Topic" value={formData.topic} onChange={handleInputChange("topic")} placeholder="Enter topic name" helperText="Main request category" />
                  </Tooltip>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Tooltip title="Specify the type of topic for better categorization" arrow placement="top-start">
                    <StyledFormControl fullWidth required size="small">
                      <InputLabel>Topic Type</InputLabel>
                      <Select value={formData.topicType} onChange={handleInputChange("topicType")} label="Topic Type">
                        {mockTopicTypes.map((type) => (
                          <MenuItem key={type.label} value={type.label}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Specific request type</FormHelperText>
                    </StyledFormControl>
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Enter the number of prints" arrow placement="top-start">
                    <StyledTextField fullWidth size="small" required label="Prints" value={formData.NoPrints} type="number" onChange={handleInputChange("NoPrints")} placeholder="Enter No of Prints" helperText={`Provide Number ${formData?.topicType} of Prints`} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title="Detailed description of the request" arrow placement="top-start">
                    <StyledTextField required error={!!errors.description} fullWidth label="Description" multiline rows={3} value={formData.description} onChange={handleInputChange("description")} placeholder="Provide detailed information about the request..." helperText="Provide detailed information about the request..." />
                  </Tooltip>
                </Grid>
              </Grid>
            </FormSection>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <AssignmentForm employeeData={EMPLOYEE_GROUP_BY_DESIGNATION} assignments={formData.assignments} onAddAssignment={addAssignment} onRemoveAssignment={removeAssignment} error={errors.assignments} onUpdateAssignment={updateAssignment} />
      </FormContainer>

      <DrawerFooter>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFormSave}
          startIcon={<SaveIcon />}
          sx={{
            px: 3,
            backgroundColor: "#0d47a1",
            color: "#fff",
            fontWeight: 600,
            boxShadow: "none",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#0d47a1",
            },
          }}
        >
          {isEditMode ? "Update Request" : " Submit Request"}
        </Button>
      </DrawerFooter>
    </>
  );
};

function AssignmentForm({ employeeData, assignments = [], onAddAssignment, onUpdateAssignment, onRemoveAssignment, error }) {
  const [newAssignment, setNewAssignment] = useState({
    department: null,
    user: null,
    userId: null,
    estimate: { hours: "" },
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const getEmployeesByDesignation = (designation) => {
    return employeeData[designation] || [];
  };

  const DepartmentOptions = employeeData &&Object?.keys(employeeData)

  const handleChange = (field, value) => {
    if (field === "department") {
      const filterList = getEmployeesByDesignation(value);
      setFilteredUsers(filterList);
      setNewAssignment((prev) => ({
        ...prev,
        department: value,
        user: null,
        userId: null,
        estimate: { hours: "" },
      }));
    } else if (field === "user") {
      setNewAssignment((prev) => ({
        ...prev,
        user: value?.label,
        userId: value?.value || null,
      }));
    } else {
      setNewAssignment((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (value) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };
  const handleEstimateChange = (e) => {
    const hours = e.target.value;
    setNewAssignment((prev) => ({
      ...prev,
      estimate: { hours: hours },
    }));

    // Clear error when field is filled
    if (hours) {
      setFormErrors((prev) => ({
        ...prev,
        estimate: "",
      }));
    }
  };

  const validateAssignmentForm = () => {
    const errors = {};

    if (!newAssignment.department) {
      errors.department = "Department is required";
    }

    if (!newAssignment.user) {
      errors.user = "User is required";
    }

    if (!newAssignment.estimate.hours) {
      errors.estimate = "Estimated hours is required";
    } else if (isNaN(newAssignment.estimate.hours) || Number(newAssignment.estimate.hours) <= 0) {
      errors.estimate = "Hours must be a positive number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAssignment = () => {
    if (validateAssignmentForm()) {
      const formattedAssignment = {
        department: newAssignment.department,
        user: newAssignment.user,
        userId: newAssignment.userId,
        estimate: {
          hours: Number(newAssignment.estimate.hours),
        },
      };

      if (isEditing && editingIndex !== null) {
        onUpdateAssignment(editingIndex, formattedAssignment);
      } else {
        onAddAssignment(formattedAssignment);
      }

      // Reset form
      setNewAssignment({
        department: null,
        user: null,
        userId: null,
        estimate: { hours: "" },
      });
      setIsEditing(false);
      setEditingIndex(null);
      setFormErrors({});
    }
  };

  const handleEditAssignment = (index) => {
    const assignmentToEdit = assignments[index];
    const designationName = assignmentToEdit.department;
    const users = getEmployeesByDesignation(designationName);

    setFilteredUsers(users);
    setNewAssignment({
      department: assignmentToEdit.department,
      user: assignmentToEdit.user,
      userId: assignmentToEdit.userId,
      estimate: {
        hours: assignmentToEdit.estimate?.hours?.toString() || "",
      },
    });
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setNewAssignment({
      department: null,
      user: null,
      estimate: { hours: "" },
      userId: null,
    });
    setIsEditing(false);
    setEditingIndex(null);
    setFormErrors({});
  };

  return (
    <FormSection>
      <SectionTitle>
        <PeopleAltIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={500} color="primary.dark">
          Assignments
        </Typography>
      </SectionTitle>

      <Grid container spacing={3}>
        {/* Left Column - Assignment Form */}
        <Grid item xs={12} md={5}>
          <Box
            elevation={0}
            sx={{
              height: "100%",
            }}
          >
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {isEditing && (
                <Box sx={{ mb: 2, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
                  <Typography variant="body2" color="primary" fontWeight={500}>
                    Editing Assignment #{editingIndex + 1}
                  </Typography>
                </Box>
              )}

              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Tooltip title="Select the department for this assignment" arrow placement="top-start">
                      <Autocomplete options={DepartmentOptions} value={newAssignment?.department} onChange={(e, val) => handleChange("department", val)} renderInput={(params) => <StyledTextField {...params} label="Department" fullWidth required size="small" error={!!formErrors?.department} helperText={formErrors?.department || "Select responsible department"} />} />
                    </Tooltip>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Tooltip title="Choose the team member to assign" arrow placement="top-start">
                      <Autocomplete disabled={!newAssignment.department} options={filteredUsers} value={newAssignment.user} onChange={(e, val) => handleChange("user", val)} renderInput={(params) => <StyledTextField {...params} label="Assigned To" fullWidth required size="small" error={!!formErrors.user} helperText={formErrors.user || "Select team member"} />} />
                    </Tooltip>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Tooltip title="Estimated time for completing the task" arrow placement="top-start">
                      <StyledTextField label="Estimated Hours" value={newAssignment.estimate.hours} onChange={handleEstimateChange} fullWidth required size="small" type="number" inputProps={{ min: 1 }} error={!!formErrors.estimate} disabled={!newAssignment.department || !newAssignment.user} helperText={formErrors.estimate || "Hours required"} />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start", gap: 1 }}>
                <Tooltip title={isEditing ? "Update Assignment" : "Add Assignment"} arrow>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddAssignment}
                    startIcon={isEditing ? <EditIcon sx={{ color: "#fff" }} /> : <AddIcon sx={{ color: "#fff" }} />}
                    sx={{
                      px: 3,
                      backgroundColor: "#0d47a1",
                      color: "#fff",
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: "none",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#0d47a1",
                      },
                    }}
                  >
                    {isEditing ? "Update Assignment" : "Add Assignment"}
                  </Button>
                </Tooltip>

                {isEditing && (
                  <Tooltip title="Cancel Edit" arrow>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancelEdit}
                      sx={{
                        px: 3,
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                    >
                      Cancel
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </CardContent>
          </Box>
        </Grid>

        {/* Right Column - Assignments Table */}
        <Grid item xs={12} md={7}>
          {error && (
            <Typography color="error" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}
          {assignments.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 150,
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                overflow: "auto",
              }}
            >
              <Table size="small" stickyHeader aria-label="assignments table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Estimated Time (hrs)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "grey.200" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        transition: "background-color 0.2s ease",
                        backgroundColor: editingIndex === index ? "#e3f2fd" : "inherit",
                      }}
                    >
                      <TableCell>{assignment.user?.name || assignment.user || "-"}</TableCell>
                      <TableCell>{assignment.department?.name || assignment.department || "-"}</TableCell>
                      <TableCell>{assignment.estimate?.hours || "-"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Assignment" arrow>
                          <IconButton onClick={() => handleEditAssignment(index)} color="primary" size="small" sx={{ mr: 1 }} disabled={isEditing && editingIndex !== index}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Assignment" arrow>
                          <IconButton onClick={() => onRemoveAssignment(index)} color="error" size="small" disabled={isEditing}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                border: "1px dashed",
                borderColor: "grey.300",
                bgcolor: "background.paper",
                p: 2,
              }}
            >
              <Typography color="text.secondary" sx={{ textAlign: "center" }}>
                No assignments added yet.
                <br />
                Add your first assignment using the form.
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </FormSection>
  );
}
