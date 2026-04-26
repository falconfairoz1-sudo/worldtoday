const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('⚠️ Admin user already exists');
      console.log('Email:', adminExists.email);
      console.log('Role:', adminExists.role);
      
      // Update to admin if not already
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('✅ Updated user to admin role');
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: 'admin123', // Change this after first login!
        role: 'admin',
        country: 'us',
        language: 'en'
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Password: admin123');
      console.log('⚠️ IMPORTANT: Change password after first login!');
    }

    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
