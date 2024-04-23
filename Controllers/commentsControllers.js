const Comment = require('../Model/commentModel');
//const catchAsync = require('../utiles/catchAsync');
const handlerFactory = require('./handlerFactory');

/*exports.setUserId = (req, res, next) => {
  //allow to set tour and user when they are not in the Body
  if (!req.body.user) req.body.user = req.user.id;
  next();
};*/
exports.getAllComments = handlerFactory.getAllOne(Comment);
exports.getComment = handlerFactory.getOne(Comment);
exports.createComment = handlerFactory.createOne(Comment);
exports.deleteComment = handlerFactory.deleteOne(Comment);
exports.updateComment = handlerFactory.updateOne(Comment);
