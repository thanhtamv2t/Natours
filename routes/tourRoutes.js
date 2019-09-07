const express = require('express');

const router = express.Router();

const tourController = require('./../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

// router.param('id', tourController.checkID); //can be use for check condition for many routes

router.route('/stats').get(tourController.getTourStats);

router
  .route('/')
  .get(tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createATours);
  .post(tourController.createATours);

router
  .route('/:id')
  .get(tourController.getATours)
  .patch(tourController.updateATours)
  .delete(
    protect,
    restrictTo('admin', 'tour-lead'),
    tourController.deleteATours
  );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
