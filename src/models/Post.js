const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  mediaUrl: {
    type: String, // URL to image or video
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', null],
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
