const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Choose a rating between 1 and 5']
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  {
    toJSON: { virtuals: true }, // Indica que os campos virtuais sejam incluídos no output
    toObject: { virtuals: true } // Indica que os campos virtuais sejam incluídos no output
  }
);

reviewSchema.pre(/^find/, function(next) {
  /* VOCÊ FEZ ASSIM:
  this.populate({
    path: 'user tour',
    select: '-__v -_id -passwordChangedAt'
  }); */

  this.populate({
    path: 'tour',
    select: 'name'
  }).populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
