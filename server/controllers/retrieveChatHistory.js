import { Chat, Title } from "../db.js";
import { ObjectId } from "mongodb";

export const retrieveChatHistory = async (req, res) => {
  try {
    const { titleId } = req.body;

    const titleDocuments = await Title.findOne({ _id: new ObjectId(titleId) });
    const chatDocuments = await Chat.findOne({
      titleId: new ObjectId(titleId),
    });

    if (titleDocuments && chatDocuments) {
      const prompts = chatDocuments.prompts;
      const responses = chatDocuments.responses;

      res.status(200).json({ prompts, responses });
    } else {
      res.status(404).json({ message: "Chat history not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
