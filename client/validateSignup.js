const signupButton = document.getElementById("submit__signup-button");
const signupForm = document.getElementById("signupForm");

function validateEmail(email) {
  // Regular expression for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateSignupForm() {
  // Reset error messages
  document.getElementById("error__username").style.display = "none";
  document.getElementById("error__email").style.display = "none";
  document.getElementById("error__password").style.display = "none";
  document.getElementById("error__verifyPassword").style.display = "none";
  document.getElementById("error__passwordNotMatch").style.display = "none";

  // Get form values
  var username = document.getElementById("signupUsername").value;
  var email = document.getElementById("signupEmail").value;
  var password = document.getElementById("signupPassword").value;
  var verifyPassword = document.getElementById("verifyPassword").value;

  // Validate username
  if (username.trim() === "") {
    document.getElementById("error__username").style.display = "block";
    return false;
  }

  // Validate email
  if (email.trim() === "") {
    document.getElementById("error__email").style.display = "block";
    return false;
  } else if (!validateEmail(email)) {
    document.getElementById("error__email").innerText = "Invalid email format";
    document.getElementById("error__email").style.display = "block";
    return false;
  }

  // Validate password
  if (password.trim() === "") {
    document.getElementById("error__password").style.display = "block";
    return false;
  }

  // Validate verify password
  if (verifyPassword.trim() === "") {
    document.getElementById("error__verifyPassword").style.display = "block";
    return false;
  }

  // Check if passwords match
  if (password !== verifyPassword) {
    document.getElementById("error__passwordNotMatch").style.display = "block";
    return false;
  }

  // If all validations pass, the form is submitted
  return true;
}

async function submitForm(event) {
  // Validate the form
  if (!validateSignupForm()) {
    event.preventDefault();
    return;
  }

  // Get form values
  var username = document.getElementById("signupUsername").value;
  var email = document.getElementById("signupEmail").value;
  var password = document.getElementById("signupPassword").value;

  const response = await fetch("https://chatbot-rreu.onrender.com/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });
}

signupButton.addEventListener("click", function (e) {
  submitForm(e);
});
