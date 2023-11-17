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
  document.getElementById("error__passwordLength").style.display = "none";
  document.getElementById("error__uppercase").style.display = "none"; // Add new error display for uppercase character

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
  } else if (password.length < 8) {
    document.getElementById("error__passwordLength").style.display = "block";
    return false;
  } else if (!/[A-Z]/.test(password)) {
    // Check if there is at least one uppercase character
    document.getElementById("error__uppercase").style.display = "block";
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

  event.preventDefault();

  // Get form values
  var username = document.getElementById("signupUsername").value;
  var email = document.getElementById("signupEmail").value;
  var password = document.getElementById("signupPassword").value;

  // http://localhost:5001

  const response = await fetch("http://localhost:5001/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (response.ok) {
    const result = await response.json();
    console.log(result.message);

    document.getElementById("duplicate__username").style.display = "none";
    document.getElementById("duplicate__email").style.display = "none";
    document.querySelector(".signup__success-overlay").classList.add("show");

    signupForm.reset();
  } else {
    const errorData = await response.json();
    console.log(errorData.error);

    if (response.status === 400) {
      // Handle duplicate entry error
      document.getElementById("duplicate__username").style.display = "block";
      document.getElementById("duplicate__email").style.display = "block";
    }
  }
}

signupButton.addEventListener("click", function (e) {
  submitForm(e);
});
