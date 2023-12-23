import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
export default function ThankYouPage() {
    const { id } = useParams();
    return (
        <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '50px' }}>
            <Box sx={{ bgcolor: 'success.main', color: 'white', p: 3, borderRadius: 2 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 60 }} />
                <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                    Thank You for Your Order!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Your order has been placed successfully. Please contact the seller using the chat
                </Typography>
                <Button variant="contained" color="primary" href={`/chat/${id}`}>
                 Chat with seller
                </Button>
            </Box>
        </Container>
    );
}
