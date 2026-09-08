import { useState, useRef } from "react";
import {
  Chip,
  Box,
  Tooltip,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TeamMemberCard from "./TeamMemberCard";
import { useDelivery } from "../../../context/DeliveryProvider";

const AssignmentChip = styled(Chip)(({ theme }) => ({
  transition: "all 0.18s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: "translateY(-2px)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },
}));

export default function AssignmentTooltip({ params, isPoint = false }) {
  const assignment = JSON.parse(params?.value || "[]");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const PointId  = params?.id;
  const {EMPLOYEE_LIST} = useDelivery()

  if (!params?.value) return null;

  const handleMouseEnter = () => setTooltipOpen(true);
  const handleMouseLeave = () => setTooltipOpen(false);

  return (
    <Tooltip
      open={tooltipOpen}
      interactive
      disableHoverListener
      disableFocusListener
      disableTouchListener
      placement="top"
      PopperProps={{
        modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
      }}
      componentsProps={{
        tooltip: {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            padding: 0,
            pointerEvents: "auto",
          },
        },
      }}
      title={
        <Box
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <TeamMemberCard
          availableUsers={EMPLOYEE_LIST}
          member={assignment} isPoint={isPoint} {...isPoint && {PointId}} />
        </Box>
      }
    >
      <Box
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation(); // prevent immediate close
          setTooltipOpen(true); // keep open if clicked
        }}
        sx={{ position: "relative", display: "inline-block" }}
      >
        {assignment.length > 0 ? (
          <AssignmentChip
            label={`${assignment[0]?.user || "Unknown"}${
              assignment.length > 1 ? ` +${assignment.length - 1}` : ""
            }`}
            color="primary"
            variant="outlined"
            size="small"
          />
        ) : (
          <AssignmentChip label="Unassigned" color="default" size="small" />
        )}
      </Box>
    </Tooltip>
  );
}

// import { Chip, Box, Tooltip } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import TeamMemberCard from "./TeamMemberCard";

// const AssignmentChip = styled(Chip)(({ theme }) => ({
// 	transition: "all 0.3s ease",
// 	cursor: "pointer",
// 	"&:hover": {
// 		backgroundColor: theme.palette.primary.main,
// 		color: theme.palette.primary.contrastText,
// 		transform: "translateY(-2px)",
// 		boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
// 	},
// }));

// const AssignmentTooltip = ({ params ,isPoint = false }) => {
// 	const assignment = JSON.parse(params?.value);

// 	if (params?.value === null || !params?.value || params?.value === undefined) return <></>;

// 	return (
// 		<Tooltip
// 			PopperProps={{
// 				modifiers: [
// 					{
// 						name: "offset",
// 						options: {
// 							offset: [0, 8],
// 						},
// 					},
// 				],
// 			}}
// 			componentsProps={{
// 				tooltip: {
// 					style: {
// 						backgroundColor: "transparent",
// 						boxShadow: "none",
// 					},
// 				},
// 			}}
// 			title={<TeamMemberCard member={assignment} isPoint={isPoint} />}
// 		>
// 			<Box className="assignments-cell" sx={{ position: "relative" }}>
// 				{params?.value.length > 0 ? <AssignmentChip label={`${assignment[0]?.user || "Unknown"}${assignment?.length > 1 ? ` +${assignment?.length - 1}` : ""}`} color="primary" variant="outlined" size="small" /> : <AssignmentChip label="Unassigned" color="default" size="small" />}
// 			</Box>
// 		</Tooltip>
// 	);
// };

// export default AssignmentTooltip;
