import React, { useMemo, useState } from "react";
import { Box, Typography, Paper, Grid, Button, IconButton, Tooltip } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Autocomplete, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { FormSection, SectionTitle, StyledTextField } from "../../shared/styles/MuiStyle";
import { EditIcon } from "lucide-react";

function AssignmentForm({ handleTab, registerField, validateTheForm, employeeData, assignments = [], onAddAssignment, onUpdateAssignment, onRemoveAssignment, error }) {
  const [newAssignment, setNewAssignment] = useState({
    department: null,
    user: null,
    userId: null,
    estimate: { hours: "" },
    description: "",
  });
  // Single Autocomplete value object
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Build flat options list from grouped employeeData
  // Each option: { label, value, Designation } — same shape as EMPLOYEE_LIST
  const allEmployeeOptions = useMemo(() => {
    if (!employeeData) return [];
    return Object.entries(employeeData).flatMap(([designation, members]) =>
      (members || []).map((emp) => ({
        ...emp,
        Designation: emp.Designation || designation,
      }))
    );
  }, [employeeData]);

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    if (person) {
      setNewAssignment((prev) => ({
        ...prev,
        department: person.Designation || person.department,
        user: person.label || person.user,
        userId: person.value || person.userId,
        estimate: prev.estimate?.hours !== undefined && prev.estimate?.hours !== "" ? prev.estimate : { hours: "" },
      }));
      setFormErrors((prev) => ({ ...prev, user: "", department: "" }));
    } else {
      setNewAssignment((prev) => ({
        ...prev,
        department: null,
        user: null,
        userId: null,
        estimate: { hours: "" },
      }));
    }
  };

  const handleEstimateChange = (e) => {
    let val = e.target.value;

    // If starts with '.', prepend '0' -> '0.'
    if (val === ".") {
      val = "0.";
    }

    // Allow empty string or valid decimal numbers (digits and at most one decimal point)
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setNewAssignment((prev) => ({
        ...prev,
        estimate: { hours: val },
      }));

      if (val !== "" && !isNaN(Number(val)) && Number(val) > 0) {
        setFormErrors((prev) => ({ ...prev, estimate: "" }));
      }
    }
  };

  const validateAssignmentForm = () => {
    const errors = {};
    if (!newAssignment.user) {
      errors.user = "Please select a person to assign";
    }
    const hours = newAssignment.estimate?.hours;
    if (hours === "" || hours === null || hours === undefined) {
      errors.estimate = "Estimated hours is required";
    } else if (isNaN(Number(hours)) || Number(hours) <= 0) {
      errors.estimate = "Hours must be a positive number";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAssignment = () => {
    if (validateAssignmentForm()) {
      const parsedHours = parseFloat(newAssignment.estimate.hours);
      const formattedAssignment = {
        department: newAssignment.department,
        user: newAssignment.user,
        userId: newAssignment.userId,
        estimate: { hours: isNaN(parsedHours) ? 0 : parsedHours },
        description: newAssignment.description,
      };
      if (isEditing && editingIndex !== null) {
        onUpdateAssignment(editingIndex, formattedAssignment);
      } else {
        onAddAssignment(formattedAssignment);
      }
      // Reset
      setNewAssignment({ department: null, user: null, userId: null, estimate: { hours: "" }, description: "" });
      setSelectedPerson(null);
      setIsEditing(false);
      setEditingIndex(null);
      setFormErrors({});
    }
  };

  const handleEditAssignment = (index) => {
    const assignmentToEdit = assignments[index];
    if (!assignmentToEdit) return;

    // Find the matching option in allEmployeeOptions to restore the single Autocomplete
    const matchedPerson = allEmployeeOptions.find(
      (emp) =>
        (emp.value && assignmentToEdit.userId && String(emp.value) === String(assignmentToEdit.userId)) ||
        (emp.label && assignmentToEdit.user && emp.label.toLowerCase() === assignmentToEdit.user.toLowerCase()) ||
        (emp.User && assignmentToEdit.user && emp.User.toLowerCase() === assignmentToEdit.user.toLowerCase())
    ) || null;

    setSelectedPerson(
      matchedPerson || {
        label: assignmentToEdit.user?.name || assignmentToEdit.user || "",
        value: assignmentToEdit.userId || "",
        Designation: assignmentToEdit.department?.name || assignmentToEdit.department || "",
      }
    );

    const estHours =
      assignmentToEdit.estimate?.hours !== undefined && assignmentToEdit.estimate?.hours !== null
        ? String(assignmentToEdit.estimate.hours)
        : assignmentToEdit.EstimatedHours !== undefined && assignmentToEdit.EstimatedHours !== null
        ? String(assignmentToEdit.EstimatedHours)
        : typeof assignmentToEdit.estimate === "number" || typeof assignmentToEdit.estimate === "string"
        ? String(assignmentToEdit.estimate)
        : "";

    setNewAssignment({
      department: assignmentToEdit.department?.name || assignmentToEdit.department || matchedPerson?.Designation || "",
      user: assignmentToEdit.user?.name || assignmentToEdit.user || matchedPerson?.label || "",
      userId: assignmentToEdit.userId || matchedPerson?.value || null,
      estimate: { hours: estHours },
      description: assignmentToEdit.description || "",
    });
    setEditingIndex(index);
    setIsEditing(true);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setNewAssignment({ department: null, user: null, userId: null, estimate: { hours: "" }, description: "" });
    setSelectedPerson(null);
    setIsEditing(false);
    setEditingIndex(null);
    setFormErrors({});
  };

  return (
    <FormSection>
      <SectionTitle>
        <PeopleAltIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight={500} color="primary.dark">
          Assignments
        </Typography>
      </SectionTitle>

      <Grid container spacing={3}>
        {/* Left Column - Assignment Form */}
        <Grid item xs={12} md={6}>
          <Box
            elevation={0}
            sx={{
              height: "100%",
            }}
          >
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {isEditing && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    backgroundColor: "#e3f2fd",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="primary" fontWeight={500}>
                    Editing Assignment #{editingIndex + 1}
                  </Typography>
                </Box>
              )}

              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  {/* Single combined Autocomplete — search by designation OR person name */}
                  <Grid item xs={12} md={8}>
                    <Tooltip title="Search by designation or person name" arrow placement="top-start">
                      <input
                        ref={registerField}
                        data-tabindex={15}
                        onKeyDown={(e) => handleTab(e, 15)}
                        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
                      />
                      <Autocomplete
                        options={allEmployeeOptions}
                        groupBy={(option) => option.Designation}
                        getOptionLabel={(option) => option?.label || ""}
                        isOptionEqualToValue={(option, val) => option?.value === val?.value}
                        value={selectedPerson}
                        onChange={(_, val) => handlePersonSelect(val)}
                        filterOptions={(options, { inputValue }) => {
                          const q = (inputValue || "").toLowerCase();
                          return options.filter(
                            (o) =>
                              o.label?.toLowerCase().includes(q) ||
                              o.Designation?.toLowerCase().includes(q)
                          );
                        }}
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Assign To (Designation / Person)"
                            fullWidth
                            required
                            size="small"
                            error={!!formErrors.user}
                            helperText={
                              formErrors.user ||
                              (newAssignment.department
                                ? `Dept: ${newAssignment.department}`
                                : "Search by name or designation")
                            }
                          />
                        )}
                        renderGroup={(params) => (
                          <li key={params.key}>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                color: "primary.dark",
                                bgcolor: "grey.100",
                                textTransform: "uppercase",
                              }}
                            >
                              {params.group}
                            </Box>
                            <ul style={{ padding: 0, margin: 0 }}>{params.children}</ul>
                          </li>
                        )}
                      />
                    </Tooltip>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Tooltip title="Estimated time for completing the task" arrow placement="top-start">
                      <StyledTextField
                        inputRef={registerField}
                        inputProps={{
                          "data-tabindex": 17,
                          inputMode: "decimal",
                          autoComplete: "off",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            handleTab(e, 17);
                            return;
                          }
                          if (["-", "+", "e", "E"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        label="Estimated Hours"
                        value={newAssignment.estimate?.hours ?? ""}
                        onChange={handleEstimateChange}
                        fullWidth
                        required
                        size="small"
                        type="text"
                        error={!!formErrors.estimate}
                        disabled={!newAssignment.user}
                        helperText={formErrors.estimate || "Hours required"}
                      />
                    </Tooltip>
                  </Grid>

                  {/* <Grid item xs={12} md={12}>
                      <Tooltip title="Add a detailed description of the task" arrow placement="top-start">
                        <StyledTextField
                          label="Description"
                          multiline
                          rows={4}
                          value={newAssignment.description}
                          onChange={(e) => handleChange("description", e.target.value)}
                          fullWidth
                          required
                          size="small"
                          error={!!formErrors.description}
                          disabled={!newAssignment.department || !newAssignment.user}
                          helperText={formErrors.description || "Brief description of the task"}
                        />
                      </Tooltip>
                    </Grid> */}
                </Grid>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 1,
                }}
              >
                <Tooltip title={isEditing ? "Update Assignment" : "Add Assignment"} arrow>
                  <Button
                    disabled={!newAssignment.user}
                    variant="contained"
                    color="primary"
                    onClick={handleAddAssignment}
                    startIcon={isEditing ? <EditIcon sx={{ color: "#fff" }} /> : <AddIcon sx={{ color: "#fff" }} />}
                    sx={{
                      px: 3,
                      backgroundColor: "#0d47a1",
                      color: "#fff",
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: "none",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#0d47a1",
                      },
                    }}
                  >
                    {isEditing ? "Update Assignment" : "Add Assignment"}
                  </Button>
                </Tooltip>

                {isEditing && (
                  <Tooltip title="Cancel Edit" arrow>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancelEdit}
                      sx={{
                        px: 3,
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                    >
                      Cancel
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </CardContent>
          </Box>
        </Grid>

        {/* Right Column - Assignments Table */}
        <Grid item xs={10} md={6}>
          {error && (
            <Typography color="error" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}
          {assignments.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 150,
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                overflow: "auto",
              }}
            >
              <Table size="small" stickyHeader aria-label="assignments table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Estimated Time (hrs)</TableCell>
                    {/* <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Description</TableCell> */}
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "grey.200" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        transition: "background-color 0.2s ease",
                        backgroundColor: editingIndex === index ? "#e3f2fd" : "inherit",
                      }}
                    >
                      <TableCell>{assignment.user?.name || assignment.user || "-"}</TableCell>
                      <TableCell>{assignment.department?.name || assignment.department || "-"}</TableCell>
                      <TableCell>
                        {assignment.estimate?.hours !== undefined && assignment.estimate?.hours !== null
                          ? assignment.estimate.hours
                          : assignment.EstimatedHours !== undefined && assignment.EstimatedHours !== null
                          ? assignment.EstimatedHours
                          : typeof assignment.estimate === "number" || typeof assignment.estimate === "string"
                          ? assignment.estimate
                          : "-"}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Edit Assignment" arrow>
                          <IconButton onClick={() => handleEditAssignment(index)} color="primary" size="small" sx={{ mr: 1 }} disabled={isEditing && editingIndex !== index}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Assignment" arrow>
                          <IconButton onClick={() => onRemoveAssignment(index)} color="error" size="small" disabled={isEditing}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                border: "1px dashed",
                borderColor: "grey.300",
                bgcolor: "background.paper",
                p: 2,
              }}
            >
              <Typography color="text.secondary" sx={{ textAlign: "center" }}>
                No assignments added yet.
                <br />
                Add your first assignment using the form.
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </FormSection>
  );
}

