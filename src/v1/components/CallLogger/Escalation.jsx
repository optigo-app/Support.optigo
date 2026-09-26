import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  TextField,
  Box,
  InputAdornment,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import LabelImportantRoundedIcon from "@mui/icons-material/LabelImportantRounded";
import { useCallLog } from "../../context/UseCallLog";
import { useAuth } from "../../context/UseAuth";
import { handleStatusNotification } from "../../utils/callLogUtils";

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const getRandomColor = (name) => {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#14b8a6", // teal
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const EscalationMenu = ({
  anchorEl,
  id,
  setAnchorEl,
  data,
  showNotification,
}) => {
  const [step, setStep] = useState("dept"); // "dept" | "person" | "reason"
  const [searchTerm, setSearchTerm] = useState("");
  const [directSearchTerm, setDirectSearchTerm] = useState("");
  const { user } = useAuth();
  const [forwardSelection, setForwardSelection] = useState({
    designation: null,
    designationId: null,
    person: null,
    userId: null,
  });
  const [pendingSelection, setPendingSelection] = useState(null);

  const { ForwardCall, departmentsNames, CALLFORWARD_REASON_MASTER } =
    useCallLog();

  const departments = departmentsNames || {};

  const handleMenuClose = () => {
    setAnchorEl({ anchor: null, id: null });
    setStep("dept");
    setSearchTerm("");
    setDirectSearchTerm("");
    setPendingSelection(null);
  };

  const handleBack = () => {
    if (step === "reason") {
      if (directSearchTerm) {
        setStep("dept");
      } else {
        setStep("person");
      }
    } else if (step === "person") {
      setStep("dept");
    }
  };

  const handleDeptClick = (dept) => {
    const designationId = departments[dept]?.[0]?.DesignaitonId || null;

    setForwardSelection({
      designation: dept,
      designationId: designationId,
      person: null,
      userId: null,
    });
    setStep("person");
    setSearchTerm("");
  };

  const handlePersonSelect = (designation, person, userId, designationId) => {
    const newSelection = {
      designation,
      designationId,
      person,
      userId,
    };
    setPendingSelection(newSelection);
    setStep("reason");
  };

  const handleReasonSelect = async (reasonId) => {
    if (!pendingSelection) return;
    try {
      setForwardSelection(pendingSelection);
      const { msg } = await ForwardCall(id, {
        deptId: pendingSelection?.designationId,
        empId: pendingSelection?.userId,
        createdBy: user?.id,
        ResonId: reasonId,
      });
      handleStatusNotification(msg, showNotification);
      handleMenuClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (["ArrowDown", "ArrowUp"]?.includes(e?.key)) {
      e.preventDefault();
    }
  };

  const filteredPeople =
    forwardSelection?.designation &&
    departments[forwardSelection?.designation]?.filter((user) =>
      user?.user?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
    );

  const directSearchResults = directSearchTerm
    ? Object.entries(departments)
        ?.flatMap(([dept, people]) =>
          people
            ?.filter((person) =>
              person.user
                .toLowerCase()
                .includes(directSearchTerm.toLowerCase()),
            )
            ?.map((person) => ({
              dept,
              person: person?.user,
              userId: person?.userid,
              designationId: person?.DesignaitonId,
            })),
        )
        ?.slice(0, 10)
    : [];

  // Determine title based on step
  let menuTitle = "Forward Call";
  if (step === "person") {
    menuTitle = forwardSelection.designation || "Select Person";
  } else if (step === "reason") {
    menuTitle = "Select Reason";
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      sx={{ marginTop: 1 }}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
            "& .MuiList-root": {
              padding: 0,
            },
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: "1px solid #f1f5f9",
          bgcolor: "#f8fafc",
        }}
      >
        {step !== "dept" && (
          <IconButton
            size="small"
            onClick={handleBack}
            sx={{ color: "text.secondary" }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        )}
        <Typography
          fontSize="13px"
          fontWeight={600}
          color="text.primary"
          sx={{ flexGrow: 1 }}
        >
          {menuTitle}
        </Typography>
      </Box>

      {/* Search Input (only for dept and person steps) */}
      {step === "dept" && (
        <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search department or person..."
            value={directSearchTerm}
            onChange={(e) => setDirectSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onClick={(e) => e.stopPropagation()}
            InputProps={{
              endAdornment: directSearchTerm && (
                <InputAdornment
                  position="end"
                  onClick={() => setDirectSearchTerm("")}
                  sx={{ cursor: "pointer" }}
                >
                  <ClearRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { fontSize: "13px", borderRadius: "8px" },
            }}
            sx={{
              "& input": {
                fontSize: "13px",
                padding: "6px 8px",
              },
            }}
          />
        </Box>
      )}

      {step === "person" && (
        <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onClick={(e) => e.stopPropagation()}
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment
                  position="end"
                  onClick={() => setSearchTerm("")}
                  sx={{ cursor: "pointer" }}
                >
                  <ClearRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { fontSize: "13px", borderRadius: "8px" },
            }}
            sx={{
              "& input": {
                fontSize: "13px",
                padding: "6px 8px",
              },
            }}
          />
        </Box>
      )}

      {/* Content Areas */}
      {step === "dept" && !directSearchTerm && (
        <Box sx={{ maxHeight: 300, overflowY: "auto", py: 0.5 }}>
          {Object.keys(departments).map((dept) => (
            <MenuItem
              key={dept}
              onClick={() => handleDeptClick(dept)}
              selected={forwardSelection.designation === dept}
              sx={{
                margin: "2px 6px",
                borderRadius: "8px",
                fontSize: "13px",
                py: 0.8,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                }}
              >
                <ApartmentRoundedIcon sx={{ fontSize: 15 }} />
              </Avatar>
              <Typography fontSize="13px" fontWeight={500} color="text.primary">
                {dept}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      )}

      {step === "dept" && directSearchTerm && (
        <Box sx={{ maxHeight: 300, overflowY: "auto", py: 0.5 }}>
          {directSearchResults.length > 0 ? (
            directSearchResults.map(
              ({ dept, person, userId, designationId }) => (
                <MenuItem
                  key={userId}
                  onClick={() =>
                    handlePersonSelect(dept, person, userId, designationId)
                  }
                  sx={{
                    margin: "2px 6px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    py: 0.8,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: "11px",
                      fontWeight: 600,
                      bgcolor: getRandomColor(person),
                      color: "#fff",
                    }}
                  >
                    {getInitials(person)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      fontSize="13px"
                      fontWeight={500}
                      color="text.primary"
                      noWrap
                    >
                      {person}
                    </Typography>
                    <Typography fontSize="10px" color="text.secondary" noWrap>
                      {dept}
                    </Typography>
                  </Box>
                </MenuItem>
              ),
            )
          ) : (
            <MenuItem disabled sx={{ opacity: 0.7, fontSize: "13px", py: 1 }}>
              No matches found
            </MenuItem>
          )}
        </Box>
      )}

      {step === "person" && (
        <Box sx={{ maxHeight: 300, overflowY: "auto", py: 0.5 }}>
          {filteredPeople && filteredPeople.length > 0 ? (
            filteredPeople.map((person) => (
              <MenuItem
                key={person.userid}
                onClick={() =>
                  handlePersonSelect(
                    forwardSelection.designation,
                    person.user,
                    person.userid,
                    person.DesignaitonId,
                  )
                }
                sx={{
                  margin: "2px 6px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  py: 0.8,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: "11px",
                    fontWeight: 600,
                    bgcolor: getRandomColor(person.user),
                    color: "#fff",
                  }}
                >
                  {getInitials(person.user)}
                </Avatar>
                <Typography
                  fontSize="13px"
                  fontWeight={500}
                  color="text.primary"
                  noWrap
                >
                  {person.user}
                </Typography>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled sx={{ opacity: 0.7, fontSize: "13px", py: 1 }}>
              No matches found
            </MenuItem>
          )}
        </Box>
      )}

      {step === "reason" && (
        <Box sx={{ maxHeight: 300, overflowY: "auto", py: 0.5 }}>
          {CALLFORWARD_REASON_MASTER && CALLFORWARD_REASON_MASTER.length > 0 ? (
            CALLFORWARD_REASON_MASTER.map((reason) => (
              <MenuItem
                key={reason.value}
                onClick={() => handleReasonSelect(reason.value)}
                sx={{
                  margin: "2px 6px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  py: 0.8,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    bgcolor: "#eff6ff",
                    color: "#3b82f6",
                  }}
                >
                  <LabelImportantRoundedIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography
                  fontSize="13px"
                  fontWeight={500}
                  color="text.primary"
                  noWrap
                >
                  {reason.label}
                </Typography>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled sx={{ opacity: 0.7, fontSize: "13px", py: 1 }}>
              No reasons found
            </MenuItem>
          )}
        </Box>
      )}
    </Menu>
  );
};

export default EscalationMenu;

// import React, { useState } from "react";
// import { Menu, MenuItem, TextField, Box, InputAdornment, Divider, Typography } from "@mui/material";
// import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
// import { useCallLog } from "../../context/UseCallLog";
// import { useAuth } from "../../context/UseAuth";
// import { handleStatusNotification } from "../../utils/callLogUtils";

// const EscalationMenu = ({ anchorEl, id, setAnchorEl, data, showNotification }) => {
//   const [subAnchorEl, setSubAnchorEl] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [directSearchTerm, setDirectSearchTerm] = useState("");
//   const { user } = useAuth();
//   const [forwardSelection, setForwardSelection] = useState({
//     designation: null,
//     designationId: null,
//     person: null,
//     userId: null,
//   });
//   const [reasonAnchorEl, setReasonAnchorEl] = useState(null);
//   const [pendingSelection, setPendingSelection] = useState(null);

//   const { ForwardCall, departmentsNames, CALLFORWARD_REASON_MASTER } = useCallLog();

//   const departments = departmentsNames || {};

//   const handleMenuClose = () => {
//     setAnchorEl({ anchor: null, id: null });
//     setSubAnchorEl(null);
//     setReasonAnchorEl(null);
//     setSearchTerm("");
//     setDirectSearchTerm("");
//     setPendingSelection(null);
//   };

//   const handleDeptClick = (event, dept) => {
//     const designationId = departments[dept]?.[0]?.DesignaitonId || null;

//     setForwardSelection({
//       designation: dept,
//       designationId: designationId,
//       person: null,
//       userId: null,
//     });
//     setSubAnchorEl(event.currentTarget);
//     setSearchTerm("");
//   };

//   const handlePersonSelect = (event, designation, person, userId, designationId) => {
//     const newSelection = {
//       designation,
//       designationId,
//       person,
//       userId,
//     };
//     setPendingSelection(newSelection);
//     setReasonAnchorEl(event.currentTarget);
//   };

//   const handleReasonSelect = async (reasonId) => {
//     if (!pendingSelection) return;
//     try {
//       setForwardSelection(pendingSelection);
//       const { msg } = await ForwardCall(id, {
//         deptId: pendingSelection?.designationId,
//         empId: pendingSelection?.userId,
//         createdBy: user?.id,
//         ResonId: reasonId,
//       });
//       handleStatusNotification(msg, showNotification);
//       handleMenuClose();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleSearchKeyDown = (e) => {
//     if (["ArrowDown", "ArrowUp"]?.includes(e?.key)) {
//       e.preventDefault();
//     }
//   };

//   const filteredPeople = forwardSelection?.designation && departments[forwardSelection?.designation]?.filter((user) => user?.user?.toLowerCase()?.includes(searchTerm?.toLowerCase()));

//   const directSearchResults = directSearchTerm
//     ? Object.entries(departments)
//         ?.flatMap(([dept, people]) =>
//           people
//             ?.filter((person) => person.user.toLowerCase().includes(directSearchTerm.toLowerCase()))
//             ?.map((person) => ({
//               dept,
//               person: person?.user,
//               userId: person?.userid,
//               designationId: person?.DesignaitonId,
//             }))
//         )
//         ?.slice(0, 10)
//     : [];

//   return (
//     <>
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//         sx={{ marginTop: 1 }}
//         slotProps={{
//           paper: {
//             sx: {
//               "& .MuiList-root": {
//                 paddingBlock: "4px !important",
//               },
//               width: 260,
//             },
//           },
//         }}
//       >
//         <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
//           <TextField
//             fullWidth
//             size="small"
//             placeholder="Search..."
//             value={directSearchTerm}
//             onChange={(e) => setDirectSearchTerm(e.target.value)}
//             onKeyDown={handleSearchKeyDown}
//             onClick={(e) => e.stopPropagation()}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end" onClick={() => setDirectSearchTerm("")}>
//                   <ClearRoundedIcon fontSize="small" />
//                 </InputAdornment>
//               ),
//               sx: { fontSize: "13px" },
//             }}
//             sx={{
//               "& input": {
//                 fontSize: "13px",
//                 padding: "6px 8px",
//               },
//             }}
//           />
//         </Box>

//         {directSearchTerm && (
//           <Box sx={{ px: 1, py: 0.5, maxHeight: 300, overflowY: "auto" }}>
//             {directSearchResults.length > 0 ? (
//               directSearchResults.map(({ dept, person, userId, designationId }, i) => (
//                 <MenuItem
//                   key={`${dept}-${person}-${i}`}
//                   onClick={(e) => handlePersonSelect(e, dept, person, userId, designationId)}
//                   sx={{
//                     fontSize: "13px",
//                     borderRadius: "8px",
//                     px: 1.5,
//                     py: 0.8,
//                   }}
//                 >
//                   <Box>
//                     <Typography fontSize="13px" fontWeight={500}>
//                       {person}
//                     </Typography>
//                     <Typography fontSize="11px" color="text.secondary">
//                       {dept}
//                     </Typography>
//                   </Box>
//                 </MenuItem>
//               ))
//             ) : (
//               <MenuItem disabled sx={{ opacity: 0.7, fontSize: "13px" }}>
//                 No matches found
//               </MenuItem>
//             )}
//             <Divider sx={{ my: 1 }} />
//           </Box>
//         )}

//         {!directSearchTerm && (
//           <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
//             {Object.keys(departments).map((dept) => (
//               <MenuItem
//                 key={dept}
//                 onClick={(e) => handleDeptClick(e, dept)}
//                 selected={forwardSelection.designation === dept}
//                 sx={{
//                   margin: "0px 4px !important",
//                   borderRadius: "8px !important",
//                   fontSize: "13px",
//                   "&:hover": {
//                     backgroundColor: "#f0f0f0 !important",
//                   },
//                 }}
//               >
//                 {dept}
//               </MenuItem>
//             ))}
//           </Box>
//         )}
//       </Menu>

//       <Menu
//         anchorEl={subAnchorEl}
//         open={Boolean(subAnchorEl)}
//         onClose={() => setSubAnchorEl(null)}
//         sx={{ marginTop: 1 }}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//         transformOrigin={{ vertical: "top", horizontal: -6 }}
//         PaperProps={{
//           sx: {
//             width: 240,
//             position: "relative",
//           },
//         }}
//       >
//         <Box
//           sx={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             zIndex: 1,
//             backgroundColor: "white",
//             padding: "8px 12px",
//             borderBottom: "1px solid #ddd",
//           }}
//         >
//           <TextField
//             fullWidth
//             size="small"
//             placeholder="Search person..."
//             variant="outlined"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onKeyDown={handleSearchKeyDown}
//             onClick={(e) => e.stopPropagation()}
//             sx={{
//               "& input": {
//                 fontSize: "13px",
//                 padding: "6px 8px",
//               },
//             }}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment onClick={() => setSearchTerm("")} position="start">
//                   <ClearRoundedIcon />
//                 </InputAdornment>
//               ),
//               sx: {
//                 paddingRight: "0px !important",
//               },
//             }}
//           />
//         </Box>

//         <Box
//           sx={{
//             maxHeight: 300,
//             overflowY: "auto",
//             marginTop: 5.5,
//           }}
//         >
//           {filteredPeople && filteredPeople.length > 0 ? (
//             filteredPeople.map((person, idx) => (
//               <MenuItem
//                 key={idx}
//                 onClick={(e) => handlePersonSelect(e, forwardSelection.designation, person.user, person.userid, person.DesignaitonId)}
//                 sx={{
//                   fontSize: "13px",
//                   borderRadius: "8px !important",
//                   margin: "2px 4px",
//                 }}
//               >
//                 {person.user}
//               </MenuItem>
//             ))
//           ) : (
//             <MenuItem disabled sx={{ opacity: 0.7, fontSize: "15px" }}>
//               No matches found
//             </MenuItem>
//           )}
//         </Box>
//       </Menu>

//       <Menu
//         anchorEl={reasonAnchorEl}
//         open={Boolean(reasonAnchorEl)}
//         onClose={() => setReasonAnchorEl(null)}
//         sx={{ marginTop: 1 }}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//         transformOrigin={{ vertical: "top", horizontal: -6 }}
//         PaperProps={{
//           sx: {
//             width: 220,
//             maxHeight: 300,
//             overflowY: "auto",
//           },
//         }}
//       >
//         <Box sx={{ px: 1.5, py: 0.5 }}>
//           <Typography fontSize="12px" fontWeight={600} color="text.secondary">
//             Select Reason
//           </Typography>
//         </Box>
//         <Divider sx={{ my: 0.5 }} />
//         {CALLFORWARD_REASON_MASTER && CALLFORWARD_REASON_MASTER.length > 0 ? (
//           CALLFORWARD_REASON_MASTER.map((reason) => (
//             <MenuItem
//               key={reason.value}
//               onClick={() => handleReasonSelect(reason.value)}
//               sx={{
//                 fontSize: "13px",
//                 borderRadius: "8px !important",
//                 margin: "2px 4px",
//               }}
//             >
//               {reason.label}
//             </MenuItem>
//           ))
//         ) : (
//           <MenuItem disabled sx={{ opacity: 0.7, fontSize: "13px" }}>
//             No reasons found
//           </MenuItem>
//         )}
//       </Menu>
//     </>
//   );
// };

// export default EscalationMenu;
