import validateEmail from '../validateEmail'
import { notyf } from '../notyfInstance.js'

function validateAdminCreateUserForm () {
  // Reset error messages
  document.getElementById('error-username').style.display = 'none'
  document.getElementById('error-email').style.display = 'none'
  document.getElementById('error-password').style.display = 'none'
  document.getElementById('error-role').style.display = 'none'

  // Get form values
  var username = document.getElementById('username__admin-create').value
  var email = document.getElementById('email__admin-create').value
  var password = document.getElementById('password__admin-create').value
  var role = document.getElementById('role__admin-create').value

  // Validate username
  if (username.trim() === '') {
    const errorUsername = document.getElementById('error-username')
    errorUsername.style.display = 'block'
    errorUsername.innerText = 'Username is required'
    return false
  }

  // Validate email
  if (email.trim() === '') {
    const errorEmail = document.getElementById('error-email')
    errorEmail.style.display = 'block'
    errorEmail.innerText = 'Email is required'
    return false
  } else if (!validateEmail(email)) {
    const errorEmail = document.getElementById('error-email')
    errorEmail.style.display = 'block'
    errorEmail.innerText = 'Invalid email format'
    return false
  }

  // Validate password
  if (password.trim() === '') {
    const errorPassword = document.getElementById('error-password')
    errorPassword.style.display = 'block'
    errorPassword.innerText = 'Password is required'
    return false
  } else if (password.length < 8) {
    const errorPassword = document.getElementById('error-password')
    errorPassword.style.display = 'block'
    errorPassword.innerText = 'Password must be at least 8 characters'
    return false
  } else if (!/[A-Z]/.test(password)) {
    // Check if there is at least one uppercase character
    const errorPassword = document.getElementById('error-password')
    errorPassword.style.display = 'block'
    errorPassword.innerText =
      'Password must contain at least one uppercase character'
    return false
  }

  // Validate role
  if (role.trim() === '') {
    const errorRole = document.getElementById('error-role')
    errorRole.style.display = 'block'
    errorRole.innerText = 'Role is required'
    return false
  } else if (role !== 'admin' && role !== 'user') {
    const errorRole = document.getElementById('error-role')
    errorRole.style.display = 'block'
    errorRole.innerText = 'Role must be either admin or user'
    return false
  }

  return true
}

// EDIT VALIDATION
function validateAdminEditUserForm () {
  // Reset error messages
  document.getElementById('error-username').style.display = 'none'
  document.getElementById('error-email').style.display = 'none'
  document.getElementById('error-password').style.display = 'none'
  document.getElementById('error-role').style.display = 'none'

  // Get form values
  var username = document.getElementById('username__admin-create').value
  var email = document.getElementById('email__admin-create').value
  var password = document.getElementById('password__admin-create').value
  var role = document.getElementById('role__admin-create').value

  // Validate username
  if (username.trim() === '') {
    const errorUsername = document.getElementById('error-username')
    errorUsername.style.display = 'block'
    errorUsername.innerText = 'Username is required'
    return false
  }

  // Validate email
  if (email.trim() === '') {
    const errorEmail = document.getElementById('error-email')
    errorEmail.style.display = 'block'
    errorEmail.innerText = 'Email is required'
    return false
  } else if (!validateEmail(email)) {
    const errorEmail = document.getElementById('error-email')
    errorEmail.style.display = 'block'
    errorEmail.innerText = 'Invalid email format'
    return false
  }

  // Validate password (IF THE VALUE IS NOT EMPTY, THEN VALIDATE IT, OTHERWISE, IT'S OKAY TO BE EMPTY)
  if (password.trim() !== '') {
    if (password.length < 8) {
      const errorPassword = document.getElementById('error-password')
      errorPassword.style.display = 'block'
      errorPassword.innerText = 'Password must be at least 8 characters'
      return false
    } else if (!/[A-Z]/.test(password)) {
      // Check if there is at least one uppercase character
      const errorPassword = document.getElementById('error-password')
      errorPassword.style.display = 'block'
      errorPassword.innerText =
        'Password must contain at least one uppercase character'
      return false
    }
  }

  // Validate role
  if (role.trim() === '') {
    const errorRole = document.getElementById('error-role')
    errorRole.style.display = 'block'
    errorRole.innerText = 'Role is required'
    return false
  } else if (role !== 'admin' && role !== 'user') {
    const errorRole = document.getElementById('error-role')
    errorRole.style.display = 'block'
    errorRole.innerText = 'Role must be either admin or user'
    return false
  }

  return true
}

async function submitForm (event) {
  event.preventDefault()

  // Validate the form
  if (!validateAdminCreateUserForm()) {
    return
  }

  // Get form values
  var username = document.getElementById('username__admin-create').value
  var email = document.getElementById('email__admin-create').value
  var password = document.getElementById('password__admin-create').value
  var role = document.getElementById('role__admin-create').value

  const response = await fetch(
    'https://chatbot-rreu.onrender.com/admin/adminCreateUser',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, role }),
    }
  )

  if (response.ok) {
    const data = await response.json()

    if (data.message) {
      // Display success message
      notyf.success(data.message)
    }

    const adminForm = document.querySelector('#admin-form')
    if (adminForm) adminForm.reset()

    document.querySelector('.manage__users').click()
  } else {
    const data = await response.json()

    if (response.status === 400) {
      // Handle duplicate entry error
      notyf.error(data.error)
    }
  }
}

