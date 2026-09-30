import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Import backend db connector and models
const { connectDB, getConnectionStatus } = require('./backend/config/db.js');
const mongoose = require('mongoose');

// Preload models for schema registration & status
require('./backend/models/User');
require('./backend/models/Category');
require('./backend/models/Listing');
require('./backend/models/Conversation');
require('./backend/models/Message');

async function startServer() {
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const portFromArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
  const PORT = portFromArg || 3000;

  // Initialize Mongoose connection asynchronously
  await connectDB(false);

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Health Check with live Mongoose database connection status
  app.get('/api/health', async (req, res) => {
    const dbStatus = await getConnectionStatus();
    res.json({
      status: 'online',
      service: 'OLX Classifieds Marketplace Full-Stack API',
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
        seedCommand: 'cd backend && npm run seed',
        testCommand: 'cd backend && npm run test:db'
      }
    });
  });

  // Reconnect or test custom MongoDB URI endpoint
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
          : `Connection attempted, currently in state: ${dbStatus.state}`,
        status: dbStatus
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Failed to connect: ${error.message}`
      });
    }
  });

  // Admin database re-seed endpoint
  app.post('/api/admin/seed', async (req, res) => {
    try {
      const { reseedDatabase, getConnectionStatus } = require('./backend/config/db.js');
      await reseedDatabase();
      const dbStatus = await getConnectionStatus();
      res.json({
        success: true,
        message: 'Database re-seeded successfully with default categories and listings.',
        status: dbStatus
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Failed to seed database: ${error.message}`
      });
    }
  });

  // Mount backend REST API routes
  app.use('/api/users', require('./backend/routes/userRoutes'));
  app.use('/api/categories', require('./backend/routes/categoryRoutes'));
  app.use('/api/listings', require('./backend/routes/listingRoutes'));
  app.use('/api/chats', require('./backend/routes/chatRoutes'));

  // Vite integration: Dev middleware or Static production serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 OLX Server Running on http://localhost:${PORT}`);
    console.log(`🌐 Health Check:    http://localhost:${PORT}/api/health`);
    console.log(`📊 Database Status: http://localhost:${PORT}/api/db-status`);
    console.log(`=================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot error:', err);
});
