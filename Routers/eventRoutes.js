const express = require('express');
const eventController = require('../Controllers/eventsController');
const authController = require('../Controllers/authController');

const eventsRoute = express.Router();

//Events

eventsRoute.use(authController.protect);
eventsRoute.post(
  '/createevent',
  eventController.setUserId,
  eventController.createEvent
); // here protect is importent to return the user from it

module.exports = eventsRoute;
