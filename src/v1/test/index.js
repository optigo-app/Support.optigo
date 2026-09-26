import * as React from "react";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import { ChevronDown } from "lucide-react";
import Box from "@mui/material/Box";

function SelectInset01({
  label = "Select an option",
  options = [],
  value,
  onChange,
  fullWidth = true,
  ...props
}) {
  const selectId = React.useId();

  return (
    <FormControl fullWidth={fullWidth} variant="filled">
      <InputLabel
        htmlFor={selectId}
        sx={{
          "&.MuiInputLabel-shrink": {
            transform: "translate(12px, 7px) scale(0.9)",
          },
          width: "50%",
        }}
      >
        {label}
      </InputLabel>
      <Select
        variant="filled"
        id={selectId}
        value={value}
        onChange={onChange}
        displayEmpty
        IconComponent={ChevronDown}
        sx={{
          minHeight: 56,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          "&:hover, &.Mui-focused": {
            backgroundColor: "background.paper",
            borderColor: "primary.main",
          },
          "& .MuiSelect-select": {
            pt: 1.5,
            pb: 1.5,
            px: 2,
          },
          "&::before,::after": {
            display: "none",
          },
          "& .MuiSelect-icon": {
            fontSize: "1.25rem",
            width: "1em",
            height: "1em",
          },
        }}
        {...props}
      >
        <MenuItem value="NONE">
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}



const deviceOptions = [
  { value: "iphone-16", label: "iPhone 16" },
  { value: "iphone-15", label: "iPhone 15" },
  { value: "iphone-14", label: "iPhone 14" },
  { value: "iphone-13", label: "iPhone 13" },
  { value: "samsung-s24", label: "Samsung Galaxy S24" },
  { value: "pixel-8", label: "Google Pixel 8" },
];

export default function Page() {
  const [device, setDevice] = React.useState("iphone-16");

  return (
    <Box sx={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:'column'}}>
      <SelectInset01
        label="Your trade-in device"
        value={device}
        onChange={(e) => setDevice(e.target.value)}
        options={deviceOptions}
      />
    </Box>
  );
}
