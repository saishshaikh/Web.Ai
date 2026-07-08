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

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", Authrouter);
app.use("/api/user", userrouter);
app.use("/api/website", websiterouter);
app.use("/api/billing", billingRouter);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

const PORT = process.env.PORT || 8000;

// Connect DB and Start Server
DBconnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });