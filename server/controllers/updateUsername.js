import { Feedback, User } from '../db.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const updateUsername = async (req, res) => {
  const authHeader = req.header('Authorization')

  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied' })
  }

  const token = authHeader.split(' ')[1] // Split on space and take the second part

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY)

    // If the token is verified
    const { oldUsername, newUsername } = req.body

    // CHECK IF THE NEW USERNAME IS EMPTY
    if (!newUsername) {
      return res.status(400).json({ message: 'Username is required.' })
    }

    // CHECK IF THE USER EXISTS
    const user = await User.findOne({ username: oldUsername })

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // COMPARE THE OLD USERNAME
    if (oldUsername !== user.username) {
      return res.status(400).json({ message: 'Old username does not match.' })
    }

    // CHECK IF THE NEW USERNAME IS THE SAME AS THE OLD USERNAME
    if (oldUsername === newUsername) {
      return res
        .status(400)
        .json({ message: 'New username is the same as the old username.' })
    }

    // UPDATE THE USERNAME
    const updatedUser = await User.updateOne(
      { _id: user._id },
      { $set: { username: newUsername } }
    )

    // UPDATE ALL THE USERNAME IN THE FEEDBACK
    const updatedFeedback = await Feedback.updateMany(
      { username: oldUsername },
      { $set: { username: newUsername } }
    )

    if (!updatedUser || !updatedFeedback) {
      return res.status(500).json({ message: 'Internal server error.' })
    }

    return res.status(200).json({ message: 'Username updated successfully.' })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: 'Invalid Token' })
    }

    // CHECKS DUPLLICATE EMAIL AND USERNAME
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: 'Email or username is already taken.' })
    }

    console.error(error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
