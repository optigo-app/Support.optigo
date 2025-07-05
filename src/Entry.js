import React from "react";
import { Routes, Route } from "react-router-dom";
import TicketUi from "./components/TicketUi/components";
import ClientTicketUi from "./components/TicketUi/client";
import HeaderWrapper from "./components/HeaderWrapper";
import CustomerAdd from "./components/_ui/CustomerAdd";
import DeliveryDashboard from "./components/Delivery&Training/components/Delivery/Main";
import TrainingDashboard from "./components/Delivery&Training/components/Training/Main";
import CallLogDashBoard from "./components/CallLogger";
import NotFoundPage from "./components/_ui/NotFound";

const Entry = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <HeaderWrapper handleOpen={handleOpen}>
        <CustomerAdd handleClose={handleClose} open={open} />
        <Routes>
          <Route path="/" element={<CallLogDashBoard />} />
          <Route path="/Ticket" element={<TicketUi />} />
          {/* <Route path="/Ticket/Client" element={<ClientTicketUi />} /> */}
          <Route path="/Delivery" element={<DeliveryDashboard />} />
          <Route path="/Training" element={<TrainingDashboard />} />
          {/* <Route path="/test" element={<SignUp />} /> */}
          {/* <Route path='/customer-info' element={<><CustomerInfo /></>} /> */}
          {/* <Route path='/add-new-customer' element={<><CustomerRegistrationForm/></>} /> */}
          <Route path="*" element={<NotFoundPage />} />
          {/* <Route path='/test-grid' element={<><ReactVirtualizedTable /></>} /> */}
        </Routes>
      </HeaderWrapper>
    </>
  );
};

export default Entry;
