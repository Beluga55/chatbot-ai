import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { User } from "../db.js";

dotenv.config();

export const loginUser = async (req, res) => {
  try {
    let user = "";
    const { username, password } = req.body;

    // CHECK IF THESE TWO FIELDS ARE EMPTY
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // CHECK IF THE USER EXISTS
    user = await User.findOne({ username });

    if (!user) {
      // FIND THE USER BY EMAIL
      user = await User.findOne({ email: username });

      if (!user) {
        return res.status(400).json({ message: "User does not exist." });
      }
    }

    // CHECK IF THE PASSWORD IS CORRECT
    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
      const secretKey = process.env.SECRET_KEY;
      // ASSIGN A TOKEN TO THE USER
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        secretKey,
        { expiresIn: "5h" }
      );

      // SEND THE TOKEN TO THE CLIENT
      return res.status(200).json({
        token,
        role: user.role,
        username: user.username,
      });
    } else {
      return res.status(400).json({ message: "Invalid password." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
