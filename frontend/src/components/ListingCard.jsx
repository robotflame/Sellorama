import { Button, Card, CardContent, CardMedia, Grid, Icon, Link, Typography, useTheme } from "@mui/material"
import { useEffect, useState } from "react"
import axios from "axios"
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { useQuery } from "react-query";



export default function ListingCard({listing}) {

    const theme = useTheme()

    const getConditionText = (condition) => {
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

    const {data} = useQuery(["image", listing.images[0]], () => axios.get("/api/listings/image/" + listing.images[0], { responseType: "blob" }))

    return (
        <Link underline="none" href={`/listings/details/${listing.id}`}>
            <Card key={listing.id} sx={{ width: '250px', userSelect: 'none' }}>
                {
                    data ? 
                    <CardMedia sx={{display: "flex", justifyContent: "center", backgroundColor: theme.palette.divider}}>
                        <img height={200} src={URL.createObjectURL(data.data)}/>
                    </CardMedia> :
                    <Grid container height={200} justifyContent="center" alignItems="center">
                        <ImageNotSupportedIcon sx={{fontSize: 80}}/>
                    </Grid>
                }
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        Manufacturer: {listing.manufacturer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Model: {listing.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Condition: {getConditionText(listing.condition)}
                    </Typography>
                    <Typography variant="h8" color="primary" style={{ fontWeight: 'bold' }}>
                        Price: NOK {listing.price / 100}
                    </Typography>
                </CardContent>
            </Card>
        </Link>
    )
}