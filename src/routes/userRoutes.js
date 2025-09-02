const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getCurrentUserProfile,
  getUserProfileById,
  updateUserProfile,
  addUserExperience,
  updateUserExperience,
  deleteUserExperience,
  searchUsers
} = require('../controllers/userController');

const router = express.Router();

router.route('/me').get(protect, getCurrentUserProfile).put(protect, updateUserProfile);
router.route('/search').get(protect, searchUsers);
router.route('/:id').get(protect, getUserProfileById);

// Experience Routes
router.route('/experience').post(protect, addUserExperience);
router.route('/experience/:exp_id').put(protect, updateUserExperience).delete(protect, deleteUserExperience);

// Education routes can be added similarly

module.exports = router;
