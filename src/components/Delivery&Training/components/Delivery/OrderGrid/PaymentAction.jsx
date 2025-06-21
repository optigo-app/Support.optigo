import React from 'react'
import { Chip, Typography } from '@mui/material';
import ClientPay from './ClientPay';
import { getPaymentMethodStyle } from '../../../utils/helpers';

const PaymentAction = ({ params, isClient }) => {
    const [open, setOpen] = React.useState(false);
    const payment = params?.value || params?.row?.PaymentMethod;
    const isPaid = params.row.PaymentStatus !== "Paid" && isClient;
    const { bgColor, textColor } = getPaymentMethodStyle(payment);

    const handleClickOpen = () => {
        setOpen(true);
    };
    return <>
        {isPaid && <ClientPay open={open} onClose={() => setOpen(false)} Ticketdata={params.row} />}
        {
            payment ? (
                <Chip label={payment} onClick={isClient ? handleClickOpen : null} sx={{
                    cursor: isClient ? "pointer" : "default",
                    color: textColor,
                    backgroundColor: bgColor,
                }} size="small" />
            ) : (
                <Typography variant="body2" color="text.secondary">—</Typography>
            )
        }
    </>
}

export default PaymentAction