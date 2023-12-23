import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Avatar, 
  Box, 
  ListItemAvatar 
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ChatOverview() {
  const navigate = useNavigate();
  const [chats, setChats] = useState({ result: [] });
  const [usernames, setUsernames] = useState({}); // Initialize usernames state

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('/api/user/chats');
        setChats(response.data); // Assuming response.data is an object with a 'result' array
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (chats.result.length > 0) {
      const sendingIds = chats.result.map(room => room); // Corrected to use chats.result
      fetchUsernames(sendingIds);
    }
  }, [chats.result]); // Depend on chats.result

  const fetchUsernames = async (sendingIds) => {
    try {
      const uniqueIds = [...new Set(sendingIds)]; // Assuming these are the IDs to fetch usernames
      const fetchPromises = uniqueIds.map(id => axios.get(`/api/user/${id}`));
      const users = await Promise.all(fetchPromises);

      const newUsernames = users.reduce((acc, response) => {
        const user = response.data;
        acc[user.id] = user.username;
        return acc;
      }, {});

      setUsernames(prev => ({ ...prev, ...newUsernames }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  const avatarStyle = {
    bgcolor: 'primary.main',
    color: 'white'
  };

  return (
    <Container maxWidth="sm" >
      <Typography marginTop={5} variant="h4" gutterBottom>
        Chats:
      </Typography>
      <List>
        {chats.result.map((room, index) => (
          <React.Fragment key={room}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <ListItem button onClick={() => navigate("/chat/" + room)}>
                  <ListItemAvatar>
                    <Avatar sx={avatarStyle}>{usernames[room]?.charAt(0).toUpperCase() || '?'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={usernames[room] || 'Loading...'} 
                    secondary={`Press to chat`} // Displaying the Chat ID as secondary text
                  />
                </ListItem>
              </CardContent>
            </Card>
            {index < chats.result.length - 1 && <Divider />} {/* Divider between cards */}
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
}