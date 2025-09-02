const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const { validationResult } = require('express-validator');

const generateTokenAndSetCookie = (user, res) => {
  const token = user.getJwtToken();
  // In a real app, you might set a cookie instead or just return the token
  // res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  return token;
};

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { firstName, lastName, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  const token = generateTokenAndSetCookie(user, res);

  res.status(201).json(
    new ApiResponse(201, { user: { id: user._id, email: user.email }, token }, 'User registered successfully')
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateTokenAndSetCookie(user, res);

  res.status(200).json(
    new ApiResponse(200, { user: { id: user._id, email: user.email }, token }, 'User logged in successfully')
  );
});

module.exports = { registerUser, loginUser };
