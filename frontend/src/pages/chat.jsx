import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import { Container, Paper, TextField, Button, List, ListItem, ListItemText, Box, Typography, Grid, Avatar, Stack, Link, } from '@mui/material';
import * as signalR from '@microsoft/signalr';
import { jwtDecode } from "jwt-decode";
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios'; // Add this import
import { useTheme } from '@emotion/react';


export default function ChatPage() {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usernames, setUsernames] = useState({});
  const theme = useTheme()

  const bottomRef = useRef(null);
  const params = useParams()
  const [Userdata, setUserdata] = useState({});

  const jwt_token = localStorage.getItem("JWT_TOKEN")
  const user = jwt_token ? jwtDecode(jwt_token) : null
  useEffect(() => {
    console.log(user)
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("/api/chathub", {
        accessTokenFactory: () => localStorage.getItem('JWT_TOKEN'),
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect() // Adjust with your backend URL
      .build();
    setConnection(newConnection);
    axios.get(`/api/chat/load-chat/${params.userId}`)
    .then(res => {
      const previousMessages = res.data;
      console.log("fetched old: {}", previousMessages);
      setMessages(previousMessages.map(m => ({ sendingId: m.sendingId, content: m.content, timestamp: m.timestamp })));
    })
    console.log(theme)
  }, []);

  useEffect(() => {
  }, [])

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log("Connected!");

          connection.on("ReceiveMessage", (message) => {
            console.log(message);
            setMessages(messages => [...messages, { sendingId: message.sendingId, content: message.content, timestamp: message.timestamp }]);
          });
        })
        .catch(err => console.error('Connection failed: ', err));
    }
  }, [connection]);

  useEffect(() => {
    const sendingIds = messages.map(message => message.sendingId);
    fetchUsernames(sendingIds);
  }, [messages]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsernames = async (sendingIds) => {
    try {
      const uniqueIds = [...new Set(sendingIds)]; // Remove duplicates
      const fetchPromises = uniqueIds.map(id => fetch(`/api/user/${id}`).then(res => res.json()));
      const users = await Promise.all(fetchPromises);
  
      const newUsernames = users.reduce((acc, user) => {
        acc[user.id] = user.username;
        return acc;
      }, {});
  
      setUsernames(prev => ({ ...prev, ...newUsernames }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const token = localStorage.getItem("JWT_TOKEN")
        const user = jwtDecode(token);
        await connection.send("SendMessage", params.userId, newMessage); // Include the room ID when sending messages
        console.log('Sending message: ');
        setNewMessage('');
      } catch (e) {
        console.error('Sending message failed: ', e);
      }
    }
  };

  useEffect(() => {
    console.log(`Fetching user data for posterId: ${params.userId}`);
  
    fetch(`/api/user/${params.userId}`)
      .then((response) => response.json())
      .then((userData) => {
        console.log('Received user data:', userData);
        setUserdata(userData); 
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, [params.userId]); // Ensure the dependency array is correctly specified
  
  
  return (
    <Stack component={Grid} spacing={2} paddingBottom={10} container maxWidth={"sm"} paddingTop={5} m={"auto"}>
      <Link underline="none" alignItems={"flex-start"} href={Userdata?.username ? "/profile/" + Userdata.id : ""}>
        <Grid container p={1} >
          <Avatar/>
          <Typography marginLeft={2} variant="h4" >{Userdata.username}</Typography>
        </Grid>
      </Link>
      <Paper sx={{ height: 500, overflow: 'auto', p: 2 }}>
        <List component={Grid} container>  
          {messages.map((message, index) => (
            <Grid container justifyContent={user.Id != message.sendingId ? "flex-start" : "flex-end"}>
            <ListItem key={index} sx={{ 
              display: 'flex', 
              bgcolor: user.Id == message.sendingId ? theme.palette.primary.main : theme.palette.secondary.main, // Different color for receiver
              
              borderRadius: '10px',
              p: 1,
              mb: 1,
              maxWidth: '70%' 
            }}>
              <ListItemText 
                primary={`${message.content}`}
                secondary={new Date(message.timestamp).toLocaleString("en-US")}
                primaryTypographyProps={{ fontWeight: 'bold' }}
                sx={{color: theme.palette.mode == "dark" ?(user.Id == message.sendingId ? "black" : "white") : (user.Id == message.sendingId ? "white" : "black")}}
              />
            </ListItem>
            </Grid>
          ))}
          <div ref={bottomRef} />
        </List>
      </Paper>

      <Box component="form" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        onSubmit={(e) => {
          e.preventDefault();
        }}>
        <TextField
          fullWidth
          label="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button 
          disabled={!connection}
          type='submit' 
          variant="contained" 
          color="primary" 
          endIcon={<SendIcon />} 
          onClick={() => handleSendMessage()}
        >
          Send
        </Button>
      </Box>
    </Stack>
  );
}