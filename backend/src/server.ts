import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import apiV1Router from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { taskQueue } from './lib/queue';

const app = express();

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = [
  config.urls.frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...((process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('harshaicreations.com') ||
        config.nodeEnv === 'development'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers & request logger
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/v1', apiV1Router);

// Root route
app.get('/', (_req, res) => {
  res.json({
    platform: 'Gold Stamp - Digital Loyalty & Stamp SaaS Platform',
    version: '1.0.0',
    documentation: '/api/v1/health',
    status: 'ONLINE',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
});

// Centralized Error Middleware
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`🚀 [Gold Stamp API] Server running in ${config.nodeEnv} mode at http://localhost:${config.port}`);
  taskQueue.startPeriodicWorkers();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  taskQueue.stop();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
