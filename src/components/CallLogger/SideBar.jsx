import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  TextField,
  Grid,
  Button,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { CircleHelp, CopyPlus } from "lucide-react";
import { SideBarTheme } from "../../libs/DateTheme";
import { formatTimeX } from "../../libs/formatTime";
import { useCallLog } from "../../context/UseCallLog";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/UseAuth";
import { addCustomerName, searchCustomerNames } from "../../libs/db";

const INITIAL_FORM_STATE = {
  id: uuidv4(),
  date: "",
  time: "",
  company: "",
  callBy: "",
  appname: "",
  receivedBy: "",
  forward: "",
  description: "",
  callType: "",
};

export default function CallLogDrawer({
  onclearFilters,
  open,
  onClose,
  onRecordToggle,
  data,
  callStatusValue,
  defaultCompany,
  onSuccess,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [errors, setErrors] = useState({});
  const [additionalSettingsOpen, setAdditionalSettingsOpen] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [formKey, setFormKey] = useState(0);
  const {
    addCall,
    APPNAME_LIST,
    companyOptions,
    forwardOption,
    CALL_TYPE_MASTER,
  } = useCallLog();
  const companyInputRef = useRef(null);
  const isConcurrent = callStatusValue?.duration > 0 || !!data;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormKey((k) => k + 1);
      if (!data) {
        const now = new Date();
        let initialCompany = "";
        if (defaultCompany) {
          const matched = companyOptions?.find(
            (opt) =>
              opt?.label?.toLowerCase() === String(defaultCompany).toLowerCase() ||
              opt?.value === String(defaultCompany) ||
              opt?.label?.split("/")?.[0]?.toLowerCase() === String(defaultCompany).toLowerCase()
          );
          initialCompany = matched ? matched.value : defaultCompany;
        }

        setFormData({
          ...INITIAL_FORM_STATE,
          id: uuidv4(),
          date: now.toISOString().split("T")[0],
          time: formatTimeX(now),
          receivedBy: user?.id ? String(user.id) : "",
          company: initialCompany,
        });

        // Update time every minute
        const timerId = setInterval(() => {
          setFormData((prev) => ({ ...prev, time: formatTimeX(new Date()) }));
        }, 60000);

        return () => clearInterval(timerId);
      } else {
        const companyMatch = companyOptions?.find(
          (option) =>
            option?.label?.toLowerCase() === String(data?.company || "").toLowerCase() ||
            option?.value === String(data?.company || data?.ProjectID || "") ||
            option?.label?.split("/")?.[0]?.toLowerCase() === String(data?.company || "").toLowerCase()
        );
        const companyValue = companyMatch?.value || data?.ProjectID || data?.company || "";
        const appnameValue =
          APPNAME_LIST?.find((option) => option?.AppName === data?.AppName || option?.AppId === data?.AppName)
            ?.AppId || data?.appname || null;

        // Handle receivedBy - could be an ID or a string
        let receivedByValue =
          forwardOption?.find(
            (option) => option?.person === data?.receivedBy,
          ) || null;

        if (receivedByValue) {
          receivedByValue = {
            label: receivedByValue?.person,
            value: receivedByValue?.id?.split(",")[1],
          };
        }
        let forwardValue = "";

        if (data?.AssignedEmpName) {
          const foundForward = forwardOption?.find(
            (option) => option?.person === data.AssignedEmpName,
          );
          if (foundForward) {
            forwardValue = foundForward.id;
          }
        } else if (data?.forward) {
          forwardValue = data.forward;
        }

        setFormData({
          id: data?.id || uuidv4(),
          date: data?.date
            ? new Date(data.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          time: data?.time || formatTimeX(new Date()),
          company: companyValue,
          callBy: data?.callBy || "",
          appname: appnameValue,
          receivedBy: receivedByValue?.value,
          forward: isConcurrent ? "" : forwardValue,
          description: data?.description || "",
          callType: data?.CallType || "",
        });
      }
    } else {
      // When drawer is closed, reset form state completely so next open starts fresh
      setFormData({ ...INITIAL_FORM_STATE, id: uuidv4() });
      setErrors({});
      setAdditionalSettingsOpen(false);
      setFormKey((k) => k + 1);
    }
  }, [open, data, companyOptions, defaultCompany, user?.id]);

  useEffect(() => {
    if (open && companyInputRef.current) {
      requestAnimationFrame(() => {
        const input = companyInputRef.current.querySelector("input");
        if (input) input.focus();
      });
    }
    // Initial fetch of customer suggestions when drawer opens
    if (open) {
      searchCustomerNames("").then(setCustomerSuggestions);
    }
  }, [open]);

  // Handle text field changes
  const handleTextFieldChange = (field) => (event) => {
    if (!event?.target) return;

    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Handle company selection - robust for objects and freeSolo strings
  const handleCompanyChange = (event, newValue) => {
    if (!newValue) {
      setFormData((prev) => ({ ...prev, company: "" }));
      setErrors((prev) => ({ ...prev, company: "" }));
      return;
    }

    if (typeof newValue === "object") {
      setFormData((prev) => ({
        ...prev,
        company: newValue?.value || newValue?.label || "",
      }));
    } else if (typeof newValue === "string") {
      const trimmed = newValue.trim();
      const matched = companyOptions?.find(
        (opt) =>
          opt?.label?.toLowerCase() === trimmed.toLowerCase() ||
          opt?.value === trimmed ||
          opt?.label?.split("/")?.[0]?.toLowerCase() === trimmed.toLowerCase()
      );
      setFormData((prev) => ({
        ...prev,
        company: matched ? matched.value : trimmed,
      }));
    }
    setErrors((prev) => ({ ...prev, company: "" }));
  };

  // Handle app name selection
  const handleAppNameChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      appname: newValue?.value || null,
    }));
    setErrors((prev) => ({ ...prev, appname: "" }));
  };

  const handleCallTypeChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      callType: newValue?.value || null,
    }));
    setErrors((prev) => ({ ...prev, callType: "" }));
  };

  const handleReceivedByChange = (event, newValue) => {
    if (typeof newValue === "string") {
      // Direct input as string
      setFormData((prev) => ({
        ...prev,
        receivedBy: newValue,
      }));
    } else if (newValue && typeof newValue === "object") {
      // Selection from dropdown with value property
      setFormData((prev) => ({
        ...prev,
        receivedBy: newValue.value || "",
      }));
    } else {
      // Fallback for null/undefined
      setFormData((prev) => ({
        ...prev,
        receivedBy: "",
      }));
    }

    setErrors((prev) => ({ ...prev, receivedBy: "" }));
  };

  // Handle forward selection
  const handleForwardChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      forward: newValue?.id || "",
    }));
    setErrors((prev) => ({ ...prev, forward: "" }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.company) newErrors.company = "Company is required";
    if (!formData.callBy) newErrors.callBy = "Customer Name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    if (isSubmitting || !validateForm()) return;
    setIsSubmitting(true);

    const newCallId = data?.id || uuidv4();
    const callData = {
      id: newCallId,
      appname: formData.appname || "",
      receivedBy: formData.receivedBy,
      callBy: formData.callBy,
      forward: formData.forward,
      description: formData.description,
      date: formData.date,
      company: formData.company,
      time: formData.time,
      callType: formData.callType,
    };

    try {
      // Save name to suggestions database
      if (formData.callBy) {
        await addCustomerName(formData.callBy);
      }
      const res = await addCall(callData, isConcurrent);
      if (!data || !open) {
        if (typeof onRecordToggle === "function") {
          onRecordToggle();
        }
      }
      if (typeof onSuccess === "function") {
        onSuccess(res || callData);
      }
      handleReset();
    } catch (error) {
      console.error("Error adding call log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...INITIAL_FORM_STATE, id: uuidv4() });
    setErrors({});
    setAdditionalSettingsOpen(false);
    setFormKey((k) => k + 1);
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const derivedSelections = useMemo(() => {
    const selectedCompany = formData?.company
      ? companyOptions?.find(
          (option) =>
            option?.value === String(formData?.company) ||
            option?.label?.toLowerCase() === String(formData?.company).toLowerCase() ||
            option?.label?.split("/")?.[0]?.toLowerCase() === String(formData?.company).toLowerCase()
        ) || {
          label:
            companyOptions?.find((o) => o?.value === String(formData?.company))?.label ||
            String(formData.company),
          value: String(formData.company),
        }
      : null;
    const selectedAppName = formData?.appname
      ? APPNAME_LIST?.find(
          (option) =>
            option?.AppId === formData?.appname ||
            option?.value === formData?.appname,
        ) || null
      : null;
    const selectedCallType = formData?.callType
      ? CALL_TYPE_MASTER?.find(
          (option) =>
            option?.label === formData?.callType ||
            option?.value === formData?.callType,
        ) || null
      : null;
    const appNameValue = selectedAppName
      ? {
          label: selectedAppName?.AppName,
          value: selectedAppName?.AppId,
        }
      : null;
    const selectedForward =
      forwardOption?.find((option) => option?.id === formData?.forward) || null;
    let receivedByValue = null;
    const receivedByOption = forwardOption?.find(
      (option) =>
        option?.id?.split(",")[1] === formData?.receivedBy ||
        option?.person === formData?.receivedBy,
    );
    if (receivedByOption) {
      receivedByValue = {
        label: receivedByOption.person,
        value: receivedByOption.id?.split(",")[1] || receivedByOption.id,
      };
    } else if (formData.receivedBy) {
      if (typeof formData.receivedBy === "string") {
        receivedByValue = {
          label: formData.receivedBy,
          value: formData.receivedBy,
        };
      } else if (
        typeof formData.receivedBy === "object" &&
        formData.receivedBy !== null
      ) {
        receivedByValue = formData.receivedBy;
      }
    }
    return {
      selectedCompany,
      selectedAppName,
      selectedCallType,
      appNameValue,
      selectedForward,
      receivedByValue,
    };
  }, [formData, companyOptions, forwardOption, APPNAME_LIST, CALL_TYPE_MASTER]);
  const {
    selectedCompany,
    selectedAppName,
    selectedCallType,
    appNameValue,
    selectedForward,
    receivedByValue,
  } = derivedSelections;

  const filterForwardOptions = (options, { inputValue }) => {
    const query = inputValue?.toLowerCase()?.trim() || "";
    if (!query) return options;

    const keywords = query?.split(" ").filter(Boolean);
    return options.filter((option) => {
      const fullText =
        `${option?.designation || ""} ${option?.person || ""}`.toLowerCase();
      return keywords.every((word) => fullText.includes(word));
    });
  };

  return (
    <ThemeProvider theme={SideBarTheme}>
      <Drawer anchor="left" open={open} onClose={handleReset}>
        <Box
          key={formKey}
          sx={{
            width: 500,
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Typography variant="h6">
              <CopyPlus size={22} />{" "}
              {isConcurrent
                ? "Add Concurrent Call"
                : data
                  ? "Edit Call Log"
                  : "Add Call Log"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                This form is only for Support team use.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Date & Time */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date || ""}
                  onChange={handleTextFieldChange("date")}
                  margin="normal"
                  disabled={!!data}
                  InputLabelProps={{ shrink: true }}
                  // inputProps={{
                  //   min: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0],
                  //   max: new Date().toISOString().split("T")[0],
                  // }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={formData.time || ""}
                  onChange={handleTextFieldChange("time")}
                  margin="normal"
                  disabled={!data}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 600 }}
                />
              </Grid>
            </Grid>
            {/* Received By */}
            <Autocomplete
              fullWidth
              options={
                forwardOption?.map((val) => ({
                  label: val?.person,
                  value: val?.id?.split(",")[1],
                })) || []
              }
              disabled
              value={receivedByValue}
              onChange={handleReceivedByChange}
              freeSolo
              getOptionLabel={(option) => {
                // Handle different value types for display purposes
                if (typeof option === "string") {
                  return option;
                }
                if (option && option.label) {
                  return option.label;
                }
                return "";
              }}
              isOptionEqualToValue={(option, value) => {
                if (typeof option === "string" && typeof value === "string") {
                  return option === value;
                }
                if (option && value && option.value && value.value) {
                  return option.value === value.value;
                }
                if (option && value && option.label && value.label) {
                  return option.label === value.label;
                }
                return false;
              }}
              renderInput={(params) => (
                <TextField {...params} label="Received By" margin="normal" />
              )}
            />

            {/* Company Selection */}
            <Autocomplete
              key={"company-input"}
              ref={companyInputRef}
              fullWidth
              freeSolo
              options={companyOptions || []}
              value={selectedCompany}
              onChange={handleCompanyChange}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === "clear") {
                  setFormData((prev) => ({ ...prev, company: "" }));
                }
              }}
              getOptionLabel={(option) => {
                if (typeof option === "string") return option;
                return option?.label || "";
              }}
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                if (typeof value === "string") {
                  return option?.value === value || option?.label?.toLowerCase() === value.toLowerCase();
                }
                return option?.value === value?.value || option?.label === value?.label;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Company Name"
                  margin="normal"
                  error={!!errors.company}
                  helperText={errors.company}
                  autoFocus
                />
              )}
            />

            {/* Customer Name with Suggestions */}
            <Autocomplete
              fullWidth
              freeSolo
              openOnFocus
              options={customerSuggestions}
              value={formData.callBy || ""}
              onChange={(event, newValue) => {
                setFormData((prev) => ({ ...prev, callBy: newValue || "" }));
                setErrors((prev) => ({ ...prev, callBy: "" }));
              }}
              onInputChange={(event, newInputValue) => {
                setFormData((prev) => ({ ...prev, callBy: newInputValue }));
                setErrors((prev) => ({ ...prev, callBy: "" }));
                // Fetch suggestions from IndexedDB (including empty/top hits)
                searchCustomerNames(newInputValue).then(setCustomerSuggestions);
              }}
              onFocus={() => {
                // Ensure suggestions are loaded when clicking/focusing
                if (!customerSuggestions.length) {
                  searchCustomerNames(formData.callBy || "").then(
                    setCustomerSuggestions,
                  );
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer Name"
                  margin="normal"
                  error={!!errors.callBy}
                  helperText={errors.callBy}
                />
              )}
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              value={formData?.description || ""}
              onChange={handleTextFieldChange("description")}
              margin="normal"
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={2}
            />

            <Divider sx={{ my: 2 }} />

            {/* Additional Settings */}
            <Typography
              onClick={() => setAdditionalSettingsOpen(!additionalSettingsOpen)}
              fontSize={15}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              * Additional Settings{" "}
              <CircleHelp size={15} style={{ marginLeft: 5 }} />
            </Typography>
            {/* AppName Selection */}
            <Autocomplete
              fullWidth
              options={
                APPNAME_LIST?.map((option) => ({
                  label: option?.AppName,
                  value: option?.AppId,
                })) || []
              }
              value={appNameValue}
              onChange={handleAppNameChange}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) =>
                option?.value === value?.value
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="AppName"
                  margin="normal"
                  error={!!errors.appname}
                  helperText={errors.appname}
                  // disabled={!!data}
                />
              )}
            />
            <Autocomplete
              key={"callType-input"}
              fullWidth
              options={CALL_TYPE_MASTER || []}
              value={selectedCallType}
              onChange={handleCallTypeChange}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) =>
                option?.value === value?.value
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Call Type"
                  margin="normal"
                  error={!!errors.callType}
                  helperText={errors.callType}
                  disabled={!!data}
                />
              )}
            />
            {/* Forward To */}
            {/* <Autocomplete
							fullWidth
							options={forwardOption || []}
							value={selectedForward}
							getOptionLabel={(option) => (option && option.designation && option.person ? `${option.designation} / ${option.person}` : "")}
							onChange={handleForwardChange}
							isOptionEqualToValue={(option, value) => option?.id === value?.id}
							filterOptions={filterForwardOptions}
							renderInput={(params) => <TextField {...params} label="Forward To" margin="normal" sx={{ mt: 2 }} />}
							renderOption={(props, option) => (
								<Box component="li" {...props} sx={{ borderBottom: "1px solid #eee" }}>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										{option.designation}
									</Typography>
									/
									<Typography variant="body2" fontWeight="600" sx={{ color: "text.primary" }}>
										{option.person}
									</Typography>
								</Box>
							)}
						/> */}
          </Box>

          {/* Footer Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              p: 0,
            }}
          >
            <Button
              variant="contained"
              sx={{ flex: 1 }}
              color="primary"
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : isConcurrent ? (
                "+ Add Call"
              ) : data ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
            <Button
              variant="contained"
              sx={{ flex: 1 }}
              onClick={handleReset}
              size="large"
              color="error"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}
