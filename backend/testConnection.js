/**
 * Standalone Mongoose Connection & Diagnostic Test Script
 * Run with: node testConnection.js (or: npm run test:db)
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, getConnectionStatus, sanitizeMongoUri } = require('./config/db');

// Preload models to verify schema registration
require('./models/User');
require('./models/Category');
require('./models/Listing');
require('./models/Conversation');
require('./models/Message');

const runTest = async () => {
  console.log(`\n======================================================`);
  console.log(`🧪 TESTING MONGOOSE DATABASE CONNECTION`);
  console.log(`======================================================`);
  console.log(`🕒 Started at: ${new Date().toLocaleString()}`);
  console.log(`------------------------------------------------------`);

  try {
    const conn = await connectDB(false);
    if (!conn || mongoose.connection.readyState !== 1) {
      throw new Error('Connection could not be established');
    }

    console.log(`✅ [1/4] Mongoose Connection Succeeded!`);
    console.log(`       - Host: ${conn.connection.host}`);
    console.log(`       - Database: ${conn.connection.name}`);
    console.log(`       - ReadyState: ${conn.connection.readyState} (1 = connected)`);

    // Ping test
    console.log(`\n🔍 [2/4] Testing Admin Ping Command...`);
    const adminDb = conn.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log(`       - Ping Response:`, pingResult);

    // Schema / Models check
    console.log(`\n📋 [3/4] Checking Mongoose Registered Models...`);
    const registered = Object.keys(mongoose.models);
    console.log(`       - Registered Models (${registered.length}): ${registered.join(', ')}`);

    // Collections check
    console.log(`\n📁 [4/4] Listing Collections & Document Counts...`);
    const collections = await conn.connection.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log(`       - No collections found yet. Run 'npm run seed' to populate initial data.`);
    } else {
      for (const col of collections) {
        const count = await conn.connection.db.collection(col.name).countDocuments();
        console.log(`       - Collection '${col.name}': ${count} document(s)`);
      }
    }

    console.log(`\n======================================================`);
    console.log(`🎉 ALL MONGOOSE CONNECTION CHECKS PASSED!`);
    console.log(`Ready for project evaluation & React frontend integration.`);
    console.log(`======================================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.warn(`\n⚠️ [TEST NOTICE] Mongoose Connection: ${error.message}\n`);
    process.exit(1);
  }
};

runTest();
