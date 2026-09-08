import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Box } from '@mui/material';

const SimpleBar = forwardRef(({ children, style, sx, ...props }, ref) => {
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getScrollElement: () => containerRef.current,
  }));

  return (
    <Box
      ref={containerRef}
      sx={{
        overflowY: 'auto',
        height: '100%',
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

export default SimpleBar;
