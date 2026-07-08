import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import {
  generateWebsite,
  updateWebsite,
  getWebsiteById,
  getBySlug, // 🔥 फिक्स 1: LiveSite के लिए स्लग कंट्रोलर इम्पोर्ट किया
  getAll,
  deploy,
} from "../Controllers/website.controller.js"; 

const websiteRouter = express.Router();

// 1. AI Website Generation (Requires Auth)
websiteRouter.post("/generate", isAuth, generateWebsite);

// 2. Chatbot Code Update / Edit Website (Requires Auth)
websiteRouter.put("/update/:id", isAuth, updateWebsite);

// 3. Get All Websites for Logged-In User (Requires Auth)
websiteRouter.get("/get-all", isAuth, getAll);

// 4. 🔥 फिक्स 2: डिप्लॉयमेंट राउट को GET से POST किया और :id पैरामीटर जोड़ा 
// (क्योंकि फ्रंटएंड axios.post से इसपर रिक्वेस्ट भेज रहा है)
websiteRouter.post("/deploy/:id", isAuth, deploy);

// 5. PUBLIC ROUTE: MongoDB ID से वेबसाइट का कोड फेच करने के लिए
websiteRouter.get("/get-by-id/:id", getWebsiteById);

// 6. 🔥 फिक्स 3: LiveSite.jsx के लिए यूनिक स्लग से वेबसाइट ढूंढने का पब्लिक राउट
websiteRouter.get("/get-by-slug/:slug", getBySlug);

export default websiteRouter;