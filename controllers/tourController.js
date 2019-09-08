const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   console.log(req.user);
//   const feature = new APIFeature(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const tours = await feature.query;

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// });

// exports.createATours = catchAsync(async (req, res, next) => {
//   const { name, rating, price } = req.body;
//   const newTour = await Tour.create({
//     name,
//     rating,
//     price
//   });

//   res.status(201).json({
//     status: 'success',
//     data: newTour
//   });
// });

// exports.getATours = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.tourId).populate('reviews');

//   if (!tour) {
//     return next(
//       new AppError(`No tour found with id ${req.params.tourId}`, 404)
//     );
//   }

//   res.json({
//     status: 'success',
//     data: { tour }
//   });
// });

//console.log(factory.deleteOne(Tour));

// exports.deleteATours = catchAsync(async (req, res, next) => {
//   await Tour.findByIdAndDelete(req.params.tourId);
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

exports.getATours = factory.getOne(Tour, { path: 'reviews' });

exports.getAllTours = factory.getAll(Tour);

exports.createATours = factory.createOne(Tour);

exports.updateATours = factory.updateOne(Tour);

exports.deleteATours = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) return next(new AppError('Please provide lat, lng'), 404);

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] } //Longtitude first
    }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: null,
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    messsage: stats
  });
});
