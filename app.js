const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Parse incoming JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = require('./config/db');

// Connect to database on request (vital for serverless cold starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB Connection Middleware]:', err.message);
  }
  next();
});

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root / Health Check route
app.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    platform: "Akatsuki's Draft: AI-Enabled Content Sharing Platform",
    event: 'Nodevember 4.0',
    version: '1.0.0',
    status: 'Server is running smoothly',
    database: isDbConnected ? 'Connected to MongoDB Atlas' : 'Connecting or checking credentials',
    documentation: {
      auth: [
        'POST /auth/register',
        'POST /auth/login',
        'GET  /auth/me',
      ],
      userPosts: [
        'POST   /posts',
        'GET    /posts',
        'GET    /posts/my-posts',
        'GET    /posts/:id',
        'PATCH  /posts/:id',
        'DELETE /posts/:id',
      ],
      adminApproval: [
        'GET   /admin/posts/pending',
        'PATCH /admin/posts/approve/:id',
        'PATCH /admin/posts/reject/:id',
      ],
      aiIntegration: [
        'POST  /ai/improve/:postId',
      ],
    },
  });
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiRoutes);

// Catch 404 and forward to error handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
