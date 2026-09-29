import React, { useState, useMemo, useCallback } from "react";
import {
	Box,
	Typography,
	Popover,
	IconButton,
	Tooltip,
	Avatar,
} from "@mui/material";
import {
	HelpCircle,
	X as CloseIcon,
	Check as CheckIcon,
} from "lucide-react";
import { getCurrentUser } from "../../../../utils/AuthUtils";
import { useTicket } from "../../../../context/useTicket";
import { extractTicketMentions } from "../../../../utils/keywordUtils";

// Deterministic pastel avatar colors
const AVATAR_COLORS = [
	{ bg: "#E0E7FF", color: "#3730A3" },
	{ bg: "#FCE7F3", color: "#9D174D" },
	{ bg: "#EDE9FE", color: "#5B21B6" },
	{ bg: "#DCFCE7", color: "#166534" },
	{ bg: "#FEF3C7", color: "#92400E" },
	{ bg: "#E0F2FE", color: "#075985" },
	{ bg: "#FFE4E6", color: "#9F1239" },
];

const getAvatarStyle = (name = "") => {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name = "") => {
	if (!name) return "?";
	const clean = name.replace(/^[@!#]/, "").trim();
	const parts = clean.split(/\s+/);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Compact Pill (No fancy hover, pure flat clean design)
 */
const Pill = ({
	children,
	active = false,
	applied = false,
	onClick,
	avatar = null,
	mono = false,
}) => (
	<Box
		onClick={onClick}
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "5px",
			px: "7px",
			py: "3px",
			borderRadius: "5px",
			backgroundColor: active ? "#DEEBFF" : "#F4F5F7",
			border: `1px solid ${active ? "#0052CC" : "#DFE1E6"}`,
			color: active ? "#0052CC" : "#172B4D",
			cursor: "pointer",
			fontSize: "0.74rem",
			fontWeight: active ? 600 : 500,
			fontFamily: mono ? "monospace" : "inherit",
			lineHeight: 1.2,
			userSelect: "none",
			"&:hover": {
				backgroundColor: active ? "#DEEBFF" : "#EBECF0",
				borderColor: active ? "#0052CC" : "#C1C7D0",
			},
			"&:active": {
				backgroundColor: "#E2E8F0",
			},
		}}
	>
		{avatar}
		{children}
		{applied && <CheckIcon size={12} color="#15803D" style={{ marginLeft: 2 }} />}
	</Box>
);

const SearchHelperPopover = ({ onApplySearch, currentQuery = "" }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const [appliedQuery, setAppliedQuery] = useState(null);

	// Logged in user
	const currentUser = useMemo(() => {
		try {
			return getCurrentUser();
		} catch (e) {
			return null;
		}
	}, []);

	const currentUserName = currentUser?.fullName || currentUser?.firstname || "Ryumen Sukuna";
	const userInitials = getInitials(currentUserName);

	// Team mentions from tickets
	const { tickets = [] } = useTicket();
	const teammateMentions = useMemo(() => {
		try {
			const list = extractTicketMentions(tickets);
			const names = [];
			list.forEach((item) => {
				const lower = item.name.toLowerCase().trim();
				if (!lower.includes("me") && !lower.includes(currentUserName.toLowerCase()) && names.length < 3) {
					names.push(item.name);
				}
			});
			if (names.length === 0) return ["Harshit", "Rahul Sharma"];
			return names;
		} catch (e) {
			return ["Harshit", "Rahul Sharma"];
		}
	}, [tickets, currentUserName]);

	const handleOpen = (e) => setAnchorEl(e.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const handleApply = useCallback(
		(q) => {
			setAppliedQuery(q);
			if (onApplySearch) onApplySearch(q);
			setTimeout(() => {
				setAppliedQuery((prev) => (prev === q ? null : prev));
			}, 1200);
		},
		[onApplySearch]
	);

	const isOpen = Boolean(anchorEl);

	return (
		<>
			<Tooltip title="Search tips & syntax" placement="bottom" arrow>
				<IconButton
					size="small"
					onClick={handleOpen}
					aria-label="search syntax guide"
					sx={{
						p: "3px",
						color: isOpen ? "#0052CC" : "#6B778C",
						backgroundColor: isOpen ? "#DEEBFF" : "transparent",
						borderRadius: "4px",
						"&:hover": {
							color: "#172B4D",
							backgroundColor: "#F4F5F7",
						},
					}}
				>
					<HelpCircle size={15} />
				</IconButton>
			</Tooltip>

			<Popover
				open={isOpen}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				PaperProps={{
					sx: {
						width: 375,
						maxWidth: "92vw",
						maxHeight: "75vh",
						borderRadius: "8px",
						boxShadow: "0 8px 24px rgba(9, 30, 66, 0.16)",
						border: "1px solid #DFE1E6",
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#FFFFFF",
					},
				}}
			>
				{/* Compact Header */}
				<Box
					sx={{
						px: 1.5,
						py: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderBottom: "1px solid #EBECF0",
						backgroundColor: "#FAFBFC",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#172B4D" }}>
							Search Syntax Guide
						</Typography>
					</Box>
					<IconButton
						size="small"
						onClick={handleClose}
						sx={{
							p: "2px",
							color: "#6B778C",
							"&:hover": { color: "#172B4D", backgroundColor: "#EBECF0" },
						}}
					>
						<CloseIcon size={14} />
					</IconButton>
				</Box>

				{/* User Profile Strip */}
				<Box
					sx={{
						px: 1.5,
						py: 0.9,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						backgroundColor: "#F7F8F9",
						borderBottom: "1px solid #EBECF0",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
						<Avatar
							sx={{
								width: 20,
								height: 20,
								fontSize: "9px",
								fontWeight: 700,
								bgcolor: "#F59E0B",
								color: "#FFFFFF",
							}}
						>
							{userInitials}
						</Avatar>
						<Typography
							sx={{
								fontSize: "0.74rem",
								fontWeight: 600,
								color: "#172B4D",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{currentUserName}
						</Typography>
					</Box>

					<Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
						<Pill
							active={currentQuery === "@me"}
							applied={appliedQuery === "@me"}
							onClick={() => handleApply("@me")}
							mono
						>
							@me
						</Pill>
						<Pill
							active={currentQuery === "!me"}
							applied={appliedQuery === "!me"}
							onClick={() => handleApply("!me")}
							mono
						>
							!me (Solo)
						</Pill>
					</Box>
				</Box>

				{/* Compact Content */}
				<Box
					sx={{
						p: 1.5,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						gap: 1.25,
					}}
				>
					{/* 1. Mention Search */}
					<Box>
						<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 0.5 }}>
							<Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0052CC" }}>
								@name — Mention Search
							</Typography>
							<Typography sx={{ fontSize: "0.68rem", color: "#6B778C" }}>
								Shared mentions allowed
							</Typography>
						</Box>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
							<Pill
								active={currentQuery === "@me"}
								applied={appliedQuery === "@me"}
								onClick={() => handleApply("@me")}
								avatar={
									<Avatar sx={{ width: 16, height: 16, fontSize: "8px", fontWeight: 700, bgcolor: "#F59E0B" }}>
										{userInitials}
									</Avatar>
								}
								mono
							>
								@me
							</Pill>
							{teammateMentions.map((name) => {
								const q = `@${name.toLowerCase().split(" ")[0]}`;
								const avStyle = getAvatarStyle(name);
								return (
									<Pill
										key={name}
										active={currentQuery === q}
										applied={appliedQuery === q}
										onClick={() => handleApply(q)}
										avatar={
											<Avatar sx={{ width: 16, height: 16, fontSize: "8px", fontWeight: 700, bgcolor: avStyle.bg, color: avStyle.color }}>
												{getInitials(name)}
											</Avatar>
										}
										mono
									>
										{q}
									</Pill>
								);
							})}
						</Box>
					</Box>

					{/* 2. Strict Solo Search */}
					<Box>
						<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 0.5 }}>
							<Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#C2410C" }}>
								!name — Strict Solo Search
							</Typography>
							<Typography sx={{ fontSize: "0.68rem", color: "#6B778C" }}>
								Strictly 1 person only
							</Typography>
						</Box>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
							<Pill
								active={currentQuery === "!me"}
								applied={appliedQuery === "!me"}
								onClick={() => handleApply("!me")}
								avatar={
									<Avatar sx={{ width: 16, height: 16, fontSize: "8px", fontWeight: 700, bgcolor: "#F59E0B" }}>
										{userInitials}
									</Avatar>
								}
								mono
							>
								!me
							</Pill>
							{teammateMentions.slice(0, 2).map((name) => {
								const q = `!${name.toLowerCase().split(" ")[0]}`;
								const avStyle = getAvatarStyle(name);
								return (
									<Pill
										key={name}
										active={currentQuery === q}
										applied={appliedQuery === q}
										onClick={() => handleApply(q)}
										avatar={
											<Avatar sx={{ width: 16, height: 16, fontSize: "8px", fontWeight: 700, bgcolor: avStyle.bg, color: avStyle.color }}>
												{getInitials(name)}
											</Avatar>
										}
										mono
									>
										{q}
									</Pill>
								);
							})}
						</Box>
					</Box>

					{/* 3. Tags & Category */}
					<Box>
						<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 0.5 }}>
							<Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#15803D" }}>
								#tag — Category & Tag
							</Typography>
							<Typography sx={{ fontSize: "0.68rem", color: "#6B778C" }}>
								Exact tag filter
							</Typography>
						</Box>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
							{["#urgent", "#billing", "#bug"].map((tag) => (
								<Pill
									key={tag}
									active={currentQuery === tag}
									applied={appliedQuery === tag}
									onClick={() => handleApply(tag)}
									mono
								>
									{tag}
								</Pill>
							))}
						</Box>
					</Box>

					{/* 4. Ticket # / Text */}
					<Box>
						<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 0.5 }}>
							<Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569" }}>
								Ticket # or Text
							</Typography>
							<Typography sx={{ fontSize: "0.68rem", color: "#6B778C" }}>
								Searches everywhere
							</Typography>
						</Box>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
							<Pill
								active={currentQuery === "I40009"}
								applied={appliedQuery === "I40009"}
								onClick={() => handleApply("I40009")}
								mono
							>
								I40009
							</Pill>
							<Pill
								active={currentQuery === "login error"}
								applied={appliedQuery === "login error"}
								onClick={() => handleApply("login error")}
							>
								login error
							</Pill>
						</Box>
					</Box>

					{/* 5. Combinations */}
					<Box>
						<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 0.5 }}>
							<Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#7E22CE" }}>
								Combination (Multi-Filter)
							</Typography>
							<Typography sx={{ fontSize: "0.68rem", color: "#6B778C" }}>
								Space-separated (AND)
							</Typography>
						</Box>
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
							{[
								{ q: "@me #urgent", label: "@me #urgent" },
								{ q: "!me error", label: "!me error" },
								{ q: "@harshit @bhavisha", label: "@harshit @bhavisha" },
							].map((combo) => (
								<Pill
									key={combo.q}
									active={currentQuery === combo.q}
									applied={appliedQuery === combo.q}
									onClick={() => handleApply(combo.q)}
									mono
								>
									{combo.label}
								</Pill>
							))}
						</Box>
					</Box>
				</Box>

				{/* Ultra Compact Footer */}
				<Box
					sx={{
						px: 1.5,
						py: 0.75,
						borderTop: "1px solid #EBECF0",
						backgroundColor: "#FAFBFC",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography sx={{ fontSize: "0.68rem", color: "#6B778C" }}>
						Click any pill to search
					</Typography>
					{currentQuery && (
						<Typography
							onClick={() => handleApply("")}
							sx={{
								fontSize: "0.68rem",
								color: "#DE350B",
								fontWeight: 600,
								cursor: "pointer",
								"&:hover": { textDecoration: "underline" },
							}}
						>
							Clear Search
						</Typography>
					)}
				</Box>
			</Popover>
		</>
	);
};

export default React.memo(SearchHelperPopover);
