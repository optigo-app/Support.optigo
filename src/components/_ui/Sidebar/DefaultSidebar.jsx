import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  Collapse,
  Button
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/GridView'; // Dashboard
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Messages
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'; // Tasks
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined'; // Notes
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Emails
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'; // Reports
import hubIcon from '@mui/icons-material/Hub'; // Workflows
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Automations (Stars)
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'; // Key Accounts
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Strategic
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'; // Focus Areas
import StarOutlineIcon from '@mui/icons-material/StarOutline'; // Starred
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'; // Companies
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'; // People
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit'; // For the top right icon

// --- Configuration ---
const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

// --- Mock Data ---
const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon /> },
  { text: 'Messages', icon: <ChatBubbleOutlineIcon />, badge: 16 },
  { text: 'Tasks', icon: <CheckBoxOutlinedIcon /> },
  { text: 'Notes', icon: <NoteAltOutlinedIcon /> },
  { text: 'Emails', icon: <MailOutlineIcon /> },
  { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
  { text: 'Automations', icon: <AutoAwesomeIcon />, color: '#a855f7' }, // Purple icon
  { text: 'Workflows', icon: <hubIcon />, color: '#a855f7' },
];

const favoritesItems = [
  { text: 'Key Accounts', icon: <VpnKeyOutlinedIcon /> },
  { text: 'Strategic Initiatives', icon: <TrendingUpIcon /> },
  { text: 'Focus Areas', icon: <FlagOutlinedIcon /> },
  { text: 'Starred Items', icon: <StarOutlineIcon /> },
];

const recordsItems = [
  { text: 'Companies', icon: <BusinessCenterOutlinedIcon /> },
  { text: 'People', icon: <PeopleAltOutlinedIcon /> },
];

// --- Custom Components ---

// Smooth container for the sidebar
const SidebarContainer = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: open ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRight: '1px solid #E5E7EB',
    // The magic transition for smooth width change
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden', // Prevent scrollbars during animation
    position: 'relative',
    whiteSpace: 'nowrap',
  })
);

// Wrapper to hide text without unmounting it (prevents layout jumping)
const TextWrapper = styled(Box)(({ theme, open }) => ({
  opacity: open ? 1 : 0,
  width: open ? 'auto' : 0,
  transition: theme.transitions.create(['opacity', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
  }),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
}));

// Custom Logo Component
const Logo = () => (
  <Box
    sx={{
      width: 32,
      height: 32,
      bgcolor: '#1a1a1a',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0,
    }}
  >
    <AutoAwesomeIcon fontSize="small" />
  </Box>
);

