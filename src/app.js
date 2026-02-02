const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const appRoutes = require("./routers");
const { Admin } = require("./models/authModels");
const passport = require('./config/passport.js');
const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.json({ limit: "100kb" }));

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:4200',

];
app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server tools (Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,// if using cookies/sessions
  optionsSuccessStatus: 200
}));
app.use(morgan("dev"));

// Session and passport
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    sameSite: 'lax' // helps with CSRF
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Routes
appRoutes(app);

// Admin setup - creates default admin if none exists
async function createDefaultAdmin() {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      // Use environment variables for default admin credentials
      const admin = new Admin({
        name: process.env.DEFAULT_ADMIN_NAME || "Admin",
        email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
        number: process.env.DEFAULT_ADMIN_NUMBER || "0000000000",
        password: process.env.DEFAULT_ADMIN_PASSWORD || "changeme123",
        role: "superadmin",
      });
      await admin.save();
      console.log("Default admin created. Please change the password immediately.");
    }
  } catch (error) {
    console.error("Error creating default admin:", error.message);
  }
}

// Call admin setup on app initialization
createDefaultAdmin();
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
module.exports = app;