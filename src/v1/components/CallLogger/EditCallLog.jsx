import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Drawer, Box, Typography, Divider, TextField, Grid, Button, Autocomplete } from "@mui/material";
import { CopyPlus } from "lucide-react";
import { SideBarTheme } from "../../libs/DateTheme";
import { useCallLog } from "../../context/UseCallLog";
import { formatTimeX } from "../../libs/formatTime";
import { useAuth } from "../../context/UseAuth";

export default function EditCallLogDrawer({ open, onClose, callData, showNotification }) {
	const [formData, setFormData] = useState({});
	const [saving, setSaving] = useState(false);
	const { editCall, APPNAME_LIST, currentCall, companyOptions, forwardOption, STATUS_LIST, ESTATUS_LIST, PRIORITY_LIST, setCurrentCall, CALL_TYPE_MASTER } = useCallLog();
	const { user } = useAuth();
	useEffect(() => {
		if (open && callData) {
			const companyObj = companyOptions?.find((option) => option?.label?.split("/")?.[0]?.toLocaleLowerCase() === callData?.company?.toLocaleLowerCase() || null);
			const appnameObj = APPNAME_LIST?.find((option) => option?.AppName === callData?.appname || option?.AppId === callData?.appname);
			const callTypeObj = CALL_TYPE_MASTER?.find(
				(option) =>
					option?.label?.toLowerCase() === callData?.CallType?.toLowerCase() ||
				option?.value === callData?.CallType
			);
			let receivedByValue = null;
			if (callData?.receivedBy) {
				if (typeof callData.receivedBy === "object" && callData?.receivedBy?.value) {
					receivedByValue = callData.receivedBy;
				} else {
					const receivedByPerson = forwardOption?.find((option) => option?.person === callData?.receivedBy || option?.id?.split(",")[1] === callData?.receivedBy);

					if (receivedByPerson) {
						receivedByValue = {
							label: receivedByPerson?.person,
							value: receivedByPerson?.id?.split(",")[1],
						};
					} else if (typeof callData?.receivedBy === "string") {
						receivedByValue = callData?.receivedBy;
					}
				}
			}

			let forwardToValue = null;
			if (callData?.forwardTo) {
				forwardToValue = callData?.forwardTo;
			} else if (callData?.forward) {
				const forwardPerson = forwardOption?.find((option) => option?.id === callData.forward || option?.person === callData?.AssignedEmpName);
				forwardToValue = forwardPerson || null;
			} else if (callData?.AssignedEmpName) {
				const forwardPerson = forwardOption?.find((option) => option?.person === callData.AssignedEmpName);
				forwardToValue = forwardPerson || null;
			}

			// Format appname value for Autocomplete
			let appnameValue = null;
			if (appnameObj) {
				appnameValue = {
					label: appnameObj.AppName,
					value: appnameObj.AppId
				};
			}

			setFormData({
				...callData,
				id: callData?.sr,
				date: callData?.date ? new Date(callData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
				time: callData?.time || formatTimeX(new Date()),
				company: companyObj || null,
				callBy: callData?.callBy || "",
				appname: appnameValue,
				receivedBy: receivedByValue,
				forwardTo: forwardToValue,
				status: callData?.status,
				priority: callData?.priority,
				Estatus: callData?.Estatus,
				description: callData?.description || "",
				callDetails: callData?.callDetails || "",
				topicRaisedBy: callData?.topicRaisedBy || "Optigo",
				callType: callTypeObj || null,

			});
		}
	}, [open, callData, companyOptions, APPNAME_LIST, forwardOption ,currentCall]);

	const handleChange = (field) => {
		return (event, newValue) => {
			if (field === "appname" || field === "company" || field === "callType" || field === "status" || field === "Estatus" || field === "priority" || field === "receivedBy" || field === "forwardTo") {
				setFormData((prev) => ({
					...prev,
					[field]: newValue || null,
				}));
			} else {
				// Handle regular text inputs
				setFormData((prev) => ({
					...prev,
					[field]: event?.target?.value || "",
				}));
			}
		};
	};

	const filterForwardOptions = (options, { inputValue }) => {
		const query = inputValue?.toLowerCase()?.trim() || "";
		if (!query) return options;

		const keywords = query?.split(" ").filter(Boolean);
		return options.filter((option) => {
			const fullText = `${option?.designation || ""} ${option?.person || ""}`.toLowerCase();
			return keywords.every((word) => fullText.includes(word));
		});
	};

	const handleSubmit = async () => {
		if (saving) return;
		setSaving(true);
		try {
			const submitData = {
				...formData,
				company: formData?.company?.value || formData?.company,
				appname: formData?.appname?.value || formData?.appname,
				receivedBy: typeof formData?.receivedBy === "object" ? formData?.receivedBy.value : formData?.receivedBy,
				forward: formData?.forwardTo?.id || "",
				callType: formData?.callType?.value || "",
			};
			const result = await editCall(callData?.sr, {
				CreatedBy: user?.id,
				CustomerName: submitData?.callBy || "",
				PriorityId: submitData?.priority?.value || "",
				ParentId: submitData?.parentId || "",
				Descr: submitData?.description || "",
				EmpId: submitData?.forwardTo?.id?.split(",")[1] || submitData?.forward?.split(",")[1] || "",
				DeptId: submitData?.forwardTo?.id?.split(",")[0] || submitData?.forward?.split(",")[0] || "",
				StatusId: submitData?.status?.value || "",
				Estatus: submitData?.Estatus?.value || "",
				calldetails: submitData?.callDetails || "",
				EntryDate: submitData?.date || "",
				CallType: submitData?.callType || "",
				AppId: submitData?.appname || "",
			});
			if (result?.success) {
				onClose();
			} else {
				const errorMsg = result?.msg?.stat_msg || "You do not have permission to edit this call.";
				showNotification?.(errorMsg, "error");
			}
		} catch (error) {
			console.error("Error editing call:", error);
			showNotification?.("An error occurred while saving.", "error");
		} finally {
			setSaving(false);
		}
	};

	return (
		<ThemeProvider theme={SideBarTheme}>
			<Drawer anchor="left" open={open} onClose={onClose}>
				<Box
					sx={{
						width: 500,
						height: "100vh",
						display: "flex",
						flexDirection: "column",
					}}
				>
					{/* Header */}
					<Box sx={{ p: 2 }}>
						<Typography variant="h6">
							<CopyPlus size={22} /> Edit Call Log
						</Typography>
						<Divider sx={{ mt: 2 }} />
					</Box>

					{/* Scrollable Form */}
					<Box sx={{ px: 2, flexGrow: 1, overflowY: "auto", pb: 4 }}>
						<Grid container spacing={2}>
							<Grid item xs={6}>
								<TextField
									fullWidth
									label="Date"
									type="date"
									value={formData?.date || new Date().toISOString().split("T")[0]}
									onChange={handleChange("date")}
									margin="normal"
									inputProps={{
										min: new Date(new Date()?.setDate(new Date()?.getDate() - 1))?.toISOString()?.split("T")[0],
										max: new Date()?.toISOString()?.split("T")[0],
									}}
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField fullWidth label="Time" type="time" value={formData?.time || ""} margin="normal" disabled />
							</Grid>
						</Grid>

						<Autocomplete
							disabled
							fullWidth
							options={companyOptions || []}
							value={formData?.company || null}
							onChange={handleChange("company")}
							getOptionLabel={(option) => {
								if (typeof option === "string") return option;
								return option?.label || "";
							}}
							isOptionEqualToValue={(option, value) => {
								if (!option || !value) return false;
								if (typeof option === "string" && typeof value === "string") return option === value;
								return option?.value === value?.value;
							}}
							renderInput={(params) => <TextField {...params} label="Company Name" margin="normal" autoFocus />}
						/>

						<TextField fullWidth label="Customer Name" name="callBy" onChange={handleChange("callBy")} value={formData?.callBy || ""} margin="normal" />

						<Autocomplete
							fullWidth
							options={
								APPNAME_LIST?.map((option) => ({
									label: option?.AppName,
									value: option?.AppId,
								})) || []
							}
							value={formData?.appname || null}
							onChange={handleChange("appname")}
							getOptionLabel={(option) => option?.label || ""}
							isOptionEqualToValue={(option, value) => {
								if (!option || !value) return false;
								return option?.value === value?.value;
							}}
							renderInput={(params) => <TextField {...params} label="AppName" margin="normal" />}
						/>
						<Autocomplete
							key="callType-input"
							fullWidth
							options={CALL_TYPE_MASTER || []}
							value={formData?.callType || null}
							onChange={handleChange("callType")}
							getOptionLabel={(option) => option?.label || ""}
							isOptionEqualToValue={(option, value) => option?.value === value?.value}
							renderInput={(params) => (
								<TextField {...params} label="Call Type" margin="normal" />
							)}
						/>


						<TextField fullWidth label="Description" value={formData?.description || ""} onChange={handleChange("description")} margin="normal" multiline rows={3} />

						<TextField sx={{ textTransform: 'capitalize !important' }} fullWidth label="Topic Raised By" disabled value={formData?.topicRaisedBy || ""} margin="normal" />

						<Grid container spacing={2}>
							<Grid item xs={6}>
								<Autocomplete fullWidth options={STATUS_LIST} value={formData?.status || ""} onChange={handleChange("status")} renderInput={(params) => <TextField {...params} label="Status" margin="normal" />} />
							</Grid>
							<Grid item xs={6}>
								<Autocomplete fullWidth options={ESTATUS_LIST} value={formData?.Estatus || ""} onChange={handleChange("Estatus")} renderInput={(params) => <TextField {...params} label="Estatus" margin="normal" />} />
							</Grid>
						</Grid>

						<Grid item xs={12}>
							<Autocomplete fullWidth options={PRIORITY_LIST} value={formData?.priority || ""} onChange={handleChange("priority")} renderInput={(params) => <TextField {...params} label="Priority" margin="normal" />} />
						</Grid>

						<Autocomplete
							fullWidth
							options={
								forwardOption?.map((val) => ({
									label: val?.person,
									value: val?.id?.split(",")[1],
								})) || []
							}
							value={formData?.receivedBy || null}
							onChange={handleChange("receivedBy")}
							freeSolo
							getOptionLabel={(option) => {
								if (typeof option === "string") return option;
								return option?.label || "";
							}}
							isOptionEqualToValue={(option, value) => {
								if (!option || !value) return false;
								if (typeof option === "string" && typeof value === "string") return option === value;
								if (option.value && value.value) return option.value === value.value;
								if (option.label && value.label) return option.label === value.label;
								return false;
							}}
							renderInput={(params) => <TextField {...params} label="Received By" margin="normal" />}
							disabled
						/>

						<TextField fullWidth label="Call Start" disabled value={formData?.callStart || ""} margin="normal" />

						<TextField fullWidth label="Call Closed" disabled value={formData?.callClosed || ""} margin="normal" />

						<TextField fullWidth label="Call Duration" disabled value={formData?.CallDuration || ""} margin="normal" />

						{/* <TextField fullWidth label="Call Details" value={formData?.callDetails || ""} onChange={handleChange("callDetails")} margin="normal" multiline rows={3} /> */}

						{/* <TextField fullWidth label="Parent ID" disabled value={formData?.parentId || ""} margin="normal" />    */}

						<TextField fullWidth label="Ticket" disabled value={formData?.ticket || ""} margin="normal" />

						<Autocomplete
							fullWidth
							options={forwardOption || []}
							value={formData?.forwardTo || null}
							getOptionLabel={(option) => {
								if (!option) return "";
								return option.designation && option.person ? `${option.designation} / ${option.person}` : option.person || "";
							}}
							isOptionEqualToValue={(option, value) => {
								if (!option || !value) return false;
								return option?.id === value?.id;
							}}
							filterOptions={filterForwardOptions}
							onChange={handleChange("forwardTo")}
							renderInput={(params) => <TextField {...params} label="Forward To" margin="normal" sx={{ mt: 2 }} />}
							renderOption={(props, option) => (
								<Box component="li" {...props} sx={{ borderBottom: "1px solid #eee" }}>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										{option.designation || ""}
									</Typography>
									{option.designation ? " / " : ""}
									<Typography variant="body2" fontWeight="600" sx={{ color: "text.primary" }}>
										{option.person || ""}
									</Typography>
								</Box>
							)}
						/>
					</Box>

					{/* Fixed Bottom Buttons */}
					<Box
						sx={{
							position: "sticky",
							bottom: 0,
							background: "white",
							p: 2,
							borderTop: "1px solid #ddd",
							display: "flex",
							gap: 2,
						}}
					>
						<Button variant="contained" sx={{ flex: 1 }} color="primary" size="large" onClick={handleSubmit} disabled={saving}>
							{saving ? "Saving..." : "Save"}
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