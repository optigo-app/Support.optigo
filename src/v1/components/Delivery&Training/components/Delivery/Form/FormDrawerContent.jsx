import React, { memo, useEffect, useMemo, useRef } from "react";
import { Typography, MenuItem, InputLabel, Select, Button, Tooltip, FormHelperText, Divider, FormControl, Grid } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SaveIcon from "@mui/icons-material/Save";
import { Autocomplete } from "@mui/material";
import { DrawerFooter, FormContainer, FormSection, SectionTitle, StyledFormControl, StyledTextField } from "../../shared/styles/MuiStyle";
import { mockTopicTypes ,PointType , mockServiceTypes, mockPaymentStatuses } from "../../../constants/constants";
import { initialState } from "../../../hooks/useOrderForm";
import { useAuth } from "../../../context/AuthProvider";
import { useDelivery } from "../../../context/DeliveryProvider";
import { formatToDateInput, parseAssignments } from "../../../utils/deliveryUtils";
import AssignmentForm from "./AssignmentForm";
import { usePointToDiscuss } from "../../../../PointToBeDiscuss/context/usePointToDiscuss";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation, useNavigate } from "react-router-dom";

const FormDrawerContent = ({ IsMoveToOrder, onClose, editValue, isEditMode, setTempEditMode, validateTheForm, useDeliveryOrPoint, useDeliveryOrPointContext }) => {
  const { formData, setFormData, errors, updateField, addAssignment, removeAssignment, handleSave, updateAssignment, validateForm, IsLoading } = useDeliveryOrPoint();
  const { editData } = useDeliveryOrPointContext();
  const { user, LoggedUser } = useAuth();
  const { COMPANY_MASTER_LIST: CompanyMaster, EMPLOYEE_GROUP_BY_DESIGNATION } = useDelivery();
  const { deleteTopic } = usePointToDiscuss();
  const location = useLocation();
  const TicketStateData = location.state;
  const queryParams = new URLSearchParams(location.search);
  const idx = queryParams.get("idx") ? atob(queryParams.get("idx")) : null;
  const router = useNavigate();
  const fieldRefs = useRef([]);
  fieldRefs.current = []; // reset every render

  const TopicTypesOpitons = validateTheForm ?  mockTopicTypes : PointType ;

  const registerField = (el) => {
    if (el && !fieldRefs.current.includes(el)) {
      fieldRefs.current.push(el);
    }
  };

  const handleTab = (e, tabIndex) => {
    if (e.key !== "Tab") return;

    e.preventDefault();

    const fields = fieldRefs.current
      .filter((el) => el && el.dataset && el.dataset.tabindex) // ⬅️ filter invalid
      .sort((a, b) =>
        parseInt(a.dataset.tabindex) - parseInt(b.dataset.tabindex)
      );

    const currentIndex = fields.findIndex(
      (f) => parseInt(f.dataset.tabindex) === tabIndex
    );

    const nextField = !e.shiftKey
      ? fields[currentIndex + 1] || fields[0]
      : fields[currentIndex - 1] || fields[fields.length - 1];

    nextField?.focus();
  };


  const DefaultUser = useMemo(() => {
    return {
      department: user?.designation,
      user: LoggedUser,
      userId: user?.userid,
      estimate: {
        hours: 1,
      },
      description: "",
    };
  }, [user, LoggedUser]);

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
        SampleApprovalDate: formatToDateInput(editValue?.SampleApprovalDate),
      });
    } else {
      const companyMatch = CompanyMaster?.find((c) => c?.label?.toLowerCase() === TicketStateData?.companyname?.toLowerCase())?.label || TicketStateData?.companyname;

      setFormData((prev) => ({
        ...prev,
        createdBy: LoggedUser,
        assignments: !validateTheForm ? [] : [DefaultUser],
        ...(idx === "req" && TicketStateData
          ? {
            ticketNo: TicketStateData?.TicketNo,
            ticketDate: formatToDateInput(TicketStateData?.CreatedOn, true),
            clientCode: companyMatch,
            topic: TicketStateData?.subject,
            description: TicketStateData?.instruction,
            communicationWith: TicketStateData?.username,
            TicketId: TicketStateData?.TicketId,
          }
          : {}),
      }));
    }
  }, [isEditMode]);

  const handleInputChange = (field) => (e) => {
    updateField(field, e.target.value);
  };

  const handleAutocompleteChange = (field) => (event, newValue) => {
    updateField(field, newValue?.label || "");
  };

  const handleFormSave = async () => {
    if (IsMoveToOrder) {
      try {
        const success = await handleSave(true);
        if (success) {
          await deleteTopic(editValue?.SrNo);
          onClose();
          setFormData(initialState);
          setTempEditMode(null);
          router(location.pathname, { state: {}, replace: true });
        } else {
          console.warn("⚠️ Topic not moved to order.");
        }
      } catch (error) {
        console.error("❌ Error while trying to move topic to order:", error);
      }

      return;
    }
    if (isEditMode) {
      if (validateTheForm) {
        const isValid = validateForm();
        if (!isValid) {
          console.log("Fix validation errors before saving (edit mode).");
          return;
        }
      }

      await editData(editValue?.SrNo, formData);
      onClose();
      setFormData(initialState);
      setTempEditMode(null);
    } else {
      const success = await handleSave(validateTheForm);
      if (success) {
        onClose();
        setFormData(initialState);
        setTempEditMode(null);
        router(location.pathname, { state: {}, replace: true });
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
                    <StyledTextField disabled inputProps={{ readOnly: true }} fullWidth size="small" label="Date" type="date" value={formData.date} onChange={handleInputChange("date")} InputLabelProps={{ shrink: true }} required={validateTheForm} helperText="Request creation date" />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Enter the unique client identification code" arrow placement="top-start">
                    <Autocomplete
                      autoSelect
                      inputRef={registerField}
                      inputProps={{
                        "data-tabindex": 1,
                      }}
                      onKeyDown={(e) => handleTab(e, 1)}

                      disabled={isEditMode}
                      blurOnSelect
                      disablePortal
                      value={CompanyMaster.find((option) => option.label === formData.clientCode) || null}
                      onChange={handleAutocompleteChange("clientCode")}
                      getOptionLabel={(option) => option?.label || ""}
                      isOptionEqualToValue={(option, value) => option?.value === value?.value}
                      size="small"
                      options={CompanyMaster}
                      renderInput={(params) => (
                        <StyledTextField
                          inputProps={{
                            ...params.inputProps,
                            tabIndex: 1,
                          }}
                          {...params}
                          fullWidth
                          size="small"
                          label="Client Code"
                          placeholder="e.g., CL-12345"
                          required={validateTheForm}
                          error={!!errors.clientCode}
                          helperText={errors.clientCode || "Client's unique identifier"}
                        />
                      )}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Your name or user ID" arrow placement="top-start">
                    <StyledTextField  disabled fullWidth size="small" label="Created By" value={formData.createdBy} onChange={handleInputChange("createdBy")} placeholder="Your name" required={validateTheForm} helperText="Person creating this request" />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Who are you communicating with?" arrow placement="top-start">
                    <StyledTextField
                      inputRef={registerField}
                      inputProps={{
                        "data-tabindex": 5,
                      }}
                      onKeyDown={(e) => handleTab(e, 5)}
                      fullWidth size="small" label="Communication With" value={formData?.communicationWith} onChange={handleInputChange("communicationWith")} placeholder="Name of the person" required={validateTheForm} error={!!errors.communicationWith} helperText={errors.communicationWith || "Person you're coordinating with for this request"} />
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
                      <StyledFormControl fullWidth required={validateTheForm} size="small" error={!!errors.serviceType}>
                         <input
    ref={registerField}
    data-tabindex={10}
    onKeyDown={(e) => handleTab(e, 10)}
    style={{
      position: "absolute",
      opacity: 0,
      pointerEvents: "none",
      height: 0,
      width: 0,
    }}
  />
                        <InputLabel>Service Type</InputLabel>
                        <Select
                        onKeyDown={(e) => handleTab(e, 10)}
                        value={formData.serviceType} onChange={handleInputChange("serviceType")} label="Service Type" autoSelect blurOnSelect>
                          {mockServiceTypes.map((type) => (
                            <MenuItem key={type.label} value={type.label}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors.serviceType || "Level of service required"}</FormHelperText>
                      </StyledFormControl>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Tooltip title="Current payment status for this request" arrow placement="top-start">
                      <StyledFormControl fullWidth required={validateTheForm} size="small">
                            <input
    ref={registerField}
    data-tabindex={11}
    onKeyDown={(e) => handleTab(e, 11)}
    style={{
      position: "absolute",
      opacity: 0,
      pointerEvents: "none",
      height: 0,
      width: 0,
    }}
  />
                        <InputLabel>Payment Status</InputLabel>
                        <Select 
                        onKeyDown={(e) => handleTab(e, 11)}
                        value={formData.paymentStatus} onChange={handleInputChange("paymentStatus")} label="Payment Status">
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
                                                    <input
    ref={registerField}
    data-tabindex={12}
    onKeyDown={(e) => handleTab(e, 12)}
    style={{
      position: "absolute",
      opacity: 0,
      pointerEvents: "none",
      height: 0,
      width: 0,
    }}
  />
                        <InputLabel id="service-type-label">onDemand</InputLabel>
                        <Select 
                        
                        onKeyDown={(e) => handleTab(e, 12)}
                         labelId="service-type-label" value={formData.onDemand} onChange={handleInputChange("onDemand")} label="on Demand" required>
                          <MenuItem value="yes">Client</MenuItem>
                          <MenuItem value="no">Optigo</MenuItem>
                        </Select>
                      </FormControl>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Tooltip title="Date when the sample was approved" arrow placement="top-start">
                      <StyledTextField fullWidth size="small" label="Sample Approval Date" type="date" value={formData.SampleApprovalDate} onChange={handleInputChange("SampleApprovalDate")} 
                         inputRef={registerField}  
                        inputProps={{
                          "data-tabindex": 13,
                        }}
                        onKeyDown={(e) => handleTab(e, 13)}
                      InputLabelProps={{ shrink: true }} error={!!errors.SampleApprovalDate} helperText={errors?.SampleApprovalDate || "When sample was approved"} />
                    </Tooltip>
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
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
                    </Grid> */}
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
                    <StyledTextField
                      inputRef={registerField}
                      inputProps={{
                        "data-tabindex": 2,
                      }}
                      onKeyDown={(e) => handleTab(e, 2)}
                      fullWidth size="small" label="Ticket Number" value={formData.ticketNo} onChange={handleInputChange("ticketNo")} placeholder="TKT-0000" error={!!errors.ticketNo} helperText={errors.ticketNo || "Internal ticket reference"} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Tooltip title="Date when the ticket was created in the system" arrow placement="top-start">
                    <StyledTextField
                      inputRef={registerField}
                      inputProps={{
                        "data-tabindex": 3,
                      }}
                      onKeyDown={(e) => handleTab(e, 3)}
                      fullWidth size="small" label="Ticket Date" type="date" value={formData.ticketDate} onChange={handleInputChange("ticketDate")} InputLabelProps={{ shrink: true }} error={!!errors.ticketDate} helperText={errors?.ticketDate || "When ticket was created"} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Tooltip title="Date when the client requested this service" arrow placement="top-start">
                    <StyledTextField
                      inputRef={registerField}
                      inputProps={{
                        "data-tabindex": 4,
                      }}
                      onKeyDown={(e) => handleTab(e, 4)}
                      fullWidth size="small" label="Request Date" type="date" value={formData.requestDate} onChange={handleInputChange("requestDate")} InputLabelProps={{ shrink: true }} required={validateTheForm} error={!!errors.requestDate} helperText={errors.requestDate || "When client made the request"} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Date when the request was confirmed" arrow placement="top-start">
                    <StyledTextField
                      inputRef={registerField}
                      inputProps={{
                        "data-tabindex": 6,
                      }}
                      onKeyDown={(e) => handleTab(e, 6)} fullWidth size="small" label="Confirmation Date" type="date" value={formData.confirmationDate} onChange={handleInputChange("confirmationDate")} InputLabelProps={{ shrink: true }} error={!!errors.confirmationDate} helperText={errors.confirmationDate || "When the request was confirmed"} required={validateTheForm} />
                  </Tooltip>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Tooltip title="Enter the main topic for this request" arrow placement="top-start">
             <StyledTextField
  inputRef={registerField}
  inputProps={{
    "data-tabindex": 7,
  }}
  onKeyDown={(e) => handleTab(e, 7)}
  fullWidth 
  size="small" 
  required={validateTheForm} 
  label="Topic" 
  value={formData.topic} 
  onChange={handleInputChange("topic")} 
  placeholder="Enter topic name" 
  error={!!errors.topic} 
  helperText={errors.topic || "Main request category"} 
/> </Tooltip>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Tooltip title="Specify the type of topic for better categorization" arrow placement="top-start">
                  <StyledFormControl
  error={!!errors.topicType}
  fullWidth
  required={validateTheForm}
  size="small"
>
  {/* Hidden input only for TAB navigation */}
  <input
    ref={registerField}
    data-tabindex={8}
    onKeyDown={(e) => handleTab(e, 8)}
    style={{
      position: "absolute",
      opacity: 0,
      pointerEvents: "none",
      height: 0,
      width: 0,
    }}
  />

  <InputLabel>Topic Type</InputLabel>

  <Select
    value={formData.topicType}
    onChange={handleInputChange("topicType")}
    label="Topic Type"
    // remove inputRef + inputProps — not needed anymore
  >
    {TopicTypesOpitons.map((type) => (
      <MenuItem key={type.label} value={type.label}>
        {type.label}
      </MenuItem>
    ))}
  </Select>

  <FormHelperText>
    {errors.topicType || "Specific request type"}
  </FormHelperText>
</StyledFormControl>

                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Tooltip title="Enter the number of prints" arrow placement="top-start">
                    <StyledTextField
                      inputRef={registerField}
                      inputProps={{
                        "data-tabindex": 9,
                      }}

                      onKeyDown={(e) => {
                        if (e.key === "Tab") {
                          handleTab(e, 9);
                          return;
                        }

                        // 2️⃣ Restrict unwanted characters
                        if (["-", "+", "e", "E"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}

                      onPaste={(e) => {
                        const paste = e.clipboardData.getData("text");
                        const isValid = /^\d+$/.test(paste); // Only digits allowed
                        if (!isValid) {
                          e.preventDefault();
                        }
                      }}
                      onBeforeInput={(e) => {
                        const isValid = /^\d$/.test(e.data);
                        if (!isValid) {
                          e.preventDefault();
                        }
                      }}

                      disabled={!formData.topicType}
                      fullWidth
                      size="small"
                      required={validateTheForm}
                      label="Prints"
                      value={formData.NoPrints}
                      type="number"
                      onChange={handleInputChange("NoPrints")}
                      placeholder="Enter No of Prints"
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title="Detailed description of the request" arrow placement="top-start">
                    <StyledTextField 
                    inputRef={registerField}  
                        inputProps={{
                          "data-tabindex": 14,
                        }}
                        onKeyDown={(e) => handleTab(e, 14)}
                    required={validateTheForm} error={!!errors.description} fullWidth label="Description" multiline rows={3} value={formData.description} onChange={handleInputChange("description")} placeholder="Provide detailed information about the request..." helperText="Provide detailed information about the request..." />
                  </Tooltip>
                </Grid>
              </Grid>
            </FormSection>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <AssignmentForm
        registerField={registerField}
        handleTab={handleTab}
        employeeData={EMPLOYEE_GROUP_BY_DESIGNATION} assignments={formData.assignments} onAddAssignment={addAssignment} onRemoveAssignment={removeAssignment} error={errors.assignments} onUpdateAssignment={updateAssignment} />
      </FormContainer>

      <DrawerFooter>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFormSave}
          disabled={IsLoading}
          startIcon={IsLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SaveIcon />}
          sx={{
            px: 3,
            backgroundColor: "#0d47a1",
            color: "#fff",
            fontWeight: 600,
            boxShadow: "none",
            textTransform: "none",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#0d47a1",
              boxShadow: "none",
            },
            "&:disabled": {
              opacity: 0.7,
              cursor: "not-allowed",
            },
          }}
        >
          {IsLoading ? "Saving..." : isEditMode ? "Update Request" : "Submit Request"}
        </Button>
      </DrawerFooter>
    </>
  );
};

export default memo(FormDrawerContent);
