import React, { useState } from 'react';
import { Avatar, Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { LoadingButton } from '@mui/lab';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => mutation.mutate(data);

  const submitSignUp = (bodyFormData) => {
    console.log(bodyFormData);
    return axios.post('/api/user/', bodyFormData); // Adjust the API endpoint for sign-up
  };

  const mutation = useMutation({
    mutationFn: submitSignUp,
    onSuccess: (res) => {
      if (res.status === 200) {
        // Handle successful sign-up, e.g., redirect to login page
        navigate('/signin');
      }
    },
  });

  return (
    <Grid container justifyContent="center" padding={2}>
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
            Sign Up Page
          </Typography>
          <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} mt={2}>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              type="text"
              autoFocus
              {...register('username', { required: true })}
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              autoComplete="email"
              type="email"
              {...register('email', { required: true })}
            />
            <FormControl sx={{ m: 1 }} variant="outlined">
              <InputLabel required htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                required
                {...register('password', { required: true })}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
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
                Sign Up
              </LoadingButton>
            </Stack>
            {mutation.isError && (
              <Grid container justifyContent="center">
                <Typography color="error">Error</Typography>
              </Grid>
            )}
          </Stack>
          <Button
            variant="outlined"
            onClick={() => navigate('/signin')} // Navigate to the login page
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}