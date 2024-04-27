import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Access Denied" });

  const token = authHeader.split(" ")[1]; // Split on space and take the second part

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);

    // If the token is verified, NO CONTENT SUCCESS RESPONSE
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};
