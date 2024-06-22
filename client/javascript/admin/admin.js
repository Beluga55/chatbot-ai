import { listItems, retrieveInformation } from './retrieveInformation'
import { triggerSubmitForm } from './createAndEditUser.js'
import deleteUser from './deleteUser'
import deleteChatHistory from './deleteChatHistory'

listItems.forEach((item) => {
  item.addEventListener('click', retrieveInformation)
})

document.addEventListener('click', triggerSubmitForm)
document.addEventListener('click', deleteUser)
document.addEventListener('click', deleteChatHistory)