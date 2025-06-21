import { Autocomplete, Badge, Box, Grid, IconButton, TextField, Tooltip, FormHelperText } from "@mui/material";
import React from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useTicket } from "../../../../context/useTicket";

const Form = ({ form, errors, handleChange, handleFileChange, previewURL, attachment }) => {
  const { APPNAME_LIST, COMPANY_LIST, CATEGORY_LIST, USERNAME_LIST } = useTicket();

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
      <Grid container spacing={3}>
        {/* <Grid item xs={12} sm={6}>
          <Autocomplete
            options={COMPANY_LIST}
            value={COMPANY_LIST.find(item => item.value === form.projectCode) || null}
            getOptionLabel={(option) => option.label || ""}
            onChange={(e, newVal) => handleChange("projectCode", newVal ? newVal.value : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Company Code"
                required
                error={Boolean(errors.projectCode)}
                helperText={errors.projectCode ? "Company Code is required" : ""}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={USERNAME_LIST}
            value={USERNAME_LIST.find(item => item.value === form.userName) || null}
            getOptionLabel={(option) => option.label || ""}
            onChange={(e, newVal) => handleChange("userName", newVal ? newVal.value : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="User Name"
                required
                error={Boolean(errors.userName)}
                helperText={errors.userName ? "User Name is required" : ""}
              />
            )}
          />
        </Grid> */}

        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={CATEGORY_LIST}
            value={CATEGORY_LIST.find(item => item.value === form.category) || null}
            getOptionLabel={(option) => option.label || ""}
            onChange={(e, newVal) => handleChange("category", newVal ? newVal.value : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                required
                error={Boolean(errors.category)}
                helperText={errors.category ? "Category is required" : ""}
              />
            )}
          />
        </Grid>

        {/* <Grid item xs={12} sm={6}>
          <Autocomplete
            options={APPNAME_LIST}
            value={APPNAME_LIST.find(item => item.value === form.appname) || null}
            getOptionLabel={(option) => option.label || ""}
            onChange={(e, newVal) => handleChange("appname", newVal ? newVal.value : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Appname"
                required
                error={Boolean(errors.appname)}
                helperText={errors.appname ? "Appname is required" : ""}
              />
            )}
          />
        </Grid> */}

        <Grid item xs={12} sm={6}>
          <TextField
            label="Subject"
            fullWidth
            required
            variant="outlined"
            error={Boolean(errors.subject)}
            helperText={errors.subject ? "Subject is required" : ""}
            value={form.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Message"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={form.instruction}
            error={Boolean(errors.instruction)}
            helperText={errors.instruction ? "Special Instruction is required" : ""}
            onChange={(e) => handleChange("instruction", e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: -1, ml: -0.5 }}>
            <input
              type="file"
              multiple
              style={{ display: "none" }}
              id="file-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <Tooltip
                sx={{
                  p: "8px 8px",
                }}
                title={
                  previewURL ? (
                    <img
                      src={previewURL}
                      alt="Preview"
                      width={200}
                      height={200}
                      style={{ borderRadius: "5px" }}
                    />
                  ) : (
                    <small>Please Select Image</small>
                  )
                }
                arrow
                placement="top"
              >
                <IconButton component="span">
                  <Badge badgeContent={attachment?.length} color="error">
                    <AttachFileIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              {form.attachment && <FormHelperText>{form.attachment.name}</FormHelperText>}
            </label>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Form;