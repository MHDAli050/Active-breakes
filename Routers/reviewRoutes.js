const express = require('express');
const reviewController = require('../Controllers/reviewController');
const authController = require('../Controllers/authController')

const Router = express.Router({mergeParams:true});

Router.use(authController.protect)
Router.route('/').get(reviewController.getAllReviews).post(authController.restricted('user'),reviewController.setTourAndUserIds,reviewController.createReview);
Router.route('/:id').get(reviewController.getReview).delete(authController.restricted('user','admin'),reviewController.deleteReview).patch(authController.restricted('user','admin'),reviewController.updateReview)
module.exports = Router;


