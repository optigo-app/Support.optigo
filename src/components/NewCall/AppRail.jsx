'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Avatar,
  Popover,
  Divider,
  Chip,
} from '@mui/material';
import {
  House,
  Phone,
  FileText,
  UserSwitch,
  CirclesThreePlus,
  Package,
  Bell,
  DotsThree,
  Gear,
  SignOut,
  Circle,
  CheckCircle,
  Moon,
  Prohibit,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { callStreamService } from '../../services/callStreamService';
import { useAuth } from '../../context/UseAuth';

export default function AppRail({ activeTab = 'call_log', setActiveTab }) {
  const currentTab = activeTab === 'dms' ? 'call_log' : activeTab;
  const [profileAnchor, setProfileAnchor] = useState(null);
  const { user } = useAuth();

  // Real logged-in user profile — no fake avatar URL
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active',
    statusText: 'Active & Available',
  });

  // Sync real user from auth context
  useEffect(() => {
    if (user) {
      setUserProfile((prev) => ({
        ...prev,
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.name || 'User',
        email: user.email || '',
        role: user.role || user.designation || '',
      }));
    }
  }, [user]);

  // Subscribe to RxJS userProfile$ stream (status updates)
  useEffect(() => {
    const sub = callStreamService.userProfile$.subscribe((profile) => {
      if (profile) setUserProfile((prev) => ({ ...prev, ...profile }));
    });
    return () => sub.unsubscribe();
  }, []);

  const isPopoverOpen = Boolean(profileAnchor);

  const handleOpenProfile = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleCloseProfile = () => {
    setProfileAnchor(null);
  };

  const handleStatusChange = (newStatus) => {
    callStreamService.setUserStatus(newStatus);
    toast.success(`Status updated to ${newStatus.toUpperCase()}`, {
      description: `Your status is now ${newStatus === 'active' ? 'Active & Available' : newStatus === 'away' ? 'Set as Away' : 'Do Not Disturb'}`,
    });
  };

  const getStatusColor = (status) => {
    if (status === 'away') return '#F59E0B';
    if (status === 'dnd') return '#EF4444';
    if (status === 'offline') return '#64748B';
    return '#10B981'; // active
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <House size={20} weight={currentTab === 'home' ? 'fill' : 'regular'} /> },
    { id: 'call_log', label: 'Call log', icon: <Phone size={20} weight={currentTab === 'call_log' ? 'fill' : 'bold'} /> },
    { id: 'ticket', label: 'Ticket', icon: <FileText size={20} weight={currentTab === 'ticket' ? 'fill' : 'regular'} /> },
    { id: 'training', label: 'Training', icon: <UserSwitch size={20} weight={currentTab === 'training' ? 'bold' : 'regular'} /> },
    { id: 'order_request', label: 'Order Request', icon: <CirclesThreePlus size={20} weight={currentTab === 'order_request' ? 'bold' : 'regular'} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={20} weight={currentTab === 'orders' ? 'fill' : 'regular'} /> },
    { id: 'activity', label: 'Activity', icon: <Bell size={20} weight={currentTab === 'activity' ? 'fill' : 'regular'} /> },
    { id: 'more', label: 'More', icon: <DotsThree size={20} weight="bold" /> },
  ];

  return (
    <Box
      sx={{
        width: 66,
        minWidth: 66,
        maxWidth: 66,
        bgcolor: '#4c0079e3', // Exact Slack Dark Rail
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        userSelect: 'none',
      }}
    >
      {/* Top: App Navigation Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;

          return (
            <Tooltip key={item.id} title={item.label} placement="right">
              <Box
                onClick={() => setActiveTab && setActiveTab(item.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.3,
                  cursor: 'pointer',
                  width: '100%',
                  py: 0.6,
                  position: 'relative',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  '&:hover': {
                    color: '#FFFFFF',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 9.5,
                    fontWeight: isActive ? 750 : 500,
                    letterSpacing: '-0.01em',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 58,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Bottom: Add Workspace & Profile Avatar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>

        {/* Bottom Left Avatar with Popover Trigger */}
        <Tooltip title="Profile & Account Menu" placement="right">
          <Box
            onClick={handleOpenProfile}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'transform 0.15s ease',
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                borderRadius: '2px',
                bgcolor: '#6900C6',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {(userProfile.name || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 9,
                height: 9,
                borderRadius: '50%',
                bgcolor: getStatusColor(userProfile.status),
                border: '2px solid #350D36',
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Bottom-Left Interactive Profile & Status Popover Menu (RxJS Managed) */}
      <Popover
        open={isPopoverOpen}
        anchorEl={profileAnchor}
        onClose={handleCloseProfile}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            ml: 1.5,
            mb: -1,
            width: 260,
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        {/* User Card Header */}
        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  bgcolor: '#6900C6',
                  color: '#FFFFFF',
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                {(userProfile.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: getStatusColor(userProfile.status),
                  border: '2px solid #FFFFFF',
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                {userProfile.name}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>
                {userProfile.email}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={userProfile.role}
            size="small"
            sx={{
              mt: 1.2,
              height: 20,
              fontSize: '0.66rem',
              fontWeight: 700,
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              borderRadius: '4px',
              maxWidth: '100%',
            }}
          />
        </Box>

        {/* RxJS Status Switcher */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 750, color: '#94A3B8', textTransform: 'uppercase', px: 0.5, display: 'block', mb: 0.8 }}>
            Set Availability Status
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
            <Box
              onClick={() => handleStatusChange('active')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.6,
                borderRadius: '6px',
                bgcolor: userProfile.status === 'active' ? '#ECFDF5' : 'transparent',
                border: userProfile.status === 'active' ? '1px solid #A7F3D0' : '1px solid transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <CheckCircle size={15} color="#10B981" weight="bold" />
              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 650, color: '#0F172A', flex: 1 }}>
                Active & Available
              </Typography>
              {userProfile.status === 'active' && <Circle size={8} color="#10B981" weight="fill" />}
            </Box>

            <Box
              onClick={() => handleStatusChange('away')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.6,
                borderRadius: '6px',
                bgcolor: userProfile.status === 'away' ? '#FEF3C7' : 'transparent',
                border: userProfile.status === 'away' ? '1px solid #FDE68A' : '1px solid transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <Moon size={15} color="#F59E0B" weight="bold" />
              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 650, color: '#0F172A', flex: 1 }}>
                Set as Away
              </Typography>
              {userProfile.status === 'away' && <Circle size={8} color="#F59E0B" weight="fill" />}
            </Box>

            <Box
              onClick={() => handleStatusChange('dnd')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.6,
                borderRadius: '6px',
                bgcolor: userProfile.status === 'dnd' ? '#FEF2F2' : 'transparent',
                border: userProfile.status === 'dnd' ? '1px solid #FCA5A5' : '1px solid transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <Prohibit size={15} color="#EF4444" weight="bold" />
              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 650, color: '#0F172A', flex: 1 }}>
                Do Not Disturb
              </Typography>
              {userProfile.status === 'dnd' && <Circle size={8} color="#EF4444" weight="fill" />}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderBottom: '1px solid #F1F5F9' }} />

        {/* Profile Options */}
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Box
            onClick={() => {
              toast.info('Account Settings', { description: 'Opening User Profile Preferences...' });
              handleCloseProfile();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.2,
              py: 0.7,
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#334155',
              '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
            }}
          >
            <Gear size={16} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 550 }}>
              Profile & Account Settings
            </Typography>
          </Box>

          <Box
            onClick={() => {
              toast.info('Notification Preferences', { description: 'Opening Alert Settings...' });
              handleCloseProfile();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.2,
              py: 0.7,
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#334155',
              '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
            }}
          >
            <Bell size={16} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 550 }}>
              Notification Preferences
            </Typography>
          </Box>

        </Box>

        <Divider sx={{ borderBottom: '1px solid #F1F5F9' }} />

        {/* Sign Out Action */}
        <Box sx={{ p: 1 }}>
          <Box
            onClick={() => {
              toast.warning('Signing Out', { description: 'Redirecting to login portal...' });
              handleCloseProfile();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.2,
              py: 0.7,
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#DC2626',
              '&:hover': { bgcolor: '#FEF2F2' },
            }}
          >
            <SignOut size={16} weight="bold" />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
              Sign Out
            </Typography>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
