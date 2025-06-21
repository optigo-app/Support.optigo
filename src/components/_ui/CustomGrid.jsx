import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Box, Table, TableHead, TableRow, TableCell, TableSortLabel, Paper, styled, TextField, IconButton, MenuItem, Menu, Pagination, Select, FormControl, Typography, Container, Popover, Divider, Switch, FormControlLabel, InputAdornment, InputLabel } from "@mui/material";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Search as SearchIcon, FilterList as FilterIcon, ViewColumn as ViewColumnIcon, Download as DownloadIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Clear as ClearIcon } from "@mui/icons-material";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CSVLink } from "react-csv";
import { utils as XLSXUtils, writeFile as writeXLSXFile } from "xlsx";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  height: "100%",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  position: "sticky",
  top: 0,
  zIndex: 2,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(1, 2),
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const ResizeHandle = styled("div")(({ theme }) => ({
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: "8px",
  cursor: "col-resize",
  userSelect: "none",
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    opacity: 0.5,
  },
  "&.resizing": {
    backgroundColor: theme.palette.primary.main,
    opacity: 0.5,
  },
}));

const TableContainer = styled(Box)({
  flex: 1,
  overflow: "hidden",
});

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const GridToolbar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const FilterPopover = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 250,
}));

const ColumnItem = styled(Box)(({ theme, isVisible }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  opacity: isVisible ? 1 : 0.5,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Column drag item type
const ItemTypes = {
  COLUMN: "column",
};

// Draggable column header
const DraggableColumnHeader = ({ column, index, moveColumn, handleSort, sortBy, sortDirection, width, onResizeStart }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.COLUMN,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COLUMN,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <StyledTableCell
      component="div"
      ref={ref}
      key={column.field}
      sortDirection={sortBy === column.field ? sortDirection : false}
      style={{
        width: width,
        flexBasis: width,
        flexShrink: 0,
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {column.sortable !== false ? (
        <TableSortLabel
          active={sortBy === column.field}
          direction={sortBy === column.field ? sortDirection : "asc"}
          onClick={(e) => {
            e.stopPropagation();
            handleSort(column.field);
          }}
          style={{ width: "100%" }}
        >
          {column.headerName || column.field}
        </TableSortLabel>
      ) : (
        column.headerName || column.field
      )}
      <ResizeHandle className={column.resizing ? "resizing" : ""} onMouseDown={(e) => onResizeStart(e, column.field)} />
    </StyledTableCell>
  );
};

// Filter component for each column
const ColumnFilter = ({ column, value, onChange, onApply, onClear }) => {
  const [localValue, setLocalValue] = useState(value || "");

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleApply = () => {
    onChange(column.field, localValue);
    onApply();
  };

  const handleClear = () => {
    setLocalValue("");
    onChange(column.field, "");
    onClear();
  };

  // Different filter inputs based on column types
  const renderFilterInput = () => {
    // Customize based on column type or field
    if (column.type === "number" || column.field === "age") {
      return <TextField fullWidth label="Filter value" type="number" value={localValue} onChange={handleChange} size="small" variant="outlined" />;
    } else if (column.type === "select" || column.field === "status") {
      // Hardcoded options for status, in a real app you would generate this dynamically
      const options = ["Active", "Inactive", "Pending"];
      return (
        <FormControl fullWidth size="small">
          <InputLabel>Select value</InputLabel>
          <Select value={localValue} onChange={handleChange} label="Select value">
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else {
      return <TextField fullWidth label="Filter value" value={localValue} onChange={handleChange} size="small" variant="outlined" />;
    }
  };

  return (
    <FilterPopover>
      <Typography variant="subtitle1" gutterBottom>
        Filter: {column.headerName || column.field}
      </Typography>
      {renderFilterInput()}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Button size="small" onClick={handleClear} startIcon={<ClearIcon />} color="secondary">
          Clear
        </Button>
        <Button size="small" onClick={handleApply} variant="contained" color="primary">
          Apply
        </Button>
      </Box>
    </FilterPopover>
  );
};

// Enhanced DataGrid Component
const EnhancedDataGrid = ({ columns = [], rows = [], defaultSortColumn = null, defaultSortDirection = "asc", rowHeight = 52, headerHeight = 56, pageSize = 10, pageSizeOptions = [5, 10, 25, 50, 100], serverSidePagination = false, onServerPageChange = null, totalRowCount = null, allowFiltering = true, allowGlobalSearch = true, allowPagination = true, allowColumnReordering = true, allowExport = true, loadingRows = false }) => {
  // State for column widths
  const [columnWidths, setColumnWidths] = useState(() => {
    return columns.reduce((acc, column) => {
      acc[column.field] = column.width || 150; // Default width if not specified
      return acc;
    }, {});
  });

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return columns.reduce((acc, column) => {
      acc[column.field] = column.hidden ? false : true;
      return acc;
    }, {});
  });

  // Column order state
  const [columnOrder, setColumnOrder] = useState(() => columns.map((column) => column.field));

  // State for sorting
  const [sortBy, setSortBy] = useState(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);

  // State for filtering
  const [filters, setFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);

  // Global search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Column reordering state
  const [columnsAnchorEl, setColumnsAnchorEl] = useState(null);

  // Export menu state
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // State for resizing
  const [resizingColumn, setResizingColumn] = useState(null);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);

  // Refs
  const tableRef = useRef(null);
  const listRef = useRef(null);

  // Close column visibility menu
  const handleCloseColumnsMenu = () => {
    setColumnsAnchorEl(null);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (field) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle showing/hiding columns menu
  const handleColumnVisibilityClick = (event) => {
    setColumnsAnchorEl(event.currentTarget);
  };

  // Close filter popover
  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
    setActiveFilterColumn(null);
  };

  // Open filter for a specific column
  const handleFilterClick = (event, column) => {
    setFilterAnchorEl(event.currentTarget);
    setActiveFilterColumn(column);
  };

  // Update filter value
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filter and close popover
  const handleApplyFilter = () => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
    setPage(1); // Reset to first page when filtering
    handleCloseFilter();
  };

  // Clear filter for current column
  const handleClearFilter = () => {
    if (activeFilterColumn) {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[activeFilterColumn.field];
        return newFilters;
      });
    }

    if (listRef.current) {
      listRef.current.scrollTo(0);
    }

    setPage(1); // Reset to first page when clearing filter
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilters({});
    setSearchQuery("");

    if (listRef.current) {
      listRef.current.scrollTo(0);
    }

    setPage(1); // Reset to first page when clearing all filters
  };

  // Handle global search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when searching

    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  };

  // Handle page change in pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);

    if (listRef.current) {
      listRef.current.scrollTo(0);
    }

    if (serverSidePagination && onServerPageChange) {
      onServerPageChange({
        page: newPage,
        pageSize: rowsPerPage,
        sortBy,
        sortDirection,
        filters,
      });
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing rows per page

    if (listRef.current) {
      listRef.current.scrollTo(0);
    }

    if (serverSidePagination && onServerPageChange) {
      onServerPageChange({
        page: 1,
        pageSize: Number.parseInt(event.target.value, 10),
        sortBy,
        sortDirection,
        filters,
      });
    }
  };

  // Move column (for reordering)
  const moveColumn = useCallback(
    (dragIndex, hoverIndex) => {
      if (!allowColumnReordering) return;

      setColumnOrder((prevOrder) => {
        const newOrder = [...prevOrder];
        const [draggedItem] = newOrder.splice(dragIndex, 1);
        newOrder.splice(hoverIndex, 0, draggedItem);
        return newOrder;
      });
    },
    [allowColumnReordering]
  );

  // Handle sort request
  const handleSort = (columnField) => {
    const isAsc = sortBy === columnField && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(columnField);

    setPage(1); // Reset to first page when sorting

    // Reset list scroll position when sorting changes
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }

    // For server-side pagination, inform the parent component
    if (serverSidePagination && onServerPageChange) {
      onServerPageChange({
        page: 1,
        pageSize: rowsPerPage,
        sortBy: columnField,
        sortDirection: isAsc ? "desc" : "asc",
        filters,
      });
    }
  };

  // Handle resize start
  const handleResizeStart = (e, columnField) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnField);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnField]);
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  // Handle resize move
  const handleResizeMove = useCallback(
    (e) => {
      if (resizingColumn && startX !== null && startWidth !== null) {
        const diff = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px

        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumn]: newWidth,
        }));
      }
    },
    [resizingColumn, startX, startWidth]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    setStartX(null);
    setStartWidth(null);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Filter rows based on current filters and search query
  const filteredRows = useMemo(() => {
    // Start with all rows
    let result = [...rows];

    // Apply column-specific filters
    if (Object.keys(filters).length > 0) {
      result = result.filter((row) => {
        // Row passes if it matches all active filters
        return Object.entries(filters).every(([field, filterValue]) => {
          if (!filterValue) return true; // Skip empty filters

          const cellValue = row[field];
          if (cellValue === undefined) return false;

          // Handle different value types
          if (typeof cellValue === "string") {
            return cellValue.toLowerCase().includes(filterValue.toLowerCase());
          } else if (typeof cellValue === "number") {
            return cellValue.toString().includes(filterValue);
          }

          return cellValue === filterValue;
        });
      });
    }

    // Apply global search if active
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter((row) => {
        // Search through all visible columns
        return columns.some((column) => {
          if (!visibleColumns[column.field]) return false;

          const value = row[column.field];
          if (value === undefined) return false;

          // Convert value to string and search
          return value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    return result;
  }, [rows, filters, searchQuery, columns, visibleColumns]);

  // Sort the filtered rows based on current sort settings
  const sortedRows = useMemo(() => {
    // Skip sorting for server-side pagination as data comes pre-sorted
    if (serverSidePagination) return filteredRows;

    if (!sortBy) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      // Handle different data types
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredRows, sortBy, sortDirection, serverSidePagination]);

  // Apply pagination to rows
  const paginatedRows = useMemo(() => {
    // Skip client-side pagination for server-side implementation
    if (serverSidePagination) return sortedRows;

    if (!allowPagination) return sortedRows;

    const startIndex = (page - 1) * rowsPerPage;
    return sortedRows.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRows, page, rowsPerPage, allowPagination, serverSidePagination]);

  // Calculate total pages for pagination
  const totalPages = useMemo(() => {
    if (serverSidePagination && totalRowCount !== null) {
      return Math.ceil(totalRowCount / rowsPerPage);
    }

    return Math.ceil(sortedRows.length / rowsPerPage);
  }, [sortedRows.length, rowsPerPage, serverSidePagination, totalRowCount]);

  // Ordered and filtered columns for display
  const displayColumns = useMemo(() => {
    // Combine all columns
    const allColumns = [...columns];

    // Filter out hidden columns and order them according to columnOrder
    return (
      columnOrder
        // Filter to only include existing columns and add any new columns not yet in the order
        .filter((field) => allColumns.some((col) => col.field === field))
        .map((field) => allColumns.find((col) => col.field === field))
        // Add any columns that might not be in columnOrder yet (like dynamically added columns)
        .concat(allColumns.filter((col) => !columnOrder.includes(col.field)))
        // Filter hidden columns
        .filter((column) => visibleColumns[column.field] !== false)
    );
  }, [columns, columnOrder, visibleColumns]);

  // Row renderer for virtualized list
  const RowRenderer = useCallback(
    ({ index, style }) => {
      const row = paginatedRows[index];
      if (!row) return null; // Handle potential empty rows

      return (
        <TableRow
          component="div"
          style={{
            ...style,
            display: "flex",
            width: "fit-content",
            alignItems: "center",
            boxSizing: "border-box",
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
          hover
        >
          {displayColumns.map((column) => {
            // Regular data cells
            return (
              <TableCell
                component="div"
                key={column.field}
                style={{
                  width: columnWidths[column.field],
                  flexBasis: columnWidths[column.field],
                  flexShrink: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                  height: rowHeight,
                }}
              >
                {column.renderCell ? column.renderCell({ value: row[column.field], row }) : row[column.field]}
              </TableCell>
            );
          })}
        </TableRow>
      );
    },
    [paginatedRows, displayColumns, columnWidths, rowHeight]
  );

  // Add keyboard navigation handler
  const handleKeyDown = useCallback(
    (e) => {
      // Handle keyboard navigation for accessible controls
      if (e.key === "ArrowDown" && listRef.current) {
        // Move to next row
        const visibleRowCount = Math.floor(listRef.current.props.height / rowHeight);
        const currentIndex = listRef.current.state.scrollOffset / rowHeight;
        listRef.current.scrollTo((currentIndex + 1) * rowHeight);
      } else if (e.key === "ArrowUp" && listRef.current) {
        // Move to previous row
        const currentIndex = listRef.current.state.scrollOffset / rowHeight;
        listRef.current.scrollTo(Math.max(0, (currentIndex - 1) * rowHeight));
      }
    },
    [rowHeight]
  );

  useEffect(() => {
    // Set up keyboard listener
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Check if there are active filters
  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredRows.map((row) => {
      const rowData = {};

      // Only include visible columns in exported data
      columns.forEach((column) => {
        if (visibleColumns[column.field]) {
          rowData[column.headerName || column.field] = row[column.field];
        }
      });

      return rowData;
    });

    const worksheet = XLSXUtils.json_to_sheet(exportData);
    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, "Data");
    writeXLSXFile(workbook, "data_export.xlsx");

    handleExportClose();
  };

  // Handle export menu open
  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  // Close export menu
  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  // Prepare CSV data
  const prepareCSVData = useMemo(() => {
    const headers = columns
      .filter((column) => visibleColumns[column.field])
      .map((column) => ({
        label: column.headerName || column.field,
        key: column.field,
      }));

    const data = filteredRows.map((row) => {
      const rowData = {};
      columns.forEach((column) => {
        if (visibleColumns[column.field]) {
          rowData[column.field] = row[column.field];
        }
      });
      return rowData;
    });

    return { headers, data };
  }, [columns, visibleColumns, filteredRows]);

  return (
    <DndProvider backend={HTML5Backend}>
      <StyledPaper elevation={2} tabIndex={0}>
        {/* Toolbar */}
        <ToolbarContainer>
          <GridToolbar>
            {allowGlobalSearch && (
              <TextField
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery("")} edge="end">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            )}

            {hasActiveFilters && (
              <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={handleClearAllFilters}>
                Clear Filters
              </Button>
            )}

            <IconButton size="small" onClick={handleColumnVisibilityClick}>
              <ViewColumnIcon />
            </IconButton>

            {allowExport && (
              <IconButton size="small" onClick={handleExportClick}>
                <DownloadIcon />
              </IconButton>
            )}
          </GridToolbar>
        </ToolbarContainer>

        {/* Column visibility menu */}
        <Menu anchorEl={columnsAnchorEl} open={Boolean(columnsAnchorEl)} onClose={handleCloseColumnsMenu}>
          <Box sx={{ width: 250, maxHeight: 400, overflow: "auto", p: 1 }}>
            <Typography variant="subtitle1" sx={{ p: 1 }}>
              Column Visibility
            </Typography>
            <Divider />
            {columns.map((column) => (
              <ColumnItem key={column.field} isVisible={visibleColumns[column.field]} onClick={() => toggleColumnVisibility(column.field)}>
                <Typography variant="body2">{column.headerName || column.field}</Typography>
                <IconButton size="small">{visibleColumns[column.field] ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}</IconButton>
              </ColumnItem>
            ))}
          </Box>
        </Menu>

        {/* Export menu */}
        <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportClose}>
          <MenuItem onClick={handleExportExcel}>Export to Excel</MenuItem>
          <CSVLink data={prepareCSVData.data} headers={prepareCSVData.headers} filename="data_export.csv" style={{ textDecoration: "none", color: "inherit" }}>
            <MenuItem onClick={handleExportClose}>Export to CSV</MenuItem>
          </CSVLink>
        </Menu>

        {/* Column filter popover */}
        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={handleCloseFilter}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          {activeFilterColumn && <ColumnFilter column={activeFilterColumn} value={filters[activeFilterColumn.field] || ""} onChange={handleFilterChange} onApply={handleApplyFilter} onClear={handleClearFilter} />}
        </Popover>

        {/* Table Header */}
        <Box style={{ overflowX: "auto" }}>
          <Table component="div" style={{ width: "fit-content", tableLayout: "fixed" }}>
            <StyledTableHead component="div">
              <TableRow
                component="div"
                style={{
                  display: "flex",
                  width: "fit-content",
                  height: headerHeight,
                }}
              >
                {displayColumns.map((column, index) => {
                  // Regular columns with drag and drop
                  return allowColumnReordering ? (
                    <DraggableColumnHeader key={column.field} column={column} index={index} moveColumn={moveColumn} handleSort={handleSort} sortBy={sortBy} sortDirection={sortDirection} width={columnWidths[column.field]} onResizeStart={handleResizeStart}>
                      {allowFiltering && column.filterable !== false && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, column)}
                          style={{
                            marginLeft: 4,
                            color: filters[column.field] ? "primary.main" : "inherit",
                          }}
                        >
                          <FilterIcon fontSize="small" />
                        </IconButton>
                      )}
                    </DraggableColumnHeader>
                  ) : (
                    <StyledTableCell
                      component="div"
                      key={column.field}
                      sortDirection={sortBy === column.field ? sortDirection : false}
                      style={{
                        width: columnWidths[column.field],
                        flexBasis: columnWidths[column.field],
                        flexShrink: 0,
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {column.sortable !== false ? (
                        <TableSortLabel active={sortBy === column.field} direction={sortBy === column.field ? sortDirection : "asc"} onClick={() => handleSort(column.field)} style={{ width: "100%" }}>
                          {column.headerName || column.field}
                        </TableSortLabel>
                      ) : (
                        column.headerName || column.field
                      )}

                      {allowFiltering && column.filterable !== false && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, column)}
                          style={{
                            marginLeft: 4,
                            color: filters[column.field] ? "primary.main" : "inherit",
                          }}
                        >
                          <FilterIcon fontSize="small" />
                        </IconButton>
                      )}

                      <ResizeHandle className={resizingColumn === column.field ? "resizing" : ""} onMouseDown={(e) => handleResizeStart(e, column.field)} />
                    </StyledTableCell>
                  );
                })}
              </TableRow>
            </StyledTableHead>
          </Table>
        </Box>

        {/* Table Body with Virtualization */}
        <TableContainer ref={tableRef}>
          {loadingRows ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Typography>Loading data...</Typography>
            </Box>
          ) : paginatedRows.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Typography>No rows to display</Typography>
            </Box>
          ) : (
            <AutoSizer>
              {({ height, width }) => (
                <List ref={listRef} height={height} width={width} itemCount={paginatedRows.length} itemSize={rowHeight} overscanCount={5}>
                  {RowRenderer}
                </List>
              )}
            </AutoSizer>
          )}
        </TableContainer>

        {/* Pagination */}
        {allowPagination && (
          <PaginationContainer>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2" color="textSecondary" mr={2}>
                Rows per page:
              </Typography>
              <FormControl size="small" variant="standard">
                <Select value={rowsPerPage} onChange={handleRowsPerPageChange} disableUnderline>
                  {pageSizeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="textSecondary" ml={2}>
                {serverSidePagination && totalRowCount !== null ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalRowCount)} of ${totalRowCount}` : `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, sortedRows.length)} of ${sortedRows.length}`}
              </Typography>
            </Box>

            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" showFirstButton showLastButton size="small" shape="rounded" />
          </PaginationContainer>
        )}
      </StyledPaper>
    </DndProvider>
  );
};

// Missing Button component
const Button = styled("button")(({ theme, variant = "contained", color = "primary", size = "medium" }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  boxSizing: "border-box",
  WebkitTapHighlightColor: "transparent",
  backgroundColor: variant === "contained" ? (color === "primary" ? "#1976d2" : color === "secondary" ? "#9c27b0" : "transparent") : "transparent",
  border: variant === "outlined" ? `1px solid ${color === "primary" ? "#1976d2" : "#9c27b0"}` : "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 500,
  fontSize: size === "small" ? "0.8125rem" : "0.875rem",
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  textTransform: "uppercase",
  minWidth: 64,
  padding: size === "small" ? "4px 10px" : "6px 16px",
  color: variant === "contained" ? "white" : color === "primary" ? "#1976d2" : "#9c27b0",
  transition: "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
  "&:hover": {
    backgroundColor: variant === "contained" ? (color === "primary" ? "#1565c0" : color === "secondary" ? "#7b1fa2" : "rgba(0, 0, 0, 0.04)") : "rgba(25, 118, 210, 0.04)",
    textDecoration: "none",
  },
  "&:disabled": {
    color: "rgba(0, 0, 0, 0.26)",
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    cursor: "default",
  },
}));

// Sample usage component
const DataGridDemo = () => {
  // State for server-side data
  const [serverData, setServerData] = useState({
    rows: [],
    totalRowCount: 0,
    loading: true,
  });

  // State for client-side data
  const [clientSideRows, setClientSideRows] = useState([]);

  // Generate sample data
  const generateRows = useCallback((count) => {
    const roles = ["Admin", "Editor", "Viewer"];
    const accessLevels = ["Full Access", "Limited Access", "Read Only"];
    const accountTypes = ["Personal", "Business", "Admin"];
    const permissionSets = [
      ["User Management", "Content Management", "Analytics"],
      ["Content Management", "Analytics"],
      ["Analytics"],
    ];
  
    const rows = [];
    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const accessLevel = accessLevels[Math.floor(Math.random() * accessLevels.length)];
      const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      const permissions = permissionSets[Math.floor(Math.random() * permissionSets.length)];
  
      rows.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: Math.floor(Math.random() * 50) + 18,
        status: ["Active", "Inactive", "Pending"][Math.floor(Math.random() * 3)],
        lastLogin: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
        role,
        accessLevel,
        accountType,
        permissions,
        loginCount: Math.floor(Math.random() * 100),
        lastActive: `${Math.floor(Math.random() * 30)} days ago`,
      });
    }
    return rows;
  }, []);

  // Column definitions
  const columns = [
    {
      field: "id",
      headerName: "ID",
    },
    {
      field: "name",
      headerName: "Name",
    },
    {
      field: "email",
      headerName: "Email",
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      renderCell: ({ value }) => (
        <span style={{ fontWeight: value > 40 ? "bold" : "normal" }}>{value}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      type: "select",
      renderCell: ({ value }) => {
        let color;
        switch (value) {
          case "Active":
            color = "green";
            break;
          case "Inactive":
            color = "red";
            break;
          default:
            color = "orange";
        }
  
        return (
          <span
            style={{
              color: "white",
              backgroundColor: color,
              padding: "3px 8px",
              borderRadius: "4px",
              fontSize: "0.75rem",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      field: "role",
      headerName: "Role",
      width: 130,
      renderCell: ({ value }) => (
        <span style={{ fontStyle: value === "Admin" ? "italic" : "normal" }}>{value}</span>
      ),
    },
    {
      field: "accessLevel",
      headerName: "Access Level",
      width: 150,
    },
    {
      field: "accountType",
      headerName: "Account Type",
      width: 130,
      renderCell: ({ value }) => (
        <span style={{ fontWeight: value === "Admin" ? "bold" : "normal" }}>{value}</span>
      ),
    },
    {
      field: "permissions",
      headerName: "Permissions",
      width: 250,
      renderCell: ({ value }) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {value.map((perm, index) => (
            <span
              key={index}
              style={{
                background: "#e0e0e0",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.7rem",
              }}
            >
              {perm}
            </span>
          ))}
        </div>
      ),
    },
    {
      field: "loginCount",
      headerName: "Login Count",
      type: "number",
      width: 120,
    },
    {
      field: "lastActive",
      headerName: "Last Active",
      width: 130,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: '300',
      renderCell: () => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={{ padding: "4px 8px", fontSize: "0.75rem" }}>Edit</button>
          <button style={{ padding: "4px 8px", fontSize: "0.75rem" }}>Delete</button>
          <button style={{ padding: "4px 8px", fontSize: "0.75rem" }}>View</button>
        </div>
      ),
    },
  ];

  // Initialize data
  useEffect(() => {
    // Generate client-side data
    setClientSideRows(generateRows(100000));

    // Simulate server data load
    setTimeout(() => {
      setServerData({
        rows: generateRows(100),
        totalRowCount: 10000,
        loading: false,
      });
    }, 1000);
  }, [generateRows]);

  // Handle server-side pagination
  const handleServerPageChange = (params) => {
    console.log("Server page change:", params);

    // Simulate server request
    setServerData((prev) => ({
      ...prev,
      loading: true,
    }));

    // Simulate API delay
    setTimeout(() => {
      // In a real app, this would be an API call with params
      const newRows = generateRows(params.pageSize).map((row) => ({
        ...row,
        id: (params.page - 1) * params.pageSize + row.id,
      }));

      setServerData({
        rows: newRows,
        totalRowCount: 10000, // Total count from server
        loading: false,
      });
    }, 500);
  };

  const [demoType, setDemoType] = useState("client");

  return (
    <Container maxWidth="lg" style={{ height: "100vh", padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Data Grid
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel control={<Switch checked={demoType === "server"} onChange={(e) => setDemoType(e.target.checked ? "server" : "client")} />} label="Server-side pagination demo" />
      </Box>

      {demoType === "client" ? (
        <Box sx={{ height: "calc(100vh - 180px)", width: "100%" }}>
          <EnhancedDataGrid columns={columns} rows={clientSideRows} defaultSortColumn="id" defaultSortDirection="asc" pageSize={1000} pageSizeOptions={[10, 25, 50, 100, 1000 , 10000 , 1000000]} />
        </Box>
      ) : (
        <Box sx={{ height: "calc(100vh - 180px)", width: "100%" }}>
          <EnhancedDataGrid columns={columns} rows={serverData.rows} defaultSortColumn="id" defaultSortDirection="asc" pageSize={1000} pageSizeOptions={[10, 25, 50, 100, 1000 , 10000 , 1000000]} serverSidePagination={true} onServerPageChange={handleServerPageChange} totalRowCount={serverData.totalRowCount} loadingRows={serverData.loading} />
        </Box>
      )}
    </Container>
  );
};

export default DataGridDemo;

// import React, { useState, useRef, useCallback, useEffect } from "react";
// import { Box, Table, TableHead, TableRow, TableCell, TableSortLabel, Paper, styled } from "@mui/material";
// import { FixedSizeList as List } from "react-window";
// import AutoSizer from "react-virtualized-auto-sizer";
// import { Typography, Container } from "@mui/material";

// // Styled components
// const StyledPaper = styled(Paper)(({ theme }) => ({
//   width: "100%",
//   height: "100%",
//   overflow: "hidden",
//   display: "flex",
//   flexDirection: "column",
// }));

// const StyledTableHead = styled(TableHead)(({ theme }) => ({
//   backgroundColor: theme.palette.background.paper,
//   position: "sticky",
//   top: 0,
//   zIndex: 2,
// }));

// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   position: "relative",
//   padding: theme.spacing(1, 2),
//   whiteSpace: "nowrap",
//   overflow: "hidden",
//   textOverflow: "ellipsis",
// }));

// const ResizeHandle = styled("div")(({ theme }) => ({
//   position: "absolute",
//   right: 0,
//   top: 0,
//   bottom: 0,
//   width: "8px",
//   cursor: "col-resize",
//   userSelect: "none",
//   "&:hover": {
//     backgroundColor: theme.palette.primary.light,
//     opacity: 0.5,
//   },
//   "&.resizing": {
//     backgroundColor: theme.palette.primary.main,
//     opacity: 0.5,
//   },
// }));

// const TableContainer = styled(Box)({
//   flex: 1,
//   overflow: "hidden",
// });

// const CustomDataGrid = ({ columns = [], rows = [], defaultSortColumn = null, defaultSortDirection = "asc", rowHeight = 52, headerHeight = 56 }) => {
//   // State for column widths
//   const [columnWidths, setColumnWidths] = useState(() => {
//     return columns.reduce((acc, column) => {
//       acc[column.field] = column.width || 150; // Default width if not specified
//       return acc;
//     }, {});
//   });

//   // State for sorting
//   const [sortBy, setSortBy] = useState(defaultSortColumn);
//   const [sortDirection, setSortDirection] = useState(defaultSortDirection);

//   // State for resizing
//   const [resizingColumn, setResizingColumn] = useState(null);
//   const [startX, setStartX] = useState(null);
//   const [startWidth, setStartWidth] = useState(null);

//   // Refs
//   const tableRef = useRef(null);
//   const listRef = useRef(null);

//   // Sort the rows based on current sort settings
//   const sortedRows = React.useMemo(() => {
//     if (!sortBy) return rows;

//     return [...rows].sort((a, b) => {
//       const valueA = a[sortBy];
//       const valueB = b[sortBy];

//       // Handle different data types
//       if (typeof valueA === "string" && typeof valueB === "string") {
//         return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
//       }

//       if (sortDirection === "asc") {
//         return valueA > valueB ? 1 : -1;
//       } else {
//         return valueA < valueB ? 1 : -1;
//       }
//     });
//   }, [rows, sortBy, sortDirection]);

//   // Handle sort request
//   const handleSort = (columnField) => {
//     const isAsc = sortBy === columnField && sortDirection === "asc";
//     setSortDirection(isAsc ? "desc" : "asc");
//     setSortBy(columnField);

//     // Reset list scroll position when sorting changes
//     if (listRef.current) {
//       listRef.current.scrollTo(0);
//     }
//   };

//   // Handle resize start
//   const handleResizeStart = (e, columnField) => {
//     e.preventDefault();
//     e.stopPropagation(); // Add this
//     setResizingColumn(columnField);
//     setStartX(e.clientX);
//     setStartWidth(columnWidths[columnField]);
//     document.addEventListener("mousemove", handleResizeMove);
//     document.addEventListener("mouseup", handleResizeEnd);
//   };

//   // Handle resize move
//   const handleResizeMove = useCallback(
//     (e) => {
//       if (resizingColumn && startX !== null && startWidth !== null) {
//         const diff = e.clientX - startX;
//         const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px

//         setColumnWidths((prev) => ({
//           ...prev,
//           [resizingColumn]: newWidth,
//         }));
//       }
//     },
//     [resizingColumn, startX, startWidth]
//   );

//   // Handle resize end
//   const handleResizeEnd = useCallback(() => {
//     setResizingColumn(null);
//     setStartX(null);
//     setStartWidth(null);
//     document.removeEventListener("mousemove", handleResizeMove);
//     document.removeEventListener("mouseup", handleResizeEnd);
//   }, [handleResizeMove]);

//   // Clean up event listeners
//   useEffect(() => {
//     return () => {
//       document.removeEventListener("mousemove", handleResizeMove);
//       document.removeEventListener("mouseup", handleResizeEnd);
//     };
//   }, [handleResizeMove, handleResizeEnd]);

//   // Row renderer for virtualized list
//   const RowRenderer = useCallback(
//     ({ index, style }) => {
//       const row = sortedRows[index];

//       return (
//         <TableRow
//           component="div"
//           style={{
//             ...style,
//             display: "flex",
//             width: "fit-content", // Add this to avoid stretching
//             alignItems: "center",
//             boxSizing: "border-box",
//             borderBottom: "1px solid rgba(224, 224, 224, 1)",
//           }}
//         >
//           {columns.map((column) => (
//             <TableCell
//             component="div"
//             key={column.field}
//             style={{
//               width: columnWidths[column.field],
//               flexBasis: columnWidths[column.field], // <== ADD THIS
//               flexShrink: 0,
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//               display: "flex",
//               alignItems: "center",
//               boxSizing: "border-box",
//               height: rowHeight,
//             }}
//           >

//               {column.renderCell ? column.renderCell({ value: row[column.field], row }) : row[column.field]}
//             </TableCell>
//           ))}
//         </TableRow>
//       );
//     },
//     [columns, sortedRows, columnWidths, rowHeight]
//   );

//   return (
//     <StyledPaper elevation={2}>
//       {/* Table Header */}
//       <Box style={{  overflowX: "auto"  }}>
//         <Table component="div" style={{ width: "fit-content", tableLayout: "fixed" }}>
//           <StyledTableHead component="div">
//             <TableRow
//               component="div"
//               style={{
//                 display: "flex",
//                 width: "fit-content",
//                 height: headerHeight,
//               }}
//             >
//               {columns.map((column) => (
//                 <StyledTableCell
//                   component="div"
//                   key={column.field}
//                   sortDirection={sortBy === column.field ? sortDirection : false}
//                   style={{
//                     width: columnWidths[column.field],
//                     flexBasis: columnWidths[column.field],
//                     flexShrink: 0,
//                     fontWeight: "bold",
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   {column.sortable !== false ? (
//                     <TableSortLabel active={sortBy === column.field} direction={sortBy === column.field ? sortDirection : "asc"} onClick={() => handleSort(column.field)} style={{ width: "100%" }}>
//                       {column.headerName || column.field}
//                     </TableSortLabel>
//                   ) : (
//                     column.headerName || column.field
//                   )}

//                   <ResizeHandle className={resizingColumn === column.field ? "resizing" : ""} onMouseDown={(e) => handleResizeStart(e, column.field)} />
//                 </StyledTableCell>
//               ))}
//             </TableRow>
//           </StyledTableHead>
//         </Table>
//       </Box>

//       {/* Table Body with Virtualization */}
//       <TableContainer ref={tableRef}>
//         <AutoSizer>
//           {({ height, width }) => (
//             <List ref={listRef} height={height} width={width} itemCount={sortedRows.length} itemSize={rowHeight} overscanCount={5}>
//               {RowRenderer}
//             </List>
//           )}
//         </AutoSizer>
//       </TableContainer>
//     </StyledPaper>
//   );
// };

// // Generate sample data
// const generateRows = (count) => {
//   const rows = [];
//   for (let i = 0; i < count; i++) {
//     rows.push({
//       id: i,
//       name: `User ${i}`,
//       email: `user${i}@example.com`,
//       age: Math.floor(Math.random() * 50) + 18,
//       status: ["Active", "Inactive", "Pending"][Math.floor(Math.random() * 3)],
//       lastLogin: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
//     });
//   }
//   return rows;
// };

// // Column definitions
// const columns = [
//   {
//     field: "id",
//     headerName: "ID",
//     width: 70,
//   },
//   {
//     field: "name",
//     headerName: "Name",
//     width: 150,
//   },
//   {
//     field: "email",
//     headerName: "Email",
//     width: 220,
//   },
//   {
//     field: "age",
//     headerName: "Age",
//     width: 80,
//     // Example of custom cell renderer
//     renderCell: ({ value }) => <span style={{ fontWeight: value > 40 ? "bold" : "normal" }}>{value}</span>,
//   },
//   {
//     field: "status",
//     headerName: "Status",
//     width: 120,
//     // Example of custom cell renderer with styling
//     renderCell: ({ value }) => {
//       let color;
//       switch (value) {
//         case "Active":
//           color = "green";
//           break;
//         case "Inactive":
//           color = "red";
//           break;
//         default:
//           color = "orange";
//       }

//       return (
//         <span
//           style={{
//             color: "white",
//             backgroundColor: color,
//             padding: "3px 8px",
//             borderRadius: "4px",
//             fontSize: "0.75rem",
//           }}
//         >
//           {value}
//         </span>
//       );
//     },
//   },
//   {
//     field: "lastLogin",
//     headerName: "Last Login",
//     width: 150,
//   },
// ];

// export default function DataGridDemo() {
//   // Generate 10,000 rows for demonstration
//   const rows = generateRows(10000);

//   return (
//     <Container maxWidth="lg" style={{ height: "100vh", padding: "20px" }}>
//       <Typography variant="h4" gutterBottom>
//         Custom MUI DataGrid
//       </Typography>
//       <Typography variant="body2" color="textSecondary" paragraph>
//         Features: Column resizing, sorting, virtualization, and auto height
//       </Typography>

//       <Box sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
//         <CustomDataGrid columns={columns} rows={rows} defaultSortColumn="id" defaultSortDirection="asc" />
//       </Box>
//     </Container>
//   );
// }
