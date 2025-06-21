import { Chip, Box, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import DateCard from "./DateCard";
import { FormatDateIST } from "../../../utils/helpers";

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
      <Box className="assignments-cell" sx={{ position: "relative" }}>
        <AssignmentChip label={FormatDateIST(params?.value)} color="default" size="small" />
      </Box>
    </Tooltip>
  );
};

export default DateTooltip;
