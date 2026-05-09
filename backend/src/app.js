const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const departmentRoutes = require('./modules/departments/department.routes');
const labRoutes = require('./modules/labs/labs.routes');
const itemRoutes = require('./modules/items/items.routes');
const scheduleRoutes = require('./modules/schedules/schedules.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const loanRoutes = require('./modules/loans/loan.routes');

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: 'Too many login/register attempts, please try again later.'
});

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
app.use('/api/v1/', generalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/labs', labRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/loans', loanRoutes);

// Health check
app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;