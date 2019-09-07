const _ = require('lodash');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This router not yet finished'
  });
};

// exports.createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This router not yet finished'
//   });
// };

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This router not yet finished'
//   });
// };

exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  //req.body = _.omit(req.body, ['password', 'passwordConfirm']);
  const request = _.pick(req.body, ['name', 'email']);
  const updateUser = await User.findByIdAndUpdate(req.user._id, request, {
    new: true
  });

  res.status(200).json({
    status: 'success',
    user: updateUser
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success'
  });
});
