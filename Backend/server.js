import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRouter from './routes/authRoute.js';
import apiRouter from './routes/apiRoute.js';
import verifyAccessToken from './middleware/authentication.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,           // limit each IP to 1000 requests per minute
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api', verifyAccessToken, apiRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} does not exist`
  });
});

// Connect DB and Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
