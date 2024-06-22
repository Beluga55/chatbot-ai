import { User } from '../db.js'

export const retrieveUsersAdmin = async (req, res) => {
  try {
    const usersCollection = await User.find().toArray()

    // LIMIT THE usersCollection to 15
    const limitedUsersCollection = usersCollection.slice(0, 15)

    if (limitedUsersCollection.length > 0) {
      res.json({ usersCollection: limitedUsersCollection })
    } else {
      res.status(404).json({ error: 'No users found' })
    }
  } catch (error) {
    console.error('Error retrieving users:', error)
    res.status(500).send('Error retrieving users')
  }
}