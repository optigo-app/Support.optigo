import React, { useMemo, useState } from "react";
import {
	Box,
	Typography,
	Tooltip,
	IconButton,
	InputBase,
	Popover,
	Badge,
	Button,
	Avatar,
	ButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useUrlFilters } from "../../../../hooks/useFilters";
import { extractTicketMentions, extractTicketMentionAuthors, getEmployeeList } from "../../../../utils/keywordUtils";

// Deterministic pastel avatar background colors
const AVATAR_PALETTES = [
	{ bg: "#E0E7FF", color: "#3730A3" }, // Indigo
	{ bg: "#FCE7F3", color: "#9D174D" }, // Pink
	{ bg: "#EDE9FE", color: "#5B21B6" }, // Purple
	{ bg: "#DCFCE7", color: "#166534" }, // Green
	{ bg: "#FEF3C7", color: "#92400E" }, // Amber
	{ bg: "#E0F2FE", color: "#075985" }, // Sky
	{ bg: "#FFE4E6", color: "#9F1239" }, // Rose
	{ bg: "#CCFBF1", color: "#115E59" }, // Teal
];

const getAvatarColor = (name = "") => {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % AVATAR_PALETTES.length;
	return AVATAR_PALETTES[index];
};

const getInitials = (name = "") => {
	if (!name) return "";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDisplayName = (name = "") => {
	if (!name) return "";
	return name
		.trim()
		.split(/\s+/)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
};

const SearchInputBox = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	backgroundColor: "#F4F5F7",
	borderRadius: "20px",
	padding: "3px 10px",
	marginBottom: "8px",
	border: "1px solid #DFE1E6",
	transition: "all 0.2s ease",
	"&:focus-within": {
		borderColor: "#0052CC",
		backgroundColor: "#FFFFFF",
		boxShadow: "0 0 0 2px rgba(0, 82, 204, 0.15)",
	},
}));

const StyledPillChip = styled(Box, {
	shouldForwardProp: (prop) => prop !== "selected",
})(({ theme, selected }) => ({
	display: "inline-flex",
	alignItems: "center",
	borderRadius: "20px",
	padding: "3px 8px 3px 3px",
	gap: "6px",
	cursor: "pointer",
	userSelect: "none",
	transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
	backgroundColor: selected ? "#FFFFFF" : "#F4F5F7",
	border: selected ? "1.5px solid #0052CC" : "1px solid #DFE1E6",
	boxShadow: selected
		? "0 2px 6px rgba(0, 82, 204, 0.18)"
		: "0 1px 2px rgba(0, 0, 0, 0.04)",
	"&:hover": {
		backgroundColor: selected ? "#F8FAFF" : "#FFFFFF",
		borderColor: selected ? "#0052CC" : "#C1C7D0",
		boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
	},
}));

const CountBadge = styled(Box)(({ theme, selected }) => ({
	backgroundColor: selected ? "rgba(0, 82, 204, 0.12)" : "#EBECF0",
	borderRadius: "10px",
	padding: "0 6px",
	fontSize: "11px",
	fontWeight: 600,
	color: selected ? "#0052CC" : "#42526E",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	minWidth: "18px",
	height: "17px",
}));

const ViewTabButton = styled(Button, {
	shouldForwardProp: (prop) => prop !== "active",
})(({ active }) => ({
	textTransform: "none",
	fontSize: "11px",
	fontWeight: active ? 600 : 500,
	padding: "2px 8px",
	borderRadius: "12px",
	lineHeight: 1.4,
	minWidth: "unset",
	backgroundColor: active ? "#0052CC" : "transparent",
	color: active ? "#FFFFFF" : "#6B778C",
	"&:hover": {
		backgroundColor: active ? "#0747A6" : "#EBECF0",
	},
}));

