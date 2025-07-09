import { Box, Typography, Select, MenuItem, Chip, TextField, CircularProgress, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { FormatTime } from "../../../../libs/formatTime";
import { useTicket } from "../../../../context/useTicket";
import KeywordModal from "./KeywordModal";
import AddIcon from "@mui/icons-material/Add";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
const DetailSideBar = ({ ticket, IsClosed }) => {
	const { updateTicket, APPNAME_LIST, CATEGORY_LIST, STATUS_LIST, PRIORITY_LIST, loading } = useTicket();
	const [ticketState, setTicketState] = useState({
		Status: ticket?.Status || "",
		category: ticket?.category || "",
		Priority: ticket?.Priority || "",
		PromiseDate: ticket?.PromiseDate || "",
		sendMail: ticket?.sendMail === true ? "YES" : "NO",
		FollowUp: ticket?.FollowUp || "Follow Up 1",
		tags: ticket?.keywords ? ticket?.keywords?.split("/") || [] : [],
		appname: ticket?.appname || "",
	});

	const [tagModalOpen, setTagModalOpen] = useState(false);
	const [tempTags, setTempTags] = useState([]);
	const [tagInput, setTagInput] = useState("");
	const [tagError, setTagError] = useState("");

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
		// Define your mapping logic here - example only
		const statusMap = { Open: "1", "In Progress": "2", Closed: "3" };
		return statusMap[label] || label;
	}

	function getValueFromAppname(label) {
		// Define your mapping logic here - example only
		const appMap = { "App 1": "app1", "App 2": "app2" };
		return appMap[label] || label;
	}

	function getValueFromCategory(label) {
		// Define your mapping logic here - example only
		const categoryMap = { Bug: "1", Feature: "2", Support: "3" };
		return categoryMap[label] || label;
	}

	function getValueFromPriority(label) {
		// Define your mapping logic here - example only
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

	// Sync component state with ticket prop
	useEffect(() => {
		setTicketState({
			Status: ticket?.Status || "",
			category: ticket?.category || "",
			Priority: ticket?.Priority || "",
			PromiseDate: ticket?.PromiseDate || "",
			sendMail: ticket?.sendMail === true ? "YES" : "NO",
			FollowUp: ticket?.FollowUp || "Follow Up 1",
			tags: ticket?.keywords ? ticket?.keywords?.split("/") || [] : [],
			appname: ticket?.appname || "",
		});
	}, [ticket]);

	// Generic field handler - now handles value-label conversion
	const handleChange = (field, options) => (e) => {
		const selectedLabel = e.target.value;
		// Find the corresponding value for the selected label
		const selectedOption = options.find((opt) => opt.label === selectedLabel);
		const value = selectedOption ? selectedOption.value : selectedLabel;

		// Update local state with the label (for display)
		setTicketState((prev) => ({ ...prev, [field]: selectedLabel }));

		// Send the value to the API
		const payload = field === "sendMail" ? { sendMail: value === "YES" } : { [field]: value };
		updateTicket(ticket.TicketNo, payload);
	};

	// TAG modal handlers
	const handleOpenModal = () => {
		setTempTags(ticketState.tags);
		setTagInput("");
		setTagModalOpen(true);
	};

	const handleAddTempTag = () => {
		const trimmed = tagInput.trim();
		if (!trimmed) return setTagError("Tag cannot be empty.");
		if (tempTags.includes(trimmed)) return setTagError(`Tag "${trimmed}" already exists.`);
		setTempTags([...tempTags, trimmed]);
		setTagInput("");
		setTagError("");
	};

	const handleSaveTags = () => {
		const tagString = tempTags.join("/");
		updateTicket(ticket?.TicketNo, { tags: tagString });
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
				cursor: IsClosed ? "not-allowed" : "pointer",
				pointerEvents: IsClosed ? "none" : "auto",
				position: "relative",
			}}
		>
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
			<Typography
				variant="subtitle1"
				sx={{
					fontWeight: "bold",
					color: "#172B4D",
					mb: 1,
					display: "flex",
					alignItems: "center",
					gap: 1,
				}}
			>
				<Info size="20px" /> Ticket Info
			</Typography>
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

// import { Box, Typography, Select, MenuItem, Chip, TextField } from "@mui/material";
// import { useEffect, useState } from "react";
// import { Info } from "lucide-react";
// import { FormatTime } from "../../../../libs/formatTime";
// import { useTicket } from "../../../../context/useTicket";
// import KeywordModal from "./KeywordModal";

// const DetailSideBar = ({ ticket }) => {
//   const { updateTicket, APPNAME_LIST, CATEGORY_LIST, STATUS_LIST, PRIORITY_LIST } = useTicket();

//   // Updated structure to handle value-label pairs
//   const [ticketState, setTicketState] = useState({
//     Status: ticket?.Status || "",
//     category: ticket?.category || "",
//     Priority: ticket?.Priority || "",
//     PromiseDate: ticket?.PromiseDate || "",
//     sendMail: ticket?.sendMail ? "Yes" : "No",
//     FollowUp: ticket?.FollowUp || "Follow Up 1",
//     tags: ticket?.keywords ? ticket?.keywords?.split("/") || [] : [],
//     appname: ticket?.appname || "",
//   });

//   const [tagModalOpen, setTagModalOpen] = useState(false);
//   const [tempTags, setTempTags] = useState([]);
//   const [tagInput, setTagInput] = useState("");
//   const [tagError, setTagError] = useState("");

//   // Convert list options to label-value pair objects
//   // Each field's options are now an array of objects: { label: "Display Text", value: "value_to_save" }
//   const RenderOptions = [
//     { label: "STATUS", field: "Status", options: STATUS_LIST },
//     { label: "APPNAME", field: "appname", options: APPNAME_LIST },
//     {
//       label: "CATEGORY",
//       field: "category",
//       options: CATEGORY_LIST,
//     },
//     { label: "PRIORITY", field: "Priority", options: PRIORITY_LIST },
//     { label: "FOLLOW UP", field: "FollowUp", options: ["Follow Up 1", "Follow Up 2"].map((item) => ({ label: item, value: item })) },
//     {
//       label: "SEND EMAIL",
//       field: "sendMail",
//       options: [
//         { label: "Yes", value: "Yes" },
//         { label: "No", value: "No" },
//       ],
//     },
//   ];
//   function getValueFromStatus(label) {
//     // Define your mapping logic here - example only
//     const statusMap = { Open: "1", "In Progress": "2", Closed: "3" };
//     return statusMap[label] || label;
//   }

//   function getValueFromAppname(label) {
//     // Define your mapping logic here - example only
//     const appMap = { "App 1": "app1", "App 2": "app2" };
//     return appMap[label] || label;
//   }

//   function getValueFromCategory(label) {
//     // Define your mapping logic here - example only
//     const categoryMap = { Bug: "1", Feature: "2", Support: "3" };
//     return categoryMap[label] || label;
//   }

//   function getValueFromPriority(label) {
//     // Define your mapping logic here - example only
//     const priorityMap = { Low: "1", Medium: "2", High: "3", Critical: "4" };
//     return priorityMap[label] || label;
//   }

//   // Find label by value
//   function findLabelByValue(options, value) {
//     const option = options.find((opt) => opt.value === value) || options.find((opt) => opt.label === value);
//     return option ? option.label : value;
//   }

//   // Function to find value by label
//   function findValueByLabel(options, label) {
//     const option = options.find((opt) => opt.label === label);
//     return option ? option.value : label;
//   }

//   // Sync component state with ticket prop
//   useEffect(() => {
//     setTicketState({
//       Status: ticket?.Status || "",
//       category: ticket?.category || "",
//       Priority: ticket?.Priority || "",
//       PromiseDate: ticket?.PromiseDate || "",
//       sendMail: ticket?.sendMail ? "Yes" : "No",
//       FollowUp: ticket?.FollowUp || "Follow Up 1",
//       tags: ticket?.keywords ? ticket?.keywords?.split("/") || [] : [],
//       appname: ticket?.appname || "",
//     });
//   }, [ticket]);

//   // Generic field handler - now handles value-label conversion
//   const handleChange = (field, options) => (e) => {
//     const selectedLabel = e.target.value;
//     // Find the corresponding value for the selected label
//     const selectedOption = options.find((opt) => opt.label === selectedLabel);
//     const value = selectedOption ? selectedOption.value : selectedLabel;

//     // Update local state with the label (for display)
//     setTicketState((prev) => ({ ...prev, [field]: selectedLabel }));

//     // Send the value to the API
//     const payload = field === "sendMail" ? { sendMail: value === "Yes" } : { [field]: value };

//     console.log("🚀 ~ DetailSideBar ~ payload:", payload);
//     updateTicket(ticket.TicketNo, payload);
//   };

//   // TAG modal handlers
//   const handleOpenModal = () => {
//     setTempTags(ticketState.tags);
//     setTagInput("");
//     setTagModalOpen(true);
//   };

//   const handleAddTempTag = () => {
//     const trimmed = tagInput.trim();
//     if (!trimmed) return setTagError("Tag cannot be empty.");
//     if (tempTags.includes(trimmed)) return setTagError(`Tag "${trimmed}" already exists.`);
//     setTempTags([...tempTags, trimmed]);
//     setTagInput("");
//     setTagError("");
//   };

//   const handleSaveTags = () => {
//     const tagString = tempTags.join("/");
//     updateTicket(ticket?.TicketNo, { tags: tagString });
//     setTicketState((prev) => ({ ...prev, tags: tempTags }));
//     setTagModalOpen(false);
//   };

//   const handleRemoveTempTag = (tagToRemove) => setTempTags(tempTags.filter((t) => t !== tagToRemove));

//   const handleTagKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleAddTempTag();
//     }
//   };

//   return (
//     <Box
//       sx={{
//         width: 200,
//         flexGrow: 1,
//         height: "100%",
//         borderLeft: "1px solid #dfe1e6",
//         bgcolor: "#ffffff",
//         p: 2,
//         overflowY: "auto",
//       }}
//     >
//       <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#172B4D", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
//         <Info size="20px" /> Ticket Info
//       </Typography>

//       {/* Render Select Fields */}
//       {RenderOptions?.map(({ label, field, options }) => (
//         <Box sx={{ mb: 1 }} key={field}>
//           <Typography variant="caption" sx={{ color: "#5e6c84" }}>
//             {label}
//           </Typography>
//           <Select
//             size="small"
//             fullWidth
//             variant="standard"
//             value={ticketState[field]} // Display label
//             onChange={handleChange(field, options)}
//             sx={{
//               background: "#fff",
//               borderRadius: 1,
//               fontSize: 14,
//               px: 1,
//               py: 0.5,
//               boxShadow: "inset 0 0 0 1px #dfe1e6",
//             }}
//             MenuProps={{
//               PaperProps: {
//                 style: {
//                   maxHeight: 350,
//                 },
//               },
//             }}
//           >
//             {options.map((opt) => (
//               <MenuItem key={opt.value} value={opt.label}>
//                 {opt.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </Box>
//       ))}

//       {/* PROMISE DATE */}
//       <Box sx={{ mb: 1 }}>
//         <Typography variant="caption" sx={{ color: "#5e6c84" }}>
//           PROMISE DATE
//         </Typography>
//         <TextField
//           type="date"
//           value={ticketState.PromiseDate}
//           onChange={handleChange("PromiseDate", [])}
//           size="small"
//           fullWidth
//           variant="standard"
//           sx={{
//             background: "#fff",
//             borderRadius: 1,
//             fontSize: 14,
//             px: 1,
//             py: 0.5,
//             boxShadow: "inset 0 0 0 1px #dfe1e6",
//           }}
//         />
//       </Box>

//       {/* TAGS & Keywords */}
//       <Box sx={{ mb: 1.5 }}>
//         <Typography variant="caption" sx={{ color: "#5e6c84", mb: 0.5, display: "block" }}>
//           KEYWORDS
//         </Typography>
//         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//           {ticketState?.tags?.map((tag) => (
//             <Chip onClick={handleOpenModal} key={tag} label={tag} size="small" />
//           ))}
//           <Chip label="+ Add Keywords" size="small" onClick={handleOpenModal} sx={{ backgroundColor: "#ebecf0", cursor: "pointer" }} />
//         </Box>
//       </Box>

//       {/* CREATED/UPDATED */}
//       <Box sx={{ mb: 1.5 }}>
//         <Typography variant="caption" sx={{ color: "#5e6c84" }}>
//           CREATED
//         </Typography>
//         <Typography variant="body2">{FormatTime(ticket?.CreatedOn, "datetime")}</Typography>
//         <Typography variant="caption" sx={{ color: "#5e6c84", mt: 1 }}>
//           UPDATED
//         </Typography>
//         <Typography variant="body2">{FormatTime(ticket?.UpdatedAt, "datetime")}</Typography>
//       </Box>
//       {/* MODAL */}
//       <KeywordModal handleAddTempTag={handleAddTempTag} handleRemoveTempTag={handleRemoveTempTag} handleSaveTags={handleSaveTags} handleTagKeyDown={handleTagKeyDown} tagError={tagError} tagInput={tagInput} setTagInput={setTagInput} setTagError={setTagError} setTagModalOpen={setTagModalOpen} tagModalOpen={tagModalOpen} tempTags={tempTags} />
//     </Box>
//   );
// };

// export default DetailSideBar;
