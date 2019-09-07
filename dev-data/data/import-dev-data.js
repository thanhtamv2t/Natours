const mongoose = require('mongoose');

const fs = require('fs');

const dotenv = require('dotenv');

dotenv.config();

const dataImport = async () => {
  await mongoose
    .connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(() => console.log('db is connected'));

  const Tour = require('../../models/tourModel');
  const User = require('../../models/userModel');
  const Review = require('../../models/reviewModel');

  const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
  const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
  const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
  );

  const importData = async () => {
    try {
      await Tour.create(tours);
      await User.create(users, { validateBeforeSave: false });
      await Review.create(reviews);
      console.log('Data imported');
      process.exit();
    } catch (e) {
      console.log('data is not imported, try again: ', e);
    }
  };

  //Delete Documents

  const deleteData = async () => {
    try {
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();
      process.exit();
    } catch (e) {
      console.log('error:', e);
    }
  };

  if (process.argv[2] === '--import') {
    importData();
  }
  if (process.argv[2] === '--delete') {
    deleteData();
  }
};

dataImport();