const MentionFilterSection = ({ tickets = [], collapsed = false }) => {
	const { filters, updateFilters } = useUrlFilters();
	const [searchQuery, setSearchQuery] = useState("");
	const [popoverAnchor, setPopoverAnchor] = useState(null);
	const [activeViewMode, setActiveViewMode] = useState("mentioned"); // "mentioned" | "mentioned_by"

	const selectedMentions = useMemo(() => {
		return (filters?.mentions || []).map((m) => String(m).trim().toLowerCase()).filter(Boolean);
	}, [filters?.mentions]);

	const selectedMentionedBy = useMemo(() => {
		return (filters?.mentionedBy || []).map((m) => String(m).trim().toLowerCase()).filter(Boolean);
	}, [filters?.mentionedBy]);

	const employees = useMemo(() => getEmployeeList(), []);

	// Extract tagged/mentioned persons
	const taggedMentions = useMemo(() => {
		return extractTicketMentions(tickets, employees);
	}, [tickets, employees]);

	// Extract authors who created comments / mentions
	const mentionAuthors = useMemo(() => {
		return extractTicketMentionAuthors(tickets, employees);
	}, [tickets, employees]);

	// Active list based on view mode
	const currentList = activeViewMode === "mentioned_by" ? mentionAuthors : taggedMentions;

	// Filtered list based on local search query in the sidebar section
	const displayMentions = useMemo(() => {
		if (!searchQuery.trim()) return currentList;
		const q = searchQuery.trim().toLowerCase();
		return currentList.filter((m) => m.name.toLowerCase().includes(q));
	}, [currentList, searchQuery]);

	const handleToggleItem = (personName) => {
		const target = personName.trim();
		const targetLower = target.toLowerCase();

		if (activeViewMode === "mentioned_by") {
			const isCurrentlySelected = selectedMentionedBy.includes(targetLower);
			let nextMentionedBy;
			if (isCurrentlySelected) {
				nextMentionedBy = (filters?.mentionedBy || []).filter(
					(m) => String(m).trim().toLowerCase() !== targetLower
				);
			} else {
				nextMentionedBy = [...(filters?.mentionedBy || []), target];
			}
			updateFilters({ mentionedBy: nextMentionedBy });
		} else {
			const isCurrentlySelected = selectedMentions.includes(targetLower);
			let nextMentions;
			if (isCurrentlySelected) {
				nextMentions = (filters?.mentions || []).filter(
					(m) => String(m).trim().toLowerCase() !== targetLower
				);
			} else {
				nextMentions = [...(filters?.mentions || []), target];
			}
			updateFilters({ mentions: nextMentions });
		}
	};

	const handleClearActive = (e) => {
		e?.stopPropagation();
		if (activeViewMode === "mentioned_by") {
			updateFilters({ mentionedBy: [] });
		} else {
			updateFilters({ mentions: [] });
		}
	};

	const handleClearAll = (e) => {
		e?.stopPropagation();
		updateFilters({ mentions: [], mentionedBy: [] });
	};

	const activeCount = selectedMentions.length + selectedMentionedBy.length;

	// --- Render Collapsed View ---
	if (collapsed) {
		const isAnyActive = activeCount > 0;
		return (
			<Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
				<Tooltip
					title={`Mentions ${isAnyActive ? `(${activeCount} active)` : ""}`}
					placement="right"
				>
					<Badge
						badgeContent={activeCount}
						color="primary"
						invisible={!isAnyActive}
						sx={{
							"& .MuiBadge-badge": {
								right: 4,
								top: 4,
								fontSize: "10px",
								height: "16px",
								minWidth: "16px",
								background: "#0052CC",
							},
						}}
					>
						<IconButton
							size="small"
							onClick={(e) => setPopoverAnchor(e.currentTarget)}
							sx={{
								width: 36,
								height: 36,
								borderRadius: "50%",
								backgroundColor: isAnyActive ? "rgba(0, 82, 204, 0.12)" : "#F4F5F7",
								color: isAnyActive ? "#0052CC" : "#42526E",
								"&:hover": {
									backgroundColor: isAnyActive ? "rgba(0, 82, 204, 0.2)" : "#EBECF0",
								},
							}}
						>
							<AlternateEmailRoundedIcon fontSize="small" />
						</IconButton>
					</Badge>
				</Tooltip>

				<Popover
					open={Boolean(popoverAnchor)}
					anchorEl={popoverAnchor}
					onClose={() => setPopoverAnchor(null)}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "left" }}
					PaperProps={{
						sx: {
							width: 320,
							p: 2,
							borderRadius: 3,
							boxShadow: "0px 8px 28px rgba(0,0,0,0.12)",
						},
					}}
				>
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
						<Box display="flex" alignItems="center" gap={0.8}>
							<AlternateEmailRoundedIcon sx={{ fontSize: 18, color: "#0052CC" }} />
							<Typography variant="subtitle2" fontWeight={700} color="#172B4D">
								Filter by Mentions
							</Typography>
						</Box>
						{activeCount > 0 && (
							<Button
								size="small"
								onClick={handleClearAll}
								sx={{ textTransform: "none", fontSize: "12px", color: "#0052CC", p: 0, fontWeight: 600 }}
							>
								Clear All ({activeCount})
							</Button>
						)}
					</Box>

					{/* View Mode Toggle Tabs */}
					<Box sx={{ display: "flex", gap: 0.6, mb: 1.5, backgroundColor: "#F4F5F7", p: 0.4, borderRadius: "14px" }}>
						<ViewTabButton
							active={activeViewMode === "mentioned"}
							onClick={() => setActiveViewMode("mentioned")}
							fullWidth
						>
							Mentioned ({selectedMentions.length})
						</ViewTabButton>
						<ViewTabButton
							active={activeViewMode === "mentioned_by"}
							onClick={() => setActiveViewMode("mentioned_by")}
							fullWidth
						>
							Mentioned By ({selectedMentionedBy.length})
						</ViewTabButton>
					</Box>

					{currentList.length > 5 && (
						<SearchInputBox
						>
							<SearchIcon sx={{ color: "#6B778C", fontSize: 16, mr: 0.8 }} />
							<InputBase
								placeholder={activeViewMode === "mentioned_by" ? "Search author..." : "Search person..."}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								sx={{ fontSize: "12.5px", flex: 1 }}
							/>
							{searchQuery && (
								<IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.2 }}>
									<ClearIcon sx={{ fontSize: 14 }} />
								</IconButton>
							)}
						</SearchInputBox>
					)}

					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: 0.8,
							maxHeight: "260px",
							overflowY: "auto",
							pr: 0.5,
						}}
					>
						{displayMentions.length === 0 ? (
							<Typography variant="caption" color="text.secondary" sx={{ py: 1, width: "100%", textAlign: "center" }}>
								{activeViewMode === "mentioned_by" ? "No mention authors found" : "No person mentions found"}
							</Typography>
						) : (
							displayMentions.map((item) => {
								const isSelected =
									activeViewMode === "mentioned_by"
										? selectedMentionedBy.includes(item.name.toLowerCase())
										: selectedMentions.includes(item.name.toLowerCase());
								const avatarStyle = getAvatarColor(item.name);
								const displayName = formatDisplayName(item.name);

								return (
									<StyledPillChip
										key={item.name}
										selected={isSelected}
										onClick={() => handleToggleItem(item.name)}
									>
										<Avatar
											src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=64&bold=true`}
											sx={{
												width: 22,
												height: 22,
												fontSize: "10px",
												fontWeight: 700,
												bgcolor: avatarStyle.bg,
												color: avatarStyle.color,
											}}
										>
											{getInitials(item.name)}
										</Avatar>

										<Typography
											sx={{
												fontSize: "12px",
												fontWeight: isSelected ? 600 : 500,
												color: isSelected ? "#0052CC" : "#172B4D",
												lineHeight: 1,
											}}
										>
											{displayName}
										</Typography>

										{isSelected ? (
											<CloseRoundedIcon
												sx={{
													fontSize: 14,
													color: "#0052CC",
													ml: -0.2,
													"&:hover": { color: "#FF5630" },
												}}
											/>
										) : (
											<CountBadge selected={false}>{item.count}</CountBadge>
										)}
									</StyledPillChip>
								);
							})
						)}
					</Box>
				</Popover>
			</Box>
		);
	}

	// --- Render Expanded View ---
	return (
		<Box sx={{ py: 1 }}>
			{/* Section Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 1,
					 px: 2
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
					<Box
						sx={{
							width: 22,
							height: 22,
							borderRadius: "50%",
							backgroundColor: activeCount > 0 ? "rgba(0, 82, 204, 0.12)" : "#F4F5F7",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<AlternateEmailRoundedIcon
							sx={{
								fontSize: 13,
								color: activeCount > 0 ? "#0052CC" : "#42526E",
							}}
						/>
					</Box>
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: "bold",
							color: "#42526E",
							fontSize: "13px",
							letterSpacing: 0.4,
							whiteSpace: "nowrap",
						}}
					>
						MENTIONS
					</Typography>
					{currentList.length > 0 && (
						<Box
							sx={{
								backgroundColor: "#EBECF0",
								borderRadius: "10px",
								px: 0.8,
								py: 0.1,
								fontSize: "11px",
								fontWeight: 600,
								color: "#42526E",
							}}
						>
							{currentList.length}
						</Box>
					)}
				</Box>

				{activeCount > 0 && (
					<Typography
						variant="caption"
						onClick={handleClearAll}
						sx={{
							cursor: "pointer",
							fontWeight: 600,
							color: "#0052CC",
							fontSize: "11.5px",
							"&:hover": { textDecoration: "underline", color: "#FF5630" },
						}}
					>
						Clear ({activeCount})
					</Typography>
				)}
			</Box>

			{/* View Mode Toggle Tabs */}
			<Box sx={{ px:1,boxSizing:'border-box',
					width:'100%',
					px:1
				 }}>
			<Box sx={{ 
				display: "flex", gap: 0.5, mb: 1, backgroundColor: "#F4F5F7", p: 0.4, borderRadius: "14px" }}>
				<ViewTabButton
					active={activeViewMode === "mentioned"}
					onClick={() => setActiveViewMode("mentioned")}
					fullWidth
				>
					Mentioned{selectedMentions.length > 0 ? ` (${selectedMentions.length})` : ""}
				</ViewTabButton>
				<ViewTabButton
					active={activeViewMode === "mentioned_by"}
					onClick={() => setActiveViewMode("mentioned_by")}
					fullWidth
				>
					By Who{selectedMentionedBy.length > 0 ? ` (${selectedMentionedBy.length})` : ""}
				</ViewTabButton>
			</Box>
				 </Box>

			{/* Quick Search if more than 5 persons */}
			{currentList.length > 5 && (
				<Box sx={{ px:1,boxSizing:'border-box',
					width:'100%'
				 }}>
				<SearchInputBox
				sx={{
					width:'100%',
				}}
				>
					<SearchIcon sx={{ color: "#6B778C", fontSize: 15, mr: 0.6 }} />
					<InputBase
						placeholder={activeViewMode === "mentioned_by" ? "Filter authors..." : "Filter mentions..."}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						sx={{ fontSize: "12px", flex: 1, py: 0.2 }}
					/>
					{searchQuery && (
						<IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.2 }}>
							<ClearIcon sx={{ fontSize: 13 }} />
						</IconButton>
					)}
				</SearchInputBox>
				</Box>
			)}

			{/* Multi-Select Chips Container */}
			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					gap: "6px",
					maxHeight: "220px",
					overflowY: "auto",
					pr: 0.5,
					"&::-webkit-scrollbar": {
						width: "4px",
					},
					"&::-webkit-scrollbar-thumb": {
						backgroundColor: "#DFE1E6",
						borderRadius: "4px",
					},

				px: 1,

				}}
			>
				{displayMentions.length === 0 ? (
					<Typography variant="caption" color="text.secondary" sx={{ py: 0.5, fontStyle: "italic", fontSize: "11.5px" }}>
						{activeViewMode === "mentioned_by"
							? currentList.length === 0
								? "No mention authors"
								: "No matching author"
							: currentList.length === 0
							? "No mentions in tickets"
							: "No matching person"}
					</Typography>
				) : (
					displayMentions.map((item) => {
						const isSelected =
							activeViewMode === "mentioned_by"
								? selectedMentionedBy.includes(item.name.toLowerCase())
								: selectedMentions.includes(item.name.toLowerCase());
						const avatarStyle = getAvatarColor(item.name);
						const displayName = formatDisplayName(item.name);

						return (
							<StyledPillChip
								key={item.name}
								selected={isSelected}
								onClick={() => handleToggleItem(item.name)}
							>
								<Avatar
									src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=64&bold=true`}
									sx={{
										width: 22,
										height: 22,
										fontSize: "10px",
										fontWeight: 700,
										bgcolor: avatarStyle.bg,
										color: avatarStyle.color,
									}}
								>
									{getInitials(item.name)}
								</Avatar>

								<Typography
									sx={{
										fontSize: "12px",
										fontWeight: isSelected ? 600 : 500,
										color: isSelected ? "#0052CC" : "#172B4D",
										lineHeight: 1,
									}}
								>
									{displayName}
								</Typography>

								{isSelected ? (
									<CloseRoundedIcon
										sx={{
											fontSize: 14,
											color: "#0052CC",
											ml: -0.2,
											"&:hover": { color: "#FF5630" },
										}}
									/>
								) : (
									<CountBadge selected={false}>{item.count}</CountBadge>
								)}
							</StyledPillChip>
						);
					})
				)}
			</Box>
		</Box>
	);
};

export default React.memo(MentionFilterSection);

