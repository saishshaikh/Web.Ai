import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { DBconnect } from "./Config/db.js";

import Authrouter from "./routes/auth.route.js";
import userrouter from "./routes/user.route.js";
import websiterouter from "./routes/website.route.js";
import billingRouter from "./routes/billing.routes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ✅ CORS - Multiple Origins Support
const allowedOrigins = [
  "https://web-ai-4.onrender.com",
  "https://web-ai-3-84cy.onrender.com",
  "https://genweb.ai",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // ✅ Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
  })
);

// ✅ Routes
app.use("/api/auth", Authrouter);
app.use("/api/user", userrouter);
app.use("/api/website", websiterouter);
app.use("/api/billing", billingRouter);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running...",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 8000;

// Connect DB and Start Server
DBconnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 CORS allowed origins:`, allowedOrigins);
    });
  })
  .catch((err) => {
    console.log("❌ Database connection failed:", err);
    process.exit(1);
  });

export default app;