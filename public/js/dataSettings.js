/* eslint-disable */
import axios from "axios";

import { showAlert } from "./alert";

export const updateSettings= async (data,type)=>{
    const url = type==='password'? "/api/v1/users/updateMyPassword" : "/api/v1/users/updateMe";

    try {
   const res = await axios({
        method:'PATCH',
        url,
        data
    })
    if(res.data.status === 'success'){
        showAlert('success',`${type.toUpperCase()} successfly updated!`);
        // window.setTimeout(()=>{
        //     location.assign('/Me');
        // },1500)
    }
    }catch(err){
        showAlert('error',err.response.data.message)
       
    }
}