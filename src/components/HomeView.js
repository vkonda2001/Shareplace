import * as React from 'react';
import {useState, useEffect} from 'react';
import {Card,CardContent,CardMedia,CssBaseline,Grid, Container} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {storage} from '../firebase-config';
import { ref, getDownloadURL } from 'firebase/storage';
import axios from "axios";
import { Link } from 'react-router-dom';

const theme = createTheme();

function HomeView() {
  const [places,setPlaces] = useState([]);
  const [placesPicsUrls,setPlacesPicsUrls] = useState("");

  const fetchPlaces = async () => {
      try {
          const response = await axios.get(`https://favoriteplaces.herokuapp.com/api/places`);
          const {data} = response;
          const plcs = [];
          const place_pics_promises = [];
          for (let i=0; i< data.data.length; ++i) { 
              console.log(data.data[i]);
              plcs.push(data.data[i]);
              place_pics_promises.push(getDownloadURL(ref(storage, `${data.data[i].firebaseId}/places/${data.data[i].placePicturePath}.jpg`)))
          }
          const places_urls = await Promise.all(place_pics_promises);
          setPlaces(plcs.reverse());
          setPlacesPicsUrls(places_urls.reverse());
      }
      catch (error) {
          alert(error.message);
      }
  }

  useEffect(() => {
    fetchPlaces();
  }, []);

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />     
        <main>
          <Container sx={{ py: 8 }} maxWidth="md">
            <Grid container spacing={4}>
              {places.map((place, index) => (
                <Grid item key={place} xs={12} sm={6} md={4}>
                  <Card>
                    <Link to={`/final/friends/${place.userId}`}>
                      <CardMedia
                        component="img"
                        sx={{pt: '20%'}}
                        image={placesPicsUrls[index]}
                        alt="random"
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                      </CardContent>
                    </Link>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </main>
      </ThemeProvider>
    );
}

export default HomeView;
