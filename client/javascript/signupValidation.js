import validateEmail from "./validateEmail.js";

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

  // VALIDATE USERNAME
  if (username === "") {
    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-username").placeholder =
      "Username is required";
    document.getElementById("signup-username").style.borderColor = "red";

    return false;
  } else {
    // CHANGE GREEN COLOR BORDER
    document.getElementById("signup-username").style.borderColor = "lime";
  }

  // VALIDATE EMAIL
  if (email === "") {
    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-email").placeholder = "Email is required";
    document.getElementById("signup-email").style.borderColor = "red";

    return false;
  } else if (!validateEmail(email)) {
    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-email").placeholder = "Invalid email";
    document.getElementById("signup-email").style.borderColor = "red";

    return false;
  } else {
    // CHANGE GREEN COLOR BORDER
    document.getElementById("signup-email").style.borderColor = "lime";
  }

  // VALIDATE PASSWORD
  if (password.trim() === "") {
    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-password").placeholder =
      "Password is required";
    document.getElementById("signup-password").style.borderColor = "red";

    return false;
  } else if (password.length < 8) {
    // CLEAR THE PASSWORD FIELD
    document.getElementById("signup-password").value = "";

    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-password").placeholder =
      "Password must be at least 8 characters";
    document.getElementById("signup-password").style.borderColor = "red";

    return false;
  } else if (!/[A-Z]/.test(password)) {
    // CLEAR THE PASSWORD FIELD
    document.getElementById("signup-password").value = "";

    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-password").placeholder =
      "One uppercase letter is required";
    document.getElementById("signup-password").style.borderColor = "red";

    return false;
  } else {
    // CHANGE GREEN COLOR BORDER
    document.getElementById("signup-password").style.borderColor = "lime";
  }

  // VALIDATE CONFIRM PASSWORD
  if (confirmPassword.trim() === "") {
    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-confirm-password").placeholder =
      "Confirm password is required";
    document.getElementById("signup-confirm-password").style.borderColor =
      "red";

    return false;
  } else if (confirmPassword !== password) {
    // CLEAR THE CONFIRM PASSWORD FIELD
    document.getElementById("signup-confirm-password").value = "";

    // CHANGE PLACEHOLDER TEXT AND RED COLOR PLACEHOLDER
    document.getElementById("signup-confirm-password").placeholder =
      "Passwords do not match";
    document.getElementById("signup-confirm-password").style.borderColor =
      "red";

    return false;
  } else {
    // CHANGE GREEN COLOR BORDER
    document.getElementById("signup-confirm-password").style.borderColor =
      "lime";
  }

  return true;
};

submitSignupButton.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!validateSignupForm()) return;

  // GET THE FORM VALUES
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  // SEND A REQUEST TO THE SERVER
  const response = await fetch("http://localhost:5001/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  // Initialize a new Notyf instance
  var notyf = new Notyf({
    duration: 3000,
    position: {
      x: "right",
      y: "top",
    },
    dismissible: true,
    icon: true,
  });

  // GET THE RESPONSE
  try {
    if (response.ok) {
      // CLEAR THE FORM FIELDS
      signupForm.reset();

      let encodedEmail = btoa(email);
      // REDIRECT TO VERIFY EMAIL PAGE
      window.location.href = "verifyEmail.html?email=" + encodedEmail;
    } else {
      const data = await response.json();

      notyf.error(data.error);
    }
  } catch (error) {
    console.error(error);
  }
});
