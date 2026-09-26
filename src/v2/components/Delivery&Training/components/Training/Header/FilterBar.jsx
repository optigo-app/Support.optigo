import { Box, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, IconButton, Autocomplete, Chip } from "@mui/material";
import { Search } from "lucide-react";
import DualDatePicker from "../../shared/ui/DatePicker";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import SearchBar from "./SearchBar";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTraining } from "../../../context/TrainingProvider";


const FilterBar = ({ filtercount, filters, setFilters, initialFilters, isAdmin = false, onToggle = () => { } }) => {
	const { COMPANY_MASTER_LIST } = useTraining();
	const isAllOrEmpty = (value) => value === "" || value === "All";

	const isAnyFilterActive = () => {
		if (filters.search.trim() !== "") return true;
		if (filters.dateRange.startDate || filters.dateRange.endDate) return true;
		if (!isAllOrEmpty(filters.trainingType)) return true;
		if (!isAllOrEmpty(filters.trainingMode)) return true;
		if (!isAllOrEmpty(filters.status)) return true;
		if (filters.company && filters.company.length > 0) return true;

		return false;
	};

	// Reset all filters
	const handleResetFilters = () => {
		setFilters(initialFilters);
	};

	// Handlers
	const handleSearchChange = (e) => {
		setFilters((prev) => ({
			...prev,
			search: e.target.value,
		}));
	};

	const handleDateChange = (dateRange) => {
		setFilters((prev) => ({
			...prev,
			dateRange,
		}));
	};

	const handleTrainingTypeChange = (e) => {
		setFilters((prev) => ({
			...prev,
			trainingType: e.target.value,
		}));
	};

	const handleTrainingModeChange = (e) => {
		setFilters((prev) => ({
			...prev,
			trainingMode: e.target.value,
		}));
	};

	const handleStatusChange = (e) => {
		setFilters((prev) => ({
			...prev,
			status: e.target.value,
		}));
	};
	return (
		<Box
			sx={{
				width: "100%",
				mt: "1rem",
				mb: "1rem",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					flex: 0.6,
					gap: "0.5rem",
				}}
			>
				{isAdmin && (
					<IconButton
						onClick={onToggle}
						size="small"
						sx={{
							width: 38,
							height: 38,
							border: (theme) => `3px solid ${theme.palette.primary.main}`,
							borderRadius: 4, // ~8px
							color: "primary.main",
							transition: "all 0.2s ease-in-out",
							"&:hover": {
								// backgroundColor: (theme) => theme.palette.action.hover,
								// borderColor: (theme) => theme.palette.primary.dark,
							},
						}}
					>
						<AddRoundedIcon fontSize="large" />
					</IconButton>
				)}
				<SearchBar filtercount={filtercount} filters={filters} handleSearchChange={handleSearchChange} />
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
					gap: "0.5rem",
					width: "65%",
				}}
			>
				{isAnyFilterActive() && (
					<IconButton
						sx={{
							bgcolor: "primary.main",
							color: "#fff",
							"&:hover": { bgcolor: "primary.main", color: "white" },
						}}
						color="primary"
						size="medium"
						onClick={handleResetFilters}
					>
						<TuneRoundedIcon />
					</IconButton>
				)}
				<DualDatePicker value={filters.dateRange} onChange={handleDateChange} />
				{/* Company Selector */}
				<FormControl
					sx={{
						width: "50%",

						"& .MuiAutocomplete-inputRoot": {
							flexWrap: "nowrap !important",
							overflowX: "auto",
							// overflowY: "hidden",
							width: '100%'
						},

						"& .MuiChip-root": {
							maxWidth: 120,
							textOverflow: "ellipsis",
							overflow: "hidden",
							whiteSpace: "nowrap",
						},

						"& .MuiAutocomplete-tag": {
							margin: "2px",
						},
					}}
					size="small"
				>
					<Autocomplete
						multiple
						size="small"
						limitTags={4}
						options={
							Array.from(
								new Set(
									COMPANY_MASTER_LIST?.map(c => c?.CustomerCode).filter(Boolean)
								)
							) || []
						}
						value={filters.company || []}
						onChange={(e, newValue) =>
							setFilters(prev => ({ ...prev, company: newValue }))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Company (Project Code)"
								variant="outlined"
							/>
						)}
					/>
				</FormControl>
				{/* Training Type Selector */}
				<FormControl sx={{ width: "20%" }} size="small">
					<InputLabel>Training Type</InputLabel>
					<Select name="trainingType" label="Training Type" value={filters.trainingType} onChange={handleTrainingTypeChange}>
						<MenuItem value="All">All</MenuItem>
						<MenuItem value="Ignite">Ignite</MenuItem>
						<MenuItem value="Re Training">Re Training</MenuItem>
						<MenuItem value="New">New </MenuItem>
					</Select>
				</FormControl>
				{/* Training Mode Selector */}
				<FormControl sx={{ width: "20%" }} size="small">
					<InputLabel>Training Mode</InputLabel>
					<Select name="trainingMode" label="Training Mode" value={filters.trainingMode} onChange={handleTrainingModeChange}>
						<MenuItem value="All">All</MenuItem>
						<MenuItem value="Online">Online</MenuItem>
						<MenuItem value="OnSite">On Site</MenuItem>
					</Select>
				</FormControl>
				<FormControl sx={{ width: "20%" }} size="small">
					<InputLabel>Status</InputLabel>
					<Select name="status" label="Status" value={filters.status} onChange={handleStatusChange}>
						<MenuItem value="All">All</MenuItem>
						<MenuItem value="Cancelled">Cancelled</MenuItem>
						<MenuItem value="Completed">Completed</MenuItem>
						<MenuItem value="Pending">Pending</MenuItem>
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
};

export default FilterBar;
