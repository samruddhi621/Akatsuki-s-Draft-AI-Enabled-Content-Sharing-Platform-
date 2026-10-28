require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel DB Connection Error]:', err.message);
  }
  return app(req, res);
};
