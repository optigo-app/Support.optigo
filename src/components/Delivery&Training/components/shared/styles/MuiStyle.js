import { styled } from "@mui/material/styles";
import { Box, TextField, FormControl } from "@mui/material";
import Switch from "@mui/material/Switch";

export const FormContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    maxWidth: "100%",
    overflowY: "auto",
    maxHeight: "calc(100vh - 250px)",
}));

export const FormSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    position: "relative",
}));

export const SectionTitle = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: theme.shape.borderRadius * 1.5,
    },
}));

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: theme.shape.borderRadius * 1.5,
    },
}));





export const DrawerFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    display: "flex",
    justifyContent: "flex-end",
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: 1,
}));


export  const IOSSwitch = styled((props) => <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  marginInline: "auto",
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));
