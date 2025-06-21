import { Box, IconButton, Tooltip } from "@mui/material";
import { Description, Assignment } from "@mui/icons-material";
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';


const ActionButton = ({ onOpen, isClient, onEdit, onDeleteToggle }) => {
  return (
    <>
      <Box display="flex" mx={"auto"} gap={1}>
        <Tooltip title="View Details" onClick={onOpen}>
          <IconButton size="small" sx={{
            backgroundColor: "#e3f2fd",  // soft blue
            color: "#1565c0",            // vibrant blue text/icon
            "&:hover": {
              backgroundColor: "#bbdefb",
            },
          }}>
            <Description fontSize="small" />
          </IconButton>
        </Tooltip>
        {!isClient && <Tooltip title="Edit">
          <IconButton
            onClick={onEdit}
            size="small" sx={{
              backgroundColor: "#fce4ec",
              color: "#ad1457",
              "&:hover": {
                backgroundColor: "#f8bbd0",
              },
            }}>
            <Assignment fontSize="small" />
          </IconButton>
        </Tooltip>}
        {!isClient && <Tooltip title="Delete">
          <IconButton
            onClick={onDeleteToggle}
            size="small" sx={{
              backgroundColor: "#ffcdd2",
              color: "#b71c1c",
              "&:hover": {
                backgroundColor: "#ef9a9a",
              },
            }}>
            <HighlightOffRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>}
      </Box>
    </>
  );
};

export default ActionButton;
