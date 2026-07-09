import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  generateWebsite,
  updateWebsite,
  getWebsiteById,
  getBySlug,
  getAll,
  deploy,
} from "../Controllers/website.controller.js"; 

const websiteRouter = express.Router();

// ✅ Debug Middleware - Har request ke liye log karein
websiteRouter.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.originalUrl} - Auth: ${req.user?._id || 'No user'}`);
  console.log(`📦 Body:`, req.body);
  console.log(`🔑 Cookies:`, req.cookies?.token ? '✅ Token present' : '❌ No token');
  console.log(`🔑 Auth Header:`, req.headers.authorization ? '✅ Present' : '❌ Missing');
  next();
});

// 1. AI Website Generation (Requires Auth)
websiteRouter.post("/generate", isAuth, generateWebsite);

// 2. Chatbot Code Update / Edit Website (Requires Auth)
websiteRouter.put("/update/:id", isAuth, updateWebsite);

// 3. Get All Websites for Logged-In User (Requires Auth)
websiteRouter.get("/get-all", isAuth, getAll);

// 4. Deploy Route
websiteRouter.post("/deploy/:id", isAuth, deploy);

// 5. PUBLIC ROUTE: MongoDB ID se website fetch
websiteRouter.get("/get-by-id/:id", getWebsiteById);

// 6. PUBLIC ROUTE: Slug se website fetch (LiveSite ke liye)
websiteRouter.get("/get-by-slug/:slug", getBySlug);

export default websiteRouter;