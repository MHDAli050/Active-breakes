const express = require('express');
const usersControllers = require('../Controllers/usersControler');
const authController = require('../Controllers/authController');

const usersRoute = express.Router();


//Users
usersRoute.post('/signup',authController.signup);
usersRoute.post('/login',authController.login);
usersRoute.get('/logout',authController.logout);
usersRoute.post('/forgetPassword',authController.forgetPassword);
usersRoute.patch('/restPassword/:token',authController.restPassword);

usersRoute.use(authController.protect);
usersRoute.patch('/updateMyPassword',authController.updatePassword);// here protect is importent to return the user from it
usersRoute.patch('/updateMe',usersControllers.uploadUserPhoto,usersControllers.resizeUserPhoto, usersControllers.updateMe);
usersRoute.delete('/deleteMe', usersControllers.deleteMe);
usersRoute.route('/me').get(usersControllers.getMe,usersControllers.getUser);

usersRoute.use(authController.restricted('admin'));
usersRoute.route('/').get(usersControllers.getAllUsers).post(usersControllers.createUser);
usersRoute.route('/:id').get(usersControllers.getUser).patch(usersControllers.updateUser).delete(usersControllers.deleteUser);



module.exports = usersRoute ; 