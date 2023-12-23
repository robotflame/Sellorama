import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Add this import
import { Button, Grid, Paper, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function Admin() {
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [phones, setPhones] = useState([]);
  const [successMessage, setSuccessMessage] = useState(''); // Declare success message state

  const handleAddPhone = () => {
    const data = {
      Creator: manufacturer,
      Name: model,
    };

    axios.post('/api/manufacturers/phones', data)
    .then((response) => {
      setSuccessMessage('Phone added successfully');    
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      setManufacturer('');
      setModel('');
      fetch('/api/manufacturers/phones')
        .then((response) => response.json())
        .then((data) => {
          setPhones(data); // Update the 'phones' state with the new data
        })
    })
  };

  const handleDeletePhone = (id) => {
    // Make a DELETE request to delete the phone by ID
    fetch(`/api/manufacturers/phones/${id}`, {
      method: 'DELETE',
    })
    .then((response) => {
      if (response.ok) {
        setSuccessMessage('Phone deleted successfully');    
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
        setPhones((prevPhones) => prevPhones.filter((phone) => phone.id !== id));
      }
    })
  };

  useEffect(() => {
    // Fetch real phone data from your API here
    fetch('/api/manufacturers/phones') // Replace with your actual API endpoint
      .then((response) => response.json())
      .then((data) => {
        setPhones(data); // Assuming your API response is an array of phone objects
      })
      .catch((error) => {
        console.error('Error fetching phone data:', error);
      });
  }, []);

  return (
    <>
      <Grid p={6} container justifyContent="center">
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5">Add Phones</Typography>
          <TextField
            label="Manufacturer"
            variant="outlined"
            fullWidth
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            sx={{ my: 1 }}
          />
          <TextField
            label="Model"
            variant="outlined"
            fullWidth
            value={model}
            onChange={(e) => setModel(e.target.value)}
            sx={{ my: 1 }}
          />
          <Button variant="contained" color="primary" onClick={handleAddPhone}>
            Add Phone
          </Button>
          {successMessage && (
            <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
              {successMessage}
            </Typography>
          )}
          {/* List of Phones */}
          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                
                {phones.map((phone) => (
                  <TableRow key={phone.id}>
                    <TableCell>{phone.id}</TableCell>
                    <TableCell>{phone.creator}</TableCell>
                    <TableCell>{phone.name}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="error" onClick={() => handleDeletePhone(phone.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </>
  );
}
