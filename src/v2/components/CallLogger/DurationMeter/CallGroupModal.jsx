import React, { useState, useMemo } from "react";
import {
	Box, Typography, Paper, Grid, IconButton, Backdrop, 
	Button, ToggleButton, ToggleButtonGroup, Divider, Stack, Select, MenuItem, FormControl
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";

const CalendarGoogleClone = ({ open, onClose, data = [] }) => {
	const [currentDate, setCurrentDate] = useState(dayjs()); // Month/Year being viewed
	const [selectedDate, setSelectedDate] = useState(dayjs()); // Day logs shown on right
	const [groupBy, setGroupBy] = useState("company");

	// 1. Logic: Group and Sort Data
	const processedData = useMemo(() => {
		const map = {};
		[...data].sort((a, b) => a.time.localeCompare(b.time)).forEach((call) => {
			const d = dayjs(call.date).format("YYYY-MM-DD");
			if (!map[d]) map[d] = [];
			map[d].push(call);
		});
		return map;
	}, [data]);

	// 2. Helpers for Calendar Grid
	const startOfMonth = currentDate.startOf("month");
	const daysInMonth = currentDate.daysInMonth();
	const startDay = startOfMonth.day();
	const prevMonthDays = startOfMonth.subtract(1, "month").daysInMonth();

	// 3. Category Colors for high-end look
	const getCallColor = (type) => {
		if (type?.toLowerCase().includes("tech")) return "#1a73e8"; // Blue
		if (type?.toLowerCase().includes("query")) return "#f9ab00"; // Yellow
		if (type?.toLowerCase().includes("train")) return "#188038"; // Green
		return "#70757a";
	};

	const handleYearChange = (e) => setCurrentDate(currentDate.year(e.target.value));
	const handleMonthChange = (e) => setCurrentDate(currentDate.month(e.target.value));

	return (
		<Backdrop open={open} sx={{ zIndex: 1500, bgcolor: "rgba(60, 64, 67, 0.7)", backdropFilter: "blur(4px)" }}>
			<Paper sx={{ 
                width: "98vw", maxWidth: 1400, height: "92vh", borderRadius: 4, 
                display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "#fff" 
            }}>
				
				{/* HEADER: Google Calendar Style */}
				<Box sx={{ p: 1.5, px: 3, display: "flex", alignItems: "center", borderBottom: "1px solid #dadce0" }}>
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 240 }}>
						<CalendarMonthIcon sx={{ color: "#1a73e8", fontSize: 32 }} />
						<Typography variant="h6" sx={{ color: "#3c4043", fontWeight: 500, letterSpacing: -0.5 }}>
							Call Log Dashboard
						</Typography>
					</Stack>

					<Button variant="outlined" size="small" onClick={() => {setCurrentDate(dayjs()); setSelectedDate(dayjs())}}
						sx={{ mx: 2, textTransform: 'none', color: '#3c4043', borderColor: '#dadce0', borderRadius: 1.5 }}>Today</Button>
					
					<Stack direction="row" alignItems="center">
						<IconButton size="small" onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}><ChevronLeftIcon /></IconButton>
						<IconButton size="small" onClick={() => setCurrentDate(currentDate.add(1, 'month'))}><ChevronRightIcon /></IconButton>
					</Stack>

					{/* Year & Month Picker */}
					<Stack direction="row" spacing={1} sx={{ ml: 2 }}>
						<Select value={currentDate?.month()} onChange={handleMonthChange} size="small" variant="standard" disableUnderline sx={{ fontWeight: 500, fontSize: 18 }}>
							{[...Array(12)].map((_, i) => (
								<MenuItem key={i} value={i}>
									{dayjs().month(i).format("MMMM")}
								</MenuItem>
							))}
						</Select>
						<Select value={currentDate?.year()} onChange={handleYearChange} size="small" variant="standard" disableUnderline sx={{ fontWeight: 500, fontSize: 18 }}>
							{[2024, 2025, 2026, 2027].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
						</Select>
					</Stack>

					<Box sx={{ flexGrow: 1 }} />

					<ToggleButtonGroup value={groupBy} exclusive onChange={(e, v) => v && setGroupBy(v)} size="small" sx={{ height: 32 }}>
						<ToggleButton value="company" sx={{ textTransform: 'none', px: 2 }}>By Company</ToggleButton>
						<ToggleButton value="callBy" sx={{ textTransform: 'none', px: 2 }}>By User</ToggleButton>
					</ToggleButtonGroup>

					<IconButton onClick={onClose} sx={{ ml: 2 }}><CloseIcon /></IconButton>
				</Box>

				{/* BODY: Main Split View */}
				<Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
					
					{/* LEFT: Massive Calendar Grid */}
					<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
						{/* Weekday Headers */}
						<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #dadce0' }}>
							{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
								<Typography key={d} sx={{ py: 1, textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#70757a' }}>{d}</Typography>
							))}
						</Box>

						{/* Grid Days */}
						<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', flexGrow: 1 }}>
							{/* Fill Previous Month Days */}
							{[...Array(startDay)].map((_, i) => (
								<Box key={`prev-${i}`} sx={{ borderRight: '1px solid #dadce0', borderBottom: '1px solid #dadce0', bgcolor: '#f8f9fa', p: 1 }}>
									<Typography sx={{ fontSize: 12, color: '#bdc1c6', textAlign: 'center' }}>
										{prevMonthDays - startDay + i + 1}
									</Typography>
								</Box>
							))}

							{/* Current Month Days */}
							{[...Array(daysInMonth)].map((_, i) => {
								const d = startOfMonth.add(i, 'day');
								const dStr = d.format("YYYY-MM-DD");
								const isSelected = selectedDate.isSame(d, 'day');
								const isToday = dayjs().isSame(d, 'day');
								const calls = processedData[dStr] || [];
								
								// Group for cell display
								const grouped = calls.reduce((acc, c) => {
									const k = c[groupBy] || "None";
									acc[k] = (acc[k] || 0) + 1;
									return acc;
								}, {});

								return (
									<Box key={i} onClick={() => setSelectedDate(d)}
										sx={{ 
											borderRight: '1px solid #dadce0', borderBottom: '1px solid #dadce0', 
											p: 0.5, cursor: 'pointer', transition: '0.1s',
											bgcolor: isSelected ? "#e8f0fe" : "#fff",
											"&:hover": { bgcolor: isSelected ? "#e8f0fe" : "#f1f3f4" }
										}}>
										<Typography sx={{ 
											fontSize: 12, fontWeight: 700, mb: 0.5, textAlign: 'center', width: 24, height: 24, 
											lineHeight: '24px', borderRadius: '50%', mx: 'auto',
											bgcolor: isToday ? "#1a73e8" : "transparent", color: isToday ? "#fff" : "#3c4043"
										}}>
											{i + 1}
										</Typography>
										<Stack spacing={0.2} sx={{ overflow: 'hidden' }}>
											{Object.entries(grouped).slice(0, 4).map(([name, count]) => (
												<Box key={name} sx={{ 
													bgcolor: "#1a73e8", color: "#fff", px: 0.8, py: 0.2, 
													borderRadius: '4px', display: "flex", justifyContent: "space-between" 
												}}>
													<Typography sx={{ fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</Typography>
													<Typography sx={{ fontSize: 10, fontWeight: 800 }}>{count}</Typography>
												</Box>
											))}
											{Object.keys(grouped).length > 4 && (
												<Typography sx={{ fontSize: 10, fontWeight: 700, color: '#1a73e8', pl: 1 }}>
													+ {Object.keys(grouped).length - 4} more
												</Typography>
											)}
										</Stack>
									</Box>
								);
							})}
						</Box>
					</Box>

					{/* RIGHT: High-Fidelity History Panel */}
					<Box sx={{ width: 450, borderLeft: "1px solid #dadce0", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
						<Box sx={{ p: 3, pb: 2 }}>
							<Typography variant="h5" sx={{ fontWeight: 400, color: "#3c4043" }}>{selectedDate.format("dddd")}</Typography>
							<Typography variant="h4" sx={{ fontWeight: 300, color: "#1a73e8", mb: 1 }}>{selectedDate.format("MMMM D")}</Typography>
							<Typography variant="caption" sx={{ color: "#70757a", fontWeight: 500, letterSpacing: 0.5 }}>
								{(processedData[selectedDate.format("YYYY-MM-DD")]?.length || 0)} CALLS TOTAL
							</Typography>
						</Box>

						<Box sx={{ flexGrow: 1, overflowY: "auto", px: 3, "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#dadce0", borderRadius: 10 } }}>
							{Object.entries(
								(processedData[selectedDate.format("YYYY-MM-DD")] || []).reduce((acc, c) => {
									const k = c[groupBy] || "Other";
									if (!acc[k]) acc[k] = [];
									acc[k].push(c);
									return acc;
								}, {})
							).map(([entity, logs]) => (
								<Box key={entity} sx={{ mb: 4 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a73e8", mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
										<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1a73e8' }} />
										{entity.toUpperCase()}
									</Typography>
									<Stack spacing={1.5}>
										{logs.map((log, idx) => (
											<Box key={idx} sx={{ 
												pl: 2, borderLeft: `4px solid ${getCallColor(log.CallType)}`, 
												py: 0.5, transition: '0.2s', "&:hover": { bgcolor: "#f8f9fa" }, borderRadius: '0 8px 8px 0'
											}}>
												<Stack direction="row" spacing={2} alignItems="center">
													<Typography sx={{ fontSize: 14, fontWeight: 700, color: "#3c4043", minWidth: 50 }}>{log.time}</Typography>
													<Box sx={{ flexGrow: 1 }}>
														<Typography sx={{ fontSize: 14, color: "#202124", fontWeight: 500 }}>{log.description}</Typography>
														<Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
															<Typography sx={{ fontSize: 11, color: "#5f6368" }}>⏳ {log.CallDuration}</Typography>
															{log.CallType && <Typography sx={{ fontSize: 11, color: "#5f6368", bgcolor: '#f1f3f4', px: 1, borderRadius: 1 }}>{log.CallType}</Typography>}
														</Stack>
													</Box>
												</Stack>
											</Box>
										))}
									</Stack>
								</Box>
							))}
							{!processedData[selectedDate.format("YYYY-MM-DD")] && (
								<Box sx={{ height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.4 }}>
									<CalendarMonthIcon sx={{ fontSize: 60, mb: 1 }} />
									<Typography variant="h6">No Activity Found</Typography>
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Paper>
		</Backdrop>
	);
};

export default CalendarGoogleClone;