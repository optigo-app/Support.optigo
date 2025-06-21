import { IconButton } from '@mui/material';
import React, { useState } from 'react'
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const RotatingIcon = ({ filterKey, onReset }) => {
    const [animate, setAnimate] = useState(false);

    const animationSx = {
        animation: animate ? 'rotate360 0.6s ease-in-out' : 'none',
        '@keyframes rotate360': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
        },
    };

    return <IconButton
        onClick={() => {
            setAnimate(true);
            setTimeout(() => setAnimate(false), 600);
            onReset(filterKey)

        }}
        size="small"
        sx={animationSx}
    >
        <RefreshRoundedIcon   fontSize="small" />
    </IconButton>

}

export default RotatingIcon