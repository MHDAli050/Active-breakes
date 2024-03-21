const express = require('express');

const dotenv = require('dotenv');

dotenv.config({ path: `./config.env` });
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const cookieparser = require('cookie-parser');
const bodyParser = require('body-parser');

const bookingController = require('./Controllers/bookingController');

const viewsRoutes = require('./Routers/viewsRoutes');
//const toursRoutes = require('./Routers/toursRoutes');
const usersRoutes = require('./Routers/usersRoutes');
//const reviewRoutes = require('./Routers/reviewRoutes');
//const bookingRoutes = require('./Routers/bookingRoutes');
const eventRoutes = require('./Routers/eventRoutes');
const feedbackRoutes = require('./Routers/feedbackRoutes');

const AppError = require('./utiles/AppError');
const errorHandlingControler = require('./Controllers/errorHandlingControler');
const sseRoute = require('./Routers/SSERoutes');

const app = express();
//set the View Engine
app.set('view engine', 'pug');
//Serving static files
//app.use(express.static(`${__dirname}`));
app.use(express.static(path.join(__dirname, 'public')));
// set the views folder
app.set('views', path.join(__dirname, 'views'));
// Gloubal Middelware
//impelment cors
app.use(cors());
// app.use(cors({
//     origin:'https://www.natours.com'
// }));
app.options('*', cors());

//for specific Route
//app.options('/api/v1/tours/:id',cors());
//Set security http headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
); //you can see the docs in githup

//Data Sanitization against NOSQL  query injection .
app.use(mongoSanitize());
// Data sanitizationagainst xss .
app.use(xss());

//Preventing parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'rating',
      'difficulty',
    ],
  })
);

//development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'you have done too many requests please try again one hour leter!',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
//Body parser , reading data from Body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //parser for the submitted data from an URL
app.use(cookieparser());

//test Middelware
// app.use((req,res,next)=>{
//     console.log('Hello from the middle ware ...');
//     next();
// });
//test Middelware
// app.use((req,res,next)=>{
//     req.requestTime = new Date().toISOString();
//     //console.log(req.cookies);
//     next();
// });

//Rout

//app.use('/api/v1/tours', toursRoutes);
app.use('/api/v1/users', usersRoutes);
//app.use('/api/v1/reviews', reviewRoutes);
//app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/sse', sseRoute);
app.use('/', viewsRoutes);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //     status : 'fail',
  //     message: `Can't find ${req.originalUrl} on this server`
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status ='fail';
  // err.statusCode= 404;
  // next(err);

  next(new AppError(`Can't find ${req.originalUrl} on this server`, '404'));
});

//Error Handling Middelware

app.use(errorHandlingControler);

module.exports = app;
