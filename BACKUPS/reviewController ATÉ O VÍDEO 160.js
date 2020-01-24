const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsyncErrors = require('./../utils/catchAsync');

exports.createReview = catchAsyncErrors(async (req, res) => {
  const { review, rating } = req.body;
  let { tour, user } = req.body;

  // Allow nested routes
  if (!tour) tour = req.params.tourId;
  if (!user) user = req.user.id;

  const newReview = await Review.create({ review, rating, tour, user });

  res.status(201).json({
    status: 'success',
    data: {
      newReview
    }
  });
});

exports.getReviews = catchAsyncErrors(async (req, res) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }; // Também para nested routes.

  const features = new APIFeatures(Review.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});
