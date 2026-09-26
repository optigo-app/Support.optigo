import { Autocomplete, Badge, Box, Grid, IconButton, TextField, Tooltip, FormHelperText } from "@mui/material";
import React from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useTicket } from "../../../../context/useTicket";
import AttachMentGroup from "../Comment/AttachMentGroup";
import { Dialog, DialogContent, DialogTitle, TextareaAutosize } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import AspectRatioRoundedIcon from "@mui/icons-material/AspectRatioRounded";
import InstructionDialog from "./Dialog";

const Form = ({ form, errors, handleChange, handleFileChange, previewURL, attachment, setOpenPreview }) => {
  const { APPNAME_LIST, COMPANY_LIST, CATEGORY_LIST, USERNAME_LIST, CORPORATE_LOGIN_MASTER } = useTicket();
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);

  const handleOpenInstructionModal = () => setInstructionModalOpen(true);
  const handleCloseInstructionModal = () => setInstructionModalOpen(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setInstructionModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Autocomplete options={COMPANY_LIST} value={COMPANY_LIST.find((item) => item.value === form.projectCode) || null} getOptionLabel={(option) => option.label || ""} onChange={(e, newVal) => handleChange("projectCode", newVal ? newVal.value : null)} autoSelect blurOnSelect handleHomeEndKeys renderInput={(params) => <TextField {...params} label="Company Code" required error={Boolean(errors.projectCode)} helperText={errors.projectCode ? "Company Code is required" : ""} />} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete options={CORPORATE_LOGIN_MASTER(form?.projectCode)} value={CORPORATE_LOGIN_MASTER(form?.projectCode).find((item) => item?.value === form?.userName) || null} getOptionLabel={(option) => option.label || ""} onChange={(e, newVal) => handleChange("userName", newVal ? newVal.value : null)} autoSelect blurOnSelect renderInput={(params) => <TextField {...params} label="User Name" required error={Boolean(errors.userName)} helperText={errors.userName ? "User Name is required" : ""} />} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete options={CATEGORY_LIST} value={CATEGORY_LIST.find((item) => item.value === form.category) || null} getOptionLabel={(option) => option.label || ""} onChange={(e, newVal) => handleChange("category", newVal ? newVal.value : null)} autoSelect blurOnSelect renderInput={(params) => <TextField {...params} label="Category" required error={Boolean(errors.category)} helperText={errors.category ? "Category is required" : ""} />} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete options={APPNAME_LIST} value={APPNAME_LIST.find((item) => item.value === form.appname) || null} getOptionLabel={(option) => option.label || ""} onChange={(e, newVal) => handleChange("appname", newVal ? newVal.value : null)} autoSelect blurOnSelect renderInput={(params) => <TextField {...params} label="Appname" required error={Boolean(errors.appname)} helperText={errors.appname ? "Appname is required" : ""} />} />
        </Grid>

        <Grid item xs={12}>
          <TextField label="Subject" fullWidth required variant="outlined" error={Boolean(errors.subject)} helperText={errors.subject ? "Subject is required" : ""} value={form.subject} onChange={(e) => handleChange("subject", e.target.value)} />
        </Grid>

        <Grid item xs={12} sx={{ position: "relative" }}>
          <TextField label="Special Instruction" fullWidth multiline minRows={4} variant="outlined" value={form.instruction} error={Boolean(errors.instruction)} helperText={errors.instruction ? "Special Instruction is required" : ""} onChange={(e) => handleChange("instruction", e.target.value)} />
          <IconButton
            onClick={handleOpenInstructionModal}
            sx={{
              position: "absolute",
              top: 10,
              right: -8,
              backgroundColor: "white",
              zIndex: 2,
            }}
            size="small"
          >
            <AspectRatioRoundedIcon fontSize="small" />
          </IconButton>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              mt: -1,
              ml: -0.5,
            }}
          >
            <input type="file" multiple style={{ display: "none" }} id="file-upload" onChange={handleFileChange} />
            <label
              htmlFor="file-upload"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Tooltip title="Attach file">
                <IconButton component="span">
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
            </label>
            <AttachMentGroup attachmentsList={attachment} setOpenPreview={setOpenPreview} />

            {form.attachment && <FormHelperText>{form.attachment.name}</FormHelperText>}
          </Box>
        </Grid>
      </Grid>

      <InstructionDialog instructionModalOpen={instructionModalOpen} handleCloseInstructionModal={handleCloseInstructionModal} form={form} handleChange={handleChange} />
    </Box>
  );
};

export default Form;
