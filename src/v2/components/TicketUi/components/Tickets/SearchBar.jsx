import React, { useEffect, useRef, useState } from "react";
import { InputBase, IconButton, Badge, Box } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Search as SearchIcon, X as CloseIcon } from "lucide-react";
import { useUrlFilters } from "../../../../hooks/useFilters";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

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
		paddingRight: `2em`,
		transition: theme.transitions.create("width"),
		width: "100%",
	},
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
	position: "absolute",
	right: 4,
	top: "50%",
	transform: "translateY(-50%)",
	padding: 4,
	color: "#6B778C",
}));

const SearchBar = ({ filterTicketCount }) => {
	const { filters, updateFilters, hasFilters } = useUrlFilters();
	const inputRef = useRef(null);
	const [value, setValue] = useState(filters.searchQuery || filters.search || "");

	// RxJS Subject for smooth, reactive keystroke handling
	const searchSubject$ = useRef(null);
	if (!searchSubject$.current) {
		searchSubject$.current = new Subject();
	}

	const updateFiltersRef = useRef(updateFilters);
	updateFiltersRef.current = updateFilters;

	useEffect(() => {
		const sub = searchSubject$.current
			.pipe(
				debounceTime(150),
				distinctUntilChanged()
			)
			.subscribe((val) => {
				updateFiltersRef.current({ searchQuery: val, search: val });
			});

		return () => {
			sub.unsubscribe();
		};
	}, []);

	// Sync with URL query changes (e.g. reset/back navigation or global search) when not actively typing
	useEffect(() => {
		const urlQuery = filters.searchQuery || filters.search || "";
		if (urlQuery !== value && document.activeElement !== inputRef.current) {
			setValue(urlQuery);
		}
	}, [filters.searchQuery, filters.search]);

	const handleChange = (e) => {
		const nextVal = e.target.value;
		setValue(nextVal);
		searchSubject$.current.next(nextVal);
	};

	const handleClear = () => {
		setValue("");
		searchSubject$.current.next("");
		updateFiltersRef.current({ searchQuery: "" });
		if (inputRef.current) inputRef.current.focus();
	};

	const showResultBadge = Boolean(value || hasFilters);

	return (
		<Search>
			<SearchIconWrapper>
				<SearchIcon size={18} />
			</SearchIconWrapper>
			<Badge
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				color="primary"
				sx={{
					width: "100%",
					"& .MuiBadge-badge": {
						right: -15,
						display: showResultBadge ? "flex" : "none",
					},
				}}
				badgeContent={
					<Box
						sx={{
							px: 0.6,
							py: 0.4,
							borderRadius: "8px",
							fontSize: "0.75rem",
							fontWeight: 600,
							letterSpacing: 0.2,
						}}
					>
						{value ? "Search Result" : "Search Result"} : {filterTicketCount}
					</Box>
				}
			>
				<StyledInputBase
					inputRef={inputRef}
					value={value}
					onChange={handleChange}
					disableUnderline
					placeholder="Search tickets ..."
					inputProps={{ "aria-label": "search tickets" }}
				/>
			</Badge>
			{value && (
				<ClearButton size="medium" onClick={handleClear}>
					<CloseIcon size={16} />
				</ClearButton>
			)}
		</Search>
	);
};

export default React.memo(SearchBar);
