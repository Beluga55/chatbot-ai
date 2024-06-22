import { notyf } from '../notyfInstance.js'

async function deleteChatHistory (e) {
  if (e.target.classList.contains('delete__button-history')) {
    const title = e.target.parentNode.parentNode.children[1].innerText

    const conifrmation = confirm(
      'Are you sure you want to delete this chat history?'
    )
    if (!conifrmation) return

    const response = await fetch(
      'http://localhost:5001/admin/adminDeleteChatHistory',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientTitle: title,
        }),
      }
    )

    if (response.ok) {
      await response.json()

      notyf.success('Chat history deleted successfully!')
      document.querySelector('.history__management').click()
    } else {
      notyf.error('Failed to delete chat history!')
    }
  }
}

export default deleteChatHistory
