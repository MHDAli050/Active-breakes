const express = require('express');
const bookingController = require('../Controllers/bookingController');
const authController = require('../Controllers/authController');

const Router = express.Router();

Router.use(authController.protect)

Router.get('/checkout-session/:tourId',bookingController.getCheckoutSession) ;

Router.use(authController.restricted('admin','lead-guide'));

Router.route('/').get(bookingController.getAllBookings).post(bookingController.createBooking);

Router.route('/:id').get(bookingController.getBooking).patch(bookingController.updateBooking).delete(bookingController.deleteBooking);

module.exports = Router;

   

