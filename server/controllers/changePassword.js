import { User } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

// VERIFY TOKEN
// Function to verify the token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid Token");
  }
};

export const changePassword = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied" });

    const token = authHeader.split(" ")[1];
    verifyToken(token);

    const { username, currentPassword, newPassword, confirmNewPassword } =
      req.body;

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    // IF THE currentPassword is empty
    if (!currentPassword) {
      return res
        .status(400)
        .json({ message: "Current password cannot be empty" });
    }

    // IF THE newPassword is empty
    if (!newPassword) {
      return res.status(400).json({ message: "New password cannot be empty" });
    }

    // IF THE confirmNewPassword is empty
    if (!confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "Confirm new password cannot be empty" });
    }

    // IF THE newPassword and confirmNewPassword are not same
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: "New password and confirm new password are not same",
      });
    }

    // IF THE newPassword is less than 8 characters and dont have one uppercase letter
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // IF THE newPassword is less than 8 characters and dont have one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        message: "New Password must have at least one uppercase letter",
      });
    }

    // CHECK WHETHER THE PASSWORD IS SAME AS THE CURRENT PASSWORD
    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // CHECK WHETHER THE NEW PASSWORD IS SAME AS THE CURRENT PASSWORD
    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res
        .status(400)
        .json({ message: "New password is same as the current password" });
    }

    // HASH THE PASSWORD
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // UPDATE THE PASSWORD
    const updatedPassword = await User.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
