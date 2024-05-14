import { Feedback, initializeMongoClient, User } from '../db.js'

export const getFeedback = async (req, res) => {
  const feedbacks = await Feedback.find().toArray()

  // LOOP THROUGH THE FEEDBACKS AND EXTRACT THE USERNAME
  // PUT ALL THE USERNAME INTO A NEW ARRAY (LIMIT 5)
  const usernames = feedbacks.map(feedback => feedback.username).slice(0, 5)

  // FIND THE USER BASED ON THE USERNAME
  // PUT ALL THE USER OBJECT INTO A NEW ARRAY (LIMIT 5)
  const usersArray = await User.find({ username: { $in: usernames } }).toArray()
  const users = usersArray.slice(0, 5)

  // CAN GET THE USERNAME AND FEEDBACK HERE LATER ON

  // GET ALL THE PROFILE PICTURE FROM THE USERS
  // PUT ALL THE PROFILE PICTURE INTO A NEW ARRAY
  const profilePictures = users.map(user => user.profilePicture)

  // FIND ALL THE PROFILE PICTURE FROM THE USERS
  // PUT ALL THE PROFILE PICTURE INTO A NEW ARRAY
  try {
    const bucket = await initializeMongoClient()
    const fileChunks = []

    for (const profilePicture of profilePictures) {
      const files = await bucket.find({ filename: profilePicture }).toArray()
      fileChunks.push(...files)
    }

    if (fileChunks.length === 0) {
      res.status(404).json({ message: 'Profile pictures are not found' })
    }

    // READSTREAM THE PROFILE PICTURES
    if (fileChunks.length > 0) {
      const files = []
      for (const fileChunk of fileChunks) {
        const downloadStream = bucket.openDownloadStreamByName(fileChunk.filename)
        const chunks = []
        downloadStream.on('data', (chunk) => {
          chunks.push(chunk)
        })

        downloadStream.on('error', () => {
          res.status(404).json({ message: 'Profile pictures are not found' })
        })

        downloadStream.on('end', () => {
          files.push(Buffer.concat(chunks))
          if (files.length === fileChunks.length) {
            res.status(200).json({ files })
          }
        })
      }
    }

  } catch (error) {
    console.log(error)
  }

  // res.status(200).json({ message: 'Feedbacks are fetched' })
}