export default AssignmentForm;





















































// function AssignmentForm({ employeeData, assignments = [], onAddAssignment, onUpdateAssignment, onRemoveAssignment, error }) {
//   const [newAssignment, setNewAssignment] = useState({
//     department: null,
//     user: null,
//     userId: null,
//     estimate: { hours: "" },
//     description: "",
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [filteredUsers, setFilteredUsers] = useState([]);

//   const getEmployeesByDesignation = (designation) => {
//     return employeeData[designation] || [];
//   };

//   const DepartmentOptions = employeeData && Object?.keys(employeeData);

//   const handleChange = (field, value) => {
//     if (field === "department") {
//       const filterList = getEmployeesByDesignation(value);
//       setFilteredUsers(filterList);
//       setNewAssignment((prev) => ({
//         ...prev,
//         department: value,
//         user: null,
//         userId: null,
//         estimate: { hours: "" },
//       }));
//     } else if (field === "user") {
//       setNewAssignment((prev) => ({
//         ...prev,
//         user: value?.label,
//         userId: value?.value || null,
//       }));
//     } else {
//       setNewAssignment((prev) => ({
//         ...prev,
//         [field]: value,
//       }));
//     }

//     if (value) {
//       setFormErrors((prev) => ({
//         ...prev,
//         [field]: "",
//       }));
//     }
//   };
//   const handleEstimateChange = (e) => {
//     const hours = e.target.value;
//     setNewAssignment((prev) => ({
//       ...prev,
//       estimate: { hours: hours },
//     }));

