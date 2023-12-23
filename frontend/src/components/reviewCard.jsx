import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Grid, IconButton, Paper, Rating, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import ThumbUpTwoToneIcon from '@mui/icons-material/ThumbUpTwoTone';
import ThumbDownTwoToneIcon from '@mui/icons-material/ThumbDownTwoTone';
import React, { useEffect, useState } from "react"
import { useTheme } from "@emotion/react";


export default function ReviewCard({rating, ...props}) {
  const [helpful, setHelpful] = useState(null)
  const theme = useTheme()

  return (
    <Card
    variant="outlined"
    {...props}
  >
    <Paper elevation={4} sx={{display: "flex", width: 600}}>
      
    <CardContent>
      <Stack sx={{display: "flex", justifyContent: "center"}} spacing={1}>
        <Stack direction={"row"} spacing={1}>
          <Avatar sx={{ bgcolor: "#3e50a4" }}/>
          <Stack>
          <Typography>YOOO</Typography>
          <Typography color={theme.palette.text.disabled} variant="caption">12/02/2023</Typography>
          </Stack>
        </Stack>  
        <Rating defaultValue={rating} precision={0.5} readOnly/>
        <Typography>
          Test Review <br/>
          bla bla bla lba ffjdlsfewfew fejwio  jifewoj fieojw oifj ioewj fioewjoi fewiojfewoi jfioew joi efwjfejiowjfoeiwj io
        </Typography>
        <Grid container justifyContent={"flex-end"} alignItems={"center"}>
          <Typography marginRight={1} color={theme.palette.text.disabled}>
            Was this review helpful?
          </Typography>
          <ToggleButtonGroup value={helpful} exclusive onChange={(e,n) => setHelpful(n)}>
            <ToggleButton color="success" value="helpful">
              <ThumbUpTwoToneIcon/>
            </ToggleButton>
            <ToggleButton color="error" value="not_helpful">
              <ThumbDownTwoToneIcon/>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Stack>
    </CardContent>
    </Paper>
  </Card>
  )
}