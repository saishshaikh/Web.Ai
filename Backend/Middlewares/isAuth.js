import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isAuth = async (req, res, next) => {
  try {
    // safer cookie access
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decode.id || decode._id || decode.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default isAuth;