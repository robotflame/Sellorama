import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Avatar, Grid, Rating, Stack, Paper, TextField } from '@mui/material';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { QueryClientProvider, useQuery, useQueryClient } from 'react-query';
import { Carousel } from 'react-responsive-carousel';
import ChatIcon from '@mui/icons-material/Chat';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../components/carousel.css"

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate()
  const [Userdata, setUserdata] = useState({});
  const [data, setData] = useState()

  const queryClient = useQueryClient()

  const getDetails = async () => {
    axios.get(`/api/listings/${id}`).then(res => setData(res.data))
  }

  useEffect(() => {
    getDetails()
  }, [])

  const [images, setImages] = useState(null)

  const getConditionText = (condition) => {
    console.log(condition)
    switch (condition) {
        case 1:
            return "Factory New";
        case 2:
            return "Minimal Wear";
        case 3:
            return "Field Tested";
        case 4:
            return "Well Worn";
        case 5:
            return "Battle Scared";
        default:
            return "Unknown";
    }
};


  useEffect(() => {
    console.log(data)
      if (data?.images) {
        setImages([])
        data.images.map(img => {
          axios.get("/api/listings/image/" + img, { responseType: "blob" })
          .then(resp => {
              const url = URL.createObjectURL(resp.data);
              setImages(prev => [...prev, url]);
          });
        })
            
      }
  }, [data])
  const stripePromise = loadStripe("pk_test_51OJzLqBguZ2MFQowYlzFCFGrAnpwonLoENUdYqtdRmuWBBYBMdu719bxv5grrV69HpudpUTvYSEzp0RxvUnNVl7900toVJ9tRI");//loadStripe('pk_test_51N6fSEKQs9J7J5wlmWIhrGDXxdksDbILSDF5D84QAxgLfb3pEbsz3iCkJCejtPFoYPt7Ylt6BwHn6VvkSsgvJfJZ00XxnAbMcu');

  const handleBuyNow = async () => {
    console.log("buying: ",data.id);
    try {
      const response = await axios.post('/api/stripe/create-checkout-session', {
        productId: data.id, 
        successUrl: `${window.location.origin}/confirmation/${data.posterId}`, 
        cancelUrl: `${window.location.origin}/listings/details/${id}`, 
      });
  
    const { sessionId } = response.data;
    const stripe = await stripePromise;
    queryClient.invalidateQueries(["details", `${data.id}`])
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Stripe Checkout error:', error);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
  }
};

useEffect(() => {
  if (data?.posterId) {
    console.log(`Fetching user data for posterId: ${data.posterId}`);
    fetch(`/api/user/${data.posterId}`)
      .then((response) => response.json())
      .then((userData) => {
        console.log('Received user data:', userData);
        setUserdata(userData); 
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }
}, [data?.posterId]);

  return (
    <Grid container justifyContent={"center"} marginTop={5} marginBottom={20}>
        {data ? (
            
          <Stack component={Grid} maxWidth={"60%"} justifyContent={"center"} spacing={3}>
              <Carousel  showArrows={true} >

                {
                  images?.map(img => (
                      <img
                        src={img}
                      />
                  )
                  ) ?? <></>
                }
              </Carousel>
              <Grid container justifyContent={"space-between"}>
                
              <Stack spacing={2} component={Grid} container>
                <Grid container justifyContent={"space-between"}>
                  <Stack>
                    
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'left', fontSize: '1.5rem' }}>
                    {data.title}
                  </Typography>
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 'bold', textAlign: 'left', fontSize: '1.2rem' }}>
                    {data.model}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '4px', textAlign: 'left', fontSize: '1rem', wordWrap: 'break-word' }}>
                    Manufacturer: {data.manufacturer}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '4px', textAlign: 'left', fontSize: '1rem', wordWrap: 'break-word' }}>
                  Condition: {getConditionText(data.condition)}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', textAlign: 'left', fontSize: '1.3rem' }}>
                    Price: NOK {data.price / 100}
                  </Typography>
                  </Stack>
                  <Grid item>
                    <div onClick={() => navigate(`/profile/${data.posterId}`)}>
                      <Paper>
                        <Grid p={2} container spacing={1} justifyContent={"space-between"}>
                          <Stack mr={2} spacing={1} direction={"row"}>
                            <Avatar sx={{height: 60, width: 60}}/>
                            <Grid>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                              {Userdata.username ? `${Userdata.username}` : 'Loading...'}
                              </Typography>
                              <Rating name="seller-rating" value={4} readOnly />
                            </Grid>
                          </Stack>
                          <Button endIcon={<ChatIcon/>} variant="contained" color="secondary" onClick={(e) => {e.stopPropagation(); navigate(`/chat/${data.posterId}`)}}>
                            Chat
                          </Button>

                        </Grid>
                      </Paper>
                    </div>
                    </Grid>

                </Grid>
                <TextField label="Description" fullWidth multiline onChange={() => {}} onSelect={() => {}} disabled value={data.description}/>
                
              </Stack>
              </Grid>
              {
                !data.buyerId ? 
                <Button variant="contained" color="success" sx={{ marginTop: '12px', textAlign: 'left', fontSize: '1rem' }} onClick={handleBuyNow}>
                Buy Now
                  </Button> :
                <Button variant="contained" disabled sx={{ marginTop: '12px', textAlign: 'left', fontSize: '1rem' }}>
                  Sold
                </Button>
              }
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '1rem', textAlign: 'left' }}>No details available</Typography>
        )}
    </Grid>
  );
}
