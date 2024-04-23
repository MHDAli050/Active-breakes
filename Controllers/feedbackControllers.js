const Feedback = require('../Model/feedbackModel');
const catchAsync = require('../utiles/catchAsync');
//const catchAsync = require('../utiles/catchAsync');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utiles/AppError');

//exports.setTourAndUserIds = (req, res, next) => {
//allow to set tour and user when they are not in the Body
//if (!req.body.tour) req.body.tour = req.params.tourId;
//if (!req.body.user) req.body.user = req.user.id;
//next();
//};
exports.getFeedbackByUserId = catchAsync(async (req, res, next) => {
  const doc = await Feedback.findOne({ user: req.params.id });
  if (!doc) {
    //return next(new AppError('There is no Document with this Id', 404));
    return res.status(208).json({
      status: 'notsuccess',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
exports.getAllFeedbacks = handlerFactory.getAllOne(Feedback);
exports.getFeedback = handlerFactory.getOne(Feedback);
exports.createFeedback = handlerFactory.createOne(Feedback);
exports.deleteFeedback = handlerFactory.deleteOne(Feedback);
exports.updateFeedback = catchAsync(async (req, res, next) => {
  const doc = await Feedback.findOneAndUpdate(
    { user: req.body.user },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
    return next(new AppError('There is no Document with this Id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
});
//exports.updateFeedback = handlerFactory.updateOne(Feedback);
