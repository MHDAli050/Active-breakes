const mongoose = require('mongoose');
//const feedback = require('./feedbackModel');

//const slugify = require('slugify');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      //required: [true, 'you should inter your Comment'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    suggestion: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: mongoose.Schema.ObjectId,
      ref: 'Feedback',
      required: [true, 'comment must belong to a Feedback'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
