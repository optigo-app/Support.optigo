import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 10 ,display:'flex',justifyContent:'center',alignItems:'center',height:'calc(100vh - 64px)',flexDirection:'column' , }}>
      <Box>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>
          Oops! The page you're looking for doesn't exist.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          It might have been moved or deleted. Please check the URL or go back to the homepage.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            bgcolor:'primary.main',
            color:'#fff',
            '&:hover':{bgcolor:'primary.dark'},
          }}
          onClick={() => navigate('/')}
        >
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
