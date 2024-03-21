const Student = require('../Model/studentsModel');
//const catchAsync = require('../utiles/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.setEventIDForStudent = (req, res, next) => {
  //allow to set tour and user when they are not in the Body
  if (!req.body.eventID) req.body.eventID = req.params.id;
  next();
};
//this functions for the admin
exports.getAllStudents = handlerFactory.getAllOne(Student);
exports.getStudent = handlerFactory.getOne(Student);
exports.createStudent = handlerFactory.createOne(Student);
//don't use this to update password
exports.updateStudent = handlerFactory.updateOne(Student);
exports.deleteStudent = handlerFactory.deleteOne(Student);
