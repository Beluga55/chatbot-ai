import express from 'express'
import { retrieveUsersAdmin } from '../controllers/retrieveUsersAdmin.js'
import { adminCreateUser } from '../controllers/adminCreateUser.js'
import { adminEditUser } from '../controllers/adminEditUser.js'
import { adminDeleteUser } from '../controllers/adminDeleteUser.js'
import { retrieveChatHistoryAdmin } from '../controllers/retrieveChatHistoryAdmin.js'
import { adminDeleteChatHistory } from '../controllers/adminDeleteChatHistory.js'

const router = express.Router()

router.get('/retrieveUsersAdmin', retrieveUsersAdmin)
router.post('/adminCreateUser', adminCreateUser)
router.put('/adminEditUser', adminEditUser)
router.delete('/adminDeleteUser', adminDeleteUser)
router.get('/retrieveChatHistoryAdmin', retrieveChatHistoryAdmin)
router.delete('/adminDeleteChatHistory', adminDeleteChatHistory)

export default router