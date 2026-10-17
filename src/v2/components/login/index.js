import { useRef, useState, useEffect } from "react";
import {
  Box, Typography, IconButton, Button, TextField, Link, Container,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Paper, Avatar, List, ListItemButton, ListItemText, ListItemAvatar, Divider,
  Checkbox, FormControlLabel
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import svg1 from "../../assets/logos/Black_Optigo_R_Logo.svg";
import { BaseAPI } from "../../apis/BaseAPI";
import { createJWT } from "../../utils/jwt.js";
import MetaWrapper from "../../meta/MetaWrapper.jsx";
import { useAuth } from "../../context/UseAuth";
import { removeSkeyCookie, setActiveAuthSession, getActiveAuthToken, getRememberMe } from "../../utils/AuthUtils";

const AUTH_BACKGROUND = "#fbfaf9";
const AUTH_TEXT = "#191919";
const AUTH_MUTED = "#74716d";
const AUTH_BORDER = "#e7e5e2";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMeState] = useState(() => getRememberMe());
  
  const { user, detectedSession, detectedSessions = [] } = useAuth();
  
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

  const hasDetected = (detectedSessions && detectedSessions.length > 0) || !!detectedSession;

  const [forceShowForm, setForceShowForm] = useState(isAddAccount);
  const [showChooser, setShowChooser] = useState(() => {
    if (isAddAccount) return false;
    return savedAccounts.length > 0 || hasDetected;
  });

  useEffect(() => {
    if (hasDetected && !isAddAccount && !forceShowForm) {
      setShowChooser(true);
    }
  }, [hasDetected, isAddAccount, forceShowForm]);
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
        window.opener.postMessage({
          type: "OPTIGO_ACCOUNT_SESSION_SWITCH",
          token: getActiveAuthToken(),
        }, window.location.origin);
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

      setActiveAuthSession(jwtToken, rememberMe);
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
        (acc.companyCode || "").toLowerCase() === companyCode.trim().toLowerCase() &&
        (acc.email || "").toLowerCase() === email.trim().toLowerCase()
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
      setActiveAuthSession(duplicateData.skey, rememberMe);

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
    setActiveAuthSession(account.skey);

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
      borderRadius: "7px",
      "& fieldset": {
        borderColor: AUTH_BORDER,
        borderRadius: "7px",
      },
      "&:hover fieldset": {
        borderColor: "#b0b0b0",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2876d2",
        borderWidth: "1px",
      },
    },
    "& .MuiInputBase-input": {
      padding: "10px 12px",
      fontSize: "14px",
      borderRadius: "7px",
    },
  };

  const labelStyle = {
    fontSize: "13px",
    color: AUTH_TEXT,
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
        <Box sx={{ minHeight: "100vh", backgroundColor: `${AUTH_BACKGROUND} !important` }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 2.5, sm: 4 },
              py: 1.5,
            }}
          >
            <Box component="img" src={svg1} alt="Logo" sx={{ height: 38 }} />
            <Button
              variant="contained"
              disableElevation
              sx={{
                bgcolor: "transparent",
                color: AUTH_TEXT,
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 1.5,
                px: 1.5,
                minWidth: 0,
                "&:hover": { bgcolor: "#f0efed" },
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
                border: `1px solid ${AUTH_BORDER}`,
                borderRadius: "12px",
                overflow: "hidden",
                p: 2.5,
                textAlign: "center",
                bgcolor: "#fff",
                boxShadow: "0 8px 28px rgba(25, 25, 25, 0.045)",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#f1f0ee",
                  color: AUTH_TEXT,
                  fontWeight: 700,
                  width: 48,
                  height: 48,
                  mx: "auto",
                  mb: 1.5,
                  fontSize: "16px"
                }}
              >
                {initials}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 650, color: AUTH_TEXT, mb: 0.5, fontSize: 19 }}>
                {name}
              </Typography>
              <Typography variant="body2" sx={{ color: AUTH_MUTED, mb: 2.5, fontSize: 13 }}>
                {user.userid} {user.designation ? `• ${user.designation}` : ""}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={redirectAndClose}
                sx={{
                  bgcolor: "#2876d2",
                  color: "#fff",
                  mb: 1.25,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "7px",
                  "&:hover": { bgcolor: "#1f68bd" }
                }}
              >
                Go to Dashboard
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setForceShowForm(true)}
                sx={{
                  mb: 1.25,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "7px",
                  borderColor: AUTH_BORDER,
                  color: AUTH_TEXT,
                  "&:hover": { borderColor: "#cfccc8", bgcolor: "#f7f6f4" }
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
                  localStorage.removeItem("app_direct_credentials");
                  localStorage.removeItem("app_current_user");
                  const KEYS = [
                    "call_recording_time", "current_call_data", "call_is_paused",
                    "call_paused_duration", "call_pause_start_time", "call_sliders_state",
                    "concurrent_call_data", "call_start_timestamp",
                  ];
                  KEYS.forEach((k) => localStorage.removeItem(k));
                  sessionStorage.clear();
                  removeSkeyCookie();
                  window.location.reload();
                }}
                sx={{
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "7px",
                }}
              >
                Log Out
              </Button>
            </Paper>

            <Box sx={{ textAlign: "center", mt: 2.5 }}>
              <Link href="#" underline="hover" sx={{ color: AUTH_MUTED, fontSize: "11.5px", fontWeight: 400 }}>
                If you don’t have an account, please contact the admin.
              </Link>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  // --- RENDERING CHOOSE ACCOUNT VIEW --- //
  if (showChooser && (savedAccounts.length > 0 || hasDetected)) {
    const sessionsToDisplay =
      detectedSessions && detectedSessions.length > 0
        ? detectedSessions
        : detectedSession
        ? [detectedSession]
        : [];

    // Merge saved app logins and shared-cookie suggestions into one list.
    const accountChoices = [];
    savedAccounts.forEach((account) => {
      const email = (account.email || "").trim().toLowerCase();
      const company = (account.companyCode || "").trim().toLowerCase();
      const duplicate = accountChoices.find((saved) => {
        if (account.skey && saved.skey === account.skey) return true;
        return email && email === (saved.email || "").trim().toLowerCase() &&
          company === (saved.companyCode || "").trim().toLowerCase();
      });
      if (!duplicate) accountChoices.push({ ...account, isSaved: true });
    });
    sessionsToDisplay.forEach((session) => {
      const email = (session.email || "").trim().toLowerCase();
      const company = (session.companyCode || "").trim().toLowerCase();
      const match = accountChoices.find((account) => {
        if (account.skey && account.skey === session.skey) return true;
        const savedEmail = (account.email || "").trim().toLowerCase();
        const savedCompany = (account.companyCode || "").trim().toLowerCase();
        return email && savedEmail === email && (!company || !savedCompany || savedCompany === company);
      });
      if (match) {
        match.detectedSession = session;
        match.skey = session.skey || match.skey;
        match.firstname = match.firstname || session.firstname;
        match.lastname = match.lastname || session.lastname;
        match.designation = match.designation || session.designation;
        match.companyCode = match.companyCode || session.companyCode;
      } else {
        accountChoices.push({ ...session, isSaved: false, detectedSession: session });
      }
    });

    const handleChooseDetectedSession = (session) => {
      setActiveAuthSession(session.skey);
      try {
        const savedList = JSON.parse(localStorage.getItem("saved_accounts_list") || "[]");
        const existing = savedList.find((account) =>
          (account.skey && account.skey === session.skey) ||
          ((account.email || "").trim().toLowerCase() === (session.email || "").trim().toLowerCase() &&
            (!session.companyCode || !account.companyCode || String(account.companyCode).toLowerCase() === String(session.companyCode).toLowerCase()))
        );
        const newAccount = {
          companyCode: session.companyCode || existing?.companyCode || "",
          email: session.email || "",
          skey: session.skey,
          firstname: session.firstname || existing?.firstname || "",
          lastname: session.lastname || existing?.lastname || "",
          designation: session.designation || existing?.designation || "",
          lastActive: Date.now(),
        };
        const filtered = savedList.filter(
          (acc) =>
            !(
              (acc.companyCode || "").toLowerCase() === (newAccount.companyCode || "").toLowerCase() &&
              (acc.email || "").toLowerCase() === (newAccount.email || "").toLowerCase()
            )
        );
        filtered.push(newAccount);
        localStorage.setItem("saved_accounts_list", JSON.stringify(filtered));
      } catch (e) {
        console.error("Failed to update saved accounts on detected selection:", e);
      }
      redirectAndClose();
    };

    return (
      <>
        <MetaWrapper page="ChooseAccount" />
        <Box sx={{ minHeight: "100vh", backgroundColor: `${AUTH_BACKGROUND} !important` }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 2.5, sm: 4 },
              py: 1.5,
            }}
          >
            <Box component="img" src={svg1} alt="Logo" sx={{ height: 38 }} />
            <Button
              variant="contained"
              disableElevation
              sx={{
                bgcolor: "transparent",
                color: AUTH_TEXT,
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 1.5,
                px: 1.5,
                minWidth: 0,
                "&:hover": { bgcolor: "#f0efed" },
              }}
            >
              Contact Us
            </Button>
          </Box>

          <Container
            maxWidth="xs"
            sx={{
              pt: { xs: 5, sm: 7 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 650, color: AUTH_TEXT, mb: 0.5, fontSize: 25, letterSpacing: "-0.04em" }}>
              Choose an account
            </Typography>
            <Typography variant="body2" sx={{ color: AUTH_MUTED, mb: 2.5, textAlign: "center", fontSize: 13 }}>
              to continue to Support Optigo
            </Typography>

            <Paper
              elevation={0}
              sx={{
                width: "100%",
                border: `1px solid ${AUTH_BORDER}`,
                borderRadius: "12px",
                overflow: "hidden",
                bgcolor: "#fff",
                boxShadow: "0 8px 28px rgba(25, 25, 25, 0.045)",
              }}
            >

              <List disablePadding>
                {accountChoices.map((account, index) => {
                  const name = account.firstname && account.lastname
                    ? `${account.firstname} ${account.lastname}`
                    : account.email;
                  const initials = account.firstname && account.lastname
                    ? `${account.firstname[0]}${account.lastname[0]}`.toUpperCase()
                    : (account.email?.[0] || account.firstname?.[0] || "U").toUpperCase();

                  return (
                    <Box key={`${account.companyCode || "unknown"}-${account.email || account.skey || index}`}>
                      {index > 0 && <Divider sx={{ borderColor: "#eee" }} />}
                      <ListItemButton
                        onClick={() => account.detectedSession
                          ? handleChooseDetectedSession(account.detectedSession)
                          : handleSelectAccount(account)}
                        sx={{
                          py: 1.1,
                          px: 1.75,
                          cursor: "pointer",
                          backgroundColor: "#fff",
                          transition: "background-color 0.18s ease",
                          "&:hover": {
                            backgroundColor: "#f7f6f4",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: "#f1f0ee",
                              color: AUTH_TEXT,
                              fontWeight: 700,
                              fontSize: "13px",
                              width: 38,
                              height: 38,
                            }}
                          >
                            {initials}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "13.5px", color: AUTH_TEXT }}>
                                {name}
                              </Typography>
                              <Box
                                sx={{
                                  fontSize: "10px",
                                  bgcolor: "#f5f4f2",
                                  px: 0.75,
                                  py: 0.2,
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                  color: "#686560",
                                  border: `1px solid ${AUTH_BORDER}`,
                                  textTransform: "uppercase"
                                }}
                              >
                                {account.companyCode || "Account"}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: AUTH_MUTED, fontSize: "12px", mt: 0.15 }}>
                              {account.email} {account.designation ? `• ${account.designation}` : ""}
                            </Typography>
                          }
                        />
                        {account.isSaved && <IconButton
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
                        </IconButton>}
                      </ListItemButton>
                    </Box>
                  );
                })}

                <Divider sx={{ borderColor: "#eee" }} />

                <ListItemButton
                  onClick={() => setShowChooser(false)}
                  sx={{
                    py: 1.1,
                    px: 1.75,
                    cursor: "pointer",
                    backgroundColor: "#fff",
                      transition: "background-color 0.18s ease",
                      "&:hover": { backgroundColor: "#f7f6f4" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#f1f0ee", color: AUTH_TEXT, width: 38, height: 38 }}>
                      <AddIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: AUTH_TEXT }}>
                        Use another account
                      </Typography>
                    }
                  />
                </ListItemButton>
              </List>
            </Paper>

            <Box sx={{ textAlign: "center", mt: 2.5 }}>
              <Link href="#" underline="hover" sx={{ color: AUTH_MUTED, fontSize: "11.5px", fontWeight: 400 }}>
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

      <Box sx={{ minHeight: "100vh", backgroundColor: `${AUTH_BACKGROUND} !important` }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2.5, sm: 4 },
            py: 1.5,
          }}
        >
          <Box component="img" src={svg1} alt="Logo" sx={{ height: 38 }} />
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "transparent",
              color: AUTH_TEXT,
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 1.5,
              px: 1.5,
              minWidth: 0,
              "&:hover": { bgcolor: "#f0efed" },
            }}
          >
            Contact Us
          </Button>
        </Box>

        <Container
          maxWidth="xs"
          sx={{
            pt: { xs: 5, sm: 7 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: AUTH_TEXT, mb: 3, fontSize: 30, letterSpacing: "-0.045em" }}>
            Sign in to Optigo
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%", maxWidth: 380 }}>
            {/* Field 1: Company Code */}
            <Box sx={{ mb: 1.5 }}>
              <Typography component="label" sx={labelStyle}>
                Company Code
              </Typography>
              <TextField inputRef={companyRef} fullWidth placeholder="Enter company code" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} error={!!errors.companyCode} helperText={errors.companyCode} sx={inputStyles} onKeyDown={(e) => handleEnterNext(e, emailRef)} />
            </Box>

            {/* Field 2: Email */}
            <Box sx={{ mb: 1.5 }}>
              <Typography component="label" sx={labelStyle}>
                Email or username
              </Typography>
              <TextField inputRef={emailRef} fullWidth type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} helperText={errors.email} sx={inputStyles} onKeyDown={(e) => handleEnterNext(e, passwordRef)} />
            </Box>

            {/* Field 3: Password */}
            <Box sx={{ mb: 1.5 }}>
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

            <FormControlLabel
              id="remember-me"
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMeState(e.target.checked)}
                />
              }
              label="Remember me"
              sx={{ ml: -0.5, "& .MuiTypography-root": { fontSize: "13px", color: AUTH_MUTED } }}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mt: 2 }}>
              <Button
                type="submit"
                disabled={loading}
                disableElevation
                sx={{
                  bgcolor: "#2876d2",
                  color: "#fff",
                  fontWeight: 600,
                  py: 1.05,
                  textTransform: "none",
                  fontSize: "14px",
                  borderRadius: "7px",
                  "&:hover": { bgcolor: "#1f68bd" },
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
                    fontWeight: 600,
                    py: 1.05,
                    textTransform: "none",
                    fontSize: "15px",
                    borderRadius: "7px",
                    borderColor: AUTH_BORDER,
                    color: AUTH_TEXT,
                    "&:hover": { bgcolor: "#fafafa", borderColor: "#bbb" },
                  }}
                  fullWidth
                >
                  Back to saved accounts
                </Button>
              )}
            </Box>

            <Box sx={{ textAlign: "center", mt: 2.5 }}>
              <Link href="#" underline="hover" sx={{ color: AUTH_MUTED, fontSize: "11.5px", fontWeight: 400 }}>
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