//     // Clear error when field is filled
//     if (hours) {
//       setFormErrors((prev) => ({
//         ...prev,
//         estimate: "",
//       }));
//     }
//   };

//   const validateAssignmentForm = () => {
//     const errors = {};

//     if (!newAssignment.department) {
//       errors.department = "Department is required";
//     }

//     if (!newAssignment.user) {
//       errors.user = "User is required";
//     }

//     if (!newAssignment.estimate.hours) {
//       errors.estimate = "Estimated hours is required";
//     } else if (isNaN(newAssignment.estimate.hours) || Number(newAssignment.estimate.hours) <= 0) {
//       errors.estimate = "Hours must be a positive number";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleAddAssignment = () => {
//     if (validateAssignmentForm()) {
//       const formattedAssignment = {
//         department: newAssignment.department,
//         user: newAssignment.user,
//         userId: newAssignment.userId,
//         estimate: {
//           hours: Number(newAssignment.estimate.hours),
//         },
//         description: newAssignment.description,
//       };

//       if (isEditing && editingIndex !== null) {
//         onUpdateAssignment(editingIndex, formattedAssignment);
//       } else {
//         onAddAssignment(formattedAssignment);
//       }

//       // Reset form
//       setNewAssignment({
//         department: null,
//         user: null,
//         userId: null,
//         estimate: { hours: "" },
//         description: "",
//       });

