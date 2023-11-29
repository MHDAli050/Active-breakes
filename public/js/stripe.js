/* eslint-disable */

//const { post } = require("../../app");
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
//const stripe = Stripe('pk_test_51MxotfGr3oaU4oB2I0HkmY4YacEet4pxKKd7AzKHIZoepSFOIlMq4kFRGcYwI6wztgrutSpgzmeQ6OJJdZwGylNb00IpXAjiwc')
import { showAlert } from "./alert";
import Stripe from "stripe";

export const bookTour= async (tourId)=>{
    try {
   const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
       );
       const stripe = await loadStripe('pk_test_51MxotfGr3oaU4oB2I0HkmY4YacEet4pxKKd7AzKHIZoepSFOIlMq4kFRGcYwI6wztgrutSpgzmeQ6OJJdZwGylNb00IpXAjiwc');
       await stripe.redirectToCheckout({
        sessionId : session.data.session.id,
       });

    }catch(err){
        console.log(err)
        showAlert('error',err)
    }
}



