const express = require('express');
const viewsController = require('../Controllers/viewsController');
const authController = require('../Controllers/authController');
//const bookingController = require('../Controllers/bookingController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getAccount);
//router.post('/submit-user-data',authController.protect,viewsController.updateUserData);

router.use(viewsController.alert);
router.get('/', authController.isLoggedIn, viewsController.getStartAB);
router.get('/scancode', authController.isLoggedIn, viewsController.getQRCode);
router.get(
  '/allchallenges',
  authController.isLoggedIn,
  viewsController.getAllChallenges
);
//router.get('/',authController.isLoggedIn ,viewsController.getOverview);
router.get('/overview', authController.isLoggedIn, viewsController.getOverview);
router.get('/tours/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/signup', viewsController.getsignup);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

module.exports = router;
