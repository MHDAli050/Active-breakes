const Review = require('../Model/reviewModel');
//const catchAsync = require('../utiles/catchAsync');
const handlerFactory = require('./handlerFactory');



exports.setTourAndUserIds = (req,res,next)=>{
    //allow to set tour and user when they are not in the Body
    if(!req.body.tour)req.body.tour=req.params.tourId;
    if(!req.body.user)req.body.user=req.user.id;
    next();
}
exports.getAllReviews = handlerFactory.getAllOne(Review);
exports.getReview = handlerFactory.getOne(Review);
exports.createReview =handlerFactory.createOne(Review);
exports.deleteReview =handlerFactory.deleteOne(Review);
exports.updateReview =handlerFactory.updateOne(Review);