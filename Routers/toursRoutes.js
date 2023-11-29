const express = require('express');

const toursControllers = require('../Controllers/toursController');

const authController = require('../Controllers/authController');

//const reviewController=require('../Controllers/reviewController')

const reviewRoutes = require('./reviewRoutes');

const toursRouter = express.Router();
toursRouter.use('/:tourId/reviews',reviewRoutes);
//toursRoute.param('id',toursControllers.checkId);
//Tours
toursRouter.route('/top-5-cheap').get(toursControllers.aliasTopTours,toursControllers.getAllTours);
toursRouter.route('/tour-stats').get(toursControllers.getToursStates);
toursRouter.route('/tour-monthly-plan').get(authController.protect,authController.restricted('admin','lead-guide','guide'),toursControllers.getMonthlyPlan);
toursRouter.route('/').get(toursControllers.getAllTours).post(authController.protect,authController.restricted('admin','lead-guide'),toursControllers.creatTour);
toursRouter.route('/:id').get(toursControllers.getTour)
.patch(authController.protect,authController.restricted('admin','lead-guide'),toursControllers.uploadTourimages,toursControllers.resizeImages,toursControllers.updateTour)
.delete(authController.protect,authController.restricted('admin','lead-guide'),toursControllers.deleteTour);
//toursRouter.route('/:tourId/reviews').post(authController.protect,authController.restricted('user'),reviewController.createReview);
toursRouter.route('/tours-within/distance/:distance/center/:latlng/unit/:unit').get(authController.protect,toursControllers.getToursWithIn)
toursRouter.route('/distance/:latlng/unit/:unit').get(authController.protect,toursControllers.getDistance)


module.exports = toursRouter;