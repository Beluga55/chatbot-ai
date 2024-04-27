import { User } from "../db.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

// Function to verify the token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid Token");
  }
};

export const getEmailAndStatus = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied" });

    const token = authHeader.split(" ")[1];
    verifyToken(token);

    const username = req.body.username;

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ email: user.email, isVerified: user.verified });
  } catch (error) {
    console.error("Error getting email:", error);
    res.status(500).json({ message: "Error getting email" });
  }
};
