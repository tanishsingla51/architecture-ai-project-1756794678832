const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

// @desc    Send a connection request
// @route   POST /api/v1/connections/send/:userId
// @access  Private
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const sender = await User.findById(req.user.id);
  const receiver = await User.findById(req.params.userId);

  if (!receiver) throw new ApiError(404, 'User not found');
  if (req.user.id === req.params.userId) throw new ApiError(400, 'You cannot connect with yourself');

  // Check if already connected or request already sent/received
  if (sender.connections.includes(receiver._id)) throw new ApiError(400, 'Already connected');
  if (sender.sentRequests.includes(receiver._id)) throw new ApiError(400, 'Request already sent');
  if (sender.pendingRequests.includes(receiver._id)) throw new ApiError(400, 'This user has already sent you a request');

  sender.sentRequests.push(receiver._id);
  receiver.pendingRequests.push(sender._id);

  await sender.save();
  await receiver.save();

  res.status(200).json(new ApiResponse(200, {}, 'Connection request sent'));
});

// @desc    Accept a connection request
// @route   POST /api/v1/connections/accept/:userId
// @access  Private
const acceptConnectionRequest = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const requester = await User.findById(req.params.userId);

  if (!requester) throw new ApiError(404, 'User not found');

  if (!currentUser.pendingRequests.includes(requester._id)) {
    throw new ApiError(400, 'No pending request from this user');
  }

  // Update current user
  currentUser.pendingRequests.pull(requester._id);
  currentUser.connections.push(requester._id);

  // Update requester
  requester.sentRequests.pull(currentUser._id);
  requester.connections.push(currentUser._id);

  await currentUser.save();
  await requester.save();

  res.status(200).json(new ApiResponse(200, {}, 'Connection accepted'));
});

// @desc    Reject a connection request
// @route   POST /api/v1/connections/reject/:userId
// @access  Private
const rejectConnectionRequest = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const requester = await User.findById(req.params.userId);

  if (!requester) throw new ApiError(404, 'User not found');

  currentUser.pendingRequests.pull(requester._id);
  requester.sentRequests.pull(currentUser._id);

  await currentUser.save();
  await requester.save();

  res.status(200).json(new ApiResponse(200, {}, 'Connection request rejected'));
});

// @desc    Remove a connection
// @route   DELETE /api/v1/connections/remove/:userId
// @access  Private
const removeConnection = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const userToRemove = await User.findById(req.params.userId);

  if (!userToRemove) throw new ApiError(404, 'User not found');

  currentUser.connections.pull(userToRemove._id);
  userToRemove.connections.pull(currentUser._id);

  await currentUser.save();
  await userToRemove.save();

  res.status(200).json(new ApiResponse(200, {}, 'Connection removed'));
});

// @desc    List all connections for the current user
// @route   GET /api/v1/connections
// @access  Private
const listConnections = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('connections', 'firstName lastName headline profilePicture');
  res.status(200).json(new ApiResponse(200, user.connections, 'Connections list fetched'));
});

// @desc    List all pending connection requests for the current user
// @route   GET /api/v1/connections/pending
// @access  Private
const listPendingRequests = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('pendingRequests', 'firstName lastName headline profilePicture');
  res.status(200).json(new ApiResponse(200, user.pendingRequests, 'Pending requests fetched'));
});

module.exports = { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection, listConnections, listPendingRequests };
