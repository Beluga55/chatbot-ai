import { Chat, Title, User } from '../db.js'

export const retrieveChatHistoryAdmin = async (req, res) => {
  try {
    const usersCollection = await User.find().toArray()
    const usernames = usersCollection.map((doc) => doc.username)

    const chatHistoryPromises = usernames.map(async (username) => {
      const titleAndRandomIDs = await Title
        .find({ username: username })
        .toArray()

      if (!titleAndRandomIDs.length) {
        return null
      }

      const chatDataPromises = titleAndRandomIDs.map(
        async (titleAndRandomID) => {
          const { title, _id } = titleAndRandomID

          // Find Chat title id
          const converHistoryDocuments = await Chat
            .find({ titleId: _id })
            .toArray()

          const prompts = converHistoryDocuments.map((doc) => doc.prompts)
          const responses = converHistoryDocuments.map((doc) => doc.responses)
          const timestamp = converHistoryDocuments.map((doc) => doc.timestamp)

          return {
            username: username,
            title,
            prompts: prompts,
            responses: responses,
            timestamp: timestamp,
          }
        }
      )

      // Wait for all chat data promises to resolve
      const chatData = await Promise.all(chatDataPromises)
      return chatData
    })

    const completedChatHistory = await Promise.all(chatHistoryPromises)
    const filteredChatHistory = completedChatHistory
      .flat()
      .filter((item) => item !== null)

    // Limit the output to 15 items
    const limitedChatHistory = filteredChatHistory.slice(0, 15)

    res.json({ chatHistory: limitedChatHistory })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}