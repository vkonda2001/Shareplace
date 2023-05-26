import {ListItem,TextField,Box,Grid,Avatar,Typography,Button,Modal,Badge,Paper,Card,CardContent,List,CardMedia, IconButton} from "@mui/material"
import { useParams } from "react-router"
import Map, {NavigationControl, Marker} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import {storage} from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const rootBox = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
}
const mapBox = {
    height: "80%",
    width: "80%",
}
const mapGridItem = {
    display: "flex",
    justifyContent: "center",
    alignItems:"center"
}
const modal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

function UserView() {
    var { id } = useParams();
    const [user,setUser] = useState({});
    const [places,setPlaces] = useState([]);
    const [open, setOpen] = useState(false);
    const [openPic,setOpenPic] = useState(false);
    const [openPlace,setOpenPlace] = useState(false);
    const [name, setName] = useState("");
    const [email,setEmail] = useState("");
    const [profilePicture,setProfilePicture] = useState("");
    const [placesPicsUrls,setPlacesPicsUrls] = useState("");
    const [file,setFile] = useState({});
    const [isUser,setIsUser] = useState(false);
    const [currUser,setCurrUser] = useState({});
    const [long, setLong] = useState(-88.2272913694345);
    const [lat, setLat] = useState(40.10751478980266);
    const [placeName,setPlaceName] = useState("");
    const [placeDesc,setPlaceDesc] = useState("");
    useEffect(() => {
        const fetchCurrUser = async () => {
            let filter = {
                firebaseId: localStorage.getItem("firebaseId")
            }
            const response = await axios.get("https://favoriteplaces.herokuapp.com/api/users?where=" + JSON.stringify(filter));
            const { data } = response;
            setCurrUser(data.data[0]);
        }
        const fetchUser = async () => {
            var response = undefined;
            var data = undefined;
            if(id){
                response = await axios.get(`https://favoriteplaces.herokuapp.com/api/users/${id}/`);
                data = response.data;
            }else{
                let filter = {
                    firebaseId: localStorage.getItem("firebaseId")
                }
                response = await axios.get("https://favoriteplaces.herokuapp.com/api/users?where=" + JSON.stringify(filter));
                data = response.data.data[0]
                // eslint-disable-next-line
                id = data._id
            }

            if(data.firebaseId === localStorage.getItem("firebaseId")){
                setIsUser(true);
            }
            setUser(data);
            setName(data.name);
            setEmail(data.email);
            const profile_url = await getDownloadURL(ref(storage, `${data.firebaseId}/profile/${data.profilePicturePath}.jpg`));
            setProfilePicture(profile_url);
            const promises = [];
            if(data.places){
                data.places.forEach((place) => {
                    promises.push(axios.get(`https://favoriteplaces.herokuapp.com/api/places/${place}`));
                })
                const places_data = await Promise.all(promises);
                const plcs = [];
                places_data.forEach((data) => {
                    plcs.push(data.data.data)
                })
                const pics_promises = []
                plcs.forEach((place) => {
                    pics_promises.push(getDownloadURL(ref(storage, `${data.firebaseId}/places/${place.placePicturePath}.jpg`)))
                })
                const pics_urls = await Promise.all(pics_promises);
                setPlacesPicsUrls(pics_urls);
                setPlaces(plcs);
            }
        }
        fetchCurrUser();
        fetchUser();
    // eslint-disable-next-line
    }, []);
    //pic edit
    const handleOpenEditProfilePic = () => {
        setOpenPic(true);
    }
    const handleCloseEditProfilePic = () => {
        setOpenPic(false);
        setFile({});
    }
    const handleSaveEditProfilePic = async () => {
        await uploadBytes(ref(storage, `${user.firebaseId}/profile/${user.profilePicturePath}.jpg`), file);
        const profile_url = await getDownloadURL(ref(storage, `${user.firebaseId}/profile/${user.profilePicturePath}.jpg`));
        setProfilePicture(profile_url);
    }
    //profile edit
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
        setName(user.name);
        setEmail(user.email);
    }
    const handleSaveEdit = () => {
        const data = {...user, name, email};
        axios.patch(`https://favoriteplaces.herokuapp.com/api/users/${currUser._id}/` , data)
        .then(function (response) {
            const { data } = response;
            setUser(data);
            setName(data.name);
            setEmail(data.email);
        });
    }
    //adding friend
    const handleAddFriend = () => {
        const data = {
            friendToAdd: id
        }
        axios.patch(`https://favoriteplaces.herokuapp.com/api/users/${currUser._id}/` , data)
        .then(function (response) {
            const { data } = response;
            setCurrUser(data);
        }); 
    }
    //removing friend
    const handleRemoveFriend = () => {
        const data = {
            friendToRemove: id
        }
        axios.patch(`https://favoriteplaces.herokuapp.com/api/users/${currUser._id}/` , data)
        .then(function (response) {
            const { data } = response;
            setCurrUser(data);
        }); 
    }
    //add place
    const handleCloseAddPlace = () => {
        setOpenPlace(false);
        setFile({});
        setPlaceDesc("");
        setPlaceName("");
    }
    //delete place
    const handleDeletePlace = async (e,index) => {
        const updated_places = [...places];
        const id = places[index]._id;
        updated_places.splice(index,1);
        await axios.delete(`https://favoriteplaces.herokuapp.com/api/places/${id}`);
        setPlaces(updated_places);
        const updated_pics = [...placesPicsUrls];
        updated_pics.splice(index,1);
        setPlacesPicsUrls(updated_pics);
    }
    const handleAddPlace = async (e) => {
        const userId = currUser._id;
        const coordinates = [lat, long];
        const description = placeDesc;
        const placePicturePath = placeName;
        const data = {name: placeName, userId,firebaseId: currUser.firebaseId, description,coordinates,placePicturePath}
        await uploadBytes(ref(storage, `${user.firebaseId}/places/${placePicturePath}.jpg`), file);
        const new_place = await axios.post("https://favoriteplaces.herokuapp.com/api/places/",data);
        const url = await getDownloadURL(ref(storage, `${user.firebaseId}/places/${placePicturePath}.jpg`));
        setPlacesPicsUrls([...placesPicsUrls, url]);
        setPlaces([...places, new_place.data.data]);
    }
    return (
            <Box sx = {rootBox}>
                <Modal sx = {{backdropFilter: "blur(1px)"}} hideBackdrop open = {openPlace}>
                    <Box sx ={{...modal, width:400, height: 400}}>
                        <Grid container>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}} >
                                    <Typography>Move red marker to assign location</Typography>
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}} >
                                    <TextField onChange = {(e)=> {setPlaceName(e.target.value)}} sx = {{width: "80%"}} label="Name" variant="outlined" />
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}} >
                                    <TextField onChange = {(e)=> {setPlaceDesc(e.target.value)}} sx = {{width: "80%"}} label="Description" variant="outlined" />
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}} >
                                    <Typography>Must choose an Image To Display</Typography>
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                    <TextField onChange = {(e) => {setFile(e.target.files[0])}} type="file"></TextField>
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                    <Button onClick = {handleAddPlace} sx = {{borderRadius: 8}} variant= "contained" >Add</Button>
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                    <Button sx = {{borderRadius: 8}} variant= "contained" onClick={handleCloseAddPlace}>Close</Button>  
                                </Grid>
                        </Grid>
                    </Box>
                </Modal>
                <Modal sx = {{backdropFilter: "blur(1px)"}} hideBackdrop open = {openPic} >
                    <Box sx ={{...modal, width:300, height: 200}}>
                        <Grid container>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                    <TextField onChange = {(e) => {setFile(e.target.files[0])}} type="file"></TextField>
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                    <Button onClick = {handleSaveEditProfilePic} sx = {{borderRadius: 8}} variant= "contained" >Save Image</Button>
                                </Grid>
                                <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                    <Button sx = {{borderRadius: 8}} variant= "contained" onClick={handleCloseEditProfilePic}>Close</Button>  
                                </Grid>
                        </Grid>
                    </Box>
                </Modal>
                <Modal sx= {{backdropFilter: "blur(1px)"}} hideBackdrop open={open} >
                    <Box sx={{ ...modal, width: 500 }}>
                        <Grid container>
                            <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}} >
                                <TextField onChange = {(e)=> {setName(e.target.value)}} defaultValue = {name} sx = {{width: "80%"}} label="Name" variant="outlined" />
                            </Grid>
                            <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}} >
                                <TextField onChange = {(e)=> {setEmail(e.target.value)}} defaultValue = {email} sx = {{width: "80%"}} label="Email" variant="outlined" />  
                            </Grid>
                            <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                <Button onClick = {handleSaveEdit} sx = {{borderRadius: 8}} variant= "contained" >Save Edit</Button>
                            </Grid>
                            <Grid item xs = {12} sx = {{display: "flex", justifyContent: "center", my: '10px'}}>
                                <Button sx = {{borderRadius: 8}} variant= "contained" onClick={handleClose}>Close</Button>  
                            </Grid>
                        </Grid>
                    </Box>
                </Modal>
                <Grid container>
                    <Grid item xs = {12} sx = {{height: "20%",display: "flex", alignItems: "center"}}>
                    {isUser ? 
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <Paper sx = {{width: 27, height: 27, borderRadius: "50%", backgroundColor:"lightgrey"}}>
                                    <EditIcon />
                                </Paper>
                            }>
                            <Avatar onClick = {handleOpenEditProfilePic}sx = {{height: "100px", width: "100px"}} alt={user.name} src= {profilePicture} />
                        </Badge>
                     :  <Avatar sx = {{height: "100px", width: "100px"}} alt={user.name} src= {profilePicture} />
                    }

                        <Typography sx = {{minWidth: "30%"}}variant="h2"> {user.name}</Typography >
                        <Typography align="center" sx = {{ width: "40%"}} variant="h4"> {places.length} Places</Typography >
                        {isUser
                            ? <Button sx = {{ borderRadius: 8}} variant= "contained" onClick = {handleOpen}>Edit Profile</Button> 
                            : 
                                currUser.friends &&
                                <Button color = {currUser.friends.includes(id) ? "error" : "success"} sx = {{ borderRadius: 8}} variant= "contained" onClick = {currUser.friends.includes(id) ? handleRemoveFriend : handleAddFriend}>{currUser.friends.includes(id) ? "Remove Friend" : "Add Friend"}</Button>
                        } 
                    </Grid>
                    <Grid item xs = {4} sx = {{height: "80%"}}>
                            {isUser && <Box sx = {{width: "100%",display:"flex", justifyContent:"center"}}>
                                <Button onClick = {()=> {setOpenPlace(true)}} sx = {{ my: 2, borderRadius: 8}} variant="contained">Add Place</Button>
                            </Box>}
                            <List sx={{ width: '100%',position: 'relative',overflow: 'auto',maxHeight: "100%",}}>    
                                {places.map((place,index) => (
                                    <ListItem key ={place._id} >
                                        <Card sx = {{ display: "flex", justifyContent: "center",width: "100%" ,height:"300px"}}>
                                            <CardContent sx = {{width: "80%", height: "70%"}}>
                                                {isUser && <Box sx = {{width: "100%",display:"flex", justifyContent:"flex-end"}}>
                                                    <IconButton onClick = {(e) => {handleDeletePlace(e,index)}} color="error" position="right">
                                                        <DeleteForeverIcon></DeleteForeverIcon>
                                                    </IconButton>
                                                </Box>}
                                                <CardMedia sx = {{objectFit: "contain", width: "100%", height: "100%"}}component="img" image= {placesPicsUrls[index]} />
                                                <Typography align="center">{place.description}</Typography>
                                            </CardContent>
                                        </Card>
                                    </ListItem>
                                ))}
                            </List>
                    </Grid>
                    <Grid item xs = {8} sx = {mapGridItem} >
                        <Box sx = {mapBox}>
                            <Map mapLib={maplibregl} 
                                initialViewState={{
                                    longitude: 	-88.2272913694345,
                                    latitude: 	40.10751478980266,
                                    zoom: 15
                                }}
                                style ={{borderRadius: 8}}
                                mapStyle="https://api.maptiler.com/maps/streets/style.json?key=AMcqf8cKgwc0fLiGkRLp"
                            >
                            <NavigationControl position="top-left" />
                            {places && places.map((place) => (
                                <Marker key = {place._id} latitude = {place.coordinates[0]} longitude = {place.coordinates[1]}></Marker>
                            ))}
                            {isUser && <Marker scale = {2} onDragEnd ={(e) =>{setLong(e.lngLat.lng); setLat(e.lngLat.lat)}} color="#FF0000" draggable="true" latitude = {lat} longitude = {long}></Marker>}
                            </Map>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
    )
}

export default UserView