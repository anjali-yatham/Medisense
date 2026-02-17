const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const prescriptionRoutes = require('./routes/prescription');
const notificationRoutes = require('./routes/notification');
const medicineRoutes = require('./routes/medicine');
const medDatabaseRoutes = require('./routes/medDatabase');
const profileRoutes = require('./routes/profile');
const ocrRoutes = require('./routes/ocr');
const { initializeCronJobs } = require('./services/cronService');
const { startNotificationWorker } = require('./services/notificationWorker');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/med-database', medDatabaseRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ocr', ocrRoutes);

// Database connection
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Initialize cron jobs after DB connection
    initializeCronJobs();
    // Start background notification worker to send pending notifications
    startNotificationWorker();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
