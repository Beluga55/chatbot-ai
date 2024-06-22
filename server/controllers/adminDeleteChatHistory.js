import { Chat, Title } from '../db.js'

export const adminDeleteChatHistory = async (req, res) => {
  try {
    const title = req.body.clientTitle

    // FIND THE RANDOM ID
    const findRandomID = await Title.findOne({ title })
    // Object ID from MongoDB
    const titleID = findRandomID._id

    // DELETE DOCUMENTS IN THE "CONVERHISTORY" COLLECTION WHERE RANDOM ID MATCHES
    await Chat.deleteOne({
      titleId: titleID,
    })

    await Title.deleteOne({
      _id: titleID,
    })

    // SUCCESS RESPONSE
    res.status(200).json({ message: 'Chat history deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}