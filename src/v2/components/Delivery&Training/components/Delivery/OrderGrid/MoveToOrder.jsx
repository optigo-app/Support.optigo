import { Chip, Stack } from "@mui/material";
import MoveUpRoundedIcon from "@mui/icons-material/MoveUpRounded";
import { orange } from "@mui/material/colors";
export default function WarmOrderChip({ HandleMoveToOrder }) {
  return (
    <Stack direction="row" spacing={1}>
      <Chip
        onClick={HandleMoveToOrder}
        size="small"
        icon={<MoveUpRoundedIcon />}
        label="Move to Order"
        clickable
        sx={{
          bgcolor: orange[100],
          fontWeight: 500,
          borderRadius: 6,
          "& .MuiChip-icon": {
            color: "orange.600",
            ml: 0.5,
          },
          "&:hover": {
            bgcolor: orange[200],
          },
        }}
      />
    </Stack>
  );
}
