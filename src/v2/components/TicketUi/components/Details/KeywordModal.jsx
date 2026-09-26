import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  IconButton,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import ReusableConfirmModal from "../ui/Modal";

const KeywordModal = ({
  tagModalOpen,
  setTagModalOpen,
  tempTags,
  tagInput,
  setTagInput,
  tagError,
  setTagError,
  handleAddTempTag,
  handleRemoveTempTag,
  handleSaveTags,
}) => {
  const [initialTags, setInitialTags] = useState([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Snapshot initial tags when modal opens
  useEffect(() => {
    if (tagModalOpen) {
      setInitialTags([...tempTags]);
      setShowDiscardModal(false);
    }
  }, [tagModalOpen]);

  const hasChanges = useMemo(() => {
    const currentStr = [...tempTags].sort().join("/");
    const initialStr = [...initialTags].sort().join("/");
    return currentStr !== initialStr;
  }, [tempTags, initialTags]);

  const handleRequestClose = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      setTagModalOpen(false);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    setTagModalOpen(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const userOptions = useMemo(() => {
    try {
      const masterData = JSON.parse(sessionStorage.getItem("masterData") || "{}");
      const employees = masterData?.employees || [];
      console.log(employees?.slice(0,5))
      return employees
        .map((item) => item.user)
        .filter((name) => !!name && !tempTags.includes(name));
    } catch (err) {
      console.warn("Error reading masterData from session:", err);
      return [];
    }
  }, [tempTags]);


  const handleOptionSelect = (event, newValue) => {
    if (newValue && typeof newValue === "string") {
      handleAddTempTag(newValue);
      setTagInput("");
      setTagError("");
    }
  };

  return (
    <>
      <Dialog open={tagModalOpen} onClose={handleRequestClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ mb: -2 }}>Add Keywords</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={1} mb={2} mt={2} width="100%">
            <Autocomplete
              fullWidth
              options={userOptions}
              value={null} // force single-use selection
              onChange={handleOptionSelect}
              inputValue={tagInput}
              onInputChange={(_, newInputValue, reason) => {
                if (reason === "input") {
                  setTagInput(newInputValue);
                  setTagError("");
                }
              }}
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.toLowerCase();
                return options.filter((option) =>
                  option.toLowerCase().includes(inputValue)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select keyword"
                  size="small"
                  fullWidth
                  helperText={tagError}
                  error={Boolean(tagError)}
                  placeholder="Search and select from options..."
                />
              )}
            />
            <IconButton 
              onClick={() => {
                if (tagInput && userOptions.includes(tagInput)) {
                  handleAddTempTag(tagInput);
                  setTagInput("");
                } else {
                  setTagError("Select a valid keyword from the list");
                }
              }} 
              color="primary"
              disabled={!tagInput || !userOptions.includes(tagInput)}
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1}>
            {tempTags.length > 0 ? (
              tempTags.map((tag) => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  onDelete={() => handleRemoveTempTag(tag)}
                  sx={{
                    backgroundColor: "#E6F0FF",
                    color: "#0B69FF",
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": {
                      color: "#0B69FF",
                      "&:hover": {
                        color: "#0952CC",
                      },
                    },
                  }}
                />
              ))
            ) : (
              <Box sx={{ color: "#6B778C", fontSize: 14, py: 1 }}>
                No keywords added yet
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleRequestClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTags} 
            variant="contained"
            disabled={tempTags.length === 0}
          >
            Save Keywords
          </Button>
        </DialogActions>
      </Dialog>

      <ReusableConfirmModal
        open={showDiscardModal}
        onClose={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
        type="discardKeywords"
      />
    </>
  );
};

export default KeywordModal;

// import React, { useMemo } from "react";
// import {
//   Box,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Autocomplete,
//   TextField,
//   IconButton,
// } from "@mui/material";
// import { Add as AddIcon } from "@mui/icons-material";

// const KeywordModal = ({
//   tagModalOpen,
//   setTagModalOpen,
//   tempTags,
//   tagInput,
//   setTagInput,
//   tagError,
//   setTagError,
//   handleAddTempTag,
//   handleRemoveTempTag,
//   handleSaveTags,
// }) => {
//   const userOptions = useMemo(() => {
//     try {
//       const masterData = JSON.parse(sessionStorage.getItem("masterData") || "{}");
//       const employees = masterData?.employees || [];
//       return employees
//         .map((item) => item.user)
//         .filter((name) => !!name && !tempTags.includes(name));
//     } catch (err) {
//       console.warn("Error reading masterData from session:", err);
//       return [];
//     }
//   }, [tempTags]);

//   const handleOptionSelect = (event, newValue) => {
//     if (newValue && typeof newValue === 'string' && newValue.trim()) {
//       if (!tempTags.includes(newValue.trim())) {
//         handleAddTempTag(newValue.trim());
//       }
//       setTagInput("");
//       setTagError("");
//     }
//   };

//   return (
//     <Dialog open={tagModalOpen} onClose={() => setTagModalOpen(false)} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ mb: -2 }}>Add Keywords</DialogTitle>
//       <DialogContent>
//         <Box display="flex" alignItems="center" gap={1} mb={2} mt={2} width="100%">
//           <Autocomplete
//             fullWidth
//             freeSolo
//             options={userOptions}
//             inputValue={tagInput}
//             onInputChange={(_, newInputValue, reason) => {
//               if (reason === "input") {
//                 setTagInput(newInputValue);
//                 setTagError("");
//               }
//             }}
//             onChange={handleOptionSelect}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault();
//                 if (tagInput.trim()) {
//                   handleAddTempTag(tagInput.trim());
//                   setTagInput("");
//                 }
//               }
//             }}
//             filterOptions={(options, state) => {
//               const inputValue = state.inputValue.toLowerCase();
//               if (!inputValue) return options;
//               return options.filter((option) =>
//                 option.toLowerCase().includes(inputValue)
//               );
//             }}
//             selectOnFocus
//             clearOnBlur
//             handleHomeEndKeys
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Search or add keyword"
//                 size="small"
//                 fullWidth
//                 helperText={tagError}
//                 error={Boolean(tagError)}
//                 placeholder="Type to search or add new..."
//               />
//             )}
//           />
//           <IconButton 
//             onClick={() => {
//               if (tagInput.trim()) {
//                 handleAddTempTag(tagInput.trim());
//                 setTagInput("");
//               }
//             }} 
//             color="primary"
//             disabled={!tagInput.trim()}
//           >
//             <AddIcon />
//           </IconButton>
//         </Box>

//         <Box display="flex" flexWrap="wrap" gap={1}>
//           {tempTags.length > 0 ? (
//             tempTags.map((tag) => (
//               <Chip 
//                 key={tag} 
//                 label={tag} 
//                 onDelete={() => handleRemoveTempTag(tag)}
//                 sx={{
//                   backgroundColor: "#E6F0FF",
//                   color: "#0B69FF",
//                   fontWeight: 500,
//                   "& .MuiChip-deleteIcon": {
//                     color: "#0B69FF",
//                     "&:hover": {
//                       color: "#0952CC",
//                     },
//                   },
//                 }}
//               />
//             ))
//           ) : (
//             <Box sx={{ color: "#6B778C", fontSize: 14, py: 1 }}>
//               No keywords added yet
//             </Box>
//           )}
//         </Box>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={() => setTagModalOpen(false)} color="inherit">
//           Cancel
//         </Button>
//         <Button 
//           onClick={handleSaveTags} 
//           variant="contained"
//           disabled={tempTags.length === 0}
//         >
//           Save Keywords
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default KeywordModal;
