import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, FormControl, InputLabel, InputAdornment, MenuItem, Select, TextField, Button, Typography, Alert, Grid, Stack, ImageList, ImageListItem, List, ListItem, Card, CardMedia, CardActions, CardContent, Divider, IconButton, Dialog } from '@mui/material';
import axios from 'axios';
import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
import ClearIcon from '@mui/icons-material/Clear';
import { useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom';


export default function Sell() {
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [selectedCondition, setselectedCondition] = useState();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([])
  const [imageDialog, setDialog] = useState(false)
  const [currImage, setImage] = useState()

  const queryClient = useQueryClient()

  const navigate = useNavigate()

  const handleImgOnclick = (img) => {
    setImage(img)
    setDialog(true)
  }

  const handleFileChange = (e) => {
    const files = e.target.files;
    setImages(prev => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    setImages(prev => [...prev, ...files]);
  };

  useEffect(() => {
    // Fetch manufacturers from the backend API
    axios.get('/api/manufacturers')
      .then((response) => {
        setManufacturers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching manufacturers:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedManufacturer) {
      axios.get(`/api/manufacturers/${selectedManufacturer}/models`)
        .then((response) => {
          setModels(response.data);
        })
        .catch((error) => {
          console.error(`Error fetching ${selectedManufacturer} models:`, error);
        });
    } else {
      setModels([]);
    }
  }, [selectedManufacturer]);


  const handleListForSale = () => {
    // Prepare the data to send in the POST request
    const data = {
      Manufacturer: selectedManufacturer,
      Model: selectedModel,
      Description: description,
      Price: price*100,
      Imageurl: "",
      Condition: selectedCondition,
    }
    const formdata = new FormData()
    for ( var key in images ) {
      formdata.append("files", images[key]);
    }
    for ( var key in data ) {
      formdata.append(key, data[key]);
    }
    axios.post("/api/listings", formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => {
      console.log("/listings/details/" + res.data.id)
      queryClient.invalidateQueries("listings")
      navigate("/listings/details/" + res.data.id)
    }
    )
  };


  return (
    <Grid container justifyContent="center" p={5}>
      <Stack spacing={2} direction={"row"}>
        <Stack style={{width: 400}}>
          <div onDragOver={() => e.preventDefault()} onDrop={handleDrop}>
            <Button variant='outlined' fullWidth onClick={() => fileInputRef.current.click()} endIcon={<UploadFileTwoToneIcon />} color="info" sx={{ height: 130, border: "2px dashed" }}>
              Upload Images
              <input
                type="file"
                accept='image/*'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
              />
            </Button>
          </div>
          <ImageList  spacing={1} cols={3} sx={{width: 400, overflowY: "auto"}}>{
              images.map((img, index) => (
                <ImageListItem>
                  <IconButton color="error" onClick={() => {setImages(prev => [...prev.slice(0, index), ...prev.slice(index+1)])}} size='small' sx={{position: "absolute", right: 4, top:4, backgroundColor: "rgba(0, 0, 0, 0.3)"}}>
                    <ClearIcon/>
                  </IconButton>
                  <img onClick={() => handleImgOnclick(img)} src={URL.createObjectURL(img)}/>
                </ImageListItem>
              ))
              }
          </ImageList>
        </Stack>
        <Stack spacing={2} width={500}>
          <Stack spacing={2}>
            <Stack spacing={1} direction={"row"}>
              <FormControl spacing={3} sx={{ width: '100%' }}>
                <InputLabel>Manufacturer</InputLabel>
                <Select
                  label="Manufacturer"
                  value={selectedManufacturer}
                  onChange={(event) => setSelectedManufacturer(event.target.value)}
                >
                  {manufacturers.map((manufacturer) => (
                    <MenuItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ width: '100%' }}>
                <InputLabel>Model</InputLabel>
                <Select
                  label="Model"
                  displayEmpty
                  disabled={!selectedManufacturer}
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                >
                  {models.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack spacing={1} direction={"row"}>

              <FormControl sx={{ width: '100%' }}>
                <InputLabel>Condition</InputLabel>
                <Select
                  label="Condition"
                  displayEmpty
                  value={selectedCondition}
                  onChange={(event) => setselectedCondition(event.target.value)}
                >
                  <MenuItem value="1">Factory New</MenuItem>
                  <MenuItem value="2">Minimal Wear</MenuItem>
                  <MenuItem value="3">Field Tested</MenuItem>
                  <MenuItem value="4">Well Worn</MenuItem>
                  <MenuItem value="5">Battle Scarred</MenuItem>
                </Select>
              </FormControl>

              <TextField
                sx={{ width: '100%', mb: 2 }}
                label="Price"
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      NOK
                    </InputAdornment>
                  ),
                  inputProps: { min: 0 },
                }}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </Stack>
          </Stack>

          <TextField
            sx={{ width: '100%', mb: 2 }}
            label="Product Information"
            placeholder="Describe the product"
            multiline
            minRows={4}
            maxRows={16}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <Grid container justifyContent={"flex-end"}>
            <Button variant="contained" color="success" sx={{ '&:hover': { backgroundColor: '#4CAF50' }, width: '28%' }} onClick={handleListForSale}>
              List for sale
            </Button>
          </Grid>
          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', marginBottom: '8px' }}>
              {successMessage}
            </Alert>
          )}
        </Stack>
      </Stack>
      <Dialog open={imageDialog} onClose={() => setDialog(false)} sx={{overflow: "visible"}}>
        <Button size='large' variant='outlined' onClick={() => setDialog(false)} sx={{position: "fixed", top: 10, right: 10}} color="inherit">
          Close
        </Button>
        <img src={currImage ? URL.createObjectURL(currImage) : ""}/>
      </Dialog>
    </Grid>
  );
}
