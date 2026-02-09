// src/utils/ApiFeatures.js

import { createMongooseTransform } from "./mongooseTransform.util.js";

export default class ApiFeatures {
  constructor(model, queryParams, options = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.query = model.find();
    this.options = {
      searchableFields: [],
      defaultSort: "-created_at",
      defaultLimit: 10,
      maxLimit: 100,
      defaultProjection: "-password -__v",
      ...options,
    };
  }

  filter() {
    const excluded = ["page", "limit", "sort", "fields", "search"];
    const filters = { ...this.queryParams };

    excluded.forEach((el) => delete filters[el]);

    this.query = this.query.find(filters);
    this.filters = filters;

    return this;
  }

  search() {
    const { search } = this.queryParams;
    if (search && this.options.searchableFields.length) {
      this.query = this.query.find({
        $or: this.options.searchableFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        })),
      });
    }
    return this;
  }

  sort() {
    const sort = this.queryParams.sort || this.options.defaultSort;
    this.query = this.query.sort(sort.split(",").join(" "));
    return this;
  }

  selectFields() {
    const fields = this.queryParams.fields;
    const projection = fields ? fields.split(",").join(" ") : this.options.defaultProjection;

    this.query = this.query.select(projection);
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(this.queryParams.limit) || this.options.defaultLimit, this.options.maxLimit);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    this.pagination = { page, limit, skip };

    return this;
  }

  async exec() {
    // const [data, total] = await Promise.all([this.query.lean(), this.model.countDocuments(this.filters || {})]);

    const finalFilter = this.query.getFilter();
    const transform = createMongooseTransform(["password"]);
    const [data, total] = await Promise.all([this.query.lean(), this.model.countDocuments(finalFilter)]);

    return {
      // data,
      data: data.map((item) => transform(null, item)),
      meta: {
        total,
        page: this.pagination.page,
        limit: this.pagination.limit,
        totalPages: Math.ceil(total / this.pagination.limit),
        hasNextPage: this.pagination.skip + data.length < total,
        hasPrevPage: this.pagination.page > 1,
      },
    };
  }

  // Execution flow
  //   query
  //   → filtered
  //   → searched
  //   → sorted
  //   → projected
  //   → paginated
  //   → executed
}
