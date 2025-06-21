import React from 'react';
import { parse, format } from 'date-fns';
import {

    Drawer,
    Box,
    Typography,
    IconButton,
    Grid,
    Avatar,
    Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import Person4RoundedIcon from '@mui/icons-material/Person4Rounded';
import { extractRecordingLink } from '../../../utils/deliveryUtils';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import { getColorByStatus, getInitial } from '../../../libs/data';
const styles = {
    drawerPaper: {
        width: { xs: '100%', sm: 600 },
        height: '100%',
        overflowY: 'auto',
        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.3s ease-in-out',
        transform: 'translateX(-100%)',
        '&.open': {
            transform: 'translateX(0)',
        },
        borderRadius: 0,

    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid #f0f0f0',
        p: 2,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: '#fff',
    },
    topicItem: {
        pl: 2,
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '0.6rem',
            width: '0.5rem',
            height: '0.5rem',
            bgcolor: '#3b82f6',
            borderRadius: '50%',
        },
    },
};



export default function TrainingDetailPanel({ open, onClose, isAdmin = false }) {
    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: styles.drawerPaper,
                className: open ? 'open' : '',
                maxWidth: '100%',
            }}
        >
            <Box >
                {/* Header */}
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Training Details
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Ticket #{open?.TicketNo}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Main Content */}
                <Box mb={4} p={2}>

                    {/* Basic Info */}
                    <Box bgcolor="grey.100" p={2} borderRadius={2} mb={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" textTransform="uppercase">
                                    Company
                                </Typography>
                                <Typography>{open?.Projectcode}</Typography>
                            </Grid>
                           {isAdmin && <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" textTransform="uppercase">
                                    Customer Type
                                </Typography>
                                <Typography>{open?.CutomerType}</Typography>
                            </Grid>}
                           {isAdmin && <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" textTransform="uppercase">
                                    Package Info
                                </Typography>
                                <Typography>{open?.CutomerPackage || "N/A"}</Typography>
                            </Grid>}
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" textTransform="uppercase">
                                    Date
                                </Typography>
                                <Typography>{open?.TrainingDate}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" textTransform="uppercase">
                                    Duration
                                </Typography>
                                <Typography>{open?.DurationTime?.toFixed(2)} Hours</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" textTransform="uppercase">
                                    Mode
                                </Typography>
                                <Typography>{open?.TrainingMode}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" textTransform="uppercase">
                                    Type
                                </Typography>
                                <Typography>{open?.TrainingType}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Trainer & Attendees */}
                    <Box mb={3}>
                        <Typography variant="overline" color="textSecondary" display="block" mb={1}>
                            Trainer
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'blue.100', color: 'blue.600' }}>
                                <Person4RoundedIcon />
                            </Avatar>
                            <Box>
                                <Typography>{open?.TrainingBy}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Trainer
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="overline" color="textSecondary" display="block" mb={1}>
                            Training Status
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Box
                                sx={{
                                    px: 2,
                                    py: 0.5,
                                    bgcolor: getColorByStatus(open?.Status),
                                    borderRadius: 1,
                                    fontSize: '0.85rem',
                                }}
                            >
                                {open?.Status}
                            </Box>
                        </Box>
                        <Typography variant="overline" color="textSecondary" display="block" mb={1}>
                            Attendees
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                            {open?.Attendees?.split(', ').map((name, i) => {
                                const initial = getInitial(name);
                                return (
                                    <Box
                                        key={i}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        bgcolor="grey.100"
                                        px={1}
                                        py={0.5}
                                        borderRadius={30}
                                        sx={{
                                            transition: 'background-color 0.3s ease',
                                            '&:hover': {
                                                bgcolor: 'primary.light',
                                                transform: 'scale(1.02)',
                                            },
                                            boxShadow: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                boxShadow: 2,
                                            }}
                                        >
                                            {initial}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {name}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Time */}
                    <Box mb={3}>
                        <Typography variant="overline" color="textSecondary" display="block" mb={1}>
                            Time
                        </Typography>
                        <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            bgcolor="#e6f0ff"
                            p={2}
                            borderRadius={1}
                        >
                            <AccessTimeIcon color="primary" fontSize="small" />
                            <Typography fontWeight="medium">
                                {open?.StartTime && format(parse(open?.StartTime || '', 'HH:mm', new Date()), 'hh:mm a')} -
                                {open?.EndTime && format(parse(open?.EndTime || '', 'HH:mm', new Date()), 'hh:mm a')}
                            </Typography>
                        </Box>
                    </Box>
                    <Box mb={3}>
                        <Typography variant="overline" color="textSecondary" display="block" mb={1}>
                            Remarks
                        </Typography>
                        <Box bgcolor="grey.100" p={2} borderRadius={2}>
                            <Typography variant="body2">{open?.Remark || 'No remarks available'}</Typography>
                        </Box>
                    </Box>
                    {/* Topics Covered */}
                    {open?.Details !== "<p></p>\n" && <Box mb={3}>
                        <Typography variant="overline" color="textSecondary" display="block" mb={1}>
                            Details
                        </Typography>
                        <Box pl={1}
                            sx={{
                                wordBreak: "break-word",
                                wordWrap: "break-word",
                            }}
                            dangerouslySetInnerHTML={{
                                __html:
                                    open?.Details
                            }}>
                        </Box>
                    </Box>
                    }
                    {/* Remarks */}

                    {/* Session Recording */}
                    <Box bgcolor="background.paper" p={2.5} borderRadius={3} boxShadow={1}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                            <VideoLibraryIcon color="primary" />
                            <Typography variant="overline" color="textSecondary">
                                Session Recording
                            </Typography>
                        </Box>

                        {extractRecordingLink(open?.Details || '') ? (
                            <>
                                <Typography variant="body2" color="textSecondary" mb={2}>
                                    Access the session recording below:
                                </Typography>

                                <Link
                                    href={extractRecordingLink(open?.Details || '')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="none"
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        bgcolor: 'primary.light',
                                        color: 'primary.dark',
                                        px: 2,
                                        py: 1.2,
                                        borderRadius: 2,
                                        transition: 'background-color 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>View Recording</span>
                                    <Box
                                        sx={{
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateX(4px)',
                                            },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <InsertLinkRoundedIcon fontSize='small' />
                                    </Box>
                                </Link>
                            </>
                        ) : (
                            <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                There is no session recording available at this time. Please check back later!
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Drawer >
    );
}
