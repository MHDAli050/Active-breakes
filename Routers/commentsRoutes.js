const express = require('express');
// eslint-disable-next-line import/no-unresolved
const commentsController = require('../Controllers/commentsControllers');
//const authController = require('../Controllers/authController');

const commentsRouter = express.Router({ mergeParams: true });

//Router.use(authController.protect)

commentsRouter.route('/createcomment').post(commentsController.createComment);
//  .patch(commentsController.updateComments);
//commentsRouter.use(authController.protect);
//commentsRouter.route('/:id').get(commentsController.getCommentsByFeedbackId);

module.exports = commentsRouter;
