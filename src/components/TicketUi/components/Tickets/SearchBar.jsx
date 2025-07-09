import { InputBase } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Search as SearchIcon } from "lucide-react";
import { useUrlFilters } from "../../../../hooks/useFilters";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	border: "1px solid #DFE1E6",
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#42526E",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "#172B4D",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		width: "100%",
	},
}));
const SearchBar = () => {
	const { filters, updateFilters } = useUrlFilters();
	const inputRef = useRef(null);

	const debouncedUpdate = useMemo(() => debounce((value) => updateFilters({ searchQuery: value }), 150), [updateFilters]);

	useEffect(() => {
		if (inputRef.current && inputRef.current.value.trim() !== (filters.searchQuery ?? "").trim()) {
			inputRef.current.value = filters.searchQuery || "";
		}
	}, [filters.searchQuery]);

	useCallback(() => {
		return () => debouncedUpdate.cancel();
	}, [debouncedUpdate]);

	return (
		<Search>
			<SearchIconWrapper>
				<SearchIcon />
			</SearchIconWrapper>
			<StyledInputBase inputRef={inputRef} defaultValue={filters.searchQuery} onChange={(e) => debouncedUpdate(e.target.value)} disableUnderline placeholder="Search tickets ..." inputProps={{ "aria-label": "search tickets" }} />
		</Search>
	);
};

export default SearchBar;
