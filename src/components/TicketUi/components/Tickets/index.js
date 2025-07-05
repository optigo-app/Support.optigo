import React from "react";
import { Box, Typography, Divider, List, IconButton, Badge } from "@mui/material";
import TicketItem from "./TicketItem";
import { useState } from "react";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import { useUrlFilters } from "../../../../hooks/useFilters";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExcelReportDowload from "../../../../utils/ExcelReportDowload";
import SearchBar from "./SearchBar";
import FilterPopOver from "./FilterPopOver";

const TicketList = ({ tickets, selectedTicket, onTicketSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const { filterCount } = useUrlFilters();

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setIsFilterActive(false);
  };

  const HandleDownloadExcel = () => {
    ExcelReportDowload(tickets);
  };

  return (
    <Box
      sx={{
        width: "31%",
        borderRight: "1px solid #DFE1E6",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        flexGrow: 1,
        minWidth: "480px",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #DFE1E6",
          justifyContent: "space-between",
        }}
      >
        <SearchBar />
        <IconButton
          onClick={(event) => {
            handleClick(event);
            setIsFilterActive((prev) => !prev);
          }}
          size="small"
          sx={{ ml: 1 }}
        >
          <Badge badgeContent={filterCount} color="primary">
            {isFilterActive ? <FilterAltOffRoundedIcon fontSize="medium" sx={{ color: "#8B07A7" }} /> : <FilterAltRoundedIcon fontSize="medium" sx={{ color: "#8B07A7" }} />}
          </Badge>
        </IconButton>
      </Box>
      <List
        sx={{
          p: 0,
          overflow: "auto",
          flexGrow: 1,
        }}
      >
        {tickets?.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 3, color: "text.secondary", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <InfoOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              No Tickets Found
            </Typography>
            <Typography variant="body2">Try adjusting your filters or check back later.</Typography>
          </Box>
        ) : (
          tickets?.map((ticket, idx) => (
            <React.Fragment key={idx || ticket?.TicketNo}>
              <TicketItem ticket={ticket} selectedTicket={selectedTicket} onTicketSelect={onTicketSelect} />
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
      <FilterPopOver anchorEl={anchorEl} handleClose={handleClose} open={open} HandleDownloadExcel={HandleDownloadExcel} />
    </Box>
  );
};

export default TicketList;
