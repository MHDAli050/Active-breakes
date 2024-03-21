const mongoose = require('mongoose');
const Event = require('./eventModel');

//const slugify = require('slugify');

const feedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      //required: [true, 'you should inter your review'],
    },
    rating: {
      type: Number,
      min: [1, 'your rate must be more than 1'],
      max: [5, 'your rate must be less than 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: 'Event',
      required: [true, 'feedback must belong to an Event'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'feedback must belong to a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
feedbackSchema.index({ event: 1, user: 1 }, { unique: true });
feedbackSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

feedbackSchema.statics.calcAverageRating = async function (eventId, rating) {
  const stats = await this.aggregate([
    {
      $match: { event: eventId },
    },
    {
      $group: {
        _id: '$event',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
      rating: rating,
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
      rating: 4.5,
    });
  }
};

feedbackSchema.post('save', function () {
  //this points to current review
  this.constructor.calcAverageRating(this.event, this.rating);
});
//findOneAndDelete
//findOneAndUpdate
feedbackSchema.pre(/^findOneAnd/, async function (next) {
  //clone is important because Mongoose no longer allows executing the same query object twice.
  this.r = await this.findOne().clone();

  next();
});
feedbackSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.event, this.r.rating);
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
