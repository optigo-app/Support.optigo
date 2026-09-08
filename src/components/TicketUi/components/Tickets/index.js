import React from "react";
import { Box, Typography, Divider, List, IconButton, Badge, Tooltip, Skeleton, Stack } from "@mui/material";
import TicketItem from "./TicketItem";
import { useState } from "react";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import { useUrlFilters } from "../../../../hooks/useFilters";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExcelReportDowload from "../../../../utils/ExcelReportDowload";
import SearchBar from "./SearchBar";
import FilterPopOver from "./FilterPopOver";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { motion, useAnimation } from "framer-motion";
import { useTicket } from "../../../../context/useTicket";
import { ticketFilterAnchorEl$, openTicketFilter, closeTicketFilter, useSubject } from "../../../../rxjs/layoutStore";

const FilterIconButton = React.memo(({ filterCount }) => {
  const anchorEl = useSubject(ticketFilterAnchorEl$);
  const isOpen = Boolean(anchorEl);

  const handleClick = (event) => {
    if (isOpen) {
      closeTicketFilter();
    } else {
      openTicketFilter(event.currentTarget);
    }
  };

  return (
    <IconButton onClick={handleClick} size="small" sx={{ ml: 1 }}>
      <Badge badgeContent={filterCount} color="primary">
        {isOpen ? (
          <FilterAltOffRoundedIcon fontSize="medium" sx={{ color: "#8B07A7" }} />
        ) : (
          <FilterAltRoundedIcon fontSize="medium" sx={{ color: "#8B07A7" }} />
        )}
      </Badge>
    </IconButton>
  );
});

/**
 * Isolated component: owns useUrlFilters so TicketList itself never re-renders from URL filter changes.
 * Only this small header re-renders on filter/search updates.
 */
const TicketListHeader = React.memo(({ filterTicketCount, onDownloadExcel }) => {
  const { filterCount, clearFilters, hasFilters } = useUrlFilters();
  const controls = useAnimation();
  const [isRotating, setIsRotating] = useState(false);
  const { setRefresh } = useTicket();

  const handleClickRotate = async () => {
    if (!isRotating) {
      setIsRotating(true);
      await controls.start({
        rotate: 360,
        transition: { duration: 0.6, ease: "easeInOut" },
      });
      controls.set({ rotate: 0 });
      setIsRotating(false);
      setRefresh((prev) => !prev);
    }
  };

  return (
    <Box
      sx={{
        p: 1.5,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #DFE1E6",
        justifyContent: "space-between",
        gap: 0.1,
      }}
    >
      <SearchBar filterTicketCount={filterTicketCount} />
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <FilterIconButton filterCount={filterCount} />
        {hasFilters && (
          <IconButton size="small" onClick={clearFilters} sx={{ ml: 0.5 }}>
            <Tooltip title="Clear Filters" placement="top">
              <FilterAltOffRoundedIcon fontSize="medium" sx={{ color: "#d32f2f" }} />
            </Tooltip>
          </IconButton>
        )}
        <IconButton size="small" onClick={handleClickRotate} sx={{ ml: 0.5 }}>
          <Tooltip title="Refresh" placement="top">
            <motion.div animate={controls} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RefreshRoundedIcon fontSize="medium" sx={{ color: "#8B07A7" }} />
            </motion.div>
          </Tooltip>
        </IconButton>
      </Box>
    </Box>
  );
});

const TicketList = ({ tickets, selectedTicket, onTicketSelect }) => {
  const { isInitialLoading } = useTicket();
  const filterTicketCount = tickets.length;
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
      {/* Header owns useUrlFilters state \u2014 isolated so TicketList body doesn't re-render on filter/search changes */}
      <TicketListHeader filterTicketCount={filterTicketCount} onDownloadExcel={HandleDownloadExcel} />
      <List
        sx={{
          p: 0,
          overflow: "auto",
          flexGrow: 1,
        }}
      >
        {isInitialLoading ? (
          <TicketListSkeleton />
        ) : tickets?.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              color: "text.secondary",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              No Tickets Found
            </Typography>
            <Typography variant="body2">Try adjusting your filters or check back later.</Typography>
          </Box>
        ) : (
          tickets?.map((ticket, idx) => (
            <React.Fragment key={ticket?.TicketNo || ticket?.id || idx}>
              <TicketItem ticket={ticket} selectedTicket={selectedTicket} onTicketSelect={onTicketSelect} />
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
      <FilterPopOver HandleDownloadExcel={HandleDownloadExcel} />
    </Box>
  );
};

export default React.memo(TicketList);

const TicketListSkeleton = () => (
  <Stack spacing={1} sx={{ p: 1 }}>
    {[...Array(8)].map((_, i) => (
      <Box key={i}>
        <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 4 }} />
      </Box>
    ))}
  </Stack>
);
