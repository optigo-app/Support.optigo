import { InputAdornment, TextField, Badge, Box } from "@mui/material";
import { Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";

const SearchBar = ({ filtercount, filters, handleSearchChange }) => {
  const [tempSearch, setTempSearch] = useState(filters?.search || "");
  const handleSearchChangeRef = useRef(handleSearchChange);

  useEffect(() => {
    handleSearchChangeRef.current = handleSearchChange;
  }, [handleSearchChange]);

  const debouncedSearchChange = useMemo(
    () =>
      debounce((value) => {
        handleSearchChangeRef.current({ target: { name: "search", value } });
      }, 300),
    []
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => debouncedSearchChange.cancel();
  }, [debouncedSearchChange]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setTempSearch(value);
    debouncedSearchChange(value);
  }, [debouncedSearchChange]);

  useEffect(() => {
    if (filters?.search !== tempSearch) {
      setTempSearch(filters?.search || "");
    }
  }, [filters?.search]);

  return (
    <Badge
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      color="primary"
      sx={{
        display: "block",          // ✅ allows full-width stretch
        width: "100%",             // ✅ takes parent width
        "& .MuiBadge-badge": {
          right: 5,
          display: tempSearch ? "flex" : "none",
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
            letterSpacing: 0.2
          }}
        >
          Search Result : {filtercount}
        </Box>
      }

    >
      <TextField
        placeholder="Search Training..."
        size="small"
        fullWidth
        value={tempSearch}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
        }}
      />
    </Badge>
  );
};

export default SearchBar;