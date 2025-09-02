const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

// @desc    Create a new post
// @route   POST /api/v1/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, mediaUrl, mediaType } = req.body;
  if (!content) throw new ApiError(400, 'Post content is required');

  const post = await Post.create({
    author: req.user.id,
    content,
    mediaUrl,
    mediaType
  });

  res.status(201).json(new ApiResponse(201, post, 'Post created successfully'));
});

// @desc    Get posts for the user's feed (from connections)
// @route   GET /api/v1/posts/feed
// @access  Private
const getFeedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const connectionIds = user.connections;
  const feedUserIds = [...connectionIds, req.user.id]; // Include user's own posts

  const posts = await Post.find({ author: { $in: feedUserIds } })
    .populate('author', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json(new ApiResponse(200, posts, 'Feed fetched successfully'));
});

// @desc    Get all posts by a specific user
// @route   GET /api/v1/posts/user/:userId
// @access  Private
const getPostsByUser = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.userId })
    .populate('author', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, posts, 'User posts fetched successfully'));
});

// @desc    Update a post
// @route   PUT /api/v1/posts/:postId
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user.id) {
    throw new ApiError(403, 'User not authorized to update this post');
  }

  const { content } = req.body;
  post.content = content || post.content;
  await post.save();

  res.status(200).json(new ApiResponse(200, post, 'Post updated successfully'));
});

// @desc    Delete a post
// @route   DELETE /api/v1/posts/:postId
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user.id) {
    throw new ApiError(403, 'User not authorized to delete this post');
  }

  await Post.deleteOne({ _id: req.params.postId });
  // Also delete associated comments
  await Comment.deleteMany({ post: req.params.postId });

  res.status(200).json(new ApiResponse(200, {}, 'Post deleted successfully'));
});

// @desc    Like or unlike a post
// @route   POST /api/v1/posts/:postId/like
// @access  Private
const likeUnlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const isLiked = post.likes.includes(req.user.id);

  if (isLiked) {
    post.likes.pull(req.user.id);
  } else {
    post.likes.push(req.user.id);
  }

  await post.save();
  res.status(200).json(new ApiResponse(200, { likes: post.likes.length }, isLiked ? 'Post unliked' : 'Post liked'));
});

// @desc    Add a comment to a post
// @route   POST /api/v1/posts/:postId/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, 'Comment content is required');

  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const comment = await Comment.create({
    content,
    author: req.user.id,
    post: req.params.postId
  });

  res.status(201).json(new ApiResponse(201, comment, 'Comment added successfully'));
});

// @desc    Get all comments for a post
// @route   GET /api/v1/posts/:postId/comments
// @access  Private
const getCommentsForPost = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'firstName lastName profilePicture')
    .sort({ createdAt: 'desc' });
  
  res.status(200).json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});

// @desc    Delete a comment
// @route   DELETE /api/v1/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.author.toString() !== req.user.id) {
    throw new ApiError(403, 'User not authorized to delete this comment');
  }

  await Comment.deleteOne({ _id: req.params.commentId });
  res.status(200).json(new ApiResponse(200, {}, 'Comment deleted successfully'));
});

module.exports = {
  createPost,
  getFeedPosts,
  getPostsByUser,
  updatePost,
  deletePost,
  likeUnlikePost,
  addComment,
  getCommentsForPost,
  deleteComment
};
