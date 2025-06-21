import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const AutocompleteComponent = ({
    label,
    options,
    value,
    isWantLabel = false,
    onChange,
    disabled,
    helperText = '',
    error = false,
    ...props
}) => {
    const findOptionByValueOrLabel = (val) => {
        return options.find(
            (option) => option.value === val || option.label === val
        );
    };

    const selectedOption = value ? findOptionByValueOrLabel(value) : null;

    return (
        <Autocomplete
            disabled={disabled}
            fullWidth
            options={options}
            getOptionLabel={(option) => option.label || ''}
            // Add this to handle duplicate labels properly
            isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                return option.value === value.value;
            }}
            // Improve filtering to handle search better
            filterOptions={(options, { inputValue }) => {
                if (!inputValue) return options;
                
                return options.filter((option) =>
                    option.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.value?.toString().toLowerCase().includes(inputValue.toLowerCase())
                );
            }}
            value={selectedOption || null}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label={label} 
                    helperText={helperText}
                    error={error} 
                />
            )}
            onChange={(event, newValue) => {
                onChange(newValue ? (isWantLabel ? newValue.label : newValue.value) : '');
            }}
            // Add these props for better UX
            noOptionsText="No options found"
            clearOnEscape
            selectOnFocus
            handleHomeEndKeys
            {...props}
        />
    );
};

export default AutocompleteComponent;