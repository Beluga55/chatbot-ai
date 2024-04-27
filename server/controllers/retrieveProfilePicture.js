import { User, initializeMongoClient, imageFiles } from "../db.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

export const retrieveProfilePicture = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied" });

    const token = authHeader.split(" ")[1]; // Split on space and take the second part

    try {
      const verified = jwt.verify(token, process.env.SECRET_KEY);

      const username = req.body.username;

      const user = await User.findOne({ username });
      const profilePicture = user.profilePicture;

      if (profilePicture) {
        const findImage = await imageFiles.findOne({
          filename: profilePicture,
        });
        const imageFileName = findImage.filename;

        if (profilePicture === imageFileName) {
          const bucket = await initializeMongoClient();
          const files = await bucket
            .find({ filename: imageFileName })
            .toArray();

          if (!files || files.length === 0) {
            return res.status(404).json({ error: "File not found" });
          }

          if (
            files[0].contentType === "image/jpeg" ||
            files[0].contentType === "image/png"
          ) {
            res.set("Content-Type", files[0].contentType);
            const readstream = bucket.openDownloadStreamByName(imageFileName);
            readstream.pipe(res);
          } else {
            res.status(404).json({ error: "Not an image" });
          }
        }
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid Token" });
    }
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).send("Error retrieving image");
  }
};
