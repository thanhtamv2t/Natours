const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIREIN
  });
};

const sendToken = async (user, statusCode, res) => {
  user.password = undefined;
  const token = await signToken(user._id);

  const cookieOpts = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
  res.cookie('jwt', token, cookieOpts);

  res.status(statusCode).json({
    status: 'success',
    data: { user }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  //Select the fields that we need, not pass all to the create;
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = _.omit(
    await User.create({ name, email, password, passwordConfirm }),
    ['password']
  );

  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Missing Email Or Password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('User is not exists'));
  }
  //Fat model thin controller
  // const check = await bcrypt.compare(password, user.password);
  const correct = await user.correctPassword(password, user.password);
  if (!correct) {
    return next(new AppError('Password is inccorect!'));
  }

  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
  sendToken(user, 200, res);
});

//Protect data middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(new AppError('Please login to use this function', 400));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) return next(new AppError('User no longer exists'), 401);

  if (freshUser.changePasswordAfter(decoded.iat))
    return next(new AppError('Token invalid, try to login again'), 401);

  //Else grant access for user;
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You dont have perssion to access this function', 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  //1. Get user email
  const user = await User.findOne({ email });

  if (!user) return next(new AppError('User does not exists'), 404);
  //2. Generate Random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3. Send to user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  try {
    await sendEmail({
      email: user.email,
      message: `Update your new password at: ${resetUrl}`,
      subject: 'Your password reset token'
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    user.save({ validateBeforeSave: false });
    return next(new AppError('Can not send email, try again!'), 500);
  }
  //next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get User Reset Token
  const { token } = req.params;
  //Check expired or not
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() }
  });

  if (!user)
    return next(
      new AppError('Token expired, try to reset password again'),
      500
    );
  //Update user password
  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetExpired = undefined;
  user.passwordResetToken = undefined;
  // user.passwordChangedAt = Date.now();
  await user.save();
  //Login & send jwt
  const tk = signToken(user._id);

  return res.status(200).json({
    status: 'success',
    token: tk
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!user) return next(new AppError('Please login again'));

  const { oldPassword, password, passwordConfirm } = req.body;

  if (!(await user.correctPassword(oldPassword, user.password)))
    return next(new AppError('Incorrect old password, try again'), 400);

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  // user.passwordChangedAt = Date.now();
  await user.save();

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});
