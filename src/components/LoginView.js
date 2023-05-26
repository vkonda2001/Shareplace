import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router';
import {  NavLink, Link } from 'react-router-dom'
import {auth} from '../firebase-config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async function () {
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseId = userCredential.user.uid;
          localStorage.setItem("firebaseId", firebaseId);
          navigate("/final/home");
      }
      catch (error) {
          alert(error.message);
      }
  }

  const logout = async function () {
      try {
          await signOut(auth);
          localStorage.setItem("firebaseId", "");
          alert("You are now logged out")
      }
      catch (error) {
          alert(error.message);
      }
  }

  function handleChangeEmail(event) {
      setEmail(event.target.value);
  }
  function handleChangePassword(event) {
      setPassword(event.target.value);
  }


  useEffect(() => {
      const authStateChanges = async function() {
          onAuthStateChanged(auth, function (user) {
              if (user) {
                  console.log("logged in");
              }
              else {
                  console.log("not logged in");
              }
          })
      }
      authStateChanges();
  }, []);

    return (
        <div>
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
                Sign in
                </Typography>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    onChange={handleChangeEmail}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    onChange={handleChangePassword}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={login}
                >
                    Login
                </Button>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={logout}
                >
                    Logout
                </Button>
                <Grid container>
                    <Grid item xs>
                    <NavLink href="#" variant="body2">
                    </NavLink>
                    </Grid>
                    <Grid item>
                        <Link to={'/final/register'}>Don't have an account? Sign Up</Link>
                    </Grid>
                </Grid>
            </Box>
            </Container>
        </div>
    );

}