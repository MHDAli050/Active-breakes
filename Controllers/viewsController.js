const Booking = require('../Model/bookingModel');
const Tour = require('../Model/tourModel');
//const User = require("../Model/userModel");
const AppError = require('../utiles/AppError');
const catchAsync = require('../utiles/catchAsync');

exports.getStartAB = catchAsync(async (req, res, next) => {
  // get tours data
  //const tours = await Tour.find();
  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('start-AB', {
      title: 'Active Breakes',
    });
});
exports.getAllChallenges = catchAsync(async (req, res, next) => {
  // get tours data
  //const tours = await Tour.find();
  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('allchallenges', {
      title: 'Active Breakes',
    });
});

exports.getQRCode = catchAsync(async (req, res, next) => {
  // get tours data
  //const tours = await Tour.find();
  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('scancode', {
      title: 'Active Breakes',
    });
});

exports.getOverview = catchAsync(async (req, res, next) => {
  // get tours data
  const tours = await Tour.find();
  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // get tours data
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with this name.', 404));
  }
  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src * data: blob: 'unsafe-inline'; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  // get tours data

  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src * data: blob: 'unsafe-inline'; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('login', {
      title: 'login Page',
    });
});

exports.getsignup = catchAsync(async (req, res, next) => {
  // get tours data

  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src * data: blob: 'unsafe-inline'; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('signup', {
      title: 'sign up Page',
    });
});

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ;connect-src * data: blob: 'unsafe-inline'; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('account', {
      title: 'Your account',
    });
};

// this function when we used action in our Form
//  exports.updateUserData= catchAsync(async(req,res,next)=>{
//     const updatedUser = await User.findByIdAndUpdate(req.user.id,{
//         name:req.body.name,
//         email:req.body.email
//     },
//     {new:true,runValidators:true}
//     );
//     res.status(200).set('Content-Security-Policy',
//     "default-src 'self' https://*.mapbox.com ; connect-src * data: blob: 'unsafe-inline'; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;")
//        .render('account',{
//         title: 'Your account',
//         user:updatedUser
//     });
//  })

exports.getMyTours = catchAsync(async (req, res, next) => {
  // find all Bookings
  const bookings = await Booking.find({ user: req.user.id });

  // find tours from all Bookings that we got
  const toursIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: toursIds } });
  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('overview', {
      title: 'My Bookings',
      tours,
    });
});
// nice and we can reuse it in the future
exports.alert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};
