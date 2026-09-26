import React from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const RunningStatusDots = () => {
  const theme = useTheme();
  const motions = [
    { y: [0, -6, 0] },  
    { y: [0, -8, 0] },   
    { y: [0, -6, 0] },   
  ];

  return (
    <Box display="flex" alignItems="center" gap={0.4}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: motions[i].y,
          }}
          transition={{
            duration: 0.6 + i * 0.2, 
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: theme.palette.grey[500],
          }}
        />
      ))}
    </Box>
  );
};

export default RunningStatusDots;
