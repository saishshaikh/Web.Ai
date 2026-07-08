import User from "../models/User.js";

import GenerateToken from "../Config/Token.js";

// Google Authentication 

export const googleAuth = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, avatar });
    }

    // generate token
    const token = GenerateToken(user); 

    // cookies
    res.cookie ("token",token,{
      httpOnly :true,
      secure : false,
      sameSite : "strict",
      maxAge : 7*24*60*60*1000
    })

    // return user data and token in JSON
    return res.status(200).json({
      user,
      token,
      
    });


    


  } catch (error) {
    return res.status(500).json({
      message: "Google Auth Error " + error.message,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    // Since we are not using cookies, just return a success message
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Logout Error " + error.message,
    });
  }
};
