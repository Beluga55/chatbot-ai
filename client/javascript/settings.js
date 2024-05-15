import { retrieveProfilePicture } from './navbar.js'
import { notyf } from './notyfInstance.js'
import validateEmail from './validateEmail.js'
import myImage from '../assets/empty-user.png'

// LOGOUT FUNCTIONALITY
const logoutButton = document.querySelector('.settings__title .buttons')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')

  window.location.href = 'index'
}

logoutButton.addEventListener('click', logout)

// FUNCTION TO HAVE PREVIEW OF THE PROFILE PICTURE
const settingsForm = document.querySelector('#settings__profile-picture-form')
const previewImage = document.querySelector(
  '.settings__profile-picture-preview'
)

if (settingsForm) {
  settingsForm.addEventListener('change', (event) => {
    if (event.target.matches('input[type="file"]')) {
      const file = event.target.files[0]

      if (file) {
        const reader = new FileReader()

        reader.onload = () => {
          previewImage.src = reader.result
        }

        reader.readAsDataURL(file)
      } else {
        previewImage.src = `${myImage}`
      }
    }
  })
}

// WHEN THE USER CLICKS IN THE PASSWORD AND AUTHENTICATION SETTINGS
const settingsProfiles = document.querySelectorAll('.settings__profile')

settingsProfiles.forEach((profile, index) => {
  profile.addEventListener('click', (event) => {
    const icon = event.currentTarget.querySelector('.bx')
    if (icon.classList.contains('bx-cog')) {
      window.location.href = 'user'
      retrieveProfilePicture()
    } else if (icon.classList.contains('bx-lock')) {
      window.location.href = 'password'
    } else if (icon.classList.contains('bx-message')) {
      window.location.href = 'feedback'
    }
  })
})

// CHANGE USERNAME FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-change-username-form')

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      if (event.target.id === 'settings-change-username-form') {
        const oldUsername = localStorage.getItem('username')
        const newUsername = document.getElementById('new-username').value

        // SEND A REQUEST TO THE SERVER
        const response = await fetch(
          'https://chatbot-rreu.onrender.com/users/updateUsername',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ oldUsername, newUsername }),
          }
        )

        // GET THE RESPONSE
        if (response.ok) {
          await response.json()

          // CLEAR THE FORM FIELD
          form.reset()

          // UPDATE THE LOCAL STORAGE
          localStorage.setItem('username', newUsername)

          // CLEAR THE BORDER COLOR (ACCESS TO THE ROOT STYLES)
          const rootStyles = getComputedStyle(document.documentElement)
          const textColor = rootStyles.getPropertyValue('--text-200').trim()

          document.getElementById('new-username').style.borderColor = textColor

          // Show a success notification
          notyf.success('Username updated successfully')
        } else {
          const data = await response.json()

          // Show an error notification
          notyf.error(data.message)
        }
      }
    })
  }
})

// UPLOAD PROFILE PICTURE FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings__profile-picture-form')

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      const file = form.querySelector('input[type="file"]').files[0]

      if (!file) {
        // Show an error notification
        notyf.error('Please select a file')
        return
      }

      const formData = new FormData(form)
      const username = localStorage.getItem('username')
      formData.append('username', username)

      // SEND A REQUEST TO THE SERVER
      const response = await fetch(
        'https://chatbot-rreu.onrender.com/users/uploadProfile',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      )

      // GET THE RESPONSE
      if (response.ok) {
        const data = await response.json()

        // CLEAR THE FORM FIELD
        form.reset()

        const file = document.querySelector('.custom-file-upload')

        file.textContent = 'Choose File'

        // Show a success notification
        notyf.success('Profile picture updated successfully')

        // CREATE A BLOB URL FROM THE IMAGE RESPONSE
        pollForImages(data.file, 1000, 10)
          .then(async (imageResponse) => {
            const imageBlob = await imageResponse.blob()
            const imageUrl = URL.createObjectURL(imageBlob)

            // Display the image
            const profileImage = document.querySelector('.nav__login img')
            profileImage.src = imageUrl
            profileImage.style.borderRadius = '50%'
          })
          .catch((error) => {
            console.error('Error retrieving image:', error)
          })
      } else {
        const data = await response.json()

        // USE A DEFAULT IMAGE
        const profileImage = document.querySelector('.nav__login img')

        profileImage.src = `${myImage}`

        // Show an error notification
        notyf.error(data.message)
      }
    })
  }
})

