const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('\n📋 Solutions:');
    console.log('1. Start local MongoDB service');
    console.log('2. Use MongoDB Atlas (cloud) - update MONGODB_URI in .env');
    console.log('3. Install MongoDB Community Edition if not installed');
    process.exit(1);
  }
};

testConnection();
