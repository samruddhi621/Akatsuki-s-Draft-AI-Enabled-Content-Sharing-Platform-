const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllApprovedPosts,
  getPostById,
  getMyPosts,
  updateMyPost,
  deleteMyPost,
} = require('../controllers/postController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Route: POST /posts - Create a new post or draft (supports JSON or multipart image upload)
router.post('/', protect, upload.single('image'), createPost);

// Route: GET /posts - View all approved posts
router.get('/', getAllApprovedPosts);

// Route: GET /posts/my-posts - View your own posts and drafts (Must be before /:id)
router.get('/my-posts', protect, getMyPosts);

// Route: GET /posts/:id - View an approved post by ID
router.get('/:id', optionalProtect, getPostById);

// Route: PATCH /posts/:id - Update your own post (supports optional image update)
router.patch('/:id', protect, upload.single('image'), updateMyPost);

// Route: DELETE /posts/:id - Delete your own post
router.delete('/:id', protect, deleteMyPost);

module.exports = router;
