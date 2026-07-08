import jwt from "jsonwebtoken";

// Function to generate token for a user
const GenerateToken = (user) => {
  return jwt.sign(
    { id: user._id },         // payload
    process.env.JWT_SECRET,    // secret from .env
    { expiresIn: "7d" }       // options
  );
};

export default GenerateToken;
