const Event = require('../Model/eventModel');
//const catchAsync = require('../utiles/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.setUserId = (req, res, next) => {
  //allow to set tour and user when they are not in the Body
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = handlerFactory.getAllOne(Event);
exports.getReview = handlerFactory.getOne(Event);
exports.createEvent = handlerFactory.createOne(Event);
exports.deleteReview = handlerFactory.deleteOne(Event);
exports.updateReview = handlerFactory.updateOne(Event);
