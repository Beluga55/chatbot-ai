import { User } from '../db.js'
import bcrypt from 'bcryptjs'

export const adminCreateUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body

    // VALIDATE FORM DATA
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Invalid form data' })
    }

    // HASH THE PASSWORD BEFORE STORING IT
    const hashedPassword = await bcrypt.hash(password, 10)

    // CREATE UNIQUE INDEXES ON USERNAME AND EMAIL
    await User.createIndex({ username: 1 }, { unique: true })
    await User.createIndex({ email: 1 }, { unique: true })

    // INSERT TO DATABASE
    const insert = await User.insertOne({
      username,
      email,
      password: hashedPassword,
      role,
      profilePicture: '',
      expiryDate: '',
      plan: 'Free Plan',
      createdAt: new Date(),
      verified: false,
    })

    // CHECKS WHETHER SUCCESSFULLY INSERT
    if (insert.acknowledged === true) {
      res.status(201).json({ message: 'User created successfully' })
    } else {
      res.status(500).json({ error: 'Failed to insert data' })
    }
  } catch (error) {
    console.error('Error handling form submission:', error)

    // CHECKS DUPLLICATE EMAIL AND USERNAME
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: 'Email or username is already taken' })
    } else {
      console.error('Error handling form submission:', error)
      res.status(500).send({ error: 'Internal Server Error' })
    }
  }
}