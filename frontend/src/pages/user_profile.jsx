import { Avatar, Button, Chip, Divider, Grid, Link, List, ListItem, Paper, Stack, Table, TableCell, TableRow, TextField, Typography} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import axios from "axios";
import ReviewCard from "../components/reviewCard";
import RadioGroupRating from "../components/emojiRating";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import ListingCard from '../components/ListingCard';
import { jwtDecode } from "jwt-decode";

export default function UserProfile() {
    const {id} = useParams();
    const [successMessage, setSuccessMessage] = useState(''); // Declare success message state
    const token = localStorage.getItem("JWT_TOKEN")
    const token_user = jwtDecode(token);
    const [listings, setListings] = useState([]);
    const [history, setHistory] = useState([])
    const {data: user, isSuccess} = useQuery(["user", id], () => axios.get(`/api/user/${id}`))
    const scrollToReview = (review_id) => {
        const section = document.querySelector( `.review_card_${review_id}` );
        section.scrollIntoView( { alignToTop: true, behavior: 'smooth', block: "start" } );
    };
    const reviews = [{"id": 1, "rating": 4.5}, {"id": 2, "rating": 5}, {"id": 3, "rating": 2}]
    useQuery(["history"], () => token_user.Id == id ? axios.get("/api/user/purchases").then(async (res) => {
        const promises = res.data.map(async (item) => {
            const img_res = await axios.get("/api/listings/image/" + item.images[0], { responseType: "blob" });
            return {...item, img: img_res.data};
          });
          
          Promise.all(promises).then((data) => {
            setHistory(data);
          }).catch((error) => {
            console.log(error);
          });
        
    }
    ) : {})

    const fetchListings = () => {
        axios.get("/api/user/listings/" + id)
            .then((response) => {
                setListings(response.data);
            })
            .catch((error) => {
                console.error('Error fetching listings:', error);
            });
    };
    useEffect(() => {
        // This function fetches listings
    
        if (user && user.data && user.data.id) {
            fetchListings();
        }
    }, [id, user]);

    const DeleteListing = (id) => {
        fetch(`/api/listings/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then((response) => {
      if (response.ok) {
        setSuccessMessage('Listing deleted successfully');   
        fetchListings() 
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
     })
    };

    return (
        <Stack p={6} spacing={2}>
            <Stack spacing={2} direction="row">
                <Avatar sx={{height: 90, width: 90}}/>
                <Stack spacing={1}>
                    <Typography variant="h3">
                        { user?.data.username ?? "No User Found"}
                    </Typography>
                    {/* <RadioGroupRating readOnly/> */}
                </Stack>
            </Stack>
            {/* <Stack my={2} spacing={2} direction={"row"}>
                {reviews.map((rev) => (
                    <Chip label={rev.rating} onClick={() => {scrollToReview(rev.id)}} icon={<StarIcon color="warning"/>}></Chip>
                ))}
            </Stack> */}
            <Divider/>
            
            <Typography variant="h4">
                Active Listings
            </Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {listings.map((listing) => (
                <div key={listing.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ListingCard listing={listing} />
                    {
                        token_user.Id == id ? 
                        <Stack m={1} spacing={1} direction={"row"}>
                        <Button variant="contained" color="error" onClick={() => DeleteListing(listing.id)}>
                            Delete
                        </Button>
                        <Button variant="outlined" href={"/listings/edit/" + listing.id}>
                            Edit
                        </Button>
                        </Stack> : <></>
                    }
                    
                </div>
            ))}
            </div>
            {successMessage && (
                <Typography variant="body2" sx={{ mt: 8, color: 'green' }}>
                {successMessage}
                </Typography>
                    )}
            <Divider/>
            {
                history.length && token_user.Id == id ? (
                    <div>
                        <Typography variant="h4">
                            Order History {listings.id}
                        </Typography>
                        <Table component={Paper}>
                            {
                                history.map(obj => 
                                    <TableRow component={Link} underline="none" href={"/listings/details/" + obj.id}>
                                        <TableCell>
                                            <img height={100} src={URL.createObjectURL(obj.img)}/>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="h6">
                                                {obj.model}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="h6">
                                                {obj.price/100} NOK
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="h6" color="InactiveCaptionText">
                                                {(new Date(obj.buyDate)).toDateString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </Table>
                    </div> 
                ) : <></>
            }
        </Stack>
        
        
    )

}