require('dotenv').config();

const connectDB = require("./config/db");
connectDB();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Middleware
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:5001', 'http://127.0.0.1:3000']
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7   // 1 week
  }
}));

// Routes
// Auth routes found in routes/auth.js
app.use('/api/auth', require('./routes/auth'));

// Tutor routes found in routes/tutor.js
app.use('/api/tutor', require('./routes/tutor'));

// Review routes found in routes/review.js
app.use('/api/review', require('./routes/review'));

// Availability routes found in routes/availability.js
app.use('/api/availability', require('./routes/availability'));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running!', 
    database: "MongoDB connected"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
