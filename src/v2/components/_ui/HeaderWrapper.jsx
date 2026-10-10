import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import ModernMenu from "./Sidebar/index";
import NewHeader from "./Sidebar/NewHeader";

export const HeaderHeight = 45;
export const MainLayoutheight = `calc(100vh - ${HeaderHeight}px)`;

const HeaderWrapper = ({ children }) => {
  const location = useLocation();
  const allowedPaths = ["/test"];

  const isLoginPage =
    location.pathname.toLowerCase().replace(/\/$/, "") === "/login";

  const isSingleTicketPage =
    location.pathname.toLowerCase().startsWith("/ticket/");

  if (isLoginPage || isSingleTicketPage) {
    return children;
  }

  if (allowedPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: HeaderHeight,
        }}
      >
        <NewHeader />
      </Box>
      <Box
        sx={{
          display: "flex",
          height: MainLayoutheight,
          overflow: "hidden",
          bgcolor: "transparent",
        }}
      >
        <ModernMenu />
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            minWidth: 0,
            border: "1px solid",
            borderColor: "divider",
            borderTopLeftRadius: "5px",
            bgcolor: "transparent",
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default HeaderWrapper;
