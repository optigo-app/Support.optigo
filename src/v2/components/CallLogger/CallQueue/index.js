import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  Paper,
  Button,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from "@mui/material";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import InboxIcon from "@mui/icons-material/Inbox"; // For empty state
import { useCallLog } from "../../../context/UseCallLog"; // Adjust path as needed

// --- Helper: Generate Avatar Color from Name ---
function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  if (!name) return { sx: { bgcolor: "#ccc" }, children: "?" };
  const nameParts = name.split(" ");
  const children =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}`;
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 32,
      height: 32,
      fontSize: "0.8rem",
      fontWeight: "bold",
    },
    children: children.toUpperCase(),
  };
}

// --- Main Component ---
const CallQueueUI = ({ onEditCall }) => {
  const { queue } = useCallLog();
  const theme = useTheme();

  const handleCall = (id) => {
    onEditCall(id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "50vh", // Adjusted for better fit
        overflow: "hidden",
       borderRadius: 5,
						backgroundColor: "#F8F9F9",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* --- Sticky Header --- */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.success.main, 0.1),
              display: "flex",
            }}
          >
            <PhoneCallbackRoundedIcon color="success" fontSize="small" />
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Call Queue
          </Typography>
        </Box>
        <Chip
          label={queue?.length || 0}
          size="small"
          color="error"
          sx={{ fontWeight: "bold", height: 20, minWidth: 20 }}
        />
      </Box>

      {/* --- Scrollable List --- */}
      <List
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          py: 1,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.grey[300],
            borderRadius: "4px",
          },
        }}
      >
        {(!queue || queue.length === 0) ? (
          <EmptyState />
        ) : (
          queue.map((call) => (
            <UserRequestCard
              key={call?.id || call?.sr} // Fallback key
              {...call}
              name={call?.callBy || "Unknown"}
              onAccept={() => handleCall(call?.sr)}
            />
          ))
        )}
      </List>
    </Box>
  );
};

// --- Empty State Component ---
const EmptyState = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 6,
      opacity: 0.6,
    }}
  >
    <InboxIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
    <Typography variant="body2" color="text.secondary">
      No calls in queue
    </Typography>
  </Box>
);

// --- Card Component ---
const UserRequestCard = ({ name, appname, company, description, onAccept }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
       borderRadius: 5,
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.2s ease-in-out",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
          borderColor: theme.palette.primary.light,
          "& .accept-btn": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        
        {/* Left: Avatar */}
        <Avatar {...stringAvatar(name)} />

        {/* Middle: Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header Row: Name & Badges */}
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ mr: 0.5 }}>
              {name}
            </Typography>
            
            {company && (
              <Chip
                icon={<BusinessRoundedIcon style={{ fontSize: 10 }} />}
                label={company}
                size="small"
                variant="outlined"
                sx={{ 
                    height: 18, 
                    fontSize: "0.65rem", 
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    "& .MuiChip-icon": { color: theme.palette.primary.main }
                }}
              />
            )}
            {appname && (
              <Chip
                icon={<AppsRoundedIcon style={{ fontSize: 10 }} />}
                label={appname}
                size="small"
                sx={{ 
                    height: 18, 
                    fontSize: "0.65rem", 
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.dark,
                    "& .MuiChip-icon": { color: theme.palette.warning.dark }
                }}
              />
            )}
          </Box>

          {/* Description */}
          <Tooltip title={description || ""} arrow placement="top">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: "0.8rem",
                lineHeight: 1.4,
              }}
            >
              {description || "No description provided."}
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      {/* Action Footer */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="small"
          onClick={onAccept}
          startIcon={<CheckCircleOutlineRoundedIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            px: 2,
            boxShadow: "none",
            bgcolor: theme.palette.success.main,
            "&:hover": {
              bgcolor: theme.palette.success.dark,
              boxShadow: "0 4px 8px rgba(46, 125, 50, 0.2)",
            },
          }}
        >
          Accept Call
        </Button>
      </Box>
    </Paper>
  );
};

export default CallQueueUI;



// const CallQueueUI = ({ onEditCall }) => {
// 	const { queue } = useCallLog();
// 	const handleCall = (id) => {
// 		onEditCall(id);
// 	};
// 	return (
// 		<>
// 			<Typography
// 				variant="h6"
// 				sx={{
// 					display: "flex",
// 					alignItems: "center",
// 					width: "100%",
// 					px: 1.5,
// 					gap: 1,
// 					paddingBottom: "0 !important",
// 					paddingTop: "10px",
// 				}}
// 			>
// 				<PhoneCallbackRoundedIcon color="success" /> Queue
// 			</Typography>
// 			<List
// 				sx={{
// 					width: "100%",
// 					maxHeight: "41.8vh",
// 					overflowY: "auto",
// 					paddingInline: "7px",
// 					borderBottomRightRadius: "20px",
// 					borderBottomLeftRadius: "20px",
// 				}}
// 			>
// 				{queue?.map((call) => (
// 					<div key={call?.id}>
// 						<UserRequestCard appname={call?.appname} company={call?.company} department={call?.department} description={call?.description} name={call?.callBy} onAccept={() => handleCall(call?.sr)} />
// 					</div>
// 				))}
// 			</List>
// 		</>
// 	);
// };

// const UserRequestCard = ({ name, appname, company, description, onAccept }) => {
// 	const [tooltipOpen, setTooltipOpen] = useState(false);
// 	const truncatedDesc = description?.length > 20 ? `${description?.substring(0, 20)}...` : description;
// 	const truncatedAppName = appname?.length > 10 ? `${appname?.substring(0, 10)}...` : appname;

// 	return (
// 		<Paper
// 			elevation={2}
// 			sx={{
// 				p: 2,
// 				borderRadius: 2,
// 				transition: "all 0.2s",
// 				position: "relative",
// 				overflow: "hidden",
// 				"&:hover": {
// 					boxShadow: 3,
// 				},
// 				mb: 1,
// 			}}
// 		>
// 			<Box sx={{ display: "flex", justifyContent: "space-between" }}>
// 				<Stack>
// 					<Box
// 						sx={{
// 							position: "absolute",
// 							top: 0,
// 							left: 0,
// 							display: "flex",
// 							gap: "0.3rem",
// 							mt: 0.4,
// 							ml: 0.7,
// 						}}
// 					>
// 						{company && <Chip label={company} size="small" color="primary" sx={{ fontSize: "0.7rem", height: 17, borderRadius: 1 }} />}
// 						{truncatedAppName && <Chip label={truncatedAppName} size="small" color="warning" sx={{ fontSize: "0.7rem", height: 17, borderRadius: 2 }} />}
// 					</Box>
// 					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
// 						<Typography variant="subtitle1" fontWeight={600}>
// 							{name}
// 						</Typography>
// 						<Tooltip title={description} open={tooltipOpen} onClose={() => setTooltipOpen(false)} onOpen={() => setTooltipOpen(true)} arrow>
// 							<IconButton size="small" onMouseEnter={() => setTooltipOpen(true)} onMouseLeave={() => setTooltipOpen(false)}>
// 								<InfoIcon fontSize="small" color="primary" />
// 							</IconButton>
// 						</Tooltip>
// 					</Box>
// 					{description && (
// 						<Typography variant="body2" color="text.secondary">
// 							{truncatedDesc}
// 						</Typography>
// 					)}
// 				</Stack>

// 				<Button
// 					variant="contained"
// 					size="small"
// 					sx={{
// 						alignSelf: "center",
// 						px: 2,
// 						borderRadius: 1.5,
// 						textTransform: "none",
// 						minWidth: "80px",
// 					}}
// 					color="success"
// 					onClick={onAccept}
// 				>
// 					Accept
// 				</Button>
// 			</Box>
// 		</Paper>
// 	);
// };
