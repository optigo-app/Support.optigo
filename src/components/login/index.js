import { useRef, useState, useEffect } from "react";
import {
  Box, Typography, IconButton, Button, TextField, Link, Container,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Paper, Avatar, List, ListItemButton, ListItemText, ListItemAvatar, Divider
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import svg1 from "../../assets/logos/Black_Optigo_R_Logo.svg";
import { BaseAPI } from "../../apis/BaseAPI";
import Cookies from "js-cookie";
import { createJWT } from "../../utils/jwt.js";
import MetaWrapper from "../../meta/MetaWrapper.jsx";
import { useAuth } from "../../context/UseAuth";
import { removeSkeyCookie } from "../../utils/AuthUtils";

const THEME_GREEN = "rgb(253, 238, 19)";
const TEXT_COLOR = "#2d2d2d";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { user, detectedSession } = useAuth();
  
  // Saved accounts management
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("saved_accounts_list") || "[]");
      return Array.isArray(list) ? list.sort((a, b) => b.lastActive - a.lastActive) : [];
    } catch (e) {
      return [];
    }
  });
  const params = new URLSearchParams(window.location.search);
  const isAddAccount =
    params.get("addAccount") === "1" || params.get("add") === "1";

  const [forceShowForm, setForceShowForm] = useState(isAddAccount);
  const [showChooser, setShowChooser] = useState(() => {
    if (isAddAccount) return false;
    return savedAccounts.length > 0 || !!detectedSession;
  });

  useEffect(() => {
    if (detectedSession && !isAddAccount && !forceShowForm) {
      setShowChooser(true);
    }
  }, [detectedSession, isAddAccount, forceShowForm]);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null); // stores { email, companyCode, skey }

  const companyRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validateFields = () => {
    const newErrors = {};
    if (!companyCode) newErrors.companyCode = "Company code is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEnterNext = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault(); // stop form submit
      nextRef?.current?.focus();
    }
  };

  const redirectAndClose = () => {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.location.href = "/";
        window.close();
        return;
      } catch (e) {
        console.warn("Could not reload opener window:", e);
      }
    }
    window.location.href = "/";
  };

  const performLoginApi = async (inputEmail, inputCompanyCode, inputPassword) => {
    setLoading(true);
    try {
      const response = await BaseAPI.login(inputEmail, inputCompanyCode, inputPassword);
      if (response?.Data?.rd?.[0]?.stat_code === 1001) {
        setErrors({ password: response?.Data?.rd?.[0]?.stat_msg });
        return;
      }
      const tokenData = response?.Data?.rd?.[0];
      if (!tokenData) throw new Error("Invalid credentials");
      const jwtToken = await createJWT(tokenData);

      const cookieOptions = { path: "/", sameSite: "Lax" };
      Cookies.set("skey", jwtToken, cookieOptions);
      localStorage.setItem("app_active_skey", jwtToken);
      redirectAndClose();
    } catch (err) {
      setErrors({ password: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateFields()) return;

    // Check if account already exists in saved list
    const existing = savedAccounts.find(
      (acc) =>
        acc.companyCode.toLowerCase() === companyCode.trim().toLowerCase() &&
        acc.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      setDuplicateData({
        email: email.trim(),
        companyCode: companyCode.trim(),
        skey: existing.skey,
      });
      setDuplicateOpen(true);
      return;
    }

    await performLoginApi(email.trim(), companyCode.trim(), password);
  };

  const handleConfirmLoginAgain = async () => {
    setDuplicateOpen(false);
    if (duplicateData) {
      await performLoginApi(duplicateData.email, duplicateData.companyCode, password);
    }
  };

  const handleConfirmUseExisting = () => {
    setDuplicateOpen(false);
    if (duplicateData) {
      const cookieOptions = { path: "/", sameSite: "Lax" };
      Cookies.set("skey", duplicateData.skey, cookieOptions);
      localStorage.setItem("app_active_skey", duplicateData.skey);

      // Update last active
      try {
        const updated = savedAccounts.map(acc =>
          (acc.companyCode.toLowerCase() === duplicateData.companyCode.toLowerCase() &&
            acc.email.toLowerCase() === duplicateData.email.toLowerCase())
            ? { ...acc, lastActive: Date.now() }
            : acc
        );
        localStorage.setItem("saved_accounts_list", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      redirectAndClose();
    }
  };

  const handleSelectAccount = (account) => {
    const cookieOptions = { path: "/", sameSite: "Lax" };
    Cookies.set("skey", account.skey, cookieOptions);
    localStorage.setItem("app_active_skey", account.skey);

    // Update lastActive timestamp
    try {
      const updated = savedAccounts.map(acc =>
        (acc.companyCode.toLowerCase() === account.companyCode.toLowerCase() &&
          acc.email.toLowerCase() === account.email.toLowerCase())
          ? { ...acc, lastActive: Date.now() }
          : acc
      );
      localStorage.setItem("saved_accounts_list", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    redirectAndClose();
  };

  const handleRemoveAccount = (e, account) => {
    e.stopPropagation(); // prevent triggering login select
    const updated = savedAccounts.filter(
      (acc) =>
        !(acc.companyCode.toLowerCase() === account.companyCode.toLowerCase() &&
          acc.email.toLowerCase() === account.email.toLowerCase())
    );
    setSavedAccounts(updated);
    localStorage.setItem("saved_accounts_list", JSON.stringify(updated));

    if (updated.length === 0) {
      setShowChooser(false);
    }
  };

  // Reusable Input Style
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
      borderRadius: "0px",
      "& fieldset": {
        borderColor: "#e0e0e0",
        borderRadius: "0px",
      },
      "&:hover fieldset": {
        borderColor: "#b0b0b0",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#909090",
        borderWidth: "1px",
      },
    },
    "& .MuiInputBase-input": {
      padding: "12px 14px",
      fontSize: "15px",
      borderRadius: "0px",
    },
  };

  const labelStyle = {
    fontSize: "14px",
    color: "#555",
    fontWeight: 500,
    mb: 0.5,
    display: "block",
  };

  // --- RENDERING ACTIVE USER BANNER VIEW --- //
  if (user && !isAddAccount && !forceShowForm) {
    const name = user.firstname && user.lastname 
      ? `${user.firstname} ${user.lastname}` 
      : user.userid || "User";
    const initials = user.firstname && user.lastname
      ? `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
      : "U";

    return (
      <>
        <MetaWrapper page="ChooseAccount" />
        <Box sx={{ minHeight: "100vh", backgroundColor: "#fff !important" }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 4,
              py: 2,
            }}
          >
            <Box component="img" src={svg1} alt="Logo" sx={{ height: 45 }} />
            <Button
              variant="contained"
              disableElevation
              sx={{
                bgcolor: THEME_GREEN,
                color: TEXT_COLOR,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "rgba(250, 237, 51, 1)" },
              }}
            >
              Contact Us
            </Button>
          </Box>

          <Container
            maxWidth="xs"
            sx={{
              pt: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#111", mb: 0.5, fontSize: 19 }}>
              You are logged in
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mb: 4, textAlign: "center" }}>
              Active session detected
            </Typography>

            <Paper
              elevation={0}
              sx={{
                width: "100%",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden",
                p: 3,
                textAlign: "center",
                bgcolor: "#fafafa"
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#2d2d2d",
                  color: THEME_GREEN,
                  fontWeight: 700,
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                  fontSize: "18px"
                }}
              >
                {initials}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#222", mb: 0.5 }}>
                {name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mb: 4 }}>
                {user.userid} {user.designation ? `• ${user.designation}` : ""}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={redirectAndClose}
                sx={{
                  bgcolor: "#2d2d2d",
                  color: "#fff",
                  mb: 2,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "#111" }
                }}
              >
                Go to Dashboard
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setForceShowForm(true)}
                sx={{
                  mb: 2,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  borderRadius: 1,
                  borderColor: "#d1d5db",
                  color: "#374151",
                  "&:hover": { borderColor: "#9ca3af", bgcolor: "#f3f4f6" }
                }}
              >
                + Add another account
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => {
                  localStorage.removeItem("app_active_skey");
                  const KEYS = [
                    "call_recording_time", "current_call_data", "call_is_paused",
                    "call_paused_duration", "call_pause_start_time", "call_sliders_state",
                    "concurrent_call_data", "call_start_timestamp",
                  ];
                  KEYS.forEach((k) => localStorage.removeItem(k));
                  sessionStorage.clear();
                  window.location.reload();
                }}
                sx={{
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  borderRadius: 1,
                }}
              >
                Log Out
              </Button>
            </Paper>

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Link href="#" underline="hover" sx={{ color: "#666", fontSize: "12px", fontWeight: 500 }}>
                If you don’t have an account, please contact the admin.
              </Link>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  // --- RENDERING CHOOSE ACCOUNT VIEW --- //
  if (showChooser && (savedAccounts.length > 0 || !!detectedSession)) {
    return (
      <>
        <MetaWrapper page="ChooseAccount" />
        <Box sx={{ minHeight: "100vh", backgroundColor: "#fff !important" }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 4,
              py: 2,
            }}
          >
            <Box component="img" src={svg1} alt="Logo" sx={{ height: 45 }} />
            <Button
              variant="contained"
              disableElevation
              sx={{
                bgcolor: THEME_GREEN,
                color: TEXT_COLOR,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "rgba(250, 237, 51, 1)" },
              }}
            >
              Contact Us
            </Button>
          </Box>

          <Container
            maxWidth="xs"
            sx={{
              pt: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#111", mb: 0.5, fontSize: 19 }}>
              Choose an account
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mb: 4, textAlign: "center" }}>
              to continue to Support Optigo
            </Typography>

            <Paper
              elevation={0}
              sx={{
                width: "100%",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden",
                bgcolor: "#fafafa",
              }}
            >
              {/* --- DETECTED SESSION CARD --- */}
              {detectedSession && (
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: "1px solid #eee",
                    bgcolor: "rgba(253, 238, 19, 0.08)",
                    position: "relative",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "#887000",
                        bgcolor: "rgba(253, 238, 19, 0.3)",
                        px: 1,
                        py: 0.3,
                        borderRadius: "4px",
                        fontSize: "10px",
                        mx: "auto"
                      }}
                    >
                      Central Session Detected
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#2d2d2d",
                        color: THEME_GREEN,
                        fontWeight: 700,
                        fontSize: "14px",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {(detectedSession.firstname && detectedSession.lastname
                        ? `${detectedSession.firstname[0]}${detectedSession.lastname[0]}`
                        : detectedSession.email[0]
                      ).toUpperCase()}
                    </Avatar>
                    <Box sx={{ textAlign: "left" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "14.5px", color: "#222" }}>
                          {detectedSession.firstname && detectedSession.lastname
                            ? `${detectedSession.firstname} ${detectedSession.lastname}`
                            : detectedSession.email}
                        </Typography>
                        <Box
                          sx={{
                            fontSize: "10px",
                            bgcolor: "#fff",
                            px: 1,
                            py: 0.2,
                            borderRadius: "4px",
                            fontWeight: 700,
                            color: "#555",
                            border: "1px solid #ddd",
                            textTransform: "uppercase"
                          }}
                        >
                          {detectedSession.companyCode}
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#666", fontSize: "12.5px", mt: 0.3 }}>
                        {detectedSession.email} {detectedSession.designation ? `• ${detectedSession.designation}` : ""}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      localStorage.setItem("app_active_skey", detectedSession.skey);
                      redirectAndClose();
                    }}
                    sx={{
                      bgcolor: "#2d2d2d",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 600,
                      py: 1,
                      borderRadius: "6px",
                      "&:hover": { bgcolor: "#111" }
                    }}
                  >
                    Continue to App
                  </Button>
                </Box>
              )}
              {/* --- END DETECTED SESSION CARD --- */}

              <List disablePadding>
                {savedAccounts.map((account, index) => {
                  const name = account.firstname && account.lastname
                    ? `${account.firstname} ${account.lastname}`
                    : account.email;
                  const initials = account.firstname && account.lastname
                    ? `${account.firstname[0]}${account.lastname[0]}`.toUpperCase()
                    : account.email[0].toUpperCase();

                  return (
                    <Box key={`${account.companyCode}-${account.email}`}>
                      {index > 0 && <Divider sx={{ borderColor: "#eee" }} />}
                      <ListItemButton
                        onClick={() => handleSelectAccount(account)}
                        sx={{
                          py: 1.8,
                          px: 2.5,
                          cursor: "pointer",
                          backgroundColor: "#fff",
                          transition: "background-color 0.25s, transform 0.2s",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.015)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: "#2d2d2d",
                              color: THEME_GREEN,
                              fontWeight: 700,
                              fontSize: "14px",
                            }}
                          >
                            {initials}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "14.5px", color: "#222" }}>
                                {name}
                              </Typography>
                              <Box
                                sx={{
                                  fontSize: "10px",
                                  bgcolor: "#f0f0f0",
                                  px: 1,
                                  py: 0.2,
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                  color: "#555",
                                  border: "1px solid #ddd",
                                  textTransform: "uppercase"
                                }}
                              >
                                {account.companyCode}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: "#666", fontSize: "12.5px", mt: 0.3 }}>
                              {account.email} {account.designation ? `• ${account.designation}` : ""}
                            </Typography>
                          }
                        />
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          size="small"
                          onClick={(e) => handleRemoveAccount(e, account)}
                          sx={{
                            ml: 1,
                            color: "#888",
                            transition: "color 0.2s, transform 0.2s",
                            "&:hover": { color: "#d32f2f" },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </ListItemButton>
                    </Box>
                  );
                })}

                <Divider sx={{ borderColor: "#eee" }} />

                <ListItemButton
                  onClick={() => setShowChooser(false)}
                  sx={{
                    py: 2,
                    px: 2.5,
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#f5f5f5", color: "#555" }}>
                      <AddIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600, fontSize: "14.5px", color: "#333" }}>
                        Use another account
                      </Typography>
                    }
                  />
                </ListItemButton>
              </List>
            </Paper>

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Link href="#" underline="hover" sx={{ color: "#666", fontSize: "12px", fontWeight: 500 }}>
                If you don’t have an account, please contact the admin.
              </Link>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  // --- RENDERING CREDENTIALS FORM VIEW --- //
  return (
    <>
      <MetaWrapper page="Login" />

      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff !important" }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 4,
            py: 2,
          }}
        >
          <Box component="img" src={svg1} alt="Logo" sx={{ height: 45 }} />
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: THEME_GREEN,
              color: TEXT_COLOR,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(250, 237, 51, 1)" },
            }}
          >
            Contact Us
          </Button>
        </Box>

        <Container
          maxWidth="xs"
          sx={{
            pt: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#111", mb: 5, fontSize: 19 }}>
            Welcome to Optigo - Please log in
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%", maxWidth: 450 }}>
            {/* Field 1: Company Code */}
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={labelStyle}>
                Company Code
              </Typography>
              <TextField inputRef={companyRef} fullWidth placeholder="Enter company code" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} error={!!errors.companyCode} helperText={errors.companyCode} sx={inputStyles} onKeyDown={(e) => handleEnterNext(e, emailRef)} />
            </Box>

            {/* Field 2: Email */}
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={labelStyle}>
                Email or username
              </Typography>
              <TextField inputRef={emailRef} fullWidth type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} helperText={errors.email} sx={inputStyles} onKeyDown={(e) => handleEnterNext(e, passwordRef)} />
            </Box>

            {/* Field 3: Password */}
            <Box sx={{ mb: 2 }}>
              <Typography component="label" sx={labelStyle}>
                Password
              </Typography>
              <TextField
                inputRef={passwordRef}
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                sx={inputStyles}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin(e);
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small" sx={{ color: "#666" }}>
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  ),
                }}
              />
              {errors?.password && (
                <Typography variant="caption" sx={{ color: "error.main", mt: 0.5, display: "block" }}>
                  {errors?.password?.replace("regex", "")}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                disabled={loading}
                disableElevation
                sx={{
                  bgcolor: THEME_GREEN,
                  color: TEXT_COLOR,
                  fontWeight: 600,
                  py: 1.2,
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "rgba(250, 237, 51, 1)" },
                  "&.Mui-disabled": { bgcolor: "#f0f0f0", color: "#aaa" },
                }}
                fullWidth
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              {savedAccounts.length > 0 && (
                <Button
                  onClick={() => setShowChooser(true)}
                  variant="outlined"
                  sx={{
                    color: "#555",
                    borderColor: "#ddd",
                    fontWeight: 600,
                    py: 1.2,
                    textTransform: "none",
                    fontSize: "15px",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "#fafafa", borderColor: "#bbb" },
                  }}
                  fullWidth
                >
                  Back to saved accounts
                </Button>
              )}
            </Box>

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Link href="#" underline="hover" sx={{ color: "#666", fontSize: "12px", fontWeight: 500 }}>
                If you don’t have an account, please contact the admin.
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Duplicate Account Dialog */}
      <Dialog
        open={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
        aria-labelledby="duplicate-dialog-title"
      >
        <DialogTitle id="duplicate-dialog-title" sx={{ fontWeight: 700, pb: 1 }}>
          Account Already Saved
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#444", fontSize: "14.5px", lineHeight: 1.5 }}>
            An active login session for <strong>{duplicateData?.email}</strong> (Company: <strong>{duplicateData?.companyCode}</strong>) is already stored on this device.
            <br /><br />
            Would you like to log in instantly using the existing saved session, or re-authenticate by logging in again?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDuplicateOpen(false)}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLoginAgain}
            variant="outlined"
            color="primary"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Login Again
          </Button>
          <Button
            onClick={handleConfirmUseExisting}
            variant="contained"
            color="primary"
            autoFocus
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#2d2d2d", color: "#fff", "&:hover": { bgcolor: "#111" } }}
          >
            Use Existing Session
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
