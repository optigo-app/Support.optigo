import React, { useState } from "react";
import { Chip, Tooltip, Popover, Paper, Box, Typography, Grid, TextField, Button, Link } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { formatDate } from "../../../utils/helpers";
const TrainingActionButton = ({ params, onSchedule, isClient }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dateValue, setDateValue] = useState(null);
  const [zoomLink, setZoomLink] = useState("");

  // Check if training exists
  const isTrainingScheduled = Array.isArray(params.row.training) && params.row.training.length > 0;
  const isAlreadyScheduled =
    params?.row?.training?.[0]?.schedule?.dateTime != null &&
    params?.row?.training?.[0]?.schedule?.zoomLink;
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleSchedule = () => {
    onSchedule(params?.row?.ticketNo, "training", { dateTime: dateValue, zoomLink })
    setDateValue(null);
    setZoomLink("");
    handleClosePopover();
  };

  const open = Boolean(anchorEl);

  if (!isTrainingScheduled) {
    return (
      <Tooltip title={isClient ? "" : "Please fill in training details before scheduling."} arrow>
        <Chip
          label={isClient ? "-" : "Training Incomplete"}
          color="default"
          size="small"
          sx={{
            backgroundColor: isClient ? "#f5f5f5" : "#f8d7da",
            color: isClient ? "#9e9e9e" : "#721c24",
            fontWeight: 500,
            cursor: "not-allowed",
            opacity: 0.85,
            pointerEvents: "auto",
          }}
        />
      </Tooltip>
    );
  }
  return (
    <>
      {isAlreadyScheduled ? <>
        <Tooltip
          title={<TeamMemberCard member={params.row} isScheduled />}
          placement="top"
          PopperProps={{
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
            ],
          }}
          componentsProps={{
            tooltip: {
              style: {
                backgroundColor: "transparent",
                boxShadow: "none",
              },
            },
          }}
        >
          <Chip label="Scheduled" size="small"
            sx={{
              bgcolor: "#d4edda", color: "#155724"
            }}
          />
        </Tooltip>
      </> : <>
        <Tooltip
          title={isClient ? "You can't schedule a training for this ticket. Please contact the Team." : ""}
        > <Chip
            label={params.value || "Schedule"}
            size="small"
            onClick={isClient ? undefined : handleOpenPopover}
            style={{ cursor: "pointer", marginLeft: 8 }}
            sx={{
              backgroundColor: isClient ? "#f1f8e9" : "#fff3cd",
              color: isClient ? "#33691e" : "#856404",
              fontWeight: 500,
              cursor: isClient ? "default" : "pointer",
              marginLeft: 1,
              pointerEvents: "auto",
              opacity: 1,
              "&.Mui-disabled": {
                opacity: 1,
                pointerEvents: "auto",
                cursor: "default",
              },
              "&:hover": {
                backgroundColor: isClient ? "#f1f8e9" : "#ffe8a1",
              },
            }}
          /></Tooltip>


        <Popover
          id={open ? "schedule-popover" : undefined}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            style: {
              width: 310,
              borderRadius: 8,
            },
          }}
        >
          <TeamMemberCard
            member={params.row}
            isScheduled={false}
            dateValue={dateValue}
            onDateChange={setDateValue}
            zoomLink={zoomLink}
            onZoomLinkChange={(e) => setZoomLink(e.target.value)}
            onSchedule={handleSchedule}
          />
        </Popover>
      </>
      }
    </>
  );
};

export default TrainingActionButton;


function TeamMemberCard({ member, isScheduled, dateValue, onDateChange, zoomLink, onZoomLinkChange, onSchedule }) {
  const data = member?.training[0];
  const date = formatDate(data?.schedule?.dateTime);

  return (
    <>
      {isScheduled ? (
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Training To
              </Typography>
              <Typography variant="body2">{data?.attendees}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Training By
              </Typography>
              <Typography variant="body2">{data?.trainingBy}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Schedule Time
              </Typography>
              <Typography variant="body2">{date ?? "Not Scheduled"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Recording Link
              </Typography>
              {data?.schedule?.zoomLink ? (
                <Typography
                  component="a"
                  href={data.schedule.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ display: 'block' }}
                >
                  {data.schedule.zoomLink}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Not Scheduled
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2, maxWidth: '100%' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Schedule Training
            </Typography>

            {/* Time Field */}
            <Box mt={1.5}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Time:
              </Typography>
              <DateTimePicker
                value={dateValue}
                onChange={onDateChange}
                // label="Select Date & Time"
                views={["year", "month", "day", "hours", "minutes"]}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "Add time",
                    onClick: (e) => e.stopPropagation(),
                    sx: {
                      maxWidth: "260px",
                      mx: "auto",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        fontSize: "0.875rem",
                        backgroundColor: "transparent",
                        "& fieldset": {
                          borderColor: "#ccc",
                          borderRadius: 1,
                        },
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.light}`,
                        },
                      },
                    },
                  },
                  popper: {
                    onClick: (e) => e.stopPropagation(),
                  },
                }}
              />
            </Box>

            {/* Zoom Link Field */}
            <Box mt={1.5}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Recording:
              </Typography>
              <TextField
                placeholder="link"
                value={zoomLink}
                onChange={(e) => onZoomLinkChange(e)}
                fullWidth
                size="small"
                variant="outlined"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                    "& fieldset": {
                      borderColor: "#ccc",
                      borderRadius: 1,
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.light}`,
                    },
                  },
                }}
              />
            </Box>

            {/* Schedule Button */}
            <Box mt={2} textAlign="center">
              <Button
                variant="contained"
                fullWidth
                onClick={onSchedule}
                sx={{
                  bgcolor: "success.main",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "success.dark",
                  },
                }}
              >
                Schedule Training
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
}
