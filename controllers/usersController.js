const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/userModel");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateJWT = require("../utils/generateJWT");

const getAllUsers = asyncWrapper(async (req, res) => {
  console.log(req.headers);

  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const users = await User.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);
  res.json({
    status: httpStatusText.SUCCESS,
    data: { users },
  });
});

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create(
      "User already exists",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  //password hashing
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    avatar: req.file.filename,
  });

  //Generate JWT token
  const token = await generateJWT({
    email: user.email,
    id: user._id,
    role: user.role,
  });
  user.token = token;

  await user.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { user },
  }); // created successfuly
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = appError.create(
      "email and password are required",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create("User not found", 400, httpStatusText.FAIL);
    return next(error);
  }

  const isUser = await bcrypt.compare(password, user.password);

  if (user && isUser) {
    const token = await generateJWT({ email: user.email, id: user._id });

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { token },
    });
  } else {
    const error = appError.create(
      "Incorrect Password",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  register,
  login,
};
