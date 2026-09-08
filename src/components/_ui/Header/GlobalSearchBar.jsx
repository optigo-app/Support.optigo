import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Box,
  InputBase,
  Paper,
  Popper,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import AllInboxRoundedIcon from "@mui/icons-material/AllInboxRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import TollRoundedIcon from "@mui/icons-material/TollRounded";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MODULE_PREFIXES,
  filterModuleSuggestions,
  matchPrefix,
  getModuleByPath,
  dispatchGlobalSearch,
  globalActiveModule$,
  setActiveModule,
  clearActiveModule,
  useRxSubject,
} from "../../../rxjs/globalSearchStore";

const getModuleIcon = (iconName, color = "#64748B") => {
  const sx = { fontSize: 18, color };
  switch (iconName) {
    case "ticket":
      return <InsertDriveFileRoundedIcon sx={sx} />;
    case "call":
      return <CallRoundedIcon sx={sx} />;
    case "archive":
      return <ArchiveRoundedIcon sx={sx} />;
    case "orders":
      return <AllInboxRoundedIcon sx={sx} />;
    case "training":
      return <CloudSyncRoundedIcon sx={sx} />;
    case "orderrequest":
      return <TollRoundedIcon sx={sx} />;
    default:
      return <SearchRoundedIcon sx={sx} />;
  }
};

const GlobalSearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeModule = useRxSubject(globalActiveModule$);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync search value from URL if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || params.get("searchQuery") || "";
    const currentMod = getModuleByPath(location.pathname);

    if (currentMod) {
      setActiveModule(currentMod);
    }
    setInputValue(urlSearch);
  }, [location.pathname, location.search]);

  // Suggestions filter when typing '@'
  const isPrefixMode = useMemo(() => {
    return inputValue.startsWith("@");
  }, [inputValue]);

  const suggestions = useMemo(() => {
    if (!isPrefixMode) return [];
    return filterModuleSuggestions(inputValue);
  }, [inputValue, isPrefixMode]);

  const showPopper = Boolean(isFocused && isPrefixMode && suggestions.length > 0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Handle module chip selection
  const handleSelectModule = useCallback((mod) => {
    setActiveModule(mod);
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle remove active module chip
  const handleRemoveModule = useCallback(() => {
    clearActiveModule();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle execute search
  const handleExecuteSearch = useCallback(
    (queryToSearch = inputValue) => {
      let finalQuery = queryToSearch;
      let targetMod = activeModule;

      // Check if query begins with inline prefix like `@ticket query`
      if (finalQuery.startsWith("@")) {
        const parts = finalQuery.split(" ");
        const potentialPrefix = parts[0];
        const matched = matchPrefix(potentialPrefix);
        if (matched) {
          targetMod = matched;
          finalQuery = parts.slice(1).join(" ");
        }
      }

      dispatchGlobalSearch({
        query: finalQuery,
        targetModule: targetMod,
        navigate,
        currentPath: location.pathname,
      });

      setIsFocused(false);
    },
    [inputValue, activeModule, navigate, location.pathname]
  );

  // Keyboard navigation & Tab completion
  const handleKeyDown = (e) => {
    if (showPopper && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        const selected = suggestions[selectedIndex] || suggestions[0];
        if (selected) {
          handleSelectModule(selected);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setInputValue("");
        return;
      }
    }

    if (e.key === "Backspace" && !inputValue && activeModule) {
      e.preventDefault();
      handleRemoveModule();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleExecuteSearch();
    }
  };

  const currentModuleFallback = useMemo(() => {
    return activeModule || getModuleByPath(location.pathname);
  }, [activeModule, location.pathname]);

  return (
    <ClickAwayListener onClickAway={() => setIsFocused(false)}>
      <Box sx={{ position: "relative", width: { xs: 200, sm: 360, md: 480 } }}>
        <Paper
          ref={containerRef}
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: isFocused ? "#FFFFFF" : "#F3F4F6",
            borderRadius: "50px",
            px: 1.25,
            py: 0.35,
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid",
            borderColor: isFocused ? "#c13bffff" : "transparent",
            boxShadow: isFocused ? "0 0 0 2px rgba(99, 102, 241, 0.15)" : "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            gap: 0.75,
          }}
        >
          <SearchRoundedIcon sx={{ color: isFocused ? "#6366F1" : "#9CA3AF", fontSize: 19, flexShrink: 0 }} />

          {/* Active Module Chip Tag */}
          {activeModule && (
            <Chip
              size="small"
              icon={getModuleIcon(activeModule.iconName, activeModule.chipColor)}
              label={activeModule.label}
              onDelete={handleRemoveModule}
              deleteIcon={<ClearRoundedIcon style={{ fontSize: 13, color: activeModule.chipColor }} />}
              sx={{
                height: 23,
                fontSize: "0.725rem",
                fontWeight: 700,
                color: activeModule.chipColor,
                bgcolor: activeModule.chipBg,
                border: `1px solid ${activeModule.chipBorder}`,
                borderRadius: "6px",
                flexShrink: 0,
                "& .MuiChip-label": { px: 0.6 },
                "& .MuiChip-icon": { ml: 0.5, mr: -0.3 },
                "& .MuiChip-deleteIcon": { mr: 0.4, ml: -0.2 },
              }}
            />
          )}

          <InputBase
            inputRef={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeModule
                ? `Search in ${activeModule.label}...`
                : `Search anything or type '@' for modules...`
            }
            sx={{
              fontSize: "0.825rem",
              color: "#1F2937",
              width: "100%",
              "& input::placeholder": {
                color: "#9CA3AF",
                opacity: 1,
                fontSize: "0.815rem",
              },
            }}
          />

          {inputValue && (
            <IconButton
              size="small"
              onClick={() => {
                setInputValue("");
                const params = new URLSearchParams(location.search);
                if (params.has("search") || params.has("searchQuery")) {
                  params.delete("search");
                  params.delete("searchQuery");
                  navigate(
                    {
                      pathname: location.pathname,
                      search: params.toString() ? `?${params.toString()}` : "",
                    },
                    { replace: true }
                  );
                }
                inputRef.current?.focus();
              }}
              sx={{ p: 0.2, color: "#9CA3AF", "&:hover": { color: "#4B5563" } }}
            >
              <ClearRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          )}

          {!inputValue && !activeModule && (
            <Box
              sx={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#9CA3AF",
                bgcolor: "#E5E7EB",
                px: 0.6,
                py: 0.2,
                borderRadius: "4px",
                letterSpacing: 0.5,
                flexShrink: 0,
                display: { xs: "none", sm: "block" },
              }}
            >
              @module
            </Box>
          )}
        </Paper>

        {/* Autocomplete Dropdown Popper */}
        <Popper
          open={showPopper}
          anchorEl={containerRef.current}
          placement="bottom-start"
          style={{ width: containerRef.current?.clientWidth || 360, zIndex: 1400 }}
        >
          <Paper
            elevation={6}
            sx={{
              mt: 0.75,
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: "#F8FAFC",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Target Modules
              </Typography>
              <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>
                Press <b style={{ color: "#475569" }}>Tab</b> or <b style={{ color: "#475569" }}>↵</b> to select
              </Typography>
            </Box>

            <List disablePadding sx={{ py: 0.5 }}>
              {suggestions.map((mod, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <ListItemButton
                    key={mod.key}
                    selected={isSelected}
                    onClick={() => handleSelectModule(mod)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      mx: 0.5,
                      my: 0.2,
                      borderRadius: "6px",
                      gap: 1.2,
                      "&.Mui-selected": {
                        bgcolor: mod.chipBg,
                        "&:hover": { bgcolor: mod.chipBg },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: mod.chipColor }}>
                      {getModuleIcon(mod.iconName, mod.chipColor)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Typography sx={{ fontSize: "0.825rem", fontWeight: 700, color: "#0F172A" }}>
                            {mod.label}
                          </Typography>
                          <Typography sx={{ fontSize: "0.725rem", color: "#64748B", bgcolor: "#F1F5F9", px: 0.6, py: 0.1, borderRadius: "4px", fontWeight: 600 }}>
                            @{mod.key}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>
                          {mod.description}
                        </Typography>
                      }
                    />
                    <Box
                      sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: isSelected ? mod.chipColor : "#9CA3AF",
                        bgcolor: isSelected ? "#FFFFFF" : "#F1F5F9",
                        border: `1px solid ${isSelected ? mod.chipBorder : "#E2E8F0"}`,
                        px: 0.7,
                        py: 0.2,
                        borderRadius: "4px",
                      }}
                    >
                      Tab ⇥
                    </Box>
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default React.memo(GlobalSearchBar);
