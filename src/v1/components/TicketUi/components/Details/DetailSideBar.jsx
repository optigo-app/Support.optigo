import { Box, Typography, Select, MenuItem, Chip, TextField, CircularProgress, Tooltip, Button } from "@mui/material";
import { useEffect, useMemo, useState, useRef } from "react";
import { Info } from "lucide-react";
import { FormatTime } from "../../../../libs/formatTime";
import { useTicket } from "../../../../context/useTicket";
import KeywordModal from "./KeywordModal";
import AddIcon from "@mui/icons-material/Add";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { FeedbackCardComponent } from "./FeedBack";
import { DataParser } from "../../../../utils/ticketUtils";
import { getDisplayNamesFromKeywords, formatKeywordsPayload } from "../../../../utils/keywordUtils";

const DetailSideBar = ({ ticket, IsClosed }) => {
	const { updateTicket, APPNAME_LIST, CATEGORY_LIST, STATUS_LIST, PRIORITY_LIST, loading, setIsTicketDirty } = useTicket();

	const getInitialState = (t) => {
		const rawKeywords = t?.Keywords || t?.keywords;
		return {
			Status: t?.Status || "",
			category: t?.category || "",
			Priority: t?.Priority || "",
			PromiseDate: t?.PromiseDate || "",
			sendMail: t?.sendMail === true || t?.sendMail === "1" || t?.sendMail === 1 || t?.sendMail === "YES" || t?.sendEmail === 1 || t?.sendEmail === "1" || t?.sendEmail === true ? "YES" : "NO",
			FollowUp: t?.FollowUp || "Follow Up 1",
			tags: rawKeywords ? getDisplayNamesFromKeywords(rawKeywords) : [],
			appname: t?.appname || "",
		};
	};

	const initialState = useMemo(() => getInitialState(ticket), [ticket?.TicketNo, ticket?.Keywords, ticket?.keywords, ticket?.UpdatedAt]);
	const [ticketState, setTicketState] = useState(initialState);
	const [isDirty, setIsDirty] = useState(false);

	const [tagModalOpen, setTagModalOpen] = useState(false);
	const [tempTags, setTempTags] = useState([]);
	const [tagInput, setTagInput] = useState("");
	const [tagError, setTagError] = useState("");

	const checkIsDirty = (current, baseline) => {
		if (!current || !baseline) return false;
		const currentTags = Array.isArray(current.tags) ? current.tags : [];
		const baselineTags = Array.isArray(baseline.tags) ? baseline.tags : [];
		const normalize = (val) => (val === null || val === undefined ? "" : String(val).trim());

		return (
			normalize(current.Status) !== normalize(baseline.Status) ||
			normalize(current.category) !== normalize(baseline.category) ||
			normalize(current.Priority) !== normalize(baseline.Priority) ||
			normalize(current.PromiseDate) !== normalize(baseline.PromiseDate) ||
			normalize(current.sendMail) !== normalize(baseline.sendMail) ||
			normalize(current.FollowUp) !== normalize(baseline.FollowUp) ||
			normalize(current.appname) !== normalize(baseline.appname) ||
			[...currentTags].sort().join("/") !== [...baselineTags].sort().join("/")
		);
	};

	// Reset state when ticket changes
	useEffect(() => {
		setTicketState(initialState);
		setIsDirty(false);
		setIsTicketDirty(false);
	}, [initialState, setIsTicketDirty]);

	// Clean up dirty state on unmount
	useEffect(() => {
		return () => {
			setIsTicketDirty(false);
		};
	}, [setIsTicketDirty]);

	const RenderOptions = [
		{
			label: "STATUS",
			field: "Status",
			options: STATUS_LIST?.map((item) => (typeof item === "object" ? item : { label: item, value: getValueFromStatus(item) })),
		},
		{
			label: "APPNAME",
			field: "appname",
			options: APPNAME_LIST?.map((item) => (typeof item === "object" ? item : { label: item, value: getValueFromAppname(item) })),
		},
		{
			label: "CATEGORY",
			field: "category",
			options: CATEGORY_LIST?.map((item) => (typeof item === "object" ? item : { label: item, value: getValueFromCategory(item) })),
		},
		{
			label: "PRIORITY",
			field: "Priority",
			options: PRIORITY_LIST?.map((item) => (typeof item === "object" ? item : { label: item, value: getValueFromPriority(item) })),
		},
		{
			label: "FOLLOW UP",
			field: "FollowUp",
			options: ["Follow Up 1", "Follow Up 2"].map((item) => ({
				label: item,
				value: item,
			})),
		},
		{
			label: "SEND EMAIL",
			field: "sendMail",
			options: [
				{ label: "YES", value: "YES" },
				{ label: "NO", value: "NO" },
			],
		},
	];

	// Helper functions to convert between labels and values
	function getValueFromStatus(label) {
		const statusMap = { Open: "1", "In Progress": "2", Closed: "3" };
		return statusMap[label] || label;
	}

	function getValueFromAppname(label) {
		const appMap = { "App 1": "app1", "App 2": "app2" };
		return appMap[label] || label;
	}

	function getValueFromCategory(label) {
		const categoryMap = { Bug: "1", Feature: "2", Support: "3" };
		return categoryMap[label] || label;
	}

	function getValueFromPriority(label) {
		const priorityMap = { Low: "1", Medium: "2", High: "3", Critical: "4" };
		return priorityMap[label] || label;
	}

	// Find label by value
	function findLabelByValue(options, value) {
		const option = options.find((opt) => opt.value === value) || options.find((opt) => opt.label === value);
		return option ? option.label : value;
	}

	// Function to find value by label
	function findValueByLabel(options, label) {
		const option = options.find((opt) => opt.label === label);
		return option ? option.value : label;
	}

	// Generic field handler - robust against events, direct values, and nulls
	const handleChange = (field, options = []) => (e) => {
		const rawValue = e && typeof e === "object" && "target" in e ? e.target.value : e;
		let selectedLabel = rawValue !== undefined && rawValue !== null ? rawValue : "";

		if (field === "sendMail") {
			selectedLabel =
				selectedLabel === "YES" || selectedLabel === 1 || selectedLabel === "1" || selectedLabel === true
					? "YES"
					: "NO";
		} else if (Array.isArray(options) && options.length > 0 && typeof selectedLabel === "string") {
			// If options array is provided, ensure matched label if an id/value was passed
			const matchedOption = options.find((opt) => opt?.value === selectedLabel || opt?.label === selectedLabel);
			if (matchedOption?.label) {
				selectedLabel = matchedOption.label;
			}
		}

		setTicketState((prev) => {
			const nextState = { ...prev, [field]: selectedLabel };
			const dirty = checkIsDirty(nextState, initialState);
			setIsDirty(dirty);
			setIsTicketDirty(dirty);
			return nextState;
		});
	};

	const resetChanges = () => {
		setTicketState(initialState);
		setIsDirty(false);
		setIsTicketDirty(false);
	};

	const handleSaveChanges = () => {
		const payload = {
			Status: findValueByLabel(RenderOptions.find((o) => o.field === "Status")?.options || [], ticketState.Status),
			appname: findValueByLabel(RenderOptions.find((o) => o.field === "appname")?.options || [], ticketState.appname),
			category: findValueByLabel(RenderOptions.find((o) => o.field === "category")?.options || [], ticketState.category),
			Priority: findValueByLabel(RenderOptions.find((o) => o.field === "Priority")?.options || [], ticketState.Priority),
			PromiseDate: ticketState.PromiseDate || "",
			sendMail: ticketState.sendMail === "YES" || ticketState.sendMail === 1 || ticketState.sendMail === "1" || ticketState.sendMail === true ? 1 : 0,
			FollowUp: ticketState.FollowUp || "",
			tags: formatKeywordsPayload(ticketState.tags, undefined, ticket?.Keywords || ticket?.keywords),
		};
		updateTicket(ticket?.TicketNo, payload);
		setIsDirty(false);
		setIsTicketDirty(false);
	};

	// TAG modal handlers
	const handleOpenModal = () => {
		setTempTags(ticketState.tags);
		setTagInput("");
		setTagModalOpen(true);
	};


	const handleAddTempTag = (valueToAdd) => {
		// Use provided value or fall back to tagInput state
		const newTag = (valueToAdd || tagInput).trim();

		if (!newTag) {
			setTagError("Keyword cannot be empty");
			return;
		}

		if (tempTags.includes(newTag)) {
			setTagError("Keyword already exists");
			return;
		}

		setTempTags([...tempTags, newTag]);
		setTagInput(""); // Clear input
		setTagError("");
	};

	const handleSaveTags = () => {
		const keywordPayload = formatKeywordsPayload(tempTags, undefined, ticket?.Keywords || ticket?.keywords);
		updateTicket(ticket?.TicketNo, { tags: keywordPayload });
		setTicketState((prev) => ({ ...prev, tags: tempTags }));
		setTagModalOpen(false);
	};

	const handleRemoveTempTag = (tagToRemove) => setTempTags(tempTags.filter((t) => t !== tagToRemove));

	const handleTagKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddTempTag();
		}
	};

	if (loading) {
		<Loader />;
	}
	const RatingData = useMemo(() => {
		const data = DataParser(ticket?.Rating)?.data || [];
		return data.sort((a, b) => new Date(b.EntryDate) - new Date(a.EntryDate));
	}, [ticket?.Rating]);

	return (
		<Box
			sx={{
				width: 200,
				flexGrow: 1,
				height: "100%",
				bgcolor: "#ffffff",
				overflowY: "auto",
				cursor: IsClosed ? "not-allowed" : "pointer",
				pointerEvents: IsClosed ? "none" : "auto",
				position: "relative",
			}}
		>
			{RatingData?.length > 0 && <Box sx={{
				padding: '8px'
			}} >
				<FeedbackCardComponent
					name={RatingData[0]?.RatingBy}
					rating={RatingData[0]?.RatingValue}
					description={RatingData[0]?.RatingDescription}
					ticketNo={RatingData[0]?.TicketNo}
					RatingDate={RatingData[0]?.EntryDate}
					key={RatingData[0]?.Id + 'rating'}
				/>
			</Box>}
			<Box p={2}>
				{IsClosed && (
					<Box
						sx={{
							position: "absolute",
							top: 0,
							bottom: 0,
							left: 0,
							right: 0,
							bgcolor: "rgba(0, 0, 0, 0.01)",
							zIndex: 9999,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Tooltip sx={{ zindex: 99 }} title="This ticket is closed. You cannot edit or update it.">
							<DoNotDisturbIcon color="error" />
						</Tooltip>
					</Box>
				)}
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: "bold",
							color: "#172B4D",
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Info size="20px" /> Ticket Info
					</Typography>
					{isDirty && (
						<Chip
							label="Unsaved"
							size="small"
							color="warning"
							variant="filled"
							sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
						/>
					)}
				</Box>
				{/* Render Select Fields */}
				{RenderOptions?.map(({ label, field, options }) => (
					<Box sx={{ mb: 1 }} key={field}>
						<Typography variant="caption" sx={{ color: "#5e6c84" }}>
							{label}
						</Typography>
						<Select
							size="small"
							fullWidth
							variant="standard"
							value={ticketState[field]} // Display label
							onChange={handleChange(field, options)}
							sx={{
								background: "#fff",
								borderRadius: 1,
								fontSize: 14,
								px: 1,
								py: 0.5,
								boxShadow: "inset 0 0 0 1px #dfe1e6",
							}}
							MenuProps={{
								PaperProps: {
									style: {
										maxHeight: 350,
									},
								},
							}}
						>
							{options.map((opt) => (
								<MenuItem key={opt.value} value={opt.label}>
									{opt.label}
								</MenuItem>
							))}
						</Select>
					</Box>
				))}
				{/* PROMISE DATE */}
				<Box sx={{ mb: 1 }}>
					<Typography variant="caption" sx={{ color: "#5e6c84" }}>
						PROMISE DATE
					</Typography>
					<TextField
						type="date"
						value={ticketState.PromiseDate}
						onChange={handleChange("PromiseDate", [])}
						size="small"
						fullWidth
						variant="standard"
						sx={{
							background: "#fff",
							borderRadius: 1,
							fontSize: 14,
							px: 1,
							py: 0.5,
							boxShadow: "inset 0 0 0 1px #dfe1e6",
						}}
					/>
				</Box>
				{/* TAGS & Keywords */}
				<Box sx={{ mb: 1.5 }}>
					<Typography variant="caption" sx={{ color: "#5e6c84", mb: 0.5, display: "block" }}>
						KEYWORDS
					</Typography>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
						{ticketState?.tags?.map((tag) => (
							<Chip onClick={handleOpenModal} key={tag} label={tag} size="small" />
						))}
						<Chip
							icon={<AddIcon />}
							label="Add"
							size="small"
							onClick={handleOpenModal}
							variant="outlined"
							sx={{
								borderColor: "#bfc9d9",
								color: "#3f51b5",
								backgroundColor: "#fff",
								cursor: "pointer",
								"&:hover": {
									backgroundColor: "#f5f7fa",
								},
							}}
						/>
					</Box>
				</Box>
				{/* CREATED/UPDATED */}
				<Box sx={{ mb: 1.5 }}>
					<Typography variant="caption" sx={{ color: "#5e6c84" }}>
						CREATED
					</Typography>
					<Typography variant="body2">{FormatTime(ticket?.CreatedOn, "datetime")}</Typography>
					<Typography variant="caption" sx={{ color: "#5e6c84", mt: 1 }}>
						UPDATED
					</Typography>
					<Typography variant="body2">{FormatTime(ticket?.UpdatedAt, "datetime")}</Typography>
				</Box>
				{/* MODAL */}
				<KeywordModal
					handleAddTempTag={handleAddTempTag}
					handleRemoveTempTag={handleRemoveTempTag}
					handleSaveTags={handleSaveTags}
					handleTagKeyDown={handleTagKeyDown}
					tagError={tagError}
					tagInput={tagInput}
					setTagInput={setTagInput}
					setTagError={setTagError}
					setTagModalOpen={setTagModalOpen}
					tagModalOpen={tagModalOpen}
					tempTags={tempTags}
				/>
				<Box
					sx={{
						position: "sticky",
						bottom: "-20px",
						right: 0,
						backgroundColor: "#fff",
						zIndex: 100,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						paddingBlock: 2,
						width: "100%",
						gap: 2,
					}}
				>
					<Button onClick={resetChanges} variant="contained" size="small" color="error" fullWidth>
						Reset
					</Button>
					<Button disabled={loading} onClick={handleSaveChanges} endIcon={loading && <CircularProgress size={14} color="inherit" />} variant="contained" size="small" color="primary" fullWidth>
						Save
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default DetailSideBar;

const Loader = () => {
	return (
		<Box
			sx={{
				width: 200,
				flexGrow: 1,
				height: "100%",
				borderLeft: "1px solid #dfe1e6",
				bgcolor: "#ffffff",
				p: 2,
				overflowY: "auto",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<CircularProgress />
		</Box>
	);
};
