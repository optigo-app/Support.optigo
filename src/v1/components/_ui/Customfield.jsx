import React from "react";
import { Box, MenuItem, styled } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const StyledTextField = styled(TextField)(({ theme }) => ({
	"& .MuiOutlinedInput-root": {
		borderRadius: 4,
		backgroundColor: "#fff",
		"&:hover fieldset": {
			borderColor: theme.palette.primary.main,
		},
		"&.Mui-focused fieldset": {
			borderColor: theme.palette.primary.main,
		},
	},
	"& .MuiInputLabel-root": {
		color: "#555",
		fontWeight: 500,
		fontSize: "0.875rem",
		"&.Mui-focused": {
			color: theme.palette.primary.main,
		},
	},
	width: "100%",
	marginBottom: theme.spacing(0.5),
}));

// Styled label for the field
export const FieldLabel = styled("div")({
	textTransform: "uppercase",
	fontSize: "0.75rem",
	fontWeight: 500,
	color: "#555",
	marginBottom: "4px",
	letterSpacing: "0.5px",
});

/**
 * CustomTextField - A reusable styled MUI TextField component with support for select and autocomplete
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Label text displayed above the field
 * @param {boolean} props.select - Whether the field should be a select dropdown
 * @param {boolean} props.autocomplete - Whether the field should use autocomplete
 * @param {Array} props.options - Options for select/autocomplete field (array of {value, label} objects, or simple array of strings)
 * @param {string} props.placeholder - Placeholder text
 * @param {Function} props.onChange - Change handler function
 * @param {Function} props.onAutocompleteChange - Specific change handler for autocomplete (receives (event, newValue))
 * @param {string} props.value - Current value of the field
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.error - Error message (if any)
 * @param {boolean} props.multiple - Whether multiple selections are allowed (for autocomplete)
 * @param {boolean} props.freeSolo - Whether the autocomplete allows values not in the options list
 * @param {boolean} props.disableClearable - Whether to disable the clear button in autocomplete
 * @param {Object} props.rest - Any other props to pass to TextField or Autocomplete
 */
const CustomTextField = ({ label, select = false, autocomplete = false, options = [], placeholder, onChange, onAutocompleteChange, value, required = false, error, multiple = false, freeSolo = false, disableClearable = false, ...rest }) => {
	// Format options to work with both string arrays and object arrays
	const formattedOptions = options.map((option) => {
		if (typeof option === "string") {
			return { value: option, label: option };
		}
		return option;
	});

	// Handle autocomplete change if no specific handler is provided
	const handleAutocompleteChange =
		onAutocompleteChange ||
		((event, newValue) => {
			// For multiple selection, newValue is an array
			if (multiple) {
				const values = newValue.map((item) => (typeof item === "object" ? item.value : item));
				const syntheticEvent = {
					target: { value: values },
				};
				onChange && onChange(syntheticEvent);
			} else {
				// For single selection, newValue is a single item or null
				const selectedValue = newValue ? (typeof newValue === "object" ? newValue.value : newValue) : "";
				const syntheticEvent = {
					target: { value: selectedValue },
				};
				onChange && onChange(syntheticEvent);
			}
		});

	return (
		<Box>
			{label && <FieldLabel>{label}</FieldLabel>}

			{autocomplete ? (
				<Autocomplete
					multiple={multiple}
					freeSolo={freeSolo}
					disableClearable={disableClearable}
					options={formattedOptions}
					getOptionLabel={(option) => {
						// Handle both string options and object options
						if (typeof option === "string") return option;
						return option.label || "";
					}}
					value={value}
					onChange={handleAutocompleteChange}
					renderInput={(params) => <StyledTextField {...params} placeholder={placeholder} required={required} error={!!error} helperText={error} size="small" variant="outlined" {...rest} />}
					{...rest}
				/>
			) : select ? (
				<StyledTextField select placeholder={placeholder} value={value} onChange={onChange} required={required} error={!!error} helperText={error} size="small" variant="outlined" {...rest}>
					{formattedOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</StyledTextField>
			) : (
				<StyledTextField placeholder={placeholder} value={value} onChange={onChange} required={required} error={!!error} helperText={error} size="small" variant="outlined" {...rest} />
			)}
		</Box>
	);
};

export default CustomTextField;
