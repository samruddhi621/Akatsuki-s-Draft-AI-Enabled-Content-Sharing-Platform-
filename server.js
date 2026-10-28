require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Akatsuki's Draft Backend Server is active!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📋 Event: Nodevember 4.0`);
  console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
});

module.exports = app;

