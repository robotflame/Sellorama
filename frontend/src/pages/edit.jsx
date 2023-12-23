import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, FormControl, InputLabel, InputAdornment, MenuItem, Select, TextField, Button, Typography, Alert, Grid, Stack, ImageList, ImageListItem, List, ListItem, Card, CardMedia, CardActions, CardContent, Divider, IconButton, Dialog } from '@mui/material';
import axios from 'axios';
import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
import ClearIcon from '@mui/icons-material/Clear';
import { useQuery, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';

export default function Edit() {
    const { id } = useParams();
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
    const [org_images, setOrgImages] = useState([])
    const [imageDialog, setDialog] = useState(false)
    const [currImage, setImage] = useState()
    const [listing, setListing] = useState()
    const [deleteImages, setDeleteImages] = useState([])

    useEffect(() => {
        axios.get("/api/listings/" + id).then(res => {
            setListing(res.data)
            setSelectedManufacturer(res.data.manufacturer)
            setselectedCondition(Number(res.data.condition))
            setPrice(res.data.price/100)
            setDescription(res.data.description)
        }   
        )
    }, [])

    const queryClient = useQueryClient()

    
    const {data, error} = useQuery({
        queryKey: ["details", id], 
        queryFn: () => getDetails(),
        staleTime: Infinity,
        
    })

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
        if (listing?.images) {
          setOrgImages([])
          listing.images.map(img => {
            axios.get("/api/listings/image/" + img, { responseType: "blob" })
            .then(resp => {
                setOrgImages(prev => ([...prev, ({"name": img, "img": resp.data})]));
            });
          })
              
        }
    }, [listing])

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


    const handleEdit = () => {
        // Prepare the data to send in the POST request
        const data = {
            Manufacturer: selectedManufacturer,
            Model: selectedModel,
            Description: description,
            Price: Number(price) * 100,
            Imageurl: "",
            Condition: selectedCondition,
            ImagesToDelete: deleteImages
        }
        const formdata = new FormData()
        for (var key in images) {
            formdata.append("files", images[key]);
        }
        for (var key in data) {
            formdata.append(key, data[key]);
        }
        axios.put("/api/listings/" + id, formdata, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then((res) => {
            queryClient.invalidateQueries("listings")
            navigate("/listings/details/" + id)
        }
        )
    };

    const deleteImage = (img_name, index) => {
        setDeleteImages(prev => [...prev, img_name])
        setOrgImages(prev => [...prev.slice(0, index), ...prev.slice(index+1)])
    }

    if (!listing) return <></>
    return (
        <Grid container justifyContent="center" p={5}>
            <Stack spacing={2} direction={"row"}>
                <Stack style={{ width: 400 }}>
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
                    <ImageList spacing={1} cols={3} sx={{ width: 400, overflowY: "auto" }}>{
                        org_images.map((img, index) => (
                            <ImageListItem>
                                <IconButton color="error" onClick={() => deleteImage(img.name, index)} size='small' sx={{ position: "absolute", right: 4, top: 4, backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
                                    <ClearIcon />
                                </IconButton>
                                <img onClick={() => handleImgOnclick(img.img)} src={URL.createObjectURL(img.img)} />
                            </ImageListItem>
                        ))
                    }
                    {
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
                                    defaultValue={listing.manufacturer}
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
                                    defaultValue={listing.model}
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
                                    defaultValue={listing.condition}
                                    value={selectedCondition}
                                    onChange={(event) => setselectedCondition(Number(event.target.value))}
                                >
                                    <MenuItem value={1}>Factory New</MenuItem>
                                    <MenuItem value={2}>Minimal Wear</MenuItem>
                                    <MenuItem value={3}>Field Tested</MenuItem>
                                    <MenuItem value={4}>Well Worn</MenuItem>
                                    <MenuItem value={5}>Battle Scarred</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                sx={{ width: '100%', mb: 2 }}
                                label="Price"
                                type="number"
                                defaultValue={listing.price}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            NOK
                                        </InputAdornment>
                                    ),
                                    inputProps: { min: 0 },
                                }}
                                value={price}
                                onChange={(event) => setPrice(Number(event.target.value))}
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
                        <Button endIcon={<EditIcon/>} variant="contained" color="info" onClick={() => handleEdit()}>
                            Edit
                        </Button>
                    </Grid>
                    {successMessage && (
                        <Alert severity="success" sx={{ width: '100%', marginBottom: '8px' }}>
                            {successMessage}
                        </Alert>
                    )}
                </Stack>
            </Stack>
            <Dialog open={imageDialog} onClose={() => setDialog(false)} sx={{ overflow: "visible" }}>
                <Button size='large' variant='outlined' onClick={() => setDialog(false)} sx={{ position: "fixed", top: 10, right: 10 }} color="inherit">
                    Close
                </Button>
                <img src={currImage ? URL.createObjectURL(currImage) : ""} />
            </Dialog>
        </Grid>
    );
}
