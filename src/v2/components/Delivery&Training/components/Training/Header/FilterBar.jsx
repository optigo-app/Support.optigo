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
				my: 1.5,
				display: "flex",
				flexWrap: "wrap",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 1.5,
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					gap: 1,
					minWidth: 0,
					flex: { xs: "1 1 100%", lg: "0 0 auto" },
				}}
			>
				{isAdmin && (
					<IconButton
						onClick={onToggle}
						size="small"
						sx={{
							width: 38,
							height: 38,
							border: (theme) => `2px solid ${theme.palette.primary.main}`,
							borderRadius: 2,
							color: "primary.main",
							transition: "all 0.2s ease-in-out",
						}}
					>
						<AddRoundedIcon fontSize="medium" />
					</IconButton>
				)}
				<Box sx={{ minWidth: 200, maxWidth: 300, flex: { xs: "1 1 200px", sm: "0 0 auto" } }}>
					<SearchBar filtercount={filtercount} filters={filters} handleSearchChange={handleSearchChange} />
				</Box>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: { xs: "flex-start", sm: "flex-end" },
					flexWrap: "wrap",
					gap: 1.5,
					flex: { xs: "1 1 100%", lg: "1 1 auto" },
					minWidth: 0,
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
				<Box sx={{ minWidth: 220, maxWidth: 280, flex: "1 1 220px" }}>
					<DualDatePicker value={filters.dateRange} onChange={handleDateChange} />
				</Box>
				{/* Company Selector */}
				<FormControl
					sx={{
						minWidth: 180,
						maxWidth: { xs: "100%", md: 260 },
						flex: "1 1 180px",
						"& .MuiAutocomplete-inputRoot": {
							overflowX: "auto",
						},
						"& .MuiChip-root": {
							maxWidth: 100,
							textOverflow: "ellipsis",
							overflow: "hidden",
							whiteSpace: "nowrap",
						},
					}}
					size="small"
				>
					<Autocomplete
						multiple
						size="small"
						limitTags={2}
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
				<FormControl sx={{ minWidth: 130, flex: "1 1 130px" }} size="small">
					<InputLabel>Training Type</InputLabel>
					<Select name="trainingType" label="Training Type" value={filters.trainingType} onChange={handleTrainingTypeChange}>
						<MenuItem value="All">All</MenuItem>
						<MenuItem value="Ignite">Ignite</MenuItem>
						<MenuItem value="Re Training">Re Training</MenuItem>
						<MenuItem value="New">New </MenuItem>
					</Select>
				</FormControl>
				{/* Training Mode Selector */}
				<FormControl sx={{ minWidth: 130, flex: "1 1 130px" }} size="small">
					<InputLabel>Training Mode</InputLabel>
					<Select name="trainingMode" label="Training Mode" value={filters.trainingMode} onChange={handleTrainingModeChange}>
						<MenuItem value="All">All</MenuItem>
						<MenuItem value="Online">Online</MenuItem>
						<MenuItem value="OnSite">On Site</MenuItem>
					</Select>
				</FormControl>
				{/* Status Selector */}
				<FormControl sx={{ minWidth: 130, flex: "1 1 130px" }} size="small">
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
