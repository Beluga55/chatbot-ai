import { Title } from "../db.js";
import { ObjectId } from "mongodb";

export const renameChat = async (req, res) => {
  try {
    const { titleId, newTitle } = req.body;

    console.log(titleId, newTitle);

    const findTitle = await Title.findOne({ _id: new ObjectId(titleId) });

    if (!findTitle) {
      return res.status(404).json({ message: "Title not found" });
    }

    // Update the title
    await Title.updateOne(
      { _id: new ObjectId(titleId) },
      { $set: { title: newTitle } }
    );

    res.status(200).json({ message: "Title updated" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
