import jwt from "jsonwebtoken";
import User from "../Models/User.js";

const isAuth = async (req, res, next) => {
  try {
    console.log("🔐 Auth Middleware - Checking token...");
    
    // ✅ Cookie se token try karein
    let token = req.cookies?.token;
    
    // ✅ Agar cookie me nahi hai toh Authorization header check karein
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log("🔑 Token found in Authorization header");
      }
    }

    if (!token) {
      console.log("❌ No token found in cookies or Authorization header");
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized: token missing",
        debug: {
          cookies: Object.keys(req.cookies || {}),
          hasAuthHeader: !!req.headers.authorization
        }
      });
    }

    console.log("🔐 Verifying token...");
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    
    const userId = decode.id || decode._id || decode.userId;
    console.log(`👤 User ID from token: ${userId}`);

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token payload" 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log(`✅ Auth successful for user: ${user.email || user._id}`);
    req.user = user;
    next();

  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export default isAuth;