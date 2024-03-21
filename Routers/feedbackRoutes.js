const express = require('express');
const feedbackController = require('../Controllers/feedbackControllers');
//const authController = require('../Controllers/authController');

const feedbackRouter = express.Router({ mergeParams: true });

//Router.use(authController.protect)

feedbackRouter
  .route('/createfeedback')
  .post(feedbackController.createFeedback)
  .patch(feedbackController.updateFeedback);
//feedbackRouter.use(authController.protect);
feedbackRouter.route('/:id').get(feedbackController.getFeedbackByUserId);

module.exports = feedbackRouter;
