const express = require('express');

const router = express.Router({ mergeParams: true });

const { protect, restrictTo } = require('./../controllers/authController');

const {
  setTourUserIDs,
  createReview,
  readOneReview,
  readManyReviews,
  updateReview,
  deleteReview
} = require('./../controllers/reviewController');

router.use(protect);

router
  .route('/')
  .get(readManyReviews)
  .post(restrictTo('tourist'), setTourUserIDs, createReview);

router
  .route('/:id')
  .get(restrictTo('tourist'), readOneReview)
  .patch(restrictTo('tourist', 'admin'), updateReview)
  .delete(restrictTo('tourist', 'admin'), deleteReview);

module.exports = router;
