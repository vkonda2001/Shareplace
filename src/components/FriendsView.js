import {Paper,Grid,Box,Card,Typography,CardContent,Avatar,Button,InputBase,IconButton} from "@mui/material"
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {storage} from '../firebase-config';
import { ref, getDownloadURL } from 'firebase/storage';
import axios from "axios";

function FriendsView(){
    const [friends,setFriends] = useState([]);
    const [filter,setFilter] = useState(null);
    const [friendsPic, setFriendsPic] = useState("");
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchUser = async () => {
            let filter = {
                firebaseId: localStorage.getItem("firebaseId")
            }
            const response = await axios.get("https://favoriteplaces.herokuapp.com/api/users?where=" + JSON.stringify(filter));
            const { data } = response;
            setUser(data.data[0]);
        }
        const fetchFriends = async () => {
            const response = await axios.get("https://favoriteplaces.herokuapp.com/api/users");
            const { data } = response;
            setFriends(data.data);
            const promises = []
            data.data.forEach((user) => {
                promises.push(getDownloadURL(ref(storage, `${user.firebaseId}/profile/${user.profilePicturePath}.jpg`)));
            });
            const pics = await Promise.all(promises);
            setFriendsPic(pics);
        }
        fetchUser();
        fetchFriends();
    },[])
    const handleRemoveFriend = (e) => {
        e.stopPropagation();
        const data = {
            friendToRemove: e.target.value
        }
        axios.patch(`https://favoriteplaces.herokuapp.com/api/users/${user._id}/` , data)
        .then(function (response) {
            const { data } = response;
            setUser(data);
        });   
    }
    const handleAddFriend = (e) => {
        e.stopPropagation();
        const data = {
            friendToAdd: e.target.value
        }
        axios.patch(`https://favoriteplaces.herokuapp.com/api/users/${user._id}/` , data)
        .then(function (response) {
            const { data } = response;
            setUser(data);
        });   
    }
    const getFriendCard = (friend,index) => {
        return (
                <Grid key = {friend._id} item xs = {12} >
                    <Card sx = {{my: "10px", mx: "auto",width:"80%"}} onClick = {() => navigate(`/final/friends/${friend._id}`) }>
                        <CardContent sx = {{borderRadius: 2, display:"flex", alignItems:"center"}}>
                            <Avatar alt={friend.name} src= {friendsPic[index]}/>
                            <Typography sx = {{ml: 2, width:"40%"}}> {friend.name}</Typography >
                            {user.friends.includes(friend._id) 
                            ?  <Button value = {friend._id} onClick = {handleRemoveFriend} color = "error" sx = {{minWidth:"25%",ml:"20%", borderRadius:8}} variant= "contained">Remove Friend</Button>
                            :  <Button value = {friend._id} onClick = {handleAddFriend} color = "success" sx = {{minWidth:"25%", ml:"20%", borderRadius:8}} variant= "contained">Add Friend</Button>
                            }
                        </CardContent>
                    </Card>
                </Grid>
        )
    };
    const handleSearchChange = (e) => {
        if(e.target.value === ""){
            setFilter(null);
        }else{
            setFilter(e.target.value);
        }
    };

    return (
            <Box sx = {{mx:"auto",minHeight: "100vh", width: "50%", backgroundColor: "lightgrey"}}>
                <Grid container >
                    <Grid item xs = {12} sx = {{my: 2 ,height: "50px"}}>
                        <Paper sx ={{mx:"auto",width: "300px" }}>
                            <InputBase sx={{ ml: 1, width: "80%"}} placeholder="Find Friends" onChange={handleSearchChange}/>
                            <IconButton>
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                    </Grid>
                    {friends.map((friend,index) => friend.name.includes(filter) && (friend._id !== user._id) && getFriendCard(friend,index))}
                </Grid>
            </Box> 
    )
}

export default FriendsView