const { validationResult } = require("express-validator");
const Course = require("../models/coursesModel");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");

const getAllCourses = asyncWrapper(async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({
    status: httpStatusText.SUCCESS,
    data: { courses },
  });
});

const getCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    const error = appError.create("Course Not Found", 404, httpStatusText.FAIL);
    return next(error);
  }
});

const createCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
  }
  const course = new Course({
    title: req.body.title,
    price: req.body.price,
  });
  await course.save();
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { course },
  }); // created successfuly
});

const updateCourse = asyncWrapper(async (req, res) => {
  // findByIdAndUpdate => return found object not the updated one
  const updatedCourse = await Course.updateOne(
    { _id: req.params.id },
    { $set: { ...req.body } }
  );
  res.json({
    status: httpStatusText.SUCCESS,
    data: { course: updatedCourse },
  });
});

const deleteCourse = asyncWrapper(async (req, res) => {
  await Course.deleteOne({ _id: req.params.id });

  res.json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
