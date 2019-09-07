const express = require('express');

const router = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    protect,
    restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview
  );
router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(protect, restrictTo('admin'), reviewController.deleteReview);

module.exports = router;
