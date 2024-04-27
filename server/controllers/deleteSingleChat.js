import { Chat, Title } from "../db.js";
import { ObjectId } from "mongodb";

export const deleteSingleChat = async (req, res) => {
  try {
    const { titleId } = req.body;

    // DELETE THE CHAT
    await Chat.deleteOne({ titleId: new ObjectId(titleId) });
    await Title.deleteOne({ _id: new ObjectId(titleId) });

    res.status(200).json({ message: "Chat deleted successfully!" });
  } catch (error) {}
};
