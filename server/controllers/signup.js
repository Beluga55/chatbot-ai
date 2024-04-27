import bcrypt from "bcryptjs";
import { User } from "../db.js";

export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // VALIDATE FORM DATA
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Invalid form data." });
    }

    // ENCRYPT PASSWORD
    const hashedPassword = await bcrypt.hash(password, 12);

    // CREATE UNIQUE INDEXES FOR USERNAME AND EMAIL
    await User.createIndex({ username: 1 }, { unique: true });
    await User.createIndex({ email: 1 }, { unique: true });

    // THE DEFAULT ROLE IS USER
    const defaultRole = "user";

    // CREATE A NEW USER
    const insertNewUser = await User.insertOne({
      username,
      email,
      password: hashedPassword,
      role: defaultRole,
      profilePicture: "",
      expiryDate: "",
      plan: "Free Plan",
      createdAt: new Date(),
      verified: false,
    });

    // CHECKS WHETHER SUCCESSFULLY INSERT
    if (insertNewUser.acknowledged === true) {
      // NO CONTENT STATUS CODE
      res.status(204).end();
    } else {
      // INTERNAL SERVER ERROR
      res.status(500).json({ error: "Failed to create a new user." });
    }
  } catch (error) {
    // CHECKS DUPLLICATE EMAIL AND USERNAME
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Email or username is already taken." });
    }
  }
};
