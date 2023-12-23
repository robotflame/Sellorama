import { Avatar, Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { LoadingButton } from "@mui/lab";
import { useMutation } from "react-query";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useForm } from "react-hook-form"
import { LoggedInContext } from "../main";


export default function SignIn() {

  const navigate = useNavigate()

  const loginContext = useContext(LoggedInContext)

  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => mutation.mutate(data)

  const submitLogin = async (bodyFormData) => {
    return axios.post("/api/token/", bodyFormData)
  }

  const mutation = useMutation({
    mutationFn: submitLogin,
    onSuccess: (res) => {
      if (res.status == 200) {
        if (res.data)
          	localStorage.setItem("JWT_TOKEN", res.data)
            loginContext.setLogin(true)
            navigate("/") 
      }
    }
  })

  return (
    <Grid container justifyContent={"center"} padding={2}>
      <Grid item>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ mb: 1, bgcolor: 'secondary.main' }}>
          </Avatar>
          <Typography component="h1" variant="h5">
              Login Page
          </Typography>
          <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} mt={2}>
            <TextField
              required
              fullWidth
              id="email"
              label={"email"}
              autoComplete="email"
              type="email"
              autoFocus
              error={mutation.isError}
              {...register("Email", {required: true})}
            />
            <FormControl sx={{ m: 1}} variant="outlined">
              <InputLabel error={mutation.isError} required htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                label={"Password"}
                required
                error={mutation.isError}
                {...register("password", {required: true})}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                      color={mutation.isError ? "error" : "default"}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Stack direction="row" spacing={1}>
              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                loading={mutation.isLoading}
              >
                Login
                
              </LoadingButton>
             
              
            </Stack>
            
            
            {
              mutation.isError && (
                <Grid container justifyContent={"center"}>
                  <Typography color="error">Error</Typography>
                </Grid>
              )
            }
          </Stack>
          {/* Sign Up Button */}
          <Button
            variant="outlined"
            onClick={() => navigate('/signup')} // Navigate to the sign-up page
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}