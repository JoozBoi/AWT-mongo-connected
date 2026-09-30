const mongoose = require('mongoose');
const net = require('net');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

let mongoMemoryServerInstance = null;

// Default local MongoDB connection string for offline development in VS Code
const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/olx_marketplace';

// Check if a TCP port is active (prevents ECONNREFUSED in containerized environments)
const isPortListening = (host, port, timeout = 250) => {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
};

// Seed default categories and demo accounts if database is empty (no dummy listings)
const autoSeedIfEmpty = async () => {
  try {
    const Category = mongoose.models.Category || require('../models/Category');
    const User = mongoose.models.User || require('../models/User');

    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('[Database] Initializing standard category taxonomy...');
      await Category.insertMany([
        {
          id: 'cat-cars',
          name: 'Cars',
          slug: 'cars',
          iconName: 'Car',
          subcategories: [
            { id: 'sub-cars-used', name: 'Used Cars', slug: 'used-cars' },
            { id: 'sub-cars-parts', name: 'Spare Parts & Accessories', slug: 'spare-parts' }
          ]
        },
        {
          id: 'cat-properties',
          name: 'Properties',
          slug: 'properties',
          iconName: 'Home',
          subcategories: [
            { id: 'sub-prop-sale', name: 'For Sale: Houses & Apartments', slug: 'houses-for-sale' },
            { id: 'sub-prop-rent', name: 'For Rent: Houses & Apartments', slug: 'houses-for-rent' }
          ]
        },
        {
          id: 'cat-mobiles',
          name: 'Mobiles',
          slug: 'mobiles',
          iconName: 'Smartphone',
          subcategories: [
            { id: 'sub-mobile-phones', name: 'Mobile Phones', slug: 'mobile-phones' },
            { id: 'sub-mobile-accessories', name: 'Accessories', slug: 'mobile-accessories' }
          ]
        },
        {
          id: 'cat-bikes',
          name: 'Bikes',
          slug: 'bikes',
          iconName: 'Bike',
          subcategories: [
            { id: 'sub-bike-motorcycles', name: 'Motorcycles', slug: 'motorcycles' },
            { id: 'sub-bike-scooters', name: 'Scooters', slug: 'scooters' }
          ]
        },
        {
          id: 'cat-electronics',
          name: 'Electronics & Appliances',
          slug: 'electronics',
          iconName: 'Tv',
          subcategories: [
            { id: 'sub-elec-tv', name: 'TVs & Audio', slug: 'tvs-audio' },
            { id: 'sub-elec-laptops', name: 'Laptops', slug: 'laptops' }
          ]
        }
      ]);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminHashed = await bcrypt.hash('admin12345', salt);
      const userHashed = await bcrypt.hash('user12345', salt);

      await User.create([
        {
          name: 'System Admin Moderator',
          email: 'admin@olx.in',
          password: adminHashed,
          phone: '+91 98000 11223',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          isAdmin: true,
          status: 'active'
        },
        {
          name: 'Rahul Varma',
          email: 'rahul.varma@gmail.com',
          password: userHashed,
          phone: '+91 98765 43210',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          isAdmin: false,
          status: 'active'
        }
      ]);
    }
  } catch (err) {
    // quiet setup
  }
};

/**
 * Connect to MongoDB database
 * - In VS Code: Connects to local mongod (mongodb://127.0.0.1:27017/olx_marketplace) or MONGODB_URI in .env
 * - In Sandbox: Falls back smoothly to embedded MongoDB if local daemon is not running
 */
const connectDB = async (exitOnError = false) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const customUri = (process.env.MONGODB_URI || '').trim();
  const isValidCustomUri = customUri && (customUri.startsWith('mongodb://') || customUri.startsWith('mongodb+srv://'));

  // 1. Explicit MONGODB_URI in .env (MongoDB Atlas cluster or remote DB)
  if (isValidCustomUri) {
    try {
      console.log(`[Mongoose] Connecting to MongoDB from environment URI...`);
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true
      });
      console.log(`✅ [Mongoose] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      await autoSeedIfEmpty();
      return conn;
    } catch (err) {
      console.warn(`[Mongoose] Environment URI failed (${err.message}). Trying standard local connection...`);
    }
  }

  // 2. Standard Local MongoDB (VS Code local development with MongoDB Compass / mongod)
  const isLocalRunning = await isPortListening('127.0.0.1', 27017, 300);
  if (isLocalRunning) {
    try {
      const conn = await mongoose.connect(DEFAULT_LOCAL_URI, {
        serverSelectionTimeoutMS: 3000,
        autoIndex: true
      });
      console.log(`✅ [Mongoose] Connected to local MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      await autoSeedIfEmpty();
      return conn;
    } catch (err) {
      console.warn(`[Mongoose] Local connection notice: ${err.message}`);
    }
  }

  // 3. Embedded In-Memory fallback (keeps preview environment fully operational)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongoMemoryServerInstance) {
      mongoMemoryServerInstance = await MongoMemoryServer.create({
        instance: { dbName: 'olx_marketplace' }
      });
    }

    const rawUri = mongoMemoryServerInstance.getUri();
    const memUri = rawUri.endsWith('/') ? `${rawUri}olx_marketplace` : `${rawUri}/olx_marketplace`;

    const conn = await mongoose.connect(memUri, {
      serverSelectionTimeoutMS: 6000,
      autoIndex: true
    });

    console.log(`✅ [Mongoose] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeedIfEmpty();
    return conn;
  } catch (memErr) {
    console.warn(`[Mongoose] Connection notice: ${memErr.message}`);
    if (exitOnError) {
      process.exit(1);
    }
    return null;
  }
};

// Graceful cleanup
const gracefulShutdown = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
    }
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
      mongoMemoryServerInstance = null;
    }
  } catch {
    // quiet
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

const getConnectionStatus = async () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || '127.0.0.1',
    database: mongoose.connection.name || 'olx_marketplace',
    models: Object.keys(mongoose.models)
  };
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;
