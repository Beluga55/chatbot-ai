import { initializeMongoClient } from "../db.js";

export const getImage = async (req, res) => {
  try {
    const bucket = await initializeMongoClient();
    const file = req.params.file;

    const files = await bucket.find({ filename: file }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    if (
      files[0].contentType === "image/jpeg" ||
      files[0].contentType === "image/png"
    ) {
      res.set("Content-Type", files[0].contentType);
      const readstream = bucket.openDownloadStreamByName(file);
      readstream.pipe(res);
    } else {
      console.error("Not an image:", files[0].contentType);
      res.status(404).json({ error: "Not an image" });
    }
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).send("Error retrieving image");
  }
};
