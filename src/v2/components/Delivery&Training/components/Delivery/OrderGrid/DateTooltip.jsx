import { Chip, Box, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import DateCard from "./DateCard";
import { FormatDateIST, getMostRecentDate } from "../../../utils/helpers";

const AssignmentChip = styled(Chip)(({ theme }) => ({
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
}));

const DateTooltip = ({ params, isClient = false }) => {
  const row = params?.row || {};
  const dateFields = ["TicketDate", "RequestDate", "ConfirmationDate"];

  const mostRecent = getMostRecentDate(row, dateFields);
  const description = mostRecent ? FormatDateIST(mostRecent.value, "dd-MM-yyyy") : "No Date";
  const label = mostRecent?.label || "";

  return (
    <Tooltip
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
      title={<DateCard ticketData={params?.row} isClient={isClient} />}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Typography
          color="text.primary" // Strong, dark text
          variant="subtitle2" fontWeight={600}
          fontSize={`13px`}
        >
          {label}
        </Typography>
        <Typography
          color="text.secondary" // Softer, subdued color for secondary text
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          title={description}
          fontSize={`13px`}
        >
          {description}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default DateTooltip;
