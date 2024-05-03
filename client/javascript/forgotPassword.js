import { notyf } from "./notyfInstance.js";

const forgotPasswordForm = document.getElementById("forgot-password-form");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");

const validateEmail = (email) => {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateInputValue = (event) => {
  event.preventDefault();
  // Get the email input value
  const email = document.getElementById("user-email").value;

  // Check if the email input is empty
  if (email === "") {
    // GENERATE A NEW NOTFY INSTANCE

    // DISPLAY THE NOTIFICATION
    notyf.error("Please enter your email address");
    return false;
  }

  // Check if the email match the regex value
  if (!validateEmail(email)) {
    // GENERATE A NEW NOTFY INSTANCE

    // DISPLAY THE NOTIFICATION
    notyf.error("Please enter a valid email address");
    return false;
  }
  return true;
};

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!validateInputValue(event)) {
      return;
    }

    const email = document.getElementById("user-email").value;

    // SEND THE REQUEST TO THE SERVER
    const response = await fetch(
      "https://chatbot-rreu.onrender.com/users/forgotPassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    try {
      if (response.ok) {
        const data = await response.json();

        // DISPLAY THE NOTIFICATION
        notyf.success(data.message);
      } else {
        const data = await response.json();

        // DISPLAY THE NOTIFICATION
        notyf.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

// GET THE userEmail FROM THE URL
const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get("userEmail");

// DECODE THE userEmail
const decodedEmail = atob(userEmail);

// CHECK IF THE userEmail IS NOT NULL
if (userEmail) {
  // SET THE userEmail VALUE TO THE INPUT FIELD
  const spanEmail = document.getElementById("urlEmail");
  spanEmail.textContent = decodedEmail;
}

// RESET PASSWORD FORM VALIDATION
const validateResetPasswordForm = () => {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword === "") {
    notyf.error("Please enter a new password");
    return false;
  }

  if (newPassword.length < 8) {
    notyf.error("Password must be at least 8 characters long");
    return false;
  }

  if (!/[A-Z]/.test(newPassword)) {
    notyf.error("Password must contain at least one uppercase letter");
    return false;
  }

  if (confirmPassword === "") {
    notyf.error("Please confirm your password");
    return false;
  }

  if (confirmPassword !== newPassword) {
    notyf.error("Passwords do not match");
    return false;
  }

  return true;
};

const resetPasswordBtn = document.getElementById("reset-password-btn");

if (resetPasswordBtn) {
  resetPasswordBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!validateResetPasswordForm()) return;

    const userToken = urlParams.get("token");
    const token = atob(userToken);
    const newPassword = document.getElementById("newPassword").value;
    const userEmail = document.getElementById("urlEmail").textContent;

    if (!userEmail || !userToken) return;

    const response = await fetch(
      "https://chatbot-rreu.onrender.com/users/updatePassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword, userEmail }),
      }
    );

    try {
      if (response.ok) {
        const data = await response.json();

        notyf.success(
          data.message +
            ". You will be redirected to the login page in 5 seconds"
        );

        // REDIRECT TO THE LOGIN PAGE AFTER 5 SECONDS
        setTimeout(() => {
          window.location.href = "https://aichatkey.net/login";
        }, 5000);
      } else {
        const data = await response.json();

        notyf.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}
