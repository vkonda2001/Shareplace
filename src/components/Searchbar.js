import React from 'react'
import SearchIcon from '@mui/icons-material/Search';
import {Input} from "@mui/material";

const Searchbar = ({placeholder, onChange}) => {
  // const getSearchbar = ()=>{
  //   const handleChange =(value) =>{
  //     console.log(value);
  //   };
  //   return(
  //     <Searchbar
  //       placeholder = "Find the place"
  //       onChange={(event) => handleChange(event.target.value)}
  //     />
  //   )
  // }
  return (
    <div>
      <SearchIcon/>
      <Input
            placeholder={placeholder}
            onChange={onChange}
      />
    </div>
  )
}


export default Searchbar
