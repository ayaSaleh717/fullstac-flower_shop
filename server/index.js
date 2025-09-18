import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//configure dotenv to use .env file
dotenv.config();

//rest object
const app = express();

import usersRoute from './routes/usersRoute.js';
import productsRoute from './routes/productsRouter.js';
import categoryRoute from './routes/categoryRoute.js';
import orderRoute from './routes/orderRoute.js';
import cartRoute from './routes/cartRoutes.js';

// CORS configuration
const corsOptions = {
  origin: ['https://flower-shop-c022.onrender.com','http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Content-Disposition']
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));

// Log requests
app.use(morgan('dev'));

// Parse JSON bodies for all routes except file uploads
app.use((req, res, next) => {
  if (req.originalUrl === '/api/products/add' && req.method === 'POST') {
    // Skip JSON parsing for file uploads
    next();
  } else {
    // Parse JSON for all other routes
    express.json({ limit: '10mb' })(req, res, next);
  }
});

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configure static file serving with proper CORS and caching
app.use('/uploads', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Set cache control (1 day)
  res.set('Cache-Control', 'public, max-age=86400');
  
  // Continue to static file serving
  return express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
      // Set content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg') {
        res.set('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.set('Content-Type', 'image/png');
      } else if (ext === '.gif') {
        res.set('Content-Type', 'image/gif');
      }
    }
  })(req, res, next);
});

// Log static file serving configuration
console.log('Serving static files from:', uploadsPath);
console.log('Uploads directory exists:', fs.existsSync(uploadsPath));

//routes
app.use('/api/users', usersRoute);
app.use('/api/products', productsRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/orders', orderRoute);
app.use('/api/cart', cartRoute);

// app.get("/test", (req, res) => {
//   res.status(200).send("Hello, World!");
//   console.log("Hello, World!");
// });

const PORT = process.env.PORT || 3051;

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Simple connection with error handling
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('MongoDB connected successfully');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
    
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Please ensure:');
    console.log('1. Your IP is whitelisted in MongoDB Atlas');
    console.log('2. Your connection string is correct');
    console.log('3. Your MongoDB Atlas cluster is running');
    process.exit(1);
  }
};

startServer();


//conditionally listen
// db.query("SELECT 1")
//   .then(() => {
//     console.log("Connected to database");
//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   })

//   .catch((err) => {
//     console.error("Error connecting to database:", err);
//     process.exit(1);
//   });
