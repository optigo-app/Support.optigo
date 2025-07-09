import React, { useEffect, useState } from "react";
import { Box, FormControl, Autocomplete, Button, ToggleButtonGroup, ToggleButton, InputAdornment, InputLabel, ListItemText, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import DualDatePicker from "./DatePicker";
import { Plus, SearchIcon } from "lucide-react";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import IconButton from "@mui/material/IconButton";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { useCallLog } from "../../context/UseCallLog";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import SearchBar from "./SearchBar";

const GridHeader = ({ isFilterData, onExcel, callStatusValue, CompanyStatus, onClearAll, SetCompanyStatus, onAdd, searchQuery, setsearchQuery, Status, SetStatus, filterState, setFilterState, viewMode, setViewMode }) => {
	const [tempDateRange, setTempDateRange] = useState({
		startDate: filterState?.dateRange?.startDate,
		endDate: filterState?.dateRange?.endDate,
	});

	useEffect(() => {
		setTempDateRange({
			startDate: filterState?.dateRange?.startDate ? new Date(filterState?.dateRange?.startDate) : null,
			endDate: filterState?.dateRange?.endDate ? new Date(filterState?.dateRange?.endDate) : null,
		});
	}, [filterState?.dateRange]);

	const { COMPANY_LIST, STATUS_LIST, ESTATUS_LIST } = useCallLog();

	const handleClearDateRange = () => {
		const cleared = { startDate: "", endDate: "" };
		setTempDateRange(cleared);
		setFilterState((prev) => ({
			...prev,
			dateRange: cleared,
			filterTargetField: "",
		}));
		onClearAll();
	};

	const StatusList = [...STATUS_LIST, ...ESTATUS_LIST];

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: 2,
				pointerEvents: callStatusValue?.isRunning ? "none" : "auto",
				cursor: callStatusValue?.isRunning ? "not-allowed" : "default",
				opacity: callStatusValue?.isRunning ? 0.6 : 1,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
				<Button disabled={callStatusValue?.duration > 0} onClick={onAdd} variant="contained" startIcon={<Plus />}>
					Add
				</Button>
				<SearchBar searchQuery={searchQuery} setsearchQuery={setsearchQuery} />
				<LogToggle setViewMode={setViewMode} viewMode={viewMode} />
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{(searchQuery || CompanyStatus || (Status && Status !== "all") || filterState?.filterTargetField || filterState?.dateRange?.startDate || filterState?.dateRange?.endDate) && (
					<Tooltip title="Clear All Filters">
						<IconButton
							onClick={handleClearDateRange}
							color="primary"
							sx={{
								m: 1,
								bgcolor: "rbga(0,0,0,0.04)",
							}}
							size="medium"
						>
							<FilterAltOffIcon />
						</IconButton>
					</Tooltip>
				)}
				<Button disabled={callStatusValue?.duration > 0 || !isFilterData} onClick={onExcel} variant="contained" color="success" startIcon={<PiMicrosoftExcelLogoFill />}>
					Export
				</Button>
				<CompanyCodeSelect COMPANY_LIST={COMPANY_LIST} CompanyStatus={CompanyStatus} SetCompanyStatus={SetCompanyStatus} />
				<DualDatePicker setTempDateRange={setTempDateRange} tempDateRange={tempDateRange} filterState={filterState} setFilterState={setFilterState} />
				<StatusSelect STATUS_LIST={StatusList} Status={Status} SetStatus={SetStatus} />
			</Box>
		</Box>
	);
};

export default GridHeader;

const StatusSelect = ({ Status, SetStatus, STATUS_LIST }) => {
	return (
		<FormControl sx={{ m: 1, minWidth: 200 }} size="small">
			<InputLabel id="status-select-label">Status</InputLabel>
			<Select
				labelId="status-select-label"
				id="status-select"
				label="Status"
				value={Status || ""}
				onChange={(e) => SetStatus(e.target.value)}
				MenuProps={{
					PaperProps: {
						sx: {
							maxHeight: 400,
							overflowY: "auto",
						},
					},
				}}
				renderValue={(selected) => {
					const selectedItem = STATUS_LIST.find((item) => item?.value === Number(selected));
					return selectedItem ? selectedItem.label : "Select Status";
				}}
			>
				<MenuItem key="all" value="">
					<ListItemText primary="All" />
				</MenuItem>
				{STATUS_LIST?.map((item) => (
					<MenuItem key={item.value} value={item.value}>
						<ListItemText primary={item.label} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

const LogToggle = ({ viewMode, setViewMode }) => {
	return (
		<ToggleButtonGroup value={viewMode} exclusive size="small" color="primary">
			<Tooltip title="User View" arrow>
				<ToggleButton onClick={() => setViewMode("normal")} value="normal">
					<PersonIcon fontSize="medium" />
				</ToggleButton>
			</Tooltip>

			<Tooltip title="Team View" arrow>
				<ToggleButton onClick={() => setViewMode("team")} value="team">
					<GroupIcon fontSize="medium" />
				</ToggleButton>
			</Tooltip>
		</ToggleButtonGroup>
	);
};

const CompanyCodeSelect = ({ CompanyStatus, SetCompanyStatus, COMPANY_LIST }) => {
	const companyOptions = COMPANY_LIST?.filter((item) => item.type === "COMPANYNAME") || [];

	const selectedCompany = companyOptions.find((item) => item?.ProjectID === Number(CompanyStatus)) || null;

	const handleChange = (event, newValue) => {
		if (newValue) {
			SetCompanyStatus(newValue?.ProjectID);
		} else {
			SetCompanyStatus("");
		}
	};

	return (
		<Autocomplete
			size="small"
			options={companyOptions}
			getOptionLabel={(option) => option.ProjectCode || ""}
			value={selectedCompany}
			onChange={handleChange}
			isOptionEqualToValue={(option, value) => {
				return option?.ProjectID === value?.ProjectID;
			}}
			renderInput={(params) => <TextField {...params} label="Company" variant="outlined" />}
			sx={{ minWidth: 250 }}
		/>
	);
};
