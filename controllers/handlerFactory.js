const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeature = require('../utils/apiFeature');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //To allow nested GET (hack a round)
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const feature = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const doc = await feature.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc
      }
    });
  });

exports.getOne = (Model, popOpt = null) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params);
    let query = Model.findById(req.params.id);

    if (popOpt) query = query.populate(popOpt);

    const doc = await query;

    if (!doc) return next(new AppError('Doc can not be found by Id', 404));

    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) return next(new AppError('Can not find docs'), 404);

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError('No document found with that Id', 404));

    res.status(204).json({
      status: 'success'
    });
  });
