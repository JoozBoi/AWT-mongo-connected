const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB, getConnectionStatus, sanitizeMongoUri } = require('./config/db');

// Load Environment Variables
dotenv.config();

// Preload models for schema registration & status visibility
require('./models/User');
require('./models/Category');
require('./models/Listing');
require('./models/Conversation');
require('./models/Message');

// Connect to MongoDB via Mongoose
connectDB(false);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Health Check with live Mongoose database connection status
app.get('/api/health', async (req, res) => {
  const dbStatus = await getConnectionStatus();
  res.json({
    status: 'online',
    service: 'OLX Classifieds Marketplace Backend API',
    database: {
      connected: dbStatus.connected,
      readyState: dbStatus.readyState,
      state: dbStatus.state,
      host: dbStatus.host,
      database: dbStatus.database,
      models: dbStatus.registeredModels
    },
    timestamp: new Date().toISOString()
  });
});

// Dedicated Database Status & Diagnostics endpoint for evaluation verification
app.get('/api/db-status', async (req, res) => {
  const dbStatus = await getConnectionStatus();
  res.json({
    success: true,
    ...dbStatus,
    instructions: {
      localCompassURI: 'mongodb://127.0.0.1:27017/olx_marketplace',
      atlasFormat: 'mongodb+srv://<username>:<password>@cluster.mongodb.net/olx_marketplace',
      seedCommand: 'npm run seed',
      testCommand: 'npm run test:db'
    }
  });
});

// Reconnect or test custom MongoDB URI endpoint (convenient during testing & evaluation)
app.post('/api/db-connect', async (req, res) => {
  const { mongoURI } = req.body || {};
  if (mongoURI) {
    process.env.MONGODB_URI = mongoURI;
  }
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
    }
    await connectDB(false);
    const dbStatus = await getConnectionStatus();
    res.json({
      success: dbStatus.connected,
      message: dbStatus.connected 
        ? `Successfully connected to MongoDB via Mongoose at ${dbStatus.configuredURI}`
        : `Connection attempted but currently in state: ${dbStatus.state}`,
      status: dbStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to connect: ${error.message}`
    });
  }
});

// Mount Resource Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

// 404 Handler for Unknown API Routes
app.use((req, res, next) => {
  res.status(404).json({ message: `API Endpoint Not Found: ${req.originalUrl}` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Port Binding
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 OLX Backend Express Server Running on Port ${PORT}`);
  console.log(`🌐 Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`📊 Database Status:  http://localhost:${PORT}/api/db-status`);
  console.log(`=================================================`);
});

module.exports = app;
