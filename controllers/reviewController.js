const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('./../utils/catchAsync'); Just in case...

exports.setTourUserIDs = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = factory.createOne(Review);
exports.readOneReview = factory.readOne(Review);
exports.readManyReviews = factory.readMany(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deletOne(Review);
