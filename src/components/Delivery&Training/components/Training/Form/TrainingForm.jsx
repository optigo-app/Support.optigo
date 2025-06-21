import React, { useEffect } from "react";
import { TextField, MenuItem, Select, FormControl, InputLabel, Button, Grid, Typography, Box, Paper, useMediaQuery, useTheme, Drawer, IconButton, InputAdornment, FormHelperText } from "@mui/material";
import MUIRichTextEditor from "mui-rte";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import htmlToDraft from "html-to-draftjs";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import { CloseOutlined } from "@mui/icons-material";
import { trainingModes, trainingTypes } from "./../../../constants/constants";
import AutocompleteComponent from "../../shared/ui/Autocomplete";
import { INITIAL_FORM_DATA, useTrainingForm } from "../../../hooks/useTrainingForm";
import { useTraining } from "./../../../context/TrainingProvider";
import useCapsLock from "../../../hooks/experimental/useCapsLock";
import SentimentNeutralRoundedIcon from "@mui/icons-material/SentimentNeutralRounded";
import SentimentVerySatisfiedRoundedIcon from "@mui/icons-material/SentimentVerySatisfiedRounded";

const TrainingForm = ({ open, onClose = () => { }, editValue, onReset, onNotification }) => {
  const { formData, handleSave, setFormData, editorRef, editorState, setEditorState, validateForm, saveEditorContent, handleChange, handleChangeProject, handleChangeTraining, handleEditorChange, errors } = useTrainingForm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { editTraining, COMPANY_MASTER_LIST, EMPLOYEE_LIST } = useTraining();
  const IsCapsLockON = useCapsLock();
  useEffect(() => {
    if (editorState === null) {
      if (formData.details) {
        try {
          const blocksFromHtml = htmlToDraft(formData.details);
          const { contentBlocks, entityMap } = blocksFromHtml;
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
          setEditorState(EditorState.createWithContent(contentState));
        } catch (err) {
          console.log("Error initializing editor content:", err);
          setEditorState(EditorState.createEmpty());
        }
      } else {
        setEditorState(EditorState.createEmpty());
      }
    }
  }, []);

  const RestFun = () => {
    onReset();
    setFormData(INITIAL_FORM_DATA);
    onClose();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editorState) {
        saveEditorContent(editorState);
      }

      const data = { ...formData };

      if (editValue) {
        const isValid = await validateForm();
        if (!isValid) throw new Error("Validation failed.");
        editTraining(editValue?.SessionID, data);
        onNotification("Training Updated Successfully", "success");
        RestFun()
      } else {
        const res = await handleSave(data);
        if (res?.success === true) {
          onNotification("Training Added Successfully", "success");
          RestFun()
          return;
        } else {
          onNotification(res?.message, "error");
        }
      }


    } catch (error) {
      onNotification(error.message, "error");
    }
  };

  useEffect(() => {
    if (editValue) {
      const companyMatch = COMPANY_MASTER_LIST.find((c) => c?.label?.toLowerCase() === editValue?.Projectcode?.toLowerCase());
      const employeeMatch = EMPLOYEE_LIST.find((e) => e?.label?.toLowerCase() === editValue?.TrainingBy?.toLowerCase());
      setFormData({
        attendees: editValue.Attendees,
        customerType: editValue.CutomerType,
        date: editValue.TrainingDate,
        details: editValue.Details,
        endTime: editValue.EndTime,
        packageInfo: editValue.CutomerPackage,
        projectCode: companyMatch?.value,
        remarks: editValue?.Remark,
        startTime: editValue.StartTime,
        status: editValue.Status,
        ticketNo: editValue.TicketNo,
        trainingBy: employeeMatch?.value,
        trainingMode: editValue.TrainingMode,
        trainingType: editValue.TrainingType,
      });
      try {
        const blocksFromHtml = htmlToDraft(editValue.Details || "");
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState);
      } catch (err) {
        console.error("Error initializing editor:", err);
        setEditorState(EditorState.createEmpty());
      }
    }
  }, [editValue, setFormData, setEditorState]);

  const rteTheme = createTheme({
    typography: {
      fontFamily: '"Poppins", sans-serif',
    },
    components: {
      MUIRichTextEditor: {
        styleOverrides: {
          root: {
            width: "100%",
            fontFamily: '"Poppins", sans-serif',
          },
          editor: {
            overflowY: "auto",
            fontSize: "1em",
            height: `calc(100vh - 210px)`,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#555",
            },
          },
          toolbar: {
            borderBottom: "1px solid #ddd",
            paddingBottom: "6px",
            backgroundColor: "#fff",
            justifyContent: "center",
          },
          editorContainer: {
            padding: "14px",
          },
        },
      },
    },
  });

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={() => onClose()}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      PaperProps={{
        sx: {
          borderRadius: 0,
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: { xs: "block", md: "flex" },
          gap: 4,
          p: { xs: 2, md: 4 },
          bgcolor: "#f9f9f9",
        }}
      >
        <IconButton sx={{ position: "absolute", top: 22, right: 22, bgcolor: "#f9f9f9", zindex: 9999 }}>
          <CloseOutlined onClick={() => onClose()} />
        </IconButton>
        {/* Left - Form */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            p: 3,
            mb: { xs: 4, md: 0 },
            position: "relative",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="700" color="primary" gutterBottom>
              {editValue ? "Edit Training" : "Add New Training Session"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editValue ? "Make changes to the training session below." : "Fill in the details of your training session below."}
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField error={!!errors?.date} helperText={errors?.date} fullWidth label="Date" type="date" name="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>

              {/* Project Code */}
              <Grid item xs={12} sm={6}>
                <AutocompleteComponent error={!!errors.projectCode} helperText={errors.projectCode} label="Project Code" disabled={editValue?.SessionID} options={COMPANY_MASTER_LIST} value={formData.projectCode} onChange={handleChangeProject} />
              </Grid>

              {/* Ticket No */}
              <Grid item xs={12} sm={6}>
                <TextField helperText={errors.ticketNo} error={!!errors.ticketNo} disabled={editValue?.SessionID} fullWidth label="Ticket No" name="ticketNo" value={formData.ticketNo} onChange={handleChange} />
              </Grid>

              {/* Training Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.trainingType}>
                  <InputLabel id="training-type-label">Training Type</InputLabel>
                  <Select labelId="training-type-label" name="trainingType" value={formData.trainingType} label="Training Type" onChange={handleChange}>
                    {trainingTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors?.trainingType && <FormHelperText>{errors.trainingType}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Training Mode */}
              <Grid item xs={12} sm={6}>
                {/* <FormControl fullWidth >
                  <InputLabel id="training-mode-label">Customer Type</InputLabel>
                  <Select readOnly disabled labelId="Customer-type-label" name="customerType" value={formData.customerType} label="Customer Type" onChange={handleChange}>
                    {CustomerTypeList?.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                <TextField fullWidth readOnly disabled labelId="Customer-type-label" name="customerType" value={formData.customerType} label="Customer Type" onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField readOnly disabled fullWidth labelId="packageInfo-label" label="Package Info" name="packageInfo" value={formData.packageInfo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.trainingMode}>
                  <InputLabel id="training-mode-label">Training Mode</InputLabel>
                  <Select labelId="training-mode-label" name="trainingMode" value={formData.trainingMode} label="Training Mode" onChange={handleChange}>
                    {trainingModes.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors?.trainingMode && <FormHelperText>{errors?.trainingMode}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Training By */}
              <Grid item xs={12} sm={6}>
                <AutocompleteComponent error={!!errors?.trainingBy} helperText={errors?.trainingBy} labelId="training-by-label" label="Training By" options={EMPLOYEE_LIST} value={formData.trainingBy} onChange={handleChangeTraining} />
              </Grid>

              {/* Attendees */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{IsCapsLockON ? <SentimentNeutralRoundedIcon color="error" /> : <SentimentVerySatisfiedRoundedIcon color="success" />}</InputAdornment>,
                  }}
                  helperText={errors?.attendees}
                  error={!!errors?.attendees}
                  labelId="Attendees-label"
                  label="Attendees"
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleChange}
                />
              </Grid>

              {/* Start Time */}
              <Grid item xs={12} sm={6}>
                <TextField helperText={errors?.startTime} error={!!errors?.startTime} fullWidth label="Start Time" type="time" name="startTime" value={formData.startTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>

              {/* End Time */}
              <Grid item xs={12} sm={6}>
                <TextField helperText={errors?.endTime} error={!!errors?.endTime} fullWidth label="End Time" type="time" name="endTime" value={formData.endTime} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>

              {editValue?.Remark && (
                <Grid item xs={12}>
                  <TextField fullWidth onChange={handleChange} InputLabelProps={{ shrink: true }} name="remarks" label="Add Remark" placeholder="Write any additional notes or instructions here..." multiline rows={4} value={formData?.remarks} variant="outlined" />
                </Grid>
              )}
            </Grid>
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: 1,
                borderColor: "divider",
                textAlign: "right",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  px: 4,
                  py: 1.2,
                  bgcolor: "#007bff",
                  "&:hover": { bgcolor: "#0056b3" },
                  color: "white",
                }}
              >
                Submit
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Rich Text Editor - Desktop */}
        {!isMobile && (
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              minWidth: "50%",
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="600">
              Details
            </Typography>
            <ThemeProvider theme={rteTheme}>
              <MUIRichTextEditor inlineToolbar label="Write training session details here..." ref={editorRef} onChange={handleEditorChange} defaultValue={editorState && formData.details ? JSON.stringify(convertToRaw(editorState.getCurrentContent())) : null} controls={["title", "bold", "italic", "underline", "strikethrough", "highlight", "undo", "redo", "link", "numberList", "bulletList", "quote", "code", "clear", "media"]} />
            </ThemeProvider>
          </Paper>
        )}

        {/* Rich Text Editor - Mobile */}
        {isMobile && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Details
            </Typography>
            <ThemeProvider theme={rteTheme}>
              <MUIRichTextEditor inlineToolbar label="Write training session details here..." ref={editorRef} onChange={handleEditorChange} defaultValue={editorState && formData.details ? JSON.stringify(convertToRaw(editorState.getCurrentContent())) : null} controls={["title", "bold", "italic", "underline", "strikethrough", "highlight", "undo", "redo", "link", "numberList", "bulletList", "quote", "code", "clear"]} />
            </ThemeProvider>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default TrainingForm;
