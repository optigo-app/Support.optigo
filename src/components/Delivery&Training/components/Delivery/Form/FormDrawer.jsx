import React, { useCallback, useEffect } from "react";
import { Box, Typography, SwipeableDrawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FormDrawerContent from "./FormDrawerContent";
import { useOrderForm } from "../../../hooks/useOrderForm";
import { usePointForm } from "../../../hooks/usePointDiscuss";
import { useDelivery } from "../../../context/DeliveryProvider";
import { usePointToDiscuss } from "../../../../PointToBeDiscuss/context/usePointToDiscuss";
import MoveDownRoundedIcon from "@mui/icons-material/MoveDownRounded";


const BottomDrawer = ({ title = "Service", isOpen, setIsOpen, ClearEdit, editValue = null, setTempEditMode = () => {}, validateForm = true }) => {
  const isEditMode = Boolean(editValue) || !!editValue;
  const IsMoveToOrder = title === "Move To Order";
  const toggleDrawer = useCallback(
    (open) => (event) => {
      if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
        return;
      }
      setIsOpen(open);
      ClearEdit();
    },
    [setIsOpen]
  );

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
      disableSwipeToOpen={false}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          height: "92vh",
          borderRadius: "0px",
          border: "0px solid",
        },
      }}
      sx={{
        borderRadius: "0px !important",
        border: "0px solid",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderColor: "divider",
            bgcolor: "#eeeeee",
            color: "#333333",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {IsMoveToOrder ? (
              <>
                <>
                  <MoveDownRoundedIcon fontSize="medium" color="warning" />
                  &nbsp; Move To Order
                </>
              </>
            ) : isEditMode ? (
              `Edit ${title} Request`
            ) : (
              `Add ${title} Request`
            )}
          </Typography>
          <IconButton
            onClick={toggleDrawer(false)}
            aria-label="close drawer"
            sx={{
              textTransform: "none",
              backgroundColor: "lightgray",
              color: "#3a3a3a",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {/* <FormDrawerContent IsMoveToOrder={IsMoveToOrder} validateTheForm={validateForm} useDeliveryOrPoint={validateForm ? useOrderForm : usePointForm} useDeliveryOrPointContext={validateForm ? useDelivery : usePointToDiscuss} setTempEditMode={setTempEditMode} editValue={editValue} isEditMode={isEditMode} onClose={() => setIsOpen(false)} /> */}
        <FormDrawerContent IsMoveToOrder={IsMoveToOrder} validateTheForm={validateForm} useDeliveryOrPoint={IsMoveToOrder ? useOrderForm : validateForm ? useOrderForm : usePointForm} useDeliveryOrPointContext={IsMoveToOrder ? useDelivery : validateForm ? useDelivery : usePointToDiscuss} setTempEditMode={setTempEditMode} editValue={editValue} isEditMode={isEditMode} onClose={() => setIsOpen(false)} />
      </Box>
    </SwipeableDrawer>
  );
};

export default BottomDrawer;
