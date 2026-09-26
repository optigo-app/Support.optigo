import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, IconButton, Badge, Tooltip, Skeleton, Stack } from "@mui/material";
import TicketItem from "./TicketItem";
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
import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

// ─── VirtualRow — self-measuring ──────────────────────────────────────────────
/**
 * Deterministic height calculation for any ticket card.
 * Computes exact height synchronously based on content, eliminating the
 * post-render DOM measurement glitch and layout shifts in react-window.
 */
export const calculateTicketRowHeight = (ticket) => {
  if (!ticket) return 105;

  // Base padding (16px top + 16px bottom = 32px) + borderBottom (1px)
  let h = 33;

  // Row 1: MainSubject / subject (clamped to 1 line, ~20px)
  h += 20;

  // Row 2: Star + TicketNo + Company + Priority + Comment + Call (~24px)
  h += 24;

  // Row 3: Status / Order chips (mt: 4px + chip: 22px = 26px)
  if (ticket.Status || ticket.OrderId) {
    h += 26;
  }

  // Row 4: Instruction (optional)
  const instruction = ticket.instruction ? String(ticket.instruction).trim() : "";
  if (instruction) {
    // Ticket list width is ~480px. Usable content width is ~420px.
    // In 13px font, ~48 characters fits on 1 line.
    // If > 48 characters or contains newlines, clamped to 2 lines.
    if (instruction.length > 48 || instruction.includes("\n")) {
      h += 40; // 2 lines: 4px mt + 36px (2 lines * 18px)
    } else {
      h += 22; // 1 line: 4px mt + 18px (1 line)
    }
  }

  return h;
};

const VirtualRow = React.memo(({ index, style, data }) => {
  const { tickets, onTicketSelect } = data;
  const ticket = tickets[index];

  if (!ticket) return null;

  return (
    <div
      style={{
        ...style,
        borderBottom: "1px solid #DFE1E6",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <TicketItem ticketNo={ticket?.TicketNo} onTicketSelect={onTicketSelect} />
    </div>
  );
});

// ─── FilterIconButton ──────────────────────────────────────────────────────────
const FilterIconButton = React.memo(({ filterCount }) => {
  const anchorEl = useSubject(ticketFilterAnchorEl$);
  const isOpen = Boolean(anchorEl);

  const handleClick = (event) => {
    if (isOpen) closeTicketFilter();
    else openTicketFilter(event.currentTarget);
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

// ─── TicketListHeader ─────────────────────────────────────────────────────────
const TicketListHeader = React.memo(({ filterTicketCount, onDownloadExcel }) => {
  const { filterCount, clearFilters, hasFilters } = useUrlFilters();
  const controls = useAnimation();

  const handleClickRotate = () => {
    controls.start({
      rotate: 360,
      transition: { duration: 0.6, ease: "easeInOut" },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: 60,
        px: 2,
        alignItems: "center",
        borderBottom: "1px solid #DFE1E6",
        justifyContent: "space-between",
        gap: 0.1,
        flexShrink: 0,
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

// ─── TicketList ───────────────────────────────────────────────────────────────
const TicketList = ({ tickets, onTicketSelect, scrollKey }) => {
  const { isInitialLoading } = useTicket();
  const filterTicketCount = tickets.length;

  // VariableSizeList instance ref
  const listRef = useRef(null);

  // Synchronous, deterministic height calculation for every ticket
  const getItemSize = useCallback(
    (index) => {
      const ticket = tickets[index];
      return calculateTicketRowHeight(ticket);
    },
    [tickets],
  );

  // ─── Intentional Navigation (tab or filter switch) ──────────────────────────
  // scrollKey changes → scroll to top cleanly and recalculate positions
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
      listRef.current.scrollTo(0);
    }
  }, [scrollKey]);

  // ─── Item count change (new ticket added or removed) ────────────────────────
  // If count changes on same tab, update react-window offsets without jumping scroll
  const prevCountRef = useRef(tickets.length);
  useEffect(() => {
    if (prevCountRef.current !== tickets.length) {
      prevCountRef.current = tickets.length;
      if (listRef.current) {
        listRef.current.resetAfterIndex(0, false);
      }
    }
  }, [tickets.length]);

  const HandleDownloadExcel = useCallback(() => {
    ExcelReportDowload(tickets);
  }, [tickets]);

  // itemData is stable unless tickets/callbacks change
  const itemData = useMemo(
    () => ({ tickets, onTicketSelect }),
    [tickets, onTicketSelect],
  );

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
      <TicketListHeader filterTicketCount={filterTicketCount} onDownloadExcel={HandleDownloadExcel} />

      {/* flex:1 + minHeight:0 → lets AutoSizer measure the exact remaining height */}
      <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
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
          <AutoSizer>
            {({ height, width }) => (
              <VariableSizeList
                ref={listRef}
                height={height}
                width={width}
                itemCount={tickets.length}
                itemSize={getItemSize}
                estimatedItemSize={125}
                overscanCount={6}
                itemData={itemData}
              >
                {VirtualRow}
              </VariableSizeList>
            )}
          </AutoSizer>
        )}
      </Box>

      <FilterPopOver HandleDownloadExcel={HandleDownloadExcel} />
    </Box>
  );
};

export default React.memo(TicketList);

const TicketListSkeleton = () => (
  <Stack spacing={0} sx={{ p: 0 }}>
    {[...Array(8)].map((_, i) => (
      <Box key={i} sx={{ borderBottom: "1px solid #DFE1E6", p: 2 }}>
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
        <Skeleton variant="rectangular" width="30%" height={22} sx={{ mt: 1, borderRadius: 1 }} />
      </Box>
    ))}
  </Stack>
);
