import { Chip, Box, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import TeamMemberCard from "./TeamMemberCard";

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

const AssignmentTooltip = ({ params }) => {
  const assignment = JSON.parse(params?.value);

  if(params?.value === null || !params?.value || params?.value === undefined) return (<></>);

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
      title={<TeamMemberCard member={assignment} />}
    >
      <Box className="assignments-cell" sx={{ position: "relative" }}>
        { params?.value.length > 0 ? <AssignmentChip label={`${assignment[0]?.user || "Unknown"}${assignment?.length > 1 ? ` +${assignment?.length - 1}` : ""}`} color="primary" variant="outlined" size="small" /> : <AssignmentChip label="Unassigned" color="default" size="small" />}
      </Box>
    </Tooltip>
  );
};

export default AssignmentTooltip;
