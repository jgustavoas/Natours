const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
    path: 'user',
    select: 'name photo'
  });

  next();
});

// Usando "static method" para calcular rating médio dos tours
reviewSchema.statics.calcAvgRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        numberOfRating: { $sum: 1 }, // Soma 1 a cada match encontrado
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // console.log(stats);
  /*
  O "console.log(stats)" acima retorna por exemplo:
  [
  {
    _id: 5e29f12ef5347346e6ee0cbd,
    numberOfRating: 6,
    avgRating: 4.416666666666667
  }
]
  Note que é uma array com um objeto, cujos elementos serão usados na query a seguir.
*/

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numberOfRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // "this" points to the current review
  this.constructor.calcAvgRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log('pre', this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  // console.log('post', this.r);
  await this.r.constructor.calcAvgRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
