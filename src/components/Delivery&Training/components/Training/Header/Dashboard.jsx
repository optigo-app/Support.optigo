import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { calculateTrainingModeDistribution, calculateAverageAttendees, calculateTotalTrainingTime, calculateTrainingTypesDistribution } from './../../../utils/deliveryUtils'
import MenuList from './MenuList';
const Dashboard = ({ Data, filters }) => {
    const totalTrainings = Data.filter(training => training?.Status !== "Cancelled").length;
    const totalTrainingTime = calculateTotalTrainingTime(Data);
    const averageAttendees = calculateAverageAttendees(Data);
    const trainingTypesDistribution = calculateTrainingTypesDistribution(Data);
    const trainingModeDistribution = calculateTrainingModeDistribution(Data);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorElMode, setAnchorElMode] = React.useState(null);
    const [selectedType, setSelectedType] = React.useState('');
    const [selectedMode, setSelectedMode] = React.useState('');

// Training Type
React.useEffect(() => {
    const availableTypes = Object.keys(trainingTypesDistribution).filter(
        key => trainingTypesDistribution[key] > 0
    );

    if (availableTypes.length > 0) {
        if (filters?.trainingType && trainingTypesDistribution[filters.trainingType] > 0) {
            setSelectedType(filters.trainingType);
        } else if (!availableTypes.includes(selectedType) || trainingTypesDistribution[selectedType] === 0) {
            setSelectedType(availableTypes[0]);
        }
    } else {
        setSelectedType('');
    }
}, [trainingTypesDistribution, filters?.trainingType]);

// Training Mode
React.useEffect(() => {
    const availableModes = Object.keys(trainingModeDistribution).filter(
        key => trainingModeDistribution[key] > 0
    );

    if (availableModes.length > 0) {
        if (filters?.trainingMode && trainingModeDistribution[filters.trainingMode] > 0) {
            setSelectedMode(filters.trainingMode);
        } else if (!availableModes.includes(selectedMode) || trainingModeDistribution[selectedMode] === 0) {
            setSelectedMode(availableModes[0]);
        }
    } else {
        setSelectedMode('');
    }
}, [trainingModeDistribution, filters?.trainingMode]);



    return (
        <Grid container spacing={2}>
            {/* Total Trainings */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{
                    borderRadius: 2,
                    boxShadow: 'none',
                    background: 'linear-gradient(to right, #f1fff0, #f5fff0)'
                }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Total Trainings
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                            {totalTrainings || 0}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
                                    +{totalTrainings || 0} Trainings
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'error.main', fontStyle: "italic" }}>
                                Cancelled Trainings are excluded
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Total Training Time */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{
                    borderRadius: 2,
                    boxShadow: 'none',
                    background: 'linear-gradient(to right, #f5f8ff, #f0f4ff)'
                }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Total Training Time
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                            {totalTrainingTime || 0} Hours
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
                                    +{totalTrainingTime || 0} Hours
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Average Attendees per Training */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{
                    borderRadius: 2,
                    boxShadow: 'none',
                    background: 'linear-gradient(to right, #f0f9ff, #f5faff)'
                }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Average Attendees per Training
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                            {averageAttendees.toFixed(2) || 0}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
                                    +{averageAttendees.toFixed(2) || 0} Attendees
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Training Types Distribution */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{
                    borderRadius: 2,
                    boxShadow: 'none',
                    background: 'linear-gradient(to right, #fff0f6, #fff5f8)'
                }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Training Types Distribution -{" "}
                            <Chip
                                label={selectedType || 'None'}
                                color={'secondary'}
                                size="small"
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{
                                    cursor: "pointer",
                                    pointerEvents: "auto",
                                    opacity: 1,
                                    "&.Mui-disabled": {
                                        opacity: 1,
                                        pointerEvents: "auto",
                                        cursor: "default",
                                    },
                                    borderRadius: '4px'
                                }}
                            />
                            <MenuList
                                options={Object.keys(trainingTypesDistribution).map((key) => ({
                                    label: `${key} (${trainingTypesDistribution[key]})`,
                                    value: key
                                }))}
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                handleClose={() => setAnchorEl(null)}
                                handleSelect={(value) => {
                                    console.log("🚀 ~ Dashboard ~ value:", value)
                                    setSelectedType(value);
                                    setAnchorEl(null);
                                }}
                            />
                        </Typography>

                        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                            {trainingTypesDistribution[selectedType] || 0}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
                                    +{Object.keys(trainingTypesDistribution).length || 0} Types
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {/* Optional additional info */}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Training Mode Distribution */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{
                    borderRadius: 2,
                    boxShadow: 'none',
                    background: 'linear-gradient(to right, #fff6f3, #fff9f0)'
                }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Training Mode Distribution - {" "}
                            <Chip
                                label={selectedMode || 'None'}
                                color={'primary'}
                                size="small"
                                onClick={(e) => setAnchorElMode(e.currentTarget)}
                                sx={{
                                    cursor: "pointer",
                                    pointerEvents: "auto",
                                    opacity: 1,
                                    "&.Mui-disabled": {
                                        opacity: 1,
                                        pointerEvents: "auto",
                                        cursor: "default",
                                    },
                                    borderRadius: '4px'
                                }}
                            />
                            <MenuList
                                options={Object.keys(trainingModeDistribution).map((key) => ({
                                    label: `${key} (${trainingModeDistribution[key]})`,
                                    value: key
                                }))}
                                anchorEl={anchorElMode}
                                open={Boolean(anchorElMode)}
                                handleClose={() => setAnchorElMode(null)}
                                handleSelect={(value) => {
                                    setSelectedMode(value);
                                    setAnchorElMode(null);
                                }}
                            />
                        </Typography>

                        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                            {trainingModeDistribution[selectedMode] || 0}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'medium' }}>
                                    +{Object.keys(trainingModeDistribution).length || 0} Modes
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {/* Optional additional info */}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};


export default Dashboard;