import { InputAdornment, TextField } from "@mui/material";
import { Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";

const SearchBar = ({ filters, handleSearchChange }) => {
	const [tempSearch, setTempSearch] = useState(filters.search || "");
	const debouncedSearchChange = useMemo(
		() =>
			debounce((value) => {
				handleSearchChange({ target: { name: "search", value } });
			}, 100),
		[handleSearchChange],
	);
	useEffect(() => {
		debouncedSearchChange(tempSearch);
		return () => debouncedSearchChange.cancel();
	}, [tempSearch, debouncedSearchChange]);

	return (
		<TextField
			placeholder="Search Training ..."
			size="small"
			fullWidth
			value={tempSearch}
			onChange={(e) => setTempSearch(e.target.value)}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						<Search />
					</InputAdornment>
				),
			}}
		/>
	);
};

export default SearchBar;