const DefaultSidebar = () => {
  const theme = useTheme();
  // State for collapse/expand
  const [open, setOpen] = useState(true);

  // Toggle function
  const handleToggle = () => {
    setOpen(!open);
  };

  // Helper to render a list item
  const renderItem = (item, index, active = false) => {
    const content = (
      <ListItemButton
        disableRipple
        sx={{
            minHeight: 40,
            justifyContent: open ? 'initial' : 'center',
            px: 2,
            mb: 0.5,
            mx: 1,
            borderRadius: '8px',
            bgcolor: active ? '#F3F4F6' : 'transparent',
            '&:hover': {
              bgcolor: '#F3F4F6',
            },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 1.5 : 0,
            justifyContent: 'center',
            color: item.color ? item.color : '#525252',
          }}
        >
          {item.icon}
        </ListItemIcon>
        
        {/* We keep the text in DOM but hide it via CSS for smooth animation */}
        <TextWrapper open={open}>
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
                fontSize: '0.9rem', 
                fontWeight: 500, 
                color: '#374151' 
            }} 
          />
          {item.badge && (
            <Box 
                sx={{ 
                    bgcolor: '#F3F4F6', 
                    borderRadius: '4px', 
                    px: 0.8, 
                    py: 0.2, 
                    fontSize: '0.75rem', 
                    color: '#6B7280',
                    fontWeight: 600
                }}
            >
                {item.badge}
            </Box>
          )}
          {/* Add sparkles for Automation items if expanded */}
          {(item.text === 'Automations' || item.text === 'Workflows') && (
               <AutoAwesomeIcon sx={{ fontSize: 14, color: '#a855f7', ml: 'auto' }} />
          )}
        </TextWrapper>
      </ListItemButton>
    );

    // If collapsed, wrap in tooltip
    if (!open) {
      return (
        <Tooltip title={item.text} placement="right" arrow key={index}>
          <Box>{content}</Box>
        </Tooltip>
      );
    }

    return <Box key={index}>{content}</Box>;
  };

  const renderSectionHeader = (title) => (
      <Box sx={{ 
          display: open ? 'flex' : 'none', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          px: 3, 
          pt: 3, 
          pb: 1 
      }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#6B7280' }}>
              <ExpandMoreIcon sx={{ fontSize: 18, mr: 0.5 }} />
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                  {title}
              </Typography>
          </Box>
          <IconButton size="small" sx={{ p: 0.5 }}>
              <AddIcon fontSize="small" sx={{ fontSize: 16 }} />
          </IconButton>
      </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F9FAFB' }}>
      <SidebarContainer open={open}>
        
        {/* HEADER */}
        <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: open ? 'flex-start' : 'center',
            minHeight: 64
        }}>
          {/* Allow clicking logo to toggle sidebar for demo purposes */}
          <Box onClick={handleToggle} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Logo />
          </Box>
          
          <TextWrapper open={open} sx={{ ml: 1.5 }}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#111827' }}>
                    DesignHub
                    </Typography>
                    <ExpandMoreIcon sx={{ fontSize: 16, ml: 0.5, color: '#6B7280' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                21 members
                </Typography>
            </Box>
            <IconButton size="small" sx={{ ml: 'auto', border: '1px solid #E5E7EB', borderRadius: 1.5 }}>
                 <EditIcon fontSize="small" sx={{ fontSize: 14 }} />
            </IconButton>
          </TextWrapper>
        </Box>

        {/* SEARCH BAR */}
        <Box sx={{ px: 2, mb: 2, mt: 1 }}>
          {open ? (
             <TextField
             fullWidth
             placeholder="Search"
             variant="outlined"
             size="small"
             sx={{
               '& .MuiOutlinedInput-root': {
                 bgcolor: '#F3F4F6',
                 borderRadius: '8px',
                 '& fieldset': { border: 'none' },
                 '&:hover fieldset': { border: 'none' },
                 '&.Mui-focused fieldset': { border: 'none', boxShadow: '0 0 0 2px #E5E7EB' },
               },
               '& input': { py: 1, fontSize: '0.9rem' }
             }}
             InputProps={{
               startAdornment: (
                 <InputAdornment position="start">
                   <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                 </InputAdornment>
               ),
               endAdornment: (
                 <Box sx={{ 
                    bgcolor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '4px', 
                    px: 0.5,
                    display: 'flex',
                    alignItems: 'center'
                 }}>
                     <KeyboardCommandKeyIcon sx={{ fontSize: 10, color: '#6B7280' }} />
                     <Typography variant="caption" sx={{ fontSize: 10, color: '#6B7280', fontWeight: 'bold' }}>K</Typography>
                 </Box>
               )
             }}
           />
          ) : (
             <IconButton sx={{ width: '100%' }}>
                <SearchIcon />
             </IconButton>
          )}
        </Box>

        {/* SCROLLABLE AREA */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            
            {/* MAIN MENU */}
            <List sx={{ px: 1 }}>
                {mainMenuItems.map((item, index) => renderItem(item, index))}
            </List>

            {/* SEPARATOR (DOTS) */}
            {!open && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <MoreHorizIcon sx={{ color: '#9CA3AF' }} />
                </Box>
            )}

            {/* FAVORITES */}
            {renderSectionHeader('Favorites')}
            <List sx={{ px: 1 }}>
                {favoritesItems.map((item, index) => renderItem(item, index))}
            </List>

             {/* SEPARATOR (DOTS) */}
             {!open && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <MoreHorizIcon sx={{ color: '#9CA3AF' }} />
                </Box>
            )}

            {/* RECORDS */}
            {renderSectionHeader('Records')}
            <List sx={{ px: 1 }}>
                {/* Highlight Companies as active for demo */}
                {recordsItems.map((item, index) => renderItem(item, index, item.text === 'Companies'))}
            </List>

        </Box>

        {/* FOOTER AREA */}
        <Box sx={{ p: 2, borderTop: open ? 'none' : 'none' }}>
            
            {/* PROMO CARD - Only visible when open */}
            {open && (
                <Box sx={{ 
                    bgcolor: '#F3F4F6', 
                    borderRadius: '12px', 
                    p: 2, 
                    mb: 2,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                     {/* Close button for promo */}
                     <IconButton 
                        size="small" 
                        sx={{ position: 'absolute', top: 8, right: 8, color: '#6B7280', p: 0.5 }}
                    >
                        <CloseIcon fontSize="small" sx={{ fontSize: 14 }} />
                     </IconButton>

                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                        New version available
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#6B7280', mb: 2, lineHeight: 1.4 }}>
                        An improved version of App is available. Please restart now to upgrade.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Button 
                            variant="text" 
                            size="small" 
                            endIcon={<KeyboardArrowRightIcon />}
                            sx={{ 
                                p: 0, 
                                color: '#111827', 
                                textTransform: 'none', 
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } 
                            }}
                        >
                            Update
                        </Button>
                        {/* Decorative Geometry */}
                        <Box sx={{ opacity: 0.5 }}>
                            <svg width="40" height="30" viewBox="0 0 50 40">
                                <path d="M25 0 L50 15 L25 30 L0 15 Z" fill="none" stroke="#3b82f6" strokeWidth="1" />
                                <path d="M25 10 L50 25 L25 40 L0 25 Z" fill="none" stroke="#3b82f6" strokeWidth="1" />
                            </svg>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* USER PROFILE */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                justifyContent: open ? 'initial' : 'center'
            }}>
                 {/* Online Indicator Badge wrapper */}
                 <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: '#10B981',
                            color: '#10B981',
                            boxShadow: `0 0 0 2px #fff`,
                            '&::after': {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: '1px solid currentColor',
                                content: '""',
                            },
                        },
                    }}
                >
                    <Avatar 
                        src="https://i.pravatar.cc/150?img=11" 
                        sx={{ width: 36, height: 36, borderRadius: '10px' }} 
                    />
                </Badge>

                <TextWrapper open={open} sx={{ ml: 1.5 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                                Liam Smith
                            </Typography>
                             <ExpandMoreIcon sx={{ fontSize: 14, ml: 0.5, color: '#6B7280' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            smith@example.com
                        </Typography>
                    </Box>
                    <MoreHorizIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
                </TextWrapper>
            </Box>
        </Box>

      </SidebarContainer>
    </Box>
  );
};

export default DefaultSidebar;