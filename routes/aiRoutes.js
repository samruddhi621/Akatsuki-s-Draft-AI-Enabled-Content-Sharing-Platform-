const express = require('express');
const router = express.Router();
const { improvePostContent } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// Route: POST /ai/improve/:postId - Improve content using AI and save as a new draft
router.post('/improve/:postId', protect, improvePostContent);

module.exports = router;
