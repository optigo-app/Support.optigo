import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import React, { useEffect, useState } from "react";
import { useTicket } from "../../../../context/useTicket";

const ClosedSeeOff = ({ IsClosed, TicketNo }) => {
  const [isReopened, setIsReopened] = useState(false);
  const { CloseTicket } = useTicket();

  // Reset reopened state whenever ticket changes or whenever ticket becomes closed
  useEffect(() => {
    setIsReopened(false);
  }, [TicketNo, IsClosed]);

  const handleReopenTicket = () => {
    setIsReopened(true);
    CloseTicket(TicketNo, 1);
  };

  // If ticket is not closed and not recently reopened, render nothing
  if (!IsClosed && !isReopened) return null;

  // When IsClosed is true, it is definitively closed, so never show as reopened
  const showAsReopened = !IsClosed && isReopened;

  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: showAsReopened ? "#e8f5e9" : "#ffdfdc",
        border: showAsReopened ? "1px solid #c8e6c9" : "1px solid #ffcdd2",
        borderRadius: 4,
        position: "sticky",
        top: 0,
        paddingTop: 0,
        zIndex: 100,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {showAsReopened ? (
            <CheckCircleOutlineIcon sx={{ color: "green", fontSize: 36 }} />
          ) : (
            <CheckCircleOutlineIcon sx={{ color: "red", fontSize: 36 }} />
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1E293B", mb: 0.5 }}>
              {showAsReopened ? "This ticket is reopened" : "This ticket is closed"}
            </Typography>

            {showAsReopened ? (
              <Typography variant="body2" sx={{ color: "#1E293B" }}>
                This ticket has been successfully reopened. You may now continue working on it.
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                You can reopen this ticket within 10 days of closure. After that, it will be archived and no longer editable.
              </Typography>
            )}
          </Box>
          {!showAsReopened && (
            <Chip
              icon={<ReplayIcon />}
              label="Reopen Ticket"
              variant="filled"
              color="warning"
              sx={{
                cursor: "pointer",
                mt: 1,
              }}
              onClick={handleReopenTicket}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClosedSeeOff;
