import React, { memo, useState, useCallback, useMemo } from "react";
import { Chip, Menu, MenuItem, Tooltip } from "@mui/material";
import { getServiceType, getApprovalStatus, getPaymentStatus, getDeliveryStatus } from "../../../utils/helpers";
import { ApprovalStatus, mockServiceTypes, mockPaymentStatuses, mockDeliveryStatuses } from "../../../constants/constants";
import DeliveredModal from "./DeliveredModal";

const GenericStatusChip = memo(
	({ value, onSelect, rowData, getDisplayData, options, isClient }) => {
		const [anchorEl, setAnchorEl] = useState(null);
		const open = Boolean(anchorEl);
		const [openDeliveredModal, setOpenDeliveredModal] = useState(false);

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

		const handleSelect = useCallback(
			(newValue, e) => {
				e.stopPropagation();
				if (onSelect) {
					const field = rowData?.field;
					console.log("🚀 ~ handleSelect ~ field:", field);
					onSelect(rowData?.row?.SrNo, { [field]: newValue });
					if (field === "Status" && newValue === "Delivered") setOpenDeliveredModal(true);
				}
				handleClose();
			},
			[onSelect, rowData?.field, rowData?.row?.SrNo, handleClose],
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
			[isClient, value, bgColor, textColor],
		);

		return (
			<>
				<DeliveredModal Ticketdata={rowData?.row} open={openDeliveredModal} onClose={() => setOpenDeliveredModal(false)} />
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
	},
	(prevProps, nextProps) => {
		return prevProps.value === nextProps.value && prevProps.isClient === nextProps.isClient && prevProps.rowData?.row?.SrNo === nextProps.rowData?.row?.SrNo && prevProps.rowData?.field === nextProps.rowData?.field;
	},
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

export const DeliveryStatusChip = memo(({ status, onSelect, rowData, isClient }) => {
	return (
		<>
			<GenericStatusChip isClient={isClient} value={status} onSelect={onSelect} rowData={rowData} getDisplayData={getDeliveryStatus} options={mockDeliveryStatuses} />
		</>
	);
});
