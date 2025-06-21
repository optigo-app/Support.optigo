import React, { useState } from "react";
import { Box, Typography, IconButton, Grid, Divider, Tooltip, Chip, Popover } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { FormatTime } from "../../../../libs/formatTime";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import { Card, TextField, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const EllipsisCell = ({ value }) => (
  <Tooltip title={value} placement="top">
    <Typography
      variant="body2"
      sx={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "block",
        maxWidth: "100%",
        color: "#091E42",
        fontWeight: 500,
      }}
      title={value}
    >
      {value}
    </Typography>
  </Tooltip>
);

const DetailSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: "1px solid #DFE1E6",
}));



const DetailBar = ({ ticket, onClose, handleClick, anchorEl, open, handleClose, inputValue, handleInputChange, HandleSave }) => {
  const id = open ? "simple-popover" : undefined;
  return (
    <DetailSection
      sx={{
        transition: ".3s ease-in-out",
      }}
    >
      {/* Subject + Close Icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Typography
            onClick={handleClick}
            sx={{
              fontWeight: 700,
              fontSize: 22,
              color: "#172B4D",
              whiteSpace: "pre-line",
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}
          >
            {ticket?.MainSubject || ticket?.subject || "No Main Subject"}
          </Typography>
          {ticket?.MainSubject && ticket?.subject && (
            <Typography
              onClick={handleClick}
              sx={{
                fontWeight: 500,
                fontSize: 18,
                color: "#6B778C",
                mt: 0.5,
                whiteSpace: "pre-line",
                wordBreak: "break-word",
                lineHeight: 1.3,
              }}
            >
              {ticket?.subject}
            </Typography>
          )}
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <Card sx={{ maxWidth: 400, width: 400, mx: "auto", p: 1.3 }}>
              <TextField sx={{ mt: 1 }} label="Main Title" multiline rows={4} value={inputValue} onChange={handleInputChange} fullWidth variant="outlined" />
              <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                <Button variant="contained" color="error" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="contained" color="primary" onClick={HandleSave}>
                  Save
                </Button>
              </Box>
            </Card>
          </Popover>
        </Box>

        <Tooltip title="Close">
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Project Code with Icon */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <ApartmentRoundedIcon fontSize="small" sx={{ color: "#A5ADBA" }} />
        <Typography variant="body1" sx={{ fontWeight: 500, color: "#253858", lineHeight: "normal", display: "flex", alignItems: "center", gap: 0.6 }}>
          {ticket?.companyname || "No Project Code"}
          {ticket?.createdby === "Client" && (
            <Chip
              label="Client Ticket"
              size="small"
              color="primary"
              sx={{
                width: "fit-content",
                fontSize: 12,
                fontWeight: 500,
                backgroundColor: "#E6F0FF",
                color: "#0B69FF",
              }}
            />
          )}
        </Typography>
      </Box>

      {/* Divider for clarity */}
      <Divider sx={{ my: 1.5 }} />

      {/* Ticket Info Block */}
      <Grid container spacing={2} alignItems="center">
        {/* Ticket Number */}
        <Grid item xs={12} sm="auto">
          <Typography sx={{ fontWeight: 600, color: "#091E42" }}>
            Ticket No: <span style={{ fontWeight: 700 }}>{ticket?.TicketNo}</span>
          </Typography>
        </Grid>

        {/* Created By */}
        <Grid item xs={12} sm>
          <Typography variant="body2" sx={{ color: "#5E6C84", display: "flex", alignItems: "center", gap: 0.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Created on <strong>{FormatTime(ticket?.CreatedOn, "shortDate")}</strong>
            {ticket?.CreatedBy && (
              <>
                &nbsp;by <EllipsisCell value={ticket?.CreatedBy} />
              </>
            )}
          </Typography>
        </Grid>

        {/* Last Updated */}
        <Grid item xs={12} sm="auto">
          {ticket?.UpdatedAt && (
            <Typography variant="caption" sx={{ color: "#7A869A", display: "flex", alignItems: "center", gap: 0.6 }}>
              Last updated {FormatTime(ticket?.UpdatedAt, "relative")}
              <EllipsisCell value={ticket?.LastUpdatedBy && `By ` + ticket?.LastUpdatedBy} />
            </Typography>
          )}
        </Grid>
      </Grid>
    </DetailSection>
  );
};

export default DetailBar;
