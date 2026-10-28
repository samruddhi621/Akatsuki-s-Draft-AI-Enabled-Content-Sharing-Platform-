const mongoose = require('mongoose');

// Cache the MongoDB connection across serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const connectionString = process.env.MONGODB_URI;

  const dbName = process.env.DB_NAME || 'Nodevember';

  if (!cached.promise) {
    const opts = {
      dbName,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    };

    cached.promise = mongoose
      .connect(connectionString, opts)
      .then((m) => {
        console.log(`[MongoDB] Connected successfully to host: ${m.connection.host}`);
        console.log(`[MongoDB] Active Database: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`[MongoDB Connection Error] ${err.message}`);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`[MongoDB Connection Error] ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
