const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 8000;

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('db is connected'))
  .catch(e => console.log(e));

const server = app.listen(port, () => {
  console.log(`App is running at ${port}`);
});

process.on('uncaughtException', err => {
  console.log(err);
  console.log('Unhandle Error Exception, Shut down server.');
  server.close(() => {
    process.exit(1);
  });
});
