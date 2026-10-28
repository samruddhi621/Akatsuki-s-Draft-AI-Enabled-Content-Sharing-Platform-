const express = require('express');
const router = express.Router();
const {
  getPendingPosts,
  approvePost,
  rejectPost,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All admin routes require authentication and the 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Route: GET /admin/posts/pending - View posts awaiting approval
router.get('/posts/pending', getPendingPosts);

// Route: PATCH /admin/posts/approve/:id - Approve a post
router.patch('/posts/approve/:id', approvePost);

// Route: PATCH /admin/posts/reject/:id - Reject a post
router.patch('/posts/reject/:id', rejectPost);

module.exports = router;
