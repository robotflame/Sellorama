import { Button, Grid, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [money, setMoney] = useState(0)
  
  return (
    <>
      <Grid p={6} container justifyContent={"center"}>
        <Stack direction={"column"}>
          <Typography variant='h2'>
            Sellorama
          </Typography>
          <Stack spacing={2}>
            <Button onClick={() => setMoney(prevMoney => prevMoney - Math.round(Math.random()*1000))} color='secondary' variant='contained'>
              Buy
            </Button>
            <Button onClick={() => setMoney(prevMoney => prevMoney + Math.round(Math.random()*1000))}  variant='outlined'>
              Sell
            </Button>
            <Paper container justifyContent={"center"} sx={{p: 5}}>
              <Typography variant='h4'>
                Bank: ${money}
              </Typography>
            </Paper>
          </Stack>

        </Stack>
      </Grid>
    </>
  )
}