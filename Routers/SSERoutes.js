const express = require('express');
const SSEController = require('../Controllers/SSEController');

const sseRoute = express.Router();

//Events

sseRoute.get('/:id', SSEController.updateRating); // here protect is importent to return the user from it

module.exports = sseRoute;
