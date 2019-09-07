const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// exports.getAllReview = catchAsync(async (req, res, next) => {
//   const { tourId } = req.params;
//   const tour = await Tour.findById(tourId);

//   if (!tour) {
//     return next(new AppError(`Can not find the tour with provided ID`, 404));
//   }

//   const reviews = await Review.find({ tour: tour._id });

//   res.status(200).json({
//     status: 'success',
//     data: { reviews }
//   });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//   const { review, rating } = req.body;
//   const { user } = req;
//   const tour = req.params.tourId;

//   const newTour = await Review.create({ review, rating, tour, user });

//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour }
//   });
// });
exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReview = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
