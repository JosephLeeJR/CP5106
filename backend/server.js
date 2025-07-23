const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cp5106', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');

    // Attempt to drop the stale unique index on studentId.
    // This can happen if the schema changed but the index in the DB remained.
    const User = require('./models/User');
    User.collection.dropIndex('studentId_1')
      .then(() => {
        console.log('Successfully dropped legacy index: studentId_1');
      })
      .catch((err) => {
        // It's okay if the index doesn't exist.
        if (err.code === 27) { // IndexNotFound
          console.log('Legacy index studentId_1 not found, no action needed.');
        } else {
          console.error('Error dropping legacy index studentId_1:', err);
        }
      });
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 