async function submitEditUserForm (event) {
  event.preventDefault()

  if (!validateAdminEditUserForm()) {
    return
  }

  // Get form values
  var username = document.getElementById('username__admin-create').value
  var email = document.getElementById('email__admin-create').value
  var password = document.getElementById('password__admin-create').value
  var role = document.getElementById('role__admin-create').value

  const response = await fetch(
    'https://chatbot-rreu.onrender.com/admin/adminEditUser',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objectID, username, email, password, role }),
    }
  )

  if (response.ok) {
    const data = await response.json()

    if (data.message) {
      alert(data.message)
    }

    const adminForm = document.querySelector('#admin-form')
    if (adminForm) adminForm.reset()

    // CLICK THE MANAGE USER
    document.querySelector('.manage__users').click()
  } else {
    const data = await response.json()

    if (response.status === 400) {
      // Handle duplicate entry error
      alert(data.error)
    } else if (response.status === 500) {
      alert('Nothing has changed. Data is the same')
    }
  }
}

let objectID

function triggerSubmitForm (e) {
  if (
    e.target.classList.contains('add__user-btn') &&
    e.target.innerText === 'Add User'
  ) {
    submitForm(e)
  } else if (
    e.target.classList.contains('add__user-btn') &&
    e.target.innerText === 'Edit User'
  ) {
    submitEditUserForm(e)
  }

  // REMOVE ALL THE ERROR TEXT WHEN CLICKED OUTSIDE OF ALL THE INPUTS
  if (
    !e.target.classList.contains('username__admin-create') &&
    !e.target.classList.contains('email__admin-create') &&
    !e.target.classList.contains('password__admin-create') &&
    !e.target.classList.contains('role__admin-create') &&
    !e.target.classList.contains('add__user-btn') &&
    !e.target.classList.contains('edit__button') &&
    !e.target.classList.contains('delete__button') &&
    !e.target.classList.contains('manage__users') &&
    !e.target.classList.contains('history__management')
  ) {
    // IF THE TABLE IS NOT RENDER YET, THEN RETURN IMMEDIATELY
    if (!document.querySelector('.user__table')) {
      return
    } else {
      // IF THE TABLE IS RENDERED, THEN IT CAN START TO REMOVE ERROR
      document.getElementById('error-username').innerText = ''
      document.getElementById('error-email').innerText = ''
      document.getElementById('error-password').innerText = ''
      document.getElementById('error-role').innerText = ''
    }

    // SET ALL THE ERROR TO DISPLAY NONE
    document.getElementById('error-username').style.display = 'none'
    document.getElementById('error-email').style.display = 'none'
    document.getElementById('error-password').style.display = 'none'
    document.getElementById('error-role').style.display = 'none'
  }

  // GET ALL THE EDIT BUTTONS AND RETRIEVE THE CORRECT USERNAME, EMAIL, AND ROLE
  if (e.target.classList.contains('edit__button')) {
    objectID = e.target.parentNode.parentNode.children[0].innerText
    const username = e.target.parentNode.parentNode.children[1].innerText
    const email = e.target.parentNode.parentNode.children[2].innerText
    const role = e.target.parentNode.parentNode.children[4].innerText

    // Populate the form with the values
    document.getElementById('username__admin-create').value = username
    document.getElementById('email__admin-create').value = email
    document.getElementById('role__admin-create').value = role

    // Change the submit button text
    document.querySelector('.add__user-btn').innerText = 'Edit User'

    document.body.addEventListener('click', resetFormAndButtonText)
  }
}

function resetFormAndButtonText (e) {
  // If the click event's target is the "edit" button or any part of the table, return immediately
  if (
    e.target.classList.contains('edit__button') ||
    e.target.classList.contains('add__user-btn') ||
    e.target.id === 'username__admin-create' ||
    e.target.id === 'email__admin-create' ||
    e.target.id === 'role__admin-create' ||
    e.target.id === 'password__admin-create' ||
    e.target.id === 'error-username' ||
    e.target.id === 'error-email' ||
    e.target.id === 'error-password' ||
    e.target.id === 'error-role' ||
    e.target.classList.contains('delete__button')
  ) {
    return
  }

  // Reset the form
  const adminForm = document.querySelector('#admin-form')
  if (adminForm) adminForm.reset()

  // Change the submit button text
  document.querySelector('.add__user-btn').innerText = 'Add User'

  // REMOVE THE ERROR TEXT AS WELL
  document.getElementById('error-username').innerText = ''
  document.getElementById('error-email').innerText = ''
  document.getElementById('error-password').innerText = ''
  document.getElementById('error-role').innerText = ''

  // SET ALL THE ERROR TO DISPLAY NONE
  document.getElementById('error-username').style.display = 'none'
  document.getElementById('error-email').style.display = 'none'
  document.getElementById('error-password').style.display = 'none'
  document.getElementById('error-role').style.display = 'none'

  document.body.removeEventListener('click', resetFormAndButtonText)
}

export { triggerSubmitForm }
