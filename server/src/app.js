'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { CLIENT_URL, NODE_ENV } = require('./config/env');
const { apiLimiter, mutationLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const creditRoutes = require('./routes/creditRoutes');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = CLIENT_URL.split(',').map((value) => value.trim()).filter(Boolean);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new AppError('Origin not allowed by CORS', 403));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
if (NODE_ENV !== 'test') app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

app.get('/health', (_req, res) => res.status(200).json({ success: true, data: { status: 'ok', service: 'asian-news-bureau-api' }, message: 'Healthy' }));
app.get('/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready, data: { database: ready ? 'connected' : 'disconnected' }, message: ready ? 'Ready' : 'Not ready' });
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', mutationLimiter, userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/submissions', mutationLimiter, submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/credits', creditRoutes);

app.all('*', (req, res, next) => next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)));
app.use(errorHandler);

module.exports = app;
