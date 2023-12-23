import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import {
  Container,
  Card,
  CardContent,
  Button,
  Typography,
  Select,
  MenuItem,
  Slider,
  Pagination,
  Grid,
  Stack,
} from '@mui/material';
import ListingCard from '../components/ListingCard';
import { useQuery } from 'react-query';

export default function Listings() {
  const [filterModel, setFilterModel] = useState('All Models')
  const [filterManufacturer, setFilterManufacturer] = useState('All Manufacturers')
  const [filterCondition, setFilterCondition] = useState('Any Condition')
  const [filterPrice, setFilterPrice] = useState([0, 25000])
  const [models, setModels] = useState([])
  const [manufactorers, setManufactorers] = useState([])
  const [page, setPage] = useState(1)
  const [where, setWhere] = useState("")

  const getListings = async (queryKey) => {
    return await axios.get("/api/listings" + `?PageIndex=${queryKey}` + "&Where=buyerid!=0" + where)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching listings:', error)
      })
  }

  const {data} = useQuery({
    queryKey: ["listings", page, where],
    queryFn: ({queryKey}) => getListings(queryKey[1]),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  })
  const getPageCount = async () => {
    return await axios.get("/api/listings/page-count" + `?PageIndex=${page}` + "&Where=buyerid!=0" + where).then(res => res.data)
  }

  const {data: pages} = useQuery({
    queryKey: ["pagecount", page, where],
    queryFn: ({queryKey}) => getPageCount(),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  })


  const set_filters = () => {
    let str = ""
    if (filterManufacturer !== "All Manufacturers")
      str = " and manufacturer==\"" + filterManufacturer + "\""; 
    if (filterModel !== "All Models")
      str += " and model==\"" + filterModel + "\"";
if (filterCondition !== "Any Condition")
      str += " and condition==" + filterCondition;
    if (filterPrice[0] > 0)
      str += "and price>" + filterPrice[0]*100;
    if (filterPrice[1] < 25000)
      str += " and price<" + filterPrice[1]*100;
    
    setWhere(str)
      
  }
  useEffect(() => {
    axios.get("/api/manufacturers/phones")
    .then(res => {
      setModels(res.data)
    })

    axios.get("/api/manufacturers")
      .then(res => {
        setManufactorers(res.data)
      })
      getPageCount()
  }, [])

  useEffect(() => {
    getPageCount()
  }, [where])

  const handleModelChange = (event) => {
    setFilterModel(event.target.value)
  }

  const handleManufacturerChange = (event) => {
    setFilterManufacturer(event.target.value)
  }

  const handlePriceChange = (event, newValue) => {
    setFilterPrice(newValue)
  }
  

  const clearFilters = () => {
    setWhere("")
    setFilterModel('All Models')
    setFilterManufacturer('All Manufacturers')
    setFilterPrice([0, 25000])
    setFilteredData(listings)
  };

  return (
    <Container>
    <Stack direction={"row"} spacing={2} marginTop={5} marginBottom={2}>
      <div>
        <Select
          style={{width: 200}}
          labelId="manufacturer-filter-label"
          id="manufacturer-filter"
          value={filterManufacturer}
          onChange={handleManufacturerChange}
        >
          <MenuItem value="All Manufacturers">All Manufacturers</MenuItem>
          {manufactorers.map((manufacturer) => (
            <MenuItem key={manufacturer} value={manufacturer}>
              {manufacturer}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <Select
        style={{width: 200}}
        labelId="model-filter-label"
        id="model-filter"
        value={filterModel}
        onChange={handleModelChange}
        >
          <MenuItem value="All Models">All Models</MenuItem>
            {models.map((model) => (
              <MenuItem key={model.id} value={model.name}>
                {model.name}
              </MenuItem>
            ))}
        </Select>
        </div>
      <div>
        <Select
          style={{width: 200}}
          labelId="manufacturer-filter-label"
          id="manufacturer-filter"
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
        >
          <MenuItem value="Any Condition">Any Condition</MenuItem>
          <MenuItem value="1">Factory New</MenuItem>
          <MenuItem value="2">Minimal Wear</MenuItem>
          <MenuItem value="3">Field Tested</MenuItem>
          <MenuItem value="4">Well Worn</MenuItem>
          <MenuItem value="5">Battle Scarred</MenuItem>
        </Select>
      </div>
          <Grid container>
            <label htmlFor="price-filter">Price Range</label>
            <Slider
             
              value={filterPrice}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `NOK ${value}${filterPrice[1] == 25000 ? '+' : ""}`}
              min={0}
              max={25000} 
              step={10}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Button variant="contained" color="primary" onClick={() => set_filters()} style={{ width: 200  }}>
            Apply Filters
          </Button>
          <Button variant="contained" color="secondary" onClick={clearFilters} style={{ width: 200  }}>
            Clear Filters
          </Button>
      </Stack>

      <Grid container justifyContent={"center"} spacing={3}>
      {data ? data.map((listing) => (
        <Grid item>
          <ListingCard listing={listing}/>
        </Grid>
      )) : ""}

      </Grid>
      <Grid container marginTop ={2} marginBottom={10} justifyContent={"center"}>
        <Pagination variant='outlined' page={page}  onChange={(e, v) => setPage(v)} count={pages} color="primary" />
      </Grid>
    </Container>
  );
}
