// Extract the userEmail from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const userToken = urlParams.get("token");
const userEmail = urlParams.get("userEmail");

const resetUser = document.querySelector(".reset__user");
resetUser.innerText = `Reset password for ${userEmail}`;

const updateBtn = document.querySelector(".update__password");
const updateForm = document.querySelector(".reset__password-form");

function validatePassword() {
  const errorTxt = document.querySelector(".error__text");
  const errorVerify = document.querySelector(".error__verify-password");
  errorTxt.style.display = "none";
  errorVerify.style.display = "none";

  var newPassword = document.querySelector(".new__password").value;
  var verifyPassword = document.querySelector(".verify__password").value;

  // Validate password
  if (newPassword.trim() === "") {
    errorTxt.style.display = "block";
    errorTxt.innerText = "New password cannot be empty!";
    return false;
  } else if (newPassword.length < 8) {
    errorTxt.style.display = "block";
    errorTxt.innerText = "New password must have at least 8 characters!";
    return false;
  } else if (!/[A-Z]/.test(newPassword)) {
    // Check if there is at least one uppercase character
    errorTxt.style.display = "block";
    errorTxt.innerText = "Password must contains one uppercase character!";
    return false;
  }

  // Validate verify password
  if (verifyPassword.trim() === "") {
    errorVerify.style.display = "block";
    errorVerify.innerText = "Verify password cannot be empty!";
    return false;
  }

  // Check if passwords match
  if (newPassword !== verifyPassword) {
    verifyPassword.display = "block";
    verifyPassword.innerText = "Password do not match!";
    return false;
  }

  // If all validations pass, the form is submitted
  return true;
}

async function updatePassword(event) {
  // Validate the form
  if (!validatePassword()) {
    event.preventDefault();
    return;
  }

  event.preventDefault();

  var newPassword = document.querySelector(".new__password").value;

  const response = await fetch("http://localhost:5001/updatePassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userToken, userEmail, newPassword }),
  });

  if (response.ok) {
    const result = await response.json();
    console.log(result.message);
  } else {
    const errorData = await response.json();
    console.log(errorData.error);
    const errorTxt = document.querySelector(".error__text");
    errorTxt.style.display = "block";
    errorTxt.innerText = `${errorData.message}`;
  }
}

updateBtn.addEventListener("click", function (e) {
  updatePassword(e);
});
