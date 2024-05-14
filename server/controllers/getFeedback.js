import { Feedback, initializeMongoClient, User } from '../db.js'

export const getFeedback = async (req, res) => {
  try {
    const bucket = await initializeMongoClient()

    // Get all feedbacks
    const feedbacks = await Feedback.find().toArray()

    // Get unique usernames from feedbacks
    const usernames = [...new Set(feedbacks.map(feedback => feedback.username))]

    // Get users based on the usernames
    const usersArray = await User.find({ username: { $in: usernames } }).toArray()

    // Initialize result array
    let result = []

    // Iterate over usersArray and get feedbacks
    for (let i = 0; i < usersArray.length; i++) {
      const user = usersArray[i]
      const userFeedbacks = feedbacks.filter(feedback => feedback.username === user.username)

      if (userFeedbacks.length > 0) {
        const files = await bucket.find({ filename: user.profilePicture }).toArray()

        let profilePicture = null
        if (files.length > 0) {
          const downloadStream = bucket.openDownloadStreamByName(files[0].filename)
          const chunks = []

          downloadStream.on('data', (chunk) => {
            chunks.push(chunk)
          })

          await new Promise((resolve, reject) => {
            downloadStream.on('end', () => {
              profilePicture = Buffer.concat(chunks)
              resolve()
            })
          })
        }

        result.push({
          username: user.username,
          createdAt: user.createdAt,
          profilePicture: profilePicture,
          feedback: userFeedbacks[0].feedback
        })

        // If we have 5 feedbacks, stop the loop
        if (result.length === 5) {
          break
        }
      }
    }

    // If we have less than 5 feedbacks, get more from the feedbacks array
    if (result.length < 5) {
      const remainingFeedbacks = feedbacks.filter(feedback => !result.find(item => item.feedback === feedback.feedback)).slice(0, 5 - result.length)

      // Transform each feedback into the desired format
      const transformedFeedbacks = await Promise.all(remainingFeedbacks.map(async feedback => {
        const user = usersArray.find(user => user.username === feedback.username)

        const files = await bucket.find({ filename: user.profilePicture }).toArray()

        let profilePicture = null
        if (files.length > 0) {
          const downloadStream = bucket.openDownloadStreamByName(files[0].filename)
          const chunks = []

          downloadStream.on('data', (chunk) => {
            chunks.push(chunk)
          })

          await new Promise((resolve, reject) => {
            downloadStream.on('end', () => {
              profilePicture = Buffer.concat(chunks)
              resolve()
            })
          })
        }

        return {
          username: user.username,
          createdAt: user.createdAt,
          profilePicture: profilePicture,
          feedback: feedback.feedback
        }
      }))

      result = [...result, ...transformedFeedbacks]
    }

    // Return the feedbacks, even if they are less than 5
    res.status(200).json(result)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' })
  }
}