//       setIsEditing(false);
//       setEditingIndex(null);
//       setFormErrors({});
//     }
//   };

//   const handleEditAssignment = (index) => {
//     const assignmentToEdit = assignments[index];
//     const designationName = assignmentToEdit.department;
//     const users = getEmployeesByDesignation(designationName);

//     setFilteredUsers(users);
//     setNewAssignment({
//       department: assignmentToEdit.department,
//       user: assignmentToEdit.user,
//       userId: assignmentToEdit.userId,
//       estimate: {
//         hours: assignmentToEdit.estimate?.hours?.toString() || "",
//       },
//       description: assignmentToEdit.description || "",
//     });
//     setEditingIndex(index);
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     setNewAssignment({
//       department: null,
//       user: null,
//       estimate: { hours: "" },
//       userId: null,
//       description: "",
//     });
//     setIsEditing(false);
//     setEditingIndex(null);
//     setFormErrors({});
//   };

//   return (
//     <FormSection>
//       <SectionTitle>
//         <PeopleAltIcon color="primary" fontSize="small" />
//         <Typography variant="subtitle1" fontWeight={500} color="primary.dark">
//           Assignments
//         </Typography>
//       </SectionTitle>

//       <Grid container spacing={3}>
//         {/* Left Column - Assignment Form */}
//         <Grid item xs={12} md={6}>
//           <Box
//             elevation={0}
//             sx={{
//               height: "100%",
//             }}
//           >
//             <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               {isEditing && (
//                 <Box
//                   sx={{
//                     mb: 2,
//                     p: 1,
//                     backgroundColor: "#e3f2fd",
//                     borderRadius: 1,
//                   }}
//                 >
//                   <Typography variant="body2" color="primary" fontWeight={500}>
//                     Editing Assignment #{editingIndex + 1}
//                   </Typography>
//                 </Box>
//               )}

//               <Box sx={{ flexGrow: 1 }}>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={4}>
//                     <Tooltip title="Select the department for this assignment" arrow placement="top-start">
//                       <Autocomplete autoSelect blurOnSelect options={DepartmentOptions} value={newAssignment?.department} onChange={(e, val) => handleChange("department", val)} renderInput={(params) => <StyledTextField {...params} label="Department" fullWidth required size="small" error={!!formErrors?.department} helperText={formErrors?.department || "Select responsible department"} />} />
//                     </Tooltip>
//                   </Grid>

//                   <Grid item xs={12} md={4}>
//                     <Tooltip title="Choose the team member to assign" arrow placement="top-start">
//                       <Autocomplete autoSelect blurOnSelect disabled={!newAssignment.department} options={filteredUsers} value={newAssignment.user} onChange={(e, val) => handleChange("user", val)} renderInput={(params) => <StyledTextField {...params} label="Assigned To" fullWidth required size="small" error={!!formErrors.user} helperText={formErrors.user || "Select team member"} />} />
//                     </Tooltip>
//                   </Grid>

//                   <Grid item xs={12} md={4}>
//                     <Tooltip title="Estimated time for completing the task" arrow placement="top-start">
//                       <StyledTextField autoSelect blurOnSelect label="Estimated Hours" value={newAssignment.estimate.hours} onChange={handleEstimateChange} fullWidth required size="small" type="number" inputProps={{ min: 1 }} error={!!formErrors.estimate} disabled={!newAssignment.department || !newAssignment.user} helperText={formErrors.estimate || "Hours required"} />
//                     </Tooltip>
//                   </Grid>
//                   {/* <Grid item xs={12} md={12}>
//                       <Tooltip title="Add a detailed description of the task" arrow placement="top-start">
//                         <StyledTextField
//                           label="Description"
//                           multiline
//                           rows={4}
//                           value={newAssignment.description}
//                           onChange={(e) => handleChange("description", e.target.value)}
//                           fullWidth
//                           required
//                           size="small"
//                           error={!!formErrors.description}
//                           disabled={!newAssignment.department || !newAssignment.user}
//                           helperText={formErrors.description || "Brief description of the task"}
//                         />
//                       </Tooltip>
//                     </Grid> */}
//                 </Grid>
//               </Box>

//               <Box
//                 sx={{
//                   mt: 2,
//                   display: "flex",
//                   justifyContent: "flex-start",
//                   gap: 1,
//                 }}
//               >
//                 <Tooltip title={isEditing ? "Update Assignment" : "Add Assignment"} arrow>
//                   <Button
//                     disabled={!newAssignment.department || !newAssignment.user}
//                     variant="contained"
//                     color="primary"
//                     onClick={handleAddAssignment}
//                     startIcon={isEditing ? <EditIcon sx={{ color: "#fff" }} /> : <AddIcon sx={{ color: "#fff" }} />}
//                     sx={{
//                       px: 3,
//                       backgroundColor: "#0d47a1",
//                       color: "#fff",
//                       fontWeight: 600,
//                       borderRadius: 2,
//                       boxShadow: "none",
//                       textTransform: "none",
//                       "&:hover": {
//                         backgroundColor: "#0d47a1",
//                       },
//                     }}
//                   >
//                     {isEditing ? "Update Assignment" : "Add Assignment"}
//                   </Button>
//                 </Tooltip>

//                 {isEditing && (
//                   <Tooltip title="Cancel Edit" arrow>
//                     <Button
//                       variant="outlined"
//                       color="secondary"
//                       onClick={handleCancelEdit}
//                       sx={{
//                         px: 3,
//                         borderRadius: 2,
//                         textTransform: "none",
//                       }}
//                     >
//                       Cancel
//                     </Button>
//                   </Tooltip>
//                 )}
//               </Box>
//             </CardContent>
//           </Box>
//         </Grid>

//         {/* Right Column - Assignments Table */}
//         <Grid item xs={10} md={6}>
//           {error && (
//             <Typography color="error" sx={{ mt: 1, mb: 2 }}>
//               {error}
//             </Typography>
//           )}
//           {assignments.length > 0 ? (
//             <TableContainer
//               component={Paper}
//               sx={{
//                 maxHeight: 150,
//                 borderRadius: "8px",
//                 boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
//                 overflow: "auto",
//               }}
//             >
//               <Table size="small" stickyHeader aria-label="assignments table">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Assigned To</TableCell>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Department</TableCell>
//                     <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Estimated Time (hrs)</TableCell>
//                     {/* <TableCell sx={{ fontWeight: 600, bgcolor: "grey.200" }}>Description</TableCell> */}
//                     <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "grey.200" }}>
//                       Actions
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {assignments.map((assignment, index) => (
//                     <TableRow
//                       key={index}
//                       hover
//                       sx={{
//                         transition: "background-color 0.2s ease",
//                         backgroundColor: editingIndex === index ? "#e3f2fd" : "inherit",
//                       }}
//                     >
//                       <TableCell>{assignment.user?.name || assignment.user || "-"}</TableCell>
//                       <TableCell>{assignment.department?.name || assignment.department || "-"}</TableCell>
//                       <TableCell>{assignment.estimate?.hours || "-"}</TableCell>
//                       {/* <TableCell>
//                           <Tooltip title={assignment.description || "-"} arrow placement="top-start">
//                             <Typography
//                               noWrap
//                               sx={{
//                                 maxWidth: 50,       // adjust as needed
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap',
//                               }}
//                             >
//                               {assignment.description || "-"}
//                             </Typography>
//                           </Tooltip>
//                         </TableCell> */}

//                       <TableCell align="right">
//                         <Tooltip title="Edit Assignment" arrow>
//                           <IconButton onClick={() => handleEditAssignment(index)} color="primary" size="small" sx={{ mr: 1 }} disabled={isEditing && editingIndex !== index}>
//                             <EditIcon fontSize="small" />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Remove Assignment" arrow>
//                           <IconButton onClick={() => onRemoveAssignment(index)} color="error" size="small" disabled={isEditing}>
//                             <DeleteIcon fontSize="small" />
//                           </IconButton>
//                         </Tooltip>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           ) : (
//             <Card
//               variant="outlined"
//               sx={{
//                 height: "100%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 borderRadius: "12px",
//                 border: "1px dashed",
//                 borderColor: "grey.300",
//                 bgcolor: "background.paper",
//                 p: 2,
//               }}
//             >
//               <Typography color="text.secondary" sx={{ textAlign: "center" }}>
//                 No assignments added yet.
//                 <br />
//                 Add your first assignment using the form.
//               </Typography>
//             </Card>
//           )}
//         </Grid>
//       </Grid>
//     </FormSection>
//   );
// }
