const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    createPost,
    getFeedPosts,
    getPostsByUser,
    updatePost,
    deletePost,
    likeUnlikePost,
    addComment,
    deleteComment,
    getCommentsForPost
} = require('../controllers/postController');

const router = express.Router();

router.use(protect); // All routes below are protected

router.route('/').post(createPost);
router.route('/feed').get(getFeedPosts);
router.route('/user/:userId').get(getPostsByUser);
router.route('/:postId').put(updatePost).delete(deletePost);

router.route('/:postId/like').post(likeUnlikePost);
router.route('/:postId/comments').post(addComment).get(getCommentsForPost);
router.route('/:postId/comments/:commentId').delete(deleteComment);

module.exports = router;