// POLL FOR IMAGES
const pollForImages = async (file, interval, maxAttempt) => {
  for (let i = 0; i < maxAttempt; i++) {
    // RETRIEVE THE IMAGE FROM THE BACKEND
    const response = await fetch(
      `https://chatbot-rreu.onrender.com/users/getImage/${file}`
    )

    if (response.ok) {
      return response
    }

    // Image not found, wait for the interval then try again
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  throw new Error('Image not found after maximum attempts')
}

// DELETE ACCOUNT FUNCTIONALITY
document.addEventListener('DOMContentLoaded', () => {
  const deleteAccountButton = document.querySelector(
    '.settings__content-account-delete .buttons'
  )

  const deleteCancelButton = document.querySelector(
    '.delete__confirmation-button .buttons:last-child'
  )

  const deleteConfirmButton = document.querySelector(
    '.delete__confirmation-button .buttons:first-child'
  )

  if (deleteAccountButton && deleteCancelButton && deleteConfirmButton) {
    deleteAccountButton.addEventListener('click', showDeleteAccountOverlay)
    deleteCancelButton.addEventListener('click', hideDeleteAccountOverlay)
    deleteConfirmButton.addEventListener('click', deleteAccount)
  }
})

const showDeleteAccountOverlay = () => {
  const deleteAccountOverlay = document.querySelector(
    '.delete__account-overlay'
  )
  deleteAccountOverlay.classList.add('active')
}

const hideDeleteAccountOverlay = () => {
  const deleteAccountOverlay = document.querySelector(
    '.delete__account-overlay'
  )
  deleteAccountOverlay.classList.remove('active')
}

// SEND A REQUEST TO DELETE THE ACCOUNT (FUNCTION)
const deleteAccount = async () => {
  const username = localStorage.getItem('username')

  // SEND A REQUEST TO THE SERVER
  const response = await fetch(
    'https://chatbot-rreu.onrender.com/users/deleteAccount',
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ username }),
    }
  )

  // GET THE RESPONSE
  if (response.ok) {
    await response.json()

    // REMOVE THE LOCAL STORAGE
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')

    // Set a flag in the local storage to show a success message
    localStorage.setItem('accountDeleted', 'true')

    // REDIRECT TO THE INDEX PAGE
    window.location.href = 'index'
  } else {
    const data = await response.json()

    // Show an error notification
    notyf.error(data.message)
  }
}

// RETRIEVE THE CURRENT EMAIL OF THE USER
const retrieveCurrentEmail = async () => {
  const response = await fetch(
    'https://chatbot-rreu.onrender.com/users/getEmailAndStatus',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ username: localStorage.getItem('username') }),
    }
  )

  if (response.ok) {
    const data = await response.json()
    const email = data.email

    const emailSpan = document.querySelector(
      '.settings__content-password-email-form p span'
    )

    const verifyNotice = document.querySelectorAll('.verify-notice')

    if (emailSpan) {
      emailSpan.textContent = email
    }

    if (verifyNotice.length > 0) {
      verifyNotice.forEach((notice) => {
        notice.style.display = data.isVerified ? 'none' : 'initial'
      })
    }
  } else {
    const data = await response.json()

    // Show an error notification
    notyf.error(data.message)
  }
}

if (window.location.pathname === '/password') {
  document.addEventListener('DOMContentLoaded', retrieveCurrentEmail)
}

// VERIFY EMAIL FUNCTIONALITY
const verifyEmailLink = document.querySelector(
  '.settings__content-password-email-form a'
)
const username = localStorage.getItem('username')

if (verifyEmailLink) {
  verifyEmailLink.addEventListener('click', async (event) => {
    event.preventDefault()

    const response = await fetch(
      'https://chatbot-rreu.onrender.com/users/verifyEmail',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username }),
      }
    )

    const data = await response.json()

    // Show a notification based on the response status
    response.ok ? notyf.success(data.message) : notyf.error(data.message)
  })
}

// CHANGE EMAIL FUNCTIONALITY
const changeEmailForm = document.querySelector(
  '.settings__content-password-email-form'
)

