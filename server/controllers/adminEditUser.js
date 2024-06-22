import { User } from '../db.js'
import { ObjectId } from 'mongodb'

export const adminEditUser = async (req, res) => {
  try {
    const { objectID, username, email, password, role } = req.body

    // VALIDATE FORM DATA
    if (!objectID || !username || !email || !role) {
      return res.status(400).json({ error: 'Invalid form data' })
    }

    // IF PASSWORD IS EMPTY, DO NOT UPDATE THE PASSWORD
    if (password === '') {
      // UPDATE THE DATABASE
      const update = await User.updateOne(
        { _id: new ObjectId(objectID) },
        {
          $set: {
            username: username,
            email: email,
            role: role,
          },
        }
      )

      // CHECKS WHETHER SUCCESSFULLY UPDATE
      if (update.modifiedCount === 1) {
        res.status(200).json({ message: 'User updated successfully' })
      } else {
        res.status(500).json({ error: 'Failed to update data' })
      }
    } else {
      // HASH THE PASSWORD BEFORE STORING IT
      const hashedPassword = await bcrypt.hash(password, 10)

      // UPDATE THE DATABASE
      const update = await User.updateOne(
        { _id: new ObjectId(objectID) },
        {
          $set: {
            username: username,
            email: email,
            password: hashedPassword,
            role: role,
          },
        }
      )
      // CHECKS WHETHER SUCCESSFULLY UPDATE
      if (update.modifiedCount === 1) {
        res.status(200).json({ message: 'User updated successfully' })
      } else {
        res.status(500).json({ error: 'Failed to update data' })
      }
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