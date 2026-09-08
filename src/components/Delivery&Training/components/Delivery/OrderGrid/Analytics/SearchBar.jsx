import React, { useEffect, useMemo, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Search } from "lucide-react";
import ClearIcon from "@mui/icons-material/ClearRounded";
import debounce from "lodash/debounce";

const SearchBar = ({ filters, handleSearchChange }) => {
  const [tempSearch, setTempSearch] = useState(filters.search);

  useEffect(() => {
    setTempSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (tempSearch !== filters.search) {
        handleSearchChange("search", tempSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [tempSearch]);

  const handleClear = () => {
    setTempSearch("");
    handleSearchChange("search", "");
  };

  return (
    <TextField
      placeholder="Search Orders..."
      size="small"
      sx={{
        width: 220,
        "& .MuiInputBase-root": {
          height: "38px",
          fontSize: "0.85rem",
        },
      }}
      value={tempSearch}
      onChange={(e) => setTempSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={16} />
          </InputAdornment>
        ),
        endAdornment: tempSearch && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
