const _ = require('lodash');

class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const exclusiveFields = ['page', 'limit', 'sort', 'fields'];
    let qStr = _.omit(this.queryString, exclusiveFields);

    //Advanced Filter
    qStr = JSON.stringify(qStr);
    qStr = qStr.replace(/\b(gt|gte|lte|lt)\b/, match => `$${match}`);

    this.query = this.query.find(JSON.parse(qStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sort = this.queryString.sort.split(',').join(' ');
      this.query.sort(sort);
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;

    const limit = this.queryString.limit * 1 || 100;

    this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }
}

module.exports = APIFeature;
