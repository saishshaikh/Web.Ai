import User from "../models/User.js";

export const getCurrentUser = async (req, res) => {
  try {
    // 🔥 Always fetch fresh user from DB
    const user = await User.findById(req.user._id).select("-__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error :: " + error.message,
    });
  }
};