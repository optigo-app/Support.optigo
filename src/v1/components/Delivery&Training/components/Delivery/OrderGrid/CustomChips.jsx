import React, { memo, useState, useCallback, useMemo } from "react";
import { Chip, Menu, MenuItem, Tooltip, } from "@mui/material";
import { getServiceType, getApprovalStatus, getPaymentStatus, getDeliveryStatus, getCurrentStatus, getOnDemandType, getPackageMode } from "../../../utils/helpers";
import { ApprovalStatus, mockServiceTypes, mockPaymentStatuses, mockDeliveryStatuses, mockOnDemandTypes, mockPackageModes } from "../../../constants/constants";
import DeliveredModal from "./DeliveredModal";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddMasterStatusDialog from "./AddMasterStatus";
import { usePointToDiscuss } from "../../../../PointToBeDiscuss/context/usePointToDiscuss";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import ReusableConfirmModal from "../../../../TicketUi/components/ui/Modal";

const GenericStatusChip = memo(
  ({ value, onSelect, rowData, getDisplayData, options, isClient, showAddBtn, DontOpen = false }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [openDeliveredModal, setOpenDeliveredModal] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { DeletePointMaster } = usePointToDiscuss();
    const [OpendeleteConfirm, setOpendeleteConfirm] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);


    const currentOption = useMemo(() => {
      return options?.find((opt) => opt?.value === value) || options[0];
    }, [options, value]);

    const displayData = useMemo(() => {
      return getDisplayData(currentOption?.value);
    }, [getDisplayData, currentOption?.value]);

    const { label: currentLabel, color, bgColor, textColor } = displayData;

    const handleClick = useCallback((event) => {
      setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
      setAnchorEl(null);
    }, []);

    const HandleDeleteStatus = useCallback(async () => {
      if (!OpendeleteConfirm) return;
      await DeletePointMaster({ CurrentStatus: OpendeleteConfirm });
      handleClose();
      setOpendeleteConfirm(null);
    }, [OpendeleteConfirm, DeletePointMaster, handleClose]);

    const handleSelect = useCallback(
      (newValue, e) => {
        e.stopPropagation();
        if (onSelect) {
          const field = rowData?.field;
          if (field === "Status" && newValue === "Delivered") {
            setOpenDeliveredModal(true);
            setSelectedTicket(rowData?.row);
          } else {
            onSelect(rowData?.row?.SrNo, { [field]: newValue });
          }
        }
        handleClose();
      },
      [onSelect, rowData?.field, rowData?.row, handleClose]
    );

    const chipStyle = useMemo(
      () => ({
        cursor: isClient ? "default" : "pointer",
        pointerEvents: isClient ? "auto" : "auto",
        opacity: isClient ? 1 : 1,
        "&.Mui-disabled": {
          opacity: 1,
          pointerEvents: "auto",
          cursor: "default",
        },
        bgcolor: value ? bgColor : "",
        color: value ? textColor : "",
      }),
      [isClient, value, bgColor, textColor]
    );

    const handleDeliveredModalClose = useCallback(() => {
      setOpenDeliveredModal(false);
      setSelectedTicket(null); // reset ticket
    }, []);

    return (
      <>
        {!DontOpen && openDeliveredModal && (
          <DeliveredModal
            key={`delivered_${selectedTicket.SrNo}`}
            Ticketdata={selectedTicket}
            open={openDeliveredModal}
            onClose={handleDeliveredModalClose}
          />
        )}
        <ReusableConfirmModal type="deleteStatus" onClose={() => setOpendeleteConfirm(null)} open={Boolean(OpendeleteConfirm)} onConfirm={HandleDeleteStatus} />
        <AddMasterStatusDialog onAdd={console.log} onClose={() => setDialogOpen(false)} open={dialogOpen} />
        <Tooltip title={isClient ? "You Are Not Authorized" : ""}>
          <Chip label={value ? currentLabel : "-"} clickable={true} color={color} size="small" onClick={isClient ? undefined : handleClick} sx={chipStyle} />
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            style: {
              borderRadius: 15,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              padding: "4px",
              border: "1px solid #E0E0E0",
            },
          }}
          sx={{
            mt: 1,
            "& .MuiMenu-list": {
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
            },
          }}
        >
          {showAddBtn && (
            <MenuItem
              sx={{
                fontSize: "14px",
                fontWeight: 400,
                color: "#7F8FA4",
                backgroundColor: "transparent",
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                py: 0.6,
                px: 2,
              }}
              onClick={(e) => {
                setDialogOpen(true);
                // handleClose();
              }}
            >
              <AddRoundedIcon fontSize="small" />
              Add Status
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === value}
              sx={{
                fontSize: "14px",
                fontWeight: option.value === value ? 600 : 400,
                color: option.value === value ? "primary.main" : "text.primary",
                backgroundColor: option.value === value ? "action.selected" : "transparent",
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                py: 0.5,
                px: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
              onClick={(e) => handleSelect(option.value, e)}
              className="delete_status"
            >
              {option.label}
              {showAddBtn && (
                <ClearRoundedIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpendeleteConfirm(option?.label);
                  }}
                  fontSize="small"
                  className="show_delete_btn"
                />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  },
  (prevProps, nextProps) => {
    return prevProps?.statusList === nextProps?.statusList && prevProps.value === nextProps.value && prevProps.isClient === nextProps.isClient && prevProps.rowData?.row?.SrNo === nextProps.rowData?.row?.SrNo && prevProps.rowData?.field === nextProps.rowData?.field &&
    prevProps?.selectedTicket === nextProps?.selectedTicket  && prevProps.rowData?.row?.DeliveryDate === nextProps.rowData?.row?.DeliveryDate
  }
);

// Optimized individual chip components
export const ApprovalStatusChip = memo(({ status, onSelect, rowData, isClient }) => {
  return <GenericStatusChip value={status} isClient={isClient} onSelect={onSelect} rowData={rowData} getDisplayData={getApprovalStatus} options={ApprovalStatus} />;
});

export const PaymentStatusChip = memo(({ status, onSelect, rowData, isClient }) => {
  return <GenericStatusChip isClient={isClient} value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getPaymentStatus} options={mockPaymentStatuses} />;
});

export const ServiceTypeChip = memo(({ type, onSelect, rowData }) => {
  return <GenericStatusChip value={type} onSelect={onSelect} rowData={rowData} getDisplayData={getServiceType} options={mockServiceTypes} />;
});

export const OnDemandTypeChip = memo(({ status, onSelect, rowData }) => {
  return <GenericStatusChip value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getOnDemandType} options={mockOnDemandTypes} />;
});

export const DeliveryStatusChip = memo(({ status, onSelect, rowData, isClient, DontOpen }) => {
  return <GenericStatusChip isClient={isClient} value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getDeliveryStatus} options={mockDeliveryStatuses} DontOpen={DontOpen} />;
});

export const CurrentStatusChip = memo(({ status, onSelect, rowData }) => {
  const { statusList } = usePointToDiscuss();
  return <GenericStatusChip showAddBtn={true} value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getCurrentStatus} options={statusList} statusList={statusList} />;
});

export const PackageModeChip = memo(({ status, onSelect, rowData }) => {
  return <GenericStatusChip value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getPackageMode} options={mockPackageModes} />;
});