import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../Delivery&Training/context/AuthProvider";
import { DeliveryProvider } from "../Delivery&Training/context/DeliveryProvider";
import { registerAuthServiceWorker } from "../../utils/registerAuthServiceWorker";
import Index from "./index";
import PointToDiscussProvider from "./context/usePointToDiscuss";
import WithNotificationDT from "../../hoc/withNotificationDT";
import MetaWrapper from "../../meta/MetaWrapper";

export const theme = createTheme({
  palette: {
    mode: "light", // Explicitly set to light mode
    primary: {
      main: "#2563EB",
      light: "#DBEAFE",
      dark: "#1E40AF",
    },
    secondary: {
      main: "#8B5CF6",
      light: "#EDE9FE",
      dark: "#6D28D9",
    },
    success: {
      main: "#10B981",
      light: "#D1FAE5",
      dark: "#059669",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",
      light: "#FEE2E2",
      dark: "#B91C1C",
    },
    info: {
      main: "#3B82F6",
      light: "#DBEAFE",
      dark: "#2563EB",
    },
    background: {
      default: "#FFFFFF", // Clean white background
      paper: "#FFFFFF", // Paper also white or very light gray
    },
    divider: "rgba(0, 0, 0, 0.05)", // Very light dividers
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
        MuiAutocomplete :{
         defaultProps: {
        autoSelect: true,
        autoHighlight: true,
        selectOnFocus: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        containedPrimary: {
          backgroundColor: "#fdee13",
          "&:hover": {
            backgroundColor: "#fdee13",
          },
          color: "black",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)", // Very soft shadow
          border: "1px solid rgba(0, 0, 0, 0.05)",
          padding: 0,
          overflow: "hidden",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        },
      },
    },
  },
});

registerAuthServiceWorker();
const PoinToBeDiscuss = ({ showNotification }) => {
  return (
    <>
    <MetaWrapper page="OrderRequest" />
      <AuthProvider>
        <DeliveryProvider showNotification={showNotification}>
          <PointToDiscussProvider showNotification={showNotification}>
            <ThemeProvider theme={theme}></ThemeProvider>
            <Index showNotification={showNotification} />
          </PointToDiscussProvider>
        </DeliveryProvider>
      </AuthProvider>
    </>
  );
};

export default WithNotificationDT(PoinToBeDiscuss);
