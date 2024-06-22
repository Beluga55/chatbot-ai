import { notyf } from '../notyfInstance.js'

async function deleteUser (e) {
  if (e.target.classList.contains('delete__button')) {
    const objectID = e.target.parentNode.parentNode.children[0].innerText

    // ARE YOU SURE YOU WANT TO DELETE THIS USER?
    const confirmation = confirm('Are you sure you want to delete this user?')
    if (!confirmation) return

    // SEND A REQUEST TO BACKEND TO DELETE THE USER
    const response = await fetch(
      'http://localhost:5001/admin/adminDeleteUser',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectID,
        }),
      }
    )

    if (response.ok) {
      const data = await response.json()

      if (data.message === 'User deleted') {
        notyf.success('User deleted')
        // REMOVE THE ROW FROM THE TABLE
        e.target.parentNode.parentNode.remove()
      } else {
        notyf.error('Failed to delete user')
      }
    } else {
      notyf.error('Failed to delete user')
    }
  }
}

export default deleteUser
