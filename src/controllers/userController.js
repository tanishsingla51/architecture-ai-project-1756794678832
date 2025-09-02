const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

// @desc    Get current user's profile
// @route   GET /api/v1/users/me
// @access  Private
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  // req.user is populated by the 'protect' middleware
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully'));
});

// @desc    Get user profile by ID
// @route   GET /api/v1/users/:id
// @access  Private
const getUserProfileById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -pendingRequests -sentRequests');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully'));
});

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, headline, summary } = req.body;
  const user = await User.findById(req.user.id);

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.headline = headline || user.headline;
    user.summary = summary || user.summary;
    // Can add profile picture update logic here

    const updatedUser = await user.save();
    res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
  } else {
    throw new ApiError(404, 'User not found');
  }
});

// @desc    Add experience to profile
// @route   POST /api/v1/users/experience
// @access  Private
const addUserExperience = asyncHandler(async (req, res) => {
  const { title, company, from, to, current, description } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');

  const newExp = { title, company, from, to, current, description };
  user.experience.unshift(newExp);
  await user.save();

  res.status(201).json(new ApiResponse(201, user.experience, 'Experience added successfully'));
});

// @desc    Update an experience entry
// @route   PUT /api/v1/users/experience/:exp_id
// @access  Private
const updateUserExperience = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const exp = user.experience.id(req.params.exp_id);

    if (!exp) {
        throw new ApiError(404, 'Experience not found');
    }

    Object.assign(exp, req.body);
    await user.save();
    res.status(200).json(new ApiResponse(200, user.experience, 'Experience updated'));
});

// @desc    Delete an experience entry
// @route   DELETE /api/v1/users/experience/:exp_id
// @access  Private
const deleteUserExperience = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const expIndex = user.experience.findIndex(item => item._id.toString() === req.params.exp_id);

    if (expIndex === -1) {
        throw new ApiError(404, 'Experience not found');
    }

    user.experience.splice(expIndex, 1);
    await user.save();
    res.status(200).json(new ApiResponse(200, {}, 'Experience removed'));
});

// @desc    Search for users
// @route   GET /api/v1/users/search?q=query
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
    const query = req.query.q ? {
        $or: [
            { firstName: { $regex: req.query.q, $options: 'i' } },
            { lastName: { $regex: req.query.q, $options: 'i' } },
            { email: { $regex: req.query.q, $options: 'i' } }
        ]
    } : {};

    const users = await User.find(query).select('firstName lastName headline profilePicture').limit(10);
    res.status(200).json(new ApiResponse(200, users, 'Search results'));
});

module.exports = {
  getCurrentUserProfile,
  getUserProfileById,
  updateUserProfile,
  addUserExperience,
  updateUserExperience,
  deleteUserExperience,
  searchUsers
};
