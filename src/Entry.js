import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import TicketUi from "./components/TicketUi";
import HeaderWrapper from "./components/_ui/HeaderWrapper";
import NotFoundPage from "./components/_ui/NotFound";
import DeliveryDashboard from "./components/Delivery&Training/components/Delivery/Main";
import TrainingDashboard from "./components/Delivery&Training/components/Training/Main";
import PointToBeDiscuss from "./components/PointToBeDiscuss/Main";
import LoginPage from "./components/login";
import NotificationUI from "./components/_ui/NotificationUI/NotificationUI";
import { NotificationProvider } from "./context/NotificationManager";
import { notify } from "./libs/NOTIFICATION_TEMPLATES";
import AccountCenter from "./components/AccountCenter";
import { isArchiveDomain } from "./utils/AppBasePath";
const CallLogDashBoard = lazy(() => import("./components/CallLogger"));
const ArchivedCallLogPage = lazy(() => import("./components/ArchivedCallLog"));
const NewCallDashBoard = lazy(() => import("./components/NewCall"));

const Entry = () => {
  const isArchiveAllowed = isArchiveDomain();

  return (
    <>
           <NotificationProvider>
        <HeaderWrapper>
          <NotificationUI />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<CallLogDashBoard />} />
            <Route path="/callLog" element={<CallLogDashBoard />} />
            <Route path="/newCall" element={<NewCallDashBoard />} />
            <Route path="/newcall" element={<NewCallDashBoard />} />
            {isArchiveAllowed && (
              <>
                <Route path="/Archive" element={<ArchivedCallLogPage />} />
                <Route path="/archive" element={<ArchivedCallLogPage />} />
              </>
            )}
            {/* <Route path="/test" element={<Page />} /> */}
            <Route path="/Ticket" element={<TicketUi />} />
            <Route path="/Orders" element={<DeliveryDashboard />} />
            <Route path="/Training" element={<TrainingDashboard />} />
            <Route path="/OrderRequest" element={<PointToBeDiscuss />} />
            <Route path="/account" element={<AccountCenter />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HeaderWrapper>
      </NotificationProvider>
    </>
  );
};

export default Entry;
