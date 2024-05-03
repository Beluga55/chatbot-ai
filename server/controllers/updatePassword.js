import { User } from "../db.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

export const updatePassword = async (req, res) => {
  try {
    const { token, newPassword, userEmail } = req.body;

    // EXTRACT THE CURRENT HASHED PASSWORD FROM THE DATABASE
    const user = await User.findOne({ email: userEmail });

    if (user) {
      const oldHashedPassword = user.password;
      const secret = process.env.VALIDATE_JWT_SECRET_KEY + oldHashedPassword;

      try {
        jwt.verify(token, secret);

        // CHECK IF THE NEW PASSWORD IS SAME WITH THE OLD PASSWORD
        if (await bcrypt.compare(newPassword, oldHashedPassword)) {
          return res.status(400).json({
            message: "New password must be different from the old password",
          });
        }

        // HASH AND UPDATE THE NEW PASSWORD
        const newHashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await User.updateOne(
          { email: userEmail },
          { $set: { password: newHashedPassword } }
        );

        // RETURN PROMISE FROM MONGODB
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Password updated successfully" });
        } else {
          res.status(400).json({ message: "Password update failed" });
        }
      } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
