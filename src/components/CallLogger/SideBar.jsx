import { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Drawer, Box, Typography, Divider, TextField, Grid, Button, Autocomplete } from "@mui/material";
import { CircleHelp, CopyPlus } from "lucide-react";
import { SideBarTheme } from "../../libs/DateTheme";
import { formatTimeX } from "../../libs/formatTime";
import { useCallLog } from "../../context/UseCallLog";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/UseAuth";

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
};

export default function CallLogDrawer({ onclearFilters, open, onClose, onRecordToggle, data, callStatusValue }) {
	const { user } = useAuth();
	const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
	const [errors, setErrors] = useState({});
	const [additionalSettingsOpen, setAdditionalSettingsOpen] = useState(false);
	const { addCall, APPNAME_LIST, companyOptions, forwardOption } = useCallLog();
	const companyInputRef = useRef(null);
	const isConcurrent = callStatusValue?.duration > 0 || !!data;

	useEffect(() => {
		if (open) {
			if (!data) {
				const now = new Date();
				setFormData({
					...INITIAL_FORM_STATE,
					id: uuidv4(),
					date: now.toISOString().split("T")[0],
					time: formatTimeX(now),
					receivedBy: user?.id ? String(user.id) : "",
				});

				// Update time every minute
				const timerId = setInterval(() => {
					setFormData((prev) => ({ ...prev, time: formatTimeX(new Date()) }));
				}, 60000);

				return () => clearInterval(timerId);
			} else {
				const companyValue = companyOptions?.find((option) => option?.label === data?.company)?.value || null;
				const appnameValue = APPNAME_LIST?.find((option) => option?.AppName === data.AppName)?.AppId || null;

				// Handle receivedBy - could be an ID or a string
				let receivedByValue = forwardOption?.find((option) => option?.person === data?.receivedBy) || null;

				if (receivedByValue) {
					receivedByValue = {
						label: receivedByValue?.person,
						value: receivedByValue?.id?.split(",")[1],
					};
				}
				let forwardValue = "";

				if (data?.AssignedEmpName) {
					const foundForward = forwardOption?.find((option) => option?.person === data.AssignedEmpName);
					if (foundForward) {
						forwardValue = foundForward.id;
					}
				} else if (data?.forward) {
					forwardValue = data.forward;
				}

				setFormData({
					id: data?.id || uuidv4(),
					date: data?.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
					time: data?.time || formatTimeX(new Date()),
					company: companyValue,
					callBy: data?.callBy || "",
					appname: appnameValue,
					receivedBy: receivedByValue?.value,
					forward: isConcurrent ? "" : forwardValue,
					description: data?.description || "",
				});
			}
		}
	}, [open, data, forwardOption]);

	// Focus on company input when drawer opens
	useEffect(() => {
		if (open && companyInputRef.current) {
			const focusTimer = setTimeout(() => {
				const input = companyInputRef.current.querySelector("input");
				if (input) input.focus();
			}, 100);
			return () => clearTimeout(focusTimer);
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

	// Handle company selection
	const handleCompanyChange = (event, newValue) => {
		setFormData((prev) => ({
			...prev,
			company: newValue?.value || null,
		}));
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

	// Handle receivedBy field - supports both selection and free text input
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
	const handleSubmit = () => {
		if (!validateForm()) return;

		// Prepare data for API submission
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
		};

		try {
			addCall(callData, isConcurrent);
			if (!data || !open) {
				onRecordToggle();
			}
			handleReset();
		} catch (error) {
			console.error("Error adding call log:", error);
		}
	};

	const handleReset = () => {
		setFormData({ ...INITIAL_FORM_STATE, id: uuidv4() });
		setErrors({});
		setAdditionalSettingsOpen(false);
		// onclearFilters();
		onClose();
	};

	// Find the corresponding display objects based on the stored values
	const selectedCompany = companyOptions?.find((option) => option?.value === formData?.company) || null;

	const selectedAppName = APPNAME_LIST?.find((option) => option?.AppId === formData?.appname || option?.value === formData?.appname);

	const appNameValue = selectedAppName
		? {
				label: selectedAppName?.AppName,
				value: selectedAppName?.AppId,
			}
		: null;

	// Find the forward person by ID
	const selectedForward = forwardOption?.find((option) => option?.id === formData?.forward) || null;

	// Process receivedBy value for the Autocomplete component
	let receivedByValue = null;

	// First try to find a match in the options
	const receivedByOption = forwardOption?.find((option) => option?.id?.split(",")[1] === formData?.receivedBy || option?.person === formData?.receivedBy);

	if (receivedByOption) {
		// If we found a match in the options, use that
		receivedByValue = {
			label: receivedByOption.person,
			value: receivedByOption.id?.split(",")[1] || receivedByOption.id,
		};
	} else if (formData.receivedBy) {
		// If no match but we have a value, use it directly
		if (typeof formData.receivedBy === "string") {
			receivedByValue = {
				label: formData.receivedBy,
				value: formData.receivedBy,
			};
		} else if (typeof formData.receivedBy === "object" && formData.receivedBy !== null) {
			receivedByValue = formData.receivedBy;
		}
	}

	// Custom filter for forward options
	const filterForwardOptions = (options, { inputValue }) => {
		const query = inputValue?.toLowerCase()?.trim() || "";
		if (!query) return options;

		const keywords = query?.split(" ").filter(Boolean);
		return options.filter((option) => {
			const fullText = `${option?.designation || ""} ${option?.person || ""}`.toLowerCase();
			return keywords.every((word) => fullText.includes(word));
		});
	};

	return (
		<ThemeProvider theme={SideBarTheme}>
			<Drawer anchor="left" open={open} onClose={onClose}>
				<Box
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
							<CopyPlus size={22} /> {isConcurrent ? "Add Concurrent Call" : data ? "Edit Call Log" : "Add Call Log"}
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
								<TextField fullWidth label="Time" type="time" value={formData.time || ""} onChange={handleTextFieldChange("time")} margin="normal" disabled={!data} InputLabelProps={{ shrink: true }} inputProps={{ step: 600 }} />
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
							renderInput={(params) => <TextField {...params} label="Received By" margin="normal" />}
						/>

						{/* Company Selection */}
						<Autocomplete
							key={"company-input"}
							ref={companyInputRef}
							fullWidth
							options={companyOptions || []}
							value={selectedCompany}
							onChange={handleCompanyChange}
							getOptionLabel={(option) => option?.label || ""}
							isOptionEqualToValue={(option, value) => option?.value === value?.value}
							renderInput={(params) => <TextField {...params} label="Company Name" margin="normal" error={!!errors.company} helperText={errors.company} disabled={!!data} autoFocus />}
						/>

						{/* Customer Name */}
						<TextField
							fullWidth
							label="Customer Name"
							value={formData.callBy || ""}
							onChange={handleTextFieldChange("callBy")}
							margin="normal"
							error={!!errors.callBy}
							helperText={errors.callBy}
							// disabled={!!data}
						/>

						{/* Description */}
						<TextField fullWidth label="Description" value={formData?.description || ""} onChange={handleTextFieldChange("description")} margin="normal" error={!!errors.description} helperText={errors.description} multiline rows={2} />

						<Divider sx={{ my: 2 }} />

						{/* Additional Settings */}
						<Typography onClick={() => setAdditionalSettingsOpen(!additionalSettingsOpen)} fontSize={15} sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
							* Additional Settings <CircleHelp size={15} style={{ marginLeft: 5 }} />
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
							isOptionEqualToValue={(option, value) => option?.value === value?.value}
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
						{/* Forward To */}
						<Autocomplete
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
						/>
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
						<Button variant="contained" sx={{ flex: 1 }} color="primary" size="large" onClick={handleSubmit}>
							{isConcurrent ? "+ Add Call" : data ? "Update" : "Add"}
						</Button>
						<Button variant="contained" sx={{ flex: 1 }} onClick={onClose} size="large" color="error">
							Cancel
						</Button>
					</Box>
				</Box>
			</Drawer>
		</ThemeProvider>
	);
}
