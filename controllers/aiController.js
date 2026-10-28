const Post = require('../models/Post');
const { improveContentWithGemini } = require('../config/gemini');

/**
 * @desc    Improve post content using AI and save as a new draft with a new ID
 * @route   POST /ai/improve/:postId
 * @access  Private
 */
const improvePostContent = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: 'Original post not found with the specified ID',
      });
    }

    // Ensure the post belongs to the authenticated user (or user is admin)
    if (
      originalPost.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to improve this post. You can only improve your own posts.',
      });
    }

    // Call Gemini AI service to improve content
    const improvedData = await improveContentWithGemini({
      title: originalPost.title,
      description: originalPost.description,
      content: originalPost.content,
      category: originalPost.category,
    });

    // Save as a brand-new draft under the same user, preserving the original draft
    const newDraftPost = await Post.create({
      title: improvedData.title,
      description: improvedData.description,
      content: improvedData.content,
      image: originalPost.image,
      category: originalPost.category,
      createdBy: req.user._id,
      status: 'draft', // Always saved as a new draft
    });

    const populatedNewDraft = await Post.findById(newDraftPost._id).populate(
      'createdBy',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message:
        'Content successfully improved using AI and saved as a new draft! The original draft remains intact.',
      originalPost: {
        _id: originalPost._id,
        title: originalPost.title,
        status: originalPost.status,
      },
      newDraft: populatedNewDraft,
      aiSource: improvedData.isFallback
        ? 'Fallback Enhancement (Configure GEMINI_API_KEY in .env for direct Gemini API calls)'
        : 'Google Gemini AI',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  improvePostContent,
};
