const express = require('express');

const router = express.Router();

const tourController = require('./../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

// router.param('id', tourController.checkID); //can be use for check condition for many routes

router.route('/stats').get(tourController.getTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.createATours
  );

router
  .route('/:id')
  .get(tourController.getATours)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.updateATours
  )
  .delete(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.deleteATours
  );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
