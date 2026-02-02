const mongoose = require('mongoose');
const { DB_URI } = process.env;

const connectToDatabase = async () => {
  console.log('Connecting to database...');

  // Optional but helpful event logs
  mongoose.connection
    .on('error', (err) => console.error('Database connection error:', err.message))
    .on('open', () => console.log('Database connection is open.'))
    .on('connected', () => console.log('Database connection established.'))
    .on('disconnected', () => console.warn('Database disconnected.'));

  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000 // Optional — keeps retry time short
    });

    console.log('✅ MongoDB connected successfully.');
  } catch (err) {
    console.error('❌ Unable to connect to MongoDB:', err.message);
    await mongoose.connection.close(); // emits 'disconnected'
    throw err;
  }
};

module.exports = connectToDatabase;
