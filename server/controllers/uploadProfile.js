/* ========== UPLOAD IMAGES MODULE ========== */
import fs from "fs";
import formidable from "formidable";
import { User, initializeMongoClient, imageFiles, imageChunks } from "../db.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

export const uploadProfile = (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied" });

    const token = authHeader.split(" ")[1]; // Split on space and take the second part

    try {
      const verified = jwt.verify(token, process.env.SECRET_KEY);

      const form = formidable({});

      // PARSE THE FORM DATA
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        // EXTRACT THE USERNAME AND THE IMAGE FROM THE FORM DATA
        const imageFilePath = files.image[0].filepath;
        const username = fields.username[0];
        const imageFileName = files.image[0].originalFilename;
        const imageFileType = files.image[0].mimetype;

        // CHECKS IF THE FILE IS AN IMAGE
        if (!imageFileType.startsWith("image")) {
          return res.status(400).json({ message: "Please upload an image" });
        }

        // FIND A USER BY USERNAME
        const user = await User.findOne({ username });

        // CHECKS IF THE USER EXISTS
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // UPLOAD THE IMAGE TO THE DATABASE
        const bucket = await initializeMongoClient();
        const writestream = bucket.openUploadStream(imageFileName, {
          chunkSizeBytes: 1048576,
          contentType: imageFileType,
        });

        // READSTREAM
        const readstream = fs.createReadStream(imageFilePath);

        readstream.pipe(writestream);

        writestream.on("error", (error) => {
          console.error("Error uploading image:", error);
        });

        writestream.on("finish", async () => {
          // UPDATE THE USERS COLLECTION WITH NEW IMAGE
          if (user) {
            await User.updateOne(
              { _id: user._id },
              { $set: { profilePicture: imageFileName } }
            );
          }
        });

        // EXTRACT THE profilePicture FIELD FROM USER COLLECTION
        const profilePictureFromUsersCollection = user.profilePicture;

        if (profilePictureFromUsersCollection) {
          // EXTRACT THE FILENAME FROM THE UPLOAD.FILES COLLECTION
          const imageFileNameFromDB = await imageFiles.findOne({
            filename: profilePictureFromUsersCollection,
          });

          // EXTRACT THE profilePicture FIELD FROM UPLOAD.FILES COLLECTION
          if (imageFileNameFromDB) {
            const profilePictureFromUploadCollection =
              imageFileNameFromDB.filename;

            // COMPARE THE BOTH COLLECTIONS
            if (
              profilePictureFromUsersCollection ===
              profilePictureFromUploadCollection
            ) {
              // EXTRACT THE _ID FROM THE UPLOAD.FILES COLLECTION
              const id = imageFileNameFromDB._id;

              // FIND ALL THE CHUNKS USING THE ID ABOVE
              await imageChunks.find({ files_id: id }).toArray();

              // DELETE ALL THE CHUNKS THAT MATCHES THE ID
              await imageFiles.deleteOne({ _id: id });
              await imageChunks.deleteMany({ files_id: id });
            }
          }
        }

        res
          .status(200)
          .json({
            message: "Image uploaded successfully",
            file: imageFileName,
          });
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid Token" });
    }
  } catch (error) {}
};

