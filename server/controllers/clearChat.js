import { Title, Chat } from "../db.js";

export const clearChat = async (req, res) => {
  try {
    const { username } = req.body;

    // FIND DOCUMENT IN THE TITLE COLLECTION WITH THE GIVEN USERNAME
    const titleDocuments = await Title.find({ username: username }).toArray();

    // EXTRACT THE DATA AND MAP THE OBJECT ID INTO A NEW ARRAY
    const titleIds = titleDocuments.map((title) => title._id);

    // DELETE DOCUMENTS IN THE "CHAT" COLLECTION WHERE OBJECT ID MATCHES
    await Chat.deleteMany({ titleId: { $in: titleIds } });

    // DELETE ALL THE TITLES ASSOCIATED WITH THE USERNAME
    await Title.deleteMany({ username });

    // SEND A RESPONSE
    res.status(200).json({ message: "Chat has been cleared" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
