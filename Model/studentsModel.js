/* eslint-disable no-shadow */
/* eslint-disable prefer-arrow-callback */
//const crypto = require('crypto');
const mongoose = require('mongoose');
//const validatore = require('validator');
//const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'anonymes',
  },
  eventID: {
    type: String,
  },
  active: {
    type: String,
    default: true,
    select: false,
  },
});

studentSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});
//studentSchema.statics.calcNumberOfStudentsForEvent =

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
