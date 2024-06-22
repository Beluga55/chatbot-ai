import { notyf } from './notyfInstance.js'

const loginForm = document.querySelector('.login__form')
const loginSubmitButton = document.querySelector('.login__form .buttons')

// FUNCTION THAT CHECK IF THE INPUT ARE NOT EMPTY
const validateInput = () => {
  const username = document.getElementById('login-username').value
  const password = document.getElementById('login-password').value

  if (username === '' || password === '') {
    return false
  }

  return true
}

loginSubmitButton.addEventListener('click', async (event) => {
  // GET THE FORM VALUES
  const username = document.getElementById('login-username').value
  const password = document.getElementById('login-password').value

  // CHECK IF THE INPUTS ARE NOT EMPTY
  if (!validateInput()) return

  event.preventDefault()

  // SEND THE FORM VALUES TO THE SERVER
  const response = await fetch(
    'https://chatbot-rreu.onrender.com/users/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    }
  )

  // GET THE RESPONSE FROM THE SERVER
  try {
    if (response.ok) {
      const data = await response.json()

      // CLEAR THE LOGIN FORM
      loginForm.reset()

      // SAVE THE TOKEN IN LOCAL STORAGE
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('username', data.username)

      // IF THE USER IS AN ADMIN
      if (data.role === 'admin') {
        // REDIRECT TO THE ADMIN DASHBOARD
        window.location.href = 'admin'
        return
      }

      // REDIRECT TO THE DASHBOARD
      window.location.href = 'dashboard'
    } else {
      const error = await response.json()

      notyf.error({
        message: error.message,
      })
    }
  } catch (error) {
    console.error(error)
  }
})
