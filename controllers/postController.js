const Post = require('../models/Post');

/**
 * @desc    Create a new post or draft
 * @route   POST /posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { title, description, content, image, category, status } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, content, and category',
      });
    }

    // Default status is 'draft', or user can submit as 'pending' for admin review
    let postStatus = 'draft';
    if (status && ['draft', 'pending'].includes(status)) {
      postStatus = status;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (image || '');

    const post = await Post.create({
      title,
      description,
      content,
      image: imageUrl,
      category,
      status: postStatus,
      createdBy: req.user._id,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'createdBy',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message:
        postStatus === 'pending'
          ? 'Post submitted successfully and is awaiting admin approval'
          : 'Post saved as draft successfully',
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    View all approved posts
 * @route   GET /posts
 * @access  Public
 */
const getAllApprovedPosts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'approved' };

    if (category) {
      filter.category = new RegExp(category, 'i');
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Post.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    View an approved post by ID
 * @route   GET /posts/:id
 * @access  Public (Approved posts) / Private (Own drafts or admin view)
 */
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'createdBy',
      'name email role'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found with the specified ID',
      });
    }

    // If the post is approved, anyone can view it
    if (post.status === 'approved') {
      return res.status(200).json({
        success: true,
        post,
      });
    }

    // If post is draft, pending, or rejected, allow view only if user is creator or admin
    if (
      req.user &&
      (post.createdBy._id.toString() === req.user._id.toString() ||
        req.user.role === 'admin')
    ) {
      return res.status(200).json({
        success: true,
        post,
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: This post has not been approved yet.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    View your own posts and drafts
 * @route   GET /posts/my-posts
 * @access  Private
 */
const getMyPosts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { createdBy: req.user._id };

    if (status && ['draft', 'pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const posts = await Post.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update your own post
 * @route   PATCH /posts/:id
 * @access  Private
 */
const updateMyPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Ensure the logged-in user is the creator of the post (or an admin)
    if (
      post.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post',
      });
    }

    const { title, description, content, image, category, status } = req.body;

    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (req.file) {
      post.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      post.image = image;
    }

    // Users can submit a draft for approval (status -> pending) or keep as draft
    if (status !== undefined) {
      if (req.user.role === 'admin') {
        post.status = status;
      } else if (['draft', 'pending'].includes(status)) {
        post.status = status;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Users can only set status to "draft" or "pending"',
        });
      }
    }

    const updatedPost = await post.save();
    const populated = await Post.findById(updatedPost._id).populate(
      'createdBy',
      'name email role'
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete your own post
 * @route   DELETE /posts/:id
 * @access  Private
 */
const deleteMyPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Ensure user is the creator or an admin
    if (
      post.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      deletedPostId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllApprovedPosts,
  getPostById,
  getMyPosts,
  updateMyPost,
  deleteMyPost,
};
