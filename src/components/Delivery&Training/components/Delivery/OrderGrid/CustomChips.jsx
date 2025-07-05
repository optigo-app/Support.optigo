import React from "react";
import { Chip, Menu, MenuItem, Tooltip } from "@mui/material";
import { getServiceType, getApprovalStatus, getPaymentStatus, getDeliveryStatus } from "../../../utils/helpers";
import { ApprovalStatus, mockServiceTypes, mockPaymentStatuses, mockDeliveryStatuses } from '../../../constants/constants'

const GenericStatusChip = ({ value, onSelect, rowData, getDisplayData, options, isClient }) => {
  console.log("🚀 ~ GenericStatusChip ~ value:", value)
  const currentOption = options?.find((opt) => opt?.value === value) || options[0];
  const { label: currentLabel, color, bgColor, textColor } = getDisplayData(currentOption?.value);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newValue, e) => {
    e.stopPropagation();
    if (onSelect) {
      const field = rowData?.field;
      onSelect(rowData?.row?.SrNo, { [field]: newValue });
    }
    handleClose();
  };

  return (
    <>
      <Tooltip
        title={isClient ? "You Are Not Authorized" : ""}
      >
        <Chip label={value ? currentLabel : "-"} clickable={true} color={color} size="small" onClick={isClient ? undefined : handleClick}
          sx={{
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
          }}
        />
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
              py: 0.6,
              px: 2,
            }}
            onClick={(e) => handleSelect(option.value, e)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
// Approval Status Chip
export const ApprovalStatusChip = ({ status, onSelect, rowData, isClient }) => {
  return <GenericStatusChip value={status} isClient={isClient} onSelect={onSelect} rowData={rowData} getDisplayData={getApprovalStatus} options={ApprovalStatus} />;
};

// Payment Status Chip
export const PaymentStatusChip = ({ status, onSelect, rowData, isClient }) => {

  return <GenericStatusChip isClient={isClient} value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getPaymentStatus} options={mockPaymentStatuses} />;
};

// Service Type Chip
export const ServiceTypeChip = ({ type, onSelect, rowData }) => {
  return <GenericStatusChip value={type} onSelect={onSelect} rowData={rowData} getDisplayData={getServiceType} options={mockServiceTypes} />;
};

export const DeliveryStatusChip = ({ status, onSelect, rowData, isClient }) => {
  return <GenericStatusChip isClient={isClient} value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getDeliveryStatus} options={mockDeliveryStatuses} />;
};