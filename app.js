const express = require('express');

const app = express();

const dotenv = require('dotenv');

dotenv.config();

const morgan = require('morgan');

const helmet = require('helmet');

const xssClean = require('xss-clean');

const mongoSanitize = require('express-mongo-sanitize');

const hpp = require('hpp');

const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');

const globalErrorHandle = require('./controllers/errorController');

//Router

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());

  app.use(xssClean());

  app.use(mongoSanitize());

  app.use(hpp());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100000
  });

  app.use(limiter);
}
/* Middleware to guard our api;
use limiter: express-rate-limit
helmet
xss-clean
express-mongoose-sanitize
hpp
*/

//1.(Middle Ware)
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//1.1. Serve static
app.use('/', express.static('public'));

//AAAA
app.use((req, res, next) => {
  //console.log(req.headers);
  next();
});

//2. (Routes)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//3. (Handling No Routes)
app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server`, 404));
});

//Error middleware will handle error when have 4 params
app.use(globalErrorHandle);

module.exports = app;
