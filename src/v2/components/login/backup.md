import { useState } from "react";
import { Box, Typography, IconButton, Grid } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffRounded";
import svg1 from "../../assets/logos/Black_Optigo_R_Logo.svg";
import { motion } from "framer-motion";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { CarouselCard, RootContainer, MainCard, LeftPanel, RightPanel, LogoContainer, LogoIcon, WelcomeTitle, WelcomeSubtitle, StyledTextField, SignUpButton } from "./styled";
import img1 from "../../assets/login/Screenshot (127).png";
import training from "../../assets/login/Screenshot (138).png";
import ticket from "../../assets/login/Screenshot (136).png";
import img4 from "../../assets/login/Screenshot (127).png";
import { BaseAPI } from "../../apis/BaseAPI";
import Cookies from "js-cookie";
import { createJWT } from "../../utils/jwt.js";
import { useNavigate } from "react-router-dom";

const carouselItems = [
  {
    title: "Diversity, Equity, and Inclusion Survey",
    subtitle: "Help us make our workplace a safe space for everyone.",
    color: "#4C3DFF",
  },
  {
    title: "Diversity is promoted in leadership roles",
    subtitle: "Encouraging diverse leaders across teams.",
    color: "#FFC700",
  },
  {
    title: "Thank you for your feedback",
    subtitle: "Questions or comments? Email us at hello@company.com",
    color: "#6A1B9A",
  },
];
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@orail.co.in");
  const [companyCode, setCompanyCode] = useState("orail25");
  const [password, setPassword] = useState("pasta");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const HandleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await BaseAPI.login(email, companyCode, password);
      const token = response?.Data?.rd?.[0];
      if (token) {
        const jwtToken = await createJWT(token);
        const domain = window.location.hostname;
        if (domain === "nzen") {
          Cookies.set("csystem_support", jwtToken, {
            path: "/support",
          });
        } else {
          Cookies.set("csystem_support", jwtToken);
        }
        Cookies.set("support_LoggedIn", "true", { sameSite: "Lax" });
        window.location.href = "/";
      } else {
        setLoading(false);
        console.log("Invalid credentials");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootContainer>
      <MainCard>
        <LeftPanel>
          <LogoContainer>
            <LogoIcon src={svg1} />
          </LogoContainer>

          <WelcomeTitle>Get Started</WelcomeTitle>
          <WelcomeSubtitle>Welcome back to Optigo - Please log in</WelcomeSubtitle>

          <Box component="form" onSubmit={HandleLogin}>
            <Typography variant="body2" sx={{ mb: 1, color: "#1a1a1a", fontWeight: 500 }}>
              Company Code
            </Typography>
            <StyledTextField fullWidth value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} placeholder="optigohub" variant="outlined" />

            <Typography variant="body2" sx={{ mb: 1, color: "#1a1a1a", fontWeight: 500 }}>
              Email
            </Typography>
            <StyledTextField fullWidth value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "#1a1a1a", fontWeight: 500 }}>
                Password
              </Typography>
            </Box>
            <StyledTextField
              fullWidth
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />

            <SignUpButton fullWidth variant="contained" type="submit">
              Login
            </SignUpButton>

            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#666666",
              }}
            >
              If you don’t have an account, please contact the admin.
            </Typography>
          </Box>
        </LeftPanel>

        <RightPanel sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#f5f5f5" }}>
          <Grid container spacing={1} sx={{ flexGrow: 1, height: "100%", padding: 1 }}>
            {/* First row */}
            <Grid item xs={8} sx={{ display: "flex", height: "50%" }}>
              <Box sx={{ flexGrow: 1, bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                <LogoIcon
                  src={img1}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={4} sx={{ display: "flex", height: "50%" }}>
              <Box sx={{ flexGrow: 1, bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                <LogoIcon
                  src={training}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </Box>
            </Grid>

            {/* Second row */}
            <Grid item xs={5} sx={{ display: "flex", height: "50%" }}>
              <Box sx={{ flexGrow: 1, display: "flex", height: "100%" }}>
                <Swiper direction="vertical" slidesPerView={1} spaceBetween={16} loop={true} autoplay={{ delay: 3000, disableOnInteraction: false }} modules={[Autoplay]} style={{ width: "100%", height: "100%", borderRadius: 24 }}>
                  {carouselItems.map((item, idx) => (
                    <SwiperSlide key={idx} style={{ height: "100%" }}>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ height: "100%" }}>
                        <CarouselCard sx={{ backgroundColor: item.color, height: "100%", borderRadius: 0 }}>
                          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#fff" }}>
                            {item.subtitle}
                          </Typography>
                        </CarouselCard>
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Box>
            </Grid>

            <Grid item xs={7} sx={{ display: "flex", height: "50%" }}>
              <Box sx={{ flexGrow: 1, bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                <LogoIcon
                  src={ticket}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </RightPanel>
      </MainCard>
    </RootContainer>
  );
}
