const jwt = require('jsonwebtoken');
const { isObjectIdOrHexString } = require('mongoose');
const { promisify } = require('util');
const Booking = require('../Model/bookingModel');
const Tour = require('../Model/tourModel');
const Event = require('../Model/eventModel');
//const User = require("../Model/userModel");
const AppError = require('../utiles/AppError');
const catchAsync = require('../utiles/catchAsync');
const Student = require('../Model/studentsModel');
const Feedback = require('../Model/feedbackModel');

exports.getStartAB = catchAsync(async (req, res, next) => {
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

exports.getJigsawMethod = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('jigsawMethod', {
      title: 'Gamification',
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

exports.getEvents = catchAsync(async (req, res, next) => {
  // get tours data

  const events = await Event.find({ user: req.user._id });
  console.log(events);
  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('allevents', {
      title: 'All Events',
      events,
    });
});
exports.getOneEvent = catchAsync(async (req, res, next) => {
  // get tours data

  const event = await Event.findById(req.params.id);

  const events = [];
  events.push(event);
  console.log(events);

  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('events', {
      title: 'The Active Event',
      events,
    });
});

exports.getMyEvent = catchAsync(async (req, res, next) => {
  // get tours data
  //it is important here to do the populate process coreectly
  const myevent = await Event.findById(req.params.id).populate({
    path: 'feedbacks',
    populate: { path: 'comments' },
  });

  // Build the Template
  // Render the tours in the template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('events', {
      title: 'The Active Event',
      myevent,
    });
});
exports.reloadVote = catchAsync(async (token, req, res, next) => {
  try {
    //Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const expirationTime = decoded.exp * 1000; // Convert expiration time to milliseconds
    const currentTime = new Date().getTime(); // Current time in milliseconds

    if (currentTime > expirationTime) {
      console.log(currentTime, expirationTime, 'Token has expired');
    } else {
      console.log(currentTime, expirationTime, 'Token is still valid');
    }

    //check if the user still exist
    const newStudent = await Student.findById(decoded.id);

    if (!newStudent) {
      this.studentSignup(req, res, next);
    } else {
      //if the id has been changed handel it
      // eslint-disable-next-line no-lonely-if
      if (req.params.id !== newStudent.eventID) {
        //New voting Event
        if (isObjectIdOrHexString(req.params.id)) {
          const newevent = await Event.findById(req.params.id);
          if (newevent) {
            // passend the body request with the new Event-Id
            req.body.eventID = req.params.id;
            // make a new student accout for the new Voting process
            this.studentSignup(req, res, next);
            console.log(
              'Hello from the new voting session , try to solve the validation problem'
            );
          }
        } else {
          //if the user have problems with id or try to manipulate "changing" the Id
          req.params.id = newStudent.eventID;
          res.redirect(`/vote/${newStudent.eventID}`);
        }
      } else {
        const currentFeedback = await Feedback.findOne({
          event: req.params.id,
          user: newStudent.id,
        }).populate({ path: 'comments' });
        const currentEvent = await Event.findById(req.params.id);
        const voteObject = { currentFeedback, newStudent, currentEvent };
        console.log(voteObject);
        res
          .status(200)
          .set(
            'Content-Security-Policy',
            " connect-src * data: blob: 'unsafe-inline';"
          )
          .render('vote', {
            title: 'Go Vote ',
            voteObject,
          });
      }
    }
  } catch (error) {
    // Token verification failed (invalid token or signature)

    console.error('Error: ', error.message);
  }
});
const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.studentSignup = catchAsync(async (req, res, next) => {
  //this important to be sure that i am voting for an existing event
  if (!isObjectIdOrHexString(req.params.id))
    return next(
      new AppError('This Event not exist to vote , no event id', 400)
    );
  const checkEvent = await Event.findById(req.params.id);
  if (!checkEvent)
    return next(new AppError('This Event not exist to vote', 400));
  // now i create the student when everything is okay
  const newStudent = await Student.create(req.body);
  if (!newStudent) {
    return next(new AppError('There is no Document was created', 400));
  }
  const token = signToken(newStudent._id);
  const optionsCookie = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true, //to save the cookie just in the Browser and not in the local storge to avoid xss secripting attack.
    secure: req.secure, //|| req.headers('x-forwarded-proto')==='https'
  };
  // if(process.env.NODE_ENV==='production') optionsCookie.secure=true;
  console.log(
    process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000,
    optionsCookie.expires
  );
  const currentFeedback = await Feedback.findOne({
    event: req.params.id,
    user: newStudent.id,
  }).populate({ path: 'comments' });
  const currentEvent = await Event.findById(req.params.id);
  const voteObject = { currentFeedback, newStudent, currentEvent };
  console.log(voteObject);
  res.cookie('jwt', token, optionsCookie);
  res
    .status(201)
    .set(
      'Content-Security-Policy',
      " connect-src * data: blob: 'unsafe-inline';"
    )
    .render('vote', {
      title: 'Go Vote ',
      voteObject,
    });
});
exports.getGoVote = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    this.reloadVote(token, req, res, next);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    this.reloadVote(token, req, res, next);
  } else {
    this.studentSignup(req, res, next);
  }
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

exports.getcreateevent = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src * data: blob: 'unsafe-inline'; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('createevent', {
      title: 'create event Page',
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
