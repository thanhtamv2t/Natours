const AppError = require('../utils/appError');

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendProdError = (err, res) => {
  //Operations , trusted
  console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming errs
    console.log('error: ', err);
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

const jwtExpiredHandle = () =>
  new AppError('Your token expired, please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    //sendProdError(err, res);
    let error = { ...err };

    if (error.name === 'TokenExpiredError') error = jwtExpiredHandle();

    sendProdError(error, res);
  }

  next();
};
