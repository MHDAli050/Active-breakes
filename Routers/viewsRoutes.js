const express = require('express');
const viewsController = require('../Controllers/viewsController');
const studentsController = require('../Controllers/studentsController');
const authController = require('../Controllers/authController');
//const bookingController = require('../Controllers/bookingController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getAccount);
//router.post('/submit-user-data',authController.protect,viewsController.updateUserData);

router.use(viewsController.alert);
router.get('/', authController.isLoggedIn, viewsController.getStartAB);
router.get(
  '/vote/:id',
  studentsController.setEventIDForStudent,
  viewsController.getGoVote
);
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
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get('/signup', viewsController.getsignup);
router.use(authController.protect);

router.get('/jigsawMethod', viewsController.getJigsawMethod);
router.get(
  '/createevent',
  authController.isLoggedIn,
  viewsController.getcreateevent
);
router.get(
  '/events/:id',
  authController.isLoggedIn,
  viewsController.getOneEvent
);
router.get(
  '/events/myevent/:id',
  authController.isLoggedIn,
  viewsController.getMyEvent
);
router.get('/allevents', authController.isLoggedIn, viewsController.getEvents);

module.exports = router;
