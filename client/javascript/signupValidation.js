import validateEmail from "./validateEmail.js";
import { notyf } from "./notyfInstance.js";

const signupForm = document.querySelector(".signup__form");
const submitSignupButton = document.querySelector(".signup__form .buttons");

// FUNCTION TO VALIDATE SIGNUP FORM
const validateSignupForm = () => {
  // GET THE FORM VALUES
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;

  if (
    username === "" &&
    email === "" &&
    password === "" &&
    confirmPassword === ""
  ) {
    notyf.error("All fields are required");
    return false;
  }

  if (username === "") {
    notyf.error("Username is required");
    return false;
  }

  if (!validateEmail(email)) {
    notyf.error("Invalid email address");
    return false;
  }

  if (password.length < 8) {
    notyf.error("Password must be at least 8 characters long");
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    notyf.error("Password must contain at least one uppercase letter");
    return false;
  }

  if (confirmPassword !== password) {
    notyf.error("Passwords do not match");
    return false;
  }

  return true;
};

submitSignupButton.addEventListener("click", async (event) => {
  if (!validateSignupForm()) return;

  event.preventDefault();

  // GET THE FORM VALUES
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  // SEND A REQUEST TO THE SERVER
  const response = await fetch(
    "https://chatbot-rreu.onrender.com/users/signup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    }
  );

  // GET THE RESPONSE
  try {
    if (response.ok) {
      // CLEAR THE FORM FIELDS
      signupForm.reset();

      let encodedEmail = btoa(email);
      // REDIRECT TO VERIFY EMAIL PAGE
      window.location.href = "verifyEmail?email=" + encodedEmail;
    } else {
      const data = await response.json();

      notyf.error(data.error);
    }
  } catch (error) {
    console.error(error);
  }
});