const changeEmailButton = document.querySelector(
  '.settings__content-password-email-form .buttons'
)

if (changeEmailButton) {
  changeEmailButton.addEventListener('click', (event) => {
    event.preventDefault()

    const newEmail = changeEmailForm.querySelector('input[type=\'email\']').value

    // CHECK IF THE EMAIL IS THE SAME AS THE CURRENT EMAIL
    const currentEmail = document.querySelector(
      '.settings__content-password-email-form p span'
    ).textContent

    // CHECK THE EMAIL IS EMPTY
    if (newEmail === '') {
      // Show an error notification
      notyf.error('Email cannot be empty')
      return
    }

    if (newEmail === currentEmail) {
      // Show an error notification
      notyf.error('The new email is the same as the current email')
      return
    }

    // VALIDATE THE EMAIL
    if (!validateEmail(newEmail)) {
      // Show an error notification
      notyf.error('Invalid email format')
      return
    }

    let encodedEmail = btoa(newEmail)
    let username = btoa(localStorage.getItem('username'))
    // REDIRECT TO VERIFY EMAIL PAGE
    window.location.href =
      'verifyEmail?email=' + encodedEmail + '&username=' + username
  })
}

// CHANGE PASSWORD FUNCTIONALITY

const changePasswordForm = document.querySelector(
  '.settings__content-password-form'
)

const changePasswordButton = document.querySelector(
  '.settings__content-password-form .buttons'
)
const user = localStorage.getItem('username')

if (changePasswordButton) {
  changePasswordButton.addEventListener('click', async (event) => {
    event.preventDefault()

    const currentPassword = changePasswordForm.querySelector(
      'input[type=\'password\']:nth-child(1)'
    ).value
    const newPassword = changePasswordForm.querySelector(
      'input[type=\'password\']:nth-child(2)'
    ).value
    const confirmNewPassword = changePasswordForm.querySelector(
      'input[type=\'password\']:nth-child(3)'
    ).value

    const response = await fetch(
      'https://chatbot-rreu.onrender.com/users/changePassword',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          username: user,
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      }
    )

    const data = await response.json()

    // Clear the form fields
    changePasswordForm.reset()

    // Show a notification based on the response status
    response.ok ? notyf.success(data.message) : notyf.error(data.message)
  })
}

// REPLACE THE FILE INPUT WITH A NEW ONE
document.body.addEventListener('change', function (e) {
  if (e.target.matches('#file')) {
    const fileName = e.target.files[0].name
    document.querySelector('.custom-file-upload').textContent = fileName
  }
})

// FEEDBACK FUNCTIONALITY
const feedbackForm = document.querySelector('.settings__content-feedback-form')
const feedbackButton = document.getElementById('submit-feedback')

// FUNCTION TO VALIDATE THE FEEDBACK FORM
const validateFeedbackForm = async () => {
  event.preventDefault()
  // GET THE FORM VALUES
  const email = feedbackForm.querySelector('input[type=\'email\']').value
  const feedback = feedbackForm.querySelector('textarea').value
  const username = localStorage.getItem('username')

  // CHECK IF THE EMAIL IS EMPTY
  if (email === '') {
    // Show an error notification
    notyf.error('Email cannot be empty')
    return false
  }

  // VALIDATE THE EMAIL
  if (!validateEmail(email)) {
    // Show an error notification
    notyf.error('Invalid email format')
    return false
  }

  // CHECK IF THE FEEDBACK IS EMPTY
  if (feedback === '') {
    // Show an error notification
    notyf.error('Feedback cannot be empty')
    return false
  }

  // SEND A REQUEST TO THE SERVER
  await fetch('https://chatbot-rreu.onrender.com/users/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, feedback }),
  })
    .then(async (response) => {
      const data = await response.json()

      // CLEAR THE FORM FIELD
      feedbackForm.reset()

      // Show a notification based on the response status
      response.ok ? notyf.success(data.message) : notyf.error(data.message)
    })
    .catch((error) => {
      console.error('Error sending feedback:', error)
    })
}

// TEST THE VALIDATE FEEDBACK FORM FUNCTION
if (feedbackButton) {
  feedbackButton.addEventListener('click', validateFeedbackForm)
}