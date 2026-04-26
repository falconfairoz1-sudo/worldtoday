const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 DNS resolution — fixes ECONNREFUSED on Windows for MongoDB Atlas SRV
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  // Connection options — family:4 forces IPv4 which helps on some networks
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    family: 4,
    retryWrites: true,
  };

  let retries = 3;

  while (retries > 0) {
    try {
      await mongoose.connect(uri, options);
      console.log('✅ Connected to MongoDB');
      return;
    } catch (err) {
      retries--;
      console.error(`❌ MongoDB connection error (attempt ${3 - retries}/3):`, err.message);

      if (retries > 0) {
        console.log(`🔄 Retrying in 3 seconds... (${retries} attempts left)`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  console.error('');
  console.error('❌ All MongoDB connection attempts failed.');
  console.error('');
  console.error('🔧 HOW TO FIX:');
  console.error('   STEP 1 → Change Windows DNS to Google DNS:');
  console.error('            Control Panel → Network → IPv4 → DNS: 8.8.8.8 / 8.8.4.4');
  console.error('');
  console.error('   STEP 2 → Whitelist your IP in MongoDB Atlas:');
  console.error('            cloud.mongodb.com → Network Access → Add IP → 0.0.0.0/0');
  console.error('');
  console.error('   STEP 3 → Or use local MongoDB:');
  console.error('            Set MONGODB_URI=mongodb://localhost:27017/worldtoday in .env');
  console.error('');
  process.exit(1);
};

module.exports = connectDB;
