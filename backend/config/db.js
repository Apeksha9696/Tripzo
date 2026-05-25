const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Driver = require('../models/Driver');

const ensureDefaultAccounts = async () => {
  try {
    const existingDriver = await Driver.findOne({ email: 'driver@gmail.com' });
    if (!existingDriver) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('driver123', salt);
      const driver = new Driver({
        name: 'Default Driver',
        email: 'driver@gmail.com',
        password: hashedPassword
      });
      await driver.save();
      console.log('✅ Default Driver (driver@gmail.com / driver123) Created successfully');
    }

    const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const adminUser = new Admin({
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Default Admin (admin@gmail.com / admin123) Created successfully');
    }
  } catch (err) {
    console.error('❌ Error during default accounts seeding:', err.message);
  }
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ CRITICAL: MONGO_URI is not set in environment variables!');
      process.exit(1);
    }
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Run seed protocol
    await ensureDefaultAccounts();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
