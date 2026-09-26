import React, { useEffect, useState, useMemo } from "react";
import { InputAdornment, TextField, Badge, Box, IconButton } from "@mui/material";
import { SearchIcon } from "lucide-react";
import debounce from "lodash/debounce";
import ClearIcon from "@mui/icons-material/Clear";

const SearchBar = ({ filterCount, searchQuery, setsearchQuery }) => {
	const [tempQuery, setTempQuery] = useState(searchQuery || "");

	// Keep local input in sync when parent searchQuery changes (e.g., from URL or Global Search)
	useEffect(() => {
		setTempQuery(searchQuery || "");
	}, [searchQuery]);

	const debouncedSetSearchQuery = useMemo(
		() =>
			debounce((value) => {
				setsearchQuery(value);
			}, 100),
		[setsearchQuery],
	);

	useEffect(() => {
		if (tempQuery !== (searchQuery || "")) {
			debouncedSetSearchQuery(tempQuery);
		}
		return () => {
			debouncedSetSearchQuery.cancel();
		};
	}, [tempQuery, searchQuery, debouncedSetSearchQuery]);

	return (
		<Badge
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "right",
			}}
			color="primary"
			sx={{
				"& .MuiBadge-badge": {
					right: 45,
					bottom: 2,
					height: "auto",
					display: tempQuery ? "flex" : "none",
					padding: 0,
					boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
					borderRadius: "6px",
					zIndex: 5,
				},
			}}
			badgeContent={
				<Box
					sx={{
						px: 0.75,
						py: 0.25,
						borderRadius: "6px",
						fontSize: "0.725rem",
						fontWeight: 600,
						letterSpacing: 0.2,
						lineHeight: 1.2,
						whiteSpace: "nowrap",
					}}
				>
					Search Result : {filterCount}
				</Box>
			}
		>

			<TextField
				value={tempQuery}
				onChange={(e) => setTempQuery(e.target.value)}
				name="SearchQuery"
				sx={{
					minWidth: 260,
					"& .MuiInputBase-input": {
						padding: "8.5px 12px",
					},
				}}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon />
						</InputAdornment>
					),
					endAdornment: tempQuery ? (
						<InputAdornment position="end">
							<IconButton size="small" onClick={() => setTempQuery("")}>
								<ClearIcon fontSize="medium" />
							</IconButton>
						</InputAdornment>
					) : null
				}}

				variant="outlined"
				size="small"
				placeholder="Search Queries"
			/>
		</Badge>
	);
};

export default SearchBar;
