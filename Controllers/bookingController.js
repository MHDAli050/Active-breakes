const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const catchAsync = require('../utiles/catchAsync');
const Tour = require('../Model/tourModel');
const Booking = require('../Model/bookingModel');
const handlerFactory = require('./handlerFactory');
const User = require('../Model/userModel');

exports.getCheckoutSession = catchAsync(async (req,res,next)=>{
    //get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    // create checkout session

    const session = await stripe.checkout.sessions.create({
       mode: 'payment',
       payment_method_types : ['card'],
      // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&&user=${req.user.id}&&price=${tour.price}`,
      success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
       cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
       customer_email : req.user.email,
       client_reference_id : req.params.tourId,
       line_items : [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name :`${tour.name} Tour`,
                    description : tour.summary,
                    images:[`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                },
                unit_amount: tour.price * 100,
              },
            quantity:1
        }
       ]
    })

    // create session as responce
    res.status(200).json({
        status :'success',
        session
    })
})

// exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
//     // this solution is temporary because it is not secure
//     const {tour,user,price} = req.query ;
//     if (!tour && !user && !price) return next();

//     await Booking.create({tour,user,price});

//     // we don't use next here first to delete the query from the Url with redirect method.

//     res.redirect(req.originalUrl.split('?')[0]); // by calling this url one more time will enter in the same circle but this time without query then we will use returen next() to get out of this function.

// })
const createBookingCheckout =catchAsync(async session =>{
    const tour = session.client_reference_id;
    const user = (await User.findOne({email:session.customer_email})).id;
    const price = session.amount_total / 100;
    await Booking.create({tour,user,price});

})

exports.webhookCheckout=  (req,res,next)=>{
    // stripe-signature will be like this t=234,v1=34jn,v0=mkf // the problem we have used the false signing secret
const signature = req.headers['stripe-signature'];

let event;
try{
    event = stripe.webhooks.constructEvent(req.body,signature,'whsec_GLvw373UIjAvTaf7wbkMnwOXTj7UOBbF')

}catch(err){
 res.status(200).send(`webhook error : ${err.message},${signature}`);
}
if(event.type==='checkout.session.completed')
   createBookingCheckout(event.data.object);
res.status(200).json({recieved : true,e1:event.data.object.client_reference_id, e2:event.data,e3:event.data.object.amount_total});
}

exports.getAllBookings = handlerFactory.getAllOne(Booking);
exports.getBooking = handlerFactory.getOne(Booking);
exports.createBooking =handlerFactory.createOne(Booking);
exports.deleteBooking =handlerFactory.deleteOne(Booking);
exports.updateBooking =handlerFactory.updateOne(Booking);