import "./styles/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css/navigation";
import "swiper/css";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Entry from "./Entry";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { registerAuthServiceWorker } from "./utils/registerAuthServiceWorker";
import { Maintheme } from "./libs/DateTheme";
import { AuthProvider } from "./context/UseAuth";
import { TicketProvider } from "./context/useTicket";
import { CallLogProvider } from "./context/UseCallLog";
import "@fontsource/poppins";

registerAuthServiceWorker();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Suspense fallback={<div></div>}>
      <BrowserRouter
        // basename={process.env.NODE_ENV === "production" ? "/calllogweb/" : "/" }
      >
        <AuthProvider>
          <CallLogProvider>
            <TicketProvider>
              <ThemeProvider theme={Maintheme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <CssBaseline />
                  <Entry />
                </LocalizationProvider>
              </ThemeProvider>
            </TicketProvider>
          </CallLogProvider>
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  </>
);
