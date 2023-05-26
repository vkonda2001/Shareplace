import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router';
import {auth} from '../firebase-config';
import {storage} from '../firebase-config';
import { ref, getDownloadURL } from 'firebase/storage';
import axios from "axios";

const theme = createTheme();

export default function RegisterView() {
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password')
    });
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth,  data.get('email'), data.get('password'));
        const firebaseId = userCredential.user.uid;
        localStorage.setItem("firebaseId", firebaseId);

        const profile_url = await getDownloadURL(ref(storage, 'defaultProfile.jpg'));
        const picture_data = {name: "Name", username: firebaseId, email: data.get('email'), password: data.get('password'), firebaseId: firebaseId, profilePicturePath: profile_url}
        await axios.post("https://favoriteplaces.herokuapp.com/api/users/", picture_data);

        navigate("/final/home");
    }
    catch (error) {
        alert(error.message);
    }

  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}