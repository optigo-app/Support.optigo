import React, { useState } from "react";
import { Box, Button, Chip, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
import { PlusCircle, X } from "lucide-react";
import Grid from "@mui/material/Grid";
import CustomTextField, { FieldLabel } from "./ui/Customfield";
import { companyOptions, TicketuserNames } from "../../libs/data";

export default function CustomerInfo() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [keywords, setKeywords] = useState(["Marketing", "Ecommerce", "SaaS", "Enterprise", "Startup"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [status, setStatus] = useState("New");
  const [appName, setAppName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const handleAddKeyword = () => {
    if (newKeyword.trim() !== "") {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToDelete));
  };

  const handleInputChange = (event) => setNewKeyword(event.target.value);
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddKeyword();
      event.preventDefault();
    }
  };

  const statusOptions = [
    { value: "New", label: "New" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  const appOptions = [
    { value: "App1", label: "App1" },
    { value: "App2", label: "App2" },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        padding: theme.spacing(2),
        width: isMobile ? "100%" : isTablet ? "80%" : "60%",
        maxWidth: "800px",
        // margin: "0 auto",
        borderRadius: "0",
        position: "absolute",
        top: 0,
        bottom: 0,
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{
          mb: 4,
          fontWeight: 600,
          color: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
          paddingBottom: 2,
        }}
      >
        Customer Information
      </Typography>

      <Box sx={{}}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <CustomTextField label="Company Name" autocomplete={true} options={companyOptions} value={companyName} onChange={(e) => setCompanyName(e.target.value)} freeSolo={true} placeholder="Company name" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField label="Owner Name" autocomplete={true} options={TicketuserNames} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} freeSolo={true} placeholder="Owner name" fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomTextField label="STATUS" select value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField label="APPNAME" select value={appName} onChange={(e) => setAppName(e.target.value)} options={appOptions} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField label="Flow Details" multiline rows={3} placeholder="Detailed description..." fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomTextField label="Business Type" select value={status} options={statusOptions} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField label="Signup Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
            mt: 2,
          }}
        >
          <FieldLabel>Advance Page</FieldLabel>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlusCircle size={16} />}
            onClick={() => setIsInputVisible(!isInputVisible)}
            sx={{
              borderRadius: "4px",
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Add
          </Button>
        </Box>

        {isInputVisible && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <CustomTextField placeholder="New Keyword" value={newKeyword} onChange={handleInputChange} onKeyPress={handleKeyPress} fullWidth size="small" />
            <Button
              variant="contained"
              onClick={handleAddKeyword}
              sx={{
                minWidth: isMobile ? "100%" : "auto",
                borderRadius: "4px",
                boxShadow: "none",
                height: "40px",
              }}
            >
              Add
            </Button>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mt: 1,
          }}
        >
          {keywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              onDelete={() => handleDeleteKeyword(keyword)}
              deleteIcon={<X size={16} />}
              variant="outlined"
              sx={{
                bgcolor: "#f5f5f5",
                color: "#333",
                borderRadius: "4px",
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{}}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomTextField label="Package Info" fullWidth />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField label="Add-ons" fullWidth />
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12}>
            <CustomTextField label="Special Flow" multiline rows={3} placeholder="Detailed description..." fullWidth />
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          position: "absolute",
          bottom: 16,
          right: 16,
        }}
      >
        <Button
          variant="outlined"
          sx={{
            borderRadius: "4px",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            borderRadius: "4px",
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
}
