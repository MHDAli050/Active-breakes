/* eslint-disable no-shadow */
/* eslint-disable prefer-arrow-callback */
//const crypto = require('crypto');
const mongoose = require('mongoose');
//const validatore = require('validator');
//const bcrypt = require('bcrypt');
const qr = require('qrcode');
//const fs = require('fs');
//const path = require('path');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'the event must have a title'],
  },
  espId: {
    type: String,
    required: [true, 'the event must have a espId to connect'],
  },
  date: {
    type: String,
    required: [true, 'the event must have a Date'],
  },
  time: {
    type: String,
    required: [true, 'the event must have a time'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    max: [5, 'the rat must be at the most 5 '],
    min: [1, 'the rat must be at least 1 '],
    set: (val) => Math.round(val * 10) / 10, // 4.66666 , 46.6666 , 47 , 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  AveRatingsList: [
    {
      type: Number,
      default: 1,
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Event must belong to a User'],
  },
  qrevent: { type: String, default: 'Hello.png' },
  scans: { type: Number, default: 0 },
});

eventSchema.virtual('feedbacks', {
  ref: 'Feedback',
  foreignField: 'event',
  localField: '_id',
});

eventSchema.pre('save', function () {
  //this points to current review
  this.date = new Date(this.date).toISOString().split('T')[0];
});
eventSchema.post('save', async function () {
  //this points to current review
  this.date = new Date(this.date).toISOString().split('T')[0];
  const websiteURL = `http://192.168.43.60:3000/vote/${this._id}`;
  const qrImagePath = `public/img/qrcode/qrevent-${this._id}.png`;
  this.qrevent = `qrevent-${this._id}.png`;
  await qr.toFile(qrImagePath, websiteURL, { errorCorrectionLevel: 'H' });
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
