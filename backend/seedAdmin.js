const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/bus-booking');

const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    if (existingAdmin) {
      console.log('Updating existing admin user...');
      existingAdmin.role = 'admin';
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const admin = new Admin({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user seeded successfully.');
    }

    process.exit();
  } catch (err) {
    console.error('Failed to seed admin user:', err);
    process.exit(1);
  }
};

seedAdmin();
