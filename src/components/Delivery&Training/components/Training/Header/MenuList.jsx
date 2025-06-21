import { Menu, MenuItem, } from '@mui/material';
const MenuList = ({ options, anchorEl, open, handleClose, handleSelect, selectedValue = "" }) => {
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={(e) => e.stopPropagation()}
            PaperProps={{
                style: {
                    borderRadius: 15,
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                    padding: "4px",
                    border: "1px solid #E0E0E0",
                    zIndex: 9999,
                },
            }}
            sx={{
                mt: 1,
                "& .MuiMenu-list": {
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.4,
                },
            }}
        >
            {options.map((option) => (
                <MenuItem
                    key={option.value}
                    sx={{
                        fontSize: "14px",
                        fontWeight: 400,
                        color: "text.primary",
                        backgroundColor: "transparent",
                        borderRadius: 3,
                        "&:hover": {
                            backgroundColor: "action.hover",
                        },
                        py: 0.6,
                        px: 2,
                    }}
                    selected={selectedValue === option?.value}
                    onClick={(e) => handleSelect(option.value, e)}
                >
                    {option.label}
                </MenuItem>
            ))}
        </Menu>
    );
};

export default MenuList;