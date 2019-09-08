const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Can not leave review as blank']
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
      required: [true, 'Must specify the rate score']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user']
    }
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function(tour) {
  const stats = await this.aggregate([
    {
      $match: { tour } //Select all record match this conditions
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tour, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tour, {
      ratingsAverage: 0,
      ratingsQuantity: 0
    });
  }
};

//Prevent duplicated content from the same user, 1 user only have 1 review per tour

reviewSchema.index({ user: 1, review: 1 }, { unique: true });

reviewSchema.post('save', function() {
  //Post method will call after document is created
  // `this` points to current review
  this.constructor.calcAverageRating(this.tour); //constructor stands for current model that created by this document;
});

//findByIdAndUpdate
//findByIdAndDelete
//both are shorthand of findOneAnd , so search for that pattern
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});
//Can not access query if using post method, so hack around, save to this then use it to post method to get tourId

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
