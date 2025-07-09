import React, { useEffect, useMemo, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Search } from "lucide-react";
import ClearIcon from "@mui/icons-material/ClearRounded";
import debounce from "lodash/debounce";

const SearchBar = ({ filters, handleSearchChange }) => {
	const [tempSearch, setTempSearch] = useState(filters.search || "");

	const debouncedSearchChange = useMemo(
		() =>
			debounce((value) => {
				handleSearchChange("search", value);
			}, 100),
		[handleSearchChange],
	);

	useEffect(() => {
		debouncedSearchChange(tempSearch);
		return () => debouncedSearchChange.cancel();
	}, [tempSearch, debouncedSearchChange]);

	const handleClear = () => {
		setTempSearch("");
		handleSearchChange("search", "");
	};

	return (
		<TextField
			placeholder="Search Orders..."
			size="small"
			sx={{ width: "50%" }}
			value={tempSearch}
			onChange={(e) => setTempSearch(e.target.value)}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						<Search fontSize="small" />
					</InputAdornment>
				),
				endAdornment: tempSearch && (
					<InputAdornment position="end">
						<IconButton onClick={handleClear}>
							<ClearIcon fontSize="small" />
						</IconButton>
					</InputAdornment>
				),
			}}
		/>
	);
};

export default SearchBar;
