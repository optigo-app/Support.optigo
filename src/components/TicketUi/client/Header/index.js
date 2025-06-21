import { AppBar, Toolbar, Typography, Button, IconButton, Box, Tooltip } from "@mui/material";
import SearchResultPopover from "./SearchResultPopover";

const Header = ({ onSelect = () => { } }) => {
    return (
        <AppBar position="static" sx={{ background: (theme) => theme.palette.gradient.main, boxShadow: "none" }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ display: { xs: "none", sm: "block" }, fontWeight: "bold", mr: 2 }}>
                    Ticket System
                </Typography>
                <Box sx={{ flexGrow: 1, maxWidth: "600px" }}>
                    <SearchResultPopover onSelect={onSelect} />
                </Box>
                <Box sx={{ flexGrow: 1 }} />
            </Toolbar>
        </AppBar>
    );
};

export default Header;
